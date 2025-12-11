'use client';

import { X } from 'lucide-react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { EXPENSE_CATEGORIES } from '../constants/categories';
import { useBudget } from '../context/BudgetContext';
import CurrencyInput from './CurrencyInput';

const AddBudgetModal = ({ isOpen, onClose, editBudget = null }) => {
    const { addBudget, updateBudget } = useBudget();
    const [formData, setFormData] = useState({
        category: 'Food',
        limit: '',
        alertThreshold: 80
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            if (editBudget) {
                setFormData({
                    category: editBudget.category,
                    limit: editBudget.limit.toString(),
                    alertThreshold: editBudget.alertThreshold
                });
            } else {
                setFormData({ category: 'Food', limit: '', alertThreshold: 80 });
            }
            setErrors({});
        }
    }, [isOpen, editBudget]);

    if (!isOpen) return null;

    const validate = () => {
        const newErrors = {};
        if (!formData.limit || parseFloat(formData.limit) <= 0) {
            newErrors.limit = 'Budget limit must be greater than 0';
        }
        if (formData.alertThreshold < 0 || formData.alertThreshold > 100) {
            newErrors.alertThreshold = 'Alert threshold must be between 0-100%';
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

        const budgetData = {
            category: formData.category,
            limit: parseFloat(formData.limit),
            alertThreshold: formData.alertThreshold
        };

        if (editBudget) {
            updateBudget(editBudget.id, budgetData);
        } else {
            addBudget(budgetData);
        }

        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-gradient-to-r from-amber-900/50 to-yellow-900/50">
                    <h3 className="text-xl font-bold text-white">
                        {editBudget ? 'Edit Budget' : 'Set Monthly Budget'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">Category *</label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                        >
                            {EXPENSE_CATEGORIES.map(cat => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">Monthly Limit (IDR) *</label>
                        <CurrencyInput
                            value={formData.limit}
                            onChange={(value) => setFormData({ ...formData, limit: value })}
                            placeholder="0"
                            error={errors.limit}
                            autoFocus
                        />
                        {errors.limit && <p className="text-red-400 text-sm">{errors.limit}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">
                            Alert Threshold ({formData.alertThreshold}%)
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={formData.alertThreshold}
                            onChange={(e) => setFormData({ ...formData, alertThreshold: parseInt(e.target.value) })}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                        />
                        <div className="flex justify-between text-xs text-slate-500">
                            <span>0%</span>
                            <span>{formData.alertThreshold}%</span>
                            <span>100%</span>
                        </div>
                        {errors.alertThreshold && <p className="text-red-400 text-sm">{errors.alertThreshold}</p>}
                        <p className="text-xs text-slate-500">
                            You'll see a warning when spending reaches this threshold
                        </p>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white font-bold py-3.5 rounded-xl shadow-lg active:scale-[0.98] transition-all"
                    >
                        {editBudget ? 'Update Budget' : 'Set Budget'}
                    </button>
                </form>
            </div>
        </div>
    );
};

AddBudgetModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    editBudget: PropTypes.object
};

export default AddBudgetModal;

