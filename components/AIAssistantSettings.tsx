
import React, { useState, useEffect } from 'react';
import { AIAssistantSettings } from '../types';

interface AIAssistantSettingsProps {
    settings: AIAssistantSettings;
    onSave: (newSettings: AIAssistantSettings) => void;
}

const AIAssistantSettingsComponent: React.FC<AIAssistantSettingsProps> = ({ settings, onSave }) => {
    const [formData, setFormData] = useState<AIAssistantSettings>(settings);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        setFormData(settings);
    }, [settings]);

    const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value as any }));
    };

    const handleToolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            enabledTools: {
                ...prev.enabledTools,
                [name]: checked
            }
        }));
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: checked }));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/50">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 pb-4 border-b">تنظیمات دستیار هوشمند</h2>
            <form onSubmit={handleSubmit} className="space-y-8">
                
                <fieldset>
                    <legend className="text-lg font-semibold text-slate-700 mb-3">شخصیت و لحن</legend>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">شخصیت دستیار</label>
                            <div className="space-y-2">
                                <label className="flex items-center">
                                    <input type="radio" name="personality" value="accountant" checked={formData.personality === 'accountant'} onChange={handleRadioChange} className="w-4 h-4 text-purple-600" />
                                    <span className="mr-2 text-sm">حسابدار دقیق (تمرکز بر اعداد و گزارش)</span>
                                </label>
                                <label className="flex items-center">
                                    <input type="radio" name="personality" value="advisor" checked={formData.personality === 'advisor'} onChange={handleRadioChange} className="w-4 h-4 text-purple-600" />
                                    <span className="mr-2 text-sm">مشاور کسب‌وکار (ارائه تحلیل و پیشنهاد)</span>
                                </label>
                                <label className="flex items-center">
                                    <input type="radio" name="personality" value="creative" checked={formData.personality === 'creative'} onChange={handleRadioChange} className="w-4 h-4 text-purple-600" />
                                    <span className="mr-2 text-sm">دستیار خلاق (ارائه ایده‌های جدید)</span>
                                </label>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">لحن پاسخ</label>
                            <div className="flex items-center space-x-6 space-x-reverse">
                                <label className="flex items-center">
                                    <input type="radio" name="tone" value="friendly" checked={formData.tone === 'friendly'} onChange={handleRadioChange} className="w-4 h-4 text-purple-600" />
                                    <span className="mr-2 text-sm">دوستانه</span>
                                </label>
                                <label className="flex items-center">
                                    <input type="radio" name="tone" value="formal" checked={formData.tone === 'formal'} onChange={handleRadioChange} className="w-4 h-4 text-purple-600" />
                                    <span className="mr-2 text-sm">رسمی</span>
                                </label>
                            </div>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">جزئیات پاسخ</label>
                            <div className="flex items-center space-x-6 space-x-reverse">
                                <label className="flex items-center">
                                    <input type="radio" name="verbosity" value="concise" checked={formData.verbosity === 'concise'} onChange={handleRadioChange} className="w-4 h-4 text-purple-600" />
                                    <span className="mr-2 text-sm">خلاصه</span>
                                </label>
                                <label className="flex items-center">
                                    <input type="radio" name="verbosity" value="normal" checked={formData.verbosity === 'normal'} onChange={handleRadioChange} className="w-4 h-4 text-purple-600" />
                                    <span className="mr-2 text-sm">معمولی</span>
                                </label>
                                <label className="flex items-center">
                                    <input type="radio" name="verbosity" value="detailed" checked={formData.verbosity === 'detailed'} onChange={handleRadioChange} className="w-4 h-4 text-purple-600" />
                                    <span className="mr-2 text-sm">با جزئیات</span>
                                </label>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">زبان پاسخ</label>
                            <div className="flex items-center space-x-6 space-x-reverse">
                                <label className="flex items-center">
                                    <input type="radio" name="language" value="persian" checked={formData.language === 'persian'} onChange={handleRadioChange} className="w-4 h-4 text-purple-600" />
                                    <span className="mr-2 text-sm">فارسی</span>
                                </label>
                                <label className="flex items-center">
                                    <input type="radio" name="language" value="english" checked={formData.language === 'english'} onChange={handleRadioChange} className="w-4 h-4 text-purple-600" />
                                    <span className="mr-2 text-sm">انگلیسی</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend className="text-lg font-semibold text-slate-700 mb-3">قابلیت‌ها و دسترسی</legend>
                     <div className="mb-4">
                        <label className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 cursor-pointer">
                            <div>
                                <span className="text-sm font-medium text-slate-700">پیام خوشامدگویی هوشمند</span>
                                <p className="text-xs text-slate-500">در شروع، موارد فوری مانند چک‌های برگشتی را یادآوری کند.</p>
                            </div>
                            <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                                <input type="checkbox" name="proactiveGreeting" id="proactiveGreeting" checked={formData.proactiveGreeting} onChange={handleToggleChange} className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"/>
                                <label htmlFor="proactiveGreeting" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                            </div>
                            <style>{`.toggle-checkbox:checked { right: 0; border-color: #7c3aed; } .toggle-checkbox:checked + .toggle-label { background-color: #7c3aed; }`}</style>
                        </label>
                     </div>
                     <p className="text-sm text-slate-600 mb-2 font-medium">ابزارهای فعال</p>
                    <p className="text-sm text-slate-500 mb-3">با غیرفعال کردن ابزارها، دستیار هوشمند توانایی مشاهده یا تغییر اطلاعات مربوط به آن بخش را از دست می‌دهد.</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <label className="flex items-center p-3 border rounded-lg hover:bg-slate-50 cursor-pointer">
                            <input type="checkbox" name="customers" checked={formData.enabledTools.customers} onChange={handleToolChange} className="w-5 h-5 text-purple-600 rounded" />
                            <span className="mr-3 text-sm font-medium text-slate-700">مشتریان</span>
                        </label>
                        <label className="flex items-center p-3 border rounded-lg hover:bg-slate-50 cursor-pointer">
                            <input type="checkbox" name="invoices" checked={formData.enabledTools.invoices} onChange={handleToolChange} className="w-5 h-5 text-purple-600 rounded" />
                            <span className="mr-3 text-sm font-medium text-slate-700">فاکتورها</span>
                        </label>
                        <label className="flex items-center p-3 border rounded-lg hover:bg-slate-50 cursor-pointer">
                            <input type="checkbox" name="checks" checked={formData.enabledTools.checks} onChange={handleToolChange} className="w-5 h-5 text-purple-600 rounded" />
                            <span className="mr-3 text-sm font-medium text-slate-700">چک‌ها</span>
                        </label>
                        <label className="flex items-center p-3 border rounded-lg hover:bg-slate-50 cursor-pointer">
                            <input type="checkbox" name="transactions" checked={formData.enabledTools.transactions} onChange={handleToolChange} className="w-5 h-5 text-purple-600 rounded" />
                            <span className="mr-3 text-sm font-medium text-slate-700">تراکنش‌ها</span>
                        </label>
                    </div>
                </fieldset>
                
                 <fieldset>
                    <legend className="text-lg font-semibold text-slate-700 mb-3">دستورالعمل‌های سفارشی</legend>
                     <p className="text-sm text-slate-500 mb-3">به دستیار هوشمند بگویید چگونه رفتار کند یا به چه نکاتی توجه ویژه داشته باشد. (مثال: همیشه مشتریان را با نام خانوادگی خطاب کن.)</p>
                     <textarea 
                        name="customInstructions" 
                        value={formData.customInstructions}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="دستورالعمل‌های خود را اینجا بنویسید..."
                     />
                </fieldset>

                <div className="flex items-center justify-end pt-4 border-t">
                    {isSaved && <span className="text-green-600 ml-4 transition-opacity duration-300">تغییرات با موفقیت ذخیره شد!</span>}
                    <button type="submit" className="bg-purple-600 text-white px-6 py-2.5 rounded-lg hover:bg-purple-700 transition-colors font-semibold">
                        ذخیره تغییرات AI
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AIAssistantSettingsComponent;
