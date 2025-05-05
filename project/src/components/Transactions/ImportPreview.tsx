import React from 'react';
import { Check, AlertTriangle } from 'lucide-react';
import { Transaction } from '../../types';
import { useFinanceStore } from '../../store/useFinanceStore';

interface ImportPreviewProps {
  transactions: Omit<Transaction, 'id'>[];
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const ImportPreview: React.FC<ImportPreviewProps> = ({
  transactions,
  onConfirm,
  onCancel,
  isLoading = false
}) => {
  const { categories } = useFinanceStore();
  
  // Calculate totals
  const total = transactions.reduce((sum, t) => sum + t.amount, 0);
  
  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <h3 className="font-medium mb-4">אימות נתונים לפני ייבוא</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-right">תאריך</th>
                <th className="p-3 text-right">קטגוריה</th>
                <th className="p-3 text-right">סכום</th>
                <th className="p-3 text-right">סטטוס</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {transactions.map((transaction, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="p-3">{new Date(transaction.date).toLocaleDateString('he-IL')}</td>
                  <td className="p-3">{transaction.category}</td>
                  <td className="p-3">₪{transaction.amount.toLocaleString()}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-1 text-success">
                      <Check size={16} />
                      <span>תקין</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-primary/5 p-4 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="font-medium">סך הכל עסקאות:</span>
          <span>{transactions.length}</span>
        </div>
        <div className="flex justify-between items-center mt-2">
          <span className="font-medium">סך הכל סכום:</span>
          <span>₪{total.toLocaleString()}</span>
        </div>
      </div>
      
      <div className="flex justify-end gap-3">
        <button
          type="button"
          className="btn btn-outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          ביטול
        </button>
        <button
          type="button"
          className="btn btn-primary relative"
          onClick={onConfirm}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="opacity-0">אשר ייבוא</span>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              </div>
            </>
          ) : (
            'אשר ייבוא'
          )}
        </button>
      </div>
    </div>
  );
};

export default ImportPreview;