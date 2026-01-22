export const processAndSaveImage = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Calculate new dimensions (max width 1200px)
                const maxWidth = 1200;
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                // Draw image
                ctx.fillStyle = 'white'; // Prevent transparent background issues
                ctx.fillRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);

                // Compress to JPEG with 0.7 quality
                try {
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    localStorage.setItem('backgroundImage', dataUrl);
                    resolve(true);
                } catch (e) {
                    console.error('Storage failed:', e);
                    if (e.name === 'QuotaExceededError') {
                        alert('画像のサイズが大きすぎて保存できませんでした。\nもっと小さな画像を選択するか、別の画像を試してください。');
                    } else {
                        alert('画像の保存に失敗しました。');
                    }
                    resolve(false);
                }
            };

            img.onerror = () => {
                alert('画像の読み込みに失敗しました。');
                resolve(false);
            };

            img.src = event.target.result;
        };

        reader.readAsDataURL(file);
    });
};
