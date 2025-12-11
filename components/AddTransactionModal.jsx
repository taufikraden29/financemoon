'use client';

import clsx from 'clsx';
import { X } from 'lucide-react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { getCategoriesByType } from '../constants/categories';
import { useAccounts } from '@/hooks/useAccounts';
import { useBudgets } from '@/hooks/useBudgets';
import { useTransactions } from '@/hooks/useTransactions';
import { validateTransaction } from '../utils/validation';
import CurrencyInput from './CurrencyInput';

const AddTransactionModal = ({ isOpen, onClose, editTransaction = null }) => {
    const { addTransaction, updateTransaction } = useTransactions();
    const { accounts, updateBalance } = useAccounts();
    const { updateSpent } = useBudgets();
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        type: 'expense',
        category: 'General',
        accountId: ''
    });
    const [errors, setErrors] = useState({});

    // Synchronize form with editTransaction - controlled by parent
    useEffect(() => {
        if (editTransaction) {
            setFormData({
                description: editTransaction.description,
                amount: editTransaction.amount.toString(),
                type: editTransaction.type,
                category: editTransaction.category,
                accountId: editTransaction.accountId || ''
            });
            setErrors({});
        } else if (isOpen) {
            // Reset for new transaction when modal opens
            setFormData({
                description: '',
                amount: '',
                type: 'expense',
                category: 'General',
                accountId: ''
            });
            setErrors({});
        }
        // Intentionally only depend on what we need
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editTransaction, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate
        const validation = validateTransaction(formData);
        if (!validation.valid) {
            setErrors(validation.errors);
            return;
        }

        // Clear errors and submit
        setErrors({});

        const transactionData = {
            description: formData.description,
            amount: parseFloat(formData.amount),
            type: formData.type,
            category: formData.category,
            accountId: formData.accountId
        };

        // Update account balance if account selected and not editing
        if (formData.accountId && !editTransaction) {
            const amount = parseFloat(formData.amount);
            if (formData.type === 'income') {
                updateBalance(formData.accountId, amount, 'add');
            } else {
                updateBalance(formData.accountId, amount, 'subtract');
            }
        }

        // Update budget spending if expense and not editing
        if (formData.type === 'expense' && !editTransaction) {
            const amount = parseFloat(formData.amount);
            updateSpent(formData.category, amount);
        }

        if (editTransaction) {
            // Rollback old transaction effects first
            if (editTransaction.accountId) {
                if (editTransaction.type === 'income') {
                    updateBalance(editTransaction.accountId, editTransaction.amount, 'subtract');
                } else {
                    updateBalance(editTransaction.accountId, editTransaction.amount, 'add');
                }
            }
            if (editTransaction.type === 'expense') {
                updateSpent(editTransaction.category, -editTransaction.amount);
            }

            // Apply new transaction effects
            if (transactionData.accountId) {
                if (transactionData.type === 'income') {
                    updateBalance(transactionData.accountId, transactionData.amount, 'add');
                } else {
                    updateBalance(transactionData.accountId, transactionData.amount, 'subtract');
                }
            }
            if (transactionData.type === 'expense') {
                updateSpent(transactionData.category, transactionData.amount);
            }

            updateTransaction(editTransaction.id, transactionData);
        } else {
            addTransaction(transactionData);
        }

        setFormData({ description: '', amount: '', type: 'expense', category: 'General', accountId: '' });
        onClose();
    };

    const handleTypeChange = (newType) => {
        const categories = getCategoriesByType(newType);
        setFormData({
            ...formData,
            type: newType,
            category: categories[0].value // Reset to first category of new type
        });
    };

    const categories = getCategoriesByType(formData.type);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                    <h3 className="text-xl font-bold text-white">
                        {editTransaction ? 'Edit Transaction' : 'Add New Transaction'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="flex gap-2 p-1 bg-slate-800 rounded-lg">
                        {['expense', 'income'].map((t) => (
                            <button
                                type="button"
                                key={t}
                                onClick={() => handleTypeChange(t)}
                                className={clsx(
                                    "flex-1 py-2 text-sm font-medium rounded-md transition-all capitalize",
                                    formData.type === t
                                        ? t === 'income' ? "bg-green-600 text-white shadow" : "bg-red-600 text-white shadow"
                                        : "text-slate-400 hover:text-slate-200"
                                )}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">Amount (IDR)</label>
                        <CurrencyInput
                            value={formData.amount}
                            onChange={(value) => setFormData({ ...formData, amount: value })}
                            placeholder="0"
                            error={errors.amount}
                            autoFocus
                        />
                        {errors.amount && (
                            <p className="text-red-400 text-sm mt-1">{errors.amount}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">Description</label>
                        <input
                            type="text"
                            placeholder="e.g. Nasi Goreng"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className={clsx(
                                "w-full bg-slate-800 border rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all",
                                errors.description ? "border-red-500 focus:ring-red-500" : "border-slate-700 focus:ring-blue-500"
                            )}
                        />
                        {errors.description && (
                            <p className="text-red-400 text-sm mt-1">{errors.description}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">Category</label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none"
                        >
                            {categories.map(cat => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Account Selector */}
                    {accounts.length > 0 && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">
                                Account {formData.type === 'income' ? '(add to)' : '(deduct from)'} (Optional)
                            </label>
                            <select
                                value={formData.accountId}
                                onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            >
                                <option value="">No account selected</option>
                                {accounts.map(account => (
                                    <option key={account.id} value={account.id}>
                                        {account.name} - {new Intl.NumberFormat('id-ID', {
                                            style: 'currency',
                                            currency: 'IDR',
                                            minimumFractionDigits: 0
                                        }).format(account.balance)}
                                    </option>
                                ))}
                            </select>
                            {formData.accountId && (
                                <p className="text-xs text-slate-400">
                                    {formData.type === 'income'
                                        ? '✓ Balance will increase'
                                        : '⚠ Balance will decrease'}
                                </p>
                            )}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-all mt-4"
                    >
                        {editTransaction ? 'Update Transaction' : 'Save Transaction'}
                    </button>
                </form>
            </div>
        </div>
    );
};

AddTransactionModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    editTransaction: PropTypes.object,
};

export default AddTransactionModal;


