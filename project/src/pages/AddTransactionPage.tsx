import React from 'react';
import AppLayout from '../components/Layout/AppLayout';
import TransactionForm from '../components/Transactions/TransactionForm';
import ImportTransactions from '../components/Transactions/ImportTransactions';
import { useFinanceStore } from '../store/useFinanceStore';
import { FilePlus, FileUp } from 'lucide-react';

const AddTransactionPage: React.FC = () => {
  const { addTransaction } = useFinanceStore();
  const [activeTab, setActiveTab] = React.useState<'manual' | 'import'>('manual');
  
  const handleAddTransaction = (transaction: any) => {
    addTransaction(transaction);
    alert('העסקה נוספה בהצלחה!');
    
    // Reset form after submission (by forcing a re-render)
    setActiveTab('import');
    setTimeout(() => setActiveTab('manual'), 0);
  };
  
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1>הוספת הוצאות</h1>
        
        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={`px-4 py-2 font-medium border-b-2 -mb-px flex items-center gap-2 ${
              activeTab === 'manual'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
            onClick={() => setActiveTab('manual')}
          >
            <FilePlus size={20} />
            <span>הוספה ידנית</span>
          </button>
          
          <button
            className={`px-4 py-2 font-medium border-b-2 -mb-px flex items-center gap-2 ${
              activeTab === 'import'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
            onClick={() => setActiveTab('import')}
          >
            <FileUp size={20} />
            <span>ייבוא מקובץ</span>
          </button>
        </div>
        
        {/* Tab content */}
        <div className="card">
          {activeTab === 'manual' ? (
            <>
              <h2 className="mb-4">הוספת הוצאה חדשה</h2>
              <TransactionForm onSubmit={handleAddTransaction} onCancel={() => {}} />
            </>
          ) : (
            <ImportTransactions />
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default AddTransactionPage;