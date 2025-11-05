import React from 'react';
import DatePicker from './DatePicker';
import { DocumentPlusIcon } from '@heroicons/react/24/outline';

const InvoiceForm: React.FC = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Invoice submitted');
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md h-full flex flex-col">
      <h2 className="text-xl font-bold text-gray-800 mb-6">ایجاد فاکتور جدید</h2>
      <form onSubmit={handleSubmit} className="space-y-5 flex-grow">
        <div>
          <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
            نام مشتری
          </label>
          <input
            type="text"
            id="customerName"
            placeholder="مثال: شرکت نوین پردازش"
            className="w-full bg-gray-50 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-start)]"
          />
        </div>

        <DatePicker label="تاریخ صدور فاکتور" />

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            مبلغ کل (ریال)
          </label>
          <input
            type="text"
            id="amount"
            placeholder="مبلغ را به ریال وارد کنید"
            className="w-full bg-gray-50 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-start)]"
          />
        </div>
        
        <div className="flex-grow"></div>

        <div className="mt-auto pt-4">
            <button
              type="submit"
              className="w-full flex items-center justify-center px-4 py-3 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
              style={{
                backgroundImage: `linear-gradient(to right, var(--color-primary-start), var(--color-primary-end))`
              }}
            >
              <DocumentPlusIcon className="h-5 w-5 ml-2" />
              ثبت فاکتور
            </button>
        </div>
      </form>
    </div>
  );
};

export default InvoiceForm;
