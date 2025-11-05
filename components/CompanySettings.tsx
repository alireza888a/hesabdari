import React, { useState, useEffect } from 'react';
import { CompanyInfo } from '../types';

interface CompanySettingsProps {
    companyInfo: CompanyInfo;
    onSave: (newInfo: CompanyInfo) => void;
}

const CompanySettings: React.FC<CompanySettingsProps> = ({ companyInfo, onSave }) => {
    const [formData, setFormData] = useState<CompanyInfo>(companyInfo);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        setFormData(companyInfo);
    }, [companyInfo]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };
    
    const inputClass = "w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white";

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/50">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 pb-4 border-b">تنظیمات شرکت</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                
                <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <legend className="text-lg font-semibold text-slate-700 mb-2 col-span-full">اطلاعات اصلی</legend>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">نام شرکت</label>
                        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                        <label htmlFor="tagline" className="block text-sm font-medium text-slate-700 mb-1">شعار / توضیح کوتاه</label>
                        <input type="text" id="tagline" name="tagline" value={formData.tagline || ''} onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                        <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-1">آدرس</label>
                        <input type="text" id="address" name="address" value={formData.address} onChange={handleChange} className={inputClass} />
                    </div>
                    <div>
                        <label htmlFor="contactPerson" className="block text-sm font-medium text-slate-700 mb-1">نام مسئول / مدیر</label>
                        <input type="text" id="contactPerson" name="contactPerson" value={formData.contactPerson || ''} onChange={handleChange} className={inputClass} />
                    </div>
                </fieldset>

                <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <legend className="text-lg font-semibold text-slate-700 mb-2 col-span-full">اطلاعات تماس</legend>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">تلفن</label>
                        <input type="text" id="phone" name="phone" value={formData.phone} onChange={handleChange} className={inputClass} dir="ltr" />
                    </div>
                     <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">ایمیل</label>
                        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} dir="ltr" />
                    </div>
                    <div>
                        <label htmlFor="website" className="block text-sm font-medium text-slate-700 mb-1">وب‌سایت</label>
                        <input type="text" id="website" name="website" value={formData.website || ''} onChange={handleChange} className={inputClass} dir="ltr" />
                    </div>
                </fieldset>

                <fieldset>
                    <legend className="text-lg font-semibold text-slate-700 mb-2 col-span-full">اطلاعات پرداخت (برای نمایش در فاکتور)</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div>
                            <label htmlFor="paymentMethod1_title" className="block text-sm font-medium text-slate-700 mb-1">عنوان روش پرداخت ۱</label>
                            <input type="text" id="paymentMethod1_title" name="paymentMethod1_title" value={formData.paymentMethod1_title || ''} onChange={handleChange} className={inputClass} placeholder="مثال: کارت بانکی"/>
                        </div>
                        <div>
                            <label htmlFor="paymentMethod1_value" className="block text-sm font-medium text-slate-700 mb-1">مقدار روش پرداخت ۱</label>
                            <input type="text" id="paymentMethod1_value" name="paymentMethod1_value" value={formData.paymentMethod1_value || ''} onChange={handleChange} className={inputClass} dir="ltr" placeholder="مثال: ۶۰۳۷-۹۹۷۹-xxxx-xxxx"/>
                        </div>
                        <div>
                            <label htmlFor="paymentMethod2_title" className="block text-sm font-medium text-slate-700 mb-1">عنوان روش پرداخت ۲</label>
                            <input type="text" id="paymentMethod2_title" name="paymentMethod2_title" value={formData.paymentMethod2_title || ''} onChange={handleChange} className={inputClass} placeholder="مثال: شماره شبا"/>
                        </div>
                        <div>
                            <label htmlFor="paymentMethod2_value" className="block text-sm font-medium text-slate-700 mb-1">مقدار روش پرداخت ۲</label>
                            <input type="text" id="paymentMethod2_value" name="paymentMethod2_value" value={formData.paymentMethod2_value || ''} onChange={handleChange} className={inputClass} dir="ltr" placeholder="مثال: IR..."/>
                        </div>
                    </div>
                </fieldset>

                <div className="flex items-center justify-end pt-4 border-t">
                    {isSaved && (
                        <span className="text-green-600 ml-4 flex items-center gap-2 transition-opacity duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                            تغییرات با موفقیت ذخیره شد!
                        </span>
                    )}
                    <button type="submit" className="bg-purple-600 text-white px-6 py-2.5 rounded-lg hover:bg-purple-700 transition-colors font-semibold">
                        ذخیره تغییرات
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CompanySettings;
