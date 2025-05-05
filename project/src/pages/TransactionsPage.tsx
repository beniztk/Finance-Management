import React, { useState } from 'react';
import AppLayout from '../components/Layout/AppLayout';
import TransactionList from '../components/Transactions/TransactionList';
import TransactionForm from '../components/Transactions/TransactionForm';
import { useFinanceStore } from '../store/useFinanceStore';
import { Transaction } from '../types';
import { Plus, X } from 'lucide-react';

const TransactionsPage: React.FC = () => {
  const { addTransaction, updateTransaction } = useFinanceStore();
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  
  const handleAddTransaction = (transaction: Omit<Transaction, 'id'>) => {
    addTransaction(transaction);
    setIsAddingTransaction(false);
  };
  
  const handleUpdateTransaction = (transaction: Omit<Transaction, 'id'>) => {
    if (editingTransaction) {
      updateTransaction(editingTransaction.id, transaction);
      setEditingTransaction(null);
    }
  };
  
  const handleCancelEdit = () => {
    setIsAddingTransaction(false);
    setEditingTransaction(null);
  };
  
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1>הוצאות</h1>
          
          {!isAddingTransaction && !editingTransaction && (
            <button
              onClick={() => setIsAddingTransaction(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus size={20} />
              <span>הוסף הוצאה</span>
            </button>
          )}
          
          {(isAddingTransaction || editingTransaction) && (
            <button
              onClick={handleCancelEdit}
              className="btn btn-outline flex items-center gap-2"
            >
              <X size={20} />
              <span>ביטול</span>
            </button>
          )}
        </div>
        
        {isAddingTransaction && (
          <div className="card">
            <h2 className="mb-4">הוספת הוצאה חדשה</h2>
            <TransactionForm
              onSubmit={handleAddTransaction}
              onCancel={handleCancelEdit}
            />
          </div>
        )}
        
        {editingTransaction && (
          <div className="card">
            <h2 className="mb-4">עריכת הוצאה</h2>
            <TransactionForm
              initialValues={editingTransaction}
              onSubmit={handleUpdateTransaction}
              onCancel={handleCancelEdit}
            />
          </div>
        )}
        
        {!isAddingTransaction && !editingTransaction && (
          <TransactionList onEdit={setEditingTransaction} />
        )}
      </div>
    </AppLayout>
  );
};

export default TransactionsPage;