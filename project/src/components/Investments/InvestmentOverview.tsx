import React from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { TrendingUp, Wallet, PiggyBank, ArrowUpCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const InvestmentOverview: React.FC = () => {
  const { getInvestmentSummary, investments } = useFinanceStore();
  const summary = getInvestmentSummary();
  
  // Generate mock historical data for the chart
  const generateHistoricalData = () => {
    const data = [];
    const months = 12;
    let value = summary.totalInvested;
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      // Add some random variation
      const randomFactor = 0.98 + Math.random() * 0.04;
      value = value * randomFactor + summary.monthlyContributions;
      
      data.push({
        date: date.toLocaleDateString('he-IL', { month: 'short', year: 'numeric' }),
        value: Math.round(value),
      });
    }
    
    return data;
  };
  
  const chartData = generateHistoricalData();
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-text-secondary text-sm">סך השקעות</p>
              <p className="text-2xl font-bold mt-1">
                ₪{summary.totalValue.toLocaleString()}
              </p>
            </div>
            <div className="bg-primary/10 p-3 rounded-full">
              <Wallet size={24} className="text-primary" />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-text-secondary text-sm">תשואה כוללת</p>
              <p className="text-2xl font-bold mt-1">
                ₪{summary.totalReturn.toLocaleString()}
              </p>
              <p className="text-sm text-success">
                {summary.returnPercentage.toFixed(2)}%
              </p>
            </div>
            <div className="bg-success/10 p-3 rounded-full">
              <TrendingUp size={24} className="text-success" />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-text-secondary text-sm">השקעה ראשונית</p>
              <p className="text-2xl font-bold mt-1">
                ₪{summary.totalInvested.toLocaleString()}
              </p>
            </div>
            <div className="bg-warning/10 p-3 rounded-full">
              <PiggyBank size={24} className="text-warning" />
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-text-secondary text-sm">הפקדות חודשיות</p>
              <p className="text-2xl font-bold mt-1">
                ₪{summary.monthlyContributions.toLocaleString()}
              </p>
            </div>
            <div className="bg-secondary/10 p-3 rounded-full">
              <ArrowUpCircle size={24} className="text-secondary" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="card">
        <h2 className="mb-4">מעקב שווי השקעות</h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip
                formatter={(value) => `₪${value.toLocaleString()}`}
                labelFormatter={(label) => `תאריך: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default InvestmentOverview;