import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2 } from 'lucide-react';

const EventSettingsModal = ({ isOpen, onClose, eventPresets, onSave }) => {
    const [localPresets, setLocalPresets] = useState([]);

    // Tailwind color classes for selection
    const colorOptions = [
        { label: 'ピンク', value: 'ring-pink-300' },
        { label: 'ブルー', value: 'ring-blue-300' },
        { label: 'グリーン', value: 'ring-green-300' },
        { label: 'イエロー', value: 'ring-yellow-300' },
        { label: 'パープル', value: 'ring-purple-300' },
        { label: 'オレンジ', value: 'ring-orange-300' },
        { label: 'グレー', value: 'ring-gray-300' },
    ];

    useEffect(() => {
        if (isOpen) {
            setLocalPresets(eventPresets || []);
        }
    }, [isOpen, eventPresets]);

    const handleAddPreset = () => {
        const newId = Math.max(...localPresets.map(p => p.id), 0) + 1;
        setLocalPresets([...localPresets, { id: newId, name: '新しい予定', color: 'ring-blue-300' }]);
    };

    const handleRemovePreset = (id) => {
        setLocalPresets(localPresets.filter(p => p.id !== id));
    };

    const handleChange = (id, field, value) => {
        setLocalPresets(localPresets.map(p =>
            p.id === id ? { ...p, [field]: value } : p
        ));
    };

    const handleSave = () => {
        onSave(localPresets);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-gray-800 to-gray-700 dark:from-gray-700 dark:to-gray-600 p-4 flex justify-between items-center text-white shadow-md">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        📅 予定プリセット設定
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
                    {localPresets.map((preset) => (
                        <div key={preset.id} className="flex flex-col gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                            <div className="flex gap-2 items-center">
                                <input
                                    type="text"
                                    value={preset.name}
                                    onChange={(e) => handleChange(preset.id, 'name', e.target.value)}
                                    placeholder="予定名"
                                    className="flex-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm font-bold shadow-sm"
                                />
                                <button
                                    onClick={() => handleRemovePreset(preset.id)}
                                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Color Selection */}
                            <div className="flex flex-wrap gap-2">
                                {colorOptions.map((color) => (
                                    <button
                                        key={color.value}
                                        onClick={() => handleChange(preset.id, 'color', color.value)}
                                        className={`w-6 h-6 rounded-full border-2 ${color.value.replace('ring-', 'bg-').replace('300', '400')} ${preset.color === color.value ? 'border-gray-600 dark:border-white scale-110' : 'border-transparent opacity-50 hover:opacity-100'}`}
                                        title={color.label}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={handleAddPreset}
                        className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-500 dark:text-gray-400 font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        新しい予定を追加
                    </button>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex gap-3 bg-gray-50 dark:bg-gray-900/50">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        キャンセル
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-lg hover:shadow-lg transform active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        保存する
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EventSettingsModal;
