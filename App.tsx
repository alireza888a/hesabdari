

import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Invoices from './pages/Invoices';
import Checks from './pages/Checks';
import Settings from './pages/Settings';
import Accounting from './pages/Accounting';
import InvoiceDetail from './pages/InvoiceDetail';
import AIAssistant from './pages/AIAssistant';
import Products from './pages/Products';
import Reports from './pages/Reports';
import Automations from './pages/Automations';
import { getTodayJalali, getNextRunDate, jalaliToGregorian } from './utils/date';
import { View, Customer, Invoice, InvoiceStatus, CompanyInfo, Check, CheckType, CheckStatus, Transaction, TransactionType, AppData, Note, AIAssistantSettings, Product, ThemeSettings, RecurringTask, RecurringFrequency, RecurringStatus } from './types';

const LOCAL_STORAGE_KEY = 'accounting_app_data_v3';

const initialCompanyInfo: CompanyInfo = {
    name: 'نام شرکت شما',
    tagline: 'شعار تبلیغاتی شما در اینجا',
    contactPerson: 'نام شما / مدیر',
    phone: '(+98) 123 456 7890',
    website: 'www.yourcompany.com',
    address: 'آدرس شرکت شما',
    email: 'info@yourcompany.com',
    paymentMethod1_title: 'کارت بانکی',
    paymentMethod1_value: '۶۰۳۷-۹۹۷۹-۹۹۹۹-۹۹۹۹',
    paymentMethod2_title: '',
    paymentMethod2_value: '',
};

const initialAiSettings: AIAssistantSettings = {
    verbosity: 'normal',
    language: 'persian',
    personality: 'accountant',
    tone: 'friendly',
    proactiveGreeting: true,
    customInstructions: '',
    enabledTools: {
        customers: true,
        invoices: true,
        checks: true,
        transactions: true,
    }
};

const initialThemeSettings: ThemeSettings = {
    sidebarGradientStart: '#8B5CF6',
    sidebarGradientEnd: '#EC4899',
    customThemes: [],
};

const initialData: AppData = {
    customers: [
      { id: 1, code: 'CUS-001', firstName: 'شرکت', lastName: 'راهکاران', phone: '021-12345678', address: 'تهران، میدان آزادی', email: 'info@rahkaran.com' },
      { id: 2, code: 'CUS-002', firstName: 'فروشگاه', lastName: 'نوین', phone: '021-87654321', address: 'اصفهان، میدان نقش جهان', email: 'contact@novin.com' },
    ],
    invoices: [
      { id: 1, number: 'INV-2024-001', customerId: 1, issueDate: '1403/04/15', dueDate: '1403/05/15', items: [{ id: 1, description: 'طراحی وبسایت', quantity: 1, price: 15000000 }], discount: 1000000, downPayment: 5000000, notes: 'فاز اول پروژه', status: InvoiceStatus.Pending },
      { id: 2, number: 'INV-2024-002', customerId: 2, issueDate: '1403/04/20', dueDate: '1403/04/30', items: [ { id: 1, description: 'سئو و بهینه سازی', quantity: 1, price: 8000000 }, { id: 2, description: 'مشاوره بازاریابی دیجیتال (ساعتی)', quantity: 5, price: 1200000 }, ], discount: 0, downPayment: 0, notes: '', status: InvoiceStatus.Paid },
    ],
    checks: [
        { id: 1, type: CheckType.Received, customerId: 1, checkNumber: '123456', bankName: 'ملت', amount: 5000000, issueDate: '1403/04/15', dueDate: '1403/07/15', status: CheckStatus.Pending, description: 'بابت فاکتور 001' },
    ],
    transactions: [
        { id: 1, type: TransactionType.Expense, date: '1403/04/18', description: 'خرید تجهیزات دفتر', category: 'تجهیزات', amount: 3500000 },
        { id: 2, type: TransactionType.Income, date: '1403/04/20', description: 'واریز صورتحساب INV-2024-002', category: 'فروش', amount: 14000000 },
    ],
    products: [
        { id: 1, code: 'SRV-001', name: 'طراحی وبسایت', price: 15000000, costPrice: 5000000, description: 'طراحی و پیاده‌سازی وب‌سایت شرکتی' },
        { id: 2, code: 'SRV-002', name: 'سئو و بهینه سازی', price: 8000000, costPrice: 3000000, description: 'بهینه‌سازی برای موتورهای جستجو (ماهانه)' },
    ],
    notes: [
        { id: 1, text: 'بررسی فاکتورهای ماه گذشته', completed: false },
        { id: 2, text: 'تماس با مشتری جدید - شرکت آلفا', completed: true },
    ],
    companyInfo: initialCompanyInfo,
    themeSettings: initialThemeSettings,
    aiSettings: initialAiSettings,
    recurringTasks: []
};

const hydrateState = (data: Partial<AppData>): AppData => {
    const newState = JSON.parse(JSON.stringify(initialData));
    if (data && typeof data === 'object') {
        newState.customers = Array.isArray(data.customers) ? data.customers : initialData.customers;
        newState.invoices = Array.isArray(data.invoices) ? data.invoices : initialData.invoices;
        newState.checks = Array.isArray(data.checks) ? data.checks : initialData.checks;
        newState.transactions = Array.isArray(data.transactions) ? data.transactions : initialData.transactions;
        newState.products = Array.isArray(data.products) ? data.products : initialData.products;
        newState.notes = Array.isArray(data.notes) ? data.notes : initialData.notes;
        newState.recurringTasks = Array.isArray(data.recurringTasks) ? data.recurringTasks : initialData.recurringTasks;
        if (typeof data.companyInfo === 'object' && data.companyInfo !== null) {
            newState.companyInfo = { ...initialData.companyInfo, ...data.companyInfo };
        }
        if (typeof data.aiSettings === 'object' && data.aiSettings !== null) {
             newState.aiSettings = { ...initialData.aiSettings, ...data.aiSettings };
             if (typeof data.aiSettings.enabledTools === 'object' && data.aiSettings.enabledTools !== null) {
                newState.aiSettings.enabledTools = { ...initialData.aiSettings.enabledTools, ...data.aiSettings.enabledTools };
             }
        }
        if (typeof data.themeSettings === 'object' && data.themeSettings !== null) {
            newState.themeSettings = { ...initialData.themeSettings, ...data.themeSettings };
        }
    }
    return newState;
}

const loadState = (): AppData => {
    try {
        const serializedState = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (serializedState === null) {
            return initialData;
        }
        const loadedData = JSON.parse(serializedState);
        return hydrateState(loadedData);
    } catch (err) {
        console.error("Could not load state from localStorage", err);
        return initialData;
    }
};

const App: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<View>(View.Dashboard);
  const [appData, setAppData] = useState<AppData>(loadState);
  const { customers, invoices, checks, transactions, products, companyInfo, themeSettings, notes, aiSettings, recurringTasks } = appData;
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  
  useEffect(() => {
    try {
        const serializedState = JSON.stringify(appData);
        localStorage.setItem(LOCAL_STORAGE_KEY, serializedState);
    } catch (err) {
        console.error("Could not save state to localStorage", err);
    }
  }, [appData]);

  useEffect(() => {
    document.documentElement.style.setProperty('--color-primary-start', themeSettings.sidebarGradientStart);
    document.documentElement.style.setProperty('--color-primary-end', themeSettings.sidebarGradientEnd);
  }, [themeSettings]);

  useEffect(() => {
    const runRecurringTasks = () => {
        const todayGregorian = new Date();
        todayGregorian.setHours(0, 0, 0, 0); // For accurate date-only comparison

        let newInvoices: Invoice[] = [];
        let newTransactions: Transaction[] = [];
        const updatedTasks = appData.recurringTasks.map(task => {
            let updatedTask = { ...task };
            
            let [y, m, d] = updatedTask.nextRunDate.split('/').map(Number);
            let nextRunDateGregorian = jalaliToGregorian(y, m, d);
            nextRunDateGregorian.setHours(0,0,0,0);

            while (updatedTask.status === RecurringStatus.Active && nextRunDateGregorian <= todayGregorian) {
                const runDate = updatedTask.nextRunDate;
                if (updatedTask.type === 'invoice') {
                    const template = updatedTask.template as Omit<Invoice, 'id' | 'number' | 'issueDate' | 'dueDate' | 'status'>;
                    const newInvoice: Omit<Invoice, 'id' | 'number'> = {
                        ...template,
                        issueDate: runDate,
                        dueDate: getNextRunDate(runDate, RecurringFrequency.Monthly, 1), // Assuming due in 1 month
                        status: updatedTask.invoiceStatusOnCreate,
                    };
                    newInvoices.push({ ...newInvoice, id: Date.now() + newInvoices.length, number: `INV-${new Date().getFullYear()}-${appData.invoices.length + newInvoices.length + 1}` });
                } else {
                    const template = updatedTask.template as Omit<Transaction, 'id' | 'date'>;
                    const newTransaction: Omit<Transaction, 'id'> = {
                        ...template,
                        date: runDate,
                    };
                    newTransactions.push({ ...newTransaction, id: Date.now() + newTransactions.length });
                }
                updatedTask.lastRunDate = runDate;
                updatedTask.nextRunDate = getNextRunDate(runDate, updatedTask.frequency, 1);
                
                // Update the gregorian date for the next iteration of the while loop
                [y, m, d] = updatedTask.nextRunDate.split('/').map(Number);
                nextRunDateGregorian = jalaliToGregorian(y, m, d);
                nextRunDateGregorian.setHours(0,0,0,0);
            }
            return updatedTask;
        });

        if (newInvoices.length > 0 || newTransactions.length > 0) {
            setAppData(prev => ({
                ...prev,
                invoices: [...prev.invoices, ...newInvoices],
                transactions: [...prev.transactions, ...newTransactions],
                recurringTasks: updatedTasks,
            }));
        } else {
             setAppData(prev => ({ ...prev, recurringTasks: updatedTasks }));
        }
    };
    runRecurringTasks();
  }, []); // Run only once on app load

  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const handleNavigate = (view: View) => { setViewingInvoice(null); setCurrentView(view); if (window.innerWidth < 768) { setSidebarOpen(false); } };
  
  // Handlers
  const handleAddCustomer = (data: Omit<Customer, 'id' | 'code'>) => setAppData(p => ({ ...p, customers: [{ ...data, id: Date.now(), code: `CUS-${p.customers.length + 1}` }, ...p.customers] }));
  const handleUpdateCustomer = (data: Omit<Customer, 'id'|'code'>, id: number) => setAppData(p => ({ ...p, customers: p.customers.map(c => c.id === id ? { ...c, ...data } : c) }));
  const handleDeleteCustomer = (id: number) => setAppData(p => ({ ...p, customers: p.customers.filter(c => c.id !== id) }));
  const handleDeleteMultipleCustomers = (ids: Set<number>) => setAppData(p => ({...p, customers: p.customers.filter(c => !ids.has(c.id))}));

  const handleAddProduct = (data: Omit<Product, 'id' | 'code'>) => setAppData(p => ({ ...p, products: [{ ...data, id: Date.now(), code: `PROD-${p.products.length + 1}` }, ...p.products] }));
  const handleUpdateProduct = (data: Omit<Product, 'id' | 'code'>, id: number) => setAppData(p => ({ ...p, products: p.products.map(prod => prod.id === id ? { ...prod, ...data } : prod) }));
  const handleDeleteProduct = (id: number) => setAppData(p => ({ ...p, products: p.products.filter(prod => prod.id !== id) }));
  const handleDeleteMultipleProducts = (ids: Set<number>) => setAppData(p => ({ ...p, products: p.products.filter(prod => !ids.has(prod.id)) }));

  const handleAddInvoice = (data: Omit<Invoice, 'id' | 'number'>) => setAppData(p => ({ ...p, invoices: [{ ...data, id: Date.now(), number: `INV-${new Date().getFullYear()}-${p.invoices.length + 1}` }, ...p.invoices] }));
  const handleUpdateInvoice = (data: Omit<Invoice, 'id' | 'number'>, id: number) => setAppData(p => ({ ...p, invoices: p.invoices.map(i => i.id === id ? { ...i, ...data } : i) }));
  const handleDeleteInvoice = (id: number) => setAppData(p => ({ ...p, invoices: p.invoices.filter(i => i.id !== id) }));
  const handleViewInvoice = (invoice: Invoice) => { setViewingInvoice(invoice); };
  const handleCloseInvoice = () => { setViewingInvoice(null); };

  const handleAddTransaction = (data: Omit<Transaction, 'id'>) => setAppData(p => ({ ...p, transactions: [{ ...data, id: Date.now() }, ...p.transactions] }));
  const handleUpdateTransaction = (data: Omit<Transaction, 'id'>, id: number) => setAppData(p => ({ ...p, transactions: p.transactions.map(t => t.id === id ? { ...t, ...data } : t) }));
  const handleDeleteTransaction = (id: number) => setAppData(p => ({ ...p, transactions: p.transactions.filter(t => t.id !== id) }));
  const handleDeleteMultipleTransactions = (ids: Set<number>) => setAppData(p => ({ ...p, transactions: p.transactions.filter(t => !ids.has(t.id)) }));

  const handleAddCheck = (data: Omit<Check, 'id'>) => setAppData(p => ({ ...p, checks: [{ ...data, id: Date.now() }, ...p.checks] }));
  const handleUpdateCheck = (data: Omit<Check, 'id'>, id: number) => setAppData(p => ({ ...p, checks: p.checks.map(c => c.id === id ? { ...c, ...data } : c) }));
  const handleDeleteCheck = (id: number) => setAppData(p => ({ ...p, checks: p.checks.filter(c => c.id !== id) }));
  const handleDeleteMultipleChecks = (ids: Set<number>) => setAppData(p => ({...p, checks: p.checks.filter(c => !ids.has(c.id))}));
  
  const handleAddRecurringTask = (task: Omit<RecurringTask, 'id'>) => setAppData(p => ({ ...p, recurringTasks: [{ ...task, id: Date.now() }, ...p.recurringTasks] }));
  const handleUpdateRecurringTask = (task: Omit<RecurringTask, 'id'>, id: number) => setAppData(p => ({ ...p, recurringTasks: p.recurringTasks.map(t => t.id === id ? { ...t, ...task, id } : t) }));
  const handleDeleteRecurringTask = (id: number) => setAppData(p => ({ ...p, recurringTasks: p.recurringTasks.filter(t => t.id !== id) }));


  const handleAddNote = (text: string) => setAppData(p => ({ ...p, notes: [...p.notes, { id: Date.now(), text, completed: false }] }));
  const handleToggleNote = (id: number) => setAppData(p => ({ ...p, notes: p.notes.map(n => n.id === id ? { ...n, completed: !n.completed } : n) }));
  const handleDeleteNote = (id: number) => setAppData(p => ({ ...p, notes: p.notes.filter(n => n.id !== id) }));
  const handleDeleteAllNotes = () => setAppData(p => ({ ...p, notes: [] }));
  
  const handleSaveCompanyInfo = (info: CompanyInfo) => setAppData(p => ({ ...p, companyInfo: info }));
  const handleSaveAiSettings = (settings: AIAssistantSettings) => setAppData(p => ({ ...p, aiSettings: settings }));
  const handleSaveThemeSettings = (settings: ThemeSettings) => setAppData(p => ({ ...p, themeSettings: settings }));

  const handleUpdateInvoiceStatus = (invoiceNumber: string, status: InvoiceStatus): string => {
      let result = `فاکتور ${invoiceNumber} یافت نشد.`;
      setAppData(prev => {
          const newInvoices = prev.invoices.map(i => {
              if (i.number.toLowerCase() === invoiceNumber.toLowerCase()) {
                  result = `وضعیت فاکتور ${invoiceNumber} به ${status} تغییر کرد.`;
                  return { ...i, status };
              }
              return i;
          });
          return { ...prev, invoices: newInvoices };
      });
      return result;
  };

  const handleUpdateCheckStatus = (checkNumber: string, status: CheckStatus): string => {
      let result = `چک ${checkNumber} یافت نشد.`;
      setAppData(prev => {
          const newChecks = prev.checks.map(c => {
              if (c.checkNumber === checkNumber) {
                  result = `وضعیت چک ${checkNumber} به ${status} تغییر کرد.`;
                  return { ...c, status };
              }
              return c;
          });
          return { ...prev, checks: newChecks };
      });
      return result;
  };
  
  const handleExportData = () => {
      const json = JSON.stringify(appData, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'accounting_backup.json';
      a.click();
      URL.revokeObjectURL(url);
  };
  
  const handleImportData = (data: AppData) => {
      if (window.confirm('آیا مطمئن هستید؟ با این کار تمام اطلاعات فعلی پاک شده و اطلاعات فایل پشتیبان جایگزین خواهد شد.')) {
        setAppData(hydrateState(data));
        alert('اطلاعات با موفقیت بازیابی شد.');
        setCurrentView(View.Dashboard);
      }
  };
  
  const pageTitle = viewingInvoice ? `فاکتور ${viewingInvoice.number}` : currentView;

  const renderContent = () => {
    if (viewingInvoice) {
      return <InvoiceDetail invoice={viewingInvoice} customer={customers.find(c => c.id === viewingInvoice.customerId)} companyInfo={companyInfo} onClose={handleCloseInvoice} customThemes={themeSettings.customThemes} onAddCustomTheme={(theme) => setAppData(p => ({...p, themeSettings: {...p.themeSettings, customThemes: [...p.themeSettings.customThemes, theme]}}))} />;
    }
    switch (currentView) {
      case View.Dashboard: return <Dashboard transactions={transactions} invoices={invoices} customers={customers} checks={checks} notes={notes} recurringTasks={recurringTasks} onAddNote={handleAddNote} onToggleNote={handleToggleNote} onDeleteNote={handleDeleteNote} />;
      case View.Invoices: return <Invoices invoices={invoices} customers={customers} products={products} onAdd={handleAddInvoice} onUpdate={handleUpdateInvoice} onDelete={handleDeleteInvoice} onView={handleViewInvoice} />;
      case View.Customers: return <Customers customers={customers} onAdd={handleAddCustomer} onUpdate={handleUpdateCustomer} onDelete={handleDeleteCustomer} onDeleteMultiple={handleDeleteMultipleCustomers} />;
      case View.Checks: return <Checks checks={checks} customers={customers} onAdd={handleAddCheck} onUpdate={handleUpdateCheck} onDelete={handleDeleteCheck} onDeleteMultiple={handleDeleteMultipleChecks} />;
      case View.Accounting: return <Accounting transactions={transactions} onAdd={handleAddTransaction} onUpdate={handleUpdateTransaction} onDelete={handleDeleteTransaction} onDeleteMultiple={handleDeleteMultipleTransactions} />;
      case View.Reports: return <Reports transactions={transactions} invoices={invoices} customers={customers} products={products} />;
      case View.Products: return <Products products={products} onAdd={handleAddProduct} onUpdate={handleUpdateProduct} onDelete={handleDeleteProduct} onDeleteMultiple={handleDeleteMultipleProducts} />;
      case View.Automations: return <Automations recurringTasks={recurringTasks} customers={customers} products={products} onAdd={handleAddRecurringTask} onUpdate={handleUpdateRecurringTask} onDelete={handleDeleteRecurringTask} />;
      case View.Settings: return <Settings companyInfo={companyInfo} aiSettings={aiSettings} themeSettings={themeSettings} onSaveCompanyInfo={handleSaveCompanyInfo} onSaveAiSettings={handleSaveAiSettings} onSaveThemeSettings={handleSaveThemeSettings} onExport={handleExportData} onImport={handleImportData} />;
      case View.AIAssistant: return <AIAssistant appData={appData} aiSettings={aiSettings} onAddCustomer={handleAddCustomer} onDeleteCustomer={handleDeleteCustomer} onUpdateCustomer={handleUpdateCustomer} onAddInvoice={handleAddInvoice} onDeleteInvoice={handleDeleteInvoice} onUpdateInvoiceStatus={handleUpdateInvoiceStatus} onAddCheck={handleAddCheck} onDeleteCheck={handleDeleteCheck} onUpdateCheck={handleUpdateCheck} onUpdateCheckStatus={handleUpdateCheckStatus} onAddTransaction={handleAddTransaction} onDeleteTransaction={handleDeleteTransaction} onUpdateTransaction={handleUpdateTransaction} onAddNote={handleAddNote} onDeleteNote={handleDeleteNote} onToggleNote={handleToggleNote} onDeleteAllNotes={handleDeleteAllNotes} onAddRecurringTask={handleAddRecurringTask} />;
      default: return <Dashboard transactions={transactions} invoices={invoices} customers={customers} checks={checks} notes={notes} recurringTasks={recurringTasks} onAddNote={handleAddNote} onToggleNote={handleToggleNote} onDeleteNote={handleDeleteNote} />;
    }
  };

  return (
    <div className="min-h-screen w-full text-slate-800 bg-gradient-to-br from-slate-900 to-slate-700 p-0 md:p-4 font-sans">
      <div className="flex h-screen md:h-[calc(100vh-2rem)] md:gap-4">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={toggleSidebar} 
          onNavigate={handleNavigate}
          currentView={currentView}
          gradientStart={themeSettings.sidebarGradientStart}
          gradientEnd={themeSettings.sidebarGradientEnd}
        />
        <main className="flex-1 transition-all duration-300 overflow-y-auto bg-slate-100/90 backdrop-blur-xl md:rounded-3xl shadow-2xl shadow-black/20">
          <div className="p-4 sm:p-6 lg:p-8">
            <Header onMenuClick={toggleSidebar} title={pageTitle} />
            <div className="mt-8">
              {renderContent()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;