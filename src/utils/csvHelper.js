export const downloadCSV = (shifts) => {
    try {
        if (!shifts || Object.keys(shifts).length === 0) {
            alert('データがありません。');
            return;
        }

        const headers = ['日付', '曜日', '勤務先名', '時間', '時給', '給与'];

        const rows = Object.keys(shifts)
            .sort()
            .map(key => {
                const rawShift = shifts[key];

                // Normalize Data
                let hours = 0;
                let wage = 0;
                let wageName = '';

                if (typeof rawShift === 'number' || typeof rawShift === 'string') {
                    // Old Format
                    hours = parseFloat(rawShift);
                } else if (typeof rawShift === 'object' && rawShift !== null) {
                    // New Format
                    hours = parseFloat(rawShift.hours || 0);
                    wage = parseInt(rawShift.wage || 0);
                    wageName = rawShift.wageName || '';
                }

                const [year, month, day] = key.split('-').map(Number);
                const date = new Date(year, month - 1, day);
                const dayLabel = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];

                const salary = Math.floor(wage * hours);

                return [
                    key,
                    dayLabel,
                    wageName,
                    hours,
                    wage,
                    salary
                ].map(field => `"${field}"`).join(','); // Quote fields
            });

        const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n'); // Add BOM
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.setAttribute('href', url);

        const today = new Date();
        const filename = `shift_data_${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}.csv`;
        link.setAttribute('download', filename);

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

    } catch (e) {
        console.error('CSV Export Error:', e);
        alert(`エクスポートに失敗しました。\nエラー: ${e.message}`);
    }
};
