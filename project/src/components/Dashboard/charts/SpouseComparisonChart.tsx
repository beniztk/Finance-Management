import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PersonSummary } from '../../../types';

interface SpouseComparisonChartProps {
  data: PersonSummary[];
}

const SpouseComparisonChart: React.FC<SpouseComparisonChartProps> = ({ data }) => {
  // Ensure data is an array and has items before mapping
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-500">
        אין נתונים להצגה
      </div>
    );
  }

  const formattedData = data.map((item) => ({
    name: item.person === 'yuval' ? 'יובל' : 'בני',
    amount: item.amount,
    percentage: item.percentage,
    fill: item.person === 'yuval' ? '#EC4899' : '#3B82F6',
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={formattedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip 
          formatter={(value, name) => name === 'percentage' ? `${value.toFixed(1)}%` : `₪${value}`}
          itemStyle={{ textAlign: 'right', direction: 'rtl' }}
          contentStyle={{ textAlign: 'right', direction: 'rtl' }}
        />
        <Bar dataKey="amount" name="סכום הוצאות" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default SpouseComparisonChart;