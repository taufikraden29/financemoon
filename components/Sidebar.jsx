'use client';

import clsx from 'clsx';
import { CreditCard, DollarSign, Landmark, LayoutDashboard, LogOut, PieChart, Receipt, RefreshCw, Wallet, X } from 'lucide-react';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTransactions } from '@/hooks/useTransactions';

const Sidebar = ({ isOpen, onClose }) => {
    const { getBalance } = useTransactions();
    const { logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Receipt, label: 'Transactions', path: '/transactions' },
        { icon: RefreshCw, label: 'Recurring', path: '/recurring' },
        { icon: Landmark, label: 'Accounts', path: '/accounts' },
        { icon: DollarSign, label: 'Budgets', path: '/budgets' },
        { icon: PieChart, label: 'Analytics', path: '/analytics' },
        { icon: CreditCard, label: 'Debts', path: '/debts' },
    ];

    const handleLogout = () => {
        logout();
        router.push('/login');
    };

    const isActive = (path) => {
        if (path === '/') {
            return pathname === '/';
        }
        return pathname.startsWith(path);
    };

    return (
        <aside
            className={clsx(
                "w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 z-50 transition-transform duration-300",
                "md:translate-x-0", // Always visible on desktop
                isOpen ? "translate-x-0" : "-translate-x-full" // Mobile slide in/ out
            )}
        >
            {/* Mobile Close Button */}
            <div className="md:hidden absolute top-4 right-4">
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <X className="w-5 h-5 text-slate-400" />
                </button>
            </div>

            <div className="p-6 flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                    <Wallet className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    FinMoo
                </h1>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-2">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        href={item.path}
                        onClick={() => onClose()} // Close sidebar on navigation (mobile)
                        className={clsx(
                            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                            isActive(item.path)
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                                : "text-slate-400 hover:bg-slate-800 hover:text-white"
                        )}
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-800 space-y-3">
                <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                    <p className="text-xs text-slate-400 mb-1">Total Balance</p>
                    <p className="text-lg font-bold text-white">
                        {new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                        }).format(getBalance())}
                    </p>
                </div>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
};

Sidebar.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
};

export default Sidebar;
