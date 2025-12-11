'use client';

import { Award, Calculator, TrendingDown, TrendingUp } from 'lucide-react';
import { useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';

const SummaryInsights = () => {
    const { transactions } = useFinance();

    const insights = useMemo(() => {
        if (transactions.length === 0) {
            return null;
        }

        const expenses = transactions.filter(t => t.type === 'expense');
        const incomes = transactions.filter(t => t.type === 'income');

        // Average daily spending (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentExpenses = expenses.filter(t => new Date(t.date) >= thirtyDaysAgo);
        const avgDailySpending = recentExpenses.length > 0
            ? recentExpenses.reduce((sum, t) => sum + t.amount, 0) / 30
            : 0;

        // Largest transaction
        const allTransactions = [...transactions];
        const largest = allTransactions.reduce((max, t) =>
            t.amount > max.amount ? t : max
            , allTransactions[0]);

        // Most frequent category
        const categoryCount = transactions.reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + 1;
            return acc;
        }, {});
        const mostFrequent = Object.entries(categoryCount).reduce((max, [cat, count]) =>
            count > max.count ? { category: cat, count } : max
            , { category: '', count: 0 });

        // Spending ratio
        const totalIncome = incomes.reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);
        const spendingRatio = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;

        return {
            avgDailySpending,
            largest,
            mostFrequent: mostFrequent.category,
            spendingRatio
        };
    }, [transactions]);

    if (!insights) {
        return (
            <div className="text-center py-8 text-slate-500">
                <p>Add transactions to see insights</p>
            </div>
        );
    }

    const cards = [
        {
            icon: Calculator,
            label: 'Avg. Daily Spending',
            value: new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
            }).format(insights.avgDailySpending),
            color: 'blue'
        },
        {
            icon: Award,
            label: 'Largest Transaction',
            value: `${insights.largest.description.substring(0, 15)}${insights.largest.description.length > 15 ? '...' : ''}`,
            subValue: new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
            }).format(insights.largest.amount),
            color: 'purple'
        },
        {
            icon: TrendingUp,
            label: 'Most Frequent Category',
            value: insights.mostFrequent || 'N/A',
            color: 'green'
        },
        {
            icon: TrendingDown,
            label: 'Spending Ratio',
            value: `${insights.spendingRatio.toFixed(1)}%`,
            subValue: 'of income',
            color: insights.spendingRatio > 100 ? 'red' : insights.spendingRatio > 80 ? 'yellow' : 'green'
        }
    ];

    const colorClasses = {
        blue: 'bg-blue-500/10 text-blue-400',
        green: 'bg-green-500/10 text-green-400',
        purple: 'bg-purple-500/10 text-purple-400',
        red: 'bg-red-500/10 text-red-400',
        yellow: 'bg-yellow-500/10 text-yellow-400'
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card, idx) => {
                const Icon = card.icon;
                return (
                    <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${colorClasses[card.color]}`}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-slate-400 mb-1">{card.label}</p>
                                <p className="text-lg font-bold text-white truncate">{card.value}</p>
                                {card.subValue && (
                                    <p className="text-xs text-slate-500">{card.subValue}</p>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default SummaryInsights;

