'use client';

import clsx from 'clsx';
import { useState } from 'react';
import CategoryPieChart from '@/components/CategoryPieChart';
import SummaryInsights from '@/components/SummaryInsights';
import TrendLineChart from '@/components/TrendLineChart';

export default function AnalyticsPage() {
  const [chartType, setChartType] = useState('expense');

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-3xl font-bold text-white">Analytics</h2>
        <p className="text-slate-400 mt-1">Insights and trends from your financial data</p>
      </header>

      {/* Summary Insights */}
      <SummaryInsights />

      {/* Spending by Category */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Spending by Category</h3>
          <div className="flex gap-2 bg-slate-800 p-1 rounded-lg">
            {['expense', 'income'].map((type) => (
              <button
                key={type}
                onClick={() => setChartType(type)}
                className={clsx(
                  'px-4 py-2 rounded-md text-sm font-medium transition-all capitalize',
                  chartType === type
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
        <CategoryPieChart type={chartType} />
      </div>

      {/* Income vs Expense Trend */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">Income vs Expense Trend</h3>
        <p className="text-sm text-slate-400 mb-4">Last 6 months comparison</p>
        <TrendLineChart />
      </div>
    </div>
  );
}
