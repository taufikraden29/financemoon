import { Building2, Smartphone, Wallet } from 'lucide-react';
import { useAccount } from '../context/AccountContext';

const AccountsOverview = () => {
    const { accounts, getTotalBalance } = useAccount();

    const iconMap = {
        Wallet: Wallet,
        Building2: Building2,
        Smartphone: Smartphone
    };

    const colorMap = {
        green: 'from-green-600 to-emerald-600',
        blue: 'from-blue-600 to-cyan-600',
        purple: 'from-purple-600 to-pink-600'
    };

    if (accounts.length === 0) return null;

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white">Accounts</h3>
                <p className="text-sm text-slate-400">
                    {accounts.length} {accounts.length === 1 ? 'account' : 'accounts'}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {accounts.slice(0, 3).map((account) => {
                    const Icon = iconMap[account.icon] || Wallet;
                    const gradient = colorMap[account.color] || colorMap.blue;

                    return (
                        <div key={account.id} className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 p-4 border border-slate-700 group hover:border-slate-600 transition-all">
                            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${gradient} opacity-10 rounded-full -mr-10 -mt-10`} />

                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-2">
                                    <Icon className="w-4 h-4 text-slate-400" />
                                    <p className="text-xs text-slate-400 font-medium">{account.name}</p>
                                </div>
                                <p className="text-xl font-bold text-white">
                                    {new Intl.NumberFormat('id-ID', {
                                        style: 'currency',
                                        currency: 'IDR',
                                        minimumFractionDigits: 0
                                    }).format(account.balance)}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <div>
                    <p className="text-xs text-slate-400">Total Balance</p>
                    <p className="text-2xl font-bold text-white">
                        {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0
                        }).format(getTotalBalance())}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AccountsOverview;
