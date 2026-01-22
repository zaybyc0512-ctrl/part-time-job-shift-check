import { useState, useEffect } from 'react';
import { X, Briefcase, Plus, Trash2, Minus, PlusCircle, Clock, SlidersHorizontal } from 'lucide-react';

const InputSettingsModal = ({ isOpen, onClose, settings, onSave }) => {
    const [localSettings, setLocalSettings] = useState(settings);
    const [newPresetTime, setNewPresetTime] = useState('');

    useEffect(() => {
        if (isOpen) {
            setLocalSettings({
                ...settings,
                wagePresets: settings.wagePresets?.length ? settings.wagePresets : [{ id: 1, name: '基本', wage: 1000 }],
                timePresets: settings.timePresets || [3, 4, 5, 6, 7, 8]
            });
        }
    }, [isOpen, settings]);

    const handleWagePresetChange = (id, field, value) => {
        setLocalSettings(prev => ({
            ...prev,
            wagePresets: prev.wagePresets.map(preset =>
                preset.id === id ? { ...preset, [field]: value } : preset
            )
        }));
    };

    const handleWageAmountAdjust = (id, amount) => {
        setLocalSettings(prev => ({
            ...prev,
            wagePresets: prev.wagePresets.map(preset =>
                preset.id === id ? { ...preset, wage: Math.max(0, parseInt(preset.wage) + amount) } : preset
            )
        }));
    };

    const addWagePreset = () => {
        const newId = Math.max(...localSettings.wagePresets.map(p => p.id), 0) + 1;
        setLocalSettings(prev => ({
            ...prev,
            wagePresets: [...prev.wagePresets, { id: newId, name: `追加シフト${newId}`, wage: 1000 }]
        }));
    };

    const removeWagePreset = (id) => {
        if (localSettings.wagePresets.length <= 1) return;
        setLocalSettings(prev => ({
            ...prev,
            wagePresets: prev.wagePresets.filter(p => p.id !== id)
        }));
    };

    const addTimePreset = () => {
        const time = parseFloat(newPresetTime);
        if (!isNaN(time) && time > 0 && !localSettings.timePresets.includes(time)) {
            setLocalSettings(prev => ({
                ...prev,
                timePresets: [...prev.timePresets, time].sort((a, b) => a - b)
            }));
            setNewPresetTime('');
        }
    };

    const removeTimePreset = (timeToRemove) => {
        setLocalSettings(prev => ({
            ...prev,
            timePresets: prev.timePresets.filter(t => t !== timeToRemove)
        }));
    };

    const handleChange = (key, value) => {
        setLocalSettings(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        onSave(localSettings);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-sm max-h-[90vh] overflow-y-auto p-6 shadow-xl animate-in zoom-in-95 duration-200 transition-colors">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <SlidersHorizontal className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        入力設定
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                <div className="space-y-8 mb-8">
                    {/* Wage List Section */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                時給リスト管理
                            </label>
                            <button
                                onClick={addWagePreset}
                                className="text-primary text-xs font-bold flex items-center gap-1 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-2 py-1 rounded-md transition-colors"
                            >
                                <PlusCircle className="w-3 h-3" /> 追加
                            </button>
                        </div>

                        <div className="space-y-3">
                            {localSettings.wagePresets.map((preset) => (
                                <div key={preset.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 border border-gray-100 dark:border-gray-600">
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            className="bg-white dark:bg-gray-600 border dark:border-gray-500 text-sm font-bold rounded-lg px-2 py-1 flex-1 text-gray-700 dark:text-gray-200"
                                            value={preset.name}
                                            onChange={(e) => handleWagePresetChange(preset.id, 'name', e.target.value)}
                                            placeholder="名称 (例: A店)"
                                        />
                                        {localSettings.wagePresets.length > 1 && (
                                            <button
                                                onClick={() => removeWagePreset(preset.id)}
                                                className="p-1 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={preset.wage}
                                            onChange={(e) => handleWagePresetChange(preset.id, 'wage', parseInt(e.target.value) || 0)}
                                            className="flex-1 text-lg font-bold text-gray-800 dark:text-gray-100 border dark:border-gray-500 bg-white dark:bg-gray-600 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                        />
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => handleWageAmountAdjust(preset.id, -100)}
                                                className="w-8 h-8 rounded-lg bg-white dark:bg-gray-600 border dark:border-gray-500 flex items-center justify-center text-gray-600 dark:text-gray-300 active:bg-gray-100 dark:active:bg-gray-500"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleWageAmountAdjust(preset.id, 100)}
                                                className="w-8 h-8 rounded-lg bg-white dark:bg-gray-600 border dark:border-gray-500 flex items-center justify-center text-gray-600 dark:text-gray-300 active:bg-gray-100 dark:active:bg-gray-500"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Time Presets Section */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            よく使う時間 (プリセット)
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {localSettings.timePresets.map((time) => (
                                <div key={time} className="bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-1 flex items-center gap-2">
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{time}h</span>
                                    <button
                                        onClick={() => removeTimePreset(time)}
                                        className="text-gray-400 hover:text-red-400 dark:hover:text-red-300"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2 mt-2">
                            <input
                                type="number"
                                value={newPresetTime}
                                onChange={(e) => setNewPresetTime(e.target.value)}
                                placeholder="時間"
                                className="w-20 bg-gray-50 dark:bg-gray-600 border dark:border-gray-500 rounded-lg px-3 py-2 text-sm font-bold dark:text-white"
                            />
                            <button
                                onClick={addTimePreset}
                                disabled={!newPresetTime}
                                className="bg-gray-800 dark:bg-gray-600 text-white rounded-lg px-3 py-2 text-sm font-bold disabled:opacity-50"
                            >
                                追加
                            </button>
                        </div>
                    </div>

                    {/* Income Limit Section */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-500 dark:text-gray-400">
                            年収の壁 (2025年改正)
                        </label>
                        <select
                            value={localSettings.incomeLimit}
                            onChange={(e) => handleChange('incomeLimit', parseInt(e.target.value))}
                            className="w-full text-lg font-bold text-gray-800 dark:text-gray-100 border dark:border-gray-500 bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary appearance-none transition-all"
                        >
                            <option value="1230000">123万円 (所得税の壁/扶養控除)</option>
                            <option value="1500000">150万円 (勤労学生控除)</option>
                            <option value="2010000">201万円 (配偶者特別控除MAX)</option>
                            {![1230000, 1500000, 2010000].includes(localSettings.incomeLimit) && (
                                <option value={localSettings.incomeLimit}>カスタム設定中</option>
                            )}
                        </select>

                        <div className="mt-3 flex items-end justify-end gap-2 border-t border-gray-100 dark:border-gray-700 pt-3">
                            <label className="text-xs font-bold text-gray-400 mb-2">カスタム設定</label>
                            <div className="flex items-end gap-1">
                                <input
                                    type="number"
                                    value={localSettings.incomeLimit / 10000}
                                    onChange={(e) => handleChange('incomeLimit', (parseFloat(e.target.value) || 0) * 10000)}
                                    className="w-24 text-right text-xl font-bold border-b border-gray-200 dark:border-gray-600 dark:bg-transparent dark:text-white focus:border-primary outline-none py-1"
                                />
                                <span className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-1">万円</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 px-4 rounded-xl text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        キャンセル
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 py-3 px-4 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/30 hover:bg-primary/90 active:scale-95 transition-all"
                    >
                        保存する
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InputSettingsModal;
