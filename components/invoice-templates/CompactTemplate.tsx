import React, { useMemo } from 'react';
import { TemplateProps, formatCurrency, calculateTotals } from './common';

const shadeColor = (color: string, percent: number): string => {
    let R = parseInt(color.substring(1, 3), 16);
    let G = parseInt(color.substring(3, 5), 16);
    let B = parseInt(color.substring(5, 7), 16);

    R = Math.round(R * (100 + percent) / 100);
    G = Math.round(G * (100 + percent) / 100);
    B = Math.round(B * (100 + percent) / 100);

    R = (R < 255) ? R : 255;
    G = (G < 255) ? G : 255;
    B = (B < 255) ? B : 255;

    const RR = ((R.toString(16).length === 1) ? "0" + R.toString(16) : R.toString(16));
    const GG = ((G.toString(16).length === 1) ? "0" + G.toString(16) : G.toString(16));
    const BB = ((B.toString(16).length === 1) ? "0" + B.toString(16) : B.toString(16));

    return "#" + RR + GG + BB;
};

const CompactTemplate: React.FC<TemplateProps> = ({ invoice, customer, companyInfo, activeTheme }) => {
    const { subtotal, finalAmount } = calculateTotals(invoice);
    
    const lighterColor = useMemo(() => shadeColor(activeTheme.color, 40), [activeTheme.color]);
    const darkerColor = useMemo(() => shadeColor(activeTheme.color, -20), [activeTheme.color]);

    return (
        <div className="bg-white font-sans text-slate-700 text-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 opacity-80" style={{ pointerEvents: 'none' }}>
                 <svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg" width="100%" id="blobSvg">
                    <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor={lighterColor}></stop>
                            <stop offset="100%" stopColor={activeTheme.color}></stop>
                        </linearGradient>
                    </defs>
                    <path fill="url(#gradient)" d="M441,299.5Q413,349,376.5,376.5Q340,404,295,431Q250,458,197,450.5Q144,443,109,407Q74,371,59.5,310.5Q45,250,67.5,199Q90,148,124.5,114.5Q159,81,204.5,60Q250,39,298,53.5Q346,68,382,102.5Q418,137,442,193.5Q466,250,441,299.5Z"></path>
                </svg>
            </div>

            <div className="p-10 relative z-10">
                <header className="mb-12">
                    <p className="font-bold text-slate-800">{companyInfo.name}</p>
                </header>
                
                <section className="flex justify-between items-start mb-12">
                    <div>
                        <h2 className="text-4xl font-extrabold" style={{ color: darkerColor }}>فاکتور</h2>
                        <div className="mt-4">
                            <h3 className="font-semibold text-slate-500">برای:</h3>
                            <p className="font-bold text-base">{customer ? `${customer.firstName} ${customer.lastName}` : 'مشتری'}</p>
                            <p>{customer?.address}</p>
                        </div>
                    </div>
                    <div className="text-right text-xs space-y-1">
                        <p><span className="font-semibold">تاریخ:</span> {invoice.issueDate}</p>
                        <p><span className="font-semibold">شماره:</span> {invoice.number}</p>
                    </div>
                </section>
                
                <section>
                     <table className="w-full text-right text-sm">
                        <thead className="border-b-2" style={{borderColor: activeTheme.color}}>
                            <tr>
                                <th className="p-2 font-semibold text-center">#</th>
                                <th className="p-2 font-semibold">شرح</th>
                                <th className="p-2 font-semibold text-center">قیمت واحد</th>
                                <th className="p-2 font-semibold text-center">تعداد</th>
                                <th className="p-2 font-semibold text-left">مبلغ کل</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoice.items.map((item, index) => (
                                <tr key={item.id} className="border-b border-slate-100">
                                    <td className="p-2 text-center text-slate-500">{index + 1}</td>
                                    <td className="p-2 font-medium">{item.description}</td>
                                    <td className="p-2 text-center">{formatCurrency(item.price)}</td>
                                    <td className="p-2 text-center">{item.quantity}</td>
                                    <td className="p-2 text-left font-semibold">{formatCurrency(item.price * item.quantity)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>

                <section className="flex justify-between items-start mt-8 gap-8">
                    <div>
                        <h4 className="font-bold mb-2">با تشکر از شما!</h4>
                        <p className="text-xs text-slate-500">{invoice.notes || '---'}</p>
                    </div>
                    <div className="w-full max-w-xs text-white rounded-lg overflow-hidden">
                        <div className="flex justify-between p-2" style={{ backgroundColor: shadeColor(activeTheme.color, 10) }}><span>جمع کل</span><span>{formatCurrency(subtotal)}</span></div>
                        <div className="flex justify-between p-2" style={{ backgroundColor: activeTheme.color }}><span>تخفیف</span><span>(-) {formatCurrency(invoice.discount)}</span></div>
                        <div className="flex justify-between p-2" style={{ backgroundColor: activeTheme.color }}><span>بیعانه</span><span>(-) {formatCurrency(invoice.downPayment)}</span></div>
                        <div className="flex justify-between p-3 font-bold text-lg" style={{ backgroundColor: darkerColor }}><span>مبلغ نهایی</span><span>{formatCurrency(finalAmount)} تومان</span></div>
                    </div>
                </section>
                
                <footer className="mt-16 pt-6 border-t border-slate-200 text-xs text-slate-500 flex justify-between items-center">
                    <div>
                        <h4 className="font-semibold text-slate-600">اطلاعات پرداخت</h4>
                        <p><span className="font-medium">{companyInfo.paymentMethod1_title}:</span> {companyInfo.paymentMethod1_value}</p>
                    </div>
                    <div className="text-right">
                        <p>{companyInfo.phone}</p>
                        <p>{companyInfo.website}</p>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default CompactTemplate;
