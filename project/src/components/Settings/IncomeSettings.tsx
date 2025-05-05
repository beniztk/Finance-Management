import React, { useState, useEffect } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { CircleDollarSign, Plus, Trash2, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../Auth/AuthProvider';

const IncomeSettings: React.FC = () => {
  const { user } = useAuth();
  const { 
    monthlyIncomes,
    savingsPercentage,
    addMonthlyIncome,
    updateMonthlyIncome,
    deleteMonthlyIncome,
    setSavingsPercentage,
    getMonthlyIncomes,
    clearMonthlyIncomes
  } = useFinanceStore();
  
  const [savings, setSavings] = useState(savingsPercentage);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    person: 'yuval' as 'yuval' | 'benny',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const monthlyIncomesData = getMonthlyIncomes(currentMonth, currentYear);
  
  const handleSaveSavings = () => {
    setSavingsPercentage(savings);
    alert('אחוז החיסכון עודכן בהצלחה!');
  };
  
  const handleAddIncome = async () => {
    try {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('monthly_incomes')
        .insert([{
          user_id: user.id,
          person: formData.person,
          amount: formData.amount,
          date: formData.date,
          notes: formData.notes || null
        }])
        .select();

      if (error) throw error;
      if (data) {
        addMonthlyIncome(formData);
        setShowAddForm(false);
        setFormData({
          person: 'yuval',
          amount: 0,
          date: new Date().toISOString().split('T')[0],
          notes: ''
        });
      }
    } catch (error) {
      console.error('Error adding income:', error);
      alert('שגיאה בהוספת ההכנסה. אנא נסה שוב.');
    }
  };
  
  const handleDeleteIncome = async (person: 'yuval' | 'benny', date: string) => {
    try {
      if (!user) throw new Error('User not authenticated');

      if (window.confirm('האם אתה בטוח שברצונך למחוק הכנסה זו?')) {
        const { error } = await supabase
          .from('monthly_incomes')
          .delete()
          .eq('user_id', user.id)
          .eq('person', person)
          .eq('date', date);

        if (error) throw error;
        deleteMonthlyIncome(person, date);
      }
    } catch (error) {
      console.error('Error deleting income:', error);
      alert('שגיאה במחיקת ההכנסה. אנא נסה שוב.');
    }
  };
  
  const totalIncome = monthlyIncomesData.reduce((sum, income) => sum + income.amount, 0);
  
  // Load monthly incomes from Supabase on component mount
  useEffect(() => {
    const loadMonthlyIncomes = async () => {
      if (!user) return;

      try {
        // Clear existing incomes before loading from database
        clearMonthlyIncomes();
        
        const { data, error } = await supabase
          .from('monthly_incomes')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;
        if (data) {
          // Update local state with database data
          data.forEach(income => {
            addMonthlyIncome({
              person: income.person as 'yuval' | 'benny',
              amount: income.amount,
              date: income.date,
              notes: income.notes || ''
            });
          });
        }
      } catch (error) {
        console.error('Error loading monthly incomes:', error);
      }
    };

    loadMonthlyIncomes();
  }, [user, addMonthlyIncome, clearMonthlyIncomes]);

  // Subscribe to realtime changes
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('monthly_incomes_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public',
        table: 'monthly_incomes',
        filter: `user_id=eq.${user.id}`
      }, async (payload) => {
        // Reload all incomes when any change occurs
        const { data, error } = await supabase
          .from('monthly_incomes')
          .select('*')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error reloading incomes:', error);
          return;
        }

        clearMonthlyIncomes();
        data.forEach(income => {
          addMonthlyIncome({
            person: income.person as 'yuval' | 'benny',
            amount: income.amount,
            date: income.date,
            notes: income.notes || ''
          });
        });
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, addMonthlyIncome, clearMonthlyIncomes]);
  
  return (
    <div className="space-y-6 animate-fade-in max-w-xl mx-auto">
      {/* Monthly Income Section */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2>הכנסות חודשיות</h2>
          
          <button
            onClick={() => setShowAddForm(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            <span>הוסף הכנסה</span>
          </button>
        </div>
        
        {showAddForm && (
          <div className="mb-6 p-4 border rounded-lg bg-gray-50">
            <h3 className="font-medium mb-4">הוספת הכנסה חדשה</h3>
            
            <div className="space-y-4">
              <div>
                <label className="form-label">בן זוג</label>
                <select
                  value={formData.person}
                  onChange={(e) => setFormData({ ...formData, person: e.target.value as 'yuval' | 'benny' })}
                  className="form-input"
                >
                  <option value="yuval">יובל</option>
                  <option value="benny">בני</option>
                </select>
              </div>
              
              <div>
                <label className="form-label">סכום</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                  className="form-input"
                  min="0"
                  step="100"
                />
              </div>
              
              <div>
                <label className="form-label">תאריך</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="form-input"
                />
              </div>
              
              <div>
                <label className="form-label">הערות (אופציונלי)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="form-input"
                  rows={2}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="btn btn-outline"
                >
                  ביטול
                </button>
                <button
                  onClick={handleAddIncome}
                  className="btn btn-primary"
                >
                  הוסף
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          {monthlyIncomesData.length === 0 ? (
            <p className="text-center text-text-secondary py-4">
              אין הכנסות מוגדרות לחודש הנוכחי
            </p>
          ) : (
            <>
              {monthlyIncomesData.map((income, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    income.person === 'yuval' ? 'border-pink-200 bg-pink-50' : 'border-blue-200 bg-blue-50'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className={`font-medium ${
                        income.person === 'yuval' ? 'text-pink-600' : 'text-blue-600'
                      }`}>
                        {income.person === 'yuval' ? 'יובל' : 'בני'}
                      </h3>
                      <p className="text-lg font-bold mt-1">
                        ₪{income.amount.toLocaleString()}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-text-secondary mt-1">
                        <Calendar size={14} />
                        <span>{new Date(income.date).toLocaleDateString('he-IL')}</span>
                      </div>
                      {income.notes && (
                        <p className="text-sm mt-2">{income.notes}</p>
                      )}
                    </div>
                    
                    <button
                      onClick={() => handleDeleteIncome(income.person, income.date)}
                      className="p-1 rounded-full hover:bg-white/50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              
              <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="font-medium">סך הכל הכנסות לחודש:</p>
                <p className="text-2xl font-bold">₪{totalIncome.toLocaleString()}</p>
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Savings Settings */}
      <div className="card">
        <h2 className="mb-6">הגדרות חיסכון</h2>
        
        <div className="space-y-6">
          <div>
            <label htmlFor="savings" className="form-label">
              <span className="flex items-center gap-2">
                <CircleDollarSign size={16} />
                <span>אחוז חיסכון חודשי (%)</span>
              </span>
            </label>
            <input
              type="number"
              id="savings"
              value={savings}
              onChange={(e) => setSavings(Number(e.target.value))}
              className="form-input"
              min="0"
              max="100"
            />
            <p className="text-sm text-text-secondary mt-1">
              האחוז מההכנסה החודשית המועבר אוטומטית לחיסכון
            </p>
          </div>
          
          <div className="bg-primary/5 p-4 rounded-lg space-y-2">
            <p className="font-medium">חישובים אוטומטיים:</p>
            <p>הכנסה חודשית: ₪{totalIncome.toLocaleString()}</p>
            <p>גמל להשקעה: ₪{(200 * 2).toLocaleString()} (200₪ לכל בן זוג)</p>
            <p>סכום לחיסכון: ₪{Math.round(totalIncome * (savings / 100)).toLocaleString()} ({savings}%)</p>
            <p className="font-medium">
              סכום לשימוש לאחר ניכויים: ₪{Math.round(totalIncome - 400 - (totalIncome * (savings / 100))).toLocaleString()}
            </p>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={handleSaveSavings}
              className="btn btn-primary"
            >
              שמור הגדרות חיסכון
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomeSettings;