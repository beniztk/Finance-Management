import React from 'react';
import AppLayout from '../components/Layout/AppLayout';
import IncomeSettings from '../components/Settings/IncomeSettings';

const IncomeSettingsPage: React.FC = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1>הגדרות הכנסה</h1>
        <IncomeSettings />
      </div>
    </AppLayout>
  );
};

export default IncomeSettingsPage;