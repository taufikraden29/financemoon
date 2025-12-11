'use client';

import { addDays, addMonths, addWeeks, addYears, format, isBefore, isToday, parseISO } from 'date-fns';
import PropTypes from 'prop-types';
import { createContext, useContext, useEffect, useState } from 'react';
import { recurringService } from '@/services/supabase';
import { useAccount } from './AccountContext';
import { useActivity } from './ActivityContext';
import { useBudget } from './BudgetContext';
import { useFinance } from './FinanceContext';
import { useToast } from './ToastContext';

const RecurringTransactionContext = createContext();

export const useRecurring = () => {
    const context = useContext(RecurringTransactionContext);
    if (!context) {
        throw new Error('useRecurring must be used within RecurringTransactionProvider');
    }
    return context;
};

export const RecurringTransactionProvider = ({ children }) => {
    const [recurringTransactions, setRecurringTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { showToast } = useToast();
    const { addTransaction } = useFinance();
    const { updateBalance } = useAccount();
    const { updateSpent } = useBudget();
    const { logActivity } = useActivity();

    // Load from Supabase on mount
    useEffect(() => {
        loadRecurring();
    }, []);

    // Auto-generate on data change
    useEffect(() => {
        if (recurringTransactions.length > 0) {
            generateDueTransactions();

            const interval = setInterval(() => {
                generateDueTransactions();
            }, 1000 * 60 * 60); // Check every hour

            return () => clearInterval(interval);
        }
    }, [recurringTransactions]);

    const loadRecurring = async () => {
        try {
            setLoading(true);
            const data = await recurringService.getAll();
            setRecurringTransactions(data);
        } catch (err) {
            console.error('Error loading recurring:', err);
            setError(err.message);
            // Fallback to localStorage
            const stored = localStorage.getItem('financial_moo_recurring');
            if (stored) setRecurringTransactions(JSON.parse(stored));
        } finally {
            setLoading(false);
        }
    };

    // Calculate next occurrence based on recurrence type
    const calculateNextOccurrence = (recurring) => {
        const current = recurring.nextOccurrence ? parseISO(recurring.nextOccurrence) : parseISO(recurring.startDate);

        switch (recurring.recurrence) {
            case 'daily':
                return format(addDays(current, 1), 'yyyy-MM-dd');
            case 'weekly':
                return format(addWeeks(current, 1), 'yyyy-MM-dd');
            case 'monthly':
                return format(addMonths(current, 1), 'yyyy-MM-dd');
            case 'yearly':
                return format(addYears(current, 1), 'yyyy-MM-dd');
            default:
                return format(addMonths(current, 1), 'yyyy-MM-dd');
        }
    };

    // Generate transactions that are due
    const generateDueTransactions = async () => {
        const today = new Date();

        for (const recurring of recurringTransactions.filter(r => r.isActive)) {
            const nextDate = parseISO(recurring.nextOccurrence);

            // If next occurrence is today or past
            if (isBefore(nextDate, today) || isToday(nextDate)) {
                // Check if end date is set and passed
                if (recurring.endDate && isBefore(parseISO(recurring.endDate), today)) {
                    continue;
                }

                // Create transaction
                const transaction = {
                    type: recurring.type,
                    amount: recurring.amount,
                    description: recurring.name,
                    category: recurring.category,
                    accountId: recurring.accountId,
                    date: format(nextDate, 'yyyy-MM-dd'),
                    recurringId: recurring.id,
                    isFromRecurring: true
                };

                await addTransaction(transaction);

                // Update account balance if linked
                if (recurring.accountId) {
                    if (recurring.type === 'income') {
                        await updateBalance(recurring.accountId, recurring.amount, 'add');
                    } else {
                        await updateBalance(recurring.accountId, recurring.amount, 'subtract');
                    }
                }

                // Update budget if expense
                if (recurring.type === 'expense') {
                    await updateSpent(recurring.category, recurring.amount);
                }

                // Log activity
                logActivity(
                    'recurring_generated',
                    `Auto-generated: ${recurring.name}`,
                    recurring.amount,
                    { recurringId: recurring.id }
                );

                // Update next occurrence
                const newNext = calculateNextOccurrence(recurring);
                await updateRecurring(recurring.id, {
                    lastGenerated: format(today, 'yyyy-MM-dd'),
                    nextOccurrence: newNext
                });

                showToast(`Auto-generated: ${recurring.name}`, 'success');
            }
        }
    };

    // Add new recurring transaction
    const addRecurring = async (data) => {
        try {
            const newRecurring = await recurringService.add(data);
            setRecurringTransactions(prev => [...prev, newRecurring]);
            showToast('Recurring transaction created', 'success');
            return newRecurring;
        } catch (err) {
            console.error('Error adding recurring:', err);
            showToast('Failed to create recurring transaction', 'error');
            return null;
        }
    };

    // Update recurring transaction
    const updateRecurring = async (id, updates) => {
        try {
            const updated = await recurringService.update(id, updates);
            setRecurringTransactions(prev =>
                prev.map(r => r.id === id ? updated : r)
            );
        } catch (err) {
            console.error('Error updating recurring:', err);
        }
    };

    // Delete recurring transaction
    const deleteRecurring = async (id) => {
        try {
            await recurringService.delete(id);
            setRecurringTransactions(prev => prev.filter(r => r.id !== id));
            showToast('Recurring transaction deleted', 'success');
        } catch (err) {
            console.error('Error deleting recurring:', err);
            showToast('Failed to delete recurring transaction', 'error');
        }
    };

    // Toggle active status
    const toggleActive = async (id) => {
        try {
            const updated = await recurringService.toggleActive(id);
            setRecurringTransactions(prev =>
                prev.map(r => r.id === id ? updated : r)
            );
        } catch (err) {
            console.error('Error toggling active:', err);
        }
    };

    // Get upcoming recurring transactions
    const getUpcoming = (days = 30) => {
        const futureDate = addDays(new Date(), days);

        return recurringTransactions
            .filter(r => r.isActive)
            .filter(r => {
                const next = parseISO(r.nextOccurrence);
                return isBefore(next, futureDate);
            })
            .sort((a, b) => new Date(a.nextOccurrence) - new Date(b.nextOccurrence));
    };

    // Get active recurring count
    const getActiveCount = () => {
        return recurringTransactions.filter(r => r.isActive).length;
    };

    // Get total monthly recurring expenses
    const getMonthlyTotal = () => {
        return recurringTransactions
            .filter(r => r.isActive && r.type === 'expense' && r.recurrence === 'monthly')
            .reduce((sum, r) => sum + r.amount, 0);
    };

    const value = {
        recurringTransactions,
        loading,
        error,
        addRecurring,
        updateRecurring,
        deleteRecurring,
        toggleActive,
        generateDueTransactions,
        getUpcoming,
        getActiveCount,
        getMonthlyTotal,
        calculateNextOccurrence,
        refreshRecurring: loadRecurring
    };

    return (
        <RecurringTransactionContext.Provider value={value}>
            {children}
        </RecurringTransactionContext.Provider>
    );
};

RecurringTransactionProvider.propTypes = {
    children: PropTypes.node.isRequired
};
