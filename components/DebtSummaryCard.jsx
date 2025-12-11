'use client';

import { ArrowRight, CreditCard, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useDebt } from '@/context/DebtContext';
import { getRemainingBalance } from '@/utils/debtHelpers';

const DebtSummaryCard = () => {
    const { debts } = useDebt();
    const router = useRouter();

    const activeDebts = debts.filter(d => d.status === 'active');

    if (activeDebts.length === 0) {
        return (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between mb-4 md:mb-6">
                    <div className="flex items-center gap-2 md:gap-3">
                        <div className="p-2 bg-orange-500/10 rounded-lg">
                            <CreditCard className="w-4 h-4 md:w-5 md:h-5 text-orange-400" />
                        </div>
                        <h3 className="text-base md:text-lg font-bold text-white">Debts</h3>
                    </div>
                </div>
                <div className="text-center py-6 md:py-8">
                    <div className="inline-flex p-2 md:p-3 bg-slate-800 rounded-full mb-2 md:mb-3">
                        <CreditCard className="w-6 h-6 md:w-8 md:h-8 text-slate-600" />
                    </div>
                    <h4 className="text-sm font-medium text-white mb-1">No Active Debts</h4>
                    <p className="text-xs text-slate-400 mb-2 md:mb-3">
                        You're debt-free! 🎉
                    </p>
                    <button
                        onClick={() => router.push('/debts')}
                        className="text-xs md:text-sm text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1"
                    >
                        <Plus className="w-3 h-3 md:w-4 md:h-4" />
                        Track Debt
                    </button>
                </div>
            </div>
        );
    }

    const totalDebtAmount = activeDebts.reduce((sum, debt) => sum + debt.totalAmount, 0);
    const totalRemaining = activeDebts.reduce((sum, debt) => sum + getRemainingBalance(debt.totalAmount, debt.payments), 0);
    const totalPaid = totalDebtAmount - totalRemaining;

    return (
        <div className="bg-gradient-to-br from-orange-900 to-red-900 border border-orange-800 rounded-2xl p-4 md:p-6 relative overflow-hidden group hover:border-orange-700 transition-all duration-300">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 opacity-10 group-hover:opacity-20 transition-opacity">
                <CreditCard className="w-24 h-24 md:w-32 md:h-32 text-orange-500" />
            </div>

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-3 md:mb-4">
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-orange-500/20 rounded-lg">
                                <CreditCard className="w-4 h-4 md:w-5 md:h-5 text-orange-400" />
                            </div>
                            <h3 className="text-base md:text-lg font-bold text-white">Active Debts</h3>
                        </div>
                        <p className="text-xs md:text-sm text-orange-200 truncate">
                            {activeDebts.length} {activeDebts.length === 1 ? 'debt' : 'debts'} to track
                        </p>
                    </div>
                </div>

                <div className="space-y-2 md:space-y-3">
                    <div className="grid grid-cols-2 gap-2 md:gap-3">
                        <div className="bg-black/20 rounded-lg p-2 md:p-3">
                            <p className="text-xs text-orange-200 mb-1">Total Debt</p>
                            <p className="text-sm md:text-lg font-bold text-white truncate">
                                {new Intl.NumberFormat('id-ID', {
                                    style: 'currency',
                                    currency: 'IDR',
                                    minimumFractionDigits: 0,
                                    notation: 'compact',
                                    compactDisplay: 'short'
                                }).format(totalDebtAmount)}
                            </p>
                        </div>
                        <div className="bg-black/20 rounded-lg p-2 md:p-3">
                            <p className="text-xs text-orange-200 mb-1">Remaining</p>
                            <p className="text-sm md:text-lg font-bold text-orange-300 truncate">
                                {new Intl.NumberFormat('id-ID', {
                                    style: 'currency',
                                    currency: 'IDR',
                                    minimumFractionDigits: 0,
                                    notation: 'compact',
                                    compactDisplay: 'short'
                                }).format(totalRemaining)}
                            </p>
                        </div>
                    </div>

                    <div className="bg-black/20 rounded-lg p-2 md:p-3">
                        <p className="text-xs text-orange-200 mb-1">Total Paid</p>
                        <p className="text-sm md:text-base font-bold text-green-400 truncate">
                            {new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                minimumFractionDigits: 0,
                                notation: 'compact',
                                compactDisplay: 'short'
                            }).format(totalPaid)}
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => router.push('/debts')}
                    className="mt-3 md:mt-4 w-full bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 md:py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all group"
                >
                    Manage Debts
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
};

export default DebtSummaryCard;

