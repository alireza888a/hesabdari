
import React, { useState, useMemo, useEffect } from 'react';
import { Product } from '../types';
import EditIcon from './icons/EditIcon';
import TrashIcon from './icons/TrashIcon';
import SearchIcon from './icons/SearchIcon';
import XIcon from './icons/XIcon';
import ActionBar from './ActionBar';
import ConfirmationModal from './ConfirmationModal';
import { formatCurrency } from '../utils';

interface ProductsProps {
  products: Product[];
  onAdd: (productData: Omit<Product, 'id' | 'code'>) => void;
  onUpdate: (productData: Omit<Product, 'id' | 'code'>, id: number) => void;
  onDelete: (id: number) => void;
  onDeleteMultiple: (ids: Set<number>) => void;
}

const Products: React.FC<ProductsProps> = ({ products, onAdd, onUpdate, onDelete, onDeleteMultiple }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deletingMultiple, setDeletingMultiple] = useState(false);

  const emptyFormState = {
    name: '',
    price: 0,
    description: '',
  };
  const [formData, setFormData] = useState(emptyFormState);

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name,
        price: editingProduct.price,
        description: editingProduct.description,
      });
    }
  }, [editingProduct]);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData(emptyFormState);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalData = { ...formData, price: Number(formData.price) };
    if (editingProduct) {
      onUpdate(finalData, editingProduct.id);
    } else {
      onAdd(finalData);
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

  const filteredProducts = useMemo(() =>
    products.filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.code && product.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
    ), [products, searchTerm]);

  const handleSelect = (id: number) => {
    setSelectedIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        return newSet;
    });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredProducts.map(c => c.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const isAllSelected = selectedIds.size > 0 && selectedIds.size === filteredProducts.length;

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
                  aria-label="جستجوی کالا"
              />
          </div>
          <button 
              onClick={handleOpenAddModal}
              className="bg-purple-600 text-white px-5 py-2.5 rounded-xl hover:bg-purple-700 transition-colors w-full md:w-auto font-semibold shadow-lg shadow-purple-500/20"
          >
            افزودن کالا/خدمت جدید
          </button>
        </div>
        <div className="space-y-2">
            <div className="hidden md:grid grid-cols-[auto,50px,2fr,1fr,2fr,100px] gap-4 p-4 text-sm font-semibold text-slate-500">
                <input type="checkbox" onChange={handleSelectAll} checked={isAllSelected} className="w-5 h-5 rounded text-purple-500 focus:ring-purple-400" />
                <span className="text-center">کد</span>
                <span>نام کالا/خدمت</span>
                <span className="text-left">قیمت</span>
                <span>توضیحات</span>
                <span className="text-center">عملیات</span>
            </div>
             {filteredProducts.map(product => (
                <div key={product.id} className="grid grid-cols-[auto,1fr,auto] md:grid-cols-[auto,50px,2fr,1fr,2fr,100px] items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:shadow-sm transition-shadow">
                    <input type="checkbox" checked={selectedIds.has(product.id)} onChange={() => handleSelect(product.id)} className="w-5 h-5 rounded text-purple-500 focus:ring-purple-400" />
                    <div className="hidden md:block text-sm text-slate-700 font-mono text-center font-medium">{product.code}</div>
                    
                    <div className="col-span-1">
                        <div className="font-bold text-slate-800">{product.name}</div>
                        <div className="text-xs text-slate-500 md:hidden mt-1">{formatCurrency(product.price)} تومان</div>
                    </div>
                    
                    <div className="hidden md:block text-sm text-slate-700 font-medium text-left">{formatCurrency(product.price)}</div>
                    <div className="hidden md:block text-sm text-slate-500 truncate">{product.description}</div>
                    
                    <div className="flex items-center justify-end md:justify-center gap-2">
                          <button onClick={() => handleOpenEditModal(product)} className="p-2 text-blue-500 hover:bg-blue-100 rounded-full transition-colors" aria-label={`ویرایش ${product.name}`}>
                              <EditIcon />
                          </button>
                          <button 
                            onClick={() => handleDeleteRequest(product.id)} 
                            className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors"
                            aria-label={`حذف ${product.name}`}
                          >
                              <TrashIcon />
                          </button>
                    </div>
                </div>
              ))}
              {filteredProducts.length === 0 && (
                <div className="text-center text-slate-400 py-10 bg-slate-50 rounded-2xl">
                    کالا یا خدمتی با این مشخصات یافت نشد.
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
            ? `آیا از حذف ${selectedIds.size} مورد انتخاب شده مطمئن هستید؟` 
            : "آیا از حذف این مورد مطمئن هستید؟ این عمل قابل بازگشت نیست."
        }
      />

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all" role="dialog" aria-modal="true">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">
                {editingProduct ? 'ویرایش کالا/خدمت' : 'افزودن کالا/خدمت جدید'}
              </h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600" aria-label="بستن">
                <XIcon />
              </button>
            </div>
            <form onSubmit={handleFormSubmit}>
              <div className="p-6 space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">نام کالا/خدمت</label>
                  <input type="text" name="name" id="name" value={formData.name} onChange={handleFormChange} required className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
                </div>
                <div>
                  <label htmlFor="price" className="block text-sm font-semibold text-slate-700 mb-1">قیمت (تومان)</label>
                  <input type="number" name="price" id="price" value={formData.price} onChange={handleFormChange} required className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">توضیحات</label>
                  <textarea name="description" id="description" value={formData.description} onChange={handleFormChange} rows={3} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500" />
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

export default Products;
