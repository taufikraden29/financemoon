export const exportToCSV = (transactions) => {
    if (!transactions || transactions.length === 0) {
        return null;
    }

    // CSV headers
    const headers = ['Date', 'Description', 'Category', 'Type', 'Amount'];

    // Convert transactions to CSV rows
    const rows = transactions.map(t => [
        new Date(t.date).toLocaleDateString('id-ID'),
        `"${t.description}"`, // Wrap in quotes to handle commas
        t.category,
        t.type,
        t.amount
    ]);

    // Combine headers and rows
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');

    return csvContent;
};

export const downloadCSV = (content, filename = 'transactions.csv') => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
};

export const generateFilename = () => {
    const date = new Date().toISOString().split('T')[0];
    return `financial-moo-transactions-${date}.csv`;
};
