import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ExecutionChartProps {
  data?: { name: string; time: number }[];
}

const defaultData = [
  { name: 'Q1 Sales', time: 38 },
  { name: 'Employees', time: 18 },
  { name: 'Customers', time: 82 },
  { name: 'Products', time: 45 },
  { name: 'Orders', time: 64 },
];

export const ExecutionChart: React.FC<ExecutionChartProps> = ({ data = defaultData }) => {
  return (
    <div className="h-72 w-full text-xs">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
          <XAxis dataKey="name" stroke="#94A3B8" />
          <YAxis stroke="#94A3B8" label={{ value: 'ms', angle: -90, position: 'insideLeft', fill: '#94A3B8' }} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.9)', 
              border: '1px solid #E2E8F0', 
              borderRadius: '8px' 
            }}
          />
          <Bar dataKey="time" fill="#2563EB" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
export default ExecutionChart;
