'use client';

import clsx from 'clsx';
import PropTypes from 'prop-types';

/**
 * CurrencyInput - Input field with automatic Rupiah formatting
 * Displays: Rp 1.234.567
 * Returns: 1234567 (number)
 */
const CurrencyInput = ({
    value,
    onChange,
    placeholder = '0',
    error = null,
    className = '',
    autoFocus = false,
    disabled = false,
    ...props
}) => {
    // Format number to Rupiah display (1.234.567)
    const formatToDisplay = (number) => {
        if (!number && number !== 0) return '';

        const num = typeof number === 'string' ? parseFloat(number.replace(/\D/g, '')) : number;
        if (isNaN(num) || num === 0) return '';

        return new Intl.NumberFormat('id-ID').format(num);
    };

    // Parse display string to number
    const parseToNumber = (str) => {
        const cleaned = str.replace(/\D/g, '');
        return cleaned ? parseInt(cleaned, 10) : '';
    };

    // Handle input change
    const handleChange = (e) => {
        const inputValue = e.target.value;

        // Extract numeric value
        const numericValue = parseToNumber(inputValue);

        // Send numeric value to parent
        onChange(numericValue);
    };

    // Get display value
    const displayValue = formatToDisplay(value);

    return (
        <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium pointer-events-none">
                Rp
            </div>
            <input
                type="text"
                inputMode="numeric"
                value={displayValue}
                onChange={handleChange}
                placeholder={placeholder}
                autoFocus={autoFocus}
                disabled={disabled}
                className={clsx(
                    "w-full bg-slate-800 border rounded-xl pl-12 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all font-mono text-lg",
                    error ? "border-red-500 focus:ring-red-500" : "border-slate-700 focus:ring-blue-500",
                    disabled && "opacity-50 cursor-not-allowed",
                    className
                )}
                {...props}
            />
        </div>
    );
};

CurrencyInput.propTypes = {
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    error: PropTypes.string,
    className: PropTypes.string,
    autoFocus: PropTypes.bool,
    disabled: PropTypes.bool
};

export default CurrencyInput;

