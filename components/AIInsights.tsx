import React, { useMemo } from 'react';
import { Customer, Invoice, Transaction, Check, InvoiceStatus, CheckStatus, TransactionType } from '../types';
import TrophyIcon from './icons/TrophyIcon';
import { ChartPieIcon } from '@heroicons/react/24/outline';
import ExclamationTriangleIcon from './icons/ExclamationTriangleIcon';
import SparklesIcon from './icons/SparklesIcon';

interface AIInsightsProps {
    customers: Customer[];
    invoices: Invoice[];
    transactions: Transaction[];
    checks: Check[];
}

const InsightCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    value: string | number;
    description: string;
    color: 'green' | 'blue' | 'yellow' | 'red';
}> = ({ icon, title, value, description, color }) => {
    
    const colorClasses = {
        green: 'bg-green-100 text-green-700',
        blue: 'bg-blue-100 text-blue-700',
        yellow: 'bg-yellow-100 text-yellow-700',
        red: 'bg-red-100 text-red-700',
    };

    return (
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 flex items-start gap-4">
            <div className={`p-3 rounded-full ${colorClasses[color]}`}>
                {icon}
            </div>
            <div>
                <p className="text-sm font-semibold text-slate-500">{title}</p>
                <p className="text-xl font-bold text-slate-800 mt-1">{value}</p>
                <p className="text-xs text-slate-400 mt-1">{description}</p>
            </div>
        </div>
    );
};

const AIInsights: React.FC<AIInsightsProps> = ({ customers, invoices, transactions, checks }) => {
    
    const topCustomer = useMemo(() => {
        if (!customers.length || !invoices.length) return null;

        const customerRevenue: { [key: number]: number } = {};

        invoices.forEach(invoice => {
            if (invoice.status === InvoiceStatus.Paid) {
                const total = invoice.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
                const revenue = total - invoice.discount;
                customerRevenue[invoice.customerId] = (customerRevenue[invoice.customerId] || 0) + revenue;
            }
        });

        const topCustomerId = Object.keys(customerRevenue).sort((a, b) => customerRevenue[Number(b)] - customerRevenue[Number(a)])[0];

        if (!topCustomerId) return null;
        
        const customer = customers.find(c => c.id === Number(topCustomerId));
        return customer ? `${customer.firstName} ${customer.lastName}` : null;

    }, [customers, invoices]);

    const topExpenseCategory = useMemo(() => {
        if (!transactions.length) return null;
        const expenseByCategory: { [key: string]: number } = {};
        
        transactions.forEach(t => {
            if (t.type === TransactionType.Expense) {
                expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
            }
        });

        const topCategory = Object.keys(expenseByCategory).sort((a, b) => expenseByCategory[b] - expenseByCategory[a])[0];
        
        return topCategory || null;
    }, [transactions]);
    
    const overdueInvoicesCount = useMemo(() => {
        return invoices.filter(i => i.status === InvoiceStatus.Overdue).length;
    }, [invoices]);

    const bouncedChecksCount = useMemo(() => {
        return checks.filter(c => c.status === CheckStatus.Bounced).length;
    }, [checks]);

    return (
         <div className="bg-gradient-to-tr from-slate-50 to-slate-100 p-5 rounded-2xl border border-slate-200/50 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
                <SparklesIcon className="w-6 h-6 text-purple-600" />
                <h3 className="text-lg font-bold text-slate-800">تحلیل هوشمند</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {topCustomer && (
                     <InsightCard 
                        icon={<TrophyIcon />} 
                        title="بهترین مشتری" 
                        value={topCustomer} 
                        description="بر اساس فاکتورهای پرداخت شده"
                        color="green"
                     />
                )}
                 {topExpenseCategory && (
                     <InsightCard 
                        icon={<ChartPieIcon className="w-6 h-6" />} 
                        title="بیشترین هزینه" 
                        value={topExpenseCategory} 
                        description="بزرگترین دسته‌بندی هزینه‌ها"
                        color="blue"
                     />
                )}
                {overdueInvoicesCount > 0 && (
                    <InsightCard 
                        icon={<ExclamationTriangleIcon />} 
                        title="فاکتورهای سررسید گذشته" 
                        value={`${overdueInvoicesCount} مورد`}
                        description="نیاز به پیگیری فوری"
                        color="yellow"
                     />
                )}
                {bouncedChecksCount > 0 && (
                     <InsightCard 
                        icon={<ExclamationTriangleIcon />} 
                        title="چک های برگشتی" 
                        value={`${bouncedChecksCount} مورد`}
                        description="نیاز به اقدام فوری"
                        color="red"
                     />
                )}
            </div>
        </div>
    );
};

export default AIInsights;