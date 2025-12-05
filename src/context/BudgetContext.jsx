import { format, startOfMonth } from 'date-fns';
import PropTypes from 'prop-types';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { budgetService } from '../services/supabase';
import { useToast } from './ToastContext';

const BudgetContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useBudget = () => useContext(BudgetContext);

export const BudgetProvider = ({ children }) => {
    const { showToast } = useToast();
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch budgets on mount
    useEffect(() => {
        loadBudgets();
    }, []);

    const loadBudgets = async () => {
        try {
            setLoading(true);
            const data = await budgetService.getAll();
            setBudgets(data);
        } catch (err) {
            console.error('Error loading budgets:', err);
            setError(err.message);
            // Fallback to localStorage
            const saved = localStorage.getItem('financial_moo_budgets');
            if (saved) setBudgets(JSON.parse(saved));
        } finally {
            setLoading(false);
        }
    };

    const addBudget = async (budgetData) => {
        try {
            const currentMonth = format(startOfMonth(new Date()), 'yyyy-MM');
            const newBudget = await budgetService.add({
                ...budgetData,
                limit: parseFloat(budgetData.limit),
                spent: 0,
                month: currentMonth,
                alertThreshold: budgetData.alertThreshold || 80,
                status: 'safe'
            });
            setBudgets(prev => [...prev, newBudget]);
            showToast(`Budget for "${budgetData.category}" set`, 'success');
        } catch (err) {
            console.error('Error adding budget:', err);
            showToast('Failed to add budget', 'error');
        }
    };

    const updateBudget = async (id, updates) => {
        try {
            const updated = await budgetService.update(id, updates);
            setBudgets(prev => prev.map(budget => budget.id === id ? updated : budget));
            showToast('Budget updated', 'success');
        } catch (err) {
            console.error('Error updating budget:', err);
            showToast('Failed to update budget', 'error');
        }
    };

    const deleteBudget = async (id) => {
        try {
            await budgetService.delete(id);
            setBudgets(prev => prev.filter(b => b.id !== id));
            showToast('Budget deleted', 'success');
        } catch (err) {
            console.error('Error deleting budget:', err);
            showToast('Failed to delete budget', 'error');
        }
    };

    const updateSpent = useCallback(async (category, amount) => {
        try {
            const currentMonth = format(startOfMonth(new Date()), 'yyyy-MM');
            const result = await budgetService.updateSpent(category, currentMonth, amount);
            if (result) {
                setBudgets(prev => prev.map(budget =>
                    budget.id === result.id ? result : budget
                ));
            }
        } catch (err) {
            console.error('Error updating spent:', err);
        }
    }, []);

    const getBudgetByCategory = (category) => {
        const currentMonth = format(startOfMonth(new Date()), 'yyyy-MM');
        return budgets.find(b => b.category === category && b.month === currentMonth);
    };

    const getCurrentMonthBudgets = () => {
        const currentMonth = format(startOfMonth(new Date()), 'yyyy-MM');
        return budgets.filter(b => b.month === currentMonth);
    };

    return (
        <BudgetContext.Provider value={{
            budgets,
            loading,
            error,
            addBudget,
            updateBudget,
            deleteBudget,
            updateSpent,
            getBudgetByCategory,
            getCurrentMonthBudgets,
            refreshBudgets: loadBudgets
        }}>
            {children}
        </BudgetContext.Provider>
    );
};

BudgetProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
