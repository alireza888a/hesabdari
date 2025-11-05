import React, { useMemo } from 'react';
import { TemplateProps, formatCurrency, calculateTotals } from './common';

const hexToRgba = (hex: string, alpha: number): string => {
    hex = hex.replace(/^#/, '');
    if (hex.length !== 6) return `rgba(139, 92, 246, ${alpha})`;
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const ModernTemplate: React.FC<TemplateProps> = ({ invoice, customer, companyInfo, activeTheme }) => {

    const themeLightBg = useMemo(() => hexToRgba(activeTheme.color, 0.07), [activeTheme]);
    const { subtotal, finalAmount } = calculateTotals(invoice);


    return (
        <div className="p-10 bg-white font-sans text-slate-800">
            {/* Header */}
            <header className={`pb-4 flex justify-between items-center border-b-2`} style={{borderColor: activeTheme.color}}>
                <div>
                    <h1 className="text-3xl font-bold">{companyInfo.name}</h1>
                    <p className="text-sm text-slate-500 mt-1">{companyInfo.address}</p>
                </div>
                <div className="text-left">
                    <h2 className="text-4xl font-extrabold tracking-tight uppercase" style={{color: activeTheme.color}}>فاکتور</h2>
                    <p className="font-mono mt-2 text-sm text-slate-500">شماره: {invoice.number}</p>
                </div>
            </header>
            
            {/* Customer & Payment Info */}
            <section className="mt-8 grid grid-cols-2 gap-8 text-sm">
                <div className="space-y-1">
                    <h3 className="font-semibold text-slate-500 mb-2">صورتحساب برای:</h3>
                    <p className="font-bold text-lg">{customer ? `${customer.firstName} ${customer.lastName}` : 'مشتری'}</p>
                    <p className="text-slate-600">{customer?.address || 'ثبت نشده'}</p>
                    <p className="text-slate-600" dir="ltr">{customer?.phone || 'ثبت نشده'}</p>
                </div>
                <div className="space-y-1 text-left">
                    <h3 className="font-semibold text-slate-500 mb-2 text-right">اطلاعات:</h3>
                     <p className="text-slate-700 text-right"><span className="font-medium">{invoice.issueDate}</span> :تاریخ صدور</p>
                    <p className="text-slate-700 text-right"><span className="font-medium">{invoice.dueDate}</span> :تاریخ سررسید</p>
                </div>
            </section>
            
            {/* Items Table */}
            <section className="mt-10">
                 <table className="w-full text-right text-sm">
                    <thead >
                        <tr style={{ backgroundColor: activeTheme.color }} className="text-white">
                            <th className="p-3 text-center font-semibold rounded-r-lg">#</th>
                            <th className="p-3 font-semibold">شرح</th>
                            <th className="p-3 text-center font-semibold">تعداد</th>
                            <th className="p-3 text-center font-semibold">قیمت واحد</th>
                            <th className="p-3 text-left font-semibold rounded-l-lg">مبلغ کل</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.items.map((item, index) => (
                            <tr key={item.id} className="border-b border-slate-100" style={{backgroundColor: index % 2 === 0 ? 'white' : themeLightBg}}>
                                <td className="p-3 text-center text-slate-500">{index + 1}</td>
                                <td className="p-3 font-medium">{item.description}</td>
                                <td className="p-3 text-center">{item.quantity}</td>
                                <td className="p-3 text-center">{formatCurrency(item.price)}</td>
                                <td className="p-3 text-left font-semibold">{formatCurrency(item.price * item.quantity)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            {/* Calculation */}
            <section className="mt-8 grid grid-cols-2 gap-8">
                <div className="text-sm">
                    <h3 className="font-semibold text-slate-500 mb-2">توضیحات:</h3>
                    <p className="text-slate-600 whitespace-pre-wrap">{invoice.notes || '---'}</p>
                </div>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center text-slate-600 p-2">
                        <span className="font-medium">جمع کل:</span>
                        <span className="font-semibold">{formatCurrency(subtotal)} تومان</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600 p-2">
                        <span className="font-medium">تخفیف:</span>
                        <span className="font-semibold">(-) {formatCurrency(invoice.discount)} تومان</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600 p-2">
                        <span className="font-medium">بیعانه:</span>
                        <span className="font-semibold">(-) {formatCurrency(invoice.downPayment)} تومان</span>
                    </div>
                    <div className="border-t-2 my-1"></div>
                    <div className="flex justify-between items-center font-bold text-lg p-3 rounded-lg" style={{ backgroundColor: themeLightBg, color: activeTheme.color }}>
                        <span>مبلغ نهایی قابل پرداخت:</span>
                        <span className="font-extrabold">{formatCurrency(finalAmount)} تومان</span>
                    </div>
                </div>
            </section>
            
            {/* Footer */}
            <footer className="mt-16 pt-6 border-t-2 border-dashed border-slate-200 text-center text-xs text-slate-500">
                <p>از خرید شما متشکریم!</p>
                <p className="mt-1">{companyInfo.website} | {companyInfo.phone}</p>
            </footer>
        </div>
    );
};

export default ModernTemplate;
