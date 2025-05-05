import React from 'react';
import AppLayout from '../Layout/AppLayout';
import BudgetOverview from './BudgetOverview';
import BudgetCategoryList from './BudgetCategoryList';

const BudgetPage: React.FC = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1>ניהול תקציב</h1>
        
        <BudgetOverview />
        <BudgetCategoryList />
      </div>
    </AppLayout>
  );
};

export default BudgetPage;