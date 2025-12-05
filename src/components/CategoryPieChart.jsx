import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useFinance } from '../context/FinanceContext';

const CategoryPieChart = ({ type = 'expense' }) => {
    const { transactions } = useFinance();

    const categoryData = useMemo(() => {
        const filtered = transactions.filter(t => t.type === type);
        const grouped = filtered.reduce((acc, t) => {
            if (!acc[t.category]) {
                acc[t.category] = 0;
            }
            acc[t.category] += t.amount;
            return acc;
        }, {});

        return Object.entries(grouped).map(([name, value]) => ({
            name,
            value
        })).sort((a, b) => b.value - a.value);
    }, [transactions, type]);

    const COLORS = [
        '#3b82f6', // blue
        '#10b981', // green
        '#f59e0b', // amber
        '#ef4444', // red
        '#8b5cf6', // purple
        '#ec4899', // pink
        '#14b8a6', // teal
        '#f97316', // orange
    ];

    if (categoryData.length === 0) {
        return (
            <div className="h-[300px] flex items-center justify-center">
                <p className="text-slate-500">No {type} data to display</p>
            </div>
        );
    }

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={categoryData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                    >
                        {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value) => new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR'
                        }).format(value)}
                        contentStyle={{
                            backgroundColor: '#0f172a',
                            borderColor: '#1e293b',
                            color: '#fff'
                        }}
                    />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

CategoryPieChart.propTypes = {
    type: PropTypes.oneOf(['income', 'expense']).isRequired,
};

export default CategoryPieChart;
