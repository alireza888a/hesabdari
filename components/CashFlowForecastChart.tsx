
import React from 'react';
import { formatCurrency } from '../utils';

interface ChartProps {
    data: {
        month: string;
        income: number;
        expense: number;
        balance: number;
    }[];
}

const CashFlowForecastChart: React.FC<ChartProps> = ({ data }) => {
    if (!data || data.length === 0) {
        return <div className="h-80 flex items-center justify-center text-slate-400">داده‌ای برای نمایش وجود ندارد.</div>;
    }

    const allValues = data.flatMap(d => [d.income, d.expense, d.balance]);
    const minY = Math.min(0, ...allValues);
    const maxY = Math.max(1, ...allValues) * 1.1;
    const range = maxY - minY;

    const generatePath = (values: number[]) => {
        if (values.length === 0) return '';
        if (values.length === 1) {
            const y = 180 - ((values[0] - minY) / range) * 160;
            return `M 30,${y.toFixed(2)} L 390,${y.toFixed(2)}`;
        }
        const points = values.map((value, index) => {
            const x = 30 + (index * (360 / (values.length - 1)));
            const y = 180 - (((value - minY) / range) * 160);
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
    const balancePath = generatePath(data.map(d => d.balance));
    const zeroLineY = 180 - ((-minY / range) * 160);


    return (
        <div className="w-full h-80 flex flex-col">
            <svg width="100%" height="100%" viewBox="0 0 400 200" className="max-h-full">
                <g className="text-slate-400 text-xs" fill="currentColor">
                    {[0, 0.25, 0.5, 0.75, 1].map(f => {
                        const y = 180 - (f * 160);
                        const value = minY + f * range;
                        return (
                            <g key={f}>
                                <line x1="30" y1={y} x2="390" y2={y} stroke="currentColor" strokeWidth="0.5" strokeDasharray="2,3" opacity="0.5" />
                                <text x="25" y={y + 4} textAnchor="end" className="text-[10px] fill-current">{value >= 1_000_000 ? `${(value / 1_000_000).toFixed(1)} M` : value >= 1_000 ? `${(value/1_000).toFixed(0)} K` : value.toFixed(0)}</text>
                            </g>
                        )
                    })}
                    {minY < 0 && <line x1="30" y1={zeroLineY} x2="390" y2={zeroLineY} stroke="currentColor" strokeWidth="0.5" />}
                </g>
                <g className="text-slate-500 text-xs" fill="currentColor">
                    {data.map((d, index) => {
                        const x = 30 + (index * (360 / (data.length - 1)));
                        return <text key={index} x={x} y="195" textAnchor="middle">{d.month}</text>
                    })}
                </g>
                <path d={incomePath} fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" />
                <path d={expensePath} fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
                <path d={balancePath} fill="none" stroke="#8b5cf6" strokeWidth="3" strokeLinecap="round" />
            </svg>
             <div className="flex justify-center items-center gap-4 text-xs mt-2">
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-green-500"></span><span>درآمد</span></div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-500"></span><span>هزینه</span></div>
                <div className="flex items-center gap-1.5"><span className="w-3 h-1.5 rounded-sm bg-purple-600"></span><span className="font-semibold">مانده حساب</span></div>
            </div>
        </div>
    );
};

export default CashFlowForecastChart;
