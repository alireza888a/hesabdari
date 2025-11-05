
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Check, Customer, CheckType, CheckStatus } from '../types';
import EditIcon from './icons/EditIcon';
import TrashIcon from './icons/TrashIcon';
import SearchIcon from './icons/SearchIcon';
import XIcon from './icons/XIcon';
import ActionBar from './ActionBar';
import ConfirmationModal from './ConfirmationModal';
import { formatCurrency } from '../utils';

interface ChecksProps {
  checks: Check[];
  customers: Customer[];
  onAdd: (checkData: Omit<Check, 'id'>) => void;
  onUpdate: (checkData: Omit<Check, 'id'>, id: number) => void;
  onDelete: (id: number) => void;
  onDeleteMultiple: (ids: Set<number>) => void;
}

const Checks: React.FC<ChecksProps> = ({ checks, customers, onAdd, onUpdate, onDelete, onDeleteMultiple }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCheck, setEditingCheck] = useState<Check | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [deletingMultiple, setDeletingMultiple] = useState(false);

    const emptyFormState: Omit<Check, 'id'> = {
        type: CheckType.Received,
        customerId: 0,
        checkNumber: '',
        bankName: '',
        amount: 0,
        issueDate: new Date().toLocaleDateString('fa-IR-u-nu-latn').split('/').join('/'),
        dueDate: '',
        status: CheckStatus.Pending,
        description: '',
    };
    const [formData, setFormData] = useState(emptyFormState);

    useEffect(() => {
        if (editingCheck) {
            setFormData({
                type: editingCheck.type,
                customerId: editingCheck.customerId,
                checkNumber: editingCheck.checkNumber,
                bankName: editingCheck.bankName,
                amount: editingCheck.amount,
                issueDate: editingCheck.issueDate,
                dueDate: editingCheck.dueDate,
                status: editingCheck.status,
                description: editingCheck.description,
            });
        }
    }, [editingCheck]);

    const handleOpenAddModal = () => {
        setEditingCheck(null);
        setFormData(emptyFormState);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (check: Check) => {
        setEditingCheck(check);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCheck(null);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalFormData = {
            ...formData,
            customerId: Number(formData.customerId),
            amount: Number(formData.amount),
        };

        if (editingCheck) {
            onUpdate(finalFormData, editingCheck.id);
        } else {
            onAdd(finalFormData);
        }
        handleCloseModal();
    };

    const handleDeleteRequest = (id: number) => {
        setDeletingId(id);
        setDeletingMultiple(false);
        setShowConfirmModal(true);
    };

    const handleDeleteMultipleRequest = () => {
        if (selectedIds.size > 0) {
            setDeletingMultiple(true);
            setShowConfirmModal(true);
        }
    };

    const confirmDelete = () => {
        if (deletingMultiple) {
            onDeleteMultiple(selectedIds);
            setSelectedIds(new Set());
        } else if (deletingId !== null) {
            onDelete(deletingId);
        }
        closeConfirmModal();
    };

    const closeConfirmModal = () => {
        setShowConfirmModal(false);
        setDeletingId(null);
        setDeletingMultiple(false);
    };
    
    const customerMap = useMemo(() => {
        return customers.reduce((acc, customer) => {
            acc[customer.id] = `${customer.firstName} ${customer.lastName}`;
            return acc;
        }, {} as Record<number, string>);
    }, [customers]);

    const filteredChecks = useMemo(() =>
        [...checks].sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()).filter(check =>
            check.checkNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            check.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (customerMap[check.customerId] && customerMap[check.customerId].toLowerCase().includes(searchTerm.toLowerCase()))
        ), [checks, searchTerm, customerMap]
    );

    const getStatusClass = (status: CheckStatus) => {
        switch (status) {
            case CheckStatus.Cleared: return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-r-4 border-green-500' };
            case CheckStatus.Pending: return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-r-4 border-yellow-500' };
            case CheckStatus.Bounced: return { bg: 'bg-red-100', text: 'text-red-800', border: 'border-r-4 border-red-500' };
            case CheckStatus.Spent: return { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-r-4 border-blue-500' };
            default: return { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-r-4 border-slate-400' };
        }
    };

    const handleSelect = (id: number) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };

  return (
    <>
      <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200/50">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full md:w-auto">
              <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <SearchIcon />
              </span>
              <input
                  type="text"
                  placeholder="جستجو بر اساس شماره، مشتری..."
                  className="w-full md:w-64 p-2.5 pr-10 text-sm text-slate-900 border-none rounded-xl bg-slate-100 focus:ring-2 focus:ring-purple-500 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="جستجوی چک"
              />
          </div>
          <button 
              onClick={handleOpenAddModal}
              className="bg-purple-600 text-white px-5 py-2.5 rounded-xl hover:bg-purple-700 transition-colors w-full md:w-auto font-semibold shadow-lg shadow-purple-500/20"
          >
            ثبت چک جدید
          </button>
        </div>
        
        <div className="space-y-3">
             {filteredChecks.map(check => {
                const statusClasses = getStatusClass(check.status);
                return (
                    <div key={check.id} className={`flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow ${statusClasses.border}`}>
                        <input type="checkbox" checked={selectedIds.has(check.id)} onChange={() => handleSelect(check.id)} className="w-5 h-5 rounded text-purple-500 focus:ring-purple-400" />
                        <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-4 items-center">
                            <div>
                                <div className="font-bold font-mono text-slate-800">{check.checkNumber}</div>
                                <div className="text-xs text-slate-500">{check.bankName}</div>
                            </div>
                            <div className="hidden md:block">
                                <div className={`font-semibold text-sm ${check.type === CheckType.Received ? 'text-green-600' : 'text-red-600'}`}>{check.type}</div>
                                <div className="text-xs text-slate-500">{customerMap[check.customerId] || 'حذف شده'}</div>
                            </div>
                            <div className="hidden md:block">
                                <div className="font-semibold text-sm text-slate-700">{check.dueDate}</div>
                                <div className="text-xs text-slate-500">تاریخ سررسید</div>
                            </div>
                            <div className="text-center">
                                <span className={`px-3 py-1 text-xs font-semibold tracking-wider rounded-full ${statusClasses.bg} ${statusClasses.text}`}>
                                    {check.status}
                                </span>
                            </div>
                            <div className="text-left flex items-center justify-end gap-2">
                                <span className="font-bold text-slate-800 text-sm">{formatCurrency(check.amount)}</span>
                                <div className="flex items-center">
                                    <button onClick={() => handleOpenEditModal(check)} className="p-2 text-blue-500 hover:bg-blue-100 rounded-full transition-colors" aria-label={`ویرایش چک ${check.checkNumber}`}><EditIcon /></button>
                                    <button onClick={() => handleDeleteRequest(check.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors" aria-label={`حذف چک ${check.checkNumber}`}><TrashIcon /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
             })}
              {filteredChecks.length === 0 && (
                <div className="text-center text-slate-400 py-10 bg-slate-50 rounded-2xl">
                    چکی با این مشخصات یافت نشد.
                </div>
            )}
        </div>

      </div>
      
      <ActionBar selectedCount={selectedIds.size} onDeleteClick={handleDeleteMultipleRequest} onClear={() => setSelectedIds(new Set())} />

      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={closeConfirmModal}
        onConfirm={confirmDelete}
        title="تایید حذف"
        message={deletingMultiple 
            ? `آیا از حذف ${selectedIds.size} چک انتخاب شده مطمئن هستید؟` 
            : "آیا از حذف این چک مطمئن هستید؟ این عمل قابل بازگشت نیست."
        }
      />

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" role="dialog" aria-modal="true">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-slate-800">
                {editingCheck ? 'ویرایش چک' : 'ثبت چک جدید'}
              </h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600" aria-label="بستن"><XIcon /></button>
            </div>
            <form onSubmit={handleFormSubmit} className="flex-grow overflow-y-auto">
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-slate-700 mb-1">نوع چک</label>
                        <select name="type" id="type" value={formData.type} onChange={handleFormChange} className="w-full p-2.5 border border-slate-300 rounded-lg">
                            {Object.values(CheckType).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="customerId" className="block text-sm font-medium text-slate-700 mb-1">مشتری / طرف حساب</label>
                        <select name="customerId" id="customerId" value={formData.customerId} onChange={handleFormChange} required className="w-full p-2.5 border border-slate-300 rounded-lg">
                            <option value="">انتخاب کنید</option>
                            {customers.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="checkNumber" className="block text-sm font-medium text-slate-700 mb-1">شماره چک</label>
                        <input type="text" name="checkNumber" id="checkNumber" value={formData.checkNumber} onChange={handleFormChange} required className="w-full p-2.5 border border-slate-300 rounded-lg" dir="ltr" />
                    </div>
                     <div>
                        <label htmlFor="bankName" className="block text-sm font-medium text-slate-700 mb-1">نام بانک</label>
                        <input type="text" name="bankName" id="bankName" value={formData.bankName} onChange={handleFormChange} required className="w-full p-2.5 border border-slate-300 rounded-lg" />
                    </div>
                </div>
                 <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-slate-700 mb-1">مبلغ (تومان)</label>
                    <input type="number" name="amount" id="amount" value={formData.amount} onChange={handleFormChange} required className="w-full p-2.5 border border-slate-300 rounded-lg" />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="issueDate" className="block text-sm font-medium text-slate-700 mb-1">تاریخ صدور</label>
                        <input type="text" name="issueDate" id="issueDate" value={formData.issueDate} onChange={handleFormChange} required className="w-full p-2.5 border border-slate-300 rounded-lg" />
                    </div>
                     <div>
                        <label htmlFor="dueDate" className="block text-sm font-medium text-slate-700 mb-1">تاریخ سررسید</label>
                        <input type="text" name="dueDate" id="dueDate" value={formData.dueDate} onChange={handleFormChange} required className="w-full p-2.5 border border-slate-300 rounded-lg" />
                    </div>
                </div>
                 <div>
                    <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1">وضعیت</label>
                    <select name="status" id="status" value={formData.status} onChange={handleFormChange} className="w-full p-2.5 border border-slate-300 rounded-lg">
                        {Object.values(CheckStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">توضیحات</label>
                    <textarea name="description" id="description" value={formData.description} onChange={handleFormChange} rows={3} className="w-full p-2.5 border border-slate-300 rounded-lg"></textarea>
                </div>
              </div>
              <div className="flex items-center justify-end p-4 bg-slate-50 border-t sticky bottom-0">
                <button type="button" onClick={handleCloseModal} className="text-slate-600 bg-transparent hover:bg-slate-200 px-4 py-2 rounded-lg ml-2">انصراف</button>
                <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">ذخیره چک</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Checks;