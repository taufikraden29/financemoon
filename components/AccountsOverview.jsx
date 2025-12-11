'use client';

import { Landmark, Plus, Wallet } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAccounts } from '@/hooks/useAccounts';
import { formatRupiah } from '@/utils/currencyHelpers';

const AccountsOverview = () => {
    const { accounts } = useAccounts();
    const router = useRouter();

    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    // Get account icon based on type
    const getAccountIcon = (type) => {
        switch (type) {
            case 'bank':
                return <Landmark className="w-4 h-4" />;
            case 'ewallet':
                return <Wallet className="w-4 h-4" />;
            default:
                return <Wallet className="w-4 h-4" />;
        }
    };

    // Get icon color based on type
    const getIconColor = (type) => {
        switch (type) {
            case 'bank':
                return 'text-blue-400 bg-blue-500/10';
            case 'ewallet':
                return 'text-purple-400 bg-purple-500/10';
            default:
                return 'text-green-400 bg-green-500/10';
        }
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                        <Landmark className="w-5 h-5 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Accounts</h3>
                </div>
                <button
                    onClick={() => router.push('/accounts')}
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                    View All
                </button>
            </div>

            {accounts.length === 0 ? (
                <div className="text-center py-8">
                    <div className="inline-flex p-3 bg-slate-800 rounded-full mb-3">
                        <Landmark className="w-8 h-8 text-slate-600" />
                    </div>
                    <p className="text-slate-400 text-sm mb-3">No accounts yet</p>
                    <button
                        onClick={() => router.push('/accounts')}
                        className="text-sm text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1"
                    >
                        <Plus className="w-4 h-4" />
                        Add Account
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Total Balance */}
                    <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4">
                        <p className="text-xs text-slate-400 mb-1">Total Balance</p>
                        <p className="text-2xl font-bold text-white">
                            {formatRupiah(totalBalance)}
                        </p>
                    </div>

                    {/* Account List */}
                    <div className="space-y-2">
                        <p className="text-xs text-slate-400 mb-2">
                            {accounts.length} Account{accounts.length > 1 ? 's' : ''}
                        </p>
                        {accounts.slice(0, 3).map((account) => (
                            <div
                                key={account.id}
                                className="flex items-center justify-between p-3 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors cursor-pointer"
                                onClick={() => router.push('/accounts')}
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className={`p-2 rounded-lg ${getIconColor(account.type)}`}>
                                        {getAccountIcon(account.type)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium text-white truncate">
                                            {account.name}
                                        </p>
                                        <p className="text-xs text-slate-400 capitalize">
                                            {account.type}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-sm font-semibold text-white whitespace-nowrap ml-2">
                                    {formatRupiah(account.balance)}
                                </span>
                            </div>
                        ))}
                        {accounts.length > 3 && (
                            <button
                                onClick={() => router.push('/accounts')}
                                className="w-full text-sm text-blue-400 hover:text-blue-300 transition-colors py-2"
                            >
                                +{accounts.length - 3} more account{accounts.length - 3 > 1 ? 's' : ''}
                            </button>
                        )}
                    </div>

                    <button
                        onClick={() => router.push('/accounts')}
                        className="w-full mt-2 text-sm text-blue-400 hover:text-blue-300 transition-colors py-2 rounded-lg hover:bg-slate-800/50"
                    >
                        Manage Accounts →
                    </button>
                </div>
            )}
        </div>
    );
};

export default AccountsOverview;

