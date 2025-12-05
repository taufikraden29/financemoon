import { ArrowRight, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDebt } from '../context/DebtContext';
import { getRemainingBalance } from '../utils/debtHelpers';

const DebtSummaryCard = () => {
    const { debts } = useDebt();
    const navigate = useNavigate();

    const activeDebts = debts.filter(d => d.status === 'active');

    if (activeDebts.length === 0) return null;

    const totalDebtAmount = activeDebts.reduce((sum, debt) => sum + debt.totalAmount, 0);
    const totalRemaining = activeDebts.reduce((sum, debt) => sum + getRemainingBalance(debt.totalAmount, debt.payments), 0);
    const totalPaid = totalDebtAmount - totalRemaining;

    return (
        <div className="bg-gradient-to-br from-orange-900 to-red-900 border border-orange-800 rounded-2xl p-6 relative overflow-hidden group hover:border-orange-700 transition-all duration-300">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 opacity-10 group-hover:opacity-20 transition-opacity">
                <CreditCard className="w-32 h-32 text-orange-500" />
            </div>

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-orange-500/20 rounded-lg">
                                <CreditCard className="w-5 h-5 text-orange-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white">Active Debts</h3>
                        </div>
                        <p className="text-sm text-orange-200">
                            {activeDebts.length} {activeDebts.length === 1 ? 'debt' : 'debts'} to track
                        </p>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-black/20 rounded-lg p-3">
                            <p className="text-xs text-orange-200 mb-1">Total Debt</p>
                            <p className="text-lg font-bold text-white">
                                {new Intl.NumberFormat('id-ID', {
                                    style: 'currency',
                                    currency: 'IDR',
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0
                                }).format(totalDebtAmount)}
                            </p>
                        </div>
                        <div className="bg-black/20 rounded-lg p-3">
                            <p className="text-xs text-orange-200 mb-1">Remaining</p>
                            <p className="text-lg font-bold text-orange-300">
                                {new Intl.NumberFormat('id-ID', {
                                    style: 'currency',
                                    currency: 'IDR',
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0
                                }).format(totalRemaining)}
                            </p>
                        </div>
                    </div>

                    <div className="bg-black/20 rounded-lg p-3">
                        <p className="text-xs text-orange-200 mb-1">Total Paid</p>
                        <p className="text-base font-bold text-green-400">
                            {new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0
                            }).format(totalPaid)}
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => navigate('/debts')}
                    className="mt-4 w-full bg-orange-600 hover:bg-orange-500 text-white px-4 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-all group"
                >
                    Manage Debts
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
};

export default DebtSummaryCard;
