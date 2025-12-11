'use client';

import clsx from 'clsx';
import { AlertCircle, CheckCircle, Plus, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useBudgets } from '@/hooks/useBudgets';

const BudgetSummary = () => {
    const { getCurrentMonthBudgets } = useBudgets();
    const router = useRouter();

    const budgets = getCurrentMonthBudgets();

    if (budgets.length === 0) {
        return (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 hover:border-slate-700 transition-all h-full flex flex-col">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="p-2 bg-amber-500/10 rounded-lg">
                            <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-amber-400" />
                        </div>
                        <h3 className="text-base md:text-lg font-bold text-white">Budgets</h3>
                    </div>
                </div>
                <div className="text-center py-6 md:py-8 flex-1 flex flex-col items-center justify-center">
                    <div className="inline-flex p-2 md:p-3 bg-slate-800 rounded-full mb-2 md:mb-3">
                        <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-slate-600" />
                    </div>
                    <h4 className="text-sm font-medium text-white mb-1">No Budgets Set</h4>
                    <p className="text-xs text-slate-400 mb-2 md:mb-3">
                        Track your spending
                    </p>
                    <button
                        onClick={() => router.push('/budgets')}
                        className="text-xs md:text-sm text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1"
                    >
                        <Plus className="w-3 h-3 md:w-4 md:h-4" />
                        Set Budget
                    </button>
                </div>
            </div>
        );
    }

    const safeCount = budgets.filter(b => b.status === 'safe').length;
    const warningCount = budgets.filter(b => b.status === 'warning').length;
    const exceededCount = budgets.filter(b => b.status === 'exceeded').length;

    return (
        <div className="bg-gradient-to-br from-amber-900 to-yellow-900 border border-amber-800 rounded-2xl p-4 md:p-6 relative overflow-hidden h-full flex flex-col">
            <div className="absolute top-0 right-0 opacity-10">
                <TrendingUp className="w-24 h-24 md:w-32 md:h-32 text-amber-500" />
            </div>

            <div className="relative z-10 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-3 md:mb-4">
                    <div className="p-2 bg-amber-500/20 rounded-lg">
                        <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-amber-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-base md:text-lg font-bold text-white">Monthly Budgets</h3>
                        <p className="text-xs md:text-sm text-amber-200 truncate">
                            {budgets.length} categories tracked
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3 md:mb-4">
                    <div className="bg-black/20 rounded-lg p-2 text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <CheckCircle className="w-3 h-3 text-green-400" />
                            <span className="text-xs text-amber-200">Safe</span>
                        </div>
                        <p className="text-base md:text-lg font-bold text-white">{safeCount}</p>
                    </div>
                    <div className="bg-black/20 rounded-lg p-2 text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <AlertCircle className="w-3 h-3 text-yellow-400" />
                            <span className="text-xs text-amber-200">Warn</span>
                        </div>
                        <p className="text-base md:text-lg font-bold text-white">{warningCount}</p>
                    </div>
                    <div className="bg-black/20 rounded-lg p-2 text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <AlertCircle className="w-3 h-3 text-red-400" />
                            <span className="text-xs text-amber-200">Over</span>
                        </div>
                        <p className="text-base md:text-lg font-bold text-white">{exceededCount}</p>
                    </div>
                </div>

                <div className="space-y-2 flex-1">
                    {budgets.slice(0, 3).map((budget) => {
                        const percentage = (budget.spent / budget.limit) * 100;
                        return (
                            <div key={budget.id} className="last:mb-0">
                                <div className="flex justify-between text-xs text-amber-200 mb-1">
                                    <span className="truncate mr-2">{budget.category}</span>
                                    <span className="whitespace-nowrap">{percentage.toFixed(0)}%</span>
                                </div>
                                <div className="h-1.5 bg-black/30 rounded-full overflow-hidden">
                                    <div
                                        className={clsx(
                                            "h-full transition-all duration-300",
                                            budget.status === 'safe' && "bg-green-500",
                                            budget.status === 'warning' && "bg-yellow-500",
                                            budget.status === 'exceeded' && "bg-red-500"
                                        )}
                                        style={{ width: `${Math.min(percentage, 100)}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                <button
                    onClick={() => router.push('/budgets')}
                    className="w-full mt-3 md:mt-4 text-xs md:text-sm text-amber-200 hover:text-white transition-colors py-2 rounded-lg hover:bg-black/20"
                >
                    Manage Budgets →
                </button>
            </div>
        </div>
    );
};

export default BudgetSummary;

