import React, { useState, useEffect } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { Category } from '../../types';
import { Tags, Hash, Plus, Minus, CircleDollarSign } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../Auth/AuthProvider';

interface CategoryFormProps {
  initialCategory?: Category;
  onSubmit: (category: Omit<Category, 'id'>) => void;
  onCancel: () => void;
}

const COLORS = [
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#A3E635', // Lime
  '#6B7280', // Gray
];

const CategoryForm: React.FC<CategoryFormProps> = ({
  initialCategory,
  onSubmit,
  onCancel,
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<Omit<Category, 'id'>>({
    name: '',
    color: COLORS[0],
    keywords: [''],
    budget: 0,
  });
  
  const [errors, setErrors] = useState<{
    name?: string;
    keywords?: string;
    budget?: string;
  }>({});
  
  useEffect(() => {
    if (initialCategory) {
      setFormData({
        name: initialCategory.name,
        color: initialCategory.color,
        keywords: initialCategory.keywords.length ? initialCategory.keywords : [''],
        budget: initialCategory.budget || 0,
      });
    }
  }, [initialCategory]);
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'budget' ? parseFloat(value) : value,
    });
    
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: undefined,
      });
    }
  };
  
  const handleColorSelect = (color: string) => {
    setFormData({
      ...formData,
      color,
    });
  };
  
  const handleKeywordChange = (index: number, value: string) => {
    const newKeywords = [...formData.keywords];
    newKeywords[index] = value;
    
    setFormData({
      ...formData,
      keywords: newKeywords,
    });
    
    if (errors.keywords) {
      setErrors({
        ...errors,
        keywords: undefined,
      });
    }
  };
  
  const addKeyword = () => {
    setFormData({
      ...formData,
      keywords: [...formData.keywords, ''],
    });
  };
  
  const removeKeyword = (index: number) => {
    if (formData.keywords.length <= 1) {
      return;
    }
    
    const newKeywords = formData.keywords.filter((_, i) => i !== index);
    
    setFormData({
      ...formData,
      keywords: newKeywords,
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: typeof errors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'שם הקטגוריה נדרש';
    }
    
    const filteredKeywords = formData.keywords.filter((k) => k.trim());
    
    if (filteredKeywords.length === 0) {
      newErrors.keywords = 'יש להזין לפחות מילת מפתח אחת';
    }
    
    if (formData.budget < 0) {
      newErrors.budget = 'התקציב לא יכול להיות שלילי';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (!user) throw new Error('User not authenticated');

      const categoryData = {
        ...formData,
        keywords: filteredKeywords,
        user_id: user.id
      };

      if (initialCategory) {
        // Update existing category
        const { error } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', initialCategory.id)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Create new category
        const { error } = await supabase
          .from('categories')
          .insert([categoryData]);

        if (error) throw error;
      }

      onSubmit({
        ...formData,
        keywords: filteredKeywords,
      });
    } catch (error) {
      console.error('Error saving category:', error);
      alert('שגיאה בשמירת הקטגוריה. אנא נסה שוב.');
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
      {/* Category Name */}
      <div>
        <label htmlFor="name" className="form-label">
          <span className="flex items-center gap-2">
            <Tags size={16} />
            <span>שם קטגוריה</span>
          </span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`form-input ${errors.name ? 'border-error' : ''}`}
          placeholder="לדוגמה: מזון, תחבורה, בידור"
        />
        {errors.name && (
          <p className="text-error text-sm mt-1">{errors.name}</p>
        )}
      </div>
      
      {/* Monthly Budget */}
      <div>
        <label htmlFor="budget" className="form-label">
          <span className="flex items-center gap-2">
            <CircleDollarSign size={16} />
            <span>תקציב חודשי (₪)</span>
          </span>
        </label>
        <input
          type="number"
          id="budget"
          name="budget"
          value={formData.budget}
          onChange={handleChange}
          className={`form-input ${errors.budget ? 'border-error' : ''}`}
          placeholder="הזן תקציב חודשי לקטגוריה זו"
          min="0"
          step="1"
        />
        {errors.budget && (
          <p className="text-error text-sm mt-1">{errors.budget}</p>
        )}
        <p className="text-sm text-text-secondary mt-1">
          השאר 0 אם אין תקציב מוגדר לקטגוריה זו
        </p>
      </div>
      
      {/* Color Selection */}
      <div>
        <label className="form-label">צבע קטגוריה</label>
        <div className="flex flex-wrap gap-2 mt-2">
          {COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={`w-8 h-8 rounded-full transition-all ${
                formData.color === color
                  ? 'ring-2 ring-offset-2 ring-primary'
                  : 'hover:scale-110'
              }`}
              style={{ backgroundColor: color }}
              onClick={() => handleColorSelect(color)}
              aria-label={`בחר צבע ${color}`}
            />
          ))}
        </div>
      </div>
      
      {/* Keywords */}
      <div>
        <label className="form-label">
          <span className="flex items-center gap-2">
            <Hash size={16} />
            <span>מילות מפתח (לזיהוי אוטומטי)</span>
          </span>
        </label>
        
        {errors.keywords && (
          <p className="text-error text-sm mb-2">{errors.keywords}</p>
        )}
        
        <div className="space-y-2">
          {formData.keywords.map((keyword, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={keyword}
                onChange={(e) => handleKeywordChange(index, e.target.value)}
                className="form-input"
                placeholder="מילת מפתח לזיהוי העסקה"
              />
              
              <button
                type="button"
                onClick={() => removeKeyword(index)}
                className="p-2 text-error rounded-md hover:bg-error/10"
                disabled={formData.keywords.length <= 1}
              >
                <Minus size={20} />
              </button>
            </div>
          ))}
          
          <button
            type="button"
            onClick={addKeyword}
            className="flex items-center gap-2 text-primary hover:bg-primary/10 p-2 rounded-md transition-colors"
          >
            <Plus size={20} />
            <span>הוסף מילת מפתח</span>
          </button>
        </div>
        
        <p className="text-text-secondary text-sm mt-2">
          מילות המפתח משמשות לזיהוי אוטומטי של קטגוריה בעת ייבוא עסקאות.
          לדוגמה: עבור קטגוריית "מזון", מילות מפתח יכולות להיות "מסעדה", "סופר", "קפה".
        </p>
      </div>
      
      <div className="flex justify-end gap-3">
        <button
          type="button"
          className="btn btn-outline"
          onClick={onCancel}
        >
          ביטול
        </button>
        <button type="submit" className="btn btn-primary">
          שמור
        </button>
      </div>
    </form>
  );
};

export default CategoryForm;