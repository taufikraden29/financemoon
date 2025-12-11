'use client';

import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { Calendar, Plus, RefreshCw, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRecurring } from '@/hooks/useRecurring';
import { formatRupiah } from '@/utils/currencyHelpers';

const RecurringSummary = () => {
    const { recurringTransactions, getActiveCount, getMonthlyTotal, getUpcoming } = useRecurring();
    const router = useRouter();

    const upcoming = getUpcoming(30).slice(0, 3); // Next 30 days, show top 3
    const activeCount = getActiveCount();
    const monthlyTotal = getMonthlyTotal();

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 hover:border-slate-700 transition-all h-full flex flex-col">
            <div className="flex items-center justify-between mb-4 md:mb-6">
                <div className="flex items-center gap-2 md:gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                        <RefreshCw className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
                    </div>
                    <h3 className="text-base md:text-lg font-bold text-white">Recurring</h3>
                </div>
                <button
                    onClick={() => router.push('/recurring')}
                    className="text-xs md:text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                    View All
                </button>
            </div>

            {recurringTransactions.length === 0 ? (
                <div className="text-center py-6 md:py-8 flex-1 flex flex-col items-center justify-center">
                    <div className="inline-flex p-2 md:p-3 bg-slate-800 rounded-full mb-2 md:mb-3">
                        <RefreshCw className="w-6 h-6 md:w-8 md:h-8 text-slate-600" />
                    </div>
                    <h4 className="text-sm font-medium text-white mb-1">No Recurring Yet</h4>
                    <p className="text-xs text-slate-400 mb-2 md:mb-3">
                        Automate your regular bills
                    </p>
                    <button
                        onClick={() => router.push('/recurring')}
                        className="text-xs md:text-sm text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1"
                    >
                        <Plus className="w-3 h-3 md:w-4 md:h-4" />
                        Add Recurring
                    </button>
                </div>
            ) : (
                <div className="space-y-3 md:space-y-4 flex-1 flex flex-col">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-2 md:gap-3">
                        <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 rounded-lg md:rounded-xl p-2 md:p-3">
                            <div className="flex items-center gap-1 md:gap-2 mb-1">
                                <RefreshCw className="w-3 h-3 text-purple-400" />
                                <p className="text-xs text-slate-400">Active</p>
                            </div>
                            <p className="text-xl md:text-2xl font-bold text-white">{activeCount}</p>
                        </div>
                        <div className="bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/20 rounded-lg md:rounded-xl p-2 md:p-3">
                            <div className="flex items-center gap-1 md:gap-2 mb-1">
                                <TrendingUp className="w-3 h-3 text-red-400" />
                                <p className="text-xs text-slate-400">Monthly</p>
                            </div>
                            <p className="text-sm md:text-lg font-bold text-red-400 truncate">
                                {formatRupiah(monthlyTotal)}
                            </p>
                        </div>
                    </div>

                    {/* Upcoming Transactions */}
                    {upcoming.length > 0 ? (
                        <div className="flex-1">
                            <div className="flex items-center gap-1 md:gap-2 mb-2 md:mb-3">
                                <Calendar className="w-3 h-3 md:w-4 md:h-4 text-slate-400" />
                                <p className="text-xs text-slate-400 font-medium">
                                    Coming Up
                                </p>
                            </div>
                            <div className="space-y-2">
                                {upcoming.map((recurring) => {
                                    const nextDate = parseISO(recurring.nextOccurrence);

                                    return (
                                        <div
                                            key={recurring.id}
                                            className="flex items-center justify-between p-2 md:p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors cursor-pointer"
                                            onClick={() => router.push('/recurring')}
                                        >
                                            <div className="flex-1 min-w-0 mr-2">
                                                <p className="text-xs md:text-sm font-medium text-white truncate mb-0.5 md:mb-1">
                                                    {recurring.name}
                                                </p>
                                                <div className="flex items-center gap-1 md:gap-2 text-xs text-slate-400">
                                                    <span className="hidden sm:inline">{format(nextDate, 'MMM dd, yyyy')}</span>
                                                    <span className="sm:hidden">{format(nextDate, 'MMM dd')}</span>
                                                    <span className="hidden sm:inline">•</span>
                                                    <span className="text-purple-400 truncate">
                                                        {formatDistanceToNow(nextDate, { addSuffix: true })}
                                                    </span>
                                                </div>
                                            </div>
                                            <span className="text-xs md:text-sm font-semibold text-red-400 whitespace-nowrap">
                                                {formatRupiah(recurring.amount)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-3 md:py-4 bg-slate-800/20 rounded-lg flex-1 flex items-center justify-center">
                            <p className="text-xs text-slate-400">
                                No upcoming in next 30 days
                            </p>
                        </div>
                    )}

                    <button
                        onClick={() => router.push('/recurring')}
                        className="w-full mt-auto text-xs md:text-sm text-blue-400 hover:text-blue-300 transition-colors py-2 rounded-lg hover:bg-slate-800/50"
                    >
                        Manage Recurring →
                    </button>
                </div>
            )}
        </div>
    );
};

export default RecurringSummary;

