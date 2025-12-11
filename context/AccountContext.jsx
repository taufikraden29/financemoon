'use client';

import PropTypes from 'prop-types';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { accountService } from '@/services/supabase';
import { useToast } from './ToastContext';

const AccountContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAccount = () => useContext(AccountContext);

const DEFAULT_ACCOUNTS = [
    { name: 'Cash', type: 'cash', balance: 0, icon: 'Wallet', color: 'green', isActive: true },
    { name: 'Bank Account', type: 'bank', balance: 0, icon: 'Building2', color: 'blue', isActive: true },
    { name: 'E-Wallet', type: 'ewallet', balance: 0, icon: 'Smartphone', color: 'purple', isActive: true },
];

export const AccountProvider = ({ children }) => {
    const { showToast } = useToast();
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch accounts on mount
    useEffect(() => {
        loadAccounts();
    }, []);

    const loadAccounts = async () => {
        try {
            setLoading(true);
            const data = await accountService.getAll();

            // If no accounts, create defaults
            if (data.length === 0) {
                for (const defaultAcc of DEFAULT_ACCOUNTS) {
                    await accountService.add(defaultAcc);
                }
                const newData = await accountService.getAll();
                setAccounts(newData);
            } else {
                setAccounts(data);
            }
        } catch (err) {
            console.error('Error loading accounts:', err);
            setError(err.message);
            // Fallback to localStorage if Supabase fails
            const saved = localStorage.getItem('financial_moo_accounts');
            if (saved) setAccounts(JSON.parse(saved));
        } finally {
            setLoading(false);
        }
    };

    const addAccount = async (accountData) => {
        try {
            const newAccount = await accountService.add(accountData);
            setAccounts(prev => [...prev, newAccount]);
            showToast(`Account "${accountData.name}" added`, 'success');
        } catch (err) {
            console.error('Error adding account:', err);
            showToast('Failed to add account', 'error');
        }
    };

    const updateAccount = async (id, updates) => {
        try {
            const updated = await accountService.update(id, updates);
            setAccounts(prev => prev.map(acc => acc.id === id ? updated : acc));
            showToast('Account updated', 'success');
        } catch (err) {
            console.error('Error updating account:', err);
            showToast('Failed to update account', 'error');
        }
    };

    const deleteAccount = async (id) => {
        try {
            await accountService.delete(id);
            setAccounts(prev => prev.filter(acc => acc.id !== id));
            showToast('Account deleted', 'success');
        } catch (err) {
            console.error('Error deleting account:', err);
            showToast('Failed to delete account', 'error');
        }
    };

    const updateBalance = useCallback(async (accountId, amount, operation = 'add') => {
        try {
            const updated = await accountService.updateBalance(accountId, amount, operation);
            setAccounts(prev => prev.map(acc => acc.id === accountId ? updated : acc));
        } catch (err) {
            console.error('Error updating balance:', err);
        }
    }, []);

    const transfer = async (fromId, toId, amount) => {
        try {
            await accountService.transfer(fromId, toId, amount);
            // Reload to get fresh data
            await loadAccounts();
            showToast('Transfer completed', 'success');
        } catch (err) {
            console.error('Error transferring:', err);
            showToast('Failed to transfer', 'error');
        }
    };

    const getTotalBalance = () => {
        return accounts
            .filter(acc => acc.isActive)
            .reduce((sum, acc) => sum + acc.balance, 0);
    };

    const getAccountById = (id) => {
        return accounts.find(acc => acc.id === id);
    };

    return (
        <AccountContext.Provider value={{
            accounts,
            loading,
            error,
            addAccount,
            updateAccount,
            deleteAccount,
            updateBalance,
            transfer,
            getTotalBalance,
            getAccountById,
            refreshAccounts: loadAccounts
        }}>
            {children}
        </AccountContext.Provider>
    );
};

AccountProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
