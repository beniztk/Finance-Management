import React, { useState } from 'react';
import AppLayout from '../components/Layout/AppLayout';
import CategoryList from '../components/Categories/CategoryList';
import CategoryForm from '../components/Categories/CategoryForm';
import { useFinanceStore } from '../store/useFinanceStore';
import { Category } from '../types';
import { Plus, X } from 'lucide-react';

const CategoriesPage: React.FC = () => {
  const { addCategory, updateCategory } = useFinanceStore();
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  const handleAddCategory = (category: Omit<Category, 'id'>) => {
    addCategory(category);
    setIsAddingCategory(false);
  };
  
  const handleUpdateCategory = (category: Omit<Category, 'id'>) => {
    if (editingCategory) {
      updateCategory(editingCategory.id, category);
      setEditingCategory(null);
    }
  };
  
  const handleCancelEdit = () => {
    setIsAddingCategory(false);
    setEditingCategory(null);
  };
  
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1>ניהול קטגוריות</h1>
          
          {!isAddingCategory && !editingCategory && (
            <button
              onClick={() => setIsAddingCategory(true)}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus size={20} />
              <span>הוסף קטגוריה</span>
            </button>
          )}
          
          {(isAddingCategory || editingCategory) && (
            <button
              onClick={handleCancelEdit}
              className="btn btn-outline flex items-center gap-2"
            >
              <X size={20} />
              <span>ביטול</span>
            </button>
          )}
        </div>
        
        {isAddingCategory && (
          <div className="card">
            <h2 className="mb-4">הוספת קטגוריה חדשה</h2>
            <CategoryForm
              onSubmit={handleAddCategory}
              onCancel={handleCancelEdit}
            />
          </div>
        )}
        
        {editingCategory && (
          <div className="card">
            <h2 className="mb-4">עריכת קטגוריה</h2>
            <CategoryForm
              initialCategory={editingCategory}
              onSubmit={handleUpdateCategory}
              onCancel={handleCancelEdit}
            />
          </div>
        )}
        
        {!isAddingCategory && !editingCategory && (
          <CategoryList onEdit={setEditingCategory} />
        )}
      </div>
    </AppLayout>
  );
};

export default CategoriesPage;