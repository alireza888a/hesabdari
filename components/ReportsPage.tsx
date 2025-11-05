
import React from 'react';
import Reports from './Reports';
import { Transaction, Invoice, Customer } from '../types';

interface ReportsPageProps {
    transactions: Transaction[];
    invoices: Invoice[];
    customers: Customer[];
}

const ReportsPage: React.FC<ReportsPageProps> = (props) => {
    return (
        <div>
            <Reports {...props} />
        </div>
    );
};

export default ReportsPage;