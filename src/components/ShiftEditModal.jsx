import React, { useState, useEffect } from 'react';
import { X, Calendar as CalendarIcon, Clock } from 'lucide-react';

const ShiftEditModal = ({ isOpen, onClose, date, currentShift, currentEvent, onSave, settings, eventPresets }) => {
    const [activeTab, setActiveTab] = useState('shift'); // 'shift' or 'event'

    // Shift State
    const [inputMode, setInputMode] = useState('hours'); // 'hours' or 'time'
    const [inputHours, setInputHours] = useState('');
    const [selectedWageId, setSelectedWageId] = useState('');

    // Time Input State
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [breakTime, setBreakTime] = useState('0'); // minutes

    // Event State
    const [selectedEventPresetId, setSelectedEventPresetId] = useState(null);
    const [eventNote, setEventNote] = useState('');

    useEffect(() => {
        if (isOpen && date) {
            // Initialize Shift Data
            if (currentShift) {
                setInputHours(currentShift.hours);
                // Check if shift has time data to switch mode
                if (currentShift.startTime && currentShift.endTime) {
                    setInputMode('time');
                    setStartTime(currentShift.startTime);
                    setEndTime(currentShift.endTime);
                    setBreakTime(currentShift.breakTime || '0');

                } else {
                    setInputMode('hours');
                    setStartTime('');
                    setEndTime('');
                    setBreakTime('0');

                }

                const matchedPreset = settings.wagePresets.find(p => p.wage === currentShift.wage && p.name === currentShift.wageName);
                setSelectedWageId(matchedPreset ? matchedPreset.id : settings.wagePresets[0]?.id);
                if (currentShift) setActiveTab('shift');
            } else {
                setInputHours('');
                setInputMode('hours'); // Default to hours for new shift? Or user preference? keeping hours simple
                setStartTime('');
                setEndTime('');
                setBreakTime('0');

                setSelectedWageId(settings.wagePresets[0]?.id);
            }

            // Initialize Event Data
            if (currentEvent) {
                setSelectedEventPresetId(currentEvent.presetId);
                setEventNote(currentEvent.note || '');
                // If there's an event but no shift, default to event tab (unless logic prefers default shift)
                if (!currentShift) setActiveTab('event');
            } else {
                setSelectedEventPresetId(null);
                setEventNote('');
                // If neither, default tab is shift
                if (!currentShift) setActiveTab('shift');
            }
        }
    }, [isOpen, date, currentShift, currentEvent, settings]);

    // Auto-calculate hours when time inputs change
    useEffect(() => {
        if (inputMode === 'time' && startTime && endTime) {
            const start = new Date(`2000/01/01 ${startTime}`);
            const end = new Date(`2000/01/01 ${endTime}`);

            if (end > start) {
                const diffMs = end - start;
                const diffMins = Math.floor(diffMs / 60000);
                const breakMins = parseInt(breakTime) || 0;
                const workMins = Math.max(0, diffMins - breakMins);
                const hours = (workMins / 60).toFixed(2);
                // Remove trailing zeros if integer
                setInputHours(parseFloat(hours).toString());
            } else {
                // If end <= start (e.g. crossing midnight not supported yet), reset or show error
                // For now, just don't update hours or set to 0 if invalid
                if (endTime && startTime) setInputHours('0');
            }
        }
    }, [startTime, endTime, breakTime, inputMode]);

    const handleSave = () => {
        // Prepare shift data
        let shiftData = null;
        if (inputHours !== '' && inputHours !== '0') {
            const selectedPreset = settings.wagePresets.find(p => String(p.id) === String(selectedWageId));
            shiftData = {
                hours: inputHours,
                wage: selectedPreset ? selectedPreset.wage : 0,
                wageName: selectedPreset ? selectedPreset.name : '不明',
                // Persist time data if in time mode
                ...(inputMode === 'time' ? {
                    startTime,
                    endTime,
                    breakTime,

                } : {
                    // Clear time data if switched back to hours manual input
                    startTime: null,
                    endTime: null,
                    breakTime: null,

                })
            };
        }

        // Prepare event data
        let eventData = null;
        if (selectedEventPresetId) {
            eventData = {
                presetId: selectedEventPresetId,
                note: eventNote
            };
        }

        onSave({ shift: shiftData, event: eventData });
        onClose();
    };

    if (!isOpen || !date) return null;

    const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`;
    const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-sm shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-gray-100 dark:bg-gray-700 px-6 py-4 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <CalendarIcon className="w-5 h-5 opacity-50" />
                        {formattedDate} ({dayOfWeek})
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-600">
                    <button
                        onClick={() => setActiveTab('shift')}
                        className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'shift' ? 'text-primary border-b-2 border-primary bg-blue-50/50 dark:bg-blue-900/20' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                    >
                        シフト入力
                    </button>
                    <button
                        onClick={() => setActiveTab('event')}
                        className={`flex-1 py-3 text-sm font-bold transition-colors ${activeTab === 'event' ? 'text-pink-500 border-b-2 border-pink-500 bg-pink-50/50 dark:bg-pink-900/20' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                    >
                        予定・メモ
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 min-h-[300px]">
                    {activeTab === 'shift' ? (
                        <div className="space-y-6 animate-in slide-in-from-left-4 duration-200">
                            {/* Input Mode Toggle */}
                            <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                                <button
                                    onClick={() => setInputMode('hours')}
                                    className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-all ${inputMode === 'hours' ? 'bg-white dark:bg-gray-600 shadow-sm text-primary dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                                >
                                    時間(h)入力
                                </button>
                                <button
                                    onClick={() => setInputMode('time')}
                                    className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-all ${inputMode === 'time' ? 'bg-white dark:bg-gray-600 shadow-sm text-primary dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                                >
                                    時刻指定
                                </button>
                            </div>

                            {/* Shift Input Content */}
                            {inputMode === 'hours' ? (
                                <div className="space-y-2 text-center">
                                    <label className="text-xs font-bold text-gray-400 block mb-2">勤務時間 (h)</label>
                                    <input
                                        type="number"
                                        value={inputHours}
                                        onChange={(e) => setInputHours(e.target.value)}
                                        placeholder="0"
                                        className="w-full text-5xl font-bold text-center text-primary dark:text-primary-light border-b-2 border-gray-200 dark:border-gray-600 focus:border-primary outline-none py-2 bg-transparent dark:text-white placeholder-gray-200"
                                        autoFocus
                                    />
                                    <div className="flex flex-wrap gap-2 justify-center mt-4">
                                        {settings.timePresets.map((preset) => (
                                            <button
                                                key={preset}
                                                onClick={() => setInputHours(String(preset))}
                                                className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 font-bold px-3 py-1.5 rounded-lg text-sm hover:bg-blue-100 dark:hover:bg-blue-900/50 active:scale-95 transition-all"
                                            >
                                                {preset}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-400 ml-1">開始</label>
                                            <input
                                                type="time"
                                                value={startTime}
                                                onChange={(e) => setStartTime(e.target.value)}
                                                className="w-full text-xl font-bold text-center bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-2 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-400 ml-1">終了</label>
                                            <input
                                                type="time"
                                                value={endTime}
                                                onChange={(e) => setEndTime(e.target.value)}
                                                className={`w-full text-xl font-bold text-center bg-gray-50 dark:bg-gray-700 border ${endTime && startTime && endTime <= startTime ? 'border-red-400 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-600'} rounded-xl px-2 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20`}
                                            />
                                        </div>
                                    </div>

                                    {/* Error Message for Time Crossing Midnight */}
                                    {endTime && startTime && endTime <= startTime && (
                                        <p className="text-xs text-red-500 font-bold text-center bg-red-50 dark:bg-red-900/10 py-1 rounded-lg">
                                            ※ 日をまたぐシフトは入力できません
                                        </p>
                                    )}

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-400 ml-1">休憩時間</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {[0, 45, 60].map(mins => (
                                                <button
                                                    key={mins}
                                                    onClick={() => setBreakTime(String(mins))}
                                                    className={`py-2 rounded-lg text-sm font-bold border transition-all ${breakTime === String(mins) ? 'bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900/40 dark:border-blue-700 dark:text-blue-200' : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300'}`}
                                                >
                                                    {mins === 0 ? 'なし' : `${mins}分`}
                                                </button>
                                            ))}
                                        </div>
                                        {/* Custom Break Time Input */}
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-xs text-gray-400">その他:</span>
                                            <input
                                                type="number"
                                                value={breakTime}
                                                onChange={(e) => setBreakTime(e.target.value)}
                                                className="w-16 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 text-sm text-center font-bold"
                                            />
                                            <span className="text-xs text-gray-400">分</span>
                                        </div>
                                    </div>

                                    {/* Calculated Hours Display */}
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl flex justify-between items-center border border-blue-100 dark:border-blue-800">
                                        <span className="text-xs font-bold text-blue-600 dark:text-blue-300">計算結果:</span>
                                        <span className="text-xl font-bold text-primary dark:text-blue-300">{inputHours || '0'} <span className="text-xs">h</span></span>
                                    </div>


                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 ml-1">勤務先 (時給)</label>
                                <select
                                    value={selectedWageId}
                                    onChange={(e) => setSelectedWageId(e.target.value)}
                                    className="w-full text-lg font-bold text-gray-700 dark:text-gray-200 border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-xl px-3 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
                                >
                                    {settings.wagePresets.map(preset => (
                                        <option key={preset.id} value={preset.id}>
                                            {preset.name} (¥{preset.wage})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in slide-in-from-right-4 duration-200">
                            {/* Event Input Content */}
                            <div className="space-y-3">
                                <label className="text-xs font-bold text-gray-400 block">予定テンプレート</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {eventPresets && eventPresets.length > 0 ? (
                                        eventPresets.map(preset => (
                                            <button
                                                key={preset.id}
                                                onClick={() => setSelectedEventPresetId(selectedEventPresetId === preset.id ? null : preset.id)}
                                                className={`
                                                    p-3 rounded-xl border-2 font-bold text-sm transition-all relative overflow-hidden
                                                    ${selectedEventPresetId === preset.id
                                                        ? 'border-gray-800 bg-gray-800 text-white dark:border-white dark:bg-white dark:text-gray-900'
                                                        : 'border-gray-100 bg-white text-gray-600 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200'}
                                                `}
                                            >
                                                <span className={`absolute top-2 right-2 w-2 h-2 rounded-full ${preset.color.replace('ring-', 'bg-').replace('300', '400')}`}></span>
                                                {preset.name}
                                            </button>
                                        ))
                                    ) : (
                                        <div className="col-span-2 text-center text-gray-400 text-xs py-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            予定プリセットがありません。<br />設定から追加してください。
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 block">メモ</label>
                                <textarea
                                    value={eventNote}
                                    onChange={(e) => setEventNote(e.target.value)}
                                    placeholder="詳細なメモを入力..."
                                    className="w-full h-24 p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-400/50 resize-none text-sm"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700 flex gap-3">
                    <button onClick={onClose} className="flex-1 py-3 px-4 rounded-xl text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                        キャンセル
                    </button>
                    <button onClick={handleSave} className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transform active:scale-95 transition-all">
                        保存
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ShiftEditModal;
