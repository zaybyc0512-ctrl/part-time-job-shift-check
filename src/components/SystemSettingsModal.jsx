import React, { useState, useRef, useEffect } from 'react';
import { X, Settings, Download, AlertTriangle, Image as ImageIcon, FileJson, Upload, Save } from 'lucide-react';
import { downloadCSV } from '../utils/csvHelper';
import { exportData, importData } from '../utils/backupHelper';
import { processAndSaveImage } from '../utils/imageHelper';

const SystemSettingsModal = ({ isOpen, onClose, settings, onSave, shifts }) => {
    const fileInputRef = useRef(null);
    const imageInputRef = useRef(null);

    // Local state for settings that confirms on "Save"
    const [localSettings, setLocalSettings] = useState({
        cutoffDay: 0 // Default: End of month
    });

    // Sync validation with prop
    useEffect(() => {
        if (isOpen && settings) {
            setLocalSettings(prev => ({
                ...prev,
                ...settings
            }));
        }
    }, [isOpen, settings]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(localSettings);
        onClose();
    };

    // --- Data Logic ---
    const handleExportCSV = () => {
        if (shifts) {
            downloadCSV(shifts);
        }
    };

    const handleResetData = () => {
        if (window.confirm('本当に全てのデータを削除しますか？\nこの操作は取り消せません。')) {
            localStorage.clear();
            window.location.reload();
        }
    };

    // --- Backup Logic ---
    const handleExportJSON = () => exportData();

    const handleImportJSONClick = () => {
        if (window.confirm('バックアップファイルを読み込むと、現在のデータは全て上書きされます。\nよろしいですか？')) {
            fileInputRef.current?.click();
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const success = await importData(file);
            if (success) {
                alert('復元が完了しました。アプリを再読み込みします。');
                window.location.reload();
            }
            e.target.value = '';
        }
    };

    // --- Image Logic ---
    const handleImageSelect = () => imageInputRef.current?.click();

    const handleImageChange = async (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const success = await processAndSaveImage(file);
            if (success) {
                if (window.confirm('背景画像を保存しました。反映するためにリロードしますか？')) {
                    window.location.reload();
                }
            }
            e.target.value = '';
        }
    };

    const handleRemoveImage = () => {
        if (window.confirm('背景画像を削除しますか？')) {
            localStorage.removeItem('backgroundImage');
            window.location.reload();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-gray-800 to-gray-700 dark:from-gray-700 dark:to-gray-600 p-4 flex justify-between items-center text-white shadow-md sticky top-0 z-10">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        システム設定
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-8">
                    {/* Cutoff Date Setting (New) */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 block border-b dark:border-gray-600 pb-1 mb-2">
                            給与締め日設定
                        </label>
                        <div className="relative">
                            <select
                                value={localSettings.cutoffDay || 0}
                                onChange={(e) => setLocalSettings(prev => ({ ...prev, cutoffDay: parseInt(e.target.value) }))}
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-lg font-bold text-gray-800 dark:text-gray-100 appearance-none"
                            >
                                <option value={0}>末日締め (1日〜末日)</option>
                                <option value={5}>5日締め (前月6日〜当月5日)</option>
                                <option value={10}>10日締め (前月11日〜当月10日)</option>
                                <option value={15}>15日締め (前月16日〜当月15日)</option>
                                <option value={20}>20日締め (前月21日〜当月20日)</option>
                                <option value={25}>25日締め (前月26日〜当月25日)</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            ※ 設定した締め日に基づいて、カレンダーの表示期間や月次給与の集計期間が変更されます。
                        </p>
                    </div>

                    {/* Customization (Old) */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-500 dark:text-gray-400 block border-b dark:border-gray-600 pb-1">デザイン設定</label>
                        <input type="file" ref={imageInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                        <div className="flex gap-2">
                            <button
                                onClick={handleImageSelect}
                                className="flex-1 py-3 px-4 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                            >
                                <ImageIcon className="w-5 h-5" />
                                背景画像
                            </button>
                            <button
                                onClick={handleRemoveImage}
                                className="py-3 px-4 rounded-xl bg-gray-100 dark:bg-gray-700 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                title="背景を削除"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Backup (Old) */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-500 dark:text-gray-400 block border-b dark:border-gray-600 pb-1">バックアップ (JSON)</label>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" className="hidden" />
                        <div className="flex gap-2">
                            <button
                                onClick={handleExportJSON}
                                className="flex-1 py-3 px-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-1"
                            >
                                <FileJson className="w-4 h-4" /> 書き出し
                            </button>
                            <button
                                onClick={handleImportJSONClick}
                                className="flex-1 py-3 px-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-1"
                            >
                                <Upload className="w-4 h-4" /> 読み込み
                            </button>
                        </div>
                    </div>

                    {/* Data Management (Old) */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-500 dark:text-gray-400 block border-b dark:border-gray-600 pb-1">データ管理</label>
                        <button
                            onClick={handleExportCSV}
                            className="w-full py-3 px-4 rounded-xl border-2 border-blue-500 text-blue-500 dark:text-blue-400 font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center justify-center gap-2"
                        >
                            <Download className="w-5 h-5" />
                            CSVエクスポート
                        </button>
                        <button
                            onClick={handleResetData}
                            className="w-full py-3 px-4 rounded-xl border border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2"
                        >
                            <AlertTriangle className="w-5 h-5" />
                            全データを削除
                        </button>
                    </div>
                </div>

                {/* Footer Actions */}
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
                        保存して適用
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SystemSettingsModal;
