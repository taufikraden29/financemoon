import PropTypes from 'prop-types';
import { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from './ToastContext';

const SavingsContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useSavings = () => useContext(SavingsContext);

export const SavingsProvider = ({ children }) => {
    const { showToast } = useToast();
    const [savings, setSavings] = useState(() => {
        const saved = localStorage.getItem('financial_moo_savings');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('financial_moo_savings', JSON.stringify(savings));
    }, [savings]);

    const addSavings = (savingsData) => {
        const newSavings = {
            id: uuidv4(),
            ...savingsData,
            targetAmount: parseFloat(savingsData.targetAmount),
            currentAmount: parseFloat(savingsData.initialContribution) || 0,
            contributions: savingsData.initialContribution ? [{
                id: uuidv4(),
                amount: parseFloat(savingsData.initialContribution),
                date: new Date().toISOString(),
                note: 'Initial contribution'
            }] : [],
            status: 'active',
            createdDate: new Date().toISOString()
        };
        setSavings(prev => [...prev, newSavings]);
        showToast(`Savings goal "${savingsData.name}" created`, 'success');
    };

    const addContribution = (savingsId, amount, note = '') => {
        setSavings(prev => prev.map(saving => {
            if (saving.id === savingsId) {
                const contribution = {
                    id: uuidv4(),
                    amount: parseFloat(amount),
                    date: new Date().toISOString(),
                    note
                };
                const newAmount = saving.currentAmount + parseFloat(amount);
                const status = newAmount >= saving.targetAmount ? 'completed' : 'active';

                return {
                    ...saving,
                    currentAmount: newAmount,
                    contributions: [...saving.contributions, contribution],
                    status
                };
            }
            return saving;
        }));
        showToast('Contribution added', 'success');
    };

    const deleteSavings = (id) => {
        setSavings(prev => prev.filter(s => s.id !== id));
        showToast('Savings goal deleted', 'success');
    };

    const updateSavings = (id, updates) => {
        setSavings(prev => prev.map(saving =>
            saving.id === id ? { ...saving, ...updates } : saving
        ));
        showToast('Savings goal updated', 'success');
    };

    const getTotalSaved = () => {
        return savings.reduce((sum, s) => sum + s.currentAmount, 0);
    };

    return (
        <SavingsContext.Provider value={{
            savings,
            addSavings,
            addContribution,
            deleteSavings,
            updateSavings,
            getTotalSaved
        }}>
            {children}
        </SavingsContext.Provider>
    );
};

SavingsProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
