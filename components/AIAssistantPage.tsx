
import React from 'react';
import AIAssistant from './AIAssistant';
import { AppData, Customer, Invoice, InvoiceStatus, Check, CheckStatus, Transaction, AIAssistantSettings, Note } from '../types';

interface AIAssistantPageProps {
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
}

const AIAssistantPage: React.FC<AIAssistantPageProps> = (props) => {
    return (
        <div>
            <AIAssistant {...props} />
        </div>
    );
};

export default AIAssistantPage;
