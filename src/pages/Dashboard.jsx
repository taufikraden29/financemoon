import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import AccountsOverview from '../components/AccountsOverview';
import AddTransactionModal from '../components/AddTransactionModal';
import BalanceCard from '../components/BalanceCard';
import BudgetSummary from '../components/BudgetSummary';
import DebtSummaryCard from '../components/DebtSummaryCard';
import SavingsSummary from '../components/SavingsSummary';
import StatsCard from '../components/StatsCard';
import { useFinance } from '../context/FinanceContext';

const Dashboard = () => {
    const { transactions, getBalance, getIncome, getExpense } = useFinance();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Sort transactions by date descending
    const sortedTransactions = [...transactions].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
    );

    // Prepare chart data - last 7 days
    const data = sortedTransactions
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(-7)
        .map(t => ({
            name: format(new Date(t.date), 'dd MMM'),
            amount: t.amount,
            type: t.type
        }));

    return (
        <div className="space-y-8">
            <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white">Dashboard</h2>
                    <p className="text-slate-400 mt-1">Welcome back, here is your financial overview.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20 active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Add Transaction
                </button>
            </header>

            {/* Balance Card - Prominent Saldo Display */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <BalanceCard />
                <StatsCard title="Total Income" value={getIncome()} type="income" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StatsCard title="Net Balance" value={getBalance()} type="balance" />
                <StatsCard title="Total Expense" value={getExpense()} type="expense" />
            </div>

            {/* New Feature Summaries */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <AccountsOverview />
                <BudgetSummary />
                <SavingsSummary />
            </div>

            {/* Debt Summary Card */}
            <DebtSummaryCard />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-6">Activity Overview</h3>
                    {data.length === 0 ? (
                        <div className="h-[300px] flex items-center justify-center">
                            <div className="text-center">
                                <p className="text-slate-500 mb-2">No transaction data yet</p>
                                <p className="text-sm text-slate-600">Add transactions to see your activity chart</p>
                            </div>
                        </div>
                    ) : (
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data}>
                                    <defs>
                                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                    <XAxis dataKey="name" stroke="#64748b" />
                                    <YAxis stroke="#64748b" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Area type="monotone" dataKey="amount" stroke="#3b82f6" fillOpacity={1} fill="url(#colorAmount)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-white mb-6">Recent Transactions</h3>
                    <div className="space-y-4">
                        {sortedTransactions.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-slate-500 mb-2">No transactions yet</p>
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                    Add your first transaction
                                </button>
                            </div>
                        ) : (
                            sortedTransactions.slice(0, 5).map((t) => (
                                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-800 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === 'income' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                            {t.type === 'income' ? '+' : '-'}
                                        </div>
                                        <div>
                                            <p className="font-medium text-white">{t.description}</p>
                                            <p className="text-xs text-slate-400">{format(new Date(t.date), 'dd MMM yyyy')}</p>
                                        </div>
                                    </div>
                                    <span className={`font-semibold ${t.type === 'income' ? 'text-green-400' : 'text-slate-200'}`}>
                                        {t.type === 'income' ? '+' : '-'} {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(t.amount)}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <AddTransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

export default Dashboard;
