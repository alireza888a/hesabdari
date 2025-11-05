import React from 'react';
import { TemplateProps, formatCurrency, calculateTotals } from './common';

const ElegantTemplate: React.FC<TemplateProps> = ({ invoice, customer, companyInfo, activeTheme }) => {
    const { subtotal, finalAmount } = calculateTotals(invoice);

    const InfoBlock: React.FC<{title: string; children: React.ReactNode}> = ({title, children}) => (
        <div className="bg-white p-4 rounded-lg border border-slate-200">
            <h3 className="text-sm font-semibold border-b border-slate-200 pb-2 mb-3" style={{color: activeTheme.color}}>{title}</h3>
            <div className="text-sm text-slate-700 space-y-1">{children}</div>
        </div>
    );
    
    return (
        <div className="p-8 bg-slate-50 font-sans">
            <header className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-4xl font-bold text-slate-800">{companyInfo.name}</h1>
                    <p className="text-sm text-slate-500 mt-1">{companyInfo.tagline}</p>
                </div>
                <div className="text-left">
                    <h2 className="text-2xl font-semibold text-slate-500">فاکتور فروش</h2>
                    <p className="font-mono mt-1">{invoice.number}</p>
                </div>
            </header>

            <section className="grid grid-cols-3 gap-6 mb-8">
                <InfoBlock title="فروشنده">
                    <p className="font-bold">{companyInfo.name}</p>
                    <p>{companyInfo.address}</p>
                    <p>{companyInfo.phone}</p>
                </InfoBlock>
                <InfoBlock title="خریدار">
                    <p className="font-bold">{customer ? `${customer.firstName} ${customer.lastName}` : 'مشتری'}</p>
                    <p>{customer?.address || 'ثبت نشده'}</p>
                    <p>{customer?.phone || 'ثبت نشده'}</p>
                </InfoBlock>
                <InfoBlock title="اطلاعات فاکتور">
                    <p><span className="font-semibold">تاریخ صدور:</span> {invoice.issueDate}</p>
                    <p><span className="font-semibold">تاریخ سررسید:</span> {invoice.dueDate}</p>
                </InfoBlock>
            </section>

            <section className="bg-white rounded-lg border border-slate-200">
                <table className="w-full text-sm text-right">
                    <thead className="bg-slate-100 text-slate-600">
                        <tr>
                            <th className="p-3 font-semibold text-center">#</th>
                            <th className="p-3 font-semibold">شرح</th>
                            <th className="p-3 font-semibold text-center">تعداد</th>
                            <th className="p-3 font-semibold text-center">قیمت واحد</th>
                            <th className="p-3 font-semibold text-center">مبلغ کل</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {invoice.items.map((item, index) => (
                            <tr key={item.id}>
                                <td className="p-3 text-center text-slate-500">{index + 1}</td>
                                <td className="p-3 text-slate-800 font-medium">{item.description}</td>
                                <td className="p-3 text-center text-slate-700">{item.quantity}</td>
                                <td className="p-3 text-center text-slate-700">{formatCurrency(item.price)}</td>
                                <td className="p-3 text-center text-slate-800 font-semibold">{formatCurrency(item.price * item.quantity)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
            
            <section className="grid grid-cols-5 gap-6 mt-6">
                <div className="col-span-3 text-xs text-slate-500 bg-white p-4 rounded-lg border border-slate-200">
                    <h3 className="font-bold text-slate-600 mb-1">روش پرداخت و توضیحات</h3>
                    <p><span className="font-semibold">{companyInfo.paymentMethod1_title}:</span> <span dir="ltr">{companyInfo.paymentMethod1_value}</span></p>
                    <p className="mt-2 whitespace-pre-wrap">{invoice.notes || '---'}</p>
                </div>

                <div className="col-span-2 text-sm space-y-2 bg-white p-4 rounded-lg border border-slate-200">
                    <div className="flex justify-between items-center text-slate-600">
                        <span>جمع کل:</span>
                        <span className="font-medium">{formatCurrency(subtotal)}</span>
                    </div>
                     <div className="flex justify-between items-center text-slate-600">
                        <span>تخفیف:</span>
                        <span className="font-medium">(-) {formatCurrency(invoice.discount)}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600 pb-2 border-b">
                        <span>بیعانه:</span>
                        <span className="font-medium">(-) {formatCurrency(invoice.downPayment)}</span>
                    </div>
                    <div className="flex justify-between items-center font-bold text-lg pt-2" style={{color: activeTheme.color}}>
                        <span>مبلغ نهایی:</span>
                        <span className="font-extrabold">{formatCurrency(finalAmount)} تومان</span>
                    </div>
                </div>
            </section>

            <footer className="text-center mt-10 text-xs text-slate-400">
                <p>از انتخاب شما متشکریم!</p>
            </footer>
        </div>
    );
};

export default ElegantTemplate;
