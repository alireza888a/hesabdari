
export const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('fa-IR').format(value);
};

// FIX: Export date utility functions from the main utils index file.
export * from './date';
