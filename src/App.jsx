import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, SlidersHorizontal, Settings, Sun, Moon } from 'lucide-react';
import InputSettingsModal from './components/InputSettingsModal';
import SystemSettingsModal from './components/SystemSettingsModal';
import ShiftList from './components/ShiftList';
import AdPlaceholder from './components/AdPlaceholder';
import GuideSection from './components/GuideSection';
import Footer from './components/Footer';

const App = () => {
    // --- State Management ---
    const loadInitialState = (key, defaultValue) => {
        try {
            const stored = localStorage.getItem(key);
            return stored ? JSON.parse(stored) : defaultValue;
        } catch (e) {
            console.error('Failed to load from localStorage', e);
            return defaultValue;
        }
    };

    const [currentDate, setCurrentDate] = useState(new Date());

    // Settings & Shifts
    const [settings, setSettings] = useState(() => {
        const loaded = loadInitialState('settings', { wagePresets: [], timePresets: [] });
        const migrated = { ...loaded };
        if (!migrated.wagePresets || migrated.wagePresets.length === 0) {
            migrated.hourlyWage = undefined;
            migrated.incomeLimit = migrated.incomeLimit || 1230000;
            migrated.wagePresets = [{ id: 1, name: '基本', wage: loaded.hourlyWage || 1000 }];
        }
        if (!migrated.timePresets || migrated.timePresets.length === 0) {
            migrated.timePresets = [3, 4, 5, 6, 7, 8];
        }
        return migrated;
    });

    const [shifts, setShifts] = useState(() => {
        const loaded = loadInitialState('shifts', {});
        const migrated = {};
        const defaultWage = settings.wagePresets?.[0]?.wage || 1000;
        const defaultName = settings.wagePresets?.[0]?.name || '基本';

        Object.keys(loaded).forEach(key => {
            if (typeof loaded[key] === 'number' || typeof loaded[key] === 'string') {
                migrated[key] = { hours: parseFloat(loaded[key]), wage: defaultWage, wageName: defaultName };
            } else {
                migrated[key] = loaded[key];
            }
        });
        return migrated;
    });

    // Modals
    const [isInputSettingsOpen, setIsInputSettingsOpen] = useState(false);
    const [isSystemSettingsOpen, setIsSystemSettingsOpen] = useState(false);
    const [isShiftModalOpen, setIsShiftModalOpen] = useState(false); // Legacy modal state, reusing logic inside specific component later or keep inline for now

    // Shift Input State
    const [selectedDate, setSelectedDate] = useState(null);
    const [inputHours, setInputHours] = useState('');
    const [selectedWageId, setSelectedWageId] = useState('');

    // Background Image
    const [backgroundImage, setBackgroundImage] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('backgroundImage') || null;
        }
        return null;
    });

    // Dark Mode
    const [isDarkMode, setIsDarkMode] = useState(() => {
        // 1. Check localStorage
        const savedTheme = localStorage.getItem('theme');
        console.log('Initial Theme (LocalStorage):', savedTheme);
        if (savedTheme) {
            return savedTheme === 'dark';
        }
        // 2. Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            console.log('Initial Theme (System): Dark');
            return true;
        }
        console.log('Initial Theme (Default): Light');
        return false;
    });

    useEffect(() => {
        console.log('Theme changed to:', isDarkMode ? 'dark' : 'light');
        const root = document.documentElement;
        if (isDarkMode) {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    useEffect(() => {
        localStorage.setItem('shifts', JSON.stringify(shifts));
    }, [shifts]);

    useEffect(() => {
        localStorage.setItem('settings', JSON.stringify(settings));
    }, [settings]);

    // --- Calendar Logic ---
    const getDaysInMonth = (year, month) => {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const days = [];
        for (let i = 0; i < firstDay.getDay(); i++) days.push(null);
        for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i));
        return days;
    };

    const days = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
    const yearMonthLabel = `${currentDate.getFullYear()}年 ${currentDate.getMonth() + 1}月`;

    // --- Calculations ---
    const calculateTotal = (filterFn) => {
        return Object.keys(shifts)
            .filter(filterFn)
            .reduce((acc, key) => {
                const shift = shifts[key];
                const hours = parseFloat(shift?.hours || 0);
                const wage = parseInt(shift?.wage || 0);
                return acc + (hours * wage);
            }, 0);
    };

    const currentMonthKeyPrefix = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    const monthlyEstimatedSalary = Math.floor(calculateTotal(key => key.startsWith(currentMonthKeyPrefix)));

    const currentYearPrefix = `${currentDate.getFullYear()}-`;
    const annualEstimatedSalary = Math.floor(calculateTotal(key => key.startsWith(currentYearPrefix)));

    const remainingIncome = settings.incomeLimit - annualEstimatedSalary;
    const progressPercentage = Math.min((annualEstimatedSalary / settings.incomeLimit) * 100, 100);

    const getProgressColor = () => {
        if (annualEstimatedSalary > settings.incomeLimit) return 'bg-red-500';
        if (progressPercentage >= 80) return 'bg-amber-400';
        return 'bg-primary';
    };

    // --- Handlers ---
    const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    const handleDateClick = (date) => {
        if (!date) return;
        const dateKey = getFormattedDate(date);
        setSelectedDate(date);

        const existing = shifts[dateKey];
        if (existing) {
            setInputHours(existing.hours);
            const matchedPreset = settings.wagePresets.find(p => p.wage === existing.wage && p.name === existing.wageName);
            setSelectedWageId(matchedPreset ? matchedPreset.id : settings.wagePresets[0]?.id);
        } else {
            setInputHours('');
            setSelectedWageId(settings.wagePresets[0]?.id);
        }

        setIsShiftModalOpen(true);
    };

    const handleSaveShift = () => {
        if (selectedDate) {
            const dateKey = getFormattedDate(selectedDate);
            const newShifts = { ...shifts };

            if (inputHours === '' || inputHours === '0') {
                delete newShifts[dateKey];
            } else {
                const selectedPreset = settings.wagePresets.find(p => String(p.id) === String(selectedWageId));
                newShifts[dateKey] = {
                    hours: inputHours,
                    wage: selectedPreset ? selectedPreset.wage : 0,
                    wageName: selectedPreset ? selectedPreset.name : '不明'
                };
            }
            setShifts(newShifts);
        }
        setIsShiftModalOpen(false);
    };

    const getFormattedDate = (date) => {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    const scrollToGuide = () => {
        document.getElementById('guide-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div
            className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans pb-20 transition-colors"
            style={backgroundImage ? {
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
            } : {}}
        >
            {/* Overlay for readability if background exists */}
            <div className={`min-h-screen ${backgroundImage ? (isDarkMode ? 'bg-black/70' : 'bg-white/60 backdrop-blur-[2px]') : ''}`}>

                {/* Header */}
                <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700 px-4 py-3 transition-colors">
                    <div className="flex flex-col gap-3 mb-2">
                        <div className="flex items-start justify-between">
                            <h1 className="text-sm font-bold text-gray-800 dark:text-white leading-tight" style={{ textWrap: 'balance' }}>
                                アルバイト・パート年収の壁対策シフト記録管理ツール/扶養内・社保の働き損を自動チェック <span className="text-[10px] text-gray-400 font-normal block mt-1">(2026/01/21更新)</span>
                            </h1>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setIsDarkMode(!isDarkMode)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                                >
                                    {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
                                </button>
                                <button
                                    onClick={() => setIsInputSettingsOpen(true)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors relative"
                                >
                                    <SlidersHorizontal className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                                    {/* Badge if setup needed? */}
                                </button>
                                <button
                                    onClick={() => setIsSystemSettingsOpen(true)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                                >
                                    <Settings className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                                </button>
                            </div>
                        </div>

                        <button onClick={scrollToGuide} className="text-xs text-primary dark:text-primary-light font-bold text-left hover:underline w-fit">
                            使い方がわからない方はこちら
                        </button>
                    </div>

                    {/* Progress Card */}
                    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 shadow-sm mb-2">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400 font-bold">年収の壁 ({Math.floor(settings.incomeLimit / 10000)}万) まで</span>
                            <span className={`text-xl font-bold ${remainingIncome < 0 ? 'text-red-500' : 'text-primary dark:text-primary-light'}`}>
                                残り ¥{remainingIncome.toLocaleString()}
                            </span>
                        </div>
                        <div className="h-3 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full ${getProgressColor()} transition-all duration-500`}
                                style={{ width: `${progressPercentage}%` }}
                            />
                        </div>
                        <div className="flex justify-between mt-1">
                            <span className="text-[10px] text-gray-400">現在: ¥{annualEstimatedSalary.toLocaleString()}</span>
                            <span className="text-[10px] text-gray-400">プログレス: {Math.floor(progressPercentage)}%</span>
                        </div>
                    </div>

                    {/* Monthly Salary Badge */}
                    <div className="flex justify-center">
                        <div className="bg-blue-50 dark:bg-blue-900/30 px-4 py-1.5 rounded-full flex items-center gap-2 border border-blue-100 dark:border-blue-800">
                            <span className="text-xs text-gray-500 dark:text-gray-300 font-bold">1月の概算:</span>
                            <span className="text-sm font-bold text-primary dark:text-blue-300">¥{monthlyEstimatedSalary.toLocaleString()}</span>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="p-4 max-w-md mx-auto space-y-8">

                    {/* Top Ad */}
                    <AdPlaceholder size="small" className="dark:bg-gray-800 dark:border-gray-700" />

                    {/* Calendar Section */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                                <ChevronLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                            </button>
                            <h2 className="text-lg font-bold text-gray-800 dark:text-white">{yearMonthLabel}</h2>
                            <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                                <ChevronRight className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                            </button>
                        </div>

                        <div className="grid grid-cols-7 gap-2">
                            {['日', '月', '火', '水', '木', '金', '土'].map((day, index) => (
                                <div key={index} className={`text-center text-xs font-bold py-2 ${index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-gray-400'}`}>
                                    {day}
                                </div>
                            ))}

                            {days.map((date, index) => {
                                if (!date) return <div key={`empty-${index}`} className="aspect-square" />;
                                const dateKey = getFormattedDate(date);
                                const shift = shifts[dateKey];
                                const isToday = getFormattedDate(new Date()) === dateKey;

                                return (
                                    <button
                                        key={dateKey}
                                        onClick={() => handleDateClick(date)}
                                        className={`
                    aspect-square rounded-xl flex flex-col items-center justify-start pt-2 relative transition-all
                    ${isToday ? 'bg-blue-50 dark:bg-blue-900/40 border-2 border-primary' : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700'}
                    hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 shadow-sm
                  `}
                                    >
                                        <span className={`text-sm font-medium ${date.getDay() === 0 ? 'text-red-500' : date.getDay() === 6 ? 'text-blue-500' : 'text-gray-700 dark:text-gray-300'}`}>
                                            {date.getDate()}
                                        </span>
                                        {shift && (
                                            <div className="mt-1 bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light text-xs font-bold px-1.5 py-0.5 rounded-md flex flex-col items-center leading-none gap-0.5">
                                                <span>{shift.hours}h</span>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </section>

                    {/* List Section */}
                    <section>
                        <ShiftList
                            shifts={shifts}
                            currentDate={currentDate}
                            onShiftClick={handleDateClick}
                        />
                    </section>

                    {/* Bottom Ad */}
                    <AdPlaceholder size="large" className="dark:bg-gray-800 dark:border-gray-700" />

                </main>

                {/* Guide Section (Placed outside max-w-md to span full width) */}
                <GuideSection />
                <Footer />

                {/* Legacy Shift Input Modal (could be refactored to component later) */}
                {isShiftModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-xs p-6 shadow-xl animate-in zoom-in-95 duration-200 transition-colors">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                                    {selectedDate && `${selectedDate.getMonth() + 1}/${selectedDate.getDate()}`} のシフト
                                </h3>
                                <button onClick={() => setIsShiftModalOpen(false)} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                                    <X className="w-6 h-6 text-gray-400" />
                                </button>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 ml-1">時間</label>
                                    <input
                                        type="number"
                                        value={inputHours}
                                        onChange={(e) => setInputHours(e.target.value)}
                                        placeholder="例: 5"
                                        className="w-full text-4xl font-bold text-center text-primary dark:text-primary-light border-b-2 border-gray-200 dark:border-gray-600 focus:border-primary outline-none py-2 bg-transparent dark:text-white"
                                        autoFocus
                                    />

                                    <div className="flex flex-wrap gap-2 justify-center mt-2">
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

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400 ml-1">勤務先 (時給)</label>
                                    <select
                                        value={selectedWageId}
                                        onChange={(e) => setSelectedWageId(e.target.value)}
                                        className="w-full text-lg font-bold text-gray-700 dark:text-gray-200 border dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    >
                                        {settings.wagePresets.map(preset => (
                                            <option key={preset.id} value={preset.id}>
                                                {preset.name} (¥{preset.wage})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button onClick={() => setIsShiftModalOpen(false)} className="flex-1 py-3 px-4 rounded-xl text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    キャンセル
                                </button>
                                <button onClick={handleSaveShift} className="flex-1 py-3 px-4 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/30 hover:bg-primary/90 active:scale-95 transition-all">
                                    保存
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* New Modals */}
                <InputSettingsModal
                    isOpen={isInputSettingsOpen}
                    onClose={() => setIsInputSettingsOpen(false)}
                    settings={settings}
                    onSave={setSettings}
                />

                <SystemSettingsModal
                    isOpen={isSystemSettingsOpen}
                    onClose={() => setIsSystemSettingsOpen(false)}
                    shifts={shifts}
                />

            </div>
        </div>
    );
};

export default App;
