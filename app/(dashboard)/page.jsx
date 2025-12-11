'use client';

import { format } from 'date-fns';
import { Clock, Plus, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import AccountsOverview from '@/components/AccountsOverview';
import AddTransactionModal from '@/components/AddTransactionModal';
import BalanceCard from '@/components/BalanceCard';
import BudgetSummary from '@/components/BudgetSummary';
import DebtSummaryCard from '@/components/DebtSummaryCard';
import RecurringSummary from '@/components/RecurringSummary';
import SavingsSummary from '@/components/SavingsSummary';
import StatsCard from '@/components/StatsCard';
import { useFinance } from '@/context/FinanceContext';

export default function DashboardPage() {
  const { transactions, getBalance, getIncome, getExpense } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Format time for WIB
  const formatTimeWIB = () => {
    return currentTime.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const formatDateWIB = () => {
    return currentTime.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

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
    <div className="space-y-6 md:space-y-8">
      {/* Header with Clock */}
      <header className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                {getGreeting()} 👋
              </h2>
              <p className="text-slate-400 mt-1 text-sm md:text-base">
                Here&apos;s your financial overview
              </p>
            </div>
            {/* Digital Clock */}
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl">
              <Clock className="w-5 h-5 text-emerald-400" />
              <div>
                <div className="text-xl md:text-2xl font-mono font-bold text-white tracking-wider">
                  {formatTimeWIB()}
                </div>
                <div className="text-xs text-slate-400">
                  {formatDateWIB()} WIB
                </div>
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 md:px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20 active:scale-95 text-sm md:text-base"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Add Transaction</span>
          <span className="sm:hidden">Add</span>
        </button>
      </header>

      {/* Main Balance Card */}
      <BalanceCard />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <StatsCard title="Total Income" value={getIncome()} type="income" />
        <StatsCard title="Total Expense" value={getExpense()} type="expense" />
      </div>

      {/* Feature Summaries */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <AccountsOverview />
        <BudgetSummary />
        <RecurringSummary />
        <SavingsSummary />
      </div>

      {/* Debt Summary */}
      <DebtSummaryCard />

      {/* Activity & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Activity Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6">
            Activity Overview
          </h3>
          {data.length === 0 ? (
            <div className="h-[250px] md:h-[300px] flex items-center justify-center">
              <div className="text-center">
                <div className="inline-flex p-4 bg-slate-800 rounded-full mb-4">
                  <TrendingUp className="w-10 h-10 md:w-12 md:h-12 text-slate-600" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">
                  No Activity Yet
                </h4>
                <p className="text-slate-400 mb-4 text-sm">
                  Start tracking your finances
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Add your first transaction
                </button>
              </div>
            </div>
          ) : (
            <div className="h-[250px] md:h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="#64748b"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      color: '#fff',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorAmount)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6">
            Recent Transactions
          </h3>
          <div className="space-y-3">
            {sortedTransactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-500 mb-2 text-sm">No transactions yet</p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Add your first transaction
                </button>
              </div>
            ) : (
              sortedTransactions.slice(0, 5).map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${t.type === 'income'
                      ? 'bg-green-500/10 text-green-500'
                      : 'bg-red-500/10 text-red-500'
                      }`}>
                      {t.type === 'income' ? '+' : '-'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-white text-sm truncate">
                        {t.description}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-slate-400">
                          {format(new Date(t.date), 'dd MMM yyyy')}
                        </span>
                        {t.category && (
                          <>
                            <span className="text-slate-600">•</span>
                            <span className="text-xs px-2 py-0.5 bg-slate-800 rounded text-slate-400">
                              {t.category}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className={`font-semibold text-sm whitespace-nowrap ml-2 ${t.type === 'income' ? 'text-green-400' : 'text-slate-200'
                    }`}>
                    {t.type === 'income' ? '+' : '-'}
                    {new Intl.NumberFormat('id-ID', {
                      style: 'currency',
                      currency: 'IDR',
                      minimumFractionDigits: 0
                    }).format(t.amount)}
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
}
