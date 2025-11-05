

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AppData, Customer, Invoice, InvoiceStatus, Check, CheckStatus, Transaction, TransactionType, CheckType, AIAssistantSettings, Note, RecurringTask, RecurringFrequency, RecurringStatus, Product } from '../types';
import SendIcon from '../components/icons/SendIcon';
import SparklesIcon from '../components/icons/SparklesIcon';
import type { FunctionDeclaration, Chat } from '@google/genai';
import MicrophoneIcon from '../components/icons/MicrophoneIcon';
import PaperclipIcon from '../components/icons/PaperclipIcon';
import XCircleIcon from '../components/icons/XCircleIcon';
import { getFuturePersianMonths, getPastPersianMonths } from '../utils/date';


interface AIAssistantProps {
  appData: AppData;
  aiSettings: AIAssistantSettings;
  onAddCustomer: (customerData: Omit<Customer, 'id' | 'code'>) => void;
  onDeleteCustomer: (id: number) => void;
  onUpdateCustomer: (customerData: Omit<Customer, 'id' | 'code'>, id: number) => void;
  onAddInvoice: (invoiceData: Omit<Invoice, 'id' | 'number'>) => void;
  onDeleteInvoice: (id: number) => void;
  onUpdateInvoiceStatus: (invoiceNumber: string, status: InvoiceStatus) => string;
  onAddCheck: (checkData: Omit<Check, 'id'>) => void;
  onDeleteCheck: (id: number) => void;
  onUpdateCheck: (checkData: Omit<Check, 'id'>, id: number) => void;
  onUpdateCheckStatus: (checkNumber: string, status: CheckStatus) => string;
  onAddTransaction: (transactionData: Omit<Transaction, 'id'>) => void;
  onDeleteTransaction: (id: number) => void;
  onUpdateTransaction: (transactionData: Omit<Transaction, 'id'>, id: number) => void;
  onAddNote: (text: string) => void;
  onDeleteNote: (id: number) => void;
  onToggleNote: (id: number) => void;
  onDeleteAllNotes: () => void;
  onAddRecurringTask: (task: Omit<RecurringTask, 'id'>) => void;
}

interface Message {
  sender: 'user' | 'ai';
  text: string;
  isActionExecution?: boolean;
  image?: string;
  sources?: { uri: string; title: string }[];
}

declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

const sanitizeAmount = (amount: any): number => {
    if (typeof amount === 'number') return amount;
    if (typeof amount === 'string') {
        const westernNumerals = amount
            .replace(/[\u0660-\u0669]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x0660 + 0x0030))
            .replace(/[\u06F0-\u06F9]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x06F0 + 0x0030));
        const sanitized = westernNumerals.replace(/[^\d.]/g, '');
        return Number(sanitized) || 0;
    }
    return 0;
};


const AIAssistant: React.FC<AIAssistantProps> = (props) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [isAiAvailable, setIsAiAvailable] = useState<boolean | null>(null);
  const genAiModule = useRef<any>(null);
  const chatSession = useRef<Chat | null>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [hasGreeted, setHasGreeted] = useState(false);
  const dependenciesRef = useRef({ ...props, input, attachedImage });

  useEffect(() => {
    dependenciesRef.current = { ...props, input, attachedImage };
  });

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const executeFunction = useCallback(async (name: string, args: any): Promise<string> => {
    const { 
        appData, onAddCustomer, onDeleteCustomer, onUpdateCustomer, onAddInvoice, onDeleteInvoice, 
        onUpdateInvoiceStatus, onAddCheck, onDeleteCheck, onUpdateCheck, onUpdateCheckStatus, 
        onAddTransaction, onDeleteTransaction, onUpdateTransaction, onAddNote, onDeleteNote, onToggleNote,
        onDeleteAllNotes, onAddRecurringTask
      } = dependenciesRef.current; 

    switch (name) {
        case 'getProfitabilityByProduct': {
            const productProfit: { [name: string]: { profit: number, sales: number } } = {};
            const productMap = appData.products.reduce((map, p) => {
                map[p.name] = p;
                return map;
            }, {} as Record<string, Product>);

            appData.invoices
                .filter(i => i.status === InvoiceStatus.Paid)
                .forEach(inv => {
                    inv.items.forEach(item => {
                        const product = productMap[item.description];
                        if (product && product.costPrice) {
                            const profit = (item.price - product.costPrice) * item.quantity;
                            if (!productProfit[product.name]) {
                                productProfit[product.name] = { profit: 0, sales: 0 };
                            }
                            productProfit[product.name].profit += profit;
                            productProfit[product.name].sales += item.price * item.quantity;
                        }
                    });
                });
            
            const sortedProducts = Object.entries(productProfit)
                .sort(([, a], [, b]) => b.profit - a.profit)
                .slice(0, 3)
                .map(([name, data]) => ({ name, profit: data.profit }));

            if (sortedProducts.length === 0) return "سودی از فروش محصولی ثبت نشده است.";
            return JSON.stringify(sortedProducts);
        }
        case 'getInvoiceProfit': {
            const invoice = appData.invoices.find(inv => inv.number.toLowerCase() === args.invoiceNumber.toLowerCase());
            if (!invoice) return `فاکتوری با شماره ${args.invoiceNumber} یافت نشد.`;
            
            const productMap = appData.products.reduce((map, p) => {
                map[p.name] = p;
                return map;
            }, {} as Record<string, Product>);
            
            let revenue = 0;
            let cogs = 0;
            invoice.items.forEach(item => {
                revenue += item.price * item.quantity;
                const product = productMap[item.description];
                if (product && product.costPrice) {
                    cogs += product.costPrice * item.quantity;
                }
            });
            revenue -= invoice.discount;
            const profit = revenue - cogs;
            return `سود ناخالص فاکتور ${args.invoiceNumber} مبلغ ${profit.toLocaleString('fa-IR')} تومان است.`;
        }
        case 'getProfitabilityByCustomer': {
            if (!appData.invoices.length) return "هیچ فاکتوری برای تحلیل سودآوری وجود ندارد.";
            const customerRevenue: { [id: number]: number } = {};
            appData.invoices
                .filter(i => i.status === InvoiceStatus.Paid)
                .forEach(inv => {
                    const total = inv.items.reduce((sum, item) => sum + item.price * item.quantity, 0) - inv.discount;
                    customerRevenue[inv.customerId] = (customerRevenue[inv.customerId] || 0) + total;
                });
            const topCustomers = Object.entries(customerRevenue)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 3)
                .map(([id, revenue]) => {
                    const customer = appData.customers.find(c => c.id === Number(id));
                    return { name: customer ? `${customer.firstName} ${customer.lastName}` : `مشتری حذف شده`, revenue };
                });
            if (topCustomers.length === 0) return "هیچ مشتری سودآوری (بر اساس فاکتورهای پرداخت شده) یافت نشد.";
            return JSON.stringify(topCustomers);
        }
        case 'analyzeCashFlowForecast': {
            const balance = appData.transactions.filter(t => t.type === TransactionType.Income).reduce((sum, t) => sum + t.amount, 0) - appData.transactions.filter(t => t.type === TransactionType.Expense).reduce((sum, t) => sum + t.amount, 0);
            const futureMonths = getFuturePersianMonths(3);
            let currentBalance = balance;
            const forecast = futureMonths.map(monthInfo => {
                const monthKey = `${monthInfo.year}/${String(monthInfo.month).padStart(2, '0')}`;
                const income = appData.invoices.filter(inv => inv.status !== InvoiceStatus.Paid && inv.dueDate.startsWith(monthKey)).reduce((sum, inv) => sum + (inv.items.reduce((s, i) => s + i.price * i.quantity, 0) - inv.discount - inv.downPayment), 0);
                const expense = appData.checks.filter(c => c.type === CheckType.Paid && c.status === CheckStatus.Pending && c.dueDate.startsWith(monthKey)).reduce((sum, c) => sum + c.amount, 0);
                currentBalance += income - expense;
                return { month: monthInfo.name, netFlow: income - expense, endBalance: currentBalance };
            });
            return JSON.stringify(forecast);
        }
        case 'suggestCostSaving': {
            if (appData.transactions.length < 5) return "داده‌های کافی برای تحلیل هزینه‌ها وجود ندارد.";
            const [currentMonth, lastMonth] = getPastPersianMonths(2);
            const currentMonthKey = `${currentMonth.year}/${String(currentMonth.month).padStart(2, '0')}`;
            const lastMonthKey = `${lastMonth.year}/${String(lastMonth.month).padStart(2, '0')}`;

            const expenses = appData.transactions.filter(t => t.type === TransactionType.Expense);
            const currentExpenses: { [cat: string]: number } = {};
            const lastExpenses: { [cat: string]: number } = {};

            expenses.forEach(t => {
                if (t.date.startsWith(currentMonthKey)) currentExpenses[t.category] = (currentExpenses[t.category] || 0) + t.amount;
                if (t.date.startsWith(lastMonthKey)) lastExpenses[t.category] = (lastExpenses[t.category] || 0) + t.amount;
            });
            
            const suggestions = [];
            for (const category in currentExpenses) {
                const current = currentExpenses[category];
                const last = lastExpenses[category] || 0;
                if (current > last * 1.2 && current > 500000) { // More than 20% increase and significant amount
                    suggestions.push(`هزینه در دسته «${category}» این ماه ${Math.round((current - last) / (last || 1) * 100)}% افزایش داشته است.`);
                }
            }
            if (suggestions.length > 0) return suggestions.join('\n');
            return "افزایش هزینه قابل توجهی در این ماه نسبت به ماه گذشته مشاهده نشد.";
        }
        case 'createRecurringExpense': {
            const task: Omit<RecurringTask, 'id'> = {
                name: `هزینه: ${args.description}`,
                type: 'transaction',
                template: {
                    type: TransactionType.Expense,
                    description: args.description,
                    category: args.category || 'عمومی',
                    amount: sanitizeAmount(args.amount)
                },
                frequency: args.frequency as RecurringFrequency,
                startDate: args.startDate,
                nextRunDate: args.startDate,
                lastRunDate: null,
                status: RecurringStatus.Active,
                invoiceStatusOnCreate: InvoiceStatus.Pending // Not used for transactions
            };
            onAddRecurringTask(task);
            return `اتوماسیون برای هزینه تکرارشونده "${args.description}" با موفقیت ایجاد شد.`;
        }
        case 'getFinancialSummary': {
             const income = appData.transactions.filter(t => t.type === TransactionType.Income).reduce((sum, t) => sum + t.amount, 0);
             const expense = appData.transactions.filter(t => t.type === TransactionType.Expense).reduce((sum, t) => sum + t.amount, 0);
             return JSON.stringify({ totalIncome: income, totalExpense: expense, balance: income - expense });
        }
        case 'addCustomer':
            onAddCustomer({ firstName: args.firstName, lastName: args.lastName, phone: args.phone || '', address: args.address || '', email: args.email || '' });
            return `مشتری ${args.firstName} ${args.lastName} با موفقیت اضافه شد.`;
        case 'deleteCustomer': {
            const customerName = (args.customerName || '').toLowerCase();
            const customer = appData.customers.find(c => `${c.firstName} ${c.lastName}`.toLowerCase().includes(customerName));
            if (customer) { onDeleteCustomer(customer.id); return `مشتری ${args.customerName} با موفقیت حذف شد.`; }
            return `مشتری با نام ${args.customerName} یافت نشد.`;
        }
        case 'editCustomer': {
            const customerName = (args.customerName || '').toLowerCase();
            const customer = appData.customers.find(c => `${c.firstName} ${c.lastName}`.toLowerCase().includes(customerName));
            if (customer) {
                const updatedData = { ...customer, phone: args.newPhone || customer.phone, address: args.newAddress || customer.address, email: args.newEmail || customer.email };
                onUpdateCustomer(updatedData, customer.id);
                return `اطلاعات مشتری ${args.customerName} با موفقیت ویرایش شد.`;
            }
            return `مشتری با نام ${args.customerName} یافت نشد.`;
        }
        case 'addInvoice': {
            const customerName = (args.customerName || '').toLowerCase();
            const customer = appData.customers.find(c => `${c.firstName} ${c.lastName}`.toLowerCase().includes(customerName));
            if (!customer) return `مشتری با نام ${args.customerName} یافت نشد. لطفا ابتدا مشتری را اضافه کنید.`;
            onAddInvoice({ customerId: customer.id, issueDate: new Date().toLocaleDateString('fa-IR-u-nu-latn'), dueDate: '', items: [{ id: Date.now(), description: args.itemDescription, quantity: 1, price: sanitizeAmount(args.itemPrice) }], discount: 0, downPayment: 0, notes: '', status: InvoiceStatus.Pending });
            return `فاکتور برای ${args.customerName} با موفقیت صادر شد.`;
        }
        case 'deleteInvoice': {
            const invoice = appData.invoices.find(inv => inv.number.toLowerCase() === args.invoiceNumber.toLowerCase());
            if(invoice) { onDeleteInvoice(invoice.id); return `فاکتور شماره ${args.invoiceNumber} با موفقیت حذف شد.`; }
            return `فاکتوری با شماره ${args.invoiceNumber} یافت نشد.`;
        }
        case 'updateInvoiceStatus': return onUpdateInvoiceStatus(args.invoiceNumber, args.status as InvoiceStatus);
        case 'addCheck': {
            const customerName = (args.customerName || '').toLowerCase();
            const customer = appData.customers.find(c => `${c.firstName} ${c.lastName}`.toLowerCase().includes(customerName));
            if (!customer) return `مشتری با نام ${args.customerName} یافت نشد.`;
            onAddCheck({ type: args.type as CheckType, customerId: customer.id, checkNumber: args.checkNumber, bankName: args.bankName, amount: sanitizeAmount(args.amount), issueDate: new Date().toLocaleDateString('fa-IR-u-nu-latn'), dueDate: args.dueDate, status: CheckStatus.Pending, description: '' });
            return `چک شماره ${args.checkNumber} برای ${args.customerName} با موفقیت ثبت شد.`;
        }
         case 'deleteCheck': {
            const check = appData.checks.find(c => c.checkNumber === args.checkNumber);
            if (check) { onDeleteCheck(check.id); return `چک شماره ${args.checkNumber} با موفقیت حذف شد.`; }
            return `چکی با شماره ${args.checkNumber} یافت نشد.`;
        }
        case 'editCheck': {
            const check = appData.checks.find(c => c.checkNumber === args.checkNumber);
            if (check) {
                const updatedData = { ...check, bankName: args.newBankName || check.bankName, amount: args.newAmount ? sanitizeAmount(args.newAmount) : check.amount, dueDate: args.newDueDate || check.dueDate };
                delete (updatedData as any).id;
                onUpdateCheck(updatedData, check.id);
                return `چک شماره ${args.checkNumber} با موفقیت ویرایش شد.`;
            }
            return `چکی با شماره ${args.checkNumber} یافت نشد.`;
        }
        case 'updateCheckStatus': return onUpdateCheckStatus(args.checkNumber, args.status as CheckStatus);
        case 'addTransaction': {
            const date = args.date || new Date().toLocaleDateString('fa-IR-u-nu-latn');
            onAddTransaction({ type: args.type as TransactionType, date, description: args.description, category: args.category || 'عمومی', amount: sanitizeAmount(args.amount) });
            return `تراکنش '${args.description}' به تاریخ ${date} با موفقیت ثبت شد.`;
        }
         case 'deleteTransaction': {
            const desc = (args.description || '').toLowerCase();
            const transaction = [...appData.transactions].reverse().find(t => t.description.toLowerCase().includes(desc));
            if (transaction) { onDeleteTransaction(transaction.id); return `آخرین تراکنش با شرح "${args.description}" با موفقیت حذف شد.`; }
            return `تراکنشی با شرح "${args.description}" یافت نشد.`;
        }
        case 'editTransaction': {
            const desc = (args.description || '').toLowerCase();
            const transaction = [...appData.transactions].reverse().find(t => t.description.toLowerCase().includes(desc));
            if (transaction) {
                const updatedData = { ...transaction, description: args.newDescription || transaction.description, amount: args.newAmount ? sanitizeAmount(args.newAmount) : transaction.amount };
                delete (updatedData as any).id;
                onUpdateTransaction(updatedData, transaction.id);
                return `آخرین تراکنش با شرح "${args.description}" با موفقیت ویرایش شد.`;
            }
            return `تراکنشی با شرح "${args.description}" یافت نشد.`;
        }
        case 'addNote': onAddNote(args.text); return `یادداشت "${args.text}" با موفقیت اضافه شد.`;
        case 'deleteNote': {
            const text = (args.text || '').toLowerCase();
            let note = appData.notes.find(n => n.text.toLowerCase() === text) || appData.notes.find(n => n.text.toLowerCase().includes(text));
            if (note) { onDeleteNote(note.id); return `یادداشت "${note.text}" حذف شد.`; }
            return `یادداشتی حاوی متن "${args.text}" یافت نشد.`;
        }
        case 'deleteAllNotes': onDeleteAllNotes(); return `تمام یادداشت‌ها با موفقیت حذف شدند.`;
        case 'toggleNoteStatus': {
            const text = (args.text || '').toLowerCase();
            const note = appData.notes.find(n => n.text.toLowerCase().includes(text));
            if (note) { onToggleNote(note.id); return `وضعیت یادداشت "${note.text}" به ${!note.completed ? 'انجام شده' : 'انجام نشده'} تغییر یافت.`; }
            return `یادداشتی حاوی متن "${args.text}" یافت نشد.`;
        }
        default: return `تابع ${name} یافت نشد.`;
    }
  }, []);

  const handleSendMessage = useCallback(async (prompt?: string, silent: boolean = false) => {
    const { input, attachedImage, appData } = dependenciesRef.current;
    const userMessage = prompt || input;
    const imageToSend = attachedImage;
    if (!userMessage.trim() && !imageToSend) return;

    setIsLoading(true);
    if(!silent) {
        setInput('');
        setAttachedImage(null);
        setMessages(prev => [...prev, { sender: 'user', text: userMessage, image: imageToSend }]);
    }
    
    const parts: any[] = [{ text: `[پیام کاربر]: "${userMessage}"\n---\n[داده‌های فعلی برنامه]:\n${JSON.stringify(appData)}` }];
    if (imageToSend) { parts.unshift({ inlineData: { mimeType: imageToSend.split(';')[0].split(':')[1], data: imageToSend.split(',')[1] } }); }

    try {
        let response = await chatSession.current!.sendMessage({ message: parts });
        while (response.functionCalls && response.functionCalls.length > 0) {
            const call = response.functionCalls[0];
            const functionResultText = await executeFunction(call.name, call.args);
            response = await chatSession.current!.sendMessage({ message: [{ functionResponse: { name: call.name, response: { content: functionResultText } } }] });
        }
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map(c => c.web).filter((w): w is { uri: string; title: string } => !!w?.uri);
        setMessages(prev => [...prev, { sender: 'ai', text: response.text || 'پاسخی دریافت نشد.', sources }]);
    } catch (error) {
      console.error('Error with AI Assistant:', error);
      setMessages(prev => [...prev, { sender: 'ai', text: 'متاسفانه در ارتباط با دستیار هوشمند مشکلی پیش آمد.' }]);
    } finally {
      setIsLoading(false);
    }
  }, [executeFunction]);
  
  const initializeChat = useCallback(() => {
    if (isAiAvailable && genAiModule.current) {
        chatSession.current = null;
        const { GoogleGenAI, Type } = genAiModule.current;
        const apiKey = process.env.API_KEY;
        if (!apiKey) { setIsAiAvailable(false); return; }
        const ai = new GoogleGenAI({ apiKey });
        const { aiSettings } = dependenciesRef.current;
        const toolDeclarations: Record<string, FunctionDeclaration[]> = {
            customers: [
                { name: 'addCustomer', description: 'افزودن مشتری جدید.', parameters: { type: Type.OBJECT, properties: { firstName: { type: Type.STRING }, lastName: { type: Type.STRING }, phone: { type: Type.STRING }, address: { type: Type.STRING }, email: { type: Type.STRING } }, required: ['firstName', 'lastName'] } },
                { name: 'deleteCustomer', description: 'حذف مشتری بر اساس نام.', parameters: { type: Type.OBJECT, properties: { customerName: { type: Type.STRING } }, required: ['customerName'] } },
                { name: 'editCustomer', description: 'ویرایش اطلاعات مشتری.', parameters: { type: Type.OBJECT, properties: { customerName: { type: Type.STRING }, newPhone: { type: Type.STRING }, newAddress: { type: Type.STRING }, newEmail: { type: Type.STRING } }, required: ['customerName'] } },
            ],
            invoices: [
                { name: 'addInvoice', description: 'ایجاد فاکتور جدید.', parameters: { type: Type.OBJECT, properties: { customerName: { type: Type.STRING }, itemDescription: { type: Type.STRING }, itemPrice: { type: Type.NUMBER } }, required: ['customerName', 'itemDescription', 'itemPrice'] } },
                { name: 'deleteInvoice', description: 'حذف فاکتور بر اساس شماره.', parameters: { type: Type.OBJECT, properties: { invoiceNumber: { type: Type.STRING } }, required: ['invoiceNumber'] } },
                { name: 'updateInvoiceStatus', description: 'تغییر وضعیت فاکتور.', parameters: { type: Type.OBJECT, properties: { invoiceNumber: { type: Type.STRING }, status: { type: Type.STRING, enum: Object.values(InvoiceStatus) } }, required: ['invoiceNumber', 'status'] } },
                { name: 'getInvoiceProfit', description: 'محاسبه سود ناخالص یک فاکتور خاص.', parameters: { type: Type.OBJECT, properties: { invoiceNumber: { type: Type.STRING, description: "شماره کامل فاکتور" } }, required: ['invoiceNumber'] } },
            ],
            checks: [
                { name: 'addCheck', description: 'ثبت چک جدید.', parameters: { type: Type.OBJECT, properties: { type: { type: Type.STRING, enum: Object.values(CheckType) }, customerName: { type: Type.STRING }, checkNumber: { type: Type.STRING }, bankName: { type: Type.STRING }, amount: { type: Type.NUMBER }, dueDate: { type: Type.STRING } }, required: ['type', 'customerName', 'checkNumber', 'bankName', 'amount', 'dueDate'] } },
                { name: 'deleteCheck', description: 'حذف چک بر اساس شماره.', parameters: { type: Type.OBJECT, properties: { checkNumber: { type: Type.STRING } }, required: ['checkNumber'] } },
                { name: 'editCheck', description: 'ویرایش اطلاعات چک.', parameters: { type: Type.OBJECT, properties: { checkNumber: { type: Type.STRING }, newBankName: { type: Type.STRING }, newAmount: { type: Type.NUMBER }, newDueDate: { type: Type.STRING } }, required: ['checkNumber'] } },
                { name: 'updateCheckStatus', description: 'تغییر وضعیت چک.', parameters: { type: Type.OBJECT, properties: { checkNumber: { type: Type.STRING }, status: { type: Type.STRING, enum: Object.values(CheckStatus) } }, required: ['checkNumber', 'status'] } },
            ],
            transactions: [
                 { name: 'getFinancialSummary', description: 'دریافت گزارش کلی مالی.', parameters: { type: Type.OBJECT, properties: {} } },
                 { name: 'getProfitabilityByCustomer', description: 'تحلیل و شناسایی سودآورترین مشتریان.', parameters: { type: Type.OBJECT, properties: {} } },
                 { name: 'getProfitabilityByProduct', description: 'تحلیل و شناسایی سودآورترین محصولات.', parameters: { type: Type.OBJECT, properties: {} } },
                 { name: 'analyzeCashFlowForecast', description: 'پیش‌بینی و تحلیل جریان نقدی برای ۳ ماه آینده.', parameters: { type: Type.OBJECT, properties: {} } },
                 { name: 'suggestCostSaving', description: 'تحلیل هزینه‌ها و ارائه پیشنهاد برای صرفه‌جویی.', parameters: { type: Type.OBJECT, properties: {} } },
                 { name: 'addTransaction', description: 'ثبت تراکنش درآمد یا هزینه.', parameters: { type: Type.OBJECT, properties: { type: { type: Type.STRING, enum: Object.values(TransactionType) }, description: { type: Type.STRING }, amount: { type: Type.NUMBER }, category: { type: Type.STRING }, date: { type: Type.STRING } }, required: ['type', 'description', 'amount'] } },
                 { name: 'deleteTransaction', description: 'حذف آخرین تراکنش با شرح خاص.', parameters: { type: Type.OBJECT, properties: { description: { type: Type.STRING } }, required: ['description'] } },
                 { name: 'editTransaction', description: 'ویرایش آخرین تراکنش با شرح خاص.', parameters: { type: Type.OBJECT, properties: { description: { type: Type.STRING }, newDescription: { type: Type.STRING }, newAmount: { type: Type.NUMBER } }, required: ['description'] } },
                 { name: 'createRecurringExpense', description: 'ایجاد یک هزینه تکرارشونده.', parameters: { type: Type.OBJECT, properties: { description: { type: Type.STRING }, amount: { type: Type.NUMBER }, category: { type: Type.STRING }, frequency: { type: Type.STRING, enum: Object.values(RecurringFrequency) }, startDate: { type: Type.STRING, description: 'تاریخ شروع به فرمت YYYY/MM/DD' } }, required: ['description', 'amount', 'frequency', 'startDate'] } },
            ],
            notes: [
                 { name: 'addNote', description: 'افزودن یادداشت.', parameters: { type: Type.OBJECT, properties: { text: { type: Type.STRING } }, required: ['text'] } },
                 { name: 'deleteNote', description: 'حذف یک یادداشت.', parameters: { type: Type.OBJECT, properties: { text: { type: Type.STRING } }, required: ['text'] } },
                 { name: 'deleteAllNotes', description: 'حذف تمام یادداشت ها.', parameters: { type: Type.OBJECT, properties: {} } },
                 { name: 'toggleNoteStatus', description: 'تغییر وضعیت یادداشت.', parameters: { type: Type.OBJECT, properties: { text: { type: Type.STRING } }, required: ['text'] } },
            ]
        };
        const enabledTools: FunctionDeclaration[] = Object.entries(aiSettings.enabledTools).filter(([, enabled]) => enabled).flatMap(([key]) => toolDeclarations[key as keyof typeof toolDeclarations] || []);
        
        chatSession.current = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: { tools: [{ functionDeclarations: enabledTools.concat(toolDeclarations.notes) }, { googleSearch: {} }] },
            systemInstruction: { role: 'system', parts: [{text: `You are an AI financial advisor for an accounting app. Your role is to help users manage and analyze their financial data using provided tools. Prioritize using analytical tools like 'getProfitabilityByCustomer', 'getProfitabilityByProduct', 'analyzeCashFlowForecast', and 'suggestCostSaving' to provide strategic insights. For any question NOT about their internal data (general knowledge, real-time info), you MUST use googleSearch. Respond exclusively in Persian. Be concise and actionable. For commands to delete ALL items, you MUST ask for confirmation. When receiving 'PROACTIVE_GREETING', check for urgent financial matters and inform the user. Suggest relevant next steps as smart action links in the format [action:Button Text](Executable Command).` }] },
        });
    }
  }, [isAiAvailable]);

  const loadAiModule = useCallback(async () => {
    setIsAiAvailable(null);
    try {
      const module = await import('@google/genai');
      genAiModule.current = module;
      setIsAiAvailable(true);
    } catch (error) {
      console.error("Failed to load AI module:", error);
      setIsAiAvailable(false);
    }
  }, []);
  
  useEffect(() => { loadAiModule(); }, [loadAiModule]);
  useEffect(() => { initializeChat(); }, [isAiAvailable, initializeChat, props.aiSettings]);
  useEffect(() => {
    if (isAiAvailable && !hasGreeted && chatSession.current && props.aiSettings.proactiveGreeting) {
        setHasGreeted(true);
        handleSendMessage('PROACTIVE_GREETING', true);
    }
  }, [isAiAvailable, hasGreeted, handleSendMessage, props.aiSettings.proactiveGreeting]);

  useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.lang = 'fa-IR';
            recognitionRef.current.interimResults = false;
            recognitionRef.current.onresult = (event: any) => { const transcript = event.results[0][0].transcript; setInput(transcript); handleSendMessage(transcript); };
            recognitionRef.current.onerror = (event: any) => { console.error("Speech recognition error", event.error); setIsListening(false); };
            recognitionRef.current.onend = () => { setIsListening(false); };
        }
    }, [handleSendMessage]);

  const toggleListening = () => {
      if (!recognitionRef.current) return;
      if (isListening) { recognitionRef.current.stop(); setIsListening(false); } 
      else { recognitionRef.current.start(); setIsListening(true); }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) { const reader = new FileReader(); reader.onloadend = () => { setAttachedImage(reader.result as string); }; reader.readAsDataURL(file); }
  };

  const examplePrompts = ["سودآورترین محصول من کدام است؟", "روی فاکتور INV-2024-002 چقدر سود کردم؟", "جریان نقدی ۳ ماه آینده را تحلیل کن.", "کجا می‌توانم هزینه‌ها را کاهش دهم؟"];
  const handleActionClick = (command: string) => { setMessages(prev => [...prev, { sender: 'user', text: `در حال اجرای: "${command}"`, isActionExecution: true }]); handleSendMessage(command); };
  
  const renderAiMessage = (message: Message) => {
    const parts: (string | React.ReactNode)[] = []; let lastIndex = 0; const regex = /\[action:(.*?)]\((.*?)\)/g; let match;
    while ((match = regex.exec(message.text)) !== null) {
        if (match.index > lastIndex) { parts.push(message.text.substring(lastIndex, match.index)); }
        parts.push(<button key={match.index} onClick={() => handleActionClick(match[2])} className="bg-purple-100 text-purple-700 font-semibold px-3 py-1 rounded-md text-sm mx-1 my-1 hover:bg-purple-200 transition-colors inline-block">{match[1]}</button>);
        lastIndex = regex.lastIndex;
    }
    if (lastIndex < message.text.length) { parts.push(message.text.substring(lastIndex)); }
    return <>{parts.map((part, i) => <React.Fragment key={i}>{part}</React.Fragment>)}</>;
  };

 if (isAiAvailable === null) return <div className="bg-white p-6 rounded-2xl shadow-sm border h-[calc(100vh-10rem)] flex flex-col justify-center items-center"><svg className="animate-spin h-8 w-8 text-purple-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><p className="text-slate-500 font-medium">در حال آماده‌سازی دستیار هوشمند...</p></div>;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/50 h-[calc(100vh-10rem)] flex flex-col">
       {isAiAvailable === false && (<div className="p-3 mb-4 bg-red-50 text-red-800 border border-red-200 rounded-lg text-sm text-center flex items-center justify-between"><p><strong>خطا:</strong> امکان بارگیری سرویس دستیار هوشمند وجود ندارد. لطفا اتصال اینترنت خود را بررسی کنید.</p><button onClick={loadAiModule} className="ml-4 px-4 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 text-xs font-semibold">تلاش مجدد</button></div>)}
      <div ref={chatContainerRef} className="flex-grow overflow-y-auto mb-4 pr-2 space-y-6">
        {messages.length === 0 && !isLoading ? (
          <div className="text-center text-slate-500 h-full flex flex-col justify-center items-center">
             <div className="p-4 bg-purple-100 rounded-full mb-4 text-purple-600"><SparklesIcon /></div>
             <h2 className="text-2xl font-bold text-slate-800">مشاور مالی شما</h2><p className="mt-2 max-w-md">از دستیار هوشمند خود برای دریافت تحلیل‌های استراتژیک و مدیریت هوشمندانه کسب‌وکارتان استفاده کنید.</p>
             <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl w-full">{examplePrompts.map(p => <button key={p} onClick={() => handleSendMessage(p)} disabled={!isAiAvailable} className="p-3 bg-slate-50 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 text-right transition-colors disabled:opacity-50">{p}</button>)}</div>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-white ${msg.sender === 'user' ? 'bg-gradient-to-br from-purple-600 to-purple-800' : 'bg-slate-400'}`}>{msg.sender === 'user' ? 'ش' : 'AI'}</div>
              <div className={`p-4 rounded-lg max-w-2xl ${msg.sender === 'user' ? 'bg-purple-50 text-slate-800 rounded-br-none' : 'bg-slate-100 text-slate-800 rounded-bl-none'}`}>
                 {msg.image && <img src={msg.image} alt="Attached" className="mb-2 rounded-md max-w-xs" />}
                {msg.sender === 'ai' ? (
                  <>
                    <div className="whitespace-pre-wrap font-sans text-slate-800 leading-relaxed">{renderAiMessage(msg)}</div>
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-slate-200"><h4 className="text-xs font-semibold text-slate-500 mb-2">منابع:</h4><ul className="space-y-1.5">{msg.sources.map((s, i) => <li key={i}><a href={s.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-purple-600 hover:underline flex items-center gap-1.5"><svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg><span>{s.title || new URL(s.uri).hostname}</span></a></li>)}</ul></div>
                    )}
                  </>
                ) : (<p className={msg.isActionExecution ? 'text-slate-500 italic' : ''}>{msg.text}</p>)}
              </div>
            </div>
          ))
        )}
         {isLoading && (<div className="flex gap-3 flex-row"><div className="w-10 h-10 rounded-xl flex-shrink-0 bg-slate-400 flex items-center justify-center text-white">AI</div><div className="p-4 rounded-lg bg-slate-100 rounded-bl-none flex items-center"><div className="flex gap-1.5"><span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.3s]"></span><span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.15s]"></span><span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></span></div></div></div>)}
      </div>
      <div className="mt-auto pt-4 border-t border-slate-200">
        {attachedImage && (<div className="mb-2 p-2 border border-slate-200 rounded-lg flex items-center justify-between"><div className="flex items-center gap-2"><img src={attachedImage} alt="Preview" className="w-10 h-10 rounded object-cover" /><span className="text-sm text-slate-500">تصویر پیوست شد.</span></div><button onClick={() => setAttachedImage(null)} className="p-1 text-slate-400 hover:text-red-500"><XCircleIcon /></button></div>)}
        <div className="relative">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()} placeholder={isAiAvailable ? "سوال خود را بپرسید یا دستوری بدهید..." : "دستیار هوشمند غیرفعال است"} disabled={isLoading || !isAiAvailable} className="w-full p-3 pl-24 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:bg-slate-100" />
           <div className="absolute top-1/2 left-3 -translate-y-1/2 flex items-center gap-1"><input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" /><button onClick={() => fileInputRef.current?.click()} disabled={isLoading || !isAiAvailable} className="p-2 rounded-full text-slate-500 hover:bg-slate-200 disabled:text-slate-400" aria-label="پیوست فایل"><PaperclipIcon /></button><button onClick={toggleListening} disabled={isLoading || !isAiAvailable} className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-100 text-red-600' : 'text-slate-500 hover:bg-slate-200'} disabled:text-slate-400`} aria-label="فرمان صوتی"><MicrophoneIcon /></button></div>
          <button onClick={() => handleSendMessage()} disabled={isLoading || (!input.trim() && !attachedImage) || !isAiAvailable} className="absolute top-1/2 right-3 -translate-y-1/2 p-2 rounded-full text-purple-600 hover:bg-purple-100 disabled:text-slate-400" aria-label="ارسال"><SendIcon /></button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;