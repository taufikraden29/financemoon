import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import ToastContainer from './components/ToastContainer';
import { AccountProvider } from './context/AccountContext';
import { ActivityProvider } from './context/ActivityContext';
import { AuthProvider } from './context/AuthContext';
import { BudgetProvider } from './context/BudgetContext';
import { DebtProvider } from './context/DebtContext';
import { FinanceProvider } from './context/FinanceContext';
import { RecurringTransactionProvider } from './context/RecurringTransactionContext';
import { SavingsProvider } from './context/SavingsContext';
import { ToastProvider } from './context/ToastContext';
import Accounts from './pages/Accounts';
import Analytics from './pages/Analytics';
import Budgets from './pages/Budgets';
import Dashboard from './pages/Dashboard';
import Debts from './pages/Debts';
import Login from './pages/Login';
import RecurringTransactions from './pages/RecurringTransactions';
import Transactions from './pages/Transactions';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <ActivityProvider>
                    <AccountProvider>
                      <BudgetProvider>
                        <SavingsProvider>
                          <FinanceProvider>
                            <RecurringTransactionProvider>
                              <DebtProvider>
                                <Layout />
                              </DebtProvider>
                            </RecurringTransactionProvider>
                          </FinanceProvider>
                        </SavingsProvider>
                      </BudgetProvider>
                    </AccountProvider>
                  </ActivityProvider>
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="recurring" element={<RecurringTransactions />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="debts" element={<Debts />} />
              <Route path="accounts" element={<Accounts />} />
              <Route path="budgets" element={<Budgets />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <ToastContainer />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
