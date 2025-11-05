
import { Invoice, Customer, CompanyInfo, CustomTheme } from '../../types';

export interface TemplateProps {
    invoice: Invoice;
    customer?: Customer;
    companyInfo: CompanyInfo;
    activeTheme: CustomTheme;
}

export const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('fa-IR').format(value);
};

export const calculateTotals = (invoice: Invoice) => {
    const subtotal = invoice.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    const total = subtotal - invoice.discount;
    const finalAmount = total - invoice.downPayment;

    return {
        subtotal,
        total,
        finalAmount,
    };
};
