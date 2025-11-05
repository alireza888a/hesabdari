
import React from 'react';
import Customers from './Customers';
import { Customer } from '../types';

interface CustomersPageProps {
  customers: Customer[];
  onAdd: (customerData: Omit<Customer, 'id' | 'code'>) => void;
  onUpdate: (customerData: Omit<Customer, 'id' | 'code'>, id: number) => void;
  onDelete: (id: number) => void;
  onDeleteMultiple: (ids: Set<number>) => void;
}

const CustomersPage: React.FC<CustomersPageProps> = (props) => {
    return (
        <div>
            <Customers {...props} />
        </div>
    );
};

export default CustomersPage;
