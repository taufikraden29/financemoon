import { addDays, addMonths, addWeeks, addYears, format, isBefore, isToday, parseISO } from 'date-fns';
import PropTypes from 'prop-types';
import { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
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
    const { showToast } = useToast();
    const { addTransaction } = useFinance();
    const { updateBalance } = useAccount();
    const { updateSpent } = useBudget();
    const { logActivity } = useActivity();

    // Load from localStorage
    useEffect(() => {
        const stored = localStorage.getItem('financial_moo_recurring');
        if (stored) {
            setRecurringTransactions(JSON.parse(stored));
        }
    }, []);

    // Save to localStorage
    useEffect(() => {
        localStorage.setItem('financial_moo_recurring', JSON.stringify(recurringTransactions));
    }, [recurringTransactions]);

    // Auto-generate on mount and date change
    useEffect(() => {
        generateDueTransactions();

        // Check daily for new transactions
        const interval = setInterval(() => {
            generateDueTransactions();
        }, 1000 * 60 * 60); // Check every hour

        return () => clearInterval(interval);
    }, [recurringTransactions]);

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
    const generateDueTransactions = () => {
        const today = new Date();

        recurringTransactions
            .filter(r => r.isActive)
            .forEach(recurring => {
                const nextDate = parseISO(recurring.nextOccurrence);

                // If next occurrence is today or past
                if (isBefore(nextDate, today) || isToday(nextDate)) {
                    // Check if end date is set and passed
                    if (recurring.endDate && isBefore(parseISO(recurring.endDate), today)) {
                        return; // Don't generate if past end date
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

                    addTransaction(transaction);

                    // Update account balance if linked
                    if (recurring.accountId) {
                        if (recurring.type === 'income') {
                            updateBalance(recurring.accountId, recurring.amount, 'add');
                        } else {
                            updateBalance(recurring.accountId, recurring.amount, 'subtract');
                        }
                    }

                    // Update budget if expense
                    if (recurring.type === 'expense') {
                        updateSpent(recurring.category, recurring.amount);
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
                    updateRecurring(recurring.id, {
                        lastGenerated: format(today, 'yyyy-MM-dd'),
                        nextOccurrence: newNext
                    });

                    showToast(`Auto-generated: ${recurring.name}`, 'success');
                }
            });
    };

    // Add new recurring transaction
    const addRecurring = (data) => {
        const newRecurring = {
            id: uuidv4(),
            ...data,
            isActive: true,
            lastGenerated: null,
            nextOccurrence: data.startDate,
            createdAt: new Date().toISOString()
        };

        setRecurringTransactions(prev => [...prev, newRecurring]);
        showToast('Recurring transaction created', 'success');
        return newRecurring;
    };

    // Update recurring transaction
    const updateRecurring = (id, updates) => {
        setRecurringTransactions(prev =>
            prev.map(r => r.id === id ? { ...r, ...updates } : r)
        );
    };

    // Delete recurring transaction
    const deleteRecurring = (id) => {
        setRecurringTransactions(prev => prev.filter(r => r.id !== id));
        showToast('Recurring transaction deleted', 'success');
    };

    // Toggle active status
    const toggleActive = (id) => {
        setRecurringTransactions(prev =>
            prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r)
        );
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
        addRecurring,
        updateRecurring,
        deleteRecurring,
        toggleActive,
        generateDueTransactions,
        getUpcoming,
        getActiveCount,
        getMonthlyTotal,
        calculateNextOccurrence
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
