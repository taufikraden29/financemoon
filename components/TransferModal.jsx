'use client';

import clsx from 'clsx';
import { ArrowRight, ArrowRightLeft, X } from 'lucide-react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useAccounts } from '@/hooks/useAccounts';
import { useActivities } from '@/hooks/useActivities';
import CurrencyInput from './CurrencyInput';

const TransferModal = ({ isOpen, onClose }) => {
    const { accounts, transfer } = useAccounts();
    const { logActivity } = useActivities();
    const [formData, setFormData] = useState({
        fromAccount: '',
        toAccount: '',
        amount: '',
        note: ''
    });
    const [errors, setErrors] = useState({});
    const [transferAll, setTransferAll] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setFormData({ fromAccount: '', toAccount: '', amount: '', note: '' });
            setErrors({});
            setTransferAll(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const fromAccountData = accounts.find(a => a.id === formData.fromAccount);
    const toAccountData = accounts.find(a => a.id === formData.toAccount);

    const handleTransferAllToggle = () => {
        if (!transferAll && fromAccountData) {
            setFormData({ ...formData, amount: fromAccountData.balance.toString() });
        } else {
            setFormData({ ...formData, amount: '' });
        }
        setTransferAll(!transferAll);
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.fromAccount) newErrors.fromAccount = 'Select source account';
        if (!formData.toAccount) newErrors.toAccount = 'Select destination account';
        if (formData.fromAccount === formData.toAccount) {
            newErrors.toAccount = 'Cannot transfer to same account';
        }

        const amount = parseFloat(formData.amount);
        if (!formData.amount || amount <= 0) {
            newErrors.amount = 'Amount must be greater than 0';
        } else if (fromAccountData && amount > fromAccountData.balance) {
            newErrors.amount = 'Insufficient balance';
        }

        return newErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const validationErrors = validate();

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        const amount = parseFloat(formData.amount);
        transfer(formData.fromAccount, formData.toAccount, amount);

        // Log activity
        logActivity('transfer', 'Transferred money between accounts', amount, {
            from: fromAccountData.name,
            to: toAccountData.name,
            note: formData.note
        });

        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-gradient-to-r from-blue-900/50 to-purple-900/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                            <ArrowRightLeft className="w-5 h-5 text-blue-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white">Transfer Between Accounts</h3>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* From Account */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">From Account *</label>
                        <select
                            value={formData.fromAccount}
                            onChange={(e) => {
                                setFormData({ ...formData, fromAccount: e.target.value });
                                if (transferAll) {
                                    const account = accounts.find(a => a.id === e.target.value);
                                    setFormData(prev => ({ ...prev, fromAccount: e.target.value, amount: account?.balance.toString() || '' }));
                                }
                            }}
                            className={clsx(
                                "w-full bg-slate-800 border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 transition-all",
                                errors.fromAccount ? "border-red-500 focus:ring-red-500" : "border-slate-700 focus:ring-blue-500"
                            )}
                        >
                            <option value="">Select source account...</option>
                            {accounts.map(account => (
                                <option key={account.id} value={account.id}>
                                    {account.name} - {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(account.balance)}
                                </option>
                            ))}
                        </select>
                        {errors.fromAccount && <p className="text-red-400 text-sm">{errors.fromAccount}</p>}
                    </div>

                    {/* Transfer Icon */}
                    <div className="flex justify-center">
                        <div className="p-3 bg-slate-800 rounded-full">
                            <ArrowRight className="w-6 h-6 text-blue-400" />
                        </div>
                    </div>

                    {/* To Account */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">To Account *</label>
                        <select
                            value={formData.toAccount}
                            onChange={(e) => setFormData({ ...formData, toAccount: e.target.value })}
                            className={clsx(
                                "w-full bg-slate-800 border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 transition-all",
                                errors.toAccount ? "border-red-500 focus:ring-red-500" : "border-slate-700 focus:ring-blue-500"
                            )}
                        >
                            <option value="">Select destination account...</option>
                            {accounts.filter(a => a.id !== formData.fromAccount).map(account => (
                                <option key={account.id} value={account.id}>
                                    {account.name} - {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(account.balance)}
                                </option>
                            ))}
                        </select>
                        {errors.toAccount && <p className="text-red-400 text-sm">{errors.toAccount}</p>}
                    </div>

                    {/* Amount */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-slate-400">Amount (IDR) *</label>
                            {fromAccountData && (
                                <button
                                    type="button"
                                    onClick={handleTransferAllToggle}
                                    className={clsx(
                                        "text-xs px-3 py-1.5 rounded-lg font-medium transition-all",
                                        transferAll
                                            ? "bg-blue-500 text-white"
                                            : "bg-slate-800 text-slate-400 hover:text-blue-400"
                                    )}
                                >
                                    Transfer All
                                </button>
                            )}
                        </div>
                        <CurrencyInput
                            value={formData.amount}
                            onChange={(value) => {
                                setFormData({ ...formData, amount: value });
                                setTransferAll(false);
                            }}
                            placeholder="0"
                            error={errors.amount}
                            disabled={transferAll}
                        />
                        {errors.amount && <p className="text-red-400 text-sm">{errors.amount}</p>}
                        {fromAccountData && formData.amount && (
                            <p className="text-sm text-slate-400">
                                Remaining: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(fromAccountData.balance - parseFloat(formData.amount || 0))}
                            </p>
                        )}
                    </div>

                    {/* Note */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">Note (Optional)</label>
                        <textarea
                            placeholder="Add a note for this transfer..."
                            value={formData.note}
                            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                            rows={3}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-xl shadow-lg active:scale-[0.98] transition-all"
                    >
                        Transfer Money
                    </button>
                </form>
            </div>
        </div>
    );
};

TransferModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired
};

export default TransferModal;


