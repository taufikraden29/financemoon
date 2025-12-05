import clsx from 'clsx';
import { AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import { useBudget } from '../context/BudgetContext';

const BudgetSummary = () => {
    const { getCurrentMonthBudgets } = useBudget();

    const budgets = getCurrentMonthBudgets();

    if (budgets.length === 0) return null;

    const safeCount = budgets.filter(b => b.status === 'safe').length;
    const warningCount = budgets.filter(b => b.status === 'warning').length;
    const exceededCount = budgets.filter(b => b.status === 'exceeded').length;

    return (
        <div className="bg-gradient-to-br from-amber-900 to-yellow-900 border border-amber-800 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10">
                <TrendingUp className="w-32 h-32 text-amber-500" />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-amber-500/20 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Monthly Budgets</h3>
                        <p className="text-sm text-amber-200">
                            {budgets.length} categories tracked
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="bg-black/20 rounded-lg p-2 text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <CheckCircle className="w-3 h-3 text-green-400" />
                            <span className="text-xs text-amber-200">Safe</span>
                        </div>
                        <p className="text-lg font-bold text-white">{safeCount}</p>
                    </div>
                    <div className="bg-black/20 rounded-lg p-2 text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <AlertCircle className="w-3 h-3 text-yellow-400" />
                            <span className="text-xs text-amber-200">Warning</span>
                        </div>
                        <p className="text-lg font-bold text-white">{warningCount}</p>
                    </div>
                    <div className="bg-black/20 rounded-lg p-2 text-center">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <AlertCircle className="w-3 h-3 text-red-400" />
                            <span className="text-xs text-amber-200">Over</span>
                        </div>
                        <p className="text-lg font-bold text-white">{exceededCount}</p>
                    </div>
                </div>

                {budgets.slice(0, 3).map((budget) => {
                    const percentage = (budget.spent / budget.limit) * 100;
                    return (
                        <div key={budget.id} className="mb-2 last:mb-0">
                            <div className="flex justify-between text-xs text-amber-200 mb-1">
                                <span>{budget.category}</span>
                                <span>{percentage.toFixed(0)}%</span>
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
        </div>
    );
};

export default BudgetSummary;
