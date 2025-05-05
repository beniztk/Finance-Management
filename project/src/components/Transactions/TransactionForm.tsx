import React, { useState, useEffect } from 'react';
import { Users, Tags, FileText, CircleDollarSign, CreditCard } from 'lucide-react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { Transaction } from '../../types';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../Auth/AuthProvider';

interface TransactionFormProps {
  initialValues?: Partial<Transaction>;
  onSubmit: (transaction: Omit<Transaction, 'id'>) => void;
  onCancel?: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  initialValues,
  onSubmit,
  onCancel,
}) => {
  const { categories = [] } = useFinanceStore();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<Omit<Transaction, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    amount: initialValues?.amount || 0,
    description: initialValues?.description || '',
    category: initialValues?.category || (categories[0]?.name || ''),
    person: initialValues?.person || 'yuval',
    source: initialValues?.source || 'credit_card',
    notes: initialValues?.notes || '',
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof Omit<Transaction, 'id'>, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (initialValues) {
      setFormData({
        date: initialValues.date || new Date().toISOString().split('T')[0],
        amount: initialValues.amount || 0,
        description: initialValues.description || '',
        category: initialValues.category || (categories[0]?.name || ''),
        person: initialValues.person || 'yuval',
        source: initialValues.source || 'credit_card',
        notes: initialValues.notes || '',
      });
    }
  }, [initialValues, categories]);
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'amount' ? parseFloat(value) : value,
    });
    
    if (errors[name as keyof Omit<Transaction, 'id'>]) {
      setErrors({
        ...errors,
        [name]: undefined,
      });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Partial<Record<keyof Omit<Transaction, 'id'>, string>> = {};
    
    if (formData.amount <= 0) {
      newErrors.amount = 'סכום חייב להיות גדול מ-0';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'תיאור נדרש';
    }
    
    if (!formData.category) {
      newErrors.category = 'קטגוריה נדרשת';
    }
    
    if (!formData.person) {
      newErrors.person = 'אנא בחר בן זוג';
    }
    
    if (!formData.source) {
      newErrors.source = 'אנא בחר מקור תשלום';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!user) {
      alert('משתמש לא מחובר');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          ...formData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        onSubmit(formData);
      }
    } catch (error) {
      console.error('Error saving transaction:', error);
      alert('שגיאה בשמירת ההוצאה. אנא נסה שוב.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If there are no categories, show a message
  if (!categories || categories.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-text-secondary">
          אנא הגדר קטגוריות תחילה לפני הוספת הוצאה
        </p>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Amount */}
        <div>
          <label htmlFor="amount" className="form-label">
            <span className="flex items-center gap-2">
              <CircleDollarSign size={16} />
              <span>סכום (₪)</span>
            </span>
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            step="0.01"
            className={`form-input ${errors.amount ? 'border-error' : ''}`}
          />
          {errors.amount && (
            <p className="text-error text-sm mt-1">{errors.amount}</p>
          )}
        </div>
        
        {/* Description */}
        <div>
          <label htmlFor="description" className="form-label">
            <span className="flex items-center gap-2">
              <FileText size={16} />
              <span>תיאור</span>
            </span>
          </label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={`form-input ${errors.description ? 'border-error' : ''}`}
          />
          {errors.description && (
            <p className="text-error text-sm mt-1">{errors.description}</p>
          )}
        </div>
        
        {/* Category */}
        <div>
          <label htmlFor="category" className="form-label">
            <span className="flex items-center gap-2">
              <Tags size={16} />
              <span>קטגוריה</span>
            </span>
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`form-input ${errors.category ? 'border-error' : ''}`}
          >
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="text-error text-sm mt-1">{errors.category}</p>
          )}
        </div>
        
        {/* Source */}
        <div>
          <label htmlFor="source" className="form-label">
            <span className="flex items-center gap-2">
              <CreditCard size={16} />
              <span>מקור תשלום</span>
            </span>
          </label>
          <select
            id="source"
            name="source"
            value={formData.source}
            onChange={handleChange}
            className={`form-input ${errors.source ? 'border-error' : ''}`}
          >
            <option value="bit">ביט</option>
            <option value="bank_transfer">העברה בנקאית</option>
            <option value="credit_card">כרטיס אשראי</option>
            <option value="cash">מזומן</option>
            <option value="rent">שכירות</option>
            <option value="other">אחר</option>
          </select>
          {errors.source && (
            <p className="text-error text-sm mt-1">{errors.source}</p>
          )}
        </div>
        
        {/* Person */}
        <div>
          <label htmlFor="person" className="form-label">
            <span className="flex items-center gap-2">
              <Users size={16} />
              <span>בן זוג</span>
            </span>
          </label>
          <select
            id="person"
            name="person"
            value={formData.person}
            onChange={handleChange}
            className={`form-input ${errors.person ? 'border-error' : ''}`}
          >
            <option value="yuval" className="text-pink-500">יובל</option>
            <option value="benny" className="text-blue-500">בני</option>
          </select>
          {errors.person && (
            <p className="text-error text-sm mt-1">{errors.person}</p>
          )}
        </div>
        
        {/* Notes */}
        <div className="md:col-span-2">
          <label htmlFor="notes" className="form-label">
            <span className="flex items-center gap-2">
              <FileText size={16} />
              <span>הערות (אופציונלי)</span>
            </span>
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="form-input h-24"
          />
        </div>
      </div>
      
      <div className="flex justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            className="btn btn-outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            ביטול
          </button>
        )}
        <button 
          type="submit" 
          className="btn btn-primary relative"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="opacity-0">שמור</span>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              </div>
            </>
          ) : (
            'שמור'
          )}
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;