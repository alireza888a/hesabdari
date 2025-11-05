import React, { useState, useMemo, useEffect } from 'react';
import { Invoice, Customer, InvoiceItem, InvoiceStatus, Product } from '../types';
import EditIcon from '../components/icons/EditIcon';
import TrashIcon from '../components/icons/TrashIcon';
import EyeIcon from '../components/icons/EyeIcon';
import XIcon from '../components/icons/XIcon';
import PlusIcon from '../components/icons/PlusIcon';
import ConfirmationModal from '../components/ConfirmationModal';
import { formatCurrency } from '../utils';
import SortIcon from '../components/icons/SortIcon';

interface InvoicesProps {
  invoices: Invoice[];
  customers: Customer[];
  products: Product[];
  onAdd: (invoiceData: Omit<Invoice, 'id' | 'number'>) => void;
  onUpdate: (invoiceData: Omit<Invoice, 'id' | 'number'>, id: number) => void;
  onDelete: (id: number) => void;
  onView: (invoice: Invoice) => void;
}

type SortableKeys = 'number' | 'customerName' | 'issueDate' | 'finalAmount' | 'id';

const Invoices: React.FC<InvoicesProps> = ({ invoices, customers, products, onAdd, onUpdate, onDelete, onView }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: SortableKeys; direction: 'ascending' | 'descending' }>({ key: 'id', direction: 'descending' });
    
    const emptyFormState: Omit<Invoice, 'id' | 'number'> = {
        customerId: 0,
        issueDate: new Date().toLocaleDateString('fa-IR-u-nu-latn').replace(/\//g, '/'),
        dueDate: '',
        items: [{ id: Date.now(), description: '', quantity: 1, price: 0 }],
        discount: 0,
        downPayment: 0,
        notes: '',
        status: InvoiceStatus.Pending,
    };
    
    const [formData, setFormData] = useState(emptyFormState);

    useEffect(() => {
        if (editingInvoice) {
            setFormData({
                customerId: editingInvoice.customerId,
                issueDate: editingInvoice.issueDate,
                dueDate: editingInvoice.dueDate,
                items: editingInvoice.items.map(item => ({...item})), // Deep copy
                discount: editingInvoice.discount,
                downPayment: editingInvoice.downPayment,
                notes: editingInvoice.notes,
                status: editingInvoice.status,
            });
        }
    }, [editingInvoice]);
    
    const customerMap = useMemo(() => {
        return customers.reduce((acc, customer) => {
            acc[customer.id] = `${customer.firstName} ${customer.lastName}`;
            return acc;
        }, {} as Record<number, string>);
    }, [customers]);

    const sortedInvoices = useMemo(() => {
        let sortableItems = [...invoices];
        if (sortConfig !== null) {
            sortableItems.sort((a, b) => {
                let aValue: string | number;
                let bValue: string | number;

                if (sortConfig.key === 'customerName') {
                    aValue = customerMap[a.customerId] || '';
                    bValue = customerMap[b.customerId] || '';
                } else if (sortConfig.key === 'finalAmount') {
                    const calcAmount = (inv: Invoice) => inv.items.reduce((sum, item) => sum + item.quantity * item.price, 0) - inv.discount - inv.downPayment;
                    aValue = calcAmount(a);
                    bValue = calcAmount(b);
                } else {
                    aValue = a[sortConfig.key as keyof Omit<Invoice, 'items'>];
                    bValue = b[sortConfig.key as keyof Omit<Invoice, 'items'>];
                }

                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [invoices, sortConfig, customerMap]);
    
    const requestSort = (key: SortableKeys) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const handleOpenAddModal = () => {
        setEditingInvoice(null);
        setFormData(emptyFormState);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (invoice: Invoice) => {
        setEditingInvoice(invoice);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingInvoice(null);
    };
    
    const handleDeleteRequest = (id: number) => {
        setDeletingId(id);
        setShowConfirmModal(true);
    };

    const confirmDelete = () => {
        if (deletingId !== null) {
            onDelete(deletingId);
        }
        closeConfirmModal();
    };

    const closeConfirmModal = () => {
        setShowConfirmModal(false);
        setDeletingId(null);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleItemChange = (index: number, field: keyof Omit<InvoiceItem, 'id'>, value: string | number) => {
        const newItems = [...formData.items];
        (newItems[index] as any)[field] = value;
        setFormData(prev => ({ ...prev, items: newItems }));
    };
    
    const handleProductSelect = (index: number, productId: string) => {
        const newItems = [...formData.items];
        if (!productId || productId === 'custom') {
            if (productId === 'custom') {
                newItems[index].description = '';
                newItems[index].price = 0;
            }
        } else {
            const selectedProduct = products.find(p => p.id === Number(productId));
            if (selectedProduct) {
                newItems[index].description = selectedProduct.name;
                newItems[index].price = selectedProduct.price;
            }
        }
        setFormData(prev => ({ ...prev, items: newItems }));
    };

    const handleAddItem = () => {
        setFormData(prev => ({
            ...prev,
            items: [...prev.items, { id: Date.now(), description: '', quantity: 1, price: 0 }]
        }));
    };

    const handleRemoveItem = (index: number) => {
        if (formData.items.length > 1) {
            const newItems = formData.items.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, items: newItems }));
        }
    };
    
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalFormData = {
            ...formData,
            customerId: Number(formData.customerId),
            discount: Number(formData.discount || 0),
            downPayment: Number(formData.downPayment || 0),
            items: formData.items.map(item => ({
                ...item,
                quantity: Number(item.quantity),
                price: Number(item.price)
            }))
        };

        if (editingInvoice) {
            onUpdate(finalFormData, editingInvoice.id);
        } else {
            onAdd(finalFormData);
        }
        handleCloseModal();
    };

    const getStatusClass = (status: InvoiceStatus) => {
        switch (status) {
            case InvoiceStatus.Paid: return 'bg-green-100 text-green-800';
            case InvoiceStatus.Pending: return 'bg-yellow-100 text-yellow-800';
            case InvoiceStatus.Overdue: return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const totalAmount = useMemo(() => {
        return formData.items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.price)), 0);
    }, [formData.items]);
    
    const finalAmount = useMemo(() => {
        const subTotal = totalAmount - Number(formData.discount || 0);
        return subTotal - Number(formData.downPayment || 0);
    }, [totalAmount, formData.discount, formData.downPayment]);

    const SortableHeader: React.FC<{ sortKey: SortableKeys; children: React.ReactNode; className?: string }> = ({ sortKey, children, className }) => (
        <button className={`flex items-center gap-1 text-gray-500 hover:text-gray-800 transition-colors ${className}`} onClick={() => requestSort(sortKey)}>
            <span>{children}</span>
            {sortConfig.key === sortKey && <SortIcon direction={sortConfig.direction} />}
        </button>
    );

  return (
    <>
    <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200/50">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-xl font-bold text-gray-800 self-start">فاکتورها</h2>
        <button onClick={handleOpenAddModal} 
            className="w-full md:w-auto flex items-center justify-center px-4 py-2 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
            style={{ backgroundImage: `linear-gradient(to right, var(--color-primary-start), var(--color-primary-end))` }}>
          <PlusIcon /> <span className="mr-2">ایجاد فاکتور جدید</span>
        </button>
      </div>
      <div className="space-y-3">
        <div className="hidden md:grid grid-cols-12 gap-4 p-4 text-sm font-semibold text-gray-500">
            <SortableHeader sortKey="number" className="col-span-2">شماره فاکتور</SortableHeader>
            <SortableHeader sortKey="customerName" className="col-span-3">مشتری</SortableHeader>
            <SortableHeader sortKey="issueDate" className="col-span-2">تاریخ صدور</SortableHeader>
            <span className="text-center col-span-2">وضعیت</span>
            <SortableHeader sortKey="finalAmount" className="justify-start col-span-3">مبلغ نهایی</SortableHeader>
        </div>
        {sortedInvoices.map(invoice => {
            const subtotal = invoice.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
            const invoiceFinalAmount = subtotal - invoice.discount - invoice.downPayment;
            return (
                <div key={invoice.id} className="grid grid-cols-2 md:grid-cols-12 gap-4 items-center p-4 bg-gray-50 rounded-xl hover:shadow-sm transition-shadow">
                    <div className="col-span-2 md:col-span-2">
                        <div className="font-bold text-gray-800 font-mono">{invoice.number}</div>
                        <div className="text-xs text-gray-500 md:hidden mt-1">{customerMap[invoice.customerId] || 'حذف شده'}</div>
                    </div>
                    <div className="hidden md:block text-sm text-gray-700 font-medium col-span-3">{customerMap[invoice.customerId] || 'حذف شده'}</div>
                    <div className="hidden md:block text-sm text-gray-500 col-span-2">{invoice.issueDate}</div>
                    <div className="text-center col-span-2">
                        <span className={`px-3 py-1 text-xs font-semibold tracking-wider rounded-full ${getStatusClass(invoice.status)}`}>
                            {invoice.status}
                        </span>
                    </div>
                    <div className="flex items-center justify-end md:justify-between gap-2 text-left col-span-2 md:col-span-3">
                        <span className="font-bold text-gray-800 text-sm">{formatCurrency(invoiceFinalAmount)} تومان</span>
                        <div className="flex items-center">
                            <button onClick={() => onView(invoice)} className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors" aria-label={`مشاهده فاکتور ${invoice.number}`}><EyeIcon /></button>
                            <button onClick={() => handleOpenEditModal(invoice)} className="p-2 text-blue-500 hover:bg-blue-100 rounded-full transition-colors" aria-label={`ویرایش فاکتور ${invoice.number}`}><EditIcon /></button>
                            <button onClick={() => handleDeleteRequest(invoice.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors" aria-label={`حذف فاکتور ${invoice.number}`}><TrashIcon /></button>
                        </div>
                    </div>
                </div>
            )
        })}
         {invoices.length === 0 && (
            <div className="text-center text-gray-400 py-10 bg-gray-50 rounded-2xl">
                هیچ فاکتوری ثبت نشده است.
            </div>
        )}
      </div>
    </div>

    <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={closeConfirmModal}
        onConfirm={confirmDelete}
        title="تایید حذف"
        message="آیا از حذف این فاکتور مطمئن هستید؟ این عمل قابل بازگشت نیست."
    />

    {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex items-center justify-center p-4 transition-opacity duration-300">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col transform transition-all" role="dialog" aria-modal="true">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingInvoice ? `ویرایش فاکتور ${editingInvoice.number}` : 'ایجاد فاکتور جدید'}
              </h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600" aria-label="بستن"><XIcon /></button>
            </div>
            <form onSubmit={handleFormSubmit} className="flex-grow overflow-y-auto">
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="customerId" className="block text-sm font-medium text-gray-700 mb-1">مشتری</label>
                        <select name="customerId" id="customerId" value={formData.customerId || ''} onChange={handleFormChange} required className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-50">
                            <option value="">انتخاب مشتری</option>
                            {customers.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700 mb-1">تاریخ صدور</label>
                        <input type="text" name="issueDate" id="issueDate" value={formData.issueDate} onChange={handleFormChange} required className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-50" />
                    </div>
                    <div>
                        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">تاریخ سررسید</label>
                        <input type="text" name="dueDate" id="dueDate" value={formData.dueDate} onChange={handleFormChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-50" />
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-md font-semibold text-gray-700 mb-3">اقلام فاکتور</h4>
                    <div className="space-y-2">
                        {formData.items.map((item, index) => (
                            <div key={item.id} className="grid grid-cols-12 gap-2 items-center">
                                <select 
                                    onChange={e => handleProductSelect(index, e.target.value)}
                                    className="col-span-12 md:col-span-5 p-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
                                    defaultValue={products.find(p => p.name === item.description)?.id || ""}
                                >
                                    <option value="">انتخاب کالا یا خدمات...</option>
                                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    <option value="custom">-- شرح دستی --</option>
                                </select>
                                <input type="number" placeholder="تعداد" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', Number(e.target.value))} className="col-span-3 md:col-span-2 p-2 border border-gray-300 rounded-lg text-sm bg-gray-50" />
                                <input type="number" placeholder="مبلغ واحد" value={item.price} onChange={e => handleItemChange(index, 'price', Number(e.target.value))} className="col-span-5 md:col-span-3 p-2 border border-gray-300 rounded-lg text-sm bg-gray-50" />
                                <div className="col-span-4 md:col-span-2 flex items-center justify-between md:justify-end">
                                    <p className="text-sm text-gray-600 w-full text-left md:hidden">{formatCurrency(item.quantity * item.price)}</p>
                                    <button type="button" onClick={() => handleRemoveItem(index)} className="text-red-500 hover:text-red-700 p-1 disabled:opacity-50" disabled={formData.items.length <= 1}><TrashIcon/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={handleAddItem} className="mt-2 text-purple-600 font-semibold text-sm flex items-center gap-1 hover:text-purple-800"><PlusIcon /> افزودن ردیف</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 border-t border-gray-200 pt-6">
                    <div className="md:col-span-3 space-y-4">
                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">توضیحات</label>
                        <textarea name="notes" id="notes" value={formData.notes} onChange={handleFormChange} rows={4} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-50"></textarea>
                         <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">وضعیت</label>
                            <select name="status" id="status" value={formData.status} onChange={handleFormChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-50">
                                {Object.values(InvoiceStatus).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="md:col-span-2 space-y-3 bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center text-gray-600">
                            <span>جمع کل:</span>
                            <span className="font-medium">{formatCurrency(totalAmount)} تومان</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <label htmlFor="discount" className="text-gray-600 text-sm">تخفیف:</label>
                            <input type="number" name="discount" id="discount" value={formData.discount} onChange={handleFormChange} className="w-32 p-1.5 border border-gray-300 rounded-lg text-sm" />
                        </div>
                         <div className="flex justify-between items-center">
                            <label htmlFor="downPayment" className="text-gray-600 text-sm">بیعانه:</label>
                            <input type="number" name="downPayment" id="downPayment" value={formData.downPayment} onChange={handleFormChange} className="w-32 p-1.5 border border-gray-300 rounded-lg text-sm" />
                        </div>
                        <div className="border-t my-2"></div>
                        <div className="flex justify-between items-center font-bold text-lg text-gray-800">
                            <span>مبلغ نهایی:</span>
                            <span>{formatCurrency(finalAmount)} تومان</span>
                        </div>
                    </div>
                </div>

              </div>
              <div className="flex items-center justify-end p-4 bg-gray-50 border-t border-gray-200 rounded-b-xl sticky bottom-0">
                <button type="button" onClick={handleCloseModal} className="text-gray-600 bg-transparent hover:bg-gray-200 px-4 py-2 rounded-lg ml-2">انصراف</button>
                <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">ذخیره فاکتور</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Invoices;
