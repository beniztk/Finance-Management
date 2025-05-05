import React from 'react';
import { 
  Wallet, 
  ArrowDownCircle, 
  Coins, 
  PiggyBank,
  ShoppingBag,
  TrendingUp,
  ArrowUpCircle,
  AlertTriangle,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import MetricCard from './MetricCard';
import { useFinanceStore } from '../../store/useFinanceStore';
import CategoryChart from './charts/CategoryChart';
import MonthlyComparisonChart from './charts/MonthlyComparisonChart';
import SavingsChart from './charts/SavingsChart';
import SpouseComparisonChart from './charts/SpouseComparisonChart';
import FinancialAdvice from './FinancialAdvice';

const Dashboard: React.FC = () => {
  const { 
    getMonthlyData, 
    getCategorySummary, 
    getPersonSummary,
    categories,
    getBudgetAlerts
  } = useFinanceStore();
  
  const monthlyData = getMonthlyData();
  const categorySummary = getCategorySummary();
  const personSummary = getPersonSummary() || [];
  const budgetAlerts = getBudgetAlerts();
  
  const topCategoryObj = categories.find(
    (c) => c.name === monthlyData.topCategory
  );
  
  // Calculate month-over-month changes (mock data for now)
  const trends = {
    income: { value: 5.2, isPositive: true },
    expenses: { value: -2.8, isPositive: false },
    balance: { value: 12.5, isPositive: true },
    savings: { value: 8.3, isPositive: true }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1>לוח מחוונים</h1>
        
        {budgetAlerts.length > 0 && (
          <div className="flex items-center gap-2 text-warning bg-warning/10 px-3 py-1.5 rounded-full">
            <AlertTriangle size={18} />
            <span className="text-sm font-medium">
              {budgetAlerts.length} התראות תקציב פעילות
            </span>
          </div>
        )}
      </div>
      
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">הכנסה חודשית</p>
              <p className="text-2xl font-bold">₪{monthlyData.income.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-1 text-sm">
                <span className={trends.income.isPositive ? 'text-success' : 'text-error'}>
                  {trends.income.isPositive ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                  {Math.abs(trends.income.value)}%
                </span>
                <span className="text-gray-500">מהחודש הקודם</span>
              </div>
            </div>
            <div className="bg-primary/10 p-2 rounded-lg">
              <Wallet className="text-primary" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">הוצאות חודשיות</p>
              <p className="text-2xl font-bold">₪{monthlyData.expenses.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-1 text-sm">
                <span className={trends.expenses.isPositive ? 'text-error' : 'text-success'}>
                  {trends.expenses.isPositive ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                  {Math.abs(trends.expenses.value)}%
                </span>
                <span className="text-gray-500">מהחודש הקודם</span>
              </div>
            </div>
            <div className="bg-error/10 p-2 rounded-lg">
              <ArrowDownCircle className="text-error" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">יתרה</p>
              <p className="text-2xl font-bold">₪{monthlyData.balance.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-1 text-sm">
                <span className={trends.balance.isPositive ? 'text-success' : 'text-error'}>
                  {trends.balance.isPositive ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                  {Math.abs(trends.balance.value)}%
                </span>
                <span className="text-gray-500">מהחודש הקודם</span>
              </div>
            </div>
            <div className="bg-success/10 p-2 rounded-lg">
              <Coins className="text-success" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">חסכונות</p>
              <p className="text-2xl font-bold">₪{monthlyData.savings.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-1 text-sm">
                <span className={trends.savings.isPositive ? 'text-success' : 'text-error'}>
                  {trends.savings.isPositive ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                  {Math.abs(trends.savings.value)}%
                </span>
                <span className="text-gray-500">מהחודש הקודם</span>
              </div>
            </div>
            <div className="bg-secondary/10 p-2 rounded-lg">
              <PiggyBank className="text-secondary" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="flex items-center gap-2 text-lg font-medium">
              <ShoppingBag size={20} className="text-primary" />
              <span>התפלגות הוצאות לפי קטגוריה</span>
            </h2>
          </div>
          <CategoryChart data={categorySummary} />
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="flex items-center gap-2 text-lg font-medium">
              <TrendingUp size={20} className="text-primary" />
              <span>השוואת הכנסות והוצאות</span>
            </h2>
          </div>
          <MonthlyComparisonChart 
            income={monthlyData.income} 
            expenses={monthlyData.expenses} 
          />
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="flex items-center gap-2 text-lg font-medium">
              <ArrowUpCircle size={20} className="text-primary" />
              <span>השוואת הוצאות בין בני הזוג</span>
            </h2>
          </div>
          <SpouseComparisonChart data={personSummary} />
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="flex items-center gap-2 text-lg font-medium">
              <PiggyBank size={20} className="text-primary" />
              <span>מעקב חסכונות</span>
            </h2>
          </div>
          <SavingsChart savings={monthlyData.savings} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;