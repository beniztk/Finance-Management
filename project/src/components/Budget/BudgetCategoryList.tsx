import React from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { CircleDollarSign, Pencil } from 'lucide-react';

const BudgetCategoryList: React.FC = () => {
  const { categories, getCategorySummary, setBudget } = useFinanceStore();
  const categorySummary = getCategorySummary();
  
  const handleBudgetChange = (categoryId: string, budget: number) => {
    setBudget(categoryId, budget);
  };
  
  return (
    <div className="card">
      <h2 className="mb-6">תקציב לפי קטגוריה</h2>
      
      <div className="space-y-4">
        {categories.map((category) => {
          const summary = categorySummary.find((s) => s.category === category.name);
          const spent = summary?.amount || 0;
          const budget = category.budget || 0;
          const percentage = budget > 0 ? (spent / budget) * 100 : 0;
          
          return (
            <div
              key={category.id}
              className="p-4 rounded-lg border border-border hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <h3 className="font-medium">{category.name}</h3>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <CircleDollarSign size={16} className="text-primary" />
                      <span>תקציב: ₪{budget.toLocaleString()}</span>
                    </div>
                    <span className="text-text-secondary">|</span>
                    <span>הוצאות: ₪{spent.toLocaleString()}</span>
                    <span className="text-text-secondary">|</span>
                    <span
                      className={
                        percentage > 100
                          ? 'text-error'
                          : percentage > 80
                          ? 'text-warning'
                          : 'text-success'
                      }
                    >
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                  
                  {budget > 0 && (
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
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => handleBudgetChange(category.id, parseFloat(e.target.value) || 0)}
                    className="form-input w-32 text-sm py-1"
                    min="0"
                    step="100"
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BudgetCategoryList;