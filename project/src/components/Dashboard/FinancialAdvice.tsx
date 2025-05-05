import React from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { AlertCircle, TrendingUp, PiggyBank, Target, ArrowDownCircle } from 'lucide-react';

const FinancialAdvice: React.FC = () => {
  const { getMonthlyData, getCategorySummary, getBudgetAlerts } = useFinanceStore();
  const monthlyData = getMonthlyData();
  const categorySummary = getCategorySummary();
  const budgetAlerts = getBudgetAlerts();
  
  // Calculate financial metrics
  const incomeToExpenseRatio = monthlyData.expenses / monthlyData.income;
  const savingsRate = (monthlyData.savings / monthlyData.income) * 100;
  const hasHighExpenseCategories = categorySummary.some(cat => 
    cat.budget && cat.amount > cat.budget * 0.9
  );
  
  // Generate personalized tips
  const getTips = () => {
    const tips = [];
    
    // Savings tips
    if (savingsRate < 20) {
      tips.push({
        icon: <PiggyBank className="text-primary" />,
        title: 'הגדל את החיסכון',
        description: 'נסה להגדיל את אחוז החיסכון החודשי ל-20% מההכנסה',
      });
    }
    
    // Expense ratio tips
    if (incomeToExpenseRatio > 0.7) {
      tips.push({
        icon: <ArrowDownCircle className="text-warning" />,
        title: 'צמצם הוצאות',
        description: 'ההוצאות שלך גבוהות ביחס להכנסה. נסה לזהות תחומים לחיסכון',
      });
    }
    
    // Budget management tips
    if (hasHighExpenseCategories) {
      tips.push({
        icon: <Target className="text-error" />,
        title: 'ניהול תקציב',
        description: 'יש קטגוריות שחורגות מהתקציב. בדוק את ההוצאות ועדכן את התקציב בהתאם',
      });
    }
    
    // Investment tips
    if (monthlyData.balance > monthlyData.income * 0.3) {
      tips.push({
        icon: <TrendingUp className="text-success" />,
        title: 'הזדמנות להשקעה',
        description: 'יש לך עודף תקציב משמעותי. שקול להגדיל את ההשקעות שלך',
      });
    }
    
    return tips;
  };
  
  const tips = getTips();
  
  if (tips.length === 0) {
    return null;
  }
  
  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle size={24} className="text-primary" />
        <h2>טיפים והמלצות פיננסיות</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tips.map((tip, index) => (
          <div
            key={index}
            className="p-4 rounded-lg border border-border hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-primary/5">
                {tip.icon}
              </div>
              
              <div>
                <h3 className="font-medium">{tip.title}</h3>
                <p className="text-sm text-text-secondary mt-1">
                  {tip.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {budgetAlerts.length > 0 && (
        <div className="mt-6 p-4 rounded-lg bg-warning/5 border border-warning/20">
          <h3 className="font-medium text-warning mb-2">התראות תקציב</h3>
          <ul className="space-y-2">
            {budgetAlerts.map((alert, index) => (
              <li key={index} className="text-sm">
                {alert.category}: {alert.percentage.toFixed(1)}% מהתקציב נוצל
                (₪{alert.spent.toLocaleString()} מתוך ₪{alert.budget.toLocaleString()})
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FinancialAdvice;