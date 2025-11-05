import React from 'react';
import { TemplateProps, formatCurrency, calculateTotals } from './common';

const CreativeTemplate: React.FC<TemplateProps> = ({ invoice, customer, companyInfo, activeTheme }) => {
    const { subtotal, finalAmount } = calculateTotals(invoice);

    return (
        <div className="p-10 bg-white font-sans text-slate-800">
            {/* Header */}
            <header className="p-8 -m-10 mb-10 text-white rounded-b-xl" style={{ backgroundColor: activeTheme.color }}>
                 <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">{companyInfo.name}</h1>
                    <h2 className="text-5xl font-thin tracking-widest uppercase">فاکتور</h2>
                </div>
            </header>
            
            {/* Info Section */}
            <section className="grid grid-cols-3 gap-8 text-sm mb-12">
                 <div className="col-span-1">
                    <h3 className="font-semibold text-slate-500 mb-2">فروشنده:</h3>
                    <p className="font-bold text-base">{companyInfo.name}</p>
                    <p className="mt-1 text-slate-600">{companyInfo.address}</p>
                    <p className="text-slate-600" dir="ltr">{companyInfo.phone}</p>
                </div>
                <div className="col-span-1">
                    <h3 className="font-semibold text-slate-500 mb-2">خریدار:</h3>
                    <p className="font-bold text-base">{customer ? `${customer.firstName} ${customer.lastName}` : 'مشتری'}</p>
                    <p className="mt-1 text-slate-600">{customer?.address || 'ثبت نشده'}</p>
                    <p className="text-slate-600" dir="ltr">{customer?.phone || 'ثبت نشده'}</p>
                </div>
                <div className="col-span-1 text-right">
                    <p><span className="font-semibold">شماره فاکتور:</span> {invoice.number}</p>
                    <p><span className="font-semibold">تاریخ صدور:</span> {invoice.issueDate}</p>
                    <p><span className="font-semibold">تاریخ سررسید:</span> {invoice.dueDate}</p>
                </div>
            </section>

            {/* Items Table */}
            <section>
                <table className="w-full text-right text-sm">
                    <thead>
                        <tr>
                            <th className="p-3 text-left font-semibold text-slate-500 border-b-2 border-slate-200">شرح</th>
                            <th className="p-3 text-center font-semibold text-slate-500 border-b-2 border-slate-200">تعداد</th>
                            <th className="p-3 text-center font-semibold text-slate-500 border-b-2 border-slate-200">قیمت واحد</th>
                            <th className="p-3 text-center font-semibold text-slate-500 border-b-2 border-slate-200">مبلغ کل</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoice.items.map((item) => (
                            <tr key={item.id}>
                                <td className="p-3 font-semibold border-b border-slate-100">{item.description}</td>
                                <td className="p-3 text-center text-slate-700 border-b border-slate-100">{item.quantity}</td>
                                <td className="p-3 text-center text-slate-700 border-b border-slate-100">{formatCurrency(item.price)}</td>
                                <td className="p-3 text-center text-slate-800 font-bold border-b border-slate-100">{formatCurrency(item.price * item.quantity)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            {/* Calculation & Notes */}
            <section className="mt-8 grid grid-cols-2 gap-12">
                 <div className="text-xs text-slate-500">
                    <h4 className="font-semibold text-slate-600 mb-2">توضیحات و شرایط پرداخت:</h4>
                    <p className="mb-2">{invoice.notes || '---'}</p>
                    <p><span className="font-semibold">{companyInfo.paymentMethod1_title}:</span> <span dir="ltr">{companyInfo.paymentMethod1_value}</span></p>
                    <p><span className="font-semibold">{companyInfo.paymentMethod2_title}:</span> <span dir="ltr">{companyInfo.paymentMethod2_value}</span></p>
                </div>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center text-slate-600">
                        <span className="font-semibold">جمع کل:</span>
                        <span className="font-medium">{formatCurrency(subtotal)} تومان</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600">
                        <span className="font-semibold">تخفیف:</span>
                        <span className="font-medium">(-) {formatCurrency(invoice.discount)} تومان</span>
                    </div>
                     <div className="flex justify-between items-center text-slate-600">
                        <span className="font-semibold">بیعانه:</span>
                        <span className="font-medium">(-) {formatCurrency(invoice.downPayment)} تومان</span>
                    </div>
                    <div className="border-t-2 my-1"></div>
                    <div className="flex justify-between items-center font-bold text-xl p-3 rounded-lg" style={{ color: "white", backgroundColor: activeTheme.color }}>
                        <span>مبلغ نهایی:</span>
                        <span className="font-black text-2xl">{formatCurrency(finalAmount)} تومان</span>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default CreativeTemplate;
