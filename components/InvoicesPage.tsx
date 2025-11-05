
import React from 'react';
import Invoices from './Invoices';
import { Invoice, Customer, Product } from '../types';

interface InvoicesPageProps {
  invoices: Invoice[];
  customers: Customer[];
  products: Product[];
  onAdd: (invoiceData: Omit<Invoice, 'id' | 'number'>) => void;
  onUpdate: (invoiceData: Omit<Invoice, 'id' | 'number'>, id: number) => void;
  onDelete: (id: number) => void;
  onView: (invoice: Invoice) => void;
}

const InvoicesPage: React.FC<InvoicesPageProps> = (props) => {
    return (
        <div>
            <Invoices {...props} />
        </div>
    );
};

export default InvoicesPage;
