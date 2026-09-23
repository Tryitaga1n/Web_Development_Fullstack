export const formatCurrency = (value) => new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    maximumFractionDigits: 0
}).format(Number(value) || 0);

export const formatDate = (timestamp) => new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short'
}).format(new Date(Number(timestamp)));

export const timeRemaining = (timestamp) => {
    const remaining = Number(timestamp) - Date.now();
    if (remaining <= 0) return 'Auction closed';

    const days = Math.floor(remaining / 86400000);
    const hours = Math.floor((remaining % 86400000) / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${Math.max(minutes, 1)}m left`;
};

export const toDateTimeLocal = (timestamp) => {
    const date = new Date(Number(timestamp));
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
};
