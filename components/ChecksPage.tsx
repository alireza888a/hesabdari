
import React from 'react';
import Checks from './Checks';
import { Check, Customer } from '../types';

interface ChecksPageProps {
  checks: Check[];
  customers: Customer[];
  onAdd: (checkData: Omit<Check, 'id'>) => void;
  onUpdate: (checkData: Omit<Check, 'id'>, id: number) => void;
  onDelete: (id: number) => void;
  onDeleteMultiple: (ids: Set<number>) => void;
}

const ChecksPage: React.FC<ChecksPageProps> = (props) => {
    return (
        <div>
            <Checks {...props} />
        </div>
    );
};

export default ChecksPage;
