import React, { useState } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { processExcelFile } from '../../utils/importUtils';
import { Transaction } from '../../types';
import ImportForm from './ImportForm';
import ImportPreview from './ImportPreview';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../Auth/AuthProvider';

const ImportTransactions: React.FC = () => {
  const { importTransactions } = useFinanceStore();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Omit<Transaction, 'id'>[]>([]);
  const [error, setError] = useState<string>('');
  const [isImportComplete, setIsImportComplete] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<'yuval' | 'benny'>('yuval');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleFileAccepted = async (file: File, source: 'max' | 'bank') => {
    try {
      setIsLoading(true);
      if (source === 'max') {
        const result = await processExcelFile(file);
        
        if (!result.success) {
          setError(result.errors.join(', '));
          return;
        }
        
        // Set person for all transactions
        const transactionsWithPerson = result.transactions.map(t => ({
          ...t,
          person: selectedPerson
        }));
        
        setTransactions(transactionsWithPerson);
        setShowPreview(true);
        setError('');
      } else {
        setError('ייבוא מחשבון בנק עדיין לא נתמך');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בעיבוד הקובץ');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleConfirmImport = async () => {
    if (!user) {
      setError('משתמש לא מחובר');
      return;
    }

    setIsLoading(true);
    try {
      // Insert transactions into Supabase
      const { data, error } = await supabase
        .from('transactions')
        .insert(
          transactions.map(t => ({
            ...t,
            user_id: user.id
          }))
        )
        .select();

      if (error) throw error;

      // Update local state only after successful database insert
      if (data) {
        importTransactions(transactions);
        setIsImportComplete(true);
        setShowPreview(false);
        setTransactions([]);
      }
    } catch (err) {
      console.error('Error importing transactions:', err);
      setError('שגיאה בשמירת העסקאות. אנא נסה שוב.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCancelImport = () => {
    setShowPreview(false);
    setTransactions([]);
  };

  const handleNavigateToTransactions = () => {
    const transactionsButton = document.querySelector('button[aria-label="הוצאות"]');
    if (transactionsButton instanceof HTMLElement) {
      transactionsButton.click();
    }
  };
  
  if (isImportComplete) {
    return (
      <div className="card text-center py-8">
        <div className="flex flex-col items-center gap-4">
          <CheckCircle2 size={48} className="text-success" />
          <h3 className="text-xl font-medium">העסקאות יובאו בהצלחה!</h3>
          <p className="text-text-secondary">
            {transactions.length} עסקאות נוספו למערכת
          </p>
          <button
            onClick={handleNavigateToTransactions}
            className="btn btn-primary flex items-center gap-2 mt-4"
          >
            <span>עבור לרשימת ההוצאות</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    );
  }
  
  if (!showPreview) {
    return (
      <div className="space-y-6">
        {/* Person Selection */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-medium mb-3">בחר בן זוג:</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedPerson === 'yuval'
                  ? 'border-pink-500 bg-pink-50'
                  : 'border-border hover:border-pink-500'
              }`}
              onClick={() => setSelectedPerson('yuval')}
              disabled={isLoading}
            >
              <span className="font-medium text-pink-600">יובל</span>
            </button>
            
            <button
              type="button"
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedPerson === 'benny'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-border hover:border-blue-500'
              }`}
              onClick={() => setSelectedPerson('benny')}
              disabled={isLoading}
            >
              <span className="font-medium text-blue-600">בני</span>
            </button>
          </div>
        </div>
        
        <ImportForm onFileAccepted={handleFileAccepted} />
        
        {error && (
          <div className="bg-error/10 p-4 rounded-lg text-error border border-error/30">
            <p>{error}</p>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-text-secondary">מעבד נתונים...</p>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <ImportPreview
      transactions={transactions}
      onConfirm={handleConfirmImport}
      onCancel={handleCancelImport}
      isLoading={isLoading}
    />
  );
};

export default ImportTransactions;