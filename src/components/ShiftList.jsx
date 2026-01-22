import { ChevronRight } from 'lucide-react';

const ShiftList = ({ shifts, currentDate, onShiftClick }) => {
    const getFormattedDate = (date) => {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    const getDayColor = (date) => {
        const day = date.getDay();
        if (day === 0) return 'text-red-500'; // Sunday
        if (day === 6) return 'text-blue-500'; // Saturday
        return 'text-gray-500';
    };

    const getDayLabel = (date) => {
        return ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
    };

    // Filter and Sort Shifts for Current Month
    const currentMonthPrefix = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

    const monthlyShifts = Object.keys(shifts)
        .filter(key => key.startsWith(currentMonthPrefix))
        .sort()
        .map(key => {
            const [year, month, day] = key.split('-').map(Number);
            const date = new Date(year, month - 1, day);
            return {
                date,
                key,
                ...shifts[key]
            };
        });

    if (monthlyShifts.length === 0) {
        return (
            <div className="text-center py-8 text-gray-400 text-sm">
                この月のシフトはまだありません
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-500 px-2">
                {currentDate.getMonth() + 1}月の詳細リスト
            </h3>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {monthlyShifts.map((shift, index) => (
                    <div
                        key={shift.key}
                        onClick={() => onShiftClick(shift.date)}
                        className={`
              flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors
              ${index !== monthlyShifts.length - 1 ? 'border-b border-gray-100' : ''}
            `}
                    >
                        {/* Left: Date */}
                        <div className="flex items-center gap-3 w-16">
                            <span className={`text-lg font-bold ${getDayColor(shift.date)}`}>
                                {shift.date.getDate()}
                            </span>
                            <span className={`text-xs font-bold ${getDayColor(shift.date)} opacity-70`}>
                                ({getDayLabel(shift.date)})
                            </span>
                        </div>

                        {/* Center: Details */}
                        <div className="flex-1 flex flex-col px-2">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-gray-800">{shift.wageName}</span>
                                <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium">
                                    {shift.hours}h
                                </span>
                            </div>
                        </div>

                        {/* Right: Salary & Arrow */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-primary">
                                ¥{(shift.hours * shift.wage).toLocaleString()}
                            </span>
                            <ChevronRight className="w-4 h-4 text-gray-300" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ShiftList;
