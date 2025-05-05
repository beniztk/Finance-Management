import React from 'react';
import { Pencil, Trash2, AlertTriangle, CircleDollarSign } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { Category } from '../../types';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../Auth/AuthProvider';

interface CategoryListProps {
  onEdit: (category: Category) => void;
}

const CategoryList: React.FC<CategoryListProps> = ({ onEdit }) => {
  const { categories, deleteCategory, transactions } = useFinanceStore();
  const { user } = useAuth();
  
  const handleDelete = async (id: string, name: string) => {
    const isInUse = transactions && Array.isArray(transactions) && 
      transactions.some(t => t.category === name);
    
    if (isInUse) {
      alert(`לא ניתן למחוק את הקטגוריה "${name}" כי היא בשימוש בעסקאות קיימות. יש לשנות או למחוק את העסקאות הרלוונטיות תחילה.`);
      return;
    }
    
    if (window.confirm(`האם אתה בטוח שברצונך למחוק את הקטגוריה "${name}"?`)) {
      try {
        if (!user) throw new Error('User not authenticated');

        const { error } = await supabase
          .from('categories')
          .delete()
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) throw error;
        deleteCategory(id);
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('שגיאה במחיקת הקטגוריה. אנא נסה שוב.');
      }
    }
  };
  
  // Calculate current month's spending for each category
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const monthlySpending: Record<string, number> = {};
  if (transactions && Array.isArray(transactions)) {
    transactions.forEach((t) => {
      const transactionDate = new Date(t.date);
      if (
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear
      ) {
        if (!monthlySpending[t.category]) {
          monthlySpending[t.category] = 0;
        }
        monthlySpending[t.category] += t.amount;
      }
    });
  }
  
  return (
    <div className="space-y-4 animate-fade-in">
      {!categories || categories.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
          <p className="text-text-secondary">
            אין קטגוריות. צור קטגוריות חדשות כדי לארגן את העסקאות שלך.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((category) => {
            const isInUse = transactions && Array.isArray(transactions) && 
              transactions.some(t => t.category === category.name);
            const spent = monthlySpending[category.name] || 0;
            const budget = category.budget || 0;
            const percentage = budget > 0 ? (spent / budget) * 100 : 0;
            
            return (
              <div
                key={category.id}
                className="bg-white p-4 rounded-lg shadow-sm border-r-4 hover:shadow-md transition-shadow"
                style={{ borderRightColor: category.color }}
              >
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <h3 className="font-medium">{category.name}</h3>
                    </div>
                    
                    {category.budget > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <CircleDollarSign size={16} className="text-primary" />
                        <span>תקציב חודשי: ₪{category.budget.toLocaleString()}</span>
                        <span className="text-text-secondary">|</span>
                        <span>הוצאות: ₪{spent.toLocaleString()}</span>
                        <span className="text-text-secondary">|</span>
                        <span className={percentage > 100 ? 'text-error' : percentage > 80 ? 'text-warning' : 'text-success'}>
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    )}
                    
                    {category.keywords && category.keywords.length > 0 && (
                      <p className="text-text-secondary text-sm">
                        מילות מפתח: {category.keywords.join(', ')}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(category)}
                      className="p-1 rounded-full hover:bg-gray-100"
                      title="ערוך"
                    >
                      <Pencil size={16} />
                    </button>
                    
                    <button
                      onClick={() => handleDelete(category.id, category.name)}
                      className={`p-1 rounded-full hover:bg-gray-100 ${
                        isInUse ? 'text-text-secondary cursor-not-allowed' : 'text-error'
                      }`}
                      title={isInUse ? 'לא ניתן למחוק - בשימוש' : 'מחק'}
                      disabled={isInUse}
                    >
                      {isInUse ? (
                        <AlertTriangle size={16} />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>
                
                {category.budget > 0 && (
                  <div className="mt-3">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          percentage > 100
                            ? 'bg-error'
                            : percentage > 80
                            ? 'bg-warning'
                            : 'bg-success'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CategoryList;