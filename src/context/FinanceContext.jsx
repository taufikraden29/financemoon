import PropTypes from 'prop-types';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { transactionService } from '../services/supabase';
import { useToast } from './ToastContext';

const FinanceContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useFinance = () => useContext(FinanceContext);

export const FinanceProvider = ({ children }) => {
    const { showToast } = useToast();
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch transactions on mount
    useEffect(() => {
        loadTransactions();
    }, []);

    const loadTransactions = async () => {
        try {
            setLoading(true);
            const data = await transactionService.getAll();
            setTransactions(data);
        } catch (err) {
            console.error('Error loading transactions:', err);
            setError(err.message);
            // Fallback to localStorage
            const saved = localStorage.getItem('financial_moo_transactions');
            if (saved) setTransactions(JSON.parse(saved));
        } finally {
            setLoading(false);
        }
    };

    const addTransaction = useCallback(async (transaction) => {
        try {
            const newTransaction = await transactionService.add({
                ...transaction,
                date: transaction.date || new Date().toISOString(),
                amount: parseFloat(transaction.amount)
            });
            setTransactions(prev => [newTransaction, ...prev]);
            showToast('Transaction added successfully', 'success');
            return newTransaction;
        } catch (err) {
            console.error('Error adding transaction:', err);
            showToast('Failed to add transaction', 'error');
            return null;
        }
    }, [showToast]);

    const updateTransaction = async (id, updatedData) => {
        try {
            const updated = await transactionService.update(id, {
                ...updatedData,
                amount: parseFloat(updatedData.amount)
            });
            setTransactions(prev => prev.map(t => t.id === id ? updated : t));
            showToast('Transaction updated successfully', 'success');
        } catch (err) {
            console.error('Error updating transaction:', err);
            showToast('Failed to update transaction', 'error');
        }
    };

    const deleteTransaction = async (id) => {
        try {
            await transactionService.delete(id);
            setTransactions(prev => prev.filter(t => t.id !== id));
            showToast('Transaction deleted', 'success');
        } catch (err) {
            console.error('Error deleting transaction:', err);
            showToast('Failed to delete transaction', 'error');
        }
    };

    const getBalance = () => {
        // Only count transactions NOT linked to accounts (prevent double counting)
        return transactions
            .filter(t => !t.accountId)
            .reduce((acc, curr) => {
                return curr.type === 'income'
                    ? acc + curr.amount
                    : acc - curr.amount;
            }, 0);
    };

    const getIncome = () => {
        return transactions
            .filter(t => t.type === 'income' && !t.accountId)
            .reduce((acc, curr) => acc + curr.amount, 0);
    };

    const getExpense = () => {
        return transactions
            .filter(t => t.type === 'expense' && !t.accountId)
            .reduce((acc, curr) => acc + curr.amount, 0);
    };

    return (
        <FinanceContext.Provider value={{
            transactions,
            loading,
            error,
            addTransaction,
            updateTransaction,
            deleteTransaction,
            getBalance,
            getIncome,
            getExpense,
            refreshTransactions: loadTransactions
        }}>
            {children}
        </FinanceContext.Provider>
    );
};

FinanceProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
