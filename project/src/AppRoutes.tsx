import React from 'react';
import { useAuth } from './components/Auth/AuthProvider';
import LoginPage from './components/Auth/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import AddTransactionPage from './pages/AddTransactionPage';
import CategoriesPage from './pages/CategoriesPage';
import AnalyticsPage from './pages/AnalyticsPage';
import IncomeSettingsPage from './pages/IncomeSettingsPage';
import BudgetPage from './components/Budget/BudgetPage';
import InvestmentPage from './components/Investments/InvestmentPage';
import LoanPage from './components/Loans/LoanPage';

const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth();
  const [activePage, setActivePage] = React.useState<string>('dashboard');

  React.useEffect(() => {
    const handleNavigation = (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      
      const navItem = target.closest('button');
      if (!navItem) return;
      
      const text = navItem.textContent?.trim();
      const ariaLabel = navItem.getAttribute('aria-label');
      const navText = text || ariaLabel;
      
      if (!navText) return;
      
      if (navText === 'דף הבית') {
        setActivePage('dashboard');
      } else if (navText === 'הוצאות') {
        setActivePage('transactions');
      } else if (navText === 'הוספת הוצאה') {
        setActivePage('add-transaction');
      } else if (navText === 'ניתוח הוצאות') {
        setActivePage('analytics');
      } else if (navText === 'קטגוריות') {
        setActivePage('categories');
      } else if (navText === 'תקציב') {
        setActivePage('budget');
      } else if (navText === 'השקעות') {
        setActivePage('investments');
      } else if (navText === 'הלוואות') {
        setActivePage('loans');
      } else if (navText === 'הגדרות') {
        setActivePage('income');
      }
    };
    
    document.addEventListener('click', handleNavigation);
    return () => document.removeEventListener('click', handleNavigation);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'transactions':
        return <TransactionsPage />;
      case 'add-transaction':
        return <AddTransactionPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'categories':
        return <CategoriesPage />;
      case 'budget':
        return <BudgetPage />;
      case 'investments':
        return <InvestmentPage />;
      case 'loans':
        return <LoanPage />;
      case 'income':
        return <IncomeSettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return renderPage();
};

export default AppRoutes;