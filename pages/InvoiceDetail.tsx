import React, { useState, useMemo } from 'react';
import { Invoice, Customer, CustomTheme, CompanyInfo } from '../types';
import PrinterIcon from '../components/icons/PrinterIcon';
import ArrowRightIcon from '../components/icons/ArrowRightIcon';
import PlusIcon from '../components/icons/PlusIcon';
import XIcon from '../components/icons/XIcon';
import DownloadIcon from '../components/icons/DownloadIcon';

import ModernTemplate from '../components/invoice-templates/ModernTemplate';
import CreativeTemplate from '../components/invoice-templates/CreativeTemplate';
import MinimalTemplate from '../components/invoice-templates/MinimalTemplate';
import CompactTemplate from '../components/invoice-templates/CompactTemplate';
import ElegantTemplate from '../components/invoice-templates/ElegantTemplate';

interface InvoiceDetailProps {
    invoice: Invoice;
    customer?: Customer;
    companyInfo: CompanyInfo;
    onClose: () => void;
    customThemes: CustomTheme[];
    onAddCustomTheme: (theme: CustomTheme) => void;
}


interface Theme {
    name: string;
    color: string;
}

const predefinedThemes: Theme[] = [
    { name: 'purple', color: '#8b5cf6' },
    { name: 'teal', color: '#14b8a6' },
    { name: 'sky', color: '#38bdf8' },
    { name: 'rose', color: '#fb7185' },
    { name: 'green', color: '#4ade80' },
    { name: 'orange', color: '#f97316' },
];


const InvoiceDetail: React.FC<InvoiceDetailProps> = ({ invoice, customer, companyInfo, onClose, customThemes, onAddCustomTheme }) => {
    const [activeTheme, setActiveTheme] = useState<Theme>(predefinedThemes[0]);
    const [activeTemplate, setActiveTemplate] = useState('حرفه‌ای');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newThemeName, setNewThemeName] = useState('');
    const [newThemeColor, setNewThemeColor] = useState('#8b5cf6');
    const [isSavingImage, setIsSavingImage] = useState(false);

    const allThemes = useMemo(() => [...predefinedThemes, ...customThemes], [customThemes]);
    const templates = ['حرفه‌ای', 'خلاق', 'گرد', 'موج رنگی', 'جدولی'];

    const handlePrint = () => {
        window.print();
    };

    const handleSaveImage = () => {
        const invoiceElement = document.getElementById('invoice-to-print');
        if (invoiceElement && (window as any).html2canvas) {
            setIsSavingImage(true);
            (window as any).html2canvas(invoiceElement, {
                scale: 3,
                useCORS: true,
                backgroundColor: '#ffffff'
            }).then((canvas: HTMLCanvasElement) => {
                const link = document.createElement('a');
                link.download = `factor-${invoice.number}-${activeTemplate.toLowerCase()}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
                setIsSavingImage(false);
            }).catch((err: any) => {
                console.error("خطا در ذخیره عکس:", err);
                setIsSavingImage(false);
                alert('مشکلی در ذخیره عکس پیش آمد. لطفا دوباره تلاش کنید.');
            });
        } else {
            console.error('کتابخانه html2canvas یافت نشد.');
            alert('برای ذخیره عکس، لطفا صفحه را رفرش کرده و مجددا تلاش کنید.');
        }
    };

    const handleSaveCustomTheme = () => {
        if (newThemeName.trim() && !allThemes.some(t => t.name === newThemeName.trim())) {
            const newTheme = { name: newThemeName.trim(), color: newThemeColor };
            onAddCustomTheme(newTheme);
            setActiveTheme(newTheme);
            setIsModalOpen(false);
            setNewThemeName('');
        } else {
            alert('لطفا یک نام منحصر به فرد برای تم خود انتخاب کنید.');
        }
    };

    const renderTemplate = () => {
        const props = { invoice, customer, companyInfo, activeTheme };
        switch(activeTemplate) {
            case 'خلاق': return <CreativeTemplate {...props} />;
            case 'گرد': return <MinimalTemplate {...props} />;
            case 'موج رنگی': return <CompactTemplate {...props} />;
            case 'جدولی': return <ElegantTemplate {...props} />;
            case 'حرفه‌ای':
            default:
                return <ModernTemplate {...props} />;
        }
    };

    return (
        <div id="invoice-container">
            <div className="max-w-5xl mx-auto p-4 sm:p-0 font-sans">
                {/* --- Toolbar --- */}
                <div className="mb-6 flex flex-col justify-between items-center gap-4 print-hide">
                     <div className="w-full flex justify-between items-center">
                        <button onClick={onClose} className="flex items-center gap-2 text-slate-700 bg-white px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors border border-slate-300 shadow-sm">
                            <ArrowRightIcon />
                            <span>بازگشت</span>
                        </button>
                         <div className="flex items-center gap-4">
                             <button onClick={handleSaveImage} disabled={isSavingImage} className={`flex items-center gap-2 text-slate-700 bg-white px-4 py-2 rounded-lg hover:bg-slate-200 transition-colors border border-slate-300 shadow-sm disabled:opacity-50 disabled:cursor-wait`}>
                               {isSavingImage ? (
                                    <>
                                     <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-slate-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>در حال آماده سازی...</span>
                                    </>
                               ) : (
                                   <>
                                    <DownloadIcon />
                                    <span>ذخیره عکس</span>
                                   </>
                               )}
                            </button>
                            <button onClick={handlePrint} style={{ backgroundColor: activeTheme.color }} className={`flex items-center gap-2 text-white px-4 py-2 rounded-lg transition-all shadow-sm`}>
                                <PrinterIcon />
                                <span>چاپ / PDF</span>
                            </button>
                         </div>
                    </div>
                    <div className="w-full bg-white border border-slate-200 rounded-lg p-4 mt-4 shadow-sm flex flex-col md:flex-row gap-6 justify-between">
                         <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-slate-600">قالب:</span>
                            <div className="flex flex-wrap items-center gap-2">
                                {templates.map(template => (
                                    <button 
                                        key={template} 
                                        onClick={() => setActiveTemplate(template)} 
                                        className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${activeTemplate === template ? 'text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                        style={activeTemplate === template ? {backgroundColor: activeTheme.color} : {}}
                                    >
                                        {template}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-slate-600">رنگ:</span>
                            <div className="flex items-center gap-2">
                                {allThemes.map(theme => (
                                    <button 
                                        key={theme.name} 
                                        onClick={() => setActiveTheme(theme)} 
                                        className={`w-6 h-6 rounded-full transition-transform border-2 ${activeTheme.name === theme.name ? `ring-2 ring-offset-1` : 'border-white'}`}
                                        style={{
                                            backgroundColor: theme.color,
                                            borderColor: activeTheme.name === theme.name ? activeTheme.color : 'transparent',
                                        }}
                                        aria-label={`انتخاب تم ${theme.name}`}
                                    />
                                ))}
                                <button onClick={() => setIsModalOpen(true)} className="w-6 h-6 rounded-full bg-slate-200 text-slate-500 hover:bg-slate-300 flex items-center justify-center" aria-label="ایجاد تم جدید">
                                    <PlusIcon />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Invoice --- */}
                <div id="invoice-to-print" className="bg-white rounded-lg shadow-lg">
                    {renderTemplate()}
                </div>
            </div>

            {/* Custom Theme Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm" role="dialog" aria-modal="true">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="text-lg font-semibold">ایجاد تم رنگی جدید</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><XIcon /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label htmlFor="themeName" className="block text-sm font-medium text-slate-700 mb-1">نام تم</label>
                                <input
                                    type="text"
                                    id="themeName"
                                    value={newThemeName}
                                    onChange={(e) => setNewThemeName(e.target.value)}
                                    className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                                    placeholder="مثلا: برند اصلی"
                                />
                            </div>
                            <div>
                                <label htmlFor="themeColor" className="block text-sm font-medium text-slate-700 mb-1">انتخاب رنگ</label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        id="themeColor"
                                        value={newThemeColor}
                                        onChange={(e) => setNewThemeColor(e.target.value)}
                                        className="w-12 h-12 p-1 border border-slate-300 rounded-lg cursor-pointer"
                                    />
                                    <div className="w-full p-2.5 border border-slate-300 rounded-lg font-mono text-center text-white" style={{ backgroundColor: newThemeColor }}>
                                        {newThemeColor}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-end p-4 bg-slate-50 border-t">
                            <button onClick={() => setIsModalOpen(false)} className="bg-transparent hover:bg-slate-200 px-4 py-2 rounded-lg ml-2">انصراف</button>
                            <button onClick={handleSaveCustomTheme} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">ذخیره تم</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InvoiceDetail;
