'use client';

import clsx from 'clsx';
import { format } from 'date-fns';
import { CheckCircle, Circle, X } from 'lucide-react';
import PropTypes from 'prop-types';
import { useDebts } from '@/hooks/useDebts';
import { calculateProgress, getRemainingBalance, getTotalPaid } from '../utils/debtHelpers';

const DebtDetailModal = ({ debt, isOpen, onClose }) => {
    const { markPayment, unmarkPayment } = useDebts();

    if (!isOpen || !debt) return null;

    const progress = calculateProgress(debt.payments);
    const totalPaid = getTotalPaid(debt.payments);
    const remaining = getRemainingBalance(debt.totalAmount, debt.payments);

    const handleTogglePayment = (payment) => {
        if (payment.paid) {
            unmarkPayment(debt.id, payment.installmentNumber);
        } else {
            markPayment(debt.id, payment.installmentNumber);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-slate-800 flex justify-between items-start bg-slate-900/50">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-1">{debt.name}</h3>
                        <p className="text-sm text-slate-400">Installment Payment Details</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-6 space-y-5 overflow-y-auto flex-1">
                    {/* Summary */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-slate-800/50 rounded-xl p-4">
                            <p className="text-xs text-slate-400 mb-1">Total Debt</p>
                            <p className="text-lg font-bold text-white">
                                {new Intl.NumberFormat('id-ID', {
                                    style: 'currency',
                                    currency: 'IDR',
                                    minimumFractionDigits: 0
                                }).format(debt.totalAmount)}
                            </p>
                        </div>
                        <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/30">
                            <p className="text-xs text-green-400 mb-1">Paid</p>
                            <p className="text-lg font-bold text-green-400">
                                {new Intl.NumberFormat('id-ID', {
                                    style: 'currency',
                                    currency: 'IDR',
                                    minimumFractionDigits: 0
                                }).format(totalPaid)}
                            </p>
                        </div>
                        <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/30">
                            <p className="text-xs text-blue-400 mb-1">Remaining</p>
                            <p className="text-lg font-bold text-blue-400">
                                {new Intl.NumberFormat('id-ID', {
                                    style: 'currency',
                                    currency: 'IDR',
                                    minimumFractionDigits: 0
                                }).format(remaining)}
                            </p>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div>
                        <div className="flex justify-between text-sm text-slate-400 mb-2">
                            <span>Overall Progress</span>
                            <span className="font-medium">{progress.toFixed(1)}%</span>
                        </div>
                        <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500 rounded-full"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>

                    {/* Installment Schedule */}
                    <div>
                        <h4 className="text-sm font-semibold text-white mb-3">Installment Schedule</h4>
                        <div className="bg-slate-800/30 rounded-xl overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-700">
                                        <th className="text-left p-3 text-xs font-semibold text-slate-400 uppercase">#</th>
                                        <th className="text-left p-3 text-xs font-semibold text-slate-400 uppercase">Amount</th>
                                        <th className="text-left p-3 text-xs font-semibold text-slate-400 uppercase">Status</th>
                                        <th className="text-left p-3 text-xs font-semibold text-slate-400 uppercase">Paid Date</th>
                                        <th className="text-right p-3 text-xs font-semibold text-slate-400 uppercase">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {debt.payments.map((payment) => (
                                        <tr
                                            key={payment.id}
                                            className={clsx(
                                                "hover:bg-slate-800/50 transition-colors",
                                                payment.paid && "bg-green-950/20"
                                            )}
                                        >
                                            <td className="p-3">
                                                <span className="text-sm font-medium text-white">
                                                    {payment.installmentNumber}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                <span className="text-sm text-white font-mono">
                                                    {new Intl.NumberFormat('id-ID', {
                                                        style: 'currency',
                                                        currency: 'IDR',
                                                        minimumFractionDigits: 0
                                                    }).format(payment.amount)}
                                                </span>
                                            </td>
                                            <td className="p-3">
                                                {payment.paid ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/30">
                                                        <CheckCircle className="w-3 h-3" />
                                                        Paid
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-slate-700 text-slate-400">
                                                        <Circle className="w-3 h-3" />
                                                        Unpaid
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                {payment.paidDate ? (
                                                    <span className="text-xs text-slate-400">
                                                        {format(new Date(payment.paidDate), 'dd MMM yyyy')}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-slate-600">-</span>
                                                )}
                                            </td>
                                            <td className="p-3 text-right">
                                                <button
                                                    onClick={() => handleTogglePayment(payment)}
                                                    className={clsx(
                                                        "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                                                        payment.paid
                                                            ? "bg-slate-700 hover:bg-slate-600 text-slate-300"
                                                            : "bg-green-600 hover:bg-green-500 text-white"
                                                    )}
                                                >
                                                    {payment.paid ? 'Undo' : 'Mark Paid'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

DebtDetailModal.propTypes = {
    debt: PropTypes.object,
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default DebtDetailModal;


