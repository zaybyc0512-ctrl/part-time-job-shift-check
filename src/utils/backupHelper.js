export const exportData = () => {
    try {
        const data = {};
        // Collect all data from localStorage
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            data[key] = localStorage.getItem(key);
        }

        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;

        const today = new Date();
        const filename = `backup_${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}.json`;
        link.download = filename;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        return true;
    } catch (e) {
        console.error('Export failed:', e);
        alert('バックアップの作成に失敗しました。');
        return false;
    }
};

export const importData = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target.result);
                if (typeof json !== 'object' || json === null) {
                    throw new Error('Invalid JSON format');
                }

                // Validate structure briefly (check if keys look like ours)
                const hasValidKeys = Object.keys(json).some(k => k === 'shifts' || k === 'settings' || k === 'theme');
                if (!hasValidKeys) {
                    if (!window.confirm('このファイルには有効なデータが含まれていない可能性がありますが、復元を続けますか？')) {
                        return resolve(false);
                    }
                }

                // Restore data
                Object.keys(json).forEach(key => {
                    localStorage.setItem(key, json[key]);
                });

                resolve(true);
            } catch (err) {
                console.error('Import failed:', err);
                alert('ファイルの読み込みに失敗しました。形式が正しいか確認してください。');
                resolve(false);
            }
        };

        reader.onerror = () => {
            alert('ファイルの読み取りエラーが発生しました。');
            resolve(false);
        };

        reader.readAsText(file);
    });
};
