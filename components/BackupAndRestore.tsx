import React from 'react';
import { AppData } from '../types';
import ExportIcon from './icons/ExportIcon';
import ImportIcon from './icons/ImportIcon';

interface BackupAndRestoreProps {
    onExport: () => void;
    onImport: (data: AppData) => void;
}

const BackupAndRestore: React.FC<BackupAndRestoreProps> = ({ onExport, onImport }) => {

    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const text = e.target?.result;
                    if (typeof text === 'string') {
                        const data = JSON.parse(text);
                        onImport(data);
                    }
                } catch (error) {
                    alert('فایل پشتیبان معتبر نیست یا خراب شده است.');
                    console.error("Error parsing imported file:", error);
                }
            };
            reader.readAsText(file);
            event.target.value = '';
        }
    };
    
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/50">
            <h2 className="text-2xl font-bold text-slate-800 mb-4 pb-4 border-b">پشتیبان‌گیری و بازیابی</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div>
                    <h3 className="font-semibold text-slate-700 mb-2">خروجی گرفتن از اطلاعات (Backup)</h3>
                    <p className="text-sm text-slate-500 mb-4">از تمام اطلاعات برنامه (مشتریان، فاکتورها، چک ها، و...) یک فایل پشتیبان با فرمت JSON تهیه کنید. این فایل را در مکانی امن نگهداری کنید.</p>
                    <button onClick={onExport} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2">
                       <ExportIcon />
                       <span>دریافت فایل پشتیبان</span>
                    </button>
                </div>
                 <div className="border-t md:border-t-0 md:border-r md:pr-6 pt-6 md:pt-0">
                    <h3 className="font-semibold text-slate-700 mb-2">بازیابی اطلاعات (Restore)</h3>
                    <p className="text-sm text-slate-500 mb-4"><span className="font-bold text-red-600">هشدار:</span> با بازیابی اطلاعات از فایل پشتیبان، تمام اطلاعات فعلی شما پاک خواهد شد.</p>
                    <label htmlFor="import-file" className="bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center gap-2 cursor-pointer">
                       <ImportIcon />
                       <span>انتخاب و بارگذاری فایل</span>
                    </label>
                     <input type="file" id="import-file" accept=".json" className="hidden" onChange={handleFileImport} />
                </div>
            </div>
        </div>
    );
};

export default BackupAndRestore;
