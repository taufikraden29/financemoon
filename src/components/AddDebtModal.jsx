import clsx from 'clsx';
import { X } from 'lucide-react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useDebt } from '../context/DebtContext';
import { calculateInstallment, validateDebt } from '../utils/debtHelpers';

const AddDebtModal = ({ isOpen, onClose }) => {
    const { addDebt } = useDebt();
    const [formData, setFormData] = useState({
        name: '',
        totalAmount: '',
        installments: ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            setFormData({ name: '', totalAmount: '', installments: '' });
            setErrors({});
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const perInstallment = calculateInstallment(
        parseFloat(formData.totalAmount) || 0,
        parseInt(formData.installments) || 0
    );

    const handleSubmit = (e) => {
        e.preventDefault();

        const validation = validateDebt(formData);
        if (!validation.valid) {
            setErrors(validation.errors);
            return;
        }

        setErrors({});
        addDebt(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                    <h3 className="text-xl font-bold text-white">Add New Debt</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
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
                            autoFocus
                        />
                        {errors.name && (
                            <p className="text-red-400 text-sm mt-1">{errors.name}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">Total Amount (IDR) *</label>
                        <input
                            type="number"
                            placeholder="0"
                            value={formData.totalAmount}
                            onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                            className={clsx(
                                "w-full bg-slate-800 border rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all font-mono text-lg",
                                errors.totalAmount ? "border-red-500 focus:ring-red-500" : "border-slate-700 focus:ring-blue-500"
                            )}
                        />
                        {errors.totalAmount && (
                            <p className="text-red-400 text-sm mt-1">{errors.totalAmount}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">Number of Installments *</label>
                        <input
                            type="number"
                            placeholder="e.g. 6"
                            min="1"
                            max="60"
                            value={formData.installments}
                            onChange={(e) => setFormData({ ...formData, installments: e.target.value })}
                            className={clsx(
                                "w-full bg-slate-800 border rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all",
                                errors.installments ? "border-red-500 focus:ring-red-500" : "border-slate-700 focus:ring-blue-500"
                            )}
                        />
                        {errors.installments && (
                            <p className="text-red-400 text-sm mt-1">{errors.installments}</p>
                        )}
                    </div>

                    {/* Preview Section */}
                    {formData.totalAmount && formData.installments && perInstallment > 0 && (
                        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5">
                                    <div className="p-2 bg-blue-500/20 rounded-lg">
                                        <span className="text-2xl">💡</span>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-blue-400 mb-2">Preview</p>
                                    <div className="space-y-1.5">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-400">Per Installment:</span>
                                            <span className="text-white font-bold">
                                                {new Intl.NumberFormat('id-ID', {
                                                    style: 'currency',
                                                    currency: 'IDR',
                                                    minimumFractionDigits: 0
                                                }).format(perInstallment)}
                                            </span>
                                        </div>
                                        <div className="text-xs text-slate-500 pt-2 border-t border-blue-500/20">
                                            You will pay <span className="text-blue-400 font-medium">{formData.installments}× </span>
                                            of <span className="text-blue-400 font-medium">
                                                {new Intl.NumberFormat('id-ID', {
                                                    style: 'currency',
                                                    currency: 'IDR',
                                                    minimumFractionDigits: 0
                                                }).format(perInstallment)}
                                            </span> each
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-all mt-4"
                    >
                        Create Debt
                    </button>
                </form>
            </div>
        </div>
    );
};

AddDebtModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default AddDebtModal;
