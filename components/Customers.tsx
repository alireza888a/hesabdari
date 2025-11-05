
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import EditIcon from './icons/EditIcon';
import TrashIcon from './icons/TrashIcon';
import SearchIcon from './icons/SearchIcon';
import XIcon from './icons/XIcon';
import { Customer } from '../types';
import ActionBar from './ActionBar';
import ConfirmationModal from './ConfirmationModal';

interface CustomersProps {
  customers: Customer[];
  onAdd: (customerData: Omit<Customer, 'id' | 'code'>) => void;
  onUpdate: (customerData: Omit<Customer, 'id' | 'code'>, id: number) => void;
  onDelete: (id: number) => void;
  onDeleteMultiple: (ids: Set<number>) => void;
}

const Customers: React.FC<CustomersProps> = ({ customers, onAdd, onUpdate, onDelete, onDeleteMultiple }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deletingMultiple, setDeletingMultiple] = useState(false);
  
  const [formData, setFormData] = useState({
      firstName: '',
      lastName: '',
      phone: '',
      address: '',
  });

  useEffect(() => {
    if (editingCustomer) {
      setFormData({
        firstName: editingCustomer.firstName,
        lastName: editingCustomer.lastName,
        phone: editingCustomer.phone,
        address: editingCustomer.address,
      });
    }
  }, [editingCustomer]);

  const handleOpenAddModal = () => {
    setEditingCustomer(null);
    setFormData({ firstName: '', lastName: '', phone: '', address: '' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCustomer) {
      onUpdate(formData, editingCustomer.id);
    } else {
      onAdd(formData);
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

  const filteredCustomers = useMemo(() =>
    customers.filter(customer =>
      customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.code.includes(searchTerm) ||
      customer.phone.includes(searchTerm)
    ), [customers, searchTerm]);
    
  const handleSelect = (id: number) => {
    setSelectedIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        return newSet;
    });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredCustomers.map(c => c.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const isAllSelected = selectedIds.size > 0 && selectedIds.size === filteredCustomers.length;

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
                  placeholder="جستجو بر اساس نام، کد..."
                  className="w-full md:w-64 p-2.5 pr-10 text-sm text-slate-900 border-none rounded-xl bg-slate-100 focus:ring-2 focus:ring-purple-500 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="جستجوی مشتری"
              />
          </div>
          <button 
              onClick={handleOpenAddModal}
              className="bg-purple-600 text-white px-5 py-2.5 rounded-xl hover:bg-purple-700 transition-colors w-full md:w-auto font-semibold shadow-lg shadow-purple-500/20"
          >
            افزودن مشتری جدید
          </button>
        </div>
        
        <div className="space-y-2">
            <div className="hidden md:grid grid-cols-[auto,50px,1fr,1fr,1fr,2fr,100px] gap-4 p-4 text-sm font-semibold text-slate-500">
                <input type="checkbox" onChange={handleSelectAll} checked={isAllSelected} className="w-5 h-5 rounded text-purple-500 focus:ring-purple-400" />
                <span className="text-center">کد</span>
                <span>نام</span>
                <span>نام خانوادگی</span>
                <span>تلفن</span>
                <span>آدرس</span>
                <span className="text-center">عملیات</span>
            </div>
             {filteredCustomers.map(customer => (
                <div key={customer.id} className="grid grid-cols-[auto,1fr,1fr] md:grid-cols-[auto,50px,1fr,1fr,1fr,2fr,100px] items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:shadow-sm transition-shadow">
                    <input type="checkbox" checked={selectedIds.has(customer.id)} onChange={() => handleSelect(customer.id)} className="w-5 h-5 rounded text-purple-500 focus:ring-purple-400" />
                    
                    <div className="hidden md:block text-sm text-slate-700 font-mono text-center font-medium">{customer.code}</div>

                    <div className="col-span-2 md:col-span-1">
                        <div className="font-bold text-slate-800">{customer.firstName}</div>
                        <div className="text-xs text-slate-500 md:hidden mt-1">{customer.phone}</div>
                    </div>
                    
                    <div className="hidden md:block text-sm text-slate-700 font-medium">{customer.lastName}</div>
                    <div className="hidden md:block text-sm text-slate-700 font-medium" dir="ltr">{customer.phone}</div>
                    <div className="hidden md:block text-sm text-slate-500 truncate">{customer.address}</div>
                    
                    <div className="flex items-center justify-end md:justify-center gap-2">
                          <button onClick={() => handleOpenEditModal(customer)} className="p-2 text-blue-500 hover:bg-blue-100 rounded-full transition-colors" aria-label={`ویرایش ${customer.firstName} ${customer.lastName}`}>
                              <EditIcon />
                          </button>
                          <button 
                            onClick={() => handleDeleteRequest(customer.id)} 
                            className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors"
                            aria-label={`حذف ${customer.firstName} ${customer.lastName}`}
                          >
                              <TrashIcon />
                          </button>
                    </div>
                </div>
              ))}
              {filteredCustomers.length === 0 && (
                  <div className="text-center text-slate-400 py-10 bg-slate-50 rounded-2xl">
                      مشتری با این مشخصات یافت نشد.
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
            ? `آیا از حذف ${selectedIds.size} مورد انتخاب شده مطمئن هستید؟ این عمل قابل بازگشت نیست.` 
            : "آیا از حذف این مشتری مطمئن هستید؟ این عمل قابل بازگشت نیست."
        }
      />

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all" role="dialog" aria-modal="true">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">
                {editingCustomer ? 'ویرایش مشتری' : 'افزودن مشتری جدید'}
              </h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600" aria-label="بستن">
                <XIcon />
              </button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-1">نام</label>
                    <input type="text" name="firstName" id="firstName" value={formData.firstName} onChange={handleFormChange} required className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-semibold text-slate-700 mb-1">نام خانوادگی</label>
                    <input type="text" name="lastName" id="lastName" value={formData.lastName} onChange={handleFormChange} required className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
                  </div>
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-1">تلفن</label>
                  <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleFormChange} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" dir="ltr" />
                </div>
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-slate-700 mb-1">آدرس</label>
                  <input name="address" id="address" value={formData.address} onChange={handleFormChange} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
                </div>
              </div>
              <div className="flex items-center justify-end p-4 bg-slate-50 border-t border-slate-200 rounded-b-xl">
                <button type="button" onClick={handleCloseModal} className="text-slate-600 bg-transparent hover:bg-slate-200 px-4 py-2 rounded-lg ml-2">انصراف</button>
                <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">ذخیره</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Customers;