import { ChevronRight } from 'lucide-react';

const ShiftList = ({ shifts, currentDate, onShiftClick, fiscalPeriod }) => {
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

    // Filter and Sort Shifts based on Fiscal Period
    const monthlyShifts = Object.keys(shifts)
        .map(key => {
            const [year, month, day] = key.split('-').map(Number);
            const date = new Date(year, month - 1, day);
            // safe time set
            date.setHours(0, 0, 0, 0);
            return {
                date,
                key,
                ...shifts[key]
            };
        })
        .filter(item => {
            if (!fiscalPeriod) return true; // Fallback
            const { start, end } = fiscalPeriod;
            // Ensure comparison works (dates already 0-houred in map? no, new Date defaults. safe to zero out bounds)
            const target = item.date;
            // Compare timestamps
            return target.getTime() >= start.getTime() && target.getTime() <= end.getTime();
        })
        .sort((a, b) => a.date - b.date);

    if (monthlyShifts.length === 0) {
        return (
            <div className="text-center py-8 text-gray-400 text-sm">
                この期間のシフトはまだありません
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-500 px-2 flex justify-between items-center">
                <span>詳細リスト</span>
                <span className="text-xs font-normal text-gray-400">
                    {fiscalPeriod ? `${fiscalPeriod.start.getMonth() + 1}/${fiscalPeriod.start.getDate()} ~ ${fiscalPeriod.end.getMonth() + 1}/${fiscalPeriod.end.getDate()}` : `${currentDate.getMonth() + 1}月`}
                </span>
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
                            <div className="flex flex-col items-center">
                                <span className={`text-sm font-bold ${getDayColor(shift.date)}`}>
                                    {shift.date.getMonth() + 1}/{shift.date.getDate()}
                                </span>
                                <span className={`text-xs font-bold ${getDayColor(shift.date)} opacity-70`}>
                                    ({getDayLabel(shift.date)})
                                </span>
                            </div>
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
