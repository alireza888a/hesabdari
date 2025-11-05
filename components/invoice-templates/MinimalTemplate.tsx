import React, { useMemo } from 'react';
import { TemplateProps, formatCurrency, calculateTotals } from './common';

const MinimalTemplate: React.FC<TemplateProps> = ({ invoice, customer, companyInfo, activeTheme }) => {
    const { subtotal, finalAmount } = calculateTotals(invoice);

    const lighterThemeColor = useMemo(() => {
        const color = activeTheme.color.replace('#', '');
        if (color.length !== 6) return 'rgba(249, 115, 22, 0.1)';
        const r = parseInt(color.substring(0, 2), 16);
        const g = parseInt(color.substring(2, 4), 16);
        const b = parseInt(color.substring(4, 6), 16);
        return `rgba(${r}, ${g}, ${b}, 0.1)`;
    }, [activeTheme.color]);

    return (
        <div className="p-10 bg-white font-sans text-slate-700 text-xs leading-relaxed relative overflow-hidden">
             {/* Decorative background shapes */}
            <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 w-[300px] h-[300px] rounded-full" style={{ backgroundColor: lighterThemeColor, zIndex: 0 }}></div>
            <div className="absolute top-0 left-0 -translate-x-1/3 -translate-y-1/3 w-[300px] h-[300px] rounded-full" style={{ backgroundColor: lighterThemeColor, zIndex: 0 }}></div>

            <div className="relative z-10">
                {/* Header */}
                <header className="flex justify-between items-start mb-8">
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">{companyInfo.name || 'YOUR LOGO'}</h1>
                    </div>
                    <div className="text-right">
                        <div
                            className="inline-block px-6 py-2 rounded-full text-white"
                            style={{ backgroundColor: activeTheme.color }}
                        >
                            <h2 className="text-xl font-bold tracking-widest">فاکتور</h2>
                        </div>
                        <div className="mt-2 text-xs font-mono text-slate-500 space-y-0.5">
                            <p>شماره: {invoice.number}</p>
                            <p>تاریخ: {invoice.issueDate}</p>
                        </div>
                    </div>
                </header>

                {/* Bill To */}
                <section className="mb-10">
                    <p className="text-slate-500 font-semibold">صورتحساب برای:</p>
                    <h3 className="text-base font-bold text-slate-800 mt-1">{customer ? `${customer.firstName} ${customer.lastName}` : 'مشتری'}</h3>
                    <p className="text-slate-600 w-1/3">{customer?.address || 'ثبت نشده'}</p>
                    <p className="text-slate-600" dir="ltr">{customer?.phone || 'ثبت نشده'}</p>
                </section>

                {/* Items Table */}
                <section>
                    <div className="rounded-full text-white text-sm font-semibold" style={{ background: `linear-gradient(to left, ${activeTheme.color}, ${activeTheme.color}cc)` }}>
                        <div className="grid grid-cols-12 p-2 px-4">
                            <div className="col-span-6">شرح</div>
                            <div className="col-span-2 text-center">تعداد</div>
                            <div className="col-span-2 text-center">قیمت واحد</div>
                            <div className="col-span-2 text-right">مبلغ کل</div>
                        </div>
                    </div>
                    <div className="mt-2 space-y-2">
                        {invoice.items.map((item) => (
                            <div key={item.id} className="grid grid-cols-12 p-2 px-4 border-b border-slate-100 items-start">
                                <div className="col-span-6">
                                    <p className="font-semibold text-slate-800">{item.description}</p>
                                </div>
                                <div className="col-span-2 text-center">{item.quantity}</div>
                                <div className="col-span-2 text-center">{formatCurrency(item.price)}</div>
                                <div className="col-span-2 text-right font-semibold">{formatCurrency(item.price * item.quantity)}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Footer */}
                <footer className="mt-10 flex justify-between items-end">
                    <div className="w-1/2 space-y-4">
                        <div>
                            <p className="font-bold mb-1" style={{ color: activeTheme.color }}>اطلاعات پرداخت</p>
                            <p>{companyInfo.paymentMethod1_title}: <span dir="ltr">{companyInfo.paymentMethod1_value}</span></p>
                        </div>
                        <div>
                            <p className="font-bold mb-1" style={{ color: activeTheme.color }}>شرایط و ضوابط</p>
                            <p className="text-slate-600">{invoice.notes || '---'}</p>
                        </div>
                        <div className="pt-4">
                            <div className="inline-block px-5 py-2 rounded-full text-sm font-bold" style={{ backgroundColor: lighterThemeColor, color: activeTheme.color }}>
                                از همکاری شما متشکریم!
                            </div>
                        </div>
                    </div>
                    <div className="w-1/2 max-w-xs space-y-2">
                        <div className="flex justify-between p-1"><span>جمع کل:</span> <span>{formatCurrency(subtotal)}</span></div>
                        {invoice.discount > 0 && <div className="flex justify-between p-1"><span>تخفیف:</span> <span>(-) {formatCurrency(invoice.discount)}</span></div>}
                        {invoice.downPayment > 0 && <div className="flex justify-between p-1"><span>بیعانه:</span> <span>(-) {formatCurrency(invoice.downPayment)}</span></div>}
                        <div className="h-px bg-slate-200 my-1"></div>
                        <div className="flex justify-between items-center text-white p-2 px-4 rounded-full text-sm" style={{ background: `linear-gradient(to left, ${activeTheme.color}, ${activeTheme.color}cc)` }}>
                            <span className="font-bold">مبلغ نهایی:</span>
                            <span className="font-bold text-base">{formatCurrency(finalAmount)} تومان</span>
                        </div>
                        <div className="pt-8 text-center">
                            <p className="font-bold">{companyInfo.contactPerson}</p>
                            <p className="text-slate-500 text-xs border-t border-slate-200 mt-1 pt-1">امضا</p>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default MinimalTemplate;
