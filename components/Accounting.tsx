
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Transaction, TransactionType } from '../types';
import EditIcon from './icons/EditIcon';
import TrashIcon from './icons/TrashIcon';
import SearchIcon from './icons/SearchIcon';
import XIcon from './icons/XIcon';
import ActionBar from './ActionBar';
import ConfirmationModal from './ConfirmationModal';
import { formatCurrency } from '../utils';

interface AccountingProps {
  transactions: Transaction[];
  onAdd: (transactionData: Omit<Transaction, 'id'>) => void;
  onUpdate: (transactionData: Omit<Transaction, 'id'>, id: number) => void;
  onDelete: (id: number) => void;
  onDeleteMultiple: (ids: Set<number>) => void;
}

const Accounting: React.FC<AccountingProps> = ({ transactions, onAdd, onUpdate, onDelete, onDeleteMultiple }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [deletingMultiple, setDeletingMultiple] = useState(false);

    const emptyFormState: Omit<Transaction, 'id'> = {
        type: TransactionType.Expense,
        date: new Date().toLocaleDateString('fa-IR-u-nu-latn').split('/').join('/'),
        description: '',
        category: '',
        amount: 0,
    };
    const [formData, setFormData] = useState(emptyFormState);
    
    useEffect(() => {
        if (editingTransaction) {
            setFormData({
                type: editingTransaction.type,
                date: editingTransaction.date,
                description: editingTransaction.description,
                category: editingTransaction.category,
                amount: editingTransaction.amount,
            });
        }
    }, [editingTransaction]);

    const { totalIncome, totalExpense, balance } = useMemo(() => {
        const income = transactions
            .filter(t => t.type === TransactionType.Income)
            .reduce((sum, t) => sum + t.amount, 0);
        const expense = transactions
            .filter(t => t.type === TransactionType.Expense)
            .reduce((sum, t) => sum + t.amount, 0);
        return { totalIncome: income, totalExpense: expense, balance: income - expense };
    }, [transactions]);
    
    const handleOpenAddModal = () => {
        setEditingTransaction(null);
        setFormData(emptyFormState);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (transaction: Transaction) => {
        setEditingTransaction(transaction);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTransaction(null);
    };
    
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalFormData = { ...formData, amount: Number(formData.amount) };
        if (editingTransaction) {
            onUpdate(finalFormData, editingTransaction.id);
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
    
    const filteredTransactions = useMemo(() =>
        [...transactions].sort((a,b) => b.id - a.id).filter(t => {
            const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || t.category.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesFilter = filter === 'all' || (filter === 'income' && t.type === TransactionType.Income) || (filter === 'expense' && t.type === TransactionType.Expense);
            return matchesSearch && matchesFilter;
        }), [transactions, searchTerm, filter]
    );

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
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/50">
                        <p className="text-sm font-medium text-slate-500">مجموع درآمد</p>
                        <p className="text-3xl font-bold text-green-600 mt-2">{formatCurrency(totalIncome)} تومان</p>
                    </div>
                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/50">
                        <p className="text-sm font-medium text-slate-500">مجموع هزینه</p>
                        <p className="text-3xl font-bold text-red-600 mt-2">{formatCurrency(totalExpense)} تومان</p>
                    </div>
                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/50">
                        <p className="text-sm font-medium text-slate-500">مانده حساب</p>
                        <p className={`text-3xl font-bold mt-2 ${balance >= 0 ? 'text-slate-800' : 'text-red-600'}`}>
                            {formatCurrency(balance)} تومان
                        </p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200/50">
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <div className="flex items-center gap-4 w-full md:w-auto">
                           <div className="relative flex-grow md:flex-grow-0">
                                <span className="absolute inset-y-0 right-0 flex items-center pr-3">
                                    <SearchIcon />
                                </span>
                                <input
                                    type="text"
                                    placeholder="جستجو در شرح..."
                                    className="w-full md:w-56 p-2.5 pr-10 text-sm border-none rounded-xl bg-slate-100 focus:ring-2 focus:ring-purple-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <select value={filter} onChange={e => setFilter(e.target.value as any)} className="p-2.5 border-none rounded-xl text-sm bg-slate-100 focus:ring-2 focus:ring-purple-500">
                                <option value="all">همه تراکنش ها</option>
                                <option value="income">فقط درآمدها</option>
                                <option value="expense">فقط هزینه ها</option>
                            </select>
                        </div>
                        <button 
                            onClick={handleOpenAddModal}
                            className="bg-purple-600 text-white px-5 py-2.5 rounded-xl hover:bg-purple-700 transition-colors w-full md:w-auto font-semibold shadow-lg shadow-purple-500/20"
                        >
                            ثبت تراکنش جدید
                        </button>
                    </div>
                    <div className="space-y-2">
                         <div className="hidden md:grid grid-cols-[auto,1fr,1fr,1fr,auto] gap-4 p-4 text-sm font-semibold text-slate-500">
                            <div/>
                            <span>شرح</span>
                            <span>دسته بندی</span>
                            <span>تاریخ</span>
                            <span className="text-left">مبلغ</span>
                         </div>
                        {filteredTransactions.map(t => (
                            <div key={t.id} className="grid grid-cols-[auto,1fr,auto] md:grid-cols-[auto,1fr,1fr,1fr,auto] items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:shadow-sm transition-shadow">
                                <input type="checkbox" checked={selectedIds.has(t.id)} onChange={() => handleSelect(t.id)} className="w-5 h-5 rounded text-purple-500 focus:ring-purple-400" />
                                <div className="col-span-2 md:col-span-1">
                                    <div className="font-bold text-slate-800">{t.description}</div>
                                    <div className="text-xs text-slate-500 md:hidden mt-1">{t.category} - {t.date}</div>
                                </div>
                                <div className="hidden md:block text-sm text-slate-500">{t.category}</div>
                                <div className="hidden md:block text-sm text-slate-500">{t.date}</div>
                                <div className="text-left flex items-center justify-end gap-2">
                                    <span className={`font-bold text-sm ${t.type === TransactionType.Income ? 'text-green-600' : 'text-red-600'}`}>
                                      {t.type === TransactionType.Expense ? '(-)' : ''} {formatCurrency(t.amount)}
                                    </span>
                                    <button onClick={() => handleOpenEditModal(t)} className="p-2 text-blue-500 hover:bg-blue-100 rounded-full transition-colors"><EditIcon /></button>
                                    <button onClick={() => handleDeleteRequest(t.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors"><TrashIcon /></button>
                                </div>
                            </div>
                        ))}
                         {filteredTransactions.length === 0 && (
                            <div className="text-center text-slate-400 py-10 bg-slate-50 rounded-2xl">
                                تراکنشی یافت نشد.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ActionBar selectedCount={selectedIds.size} onDeleteClick={handleDeleteMultipleRequest} onClear={() => setSelectedIds(new Set())} />

            <ConfirmationModal
                isOpen={showConfirmModal}
                onClose={closeConfirmModal}
                onConfirm={confirmDelete}
                title="تایید حذف"
                message={deletingMultiple 
                    ? `آیا از حذف ${selectedIds.size} تراکنش انتخاب شده مطمئن هستید؟` 
                    : "آیا از حذف این تراکنش مطمئن هستید؟ این عمل قابل بازگشت نیست."
                }
            />

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex items-center justify-center p-4">
                  <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg" role="dialog">
                    <div className="flex items-center justify-between p-4 border-b">
                      <h3 className="text-lg font-semibold text-slate-800">
                        {editingTransaction ? 'ویرایش تراکنش' : 'ثبت تراکنش جدید'}
                      </h3>
                      <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600"><XIcon /></button>
                    </div>
                    <form onSubmit={handleFormSubmit}>
                      <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">نوع تراکنش</label>
                            <select name="type" value={formData.type} onChange={handleFormChange} className="w-full p-2.5 border border-slate-300 rounded-lg">
                                {Object.values(TransactionType).map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                         <div>
                            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">شرح</label>
                            <input type="text" name="description" id="description" value={formData.description} onChange={handleFormChange} required className="w-full p-2.5 border border-slate-300 rounded-lg" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div>
                                <label htmlFor="amount" className="block text-sm font-medium text-slate-700 mb-1">مبلغ (تومان)</label>
                                <input type="number" name="amount" id="amount" value={formData.amount} onChange={handleFormChange} required className="w-full p-2.5 border border-slate-300 rounded-lg" />
                            </div>
                           <div>
                                <label htmlFor="date" className="block text-sm font-medium text-slate-700 mb-1">تاریخ</label>
                                <input type="text" name="date" id="date" value={formData.date} onChange={handleFormChange} required className="w-full p-2.5 border border-slate-300 rounded-lg" />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">دسته بندی</label>
                            <input type="text" name="category" id="category" value={formData.category} onChange={handleFormChange} required className="w-full p-2.5 border border-slate-300 rounded-lg" placeholder="مثال: حقوق، اجاره، فروش..." />
                        </div>
                      </div>
                      <div className="flex items-center justify-end p-4 bg-slate-50 border-t">
                        <button type="button" onClick={handleCloseModal} className="text-slate-600 bg-transparent hover:bg-slate-200 px-4 py-2 rounded-lg ml-2">انصراف</button>
                        <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">ذخیره</button>
                      </div>
                    </form>
                  </div>
                </div>
            )}
        </>
    );
};

export default Accounting;