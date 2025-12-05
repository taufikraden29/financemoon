import PropTypes from 'prop-types';
import { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from './ToastContext';

const FinanceContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useFinance = () => useContext(FinanceContext);

export const FinanceProvider = ({ children }) => {
    const { showToast } = useToast();
    const [transactions, setTransactions] = useState(() => {
        const saved = localStorage.getItem('financial_moo_transactions');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('financial_moo_transactions', JSON.stringify(transactions));
    }, [transactions]);

    const addTransaction = (transaction) => {
        const newTransaction = {
            id: uuidv4(),
            date: new Date().toISOString(),
            ...transaction,
            amount: parseFloat(transaction.amount)
        };
        setTransactions(prev => [newTransaction, ...prev]);
        showToast('Transaction added successfully', 'success');
    };

    const updateTransaction = (id, updatedData) => {
        setTransactions(prev =>
            prev.map(t =>
                t.id === id
                    ? { ...t, ...updatedData, amount: parseFloat(updatedData.amount) }
                    : t
            )
        );
        showToast('Transaction updated successfully', 'success');
    };

    const deleteTransaction = (id) => {
        const transaction = transactions.find(t => t.id === id);

        if (!transaction) return;

        // Import contexts - we'll need to pass these as props or use directly
        // Rollback account balance if transaction was linked to an account
        // This will be handled by passing updateBalance and updateSpent from parent

        setTransactions(prev => prev.filter(t => t.id !== id));
        showToast('Transaction deleted', 'success');
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
            addTransaction,
            updateTransaction,
            deleteTransaction,
            getBalance,
            getIncome,
            getExpense
        }}>
            {children}
        </FinanceContext.Provider>
    );
};

FinanceProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
