'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ActivityProvider } from '@/context/ActivityContext';
import { AccountProvider } from '@/context/AccountContext';
import { BudgetProvider } from '@/context/BudgetContext';
import { SavingsProvider } from '@/context/SavingsContext';
import { FinanceProvider } from '@/context/FinanceContext';
import { RecurringTransactionProvider } from '@/context/RecurringTransactionContext';
import { DebtProvider } from '@/context/DebtContext';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import FloatingCalculator from '@/components/FloatingCalculator';

export default function DashboardLayout({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <ActivityProvider>
      <AccountProvider>
        <BudgetProvider>
          <SavingsProvider>
            <FinanceProvider>
              <RecurringTransactionProvider>
                <DebtProvider>
                  <div className="min-h-screen bg-slate-950">
                    <MobileNav
                      onMenuClick={() => setIsSidebarOpen(true)}
                      isSidebarOpen={isSidebarOpen}
                      onCloseSidebar={() => setIsSidebarOpen(false)}
                    />
                    <Sidebar
                      isOpen={isSidebarOpen}
                      onClose={() => setIsSidebarOpen(false)}
                    />
                    <main className="md:ml-64 min-h-screen p-8 pt-20 md:pt-8 transition-all duration-300">
                      <div className="max-w-7xl mx-auto space-y-8">
                        {children}
                      </div>
                    </main>
                    <FloatingCalculator />
                  </div>
                </DebtProvider>
              </RecurringTransactionProvider>
            </FinanceProvider>
          </SavingsProvider>
        </BudgetProvider>
      </AccountProvider>
    </ActivityProvider>
  );
}
