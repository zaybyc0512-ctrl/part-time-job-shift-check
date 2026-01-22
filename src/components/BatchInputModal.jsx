import React, { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';

const BatchInputModal = ({ isOpen, onClose, onSave, settings }) => {
    // Defaults
    const getToday = () => new Date().toISOString().split('T')[0];
    const getEndOfMonth = () => {
        const date = new Date();
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        return lastDay.toISOString().split('T')[0];
    };

    const [startDate, setStartDate] = useState(getToday());
    const [endDate, setEndDate] = useState(getEndOfMonth());
    const [selectedWageId, setSelectedWageId] = useState('');

    // 0: Sun, 1: Mon, ..., 6: Sat
    const [weekdays, setWeekdays] = useState(
        Array(7).fill(null).map(() => ({ enabled: false, hours: '' }))
    );

    // Initialize wage selection when settings load
    useEffect(() => {
        if (settings?.wagePresets?.length > 0 && !selectedWageId) {
            setSelectedWageId(settings.wagePresets[0].id);
        }
    }, [settings, selectedWageId]);

    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];

    const toggleDay = (index, enabled) => {
        const newWeekdays = [...weekdays];
        newWeekdays[index] = { ...newWeekdays[index], enabled };
        setWeekdays(newWeekdays);
    };

    const handleHoursChange = (index, value) => {
        const newWeekdays = [...weekdays];
        newWeekdays[index] = { ...newWeekdays[index], hours: value };
        setWeekdays(newWeekdays);
    };

    const handlePresetClick = (index, presetValue) => {
        handleHoursChange(index, String(presetValue));
    };

    const handleSave = () => {
        if (!startDate || !endDate) {
            alert('期間を指定してください');
            return;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start > end) {
            alert('開始日は終了日より前の日付にしてください');
            return;
        }

        const wagePreset = settings.wagePresets.find(p => String(p.id) === String(selectedWageId));
        if (!wagePreset) {
            alert('時給設定を選択してください');
            return;
        }

        const newShifts = {};
        const loopDate = new Date(start);

        // Loop through dates
        while (loopDate <= end) {
            const dayIndex = loopDate.getDay();
            const setting = weekdays[dayIndex];

            if (setting.enabled && setting.hours && parseFloat(setting.hours) > 0) {
                const dateKey = loopDate.toISOString().split('T')[0];
                newShifts[dateKey] = {
                    hours: setting.hours,
                    wage: wagePreset.wage,
                    wageName: wagePreset.name
                };
            }
            // Next day
            loopDate.setDate(loopDate.getDate() + 1);
        }

        // Check if any shifts were generated
        if (Object.keys(newShifts).length === 0) {
            if (!confirm('条件に一致するシフトがありませんでした（曜日選択や時間入力漏れなど）。処理を続けますか？')) {
                return;
            }
        }

        onSave(newShifts);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg p-6 shadow-xl relative max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Calendar className="w-6 h-6 text-primary" />
                        シフト一括入力
                    </h3>
                    <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                        <X className="w-5 h-5 text-gray-500 dark:text-gray-300" />
                    </button>
                </div>

                <div className="space-y-8">
                    {/* 1. 期間と時給 */}
                    <section className="space-y-4">
                        <h4 className="font-bold text-gray-700 dark:text-gray-200 border-l-4 border-primary pl-2">1. 期間と時給の設定</h4>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">開始日</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1">終了日</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">適用する時給</label>
                            <select
                                value={selectedWageId}
                                onChange={(e) => setSelectedWageId(e.target.value)}
                                className="w-full p-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            >
                                {settings.wagePresets.map(preset => (
                                    <option key={preset.id} value={preset.id}>
                                        {preset.name} (¥{preset.wage})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </section>

                    {/* 2. 曜日パターン */}
                    <section className="space-y-4">
                        <h4 className="font-bold text-gray-700 dark:text-gray-200 border-l-4 border-primary pl-2">2. 曜日ごとの時間設定</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            入力したい曜日にチェックを入れ、時間を設定してください。
                        </p>

                        <div className="space-y-3">
                            {dayNames.map((dayName, index) => {
                                const isEnabled = weekdays[index].enabled;
                                const isWeekend = index === 0 || index === 6; // Sun or Sat
                                const borderColor = isEnabled ? 'border-blue-300 dark:border-blue-700' : 'border-gray-200 dark:border-gray-700';
                                const bgStyle = isEnabled
                                    ? 'bg-blue-50/50 dark:bg-blue-900/10'
                                    : 'bg-white dark:bg-gray-800';

                                return (
                                    <div key={index} className={`p-3 rounded-lg border ${borderColor} ${bgStyle} transition-colors`}>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="checkbox"
                                                checked={isEnabled}
                                                onChange={(e) => toggleDay(index, e.target.checked)}
                                                className="w-5 h-5 accent-primary cursor-pointer"
                                                id={`day-${index}`}
                                            />
                                            <label htmlFor={`day-${index}`} className={`font-bold w-12 cursor-pointer ${index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-700 dark:text-gray-300'}`}>
                                                {dayName}曜
                                            </label>

                                            {isEnabled && (
                                                <div className="flex-1 flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
                                                    <input
                                                        type="number"
                                                        value={weekdays[index].hours}
                                                        onChange={(e) => handleHoursChange(index, e.target.value)}
                                                        className="w-20 p-2 text-lg font-bold text-center border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                        placeholder="0"
                                                    />
                                                    <span className="text-sm text-gray-500 mr-2">時間</span>

                                                    {/* Presets for this day */}
                                                    <div className="flex flex-wrap gap-1.5 hidden sm:flex">
                                                        {settings.timePresets.slice(0, 4).map(preset => (
                                                            <button
                                                                key={preset}
                                                                onClick={() => handlePresetClick(index, preset)}
                                                                className="px-2 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                                            >
                                                                {preset}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        {/* Mobile Presets */}
                                        {isEnabled && (
                                            <div className="flex sm:hidden flex-wrap gap-2 mt-3 ml-9 animate-in fade-in">
                                                {settings.timePresets.map(preset => (
                                                    <button
                                                        key={preset}
                                                        onClick={() => handlePresetClick(index, preset)}
                                                        className="px-3 py-1.5 text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-100"
                                                    >
                                                        {preset}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                </div>

                {/* Footer Actions */}
                <div className="flex gap-3 mt-8 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <button onClick={onClose} className="flex-1 py-3 px-4 rounded-xl text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        キャンセル
                    </button>
                    <button onClick={handleSave} className="flex-1 py-3 px-4 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/30 hover:bg-primary/90 active:scale-95 transition-all">
                        一括登録を実行
                    </button>
                </div>

            </div>
        </div>
    );
};

export default BatchInputModal;
