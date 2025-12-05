import PropTypes from 'prop-types';
import { createContext, useContext, useEffect, useState } from 'react';
import { checkDebtReminders } from '../services/reminderService';
import { debtService } from '../services/supabase';
import { useToast } from './ToastContext';

const DebtContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useDebt = () => useContext(DebtContext);

export const DebtProvider = ({ children }) => {
    const { showToast } = useToast();
    const [debts, setDebts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch debts on mount
    useEffect(() => {
        loadDebts();
    }, []);

    // Check debt reminders
    useEffect(() => {
        if (debts.length > 0) {
            checkDebtReminders(debts);

            const interval = setInterval(() => {
                checkDebtReminders(debts);
            }, 1000 * 60 * 60 * 24); // 24 hours

            return () => clearInterval(interval);
        }
    }, [debts]);

    const loadDebts = async () => {
        try {
            setLoading(true);
            const data = await debtService.getAll();
            setDebts(data);
        } catch (err) {
            console.error('Error loading debts:', err);
            setError(err.message);
            // Fallback to localStorage
            const saved = localStorage.getItem('financial_moo_debts');
            if (saved) setDebts(JSON.parse(saved));
        } finally {
            setLoading(false);
        }
    };

    const addDebt = async (debtData) => {
        try {
            const newDebt = await debtService.add(debtData);
            setDebts(prev => [newDebt, ...prev]);
            showToast(`Debt "${debtData.name}" added successfully`, 'success');
        } catch (err) {
            console.error('Error adding debt:', err);
            showToast('Failed to add debt', 'error');
        }
    };

    const markPayment = async (debtId, installmentNumber) => {
        try {
            await debtService.markPayment(debtId, installmentNumber);
            // Reload to get fresh data with status updates
            await loadDebts();
            showToast('Payment marked as paid', 'success');
        } catch (err) {
            console.error('Error marking payment:', err);
            showToast('Failed to mark payment', 'error');
        }
    };

    const unmarkPayment = async (debtId, installmentNumber) => {
        try {
            await debtService.unmarkPayment(debtId, installmentNumber);
            await loadDebts();
            showToast('Payment unmarked', 'info');
        } catch (err) {
            console.error('Error unmarking payment:', err);
            showToast('Failed to unmark payment', 'error');
        }
    };

    const deleteDebt = async (debtId) => {
        try {
            await debtService.delete(debtId);
            setDebts(prev => prev.filter(d => d.id !== debtId));
            showToast('Debt deleted', 'success');
        } catch (err) {
            console.error('Error deleting debt:', err);
            showToast('Failed to delete debt', 'error');
        }
    };

    const updateDebt = async (debtId, updateData) => {
        try {
            await debtService.update(debtId, updateData);
            await loadDebts(); // Reload to get fresh data
            showToast('Debt updated successfully', 'success');
        } catch (err) {
            console.error('Error updating debt:', err);
            showToast('Failed to update debt', 'error');
        }
    };

    const updatePaymentDueDate = async (debtId, installmentNumber, newDueDate) => {
        try {
            await debtService.updatePaymentDueDate(debtId, installmentNumber, newDueDate);
            // Don't reload here - we'll reload after all updates are done
        } catch (err) {
            console.error('Error updating payment due date:', err);
            showToast('Failed to update payment date', 'error');
            throw err;
        }
    };

    return (
        <DebtContext.Provider value={{
            debts,
            loading,
            error,
            addDebt,
            updateDebt,
            updatePaymentDueDate,
            markPayment,
            unmarkPayment,
            deleteDebt,
            refreshDebts: loadDebts
        }}>
            {children}
        </DebtContext.Provider>
    );
};

DebtProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
