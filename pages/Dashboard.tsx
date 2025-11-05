
import React, { useMemo, useState } from 'react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { Transaction, Invoice, Customer, Check, TransactionType, InvoiceStatus, CheckStatus, CheckType, Note, RecurringTask, RecurringStatus } from '../types';
import PlusIcon from '../components/icons/PlusIcon';
import TrashIcon from '../components/icons/TrashIcon';
import ClockIcon from '../components/icons/ClockIcon';
import CheckCircleIcon from '../components/icons/CheckCircleIcon';
import ExclamationCircleIcon from '../components/icons/ExclamationCircleIcon';
import AIInsights from '../components/AIInsights';
import CashFlowForecastChart from '../components/CashFlowForecastChart';
import { getFuturePersianMonths, formatCurrency, getTodayJalali } from '../utils';
import TrendingUpIcon from '../components/icons/TrendingUpIcon';
import TrendingDownIcon from '../components/icons/TrendingDownIcon';

// Helper function to get past Persian months, moved here for co-location
const getPersianMonths = (count: number): { year: number; month: number; name: string }[] => {
    const monthNames = ["فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور", "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"];
    try {
        const todayParts = getTodayJalali().split('/');
        let currentYear = parseInt(todayParts[0], 10);
        let currentMonth = parseInt(todayParts[1], 10);

        const months = [];
        for (let i = 0; i < count; i++) {
            const monthIndex = currentMonth - 1;
            months.push({ year: currentYear, month: currentMonth, name: monthNames[monthIndex] });

            currentMonth--;
            if (currentMonth === 0) {
                currentMonth = 12;
                currentYear--;
            }
        }
        return months.reverse();
    } catch (e) {
        return Array.from({ length: count }, (_, i) => ({ year: 2023, month: i + 1, name: `ماه ${i + 1}` }));
    }
};

// --- START: Chart Components ---
const DynamicLineChart: React.FC<{ data: { month: string; income: number; expense: number }[] }> = ({ data }) => {
    const maxValue = Math.max(1, ...data.map(d => d.income), ...data.map(d => d.expense)) * 1.1;

    const generatePath = (values: number[]) => {
        if (values.length <= 1) {
            const y = 180 - ((values[0] || 0) / maxValue) * 160;
            return `M 30,${y.toFixed(2)} L 390,${y.toFixed(2)}`;
        };
        const points = values.map((value, index) => {
            const x = 30 + (index * (360 / (values.length - 1)));
            const y = 180 - ((value / maxValue) * 160);
            return `${x.toFixed(2)},${y.toFixed(2)}`;
        });
        return `M ${points[0]} ${points.slice(1).map((p, i) => {
            const prev = points[i].split(',');
            const curr = p.split(',');
            const cpx1 = (parseFloat(prev[0]) + parseFloat(curr[0])) / 2;
            return `C ${cpx1},${prev[1]} ${cpx1},${curr[1]} ${p}`;
        }).join(' ')}`;
    };

    const incomePath = generatePath(data.map(d => d.income));
    const expensePath = generatePath(data.map(d => d.expense));

    return (
        <div className="w-full h-80 flex items-center justify-center rounded-lg p-4">
           <svg width="100%" height="100%" viewBox="0 0 400 200" className="max-h-full">
                <g className="text-slate-400 text-xs" fill="currentColor">
                  {[0, 0.25, 0.5, 0.75, 1].map(f => {
                     const y = 180 - (f * 160);
                     const value = f * maxValue;
                     return (
                        <g key={f}>
                            <line x1="30" y1={y} x2="390" y2={y} stroke="currentColor" strokeWidth="1" strokeDasharray="2,3" opacity="0.3" />
                            <text x="25" y={y+4} textAnchor="end" className="text-[10px] fill-current">{ (value/1_000_000).toFixed(1)} M</text>
                        </g>
                     )
                  })}
                </g>
                <g className="text-slate-500 text-xs" fill="currentColor">
                    {data.map((d, index) => {
                        const x = 30 + (index * (360 / (Math.max(1, data.length - 1))));
                        return <text key={index} x={x} y="195" textAnchor="middle">{d.month}</text>
                    })}
                </g>
                <path d={incomePath} fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" />
                <path d={expensePath} fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
        </div>
    );
};

const DynamicDonutChart: React.FC<{ title: string; percentage: number; color: string }> = ({ title, percentage, color }) => (
    <div className="flex flex-col items-center">
        <div className="relative w-24 h-24">
            <svg className="w-full h-full" viewBox="0 0 36 36" transform='rotate(-90)'>
                <path className="text-slate-200" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5"></path>
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={color} strokeWidth="3.5" strokeDasharray={`${percentage}, 100`} strokeDashoffset="0" strokeLinecap="round"></path>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xl font-bold" style={{color}}>{percentage}%</div>
        </div>
        <p className="mt-2 font-semibold text-slate-700">{title}</p>
    </div>
);

const DynamicBarChart: React.FC<{ data: { month: string; value: number }[] }> = ({ data }) => {
    const maxValue = Math.max(1, ...data.map(d => d.value)) * 1.1;
    
    return (
        <div className="w-full h-64 p-4 flex items-end justify-around gap-2">
           {data.map((d, index) => (
                <div key={index} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
                    <div 
                        className="w-4/5 bg-purple-400 rounded-t-md transition-all duration-500"
                        style={{ height: `${(d.value / maxValue) * 100}%`, backgroundColor: `rgba(139, 92, 246, ${0.5 + (d.value/maxValue)*0.5})` }}
                        title={`${d.month}: ${d.value.toLocaleString('fa-IR')} تومان`}
                    ></div>
                    <span className="text-xs text-slate-500">{d.month}</span>
                </div>
           ))}
        </div>
    );
};
// --- END: Chart Components ---

interface DashboardProps {
    transactions: Transaction[];
    invoices: Invoice[];
    customers: Customer[];
    checks: Check[];
    notes: Note[];
    recurringTasks: RecurringTask[];
    onAddNote: (text: string) => void;
    onToggleNote: (id: number) => void;
    onDeleteNote: (id: number) => void;
}

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string; percentage: string; colorClass: string; }> = ({ icon, title, value, percentage, colorClass }) => (
    <div className={`p-6 rounded-2xl shadow-sm border border-slate-200/50 flex items-start gap-4 ${colorClass}`}>
        <div className="bg-white/30 p-3 rounded-xl">{icon}</div>
        <div>
            <p className="text-sm font-medium text-white/90">{title}</p>
            <p className="text-3xl font-bold text-white mt-1">{value}</p>
            <p className="text-xs text-white/80 mt-2">{percentage}</p>
        </div>
    </div>
);
const NotesWidget: React.FC<{ notes: Note[]; onAdd: (text: string) => void; onToggle: (id: number) => void; onDelete: (id: number) => void; }> = ({ notes, onAdd, onToggle, onDelete }) => {
    const [newNote, setNewNote] = useState('');
    const handleAdd = () => { if (newNote.trim()) { onAdd(newNote.trim()); setNewNote(''); } };
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/50 h-full flex flex-col">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">یادداشت های روزانه</h3>
            <div className="flex mb-4">
                <input type="text" value={newNote} onChange={(e) => setNewNote(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAdd()} placeholder="یادداشت جدید..." className="flex-grow p-2 border border-slate-300 rounded-r-lg focus:ring-purple-500 focus:border-purple-500" />
                <button onClick={handleAdd} className="bg-purple-600 text-white px-4 rounded-l-lg hover:bg-purple-700"><PlusIcon /></button>
            </div>
            <div className="flex-grow space-y-2 overflow-y-auto pr-1 min-h-[200px]">
                {notes.map(note => (
                    <div key={note.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 group">
                        <div className="flex items-center"><input type="checkbox" checked={note.completed} onChange={() => onToggle(note.id)} className="w-5 h-5 rounded text-purple-600 focus:ring-purple-500 border-slate-300" /><span className={`ml-3 text-sm font-medium ${note.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>{note.text}</span></div>
                        <button onClick={() => onDelete(note.id)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><TrashIcon /></button>
                    </div>
                ))}
                {notes.length === 0 && <p className="text-center text-slate-400 py-4">یادداشتی وجود ندارد.</p>}
            </div>
        </div>
    );
};

const CurrentStatusDashboard: React.FC<Omit<DashboardProps, 'recurringTasks'>> = ({ transactions, invoices, customers, checks, notes, onAddNote, onToggleNote, onDeleteNote }) => {
    const invoiceStats = useMemo(() => {
        const total = invoices.length;
        if (total === 0) return { total: 0, paid: 0, paidPercentage: '0%', pending: 0, pendingPercentage: '0%', overdue: 0, overduePercentage: '0%' };
        
        const paid = invoices.filter(i => i.status === InvoiceStatus.Paid).length;
        const pending = invoices.filter(i => i.status === InvoiceStatus.Pending).length;
        const overdue = invoices.filter(i => i.status === InvoiceStatus.Overdue).length;
        const formatPercentage = (count: number) => `${Math.round((count / total) * 100)}%`;

        return { total, paid, paidPercentage: formatPercentage(paid), pending, pendingPercentage: formatPercentage(pending), overdue, overduePercentage: formatPercentage(overdue) };
    }, [invoices]);
    
    const lineChartData = useMemo(() => {
        const last6Months = getPersianMonths(6);
        return last6Months.map(m => {
            const income = invoices.filter(i => i.status === InvoiceStatus.Paid && i.issueDate.startsWith(`${m.year}/${String(m.month).padStart(2, '0')}`)).reduce((s, inv) => s + (inv.items.reduce((iS, i) => iS + i.price * i.quantity, 0) - inv.discount), 0);
            const expense = transactions.filter(t => t.type === TransactionType.Expense && t.date.startsWith(`${m.year}/${String(m.month).padStart(2, '0')}`)).reduce((s, t) => s + t.amount, 0);
            return { month: m.name, income, expense };
        });
    }, [transactions, invoices]);
    
    const paidInvoicesPercentage = useMemo(() => invoices.length === 0 ? 0 : Math.round(invoices.filter(i => i.status === InvoiceStatus.Paid).length / invoices.length * 100), [invoices]);
    const clearedChecksPercentage = useMemo(() => {
        const received = checks.filter(c => c.type === CheckType.Received);
        return received.length === 0 ? 0 : Math.round(received.filter(c => c.status === CheckStatus.Cleared).length / received.length * 100);
    }, [checks]);

    const barChartData = useMemo(() => getPersianMonths(5).map(m => ({
        month: m.name,
        value: invoices.filter(i => i.status === InvoiceStatus.Paid && i.issueDate.startsWith(`${m.year}/${String(m.month).padStart(2, '0')}`)).reduce((s, inv) => s + (inv.items.reduce((iS, i) => iS + i.price * i.quantity, 0) - inv.discount), 0)
    })), [invoices]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<DocumentTextIcon className="w-7 h-7" />} title="کل فاکتورها" value={String(invoiceStats.total)} percentage=" " colorClass="bg-gradient-to-br from-purple-600 to-purple-800" />
                <StatCard icon={<ClockIcon className="w-7 h-7" />} title="در انتظار پرداخت" value={String(invoiceStats.pending)} percentage={`${invoiceStats.pendingPercentage} از کل`} colorClass="bg-gradient-to-br from-amber-500 to-amber-600" />
                <StatCard icon={<CheckCircleIcon className="w-7 h-7" />} title="پرداخت شده" value={String(invoiceStats.paid)} percentage={`${invoiceStats.paidPercentage} از کل`} colorClass="bg-gradient-to-br from-green-500 to-green-600" />
                <StatCard icon={<ExclamationCircleIcon className="w-7 h-7" />} title="سررسید گذشته" value={String(invoiceStats.overdue)} percentage={`${invoiceStats.overduePercentage} از کل`} colorClass="bg-gradient-to-br from-red-500 to-red-600" />
            </div>
             <AIInsights customers={customers} invoices={invoices} transactions={transactions} checks={checks} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200/50">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">گزارش درآمد و هزینه (۶ ماه اخیر)</h3>
                    <DynamicLineChart data={lineChartData} />
                </div>
                 <div className="min-h-[400px]">
                    <NotesWidget notes={notes} onAdd={onAddNote} onToggle={onToggleNote} onDelete={onDeleteNote} />
                </div>
            </div>
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200/50">
                     <h3 className="text-lg font-semibold text-slate-800 mb-4">درآمد ماهانه (۵ ماه اخیر)</h3>
                     <DynamicBarChart data={barChartData} />
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/50 space-y-6 flex flex-col justify-around items-center">
                     <h3 className="text-lg font-semibold text-slate-800 text-center">وضعیت کلی</h3>
                     <div className="flex justify-around w-full">
                        <DynamicDonutChart title="فاکتورهای پرداخت شده" percentage={paidInvoicesPercentage} color="#8b5cf6" />
                        <DynamicDonutChart title="چک های دریافتی پاس شده" percentage={clearedChecksPercentage} color="#38bdf8" />
                     </div>
                </div>
            </div>
        </div>
    );
}


const ForecastDashboard: React.FC<DashboardProps> = ({ transactions, invoices, checks, recurringTasks }) => {
    const [scenario, setScenario] = useState({ monthlyIncome: 0, monthlyExpense: 0 });

    const forecastData = useMemo(() => {
        const balance = transactions.filter(t => t.type === TransactionType.Income).reduce((sum, t) => sum + t.amount, 0) - transactions.filter(t => t.type === TransactionType.Expense).reduce((sum, t) => sum + t.amount, 0);

        const futureMonths = getFuturePersianMonths(6);
        let currentBalance = balance;
        
        return futureMonths.map(monthInfo => {
            const monthKey = `${monthInfo.year}/${String(monthInfo.month).padStart(2, '0')}`;
            
            const projectedIncome = invoices
                .filter(inv => inv.status !== InvoiceStatus.Paid && inv.dueDate.startsWith(monthKey))
                .reduce((sum, inv) => sum + (inv.items.reduce((s, i) => s + i.price * i.quantity, 0) - inv.discount - inv.downPayment), 0);

            const recurringIncome = recurringTasks
                .filter(t => t.type === 'invoice' && t.status === RecurringStatus.Active && t.nextRunDate.startsWith(monthKey))
                .reduce((sum, task) => {
                    const template = task.template as Omit<Invoice, 'id' | 'number'>;
                    return sum + (template.items.reduce((s, i) => s + i.price * i.quantity, 0) - template.discount - template.downPayment);
                }, 0);

            const projectedExpense = checks
                .filter(c => c.type === CheckType.Paid && c.status === CheckStatus.Pending && c.dueDate.startsWith(monthKey))
                .reduce((sum, c) => sum + c.amount, 0);
            
            const recurringExpense = recurringTasks
                .filter(t => t.type === 'transaction' && t.status === RecurringStatus.Active && t.nextRunDate.startsWith(monthKey))
                .reduce((sum, task) => sum + (task.template as Transaction).amount, 0);
            
            const totalMonthIncome = projectedIncome + recurringIncome + scenario.monthlyIncome;
            const totalMonthExpense = projectedExpense + recurringExpense + scenario.monthlyExpense;

            currentBalance += totalMonthIncome - totalMonthExpense;

            return {
                month: monthInfo.name,
                income: totalMonthIncome,
                expense: totalMonthExpense,
                balance: currentBalance,
            };
        });
    }, [transactions, invoices, checks, recurringTasks, scenario]);

    const analysis = useMemo(() => {
        const lowestBalance = Math.min(...forecastData.map(d => d.balance));
        const netCashFlow3Months = forecastData.slice(0, 3).reduce((sum, d) => sum + d.income - d.expense, 0);
        return { lowestBalance, netCashFlow3Months };
    }, [forecastData]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200/50">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">نمودار پیش‌بینی جریان نقدی (۶ ماه آینده)</h3>
                    <CashFlowForecastChart data={forecastData} />
                </div>
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/50">
                        <h3 className="text-md font-semibold text-slate-700 mb-3">تحلیل هوشمند</h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-full bg-red-100 text-red-600"><TrendingDownIcon /></div>
                                <div>
                                    <p className="text-sm text-slate-500">کمترین مانده حساب</p>
                                    <p className="text-xl font-bold text-red-600">{formatCurrency(analysis.lowestBalance)}</p>
                                    <p className="text-xs text-slate-400">در ۶ ماه آینده</p>
                                </div>
                            </div>
                             <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-full ${analysis.netCashFlow3Months >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    {analysis.netCashFlow3Months >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500">جریان نقدی خالص</p>
                                    <p className={`text-xl font-bold ${analysis.netCashFlow3Months >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(analysis.netCashFlow3Months)}</p>
                                    <p className="text-xs text-slate-400">در ۳ ماه آینده</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/50">
                        <h3 className="text-md font-semibold text-slate-700 mb-4">سناریوی "چه می‌شود اگر؟"</h3>
                        <div className="space-y-3 text-sm">
                            <div>
                                <label className="font-medium text-slate-600">درآمد ماهانه جدید</label>
                                <input type="number" value={scenario.monthlyIncome} onChange={e => setScenario(s => ({...s, monthlyIncome: Number(e.target.value)}))} className="w-full p-2 mt-1 border rounded-lg" placeholder="مثلا: 2,000,000" />
                            </div>
                             <div>
                                <label className="font-medium text-slate-600">هزینه ماهانه جدید</label>
                                <input type="number" value={scenario.monthlyExpense} onChange={e => setScenario(s => ({...s, monthlyExpense: Number(e.target.value)}))} className="w-full p-2 mt-1 border rounded-lg" placeholder="مثلا: 500,000" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = (props) => {
    const [activeTab, setActiveTab] = useState<'current' | 'forecast'>('current');

    return (
        <div className="space-y-6">
            <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200/50 inline-flex items-center gap-2">
                <button onClick={() => setActiveTab('current')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'current' ? 'bg-purple-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}>
                    وضعیت فعلی
                </button>
                <button onClick={() => setActiveTab('forecast')} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${activeTab === 'forecast' ? 'bg-purple-600 text-white shadow' : 'text-slate-600 hover:bg-slate-100'}`}>
                    پیش‌بینی آینده
                </button>
            </div>

            {activeTab === 'current' ? <CurrentStatusDashboard {...props} /> : <ForecastDashboard {...props} />}
        </div>
    )
}

export default Dashboard;
