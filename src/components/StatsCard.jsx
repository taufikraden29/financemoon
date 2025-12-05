import clsx from 'clsx';
import { ArrowDownRight, ArrowUpRight, DollarSign } from 'lucide-react';
import PropTypes from 'prop-types';

const StatsCard = ({ title, value, type }) => {
    const isIncome = type === 'income';
    const isExpense = type === 'expense';

    return (
        <div className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl p-6 group hover:border-slate-700 transition-all duration-300">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                {isIncome ? <ArrowUpRight className="w-16 h-16 text-green-500" /> :
                    isExpense ? <ArrowDownRight className="w-16 h-16 text-red-500" /> :
                        <DollarSign className="w-16 h-16 text-blue-500" />}
            </div>

            <div className="relative z-10">
                <p className="text-slate-400 font-medium mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-white tracking-tight">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value)}
                </h3>

                <div className={clsx(
                    "mt-4 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium",
                    isIncome ? "bg-green-500/10 text-green-400" :
                        isExpense ? "bg-red-500/10 text-red-400" :
                            "bg-blue-500/10 text-blue-400"
                )}>
                    Just updated
                </div>
            </div>
        </div>
    );
};

StatsCard.propTypes = {
    title: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired,
    type: PropTypes.oneOf(['income', 'expense', 'balance']).isRequired,
};

export default StatsCard;
