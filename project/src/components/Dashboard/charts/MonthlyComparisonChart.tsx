import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MonthlyComparisonChartProps {
  income: number;
  expenses: number;
}

const MonthlyComparisonChart: React.FC<MonthlyComparisonChartProps> = ({ income, expenses }) => {
  const data = [
    {
      name: 'הכנסה',
      amount: income,
      fill: '#3B82F6',
    },
    {
      name: 'הוצאות',
      amount: expenses,
      fill: '#EF4444',
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip 
          formatter={(value) => `₪${value}`}
          itemStyle={{ textAlign: 'right', direction: 'rtl' }}
          contentStyle={{ textAlign: 'right', direction: 'rtl' }}
        />
        <Bar dataKey="amount" name="סכום" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default MonthlyComparisonChart;