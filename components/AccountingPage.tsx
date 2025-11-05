
import React from 'react';
import Accounting from './Accounting';
import { Transaction } from '../types';

interface AccountingPageProps {
  transactions: Transaction[];
  onAdd: (transactionData: Omit<Transaction, 'id'>) => void;
  onUpdate: (transactionData: Omit<Transaction, 'id'>, id: number) => void;
  onDelete: (id: number) => void;
  onDeleteMultiple: (ids: Set<number>) => void;
}

const AccountingPage: React.FC<AccountingPageProps> = (props) => {
    return (
        <div>
            <Accounting {...props} />
        </div>
    );
};

export default AccountingPage;
