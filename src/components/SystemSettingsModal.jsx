import { useRef } from 'react';
import { X, Settings, Download, AlertTriangle, Image as ImageIcon, FileJson, Upload, RefreshCw } from 'lucide-react';
import { downloadCSV } from '../utils/csvHelper';
import { exportData, importData } from '../utils/backupHelper';
import { processAndSaveImage } from '../utils/imageHelper';

const SystemSettingsModal = ({ isOpen, onClose, shifts }) => {
    const fileInputRef = useRef(null);
    const imageInputRef = useRef(null);

    if (!isOpen) return null;

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
    const handleExportJSON = () => {
        exportData();
    };

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
            e.target.value = ''; // Reset input
        }
    };

    // --- Image Logic ---
    const handleImageSelect = () => {
        imageInputRef.current?.click();
    };

    const handleImageChange = async (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const success = await processAndSaveImage(file);
            if (success) {
                if (window.confirm('背景画像を保存しました。反映するためにリロードしますか？')) {
                    window.location.reload();
                }
            }
            e.target.value = ''; // Reset input
        }
    };

    const handleRemoveImage = () => {
        if (window.confirm('背景画像を削除しますか？')) {
            localStorage.removeItem('backgroundImage');
            window.location.reload();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-sm max-h-[90vh] overflow-y-auto p-6 shadow-xl animate-in zoom-in-95 duration-200 transition-colors">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        <Settings className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        システム設定
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                <div className="space-y-6 mb-8">

                    {/* Data Management */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-500 dark:text-gray-400 block border-b dark:border-gray-700 pb-1">データ管理</label>
                        <button
                            onClick={handleExportCSV}
                            className="w-full py-3 px-4 rounded-xl border-2 border-primary text-primary dark:text-primary-light font-bold hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center justify-center gap-2"
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

                    {/* Customization */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-500 dark:text-gray-400 block border-b dark:border-gray-700 pb-1">カレンダー設定</label>
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

                    {/* Backup */}
                    <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-500 dark:text-gray-400 block border-b dark:border-gray-700 pb-1">バックアップ (JSON)</label>
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

                </div>

                <div className="flex justify-center">
                    <button
                        onClick={onClose}
                        className="w-full py-3 px-4 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        閉じる
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SystemSettingsModal;
