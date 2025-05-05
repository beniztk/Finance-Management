import React from 'react';
import AppLayout from '../Layout/AppLayout';
import InvestmentOverview from './InvestmentOverview';
import InvestmentList from './InvestmentList';
import InvestmentForm from './InvestmentForm';
import { Plus, X } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { Investment } from '../../types';

const InvestmentPage: React.FC = () => {
  const [isAddingInvestment, setIsAddingInvestment] = React.useState(false);
  const [editingInvestment, setEditingInvestment] = React.useState<Investment | null>(null);
  const { addInvestment, updateInvestment } = useFinanceStore();
  
  const handleAddInvestment = (investment: Omit<Investment, 'id'>) => {
    addInvestment(investment);
    setIsAddingInvestment(false);
  };
  
  const handleUpdateInvestment = (investment: Omit<Investment, 'id'>) => {
    if (editingInvestment) {
      updateInvestment(editingInvestment.id, investment);
      setEditingInvestment(null);
    }
  };
  
  const handleCancelEdit = () => {
    setIsAddingInvestment(false);
    setEditingInvestment(null);
  };
  
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1>השקעות</h1>
          
          {!isAddingInvestment && !editingInvestment && (
            <button
              onClick={() => setIsAddingInvestment(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus size={20} />
              <span>הוסף השקעה</span>
            </button>
          )}
          
          {(isAddingInvestment || editingInvestment) && (
            <button
              onClick={handleCancelEdit}
              className="btn btn-outline flex items-center gap-2"
            >
              <X size={20} />
              <span>ביטול</span>
            </button>
          )}
        </div>
        
        {/* Form appears at the top when adding/editing */}
        {(isAddingInvestment || editingInvestment) && (
          <div className="card">
            <h2 className="mb-4">
              {isAddingInvestment ? 'הוספת השקעה חדשה' : 'עריכת השקעה'}
            </h2>
            <InvestmentForm
              initialInvestment={editingInvestment || undefined}
              onSubmit={isAddingInvestment ? handleAddInvestment : handleUpdateInvestment}
              onCancel={handleCancelEdit}
            />
          </div>
        )}
        
        {/* Overview charts */}
        {!isAddingInvestment && !editingInvestment && <InvestmentOverview />}
        
        {/* Investment list */}
        {!isAddingInvestment && !editingInvestment && (
          <InvestmentList onEdit={setEditingInvestment} />
        )}
      </div>
    </AppLayout>
  );
};

export default InvestmentPage;