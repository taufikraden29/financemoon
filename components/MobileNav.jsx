'use client';

import { Menu, Wallet } from 'lucide-react';
import PropTypes from 'prop-types';
import { useTransactions } from '@/hooks/useTransactions';

const MobileNav = ({ onMenuClick, isSidebarOpen, onCloseSidebar }) => {
    const { getBalance } = useTransactions();

    return (
        <>
            {/* Mobile Header */}
            <header className="md:hidden fixed top-0 left-0 right-0 bg-slate-900 border-b border-slate-800 z-40 px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onMenuClick}
                            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <Menu className="w-6 h-6 text-white" />
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-blue-600 rounded-lg">
                                <Wallet className="w-4 h-4 text-white" />
                            </div>
                            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                FinMoo
                            </h1>
                        </div>
                    </div>

                    <div className="text-right">
                        <p className="text-xs text-slate-400">Balance</p>
                        <p className="text-sm font-bold text-white">
                            {new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0
                            }).format(getBalance())}
                        </p>
                    </div>
                </div>
            </header>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                    onClick={onCloseSidebar}
                />
            )}
        </>
    );
};

MobileNav.propTypes = {
    onMenuClick: PropTypes.func.isRequired,
    isSidebarOpen: PropTypes.bool.isRequired,
    onCloseSidebar: PropTypes.func.isRequired,
};

export default MobileNav;


