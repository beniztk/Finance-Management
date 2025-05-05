import React from 'react';
import AppLayout from '../components/Layout/AppLayout';
import { useFinanceStore } from '../store/useFinanceStore';
import CategoryChart from '../components/Dashboard/charts/CategoryChart';
import MonthlyComparisonChart from '../components/Dashboard/charts/MonthlyComparisonChart';
import SavingsChart from '../components/Dashboard/charts/SavingsChart';
import SpouseComparisonChart from '../components/Dashboard/charts/SpouseComparisonChart';

const AnalyticsPage: React.FC = () => {
  const {
    getMonthlyData,
    getCategorySummary,
    getPersonSummary,
  } = useFinanceStore();
  
  const monthlyData = getMonthlyData();
  const categorySummary = getCategorySummary();
  const personSummary = getPersonSummary();
  
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1>ניתוח הוצאות</h1>
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Category Distribution */}
          <div className="card">
            <h2 className="mb-4">התפלגות הוצאות לפי קטגוריה</h2>
            <CategoryChart data={categorySummary} />
            
            {categorySummary.length > 0 && (
              <div className="mt-4 space-y-2">
                <h3 className="font-medium">פירוט הוצאות לפי קטגוריה:</h3>
                <div className="space-y-1">
                  {categorySummary.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }} 
                        />
                        <span>{item.category}</span>
                      </div>
                      <div className="flex gap-2">
                        <span>₪{item.amount.toLocaleString()}</span>
                        <span className="text-text-secondary">({item.percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Monthly Income vs Expenses */}
          <div className="card">
            <h2 className="mb-4">השוואת הכנסות והוצאות חודשיות</h2>
            <MonthlyComparisonChart 
              income={monthlyData.income} 
              expenses={monthlyData.expenses} 
            />
            
            <div className="mt-4 space-y-2">
              <h3 className="font-medium">סיכום חודשי:</h3>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>הכנסה חודשית:</span>
                  <span className="font-medium text-primary">₪{monthlyData.income.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>הוצאות חודשיות:</span>
                  <span className="font-medium text-error">₪{monthlyData.expenses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>יתרה:</span>
                  <span className="font-medium text-success">₪{monthlyData.balance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>אחוז הוצאה מהכנסה:</span>
                  <span className="font-medium">
                    {monthlyData.income > 0 
                      ? ((monthlyData.expenses / monthlyData.income) * 100).toFixed(1) 
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Spouse Comparison */}
          <div className="card">
            <h2 className="mb-4">השוואת הוצאות בין בני הזוג</h2>
            <SpouseComparisonChart data={personSummary} />
            
            <div className="mt-4 space-y-2">
              <h3 className="font-medium">פירוט הוצאות לפי בן זוג:</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-primary/10 p-3 rounded-md">
                  <h4 className="font-medium">בן זוג א׳</h4>
                  <p className="text-lg font-bold">₪{personSummary[0]?.amount.toLocaleString() || 0}</p>
                  <p className="text-sm text-text-secondary">
                    {personSummary[0]?.percentage.toFixed(1) || 0}% מסך ההוצאות
                  </p>
                </div>
                <div className="bg-accent/10 p-3 rounded-md">
                  <h4 className="font-medium">בן זוג ב׳</h4>
                  <p className="text-lg font-bold">₪{personSummary[1]?.amount.toLocaleString() || 0}</p>
                  <p className="text-sm text-text-secondary">
                    {personSummary[1]?.percentage.toFixed(1) || 0}% מסך ההוצאות
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Savings */}
          <div className="card">
            <h2 className="mb-4">מעקב חסכונות מצטברים</h2>
            <SavingsChart savings={monthlyData.savings} />
            
            <div className="mt-4 space-y-2">
              <h3 className="font-medium">פירוט חסכונות:</h3>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>סכום חודשי לחיסכון:</span>
                  <span className="font-medium">₪{monthlyData.savings.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>חיסכון שנתי משוער:</span>
                  <span className="font-medium">₪{(monthlyData.savings * 12).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>אחוז חיסכון מהכנסה:</span>
                  <span className="font-medium">
                    {monthlyData.income > 0 
                      ? ((monthlyData.savings / monthlyData.income) * 100).toFixed(1) 
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AnalyticsPage;