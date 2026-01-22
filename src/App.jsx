import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, SlidersHorizontal, Settings, Sun, Moon, X, CalendarRange, Palette } from 'lucide-react';
import InputSettingsModal from './components/InputSettingsModal';
import SystemSettingsModal from './components/SystemSettingsModal';
import ShiftList from './components/ShiftList';
import AdPlaceholder from './components/AdPlaceholder';
import GuideSection from './components/GuideSection';
import Footer from './components/Footer';
import BatchInputModal from './components/BatchInputModal';
import ShiftEditModal from './components/ShiftEditModal';
import EventSettingsModal from './components/EventSettingsModal';

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

    // Events State
    const [events, setEvents] = useState(() => loadInitialState('events', {}));
    const [eventPresets, setEventPresets] = useState(() => loadInitialState('eventPresets', [
        { id: 1, name: '遊び', color: 'ring-pink-300' },
        { id: 2, name: '学校', color: 'ring-blue-300' },
        { id: 3, name: 'テスト', color: 'ring-red-300' },
        { id: 4, name: 'デート', color: 'ring-purple-300' },
    ]));

    // Modals
    const [isInputSettingsOpen, setIsInputSettingsOpen] = useState(false);
    const [isSystemSettingsOpen, setIsSystemSettingsOpen] = useState(false);
    const [isBatchInputOpen, setIsBatchInputOpen] = useState(false);
    const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
    const [isEventSettingsOpen, setIsEventSettingsOpen] = useState(false);

    // Shift Input State
    const [selectedDate, setSelectedDate] = useState(null);

    // Background Image
    const [backgroundImage, setBackgroundImage] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('backgroundImage') || null;
        }
        return null;
    });

    // Dark Mode
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            return savedTheme === 'dark';
        }
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return true;
        }
        return false;
    });

    useEffect(() => {
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

    useEffect(() => {
        localStorage.setItem('events', JSON.stringify(events));
    }, [events]);

    useEffect(() => {
        localStorage.setItem('eventPresets', JSON.stringify(eventPresets));
    }, [eventPresets]);

    // --- Notification Logic ---
    useEffect(() => {
        if (!("Notification" in window)) return;

        // Check for permission logic
        if (Notification.permission === 'default') {
            // We can ask here or on specific action. 
            // For now, let's ask on first load if supported, or maybe better to ask when user enables notification in modal.
            // But to ensure it works, we might need a button.
            // Let's rely on the user enabling it in modal, but we need to trigger permission then?
            // Since we can't trigger permission from background loop, let's just leave it. 
            // Browser might block auto-request.
        }

        const checkNotifications = () => {
            if (Notification.permission !== 'granted') return;

            const now = new Date();
            const dateKey = getFormattedDate(now);
            const shift = shifts[dateKey];

            if (shift && shift.startTime && shift.notificationEnabled) {
                // Parse start time
                const [h, m] = shift.startTime.split(':').map(Number);
                const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);

                // Notify 15 minutes before
                const notifyTime = new Date(start.getTime() - 15 * 60000); // 15 mins before

                // Check if current time is within the notification window (e.g. notifyTime <= now < notifyTime + 1 min)
                const diff = now - notifyTime;

                // If it is exactly the time (or within 1 min margin to avoid double firing, though interval is 1 min)
                // We need a way to prevent double firing. 
                // Simple way: check if diff is between 0 and 60000ms
                if (diff >= 0 && diff < 60000) {
                    new Notification(`バイトの時間です！`, {
                        body: `本日 ${shift.startTime} からシフトがあります。\n準備は大丈夫ですか？`,
                        icon: '/pwa-192x192.png' // Assuming icon exists
                    });
                }
            }
        };

        const interval = setInterval(checkNotifications, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [shifts]); // Re-run if shifts change, though interval captures 'shifts' in closure? 
    // Actually, setInterval closure might trap old 'shifts'. 
    // Better to use ref or dependency. Adding shifts to dependency ensures we have latest.


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

    // --- Fiscal Calculation Helpers ---
    const getFiscalPeriod = (year, month, cutoff) => {
        if (!cutoff || cutoff === 0) {
            // End of month closing
            const start = new Date(year, month, 1);
            const end = new Date(year, month + 1, 0);
            return {
                start,
                end,
                label: '末日締め'
            };
        }
        // Custom cutoff (e.g. 20th)
        // Fiscal Month 2 (Feb) = Jan 21 ~ Feb 20
        const start = new Date(year, month - 1, cutoff + 1);
        const end = new Date(year, month, cutoff);
        return {
            start,
            end,
            label: `${start.getMonth() + 1}/${start.getDate()}~${end.getMonth() + 1}/${end.getDate()}`
        };
    };

    const { start: fiscalStart, end: fiscalEnd, label: fiscalPeriodLabel } = getFiscalPeriod(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        settings.cutoffDay
    );

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

    // Monthly Logic: Check if shift date is within fiscal period
    const monthlyEstimatedSalary = Math.floor(calculateTotal(key => {
        const [y, m, d] = key.split('-').map(Number);
        const shiftDate = new Date(y, m - 1, d);
        // Compare dates (setting time to 0 to be safe)
        shiftDate.setHours(0, 0, 0, 0);
        const start = new Date(fiscalStart); start.setHours(0, 0, 0, 0);
        const end = new Date(fiscalEnd); end.setHours(23, 59, 59, 999);
        return shiftDate >= start && shiftDate <= end;
    }));

    // Annual Logic remains calendar year for tax purposes (Jan 1 - Dec 31)
    // OR should it be fiscal year? Usually "103万 wall" is Jan-Dec.
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

    // System Settings Handler
    const handleSystemSettingsSave = (newSettings) => {
        setSettings(prev => ({
            ...prev,
            ...newSettings
        }));
    };

    const handleDateClick = (date) => {
        if (!date) return;
        setSelectedDate(date);
        setIsShiftModalOpen(true);
    };

    const handleSaveShiftAndEvent = ({ shift, event }) => {
        if (selectedDate) {
            const dateKey = getFormattedDate(selectedDate);

            // Update Shifts
            const newShifts = { ...shifts };
            if (shift) {
                newShifts[dateKey] = shift;
            } else {
                delete newShifts[dateKey];
            }
            setShifts(newShifts);

            // Update Events
            const newEvents = { ...events };
            if (event) {
                newEvents[dateKey] = event;
            } else {
                delete newEvents[dateKey];
            }
            setEvents(newEvents);
        }
        setIsShiftModalOpen(false);
    };

    const getFormattedDate = (date) => {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    const scrollToGuide = () => {
        const element = document.getElementById('guide-section');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleBatchSave = (newShifts) => {
        setShifts(prev => ({
            ...prev,
            ...newShifts
        }));
    };

    // --- Helper for Event Summary ---
    const getMonthlyEventSummary = () => {
        // Collect all events in the CURRENT view (calendar month, not fiscal)
        // because the calendar shows the calendar month.
        const summary = {};
        days.forEach(date => {
            if (!date) return;
            const key = getFormattedDate(date);
            const event = events[key];
            if (event) {
                const preset = eventPresets.find(p => p.id === event.presetId);
                if (preset) {
                    summary[preset.name] = (summary[preset.name] || 0) + 1;
                }
            }
        });
        return Object.entries(summary).map(([name, count]) => {
            const preset = eventPresets.find(p => p.name === name); // find color
            return { name, count, color: preset ? preset.color : 'ring-gray-300' };
        });
    };

    const eventSummary = getMonthlyEventSummary();

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
                            <div className="flex items-center gap-2">
                                {/* Existing Buttons */}
                                <button
                                    onClick={() => setIsDarkMode(!isDarkMode)}
                                    className="flex flex-col items-center gap-0.5 min-w-[36px]"
                                >
                                    <div className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                                        {isDarkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
                                    </div>
                                    <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400">表示切替</span>
                                </button>

                                <button
                                    onClick={() => setIsBatchInputOpen(true)}
                                    className="flex flex-col items-center gap-0.5 min-w-[36px]"
                                >
                                    <div className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors relative">
                                        <CalendarRange className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                    </div>
                                    <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400">一括入力</span>
                                </button>

                                <button
                                    onClick={() => setIsInputSettingsOpen(true)}
                                    className="flex flex-col items-center gap-0.5 min-w-[36px]"
                                >
                                    <div className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors relative">
                                        <SlidersHorizontal className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                    </div>
                                    <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400">入力設定</span>
                                </button>

                                <button
                                    onClick={() => setIsSystemSettingsOpen(true)}
                                    className="flex flex-col items-center gap-0.5 min-w-[36px]"
                                >
                                    <div className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                                        <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                    </div>
                                    <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400">システム</span>
                                </button>

                                <button
                                    onClick={() => setIsEventSettingsOpen(true)}
                                    className="flex flex-col items-center gap-0.5 min-w-[36px]"
                                >
                                    <div className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors relative">
                                        <Palette className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                                    </div>
                                    <span className="text-[9px] font-bold text-gray-500 dark:text-gray-400">予定設定</span>
                                </button>
                            </div>
                        </div>

                        <div className="flex justify-end items-center w-full mt-1">
                            <button onClick={scrollToGuide} className="bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-300 text-xs font-bold px-3 py-1 rounded-full transition-colors flex items-center gap-1">
                                <span>使い方がわからない方はこちら</span>
                                <ChevronRight className="w-3 h-3" />
                            </button>
                        </div>
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
                    <div className="flex justify-center flex-col items-center gap-1">
                        <div className="bg-blue-50 dark:bg-blue-900/30 px-4 py-1.5 rounded-full flex items-center gap-2 border border-blue-100 dark:border-blue-800">
                            <span className="text-xs text-gray-500 dark:text-gray-300 font-bold">{currentDate.getMonth() + 1}月の概算:</span>
                            <span className="text-sm font-bold text-primary dark:text-blue-300">¥{monthlyEstimatedSalary.toLocaleString()}</span>
                        </div>
                        {settings.cutoffDay > 0 && (
                            <span className="text-[10px] text-gray-400">
                                集計期間: {fiscalPeriodLabel}
                            </span>
                        )}
                    </div>
                </header>

                {/* Main Content */}
                <main className="p-4 max-w-md mx-auto space-y-6">

                    {/* Top Ad */}
                    <AdPlaceholder size="small" className="dark:bg-gray-800 dark:border-gray-700" />

                    {/* Calendar Section */}
                    <section>
                        <div className="flex items-center justify-between mb-4">
                            <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                                <ChevronLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                            </button>
                            <div className="text-center">
                                <h2 className="text-lg font-bold text-gray-800 dark:text-white">{yearMonthLabel}</h2>
                                {settings.cutoffDay > 0 && <p className="text-[10px] text-gray-400">締め日: {settings.cutoffDay}日</p>}
                            </div>
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
                                const event = events[dateKey];
                                const isToday = getFormattedDate(new Date()) === dateKey;

                                // Visual check if date is in current fiscal period
                                const isFiscal = date >= fiscalStart && date <= fiscalEnd;

                                // Event ring color
                                let ringClass = '';
                                if (event) {
                                    const preset = eventPresets.find(p => p.id === event.presetId);
                                    if (preset) ringClass = `ring-4 ring-inset ${preset.color} rounded-xl`;
                                }

                                return (
                                    <button
                                        key={dateKey}
                                        onClick={() => handleDateClick(date)}
                                        className={`
                    aspect-square rounded-xl flex flex-col items-center justify-start pt-2 relative transition-all
                    ${isToday ? 'bg-blue-50 dark:bg-blue-900/40 border-2 border-primary z-10' : (isFiscal ? 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700' : 'bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 opacity-60')}
                    hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 shadow-sm
                    ${ringClass}
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

                    {/* Event Summary Bar */}
                    {eventSummary.length > 0 && (
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-gray-100 dark:border-gray-700 overflow-x-auto whitespace-nowrap hide-scrollbar flex gap-3 items-center">
                            <span className="text-xs font-bold text-gray-500 dark:text-gray-400 shrink-0">今月の予定:</span>
                            {eventSummary.map((item, index) => (
                                <div key={index} className="flex items-center gap-1">
                                    <span className={`w-3 h-3 rounded-md ${item.color.replace('ring-', 'bg-').replace('300', '400')}`}></span>
                                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                                        {item.name}({item.count})
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* List Section */}
                    <section>
                        <ShiftList
                            shifts={shifts}
                            currentDate={currentDate}
                            onShiftClick={handleDateClick}
                            fiscalPeriod={{ start: fiscalStart, end: fiscalEnd }}
                        />
                    </section>

                    {/* Bottom Ad */}
                    <AdPlaceholder size="large" className="dark:bg-gray-800 dark:border-gray-700" />

                    {/* Reverse Simulator Section */}
                    <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-5 text-white shadow-lg overflow-hidden relative">
                        {/* Background Decoration */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12 pointer-events-none"></div>

                        <div className="relative z-10">
                            <h3 className="text-sm font-bold text-indigo-200 mb-4 flex items-center gap-2">
                                <span className="p-1 bg-white/10 rounded-lg">📊</span>
                                年収の壁攻略シミュレーター
                            </h3>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="bg-black/20 rounded-xl p-3 backdrop-blur-sm">
                                    <span className="text-xs text-indigo-200 block mb-1">残り枠</span>
                                    <span className="text-lg font-bold">¥{remainingIncome.toLocaleString()}</span>
                                </div>
                                <div className="bg-black/20 rounded-xl p-3 backdrop-blur-sm">
                                    <span className="text-xs text-indigo-200 block mb-1">現在の時給</span>
                                    <span className="text-lg font-bold">¥{(settings.wagePresets?.[0]?.wage || 1000).toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="bg-white/10 rounded-xl p-4 text-center border border-white/10">
                                <span className="text-xs text-indigo-200 block mb-2">あと働ける時間</span>
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-3xl font-bold text-white">
                                        {remainingIncome > 0 && settings.wagePresets?.[0]?.wage > 0
                                            ? Math.floor(remainingIncome / settings.wagePresets[0].wage)
                                            : 0}
                                    </span>
                                    <span className="text-sm font-bold text-indigo-200">時間</span>
                                </div>

                                {/* Estimated Days */}
                                {remainingIncome > 0 && settings.wagePresets?.[0]?.wage > 0 && (
                                    <div className="mt-1 text-xs text-indigo-300 flex justify-center gap-2 bg-black/20 rounded-lg py-1 px-3 w-fit mx-auto">
                                        <span className="opacity-70">1日5hなら:</span>
                                        <span className="font-bold text-white">
                                            あと約{Math.floor((remainingIncome / settings.wagePresets[0].wage) / 5)}日分
                                        </span>
                                    </div>
                                )}

                                <p className="text-[10px] text-indigo-300 mt-2">
                                    ※ 基本時給(¥{(settings.wagePresets?.[0]?.wage || 0)})で計算した場合の目安です
                                </p>
                            </div>
                        </div>
                    </div>

                </main>

                {/* Guide Section (Placed outside max-w-md to span full width) */}
                <GuideSection />
                <Footer />

                {/* Modals */}
                <ShiftEditModal
                    isOpen={isShiftModalOpen}
                    onClose={() => setIsShiftModalOpen(false)}
                    date={selectedDate}
                    currentShift={selectedDate ? shifts[getFormattedDate(selectedDate)] : null}
                    currentEvent={selectedDate ? events[getFormattedDate(selectedDate)] : null}
                    onSave={handleSaveShiftAndEvent}
                    settings={settings}
                    eventPresets={eventPresets}
                />

                <InputSettingsModal
                    isOpen={isInputSettingsOpen}
                    onClose={() => setIsInputSettingsOpen(false)}
                    settings={settings}
                    onSave={setSettings}
                />

                <SystemSettingsModal
                    isOpen={isSystemSettingsOpen}
                    onClose={() => setIsSystemSettingsOpen(false)}
                    settings={settings}
                    onSave={handleSystemSettingsSave}
                    shifts={shifts}
                />

                <BatchInputModal
                    isOpen={isBatchInputOpen}
                    onClose={() => setIsBatchInputOpen(false)}
                    onSave={handleBatchSave}
                    settings={settings}
                />

                <EventSettingsModal
                    isOpen={isEventSettingsOpen}
                    onClose={() => setIsEventSettingsOpen(false)}
                    eventPresets={eventPresets}
                    onSave={setEventPresets}
                />

            </div>
        </div>
    );
};

export default App;
