import PropTypes from 'prop-types';
import { createContext, useContext, useEffect, useState } from 'react';
import { savingsService } from '../services/supabase';
import { useToast } from './ToastContext';

const SavingsContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useSavings = () => useContext(SavingsContext);

export const SavingsProvider = ({ children }) => {
    const { showToast } = useToast();
    const [savings, setSavings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch savings on mount
    useEffect(() => {
        loadSavings();
    }, []);

    const loadSavings = async () => {
        try {
            setLoading(true);
            const data = await savingsService.getAll();
            setSavings(data);
        } catch (err) {
            console.error('Error loading savings:', err);
            setError(err.message);
            // Fallback to localStorage
            const saved = localStorage.getItem('financial_moo_savings');
            if (saved) setSavings(JSON.parse(saved));
        } finally {
            setLoading(false);
        }
    };

    const addSavings = async (savingsData) => {
        try {
            const newSavings = await savingsService.add(savingsData);
            setSavings(prev => [...prev, newSavings]);
            showToast(`Savings goal "${savingsData.name}" created`, 'success');
        } catch (err) {
            console.error('Error adding savings:', err);
            showToast('Failed to create savings goal', 'error');
        }
    };

    const addContribution = async (savingsId, amount, note = '') => {
        try {
            await savingsService.addContribution(savingsId, amount, note);
            // Reload to get updated amounts
            await loadSavings();
            showToast('Contribution added', 'success');
        } catch (err) {
            console.error('Error adding contribution:', err);
            showToast('Failed to add contribution', 'error');
        }
    };

    const deleteSavings = async (id) => {
        try {
            await savingsService.delete(id);
            setSavings(prev => prev.filter(s => s.id !== id));
            showToast('Savings goal deleted', 'success');
        } catch (err) {
            console.error('Error deleting savings:', err);
            showToast('Failed to delete savings goal', 'error');
        }
    };

    const updateSavings = async (id, updates) => {
        try {
            const updated = await savingsService.update(id, updates);
            setSavings(prev => prev.map(saving =>
                saving.id === id ? { ...saving, ...updated } : saving
            ));
            showToast('Savings goal updated', 'success');
        } catch (err) {
            console.error('Error updating savings:', err);
            showToast('Failed to update savings goal', 'error');
        }
    };

    const getTotalSaved = () => {
        return savings.reduce((sum, s) => sum + s.currentAmount, 0);
    };

    return (
        <SavingsContext.Provider value={{
            savings,
            loading,
            error,
            addSavings,
            addContribution,
            deleteSavings,
            updateSavings,
            getTotalSaved,
            refreshSavings: loadSavings
        }}>
            {children}
        </SavingsContext.Provider>
    );
};

SavingsProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
