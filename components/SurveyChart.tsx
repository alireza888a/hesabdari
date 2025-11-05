import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ChartData } from '../types';

const data: ChartData[] = [
  { name: 'فر', income: 4000, expense: 2400 },
  { name: 'ارد', income: 3000, expense: 1398 },
  { name: 'خرد', income: 9800, expense: 2000 },
  { name: 'تیر', income: 3908, expense: 2780 },
  { name: 'مرد', income: 4800, expense: 1890 },
  { name: 'شهر', income: 3800, expense: 2390 },
  { name: 'مهر', income: 10400, expense: 4300 },
  { name: 'آبا', income: 7200, expense: 3490 },
  { name: 'آذر', income: 4300, expense: 2100 },
  { name: 'دی', income: 8100, expense: 3200 },
  { name: 'بهم', income: 5500, expense: 2500 },
  { name: 'اسف', income: 6800, expense: 3100 },
];

const SurveyChart: React.FC = () => {
  const [colors, setColors] = useState({ start: '#8B5CF6', end: '#EC4899' });

  useEffect(() => {
    const style = getComputedStyle(document.documentElement);
    const startColor = style.getPropertyValue('--color-primary-start').trim();
    const endColor = style.getPropertyValue('--color-primary-end').trim();
    if(startColor && endColor) {
        setColors({ start: startColor, end: endColor });
    }
    
    const observer = new MutationObserver(() => {
        const newStartColor = style.getPropertyValue('--color-primary-start').trim();
        const newEndColor = style.getPropertyValue('--color-primary-end').trim();
        if(newStartColor && newEndColor) {
             setColors({ start: newStartColor, end: newEndColor });
        }
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });

    return () => observer.disconnect();
  }, []);


  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">بررسی مالی</h2>
        <div className="flex items-center space-x-4">
            <div className="flex items-center">
                <span className="h-3 w-3 rounded-full ml-2" style={{ backgroundColor: colors.start }}></span>
                <span className="text-sm text-gray-500">درآمد</span>
            </div>
            <div className="flex items-center">
                <span className="h-3 w-3 rounded-full ml-2 bg-yellow-400"></span>
                <span className="text-sm text-gray-500">هزینه</span>
            </div>
        </div>
      </div>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart
            data={data}
            margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
            barSize={10}
            layout="horizontal"
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#a0aec0' }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: '#a0aec0' }} reversed={true} orientation="right" />
            <Tooltip
              contentStyle={{
                background: 'white',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                border: 'none',
                fontFamily: 'Vazirmatn, sans-serif'
              }}
              cursor={{ fill: 'rgba(238, 242, 255, 0.6)' }}
            />
            <Legend wrapperStyle={{ display: 'none' }} />
            <Bar dataKey="income" fill={colors.start} radius={[10, 10, 0, 0]} />
            <Bar dataKey="expense" fill="#FBBF24" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};

export default SurveyChart;