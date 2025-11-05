import React, { useState, useMemo, useEffect } from 'react';
import { RecurringTask, Customer, Product, RecurringFrequency, RecurringStatus, TransactionType, InvoiceStatus } from '../types';
import EditIcon from '../components/icons/EditIcon';
import TrashIcon from '../components/icons/TrashIcon';
import XIcon from '../components/icons/XIcon';
import PlusIcon from '../components/icons/PlusIcon';
import ConfirmationModal from '../components/ConfirmationModal';
import { formatCurrency } from '../utils';

interface AutomationsProps {
  recurringTasks: RecurringTask[];
  customers: Customer[];
  products: Product[];
  onAdd: (taskData: Omit<RecurringTask, 'id'>) => void;
  onUpdate: (taskData: Omit<RecurringTask, 'id'>, id: number) => void;
  onDelete: (id: number) => void;
}

const Automations: React.FC<AutomationsProps> = ({ recurringTasks, customers, products, onAdd, onUpdate, onDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<RecurringTask | null>(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [taskType, setTaskType] = useState<'transaction' | 'invoice'>('transaction');

    const emptyFormState = {
        name: '',
        type: taskType,
        template: taskType === 'transaction' ? { type: TransactionType.Expense, description: '', category: '', amount: 0 } : { customerId: 0, items: [{id: Date.now(), description: '', quantity: 1, price: 0}], discount: 0, downPayment: 0, notes: ''},
        frequency: RecurringFrequency.Monthly,
        startDate: new Date().toLocaleDateString('fa-IR-u-nu-latn').replace(/\//g, '/'),
        status: RecurringStatus.Active,
        invoiceStatusOnCreate: InvoiceStatus.Draft,
    };

    const [formData, setFormData] = useState<any>(emptyFormState);

    useEffect(() => {
        if(isModalOpen && !editingTask) {
             setFormData({
                ...emptyFormState,
                type: taskType,
                template: taskType === 'transaction' ? { type: TransactionType.Expense, description: '', category: '', amount: 0 } : { customerId: 0, items: [{id: Date.now(), description: '', quantity: 1, price: 0}], discount: 0, downPayment: 0, notes: ''},
            });
        }
    }, [taskType, isModalOpen, editingTask]);
    
    useEffect(() => {
        if (editingTask) {
            setTaskType(editingTask.type);
            setFormData({
                name: editingTask.name,
                type: editingTask.type,
                template: JSON.parse(JSON.stringify(editingTask.template)), // deep copy
                frequency: editingTask.frequency,
                startDate: editingTask.startDate,
                status: editingTask.status,
                invoiceStatusOnCreate: editingTask.invoiceStatusOnCreate,
            });
        }
    }, [editingTask]);

    const handleOpenAddModal = () => {
        setEditingTask(null);
        setTaskType('transaction');
        setIsModalOpen(true);
    };
    
    const handleOpenEditModal = (task: RecurringTask) => {
        setEditingTask(task);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingTask(null);
    };
    
    const handleDeleteRequest = (id: number) => {
        setDeletingId(id);
        setShowConfirmModal(true);
    };

    const confirmDelete = () => {
        if (deletingId !== null) {
            onDelete(deletingId);
        }
        setShowConfirmModal(false);
        setDeletingId(null);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleTemplateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({
            ...prev,
            template: { ...prev.template, [name]: value }
        }));
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalData = {
            ...formData,
            nextRunDate: formData.startDate,
            lastRunDate: null,
        };
        
        if (editingTask) {
            onUpdate({ ...editingTask, ...finalData }, editingTask.id);
        } else {
            onAdd(finalData);
        }
        handleCloseModal();
    };
    
    const getStatusClass = (status: RecurringStatus) => status === RecurringStatus.Active ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';

    return (
        <>
            <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200/50">
                <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                    <h2 className="text-xl font-bold text-gray-800 self-start">اتوماسیون</h2>
                    <button onClick={handleOpenAddModal} className="w-full md:w-auto flex items-center justify-center px-4 py-2 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity" style={{ backgroundImage: `linear-gradient(to right, var(--color-primary-start), var(--color-primary-end))` }}>
                        <PlusIcon /> <span className="mr-2">ایجاد اتوماسیون جدید</span>
                    </button>
                </div>
                <div className="space-y-3">
                    {recurringTasks.map(task => (
                        <div key={task.id} className="grid grid-cols-2 md:grid-cols-6 gap-4 items-center p-4 bg-gray-50 rounded-xl">
                            <div className="col-span-2 font-bold text-gray-800">{task.name}</div>
                            <div className="text-sm text-gray-500">{task.type === 'invoice' ? 'فاکتور' : 'تراکنش'}</div>
                            <div className="text-sm text-gray-500">{task.frequency}</div>
                             <div className="text-center">
                                <span className={`px-3 py-1 text-xs font-semibold tracking-wider rounded-full ${getStatusClass(task.status)}`}>
                                    {task.status}
                                </span>
                            </div>
                            <div className="flex items-center justify-end gap-2">
                                <button onClick={() => handleOpenEditModal(task)} className="p-2 text-blue-500 hover:bg-blue-100 rounded-full"><EditIcon /></button>
                                <button onClick={() => handleDeleteRequest(task.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-full"><TrashIcon /></button>
                            </div>
                        </div>
                    ))}
                    {recurringTasks.length === 0 && (
                        <div className="text-center text-gray-400 py-10 bg-gray-50 rounded-2xl">هیچ اتوماسیونی ثبت نشده است.</div>
                    )}
                </div>
            </div>

             <ConfirmationModal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} onConfirm={confirmDelete} title="تایید حذف" message="آیا از حذف این اتوماسیون مطمئن هستید؟" />

            {isModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col" role="dialog">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="text-lg font-semibold">{editingTask ? 'ویرایش اتوماسیون' : 'ایجاد اتوماسیون جدید'}</h3>
                            <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600"><XIcon /></button>
                        </div>
                        <form onSubmit={handleFormSubmit} className="flex-grow overflow-y-auto">
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">نام اتوماسیون</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleFormChange} required className="w-full p-2.5 border rounded-lg" placeholder="مثال: اجاره ماهانه دفتر" />
                                </div>
                                
                                {!editingTask && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">نوع</label>
                                    <select value={taskType} onChange={e => setTaskType(e.target.value as any)} className="w-full p-2.5 border rounded-lg">
                                        <option value="transaction">تراکنش (هزینه/درآمد)</option>
                                        <option value="invoice">فاکتور</option>
                                    </select>
                                </div>
                                )}

                                <div className="p-4 border rounded-lg space-y-4">
                                    <h4 className="font-semibold">اطلاعات الگو</h4>
                                    {taskType === 'transaction' ? (
                                        <>
                                            <select name="type" value={formData.template.type} onChange={handleTemplateChange} className="w-full p-2.5 border rounded-lg">
                                                <option value={TransactionType.Expense}>هزینه</option>
                                                <option value={TransactionType.Income}>درآمد</option>
                                            </select>
                                            <input type="text" name="description" value={formData.template.description} onChange={handleTemplateChange} placeholder="شرح" required className="w-full p-2.5 border rounded-lg" />
                                            <input type="number" name="amount" value={formData.template.amount} onChange={handleTemplateChange} placeholder="مبلغ" required className="w-full p-2.5 border rounded-lg" />
                                            <input type="text" name="category" value={formData.template.category} onChange={handleTemplateChange} placeholder="دسته بندی" required className="w-full p-2.5 border rounded-lg" />
                                        </>
                                    ) : (
                                        <>
                                           <select name="customerId" value={formData.template.customerId} onChange={handleTemplateChange} required className="w-full p-2.5 border rounded-lg">
                                                <option value="">انتخاب مشتری</option>
                                                {customers.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
                                            </select>
                                            {/* Simplified item for now */}
                                            <input type="text" name="description" value={formData.template.items[0].description} onChange={e => setFormData({...formData, template: {...formData.template, items: [{...formData.template.items[0], description: e.target.value}]}})} placeholder="شرح آیتم فاکتور" required className="w-full p-2.5 border rounded-lg" />
                                            <input type="number" name="price" value={formData.template.items[0].price} onChange={e => setFormData({...formData, template: {...formData.template, items: [{...formData.template.items[0], price: Number(e.target.value)}]}})} placeholder="مبلغ آیتم" required className="w-full p-2.5 border rounded-lg" />
                                            <select name="invoiceStatusOnCreate" value={formData.invoiceStatusOnCreate} onChange={handleFormChange} className="w-full p-2.5 border rounded-lg">
                                                <option value={InvoiceStatus.Draft}>ایجاد به صورت پیش‌نویس</option>
                                                <option value={InvoiceStatus.Pending}>ایجاد و ارسال (در انتظار پرداخت)</option>
                                            </select>
                                        </>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">تکرار</label>
                                        <select name="frequency" value={formData.frequency} onChange={handleFormChange} className="w-full p-2.5 border rounded-lg">
                                            {Object.values(RecurringFrequency).map(f => <option key={f} value={f}>{f}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">تاریخ شروع</label>
                                        <input type="text" name="startDate" value={formData.startDate} onChange={handleFormChange} required className="w-full p-2.5 border rounded-lg" />
                                    </div>
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">وضعیت</label>
                                    <select name="status" value={formData.status} onChange={handleFormChange} className="w-full p-2.5 border rounded-lg">
                                        <option value={RecurringStatus.Active}>فعال</option>
                                        <option value={RecurringStatus.Paused}>متوقف</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex items-center justify-end p-4 bg-gray-50 border-t">
                                <button type="button" onClick={handleCloseModal} className="text-gray-600 bg-transparent hover:bg-gray-200 px-4 py-2 rounded-lg ml-2">انصراف</button>
                                <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">ذخیره</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Automations;
