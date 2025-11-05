
import React from 'react';
import type { StatCardData } from '../types';

const StatCard: React.FC<StatCardData> = ({ title, value, change, icon: Icon, iconBgColor }) => {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-md flex items-center justify-between">
      <div>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
        <p className="text-gray-500">{title}</p>
        <p className="text-xs text-gray-400 mt-1">{change}</p>
      </div>
      <div className={`p-4 rounded-full ${iconBgColor}`}>
        <Icon className="h-7 w-7" />
      </div>
    </div>
  );
};

export default StatCard;
