import PropTypes from 'prop-types';
import { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { checkDebtReminders } from '../services/reminderService';
import { generatePaymentSchedule } from '../utils/debtHelpers';
import { useToast } from './ToastContext';

const DebtContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useDebt = () => useContext(DebtContext);

export const DebtProvider = ({ children }) => {
    const { showToast } = useToast();
    const [debts, setDebts] = useState(() => {
        const saved = localStorage.getItem('financial_moo_debts');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('financial_moo_debts', JSON.stringify(debts));
    }, [debts]);

    // Check debt reminders on mount and daily
    useEffect(() => {
        // Check immediately on load
        checkDebtReminders(debts);

        // Check every 24 hours
        const interval = setInterval(() => {
            checkDebtReminders(debts);
        }, 1000 * 60 * 60 * 24); // 24 hours

        return () => clearInterval(interval);
    }, [debts]);

    const addDebt = (debtData) => {
        const payments = generatePaymentSchedule(
            parseFloat(debtData.totalAmount),
            parseInt(debtData.installments)
        );

        const newDebt = {
            id: uuidv4(),
            name: debtData.name,
            totalAmount: parseFloat(debtData.totalAmount),
            installments: parseInt(debtData.installments),
            perInstallment: parseFloat(debtData.totalAmount) / parseInt(debtData.installments),
            payments,
            createdDate: new Date().toISOString(),
            status: 'active'
        };

        setDebts(prev => [newDebt, ...prev]);
        showToast(`Debt "${debtData.name}" added successfully`, 'success');
    };

    const markPayment = (debtId, installmentNumber) => {
        setDebts(prev => prev.map(debt => {
            if (debt.id === debtId) {
                const updatedPayments = debt.payments.map(payment => {
                    if (payment.installmentNumber === installmentNumber && !payment.paid) {
                        return {
                            ...payment,
                            paid: true,
                            paidDate: new Date().toISOString()
                        };
                    }
                    return payment;
                });

                const allPaid = updatedPayments.every(p => p.paid);

                return {
                    ...debt,
                    payments: updatedPayments,
                    status: allPaid ? 'completed' : 'active'
                };
            }
            return debt;
        }));

        showToast('Payment marked as paid', 'success');
    };

    const unmarkPayment = (debtId, installmentNumber) => {
        setDebts(prev => prev.map(debt => {
            if (debt.id === debtId) {
                const updatedPayments = debt.payments.map(payment => {
                    if (payment.installmentNumber === installmentNumber && payment.paid) {
                        return {
                            ...payment,
                            paid: false,
                            paidDate: null
                        };
                    }
                    return payment;
                });

                return {
                    ...debt,
                    payments: updatedPayments,
                    status: 'active'
                };
            }
            return debt;
        }));

        showToast('Payment unmarked', 'info');
    };

    const deleteDebt = (debtId) => {
        setDebts(prev => prev.filter(d => d.id !== debtId));
        showToast('Debt deleted', 'success');
    };

    return (
        <DebtContext.Provider value={{
            debts,
            addDebt,
            markPayment,
            unmarkPayment,
            deleteDebt
        }}>
            {children}
        </DebtContext.Provider>
    );
};

DebtProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
