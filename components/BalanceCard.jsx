'use client';

import { ArrowDownRight, ArrowUpRight, TrendingUp, Wallet } from 'lucide-react';
import { useAccounts } from '@/hooks/useAccounts';
import { useTransactions } from '@/hooks/useTransactions';
import { formatRupiah } from '../utils/currencyHelpers';

const BalanceCard = () => {
    const { getTotalBalance } = useAccounts();
    const { getBalance, getIncome, getExpense } = useTransactions();

    const accountBalance = getTotalBalance();
    const transactionBalance = getBalance();
    // Total balance = account balances + net from transactions
    const totalBalance = accountBalance + transactionBalance;

    const income = getIncome();
    const expense = getExpense();
    const trend = income > expense ? 'up' : income < expense ? 'down' : 'neutral';

    return (
        <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-900 border border-blue-700 rounded-2xl p-8 relative overflow-hidden col-span-full lg:col-span-2">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 opacity-10">
                <Wallet className="w-64 h-64 text-blue-400 -mr-20 -mt-20" />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-blue-500/20 rounded-xl">
                        <Wallet className="w-6 h-6 text-blue-300" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Total Saldo</h3>
                        <p className="text-sm text-blue-200">Saldo keseluruhan dari semua sumber</p>
                    </div>
                </div>

                {/* Main Balance Display */}
                <div className="mb-6">
                    <p className="text-5xl font-bold text-white mb-2">
                        {formatRupiah(totalBalance)}
                    </p>
                    <div className="flex items-center gap-2">
                        {trend === 'up' && (
                            <>
                                <TrendingUp className="w-4 h-4 text-green-400" />
                                <span className="text-sm text-green-400 font-medium">Saldo meningkat</span>
                            </>
                        )}
                        {trend === 'down' && (
                            <>
                                <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />
                                <span className="text-sm text-red-400 font-medium">Perlu perhatian</span>
                            </>
                        )}
                        {trend === 'neutral' && (
                            <span className="text-sm text-blue-300">Stabil</span>
                        )}
                    </div>
                </div>

                {/* Balance Breakdown */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-black/20 rounded-xl p-4 border border-blue-600/30">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-blue-500/20 rounded-lg">
                                <Wallet className="w-3 h-3 text-blue-400" />
                            </div>
                            <p className="text-xs text-blue-200 font-medium">Accounts</p>
                        </div>
                        <p className="text-lg font-bold text-white">
                            {formatRupiah(accountBalance)}
                        </p>
                    </div>

                    <div className="bg-black/20 rounded-xl p-4 border border-green-600/30">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-green-500/20 rounded-lg">
                                <ArrowUpRight className="w-3 h-3 text-green-400" />
                            </div>
                            <p className="text-xs text-green-200 font-medium">Income</p>
                        </div>
                        <p className="text-lg font-bold text-green-400">
                            {formatRupiah(income)}
                        </p>
                    </div>

                    <div className="bg-black/20 rounded-xl p-4 border border-red-600/30">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-red-500/20 rounded-lg">
                                <ArrowDownRight className="w-3 h-3 text-red-400" />
                            </div>
                            <p className="text-xs text-red-200 font-medium">Expense</p>
                        </div>
                        <p className="text-lg font-bold text-red-400">
                            {formatRupiah(expense)}
                        </p>
                    </div>
                </div>

                {/* Transaction Balance Note */}
                {transactionBalance !== 0 && (
                    <div className="mt-4 p-3 bg-blue-950/50 rounded-lg border border-blue-700/30">
                        <p className="text-xs text-blue-200">
                            <span className="font-semibold">Net dari transaksi:</span>{' '}
                            {formatRupiah(transactionBalance)}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BalanceCard;


