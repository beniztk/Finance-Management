import React, { useState } from 'react';
import { Pencil, Trash2, AlertTriangle, User, Calendar, Tag, Filter, Edit, RotateCcw } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { Transaction } from '../../types';

interface TransactionListProps {
  onEdit?: (transaction: Transaction) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ onEdit }) => {
  const { transactions = [], categories = [], deleteTransaction, clearTransactions, undoTransactions } = useFinanceStore();
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterPerson, setFilterPerson] = useState<string>('');
  
  const sortedTransactions = Array.isArray(transactions) 
    ? [...transactions]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .filter((transaction) => {
          if (filterCategory && transaction.category !== filterCategory) {
            return false;
          }
          if (filterPerson && transaction.person !== filterPerson) {
            return false;
          }
          return true;
        })
    : [];
  
  const getCategoryColor = (categoryName: string) => {
    const category = Array.isArray(categories) 
      ? categories.find((c) => c.name === categoryName)
      : undefined;
    return category?.color || '#CBD5E1';
  };
  
  const getPersonColor = (person: string) => {
    return person === 'yuval' ? '#EC4899' : '#3B82F6';
  };
  
  const getPersonName = (person: string) => {
    return person === 'yuval' ? 'יובל' : 'בני';
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  const handleDelete = (id: string) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את העסקה הזו?')) {
      deleteTransaction(id);
    }
  };
  
  const handleClearAll = () => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את כל העסקאות?')) {
      clearTransactions();
    }
  };
  
  const handleUndo = () => {
    undoTransactions();
  };
  
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={16} />
            <span className="text-sm font-medium">סינון:</span>
          </div>
          
          <div className="flex-1">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="form-input text-sm py-1"
            >
              <option value="">כל הקטגוריות</option>
              {Array.isArray(categories) && categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex-1">
            <select
              value={filterPerson}
              onChange={(e) => setFilterPerson(e.target.value)}
              className="form-input text-sm py-1"
            >
              <option value="">הכל</option>
              <option value="yuval" className="text-pink-500">יובל</option>
              <option value="benny" className="text-blue-500">בני</option>
            </select>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleUndo}
              className="btn btn-outline flex items-center gap-2"
              title="בטל פעולה אחרונה"
            >
              <RotateCcw size={16} />
              <span>בטל</span>
            </button>
            
            {sortedTransactions.length > 0 && (
              <button
                onClick={handleClearAll}
                className="btn btn-outline text-error border-error hover:bg-error/10"
              >
                מחק הכל
              </button>
            )}
          </div>
        </div>
      </div>
      
      {sortedTransactions.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <p className="text-text-secondary">
            לא נמצאו עסקאות. הוסף עסקאות חדשות כדי לראות אותן כאן.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedTransactions.map((transaction) => {
            const isNegative = transaction.amount < 0;
            
            return (
              <div
                key={transaction.id}
                className={`bg-white p-4 rounded-lg shadow-sm border-r-4 hover:shadow-md transition-shadow ${
                  isNegative ? 'border-l-2 border-l-red-500' : ''
                }`}
                style={{ borderRightColor: getCategoryColor(transaction.category) }}
              >
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div className="space-y-2">
                    <h3 className="font-medium text-lg">{transaction.description}</h3>
                    
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-text-secondary">
                      <div className="flex items-center gap-1">
                        <Calendar size={16} />
                        <span>{formatDate(transaction.date)}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Tag size={16} />
                        <span>{transaction.category}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <User size={16} style={{ color: getPersonColor(transaction.person) }} />
                        <span style={{ color: getPersonColor(transaction.person) }}>
                          {getPersonName(transaction.person)}
                        </span>
                      </div>
                    </div>
                    
                    {transaction.notes && (
                      <p className="text-sm text-text-secondary">{transaction.notes}</p>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <div className={`text-lg font-bold ${isNegative ? 'text-red-500' : ''}`}>
                      ₪{Math.abs(transaction.amount).toLocaleString()}
                      {isNegative && ' -'}
                    </div>
                    
                    <div className="flex gap-2">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(transaction)}
                          className="p-1 rounded-full hover:bg-gray-100"
                          title="ערוך"
                        >
                          <Edit size={16} />
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="p-1 rounded-full hover:bg-gray-100 text-error"
                        title="מחק"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TransactionList;