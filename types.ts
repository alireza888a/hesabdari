import React from 'react';

export enum View {
  Dashboard = 'داشبورد',
  Customers = 'مشتریان',
  Invoices = 'فاکتورها',
  Checks = 'چک ها',
  Settings = 'تنظیمات',
  Accounting = 'حسابداری',
  AIAssistant = 'دستیار هوشمند',
  Products = 'کالاها و خدمات',
  Reports = 'گزارشات',
  Automations = 'اتوماسیون'
}

export interface Theme {
    start: string;
    end: string;
}

export interface ThemeSettings {
    sidebarGradientStart: string;
    sidebarGradientEnd: string;
    customThemes: CustomTheme[];
}

export interface NavItem {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface StatCardData {
  title: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBgColor: string;
}

export interface ChartData {
  name: string;
  income: number;
  expense: number;
}

export interface Note {
  id: number;
  text: string;
  completed: boolean;
}

export enum InvoiceStatus {
    Paid = 'پرداخت شده',
    Pending = 'در انتظار پرداخت',
    Overdue = 'سررسید گذشته',
    Draft = 'پیش‌نویس',
}

export interface InvoiceItem {
    id: number;
    description: string;
    quantity: number;
    price: number;
}

export interface Invoice {
    id: number;
    number: string;
    customerId: number;
    issueDate: string; 
    dueDate: string;
    items: InvoiceItem[];
    discount: number;
    downPayment: number;
    notes: string;
    status: InvoiceStatus;
}

export interface Customer {
    id: number;
    code: string;
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    email: string;
}

export interface Product {
    id: number;
    code: string;
    name: string;
    price: number;
    costPrice: number;
    description: string;
}

export interface CompanyInfo {
    name: string;
    address: string;
    phone: string;
    email: string;
    logo?: string;
    tagline?: string;
    contactPerson?: string;
    website?: string;
    paymentMethod1_title?: string;
    paymentMethod1_value?: string;
    paymentMethod2_title?: string;
    paymentMethod2_value?: string;
}

export interface CustomTheme {
    name: string;
    color: string;
}

export enum TransactionType {
    Income = 'درآمد',
    Expense = 'هزینه',
}

export interface Transaction {
    id: number;
    type: TransactionType;
    date: string;
    description: string;
    category: string;
    amount: number;
}

export enum CheckType {
    Received = 'دریافتی',
    Paid = 'پرداختی',
}

export enum CheckStatus {
    Pending = 'در جریان',
    Cleared = 'پاس شده',
    Bounced = 'برگشتی',
    Spent = 'خرج شده',
}

export interface Check {
    id: number;
    type: CheckType;
    customerId: number;
    checkNumber: string;
    bankName: string;
    amount: number;
    issueDate: string;
    dueDate: string;
    status: CheckStatus;
    description: string;
}

export interface AIAssistantSettings {
    proactiveGreeting: boolean;
    enabledTools: {
        customers: boolean;
        invoices: boolean;
        checks: boolean;
        transactions: boolean;
    };
    personality: 'accountant' | 'advisor' | 'creative';
    tone: 'friendly' | 'formal';
    verbosity: 'concise' | 'normal' | 'detailed';
    language: 'persian' | 'english';
    customInstructions: string;
}

export enum RecurringFrequency {
    Monthly = 'ماهانه',
    Yearly = 'سالانه',
}

export enum RecurringStatus {
    Active = 'فعال',
    Paused = 'متوقف',
}

export interface RecurringTask {
    id: number;
    name: string;
    type: 'invoice' | 'transaction';
    template: Omit<Invoice, 'id' | 'number' | 'issueDate' | 'dueDate' | 'status'> | Omit<Transaction, 'id' | 'date'>;
    frequency: RecurringFrequency;
    startDate: string; // Jalali
    nextRunDate: string; // Jalali
    lastRunDate: string | null; // Jalali
    status: RecurringStatus;
    invoiceStatusOnCreate: InvoiceStatus;
}


export interface AppData {
    customers: Customer[];
    invoices: Invoice[];
    checks: Check[];
    transactions: Transaction[];
    products: Product[];
    notes: Note[];
    companyInfo: CompanyInfo;
    themeSettings: ThemeSettings;
    aiSettings: AIAssistantSettings;
    recurringTasks: RecurringTask[];
}