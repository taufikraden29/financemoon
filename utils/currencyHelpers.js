/**
 * Format number to Indonesian Rupiah currency format
 * @param {number} amount - The amount to format
 * @param {boolean} compact - Use compact format (K, M, B)
 * @returns {string} Formatted currency string
 */
export const formatRupiah = (amount, compact = false) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
        return 'Rp 0';
    }

    if (compact && Math.abs(amount) >= 1000) {
        const absAmount = Math.abs(amount);
        const sign = amount < 0 ? '-' : '';

        if (absAmount >= 1000000000) {
            return `${sign}Rp ${(absAmount / 1000000000).toFixed(1)}B`;
        } else if (absAmount >= 1000000) {
            return `${sign}Rp ${(absAmount / 1000000).toFixed(1)}M`;
        } else if (absAmount >= 1000) {
            return `${sign}Rp ${(absAmount / 1000).toFixed(1)}K`;
        }
    }

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
};

/**
 * Parse rupiah string to number
 * @param {string} rupiahString - String with rupiah format
 * @returns {number} Parsed number
 */
export const parseRupiah = (rupiahString) => {
    if (typeof rupiahString === 'number') return rupiahString;
    return parseFloat(rupiahString.replace(/[^0-9,-]/g, '').replace(',', '.')) || 0;
};

/**
 * Calculate total balance from all sources
 * @param {number} accountBalance - Balance from accounts
 * @param {number} transactionBalance - Net balance from transactions
 * @returns {number} Total balance
 */
export const calculateTotalBalance = (accountBalance = 0, transactionBalance = 0) => {
    return accountBalance + transactionBalance;
};

/**
 * Calculate percentage
 * @param {number} value - Current value
 * @param {number} total - Total value
 * @returns {number} Percentage
 */
export const calculatePercentage = (value, total) => {
    if (total === 0) return 0;
    return (value / total) * 100;
};
