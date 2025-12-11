'use client';

import { eachMonthOfInterval, format, startOfMonth, subMonths } from 'date-fns';
import { useMemo } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useTransactions } from '@/hooks/useTransactions';

const TrendLineChart = () => {
    const { transactions } = useTransactions();

    const chartData = useMemo(() => {
        const last6Months = eachMonthOfInterval({
            start: startOfMonth(subMonths(new Date(), 5)),
            end: startOfMonth(new Date())
        });

        return last6Months.map(month => {
            const monthTransactions = transactions.filter(t => {
                const tDate = new Date(t.date);
                return tDate.getMonth() === month.getMonth() &&
                    tDate.getFullYear() === month.getFullYear();
            });

            const income = monthTransactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);

            const expense = monthTransactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);

            return {
                month: format(month, 'MMM yyyy'),
                income,
                expense,
                net: income - expense
            };
        });
    }, [transactions]);

    if (transactions.length === 0) {
        return (
            <div className="h-[300px] flex items-center justify-center">
                <p className="text-slate-500">No transaction data to display</p>
            </div>
        );
    }

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="month" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                        formatter={(value) => new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0
                        }).format(value)}
                        contentStyle={{
                            backgroundColor: '#0f172a',
                            borderColor: '#1e293b',
                            color: '#fff'
                        }}
                    />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="income"
                        stroke="#10b981"
                        strokeWidth={2}
                        name="Income"
                    />
                    <Line
                        type="monotone"
                        dataKey="expense"
                        stroke="#ef4444"
                        strokeWidth={2}
                        name="Expense"
                    />
                    <Line
                        type="monotone"
                        dataKey="net"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name="Net"
                        strokeDasharray="5 5"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default TrendLineChart;


