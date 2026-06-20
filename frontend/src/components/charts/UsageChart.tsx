import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface UsageChartProps {
  data?: { name: string; value: number }[];
}

const defaultData = [
  { name: 'SELECT Queries', value: 45 },
  { name: 'JOINs', value: 25 },
  { name: 'Aggregations', value: 20 },
  { name: 'Filters/WHERE', value: 10 },
];

const COLORS = ['#0F766E', '#2563EB', '#7C3AED', '#D97706'];

export const UsageChart: React.FC<UsageChartProps> = ({ data = defaultData }) => {
  return (
    <div className="h-72 w-full text-xs">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.9)', 
              border: '1px solid #E2E8F0', 
              borderRadius: '8px' 
            }}
          />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
export default UsageChart;
