import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { CategorySummary } from '../../../types';

interface CategoryChartProps {
  data: CategorySummary[];
}

const CategoryChart: React.FC<CategoryChartProps> = ({ data }) => {
  // If there's no data, show a placeholder
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-text-secondary">אין נתונים להצגה</p>
      </div>
    );
  }

  // Format data for the chart
  const chartData = data.map(item => ({
    name: item.category,
    value: Math.round(item.amount), // Round amounts
    color: item.color,
    percentage: item.percentage
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 shadow-lg rounded-lg border">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-text-secondary">
            ₪{data.value.toLocaleString()}
          </p>
          <p className="text-sm text-primary">
            {data.percentage.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    name
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return percent > 0.05 ? (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        className="text-sm font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.color}
              stroke="white"
              strokeWidth={2}
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          layout="vertical" 
          verticalAlign="middle" 
          align="right"
          formatter={(value, entry: any) => (
            <span className="text-sm">
              {value} (₪{Math.round(entry.payload.value).toLocaleString()})
            </span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CategoryChart;