'use client';

import clsx from 'clsx';
import { Calendar } from 'lucide-react';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { DATE_FILTERS, getDateRangeByFilter } from '../utils/dateHelpers';

const DateRangeFilter = ({ onFilterChange, activeFilter }) => {
    const [showCustom, setShowCustom] = useState(false);
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');

    const filters = [
        { id: DATE_FILTERS.ALL, label: 'All Time' },
        { id: DATE_FILTERS.TODAY, label: 'Today' },
        { id: DATE_FILTERS.THIS_WEEK, label: 'This Week' },
        { id: DATE_FILTERS.THIS_MONTH, label: 'This Month' },
        { id: DATE_FILTERS.LAST_MONTH, label: 'Last Month' },
        { id: DATE_FILTERS.CUSTOM, label: 'Custom' },
    ];

    const handleFilterClick = (filterId) => {
        if (filterId === DATE_FILTERS.CUSTOM) {
            setShowCustom(true);
            return;
        }

        setShowCustom(false);
        const range = getDateRangeByFilter(filterId);
        onFilterChange(filterId, range);
    };

    const handleCustomApply = () => {
        if (customStart && customEnd) {
            const range = {
                start: new Date(customStart),
                end: new Date(customEnd)
            };
            onFilterChange(DATE_FILTERS.CUSTOM, range);
            setShowCustom(false);
        }
    };

    const handleClearCustom = () => {
        setCustomStart('');
        setCustomEnd('');
        setShowCustom(false);
        onFilterChange(DATE_FILTERS.ALL, null);
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
                {filters.map((filter) => (
                    <button
                        key={filter.id}
                        onClick={() => handleFilterClick(filter.id)}
                        className={clsx(
                            'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                            activeFilter === filter.id
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                        )}
                    >
                        {filter.id === DATE_FILTERS.CUSTOM && (
                            <Calendar className="w-4 h-4 inline mr-1" />
                        )}
                        {filter.label}
                    </button>
                ))}
            </div>

            {showCustom && (
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-slate-400 mb-1 block">Start Date</label>
                            <input
                                type="date"
                                value={customStart}
                                onChange={(e) => setCustomStart(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-400 mb-1 block">End Date</label>
                            <input
                                type="date"
                                value={customEnd}
                                onChange={(e) => setCustomEnd(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleCustomApply}
                            disabled={!customStart || !customEnd}
                            className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            Apply
                        </button>
                        <button
                            onClick={handleClearCustom}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

DateRangeFilter.propTypes = {
    onFilterChange: PropTypes.func.isRequired,
    activeFilter: PropTypes.string.isRequired,
};

export default DateRangeFilter;

