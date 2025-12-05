import PropTypes from 'prop-types';
import { createContext, useContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from './ToastContext';

const AccountContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAccount = () => useContext(AccountContext);

const DEFAULT_ACCOUNTS = [
    { id: uuidv4(), name: 'Cash', type: 'cash', balance: 0, icon: 'Wallet', color: 'green', isActive: true },
    { id: uuidv4(), name: 'Bank Account', type: 'bank', balance: 0, icon: 'Building2', color: 'blue', isActive: true },
    { id: uuidv4(), name: 'E-Wallet', type: 'ewallet', balance: 0, icon: 'Smartphone', color: 'purple', isActive: true },
];

export const AccountProvider = ({ children }) => {
    const { showToast } = useToast();
    const [accounts, setAccounts] = useState(() => {
        const saved = localStorage.getItem('financial_moo_accounts');
        return saved ? JSON.parse(saved) : DEFAULT_ACCOUNTS;
    });

    useEffect(() => {
        localStorage.setItem('financial_moo_accounts', JSON.stringify(accounts));
    }, [accounts]);

    const addAccount = (accountData) => {
        const newAccount = {
            id: uuidv4(),
            ...accountData,
            balance: parseFloat(accountData.balance) || 0,
            isActive: true
        };
        setAccounts(prev => [...prev, newAccount]);
        showToast(`Account "${accountData.name}" added`, 'success');
    };

    const updateAccount = (id, updates) => {
        setAccounts(prev => prev.map(acc =>
            acc.id === id ? { ...acc, ...updates } : acc
        ));
        showToast('Account updated', 'success');
    };

    const deleteAccount = (id) => {
        setAccounts(prev => prev.filter(acc => acc.id !== id));
        showToast('Account deleted', 'success');
    };

    const updateBalance = (accountId, amount, operation = 'add') => {
        setAccounts(prev => prev.map(acc => {
            if (acc.id === accountId) {
                const newBalance = operation === 'add'
                    ? acc.balance + amount
                    : acc.balance - amount;
                return { ...acc, balance: newBalance };
            }
            return acc;
        }));
    };

    const transfer = (fromId, toId, amount) => {
        setAccounts(prev => prev.map(acc => {
            if (acc.id === fromId) {
                return { ...acc, balance: acc.balance - amount };
            }
            if (acc.id === toId) {
                return { ...acc, balance: acc.balance + amount };
            }
            return acc;
        }));
        showToast('Transfer completed', 'success');
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
            addAccount,
            updateAccount,
            deleteAccount,
            updateBalance,
            transfer,
            getTotalBalance,
            getAccountById
        }}>
            {children}
        </AccountContext.Provider>
    );
};

AccountProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
