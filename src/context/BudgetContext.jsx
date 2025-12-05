import { format, startOfMonth } from 'date-fns';
import PropTypes from 'prop-types';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from './ToastContext';

const BudgetContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useBudget = () => useContext(BudgetContext);

export const BudgetProvider = ({ children }) => {
    const { showToast } = useToast();
    const [budgets, setBudgets] = useState(() => {
        const saved = localStorage.getItem('financial_moo_budgets');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('financial_moo_budgets', JSON.stringify(budgets));
    }, [budgets]);

    const addBudget = (budgetData) => {
        const currentMonth = format(startOfMonth(new Date()), 'yyyy-MM');
        const newBudget = {
            id: uuidv4(),
            ...budgetData,
            limit: parseFloat(budgetData.limit),
            spent: 0,
            month: currentMonth,
            alertThreshold: budgetData.alertThreshold || 80,
            status: 'safe'
        };
        setBudgets(prev => [...prev, newBudget]);
        showToast(`Budget for "${budgetData.category}" set`, 'success');
    };

    const updateBudget = (id, updates) => {
        setBudgets(prev => prev.map(budget =>
            budget.id === id ? { ...budget, ...updates } : budget
        ));
        showToast('Budget updated', 'success');
    };

    const deleteBudget = (id) => {
        setBudgets(prev => prev.filter(b => b.id !== id));
        showToast('Budget deleted', 'success');
    };

    const updateSpent = useCallback((category, amount) => {
        const currentMonth = format(startOfMonth(new Date()), 'yyyy-MM');
        setBudgets(prev => prev.map(budget => {
            if (budget.category === category && budget.month === currentMonth) {
                const newSpent = budget.spent + amount;
                const percentage = (newSpent / budget.limit) * 100;

                let status = 'safe';
                if (newSpent >= budget.limit) status = 'exceeded';
                else if (percentage >= budget.alertThreshold) status = 'warning';

                return { ...budget, spent: newSpent, status };
            }
            return budget;
        }));
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
            addBudget,
            updateBudget,
            deleteBudget,
            updateSpent,
            getBudgetByCategory,
            getCurrentMonthBudgets
        }}>
            {children}
        </BudgetContext.Provider>
    );
};

BudgetProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
