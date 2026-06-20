import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface QueryTrendChartProps {
  data?: { date: string; queries: number }[];
}

const defaultData = [
  { date: 'Mon', queries: 4 },
  { date: 'Tue', queries: 8 },
  { date: 'Wed', queries: 12 },
  { date: 'Thu', queries: 7 },
  { date: 'Fri', queries: 15 },
  { date: 'Sat', queries: 9 },
  { date: 'Sun', queries: 14 },
];

export const QueryTrendChart: React.FC<QueryTrendChartProps> = ({ data = defaultData }) => {
  return (
    <div className="h-72 w-full text-xs">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorQueries" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0F766E" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#0F766E" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" className="dark:stroke-slate-800" />
          <XAxis dataKey="date" stroke="#94A3B8" />
          <YAxis stroke="#94A3B8" />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.9)', 
              border: '1px solid #E2E8F0', 
              borderRadius: '8px' 
            }} 
            labelClassName="font-bold text-slate-800"
          />
          <Area 
            type="monotone" 
            dataKey="queries" 
            stroke="#0F766E" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorQueries)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
export default QueryTrendChart;
