import React from 'react';
import { View } from '../types';
import DashboardIcon from './icons/DashboardIcon';
import UsersIcon from './icons/UsersIcon';
import InvoiceIcon from './icons/InvoiceIcon';
import CheckIcon from './icons/CheckIcon';
import XIcon from './icons/XIcon';
import SettingsIcon from './icons/SettingsIcon';
import AccountingIcon from './icons/AccountingIcon';
import SparklesIcon from './icons/SparklesIcon';
import ProductIcon from './icons/ProductIcon';
import ReportIcon from './icons/ReportIcon';
import LogoIcon from './icons/LogoIcon';
import AutomationIcon from './icons/AutomationIcon';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: View) => void;
  currentView: View;
  gradientStart: string;
  gradientEnd: string;
}

const navLinks = [
  { view: View.Dashboard, icon: <DashboardIcon />, label: 'داشبورد' },
  { view: View.AIAssistant, icon: <SparklesIcon />, label: 'دستیار هوشمند' },
  { view: View.Reports, icon: <ReportIcon />, label: 'گزارش‌ها' },
  { view: View.Automations, icon: <AutomationIcon />, label: 'اتوماسیون' },
  { view: View.Invoices, icon: <InvoiceIcon />, label: 'فاکتورها' },
  { view: View.Customers, icon: <UsersIcon />, label: 'مشتریان' },
  { view: View.Products, icon: <ProductIcon />, label: 'کالاها و خدمات' },
  { view: View.Checks, icon: <CheckIcon />, label: 'چک ها' },
  { view: View.Accounting, icon: <AccountingIcon />, label: 'حسابداری' },
  { view: View.Settings, icon: <SettingsIcon />, label: 'تنظیمات' },
];

const NavItem: React.FC<{
  link: typeof navLinks[0];
  isActive: boolean;
  onClick: () => void;
}> = ({ link, isActive, onClick }) => {
  return (
    <li>
      <a
        href="#"
        onClick={(e) => {
          e.preventDefault();
          onClick();
        }}
        className={`flex items-center gap-4 py-3 px-4 my-1 transition-all duration-300 rounded-xl ${
          isActive
            ? 'bg-white/20 text-white font-bold'
            : 'text-slate-200 hover:bg-white/10'
        }`}
      >
        <span className={`w-6 h-6 flex items-center justify-center`}>
          {link.icon}
        </span>
        <span className="whitespace-nowrap">{link.label}</span>
      </a>
    </li>
  );
};


const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onNavigate, currentView, gradientStart, gradientEnd }) => {
  const sidebarClasses = `
    absolute md:relative top-0 right-0 h-full w-72 
    text-white 
    flex flex-col p-4 z-50 
    transform transition-transform duration-300 ease-in-out 
    ${isOpen ? 'translate-x-0' : 'translate-x-full'} md:translate-x-0
    rounded-none md:rounded-3xl
  `;

  return (
    <>
      <aside 
        className={sidebarClasses}
        style={{ background: `linear-gradient(to bottom right, ${gradientStart}, ${gradientEnd})` }}
      >
        <div className="flex items-center gap-3 pb-6 mb-4 border-b border-white/10">
           <div className="text-white p-2 bg-white/10 rounded-lg">
             <LogoIcon />
           </div>
           <h1 className="text-xl font-bold text-white tracking-tight">حسابداری</h1>
           <button onClick={onClose} className="absolute left-4 top-7 md:hidden text-slate-300 hover:text-white">
            <XIcon />
          </button>
        </div>
        <nav className="flex-grow">
          <ul>
            {navLinks.map((link) => (
              <NavItem
                key={link.view}
                link={link}
                isActive={currentView === link.view}
                onClick={() => onNavigate(link.view)}
              />
            ))}
          </ul>
        </nav>
      </aside>
      {/* Mobile overlay */}
      {isOpen && <div onClick={onClose} className="fixed inset-0 bg-black opacity-60 z-40 md:hidden"></div>}
    </>
  );
};

export default Sidebar;