import React, { useState, useMemo } from 'react';
import { Transaction, Invoice, Customer, TransactionType, InvoiceStatus, Product } from '../types';

interface ReportsProps {
    transactions: Transaction[];
    invoices: Invoice[];
    customers: Customer[];
    products: Product[];
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount);
};

const getPersianDateRange = (period: 'current_month' | 'last_3_months' | 'current_year' | 'all_time'): { start: string, end: string } => {
    try {
        const today = new Date();
        const todayFaParts = today.toLocaleDateString('fa-IR-u-nu-latn').split('/');
        const currentYear = parseInt(todayFaParts[0]);
        const currentMonth = parseInt(todayFaParts[1]);
        const currentDay = parseInt(todayFaParts[2]);

        const todayFa = `${currentYear}/${String(currentMonth).padStart(2, '0')}/${String(currentDay).padStart(2, '0')}`;
        let startDate;

        switch (period) {
            case 'all_time':
                return { start: '1400/01/01', end: '1500/12/29' };
            case 'last_3_months': {
                let startMonth = currentMonth - 2;
                let startYear = currentYear;
                if (startMonth <= 0) {
                    startMonth += 12;
                    startYear -= 1;
                }
                startDate = `${startYear}/${String(startMonth).padStart(2, '0')}/01`;
                break;
            }
            case 'current_year': {
                startDate = `${currentYear}/01/01`;
                break;
            }
            case 'current_month':
            default: {
                startDate = `${currentYear}/${String(currentMonth).padStart(2, '0')}/01`;
                break;
            }
        }
        return { start: startDate, end: todayFa };

    } catch(e) {
        return { start: '1400/01/01', end: '1500/12/29'};
    }
};

const Reports: React.FC<ReportsProps> = ({ transactions, invoices, customers, products }) => {
    const [timePeriod, setTimePeriod] = useState<'current_month' | 'last_3_months' | 'current_year' | 'all_time'>('all_time');
    
    const productMap = useMemo(() => 
        products.reduce((acc, p) => {
            acc[p.name] = p;
            return acc;
        }, {} as Record<string, Product>), 
    [products]);

    const profitLossSummary = useMemo(() => {
        const { start, end } = getPersianDateRange(timePeriod);
        const paidInvoices = invoices.filter(i => i.status === InvoiceStatus.Paid && i.issueDate >= start && i.issueDate <= end);
        
        let grossRevenue = 0;
        let costOfGoodsSold = 0;

        paidInvoices.forEach(invoice => {
            invoice.items.forEach(item => {
                grossRevenue += item.quantity * item.price;
                const product = productMap[item.description];
                if (product && product.costPrice) {
                    costOfGoodsSold += item.quantity * product.costPrice;
                }
            });
            grossRevenue -= invoice.discount;
        });

        const operatingExpenses = transactions
            .filter(t => t.type === TransactionType.Expense && t.date >= start && t.date <= end)
            .reduce((sum, t) => sum + t.amount, 0);

        const grossProfit = grossRevenue - costOfGoodsSold;
        const netProfit = grossProfit - operatingExpenses;

        return { grossRevenue, costOfGoodsSold, grossProfit, operatingExpenses, netProfit };
    }, [transactions, invoices, timePeriod, productMap]);
    
    const expensesByCategory = useMemo(() => {
        const { start, end } = getPersianDateRange(timePeriod);
        const categoryMap: { [key: string]: number } = {};
        const expenses = transactions.filter(t => t.type === TransactionType.Expense && t.date >= start && t.date <= end);
        const totalExpense = expenses.reduce((sum, t) => sum + t.amount, 0);

        expenses.forEach(t => {
            categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
        });

        if (totalExpense === 0) return [];

        return Object.entries(categoryMap)
            .map(([category, amount]) => ({
                category,
                amount,
                percentage: Math.round((amount / totalExpense) * 100)
            }))
            .sort((a, b) => b.amount - a.amount);
    }, [transactions, timePeriod]);

    const revenueByCustomer = useMemo(() => {
        const { start, end } = getPersianDateRange(timePeriod);
        const customerRevenue: { [key: string]: { name: string, revenue: number } } = {};
        
        invoices
            .filter(invoice => invoice.issueDate >= start && invoice.issueDate <= end && invoice.status === InvoiceStatus.Paid)
            .forEach(invoice => {
                const customer = customers.find(c => c.id === invoice.customerId);
                if(customer) {
                    const revenue = invoice.items.reduce((sum, item) => sum + item.quantity * item.price, 0) - invoice.discount;
                    const customerName = `${customer.firstName} ${customer.lastName}`;
                    if(customerRevenue[customerName]) {
                        customerRevenue[customerName].revenue += revenue;
                    } else {
                        customerRevenue[customerName] = { name: customerName, revenue: revenue };
                    }
                }
            });

        return Object.values(customerRevenue).sort((a,b) => b.revenue - a.revenue).slice(0, 10);
    }, [invoices, customers, timePeriod]);
    
    const donutColors = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'];

    return (
        <div className="space-y-8">
            <div className="flex justify-end">
                <select 
                    value={timePeriod} 
                    onChange={e => setTimePeriod(e.target.value as any)}
                    className="p-2 border border-slate-300 rounded-lg text-sm bg-white shadow-sm"
                >
                    <option value="all_time">همه زمان‌ها</option>
                    <option value="current_month">ماه جاری</option>
                    <option value="last_3_months">۳ ماه اخیر</option>
                    <option value="current_year">سال جاری</option>
                </select>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/50">
                <h2 className="text-xl font-bold text-slate-800 mb-4">خلاصه سود و زیان</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                    <div>
                        <p className="text-sm font-medium text-slate-500">درآمد ناخالص</p>
                        <p className="text-2xl font-bold text-green-600 mt-2">{formatCurrency(profitLossSummary.grossRevenue)}</p>
                    </div>
                     <div>
                        <p className="text-sm font-medium text-slate-500">بهای تمام شده (COGS)</p>
                        <p className="text-2xl font-bold text-orange-600 mt-2">{formatCurrency(profitLossSummary.costOfGoodsSold)}</p>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">سود ناخالص</p>
                        <p className={`text-2xl font-bold mt-2 ${profitLossSummary.grossProfit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                            {formatCurrency(profitLossSummary.grossProfit)}
                        </p>
                    </div>
                     <div>
                        <p className="text-sm font-medium text-slate-500">سود خالص</p>
                        <p className={`text-2xl font-bold mt-2 ${profitLossSummary.netProfit >= 0 ? 'text-slate-800' : 'text-red-600'}`}>
                            {formatCurrency(profitLossSummary.netProfit)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/50">
                    <h2 className="text-xl font-bold text-slate-800 mb-6">هزینه‌ها بر اساس دسته‌بندی</h2>
                     {expensesByCategory.length > 0 ? (
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="relative w-40 h-40">
                                <svg className="w-full h-full" viewBox="0 0 36 36" transform='rotate(-90)'>
                                    {expensesByCategory.map((cat, index, arr) => {
                                        const offset = arr.slice(0, index).reduce((sum, current) => sum + current.percentage, 0);
                                        return (
                                           <circle
                                                key={cat.category}
                                                className="transition-all"
                                                cx="18" cy="18" r="15.9155"
                                                fill="transparent"
                                                stroke={donutColors[index % donutColors.length]}
                                                strokeWidth="3.8"
                                                strokeDasharray={`${cat.percentage} ${100 - cat.percentage}`}
                                                strokeDashoffset={-offset}
                                            />
                                        )
                                    })}
                                </svg>
                            </div>
                            <div className="flex-1 w-full space-y-2">
                                {expensesByCategory.map((cat, index) => (
                                    <div key={cat.category} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center">
                                            <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: donutColors[index % donutColors.length] }}></span>
                                            <span className="font-medium text-slate-700">{cat.category}</span>
                                        </div>
                                        <div className="font-semibold text-slate-800">
                                            <span className="ml-4 text-slate-500 font-normal">%{cat.percentage}</span>
                                            {formatCurrency(cat.amount)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p className="text-center text-slate-400 py-10">هزینه‌ای در این بازه زمانی ثبت نشده است.</p>
                    )}
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/50">
                    <h2 className="text-xl font-bold text-slate-800 mb-4">درآمد بر اساس مشتری (برتر)</h2>
                    {revenueByCustomer.length > 0 ? (
                        <ul className="space-y-3">
                            {revenueByCustomer.map((item, index) => (
                                <li key={item.name} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                                    <div className="flex items-center">
                                        <span className="text-sm font-bold text-purple-600 w-6 text-center">{index + 1}</span>
                                        <span className="font-medium text-slate-700 mr-2">{item.name}</span>
                                    </div>
                                    <span className="font-bold text-slate-800">{formatCurrency(item.revenue)} تومان</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-center text-slate-400 py-10">فاکتور پرداخت شده‌ای در این بازه زمانی یافت نشد.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Reports;