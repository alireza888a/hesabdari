import React, { useState, useEffect } from 'react';
import { ThemeSettings } from '../types';

interface AppearanceSettingsProps {
    themeSettings: ThemeSettings;
    onSave: (newSettings: ThemeSettings) => void;
}

const AppearanceSettings: React.FC<AppearanceSettingsProps> = ({ themeSettings, onSave }) => {
    const [formData, setFormData] = useState<ThemeSettings>(themeSettings);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        setFormData(themeSettings);
    }, [themeSettings]);

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
            <h2 className="text-2xl font-bold text-slate-800 mb-6 pb-4 border-b">تنظیمات ظاهری</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                 <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <legend className="text-lg font-semibold text-slate-700 mb-2 col-span-full">رنگ‌بندی سایدبار</legend>
                    <div>
                        <label htmlFor="sidebarGradientStart" className="block text-sm font-medium text-slate-700 mb-2">شروع گرادینت</label>
                        <div className="flex items-center gap-3">
                            <input type="color" id="sidebarGradientStart" name="sidebarGradientStart" value={formData.sidebarGradientStart} onChange={handleChange} className="w-12 h-12 p-1 border border-slate-300 rounded-lg cursor-pointer" />
                            <input type="text" value={formData.sidebarGradientStart} onChange={handleChange} name="sidebarGradientStart" className={inputClass + " font-mono"} dir="ltr" />
                        </div>
                    </div>
                     <div>
                        <label htmlFor="sidebarGradientEnd" className="block text-sm font-medium text-slate-700 mb-2">پایان گرادینت</label>
                        <div className="flex items-center gap-3">
                            <input type="color" id="sidebarGradientEnd" name="sidebarGradientEnd" value={formData.sidebarGradientEnd} onChange={handleChange} className="w-12 h-12 p-1 border border-slate-300 rounded-lg cursor-pointer" />
                            <input type="text" value={formData.sidebarGradientEnd} onChange={handleChange} name="sidebarGradientEnd" className={inputClass + " font-mono"} dir="ltr" />
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
                        ذخیره پوسته
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AppearanceSettings;
