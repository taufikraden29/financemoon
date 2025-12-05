import clsx from 'clsx';
import { CreditCard, Eye, Trash2 } from 'lucide-react';
import PropTypes from 'prop-types';
import { calculateProgress, getPaidCount, getRemainingBalance } from '../utils/debtHelpers';

const DebtCard = ({ debt, onViewDetails, onDelete }) => {
    const progress = calculateProgress(debt.payments);
    const remaining = getRemainingBalance(debt.totalAmount, debt.payments);
    const paidCount = getPaidCount(debt.payments);
    const isCompleted = debt.status === 'completed';

    return (
        <div className={clsx(
            "bg-slate-900 border rounded-2xl p-6 transition-all hover:border-slate-700",
            isCompleted ? "border-green-800/50 bg-green-950/20" : "border-slate-800"
        )}>
            <div className="flex items-start gap-3 mb-4">
                <div className={clsx(
                    "p-2.5 rounded-lg",
                    isCompleted ? "bg-green-500/10 text-green-400" : "bg-blue-500/10 text-blue-400"
                )}>
                    <CreditCard className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white mb-1 truncate">{debt.name}</h3>
                    {isCompleted && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/30">
                            ✓ Completed
                        </span>
                    )}
                </div>
            </div>

            <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                        <p className="text-slate-500 mb-0.5">Total Amount</p>
                        <p className="text-white font-semibold">
                            {new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                minimumFractionDigits: 0
                            }).format(debt.totalAmount)}
                        </p>
                    </div>
                    <div>
                        <p className="text-slate-500 mb-0.5">Per Installment</p>
                        <p className="text-white font-semibold">
                            {new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                minimumFractionDigits: 0
                            }).format(debt.perInstallment)}
                        </p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-2">
                        <span>Progress</span>
                        <span>{progress.toFixed(0)}%</span>
                    </div>
                    <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className={clsx(
                                "h-full transition-all duration-500 rounded-full",
                                isCompleted ? "bg-gradient-to-r from-green-500 to-emerald-500" : "bg-gradient-to-r from-blue-500 to-cyan-500"
                            )}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                    <div>
                        <p className="text-xs text-slate-500">Paid</p>
                        <p className="text-sm font-bold text-white">
                            {paidCount} of {debt.installments}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-slate-500">Remaining</p>
                        <p className={clsx(
                            "text-sm font-bold",
                            isCompleted ? "text-green-400" : "text-blue-400"
                        )}>
                            {new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0
                            }).format(remaining)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex gap-2 mt-5 pt-5 border-t border-slate-800">
                <button
                    onClick={() => onViewDetails(debt)}
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-all"
                >
                    <Eye className="w-4 h-4" />
                    View Details
                </button>
                <button
                    onClick={() => onDelete(debt.id)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white rounded-lg transition-all"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

DebtCard.propTypes = {
    debt: PropTypes.object.isRequired,
    onViewDetails: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

export default DebtCard;
