'use client';

import clsx from 'clsx';
import { addMonths, format, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Bell, Calendar, X } from 'lucide-react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useDebts } from '@/hooks/useDebts';
import CurrencyInput from './CurrencyInput';

const EditDebtModal = ({ debt, isOpen, onClose }) => {
    const { updateDebt, updatePaymentDueDate, refreshDebts } = useDebts();
    const [formData, setFormData] = useState({
        name: '',
        totalAmount: '',
        reminderDays: '3',
        firstDueDate: ''
    });
    const [generatedDates, setGeneratedDates] = useState([]);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && debt) {
            const firstPayment = debt.payments?.find(p => p.installmentNumber === 1);
            setFormData({
                name: debt.name || '',
                totalAmount: String(debt.totalAmount || ''),
                reminderDays: String(debt.reminderDays || '3'),
                firstDueDate: firstPayment?.dueDate || ''
            });
            // Generate preview
            if (firstPayment?.dueDate) {
                generateDates(firstPayment.dueDate, debt.installments);
            }
            setErrors({});
        }
    }, [isOpen, debt]);

    const generateDates = (startDate, count) => {
        if (!startDate) return;
        const dates = [];
        const start = parseISO(startDate);
        for (let i = 0; i < count; i++) {
            const date = addMonths(start, i);
            dates.push({
                installmentNumber: i + 1,
                dueDate: format(date, 'yyyy-MM-dd'),
                formatDate: format(date, 'd MMM yyyy', { locale: localeId })
            });
        }
        setGeneratedDates(dates);
    };

    const handleFirstDateChange = (newDate) => {
        setFormData(prev => ({ ...prev, firstDueDate: newDate }));
        if (newDate && debt) {
            generateDates(newDate, debt.installments);
        }
    };

    if (!isOpen || !debt) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = {};
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }
        if (!formData.totalAmount || parseFloat(formData.totalAmount) <= 0) {
            newErrors.totalAmount = 'Valid amount is required';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsSubmitting(true);
        try {
            // Update debt info
            await updateDebt(debt.id, {
                name: formData.name.trim(),
                totalAmount: parseFloat(formData.totalAmount),
                reminderDays: parseInt(formData.reminderDays)
            });

            // Update all payment due dates if first date changed
            const firstPayment = debt.payments?.find(p => p.installmentNumber === 1);
            if (formData.firstDueDate && firstPayment?.dueDate !== formData.firstDueDate) {
                for (const dateInfo of generatedDates) {
                    await updatePaymentDueDate(debt.id, dateInfo.installmentNumber, dateInfo.dueDate);
                }
            }

            await refreshDebts();
            onClose();
        } catch (error) {
            console.error('Failed to update debt:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                    <h3 className="text-xl font-bold text-white">Edit Debt</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">Debt Name *</label>
                        <input
                            type="text"
                            placeholder="e.g. Bank Loan"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className={clsx(
                                "w-full bg-slate-800 border rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all",
                                errors.name ? "border-red-500 focus:ring-red-500" : "border-slate-700 focus:ring-blue-500"
                            )}
                        />
                        {errors.name && (
                            <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">Total Amount (IDR) *</label>
                        <CurrencyInput
                            value={formData.totalAmount}
                            onChange={(value) => setFormData({ ...formData, totalAmount: value })}
                            placeholder="0"
                            error={errors.totalAmount}
                        />
                        {errors.totalAmount && (
                            <p className="text-red-400 text-sm mt-1">{errors.totalAmount}</p>
                        )}
                    </div>

                    {/* First Due Date - Auto Generate Others */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            First Payment Due Date
                        </label>
                        <input
                            type="date"
                            value={formData.firstDueDate}
                            onChange={(e) => handleFirstDateChange(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                        <p className="text-xs text-slate-500">
                            All other payment dates will be auto-generated monthly
                        </p>
                    </div>

                    {/* Preview Generated Dates */}
                    {generatedDates.length > 0 && (
                        <div className="bg-slate-800/50 rounded-xl p-4">
                            <p className="text-xs font-medium text-slate-400 mb-3">Payment Schedule Preview:</p>
                            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                                {generatedDates.map((date) => {
                                    const originalPayment = debt.payments?.find(p => p.installmentNumber === date.installmentNumber);
                                    return (
                                        <div key={date.installmentNumber} className="flex items-center gap-2 text-xs">
                                            <span className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold">
                                                {date.installmentNumber}
                                            </span>
                                            <span className={clsx(
                                                "text-slate-300",
                                                originalPayment?.paid && "line-through text-slate-500"
                                            )}>
                                                {date.formatDate}
                                            </span>
                                            {originalPayment?.paid && (
                                                <span className="text-green-400">✓</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                            <Bell className="w-4 h-4" />
                            Remind Before
                        </label>
                        <select
                            value={formData.reminderDays}
                            onChange={(e) => setFormData({ ...formData, reminderDays: e.target.value })}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        >
                            <option value="1">1 day before</option>
                            <option value="3">3 days before</option>
                            <option value="5">5 days before</option>
                            <option value="7">7 days before</option>
                        </select>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-all"
                        >
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

EditDebtModal.propTypes = {
    debt: PropTypes.object,
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default EditDebtModal;



