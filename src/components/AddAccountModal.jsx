import clsx from 'clsx';
import { X } from 'lucide-react';
import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useAccount } from '../context/AccountContext';
import CurrencyInput from './CurrencyInput';

const ACCOUNT_TYPES = [
    { value: 'cash', label: 'Cash', icon: 'Wallet', color: 'green' },
    { value: 'bank', label: 'Bank Account', icon: 'Building2', color: 'blue' },
    { value: 'ewallet', label: 'E-Wallet', icon: 'Smartphone', color: 'purple' }
];

const AddAccountModal = ({ isOpen, onClose, editAccount = null }) => {
    const { addAccount, updateAccount } = useAccount();
    const [formData, setFormData] = useState({
        name: '',
        type: 'cash',
        balance: '',
        icon: 'Wallet',
        color: 'green'
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            if (editAccount) {
                setFormData(editAccount);
            } else {
                setFormData({ name: '', type: 'cash', balance: '', icon: 'Wallet', color: 'green' });
            }
            setErrors({});
        }
    }, [isOpen, editAccount]);

    if (!isOpen) return null;

    const handleTypeChange = (type) => {
        const selectedType = ACCOUNT_TYPES.find(t => t.value === type);
        setFormData({
            ...formData,
            type,
            icon: selectedType.icon,
            color: selectedType.color
        });
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Account name is required';
        if (formData.balance === '' || parseFloat(formData.balance) < 0) {
            newErrors.balance = 'Balance must be 0 or greater';
        }
        return newErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const validationErrors = validate();

        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        if (editAccount) {
            updateAccount(editAccount.id, {
                ...formData,
                balance: parseFloat(formData.balance) || 0
            });
        } else {
            addAccount({
                ...formData,
                balance: parseFloat(formData.balance) || 0
            });
        }

        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                    <h3 className="text-xl font-bold text-white">
                        {editAccount ? 'Edit Account' : 'Add New Account'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">Account Name *</label>
                        <input
                            type="text"
                            placeholder="e.g. BCA Savings"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className={clsx(
                                "w-full bg-slate-800 border rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all",
                                errors.name ? "border-red-500 focus:ring-red-500" : "border-slate-700 focus:ring-blue-500"
                            )}
                            autoFocus
                        />
                        {errors.name && (
                            <p className="text-red-400 text-sm">{errors.name}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">Account Type *</label>
                        <div className="grid grid-cols-3 gap-2">
                            {ACCOUNT_TYPES.map((type) => (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => handleTypeChange(type.value)}
                                    className={clsx(
                                        "p-3 rounded-xl border-2 transition-all text-center",
                                        formData.type === type.value
                                            ? "border-blue-500 bg-blue-500/10 text-blue-400"
                                            : "border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600"
                                    )}
                                >
                                    <span className="text-sm font-medium">{type.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-400">Initial Balance (IDR) *</label>
                        <CurrencyInput
                            value={formData.balance}
                            onChange={(value) => setFormData({ ...formData, balance: value })}
                            placeholder="0"
                            error={errors.balance}
                        />
                        {errors.balance && (
                            <p className="text-red-400 text-sm">{errors.balance}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-all mt-4"
                    >
                        {editAccount ? 'Update Account' : 'Create Account'}
                    </button>
                </form>
            </div>
        </div>
    );
};

AddAccountModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    editAccount: PropTypes.object
};

export default AddAccountModal;
