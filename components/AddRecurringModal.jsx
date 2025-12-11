'use client';

import clsx from 'clsx';
import { format } from 'date-fns';
import { RefreshCw, X } from 'lucide-react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { getCategoriesByType } from '../constants/categories';
import { useAccounts } from '@/hooks/useAccounts';
import { useRecurring } from '@/hooks/useRecurring';
import CurrencyInput from './CurrencyInput';

const RECURRENCE_TYPES = [
    { value: 'daily', label: 'Daily', icon: '📅' },
    { value: 'weekly', label: 'Weekly', icon: '📆' },
    { value: 'monthly', label: 'Monthly', icon: '🗓️' },
    { value: 'yearly', label: 'Yearly', icon: '📊' }
];

const AddRecurringModal = ({ isOpen, onClose, editRecurring = null }) => {
    const { addRecurring, updateRecurring } = useRecurring();
    const { accounts } = useAccounts();

    const [formData, setFormData] = useState({
        name: '',
        type: 'expense',
        amount: '',
        category: 'General',
        accountId: '',
        recurrence: 'monthly',
        startDate: format(new Date(), 'yyyy-MM-dd'),
        endDate: '',
        dayOfMonth: 1,
        dayOfWeek: 1
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            if (editRecurring) {
                setFormData({
                    ...editRecurring,
                    amount: editRecurring.amount.toString()
                });
            } else {
                setFormData({
                    name: '',
                    type: 'expense',
                    amount: '',
                    category: 'General',
                    accountId: '',
                    recurrence: 'monthly',
                    startDate: format(new Date(), 'yyyy-MM-dd'),
                    endDate: '',
                    dayOfMonth: 1,
                    dayOfWeek: 1
                });
            }
            setErrors({});
        }
    }, [isOpen, editRecurring]);

    if (!isOpen) return null;

    const categories = getCategoriesByType(formData.type);

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            newErrors.amount = 'Amount must be greater than 0';
        }
        if (!formData.category) newErrors.category = 'Category is required';
        if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.startDate)) {
            newErrors.startDate = 'Valid start date required';
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

        const data = {
            ...formData,
            amount: parseFloat(formData.amount)
        };

        if (editRecurring) {
            updateRecurring(editRecurring.id, data);
        } else {
            addRecurring(data);
        }

        onClose();
    };

    const handleTypeChange = (newType) => {
        const newCategories = getCategoriesByType(newType);
        setFormData({
            ...formData,
            type: newType,
            category: newCategories[0].value
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-gradient-to-r from-purple-900/50 to-blue-900/50 sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                            <RefreshCw className="w-5 h-5 text-purple-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white">
                            {editRecurring ? 'Edit Recurring Transaction' : 'Add Recurring Transaction'}
                        </h3>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">Transaction Name *</label>
                        <input
                            type="text"
                            placeholder="e.g. Listrik PLN, Sewa Rumah, Netflix"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className={clsx(
                                "w-full bg-slate-800 border rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all",
                                errors.name ? "border-red-500 focus:ring-red-500" : "border-slate-700 focus:ring-purple-500"
                            )}
                            autoFocus
                        />
                        {errors.name && <p className="text-red-400 text-sm">{errors.name}</p>}
                    </div>

                    {/* Type Toggle */}
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

                    <div className="grid grid-cols-2 gap-4">
                        {/* Amount */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Amount (IDR) *</label>
                            <CurrencyInput
                                value={formData.amount}
                                onChange={(value) => setFormData({ ...formData, amount: value })}
                                placeholder="0"
                                error={errors.amount}
                            />
                            {errors.amount && <p className="text-red-400 text-sm">{errors.amount}</p>}
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Category *</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                            >
                                {categories.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Account (Optional) */}
                    {accounts.length > 0 && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">
                                Link to Account (Optional)
                            </label>
                            <select
                                value={formData.accountId}
                                onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                            >
                                <option value="">No account (manual tracking)</option>
                                {accounts.map(account => (
                                    <option key={account.id} value={account.id}>{account.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Recurrence Type */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">Recurrence *</label>
                        <div className="grid grid-cols-4 gap-2">
                            {RECURRENCE_TYPES.map((type) => (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, recurrence: type.value })}
                                    className={clsx(
                                        "p-3 rounded-xl border-2 transition-all text-center",
                                        formData.recurrence === type.value
                                            ? "border-purple-500 bg-purple-500/10 text-purple-400"
                                            : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600"
                                    )}
                                >
                                    <div className="text-2xl mb-1">{type.icon}</div>
                                    <span className="text-xs font-medium">{type.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Start Date */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">Start Date *</label>
                            <input
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                className={clsx(
                                    "w-full bg-slate-800 border rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 transition-all",
                                    errors.startDate ? "border-red-500 focus:ring-red-500" : "border-slate-700 focus:ring-purple-500"
                                )}
                            />
                            {errors.startDate && <p className="text-red-400 text-sm">{errors.startDate}</p>}
                        </div>

                        {/* End Date (Optional) */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400">End Date (Optional)</label>
                            <input
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                            />
                            <p className="text-xs text-slate-500">Leave empty for no end date</p>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg active:scale-[0.98] transition-all"
                    >
                        {editRecurring ? 'Update Recurring' : 'Create Recurring'}
                    </button>
                </form>
            </div>
        </div>
    );
};

AddRecurringModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    editRecurring: PropTypes.object
};

export default AddRecurringModal;


