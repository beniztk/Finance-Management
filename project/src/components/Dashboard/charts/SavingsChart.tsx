import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SavingsChartProps {
  savings: number;
}

const SavingsChart: React.FC<SavingsChartProps> = ({ savings }) => {
  // Generate mock data for 12 months of savings
  const generateMockData = () => {
    const currentDate = new Date();
    const data = [];
    
    // Generate data for past 6 months and project 6 months ahead
    for (let i = -5; i <= 6; i++) {
      const date = new Date();
      date.setMonth(currentDate.getMonth() + i);
      
      const month = date.toLocaleString('he-IL', { month: 'short' });
      
      // Accumulate savings with some variation for past months
      // For future months, project consistent growth
      const factor = i < 0 ? (1 + Math.random() * 0.1) : 1.05;
      const monthlySavings = i < 0 ? savings * factor : savings;
      
      data.push({
        month,
        savings: Math.round(monthlySavings * (i + 6)),
        projected: i >= 0,
      });
    }
    
    return data;
  };
  
  const data = generateMockData();

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip 
          formatter={(value) => `₪${value}`}
          itemStyle={{ textAlign: 'right', direction: 'rtl' }}
          contentStyle={{ textAlign: 'right', direction: 'rtl' }}
          labelFormatter={(label) => `חודש: ${label}`}
        />
        <Line 
          type="monotone" 
          dataKey="savings" 
          name="חסכונות מצטברים" 
          stroke="#10B981" 
          strokeWidth={2}
          activeDot={{ r: 8 }}
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default SavingsChart;