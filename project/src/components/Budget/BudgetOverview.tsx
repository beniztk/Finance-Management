import React from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { PieChart, CircleDollarSign, AlertTriangle } from 'lucide-react';

const BudgetOverview: React.FC = () => {
  const { getMonthlyData, getCategorySummary, getBudgetAlerts } = useFinanceStore();
  const monthlyData = getMonthlyData();
  const categorySummary = getCategorySummary();
  const budgetAlerts = getBudgetAlerts();
  
  const totalBudget = categorySummary.reduce((sum, cat) => sum + (cat.budget || 0), 0);
  const totalSpent = categorySummary.reduce((sum, cat) => sum + cat.amount, 0);
  const remainingBudget = totalBudget - totalSpent;
  const spentPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card">
        <h2 className="mb-4 flex items-center gap-2">
          <CircleDollarSign size={24} className="text-primary" />
          <span>סיכום תקציב חודשי</span>
        </h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-primary/10 p-4 rounded-lg">
              <p className="text-sm text-text-secondary">תקציב כולל</p>
              <p className="text-xl font-bold">₪{totalBudget.toLocaleString()}</p>
            </div>
            
            <div className="bg-warning/10 p-4 rounded-lg">
              <p className="text-sm text-text-secondary">הוצאות</p>
              <p className="text-xl font-bold">₪{totalSpent.toLocaleString()}</p>
            </div>
            
            <div className={`p-4 rounded-lg ${remainingBudget >= 0 ? 'bg-success/10' : 'bg-error/10'}`}>
              <p className="text-sm text-text-secondary">נותר</p>
              <p className="text-xl font-bold">₪{Math.abs(remainingBudget).toLocaleString()}</p>
              <p className="text-sm">{remainingBudget >= 0 ? 'בתקציב' : 'חריגה'}</p>
            </div>
          </div>
          
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                spentPercentage > 100
                  ? 'bg-error'
                  : spentPercentage > 80
                  ? 'bg-warning'
                  : 'bg-success'
              }`}
              style={{ width: `${Math.min(spentPercentage, 100)}%` }}
            />
          </div>
          
          <p className="text-sm text-text-secondary text-center">
            {spentPercentage.toFixed(1)}% מהתקציב נוצל
          </p>
        </div>
      </div>
      
      <div className="card">
        <h2 className="mb-4 flex items-center gap-2">
          <AlertTriangle size={24} className="text-warning" />
          <span>התראות תקציב</span>
        </h2>
        
        {!budgetAlerts || budgetAlerts.length === 0 ? (
          <p className="text-text-secondary text-center py-4">
            אין התראות תקציב פעילות
          </p>
        ) : (
          <div className="space-y-3">
            {budgetAlerts.map((alert, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg ${
                  (alert.percentage || 0) > 100
                    ? 'bg-error/10 text-error'
                    : 'bg-warning/10 text-warning'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{alert.category}</span>
                  <span>{(alert.percentage || 0).toFixed(1)}%</span>
                </div>
                <p className="text-sm mt-1">
                  ₪{(alert.spent || 0).toLocaleString()} מתוך ₪{(alert.budget || 0).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetOverview;