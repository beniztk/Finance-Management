import React, { useState, useEffect } from 'react';
import AppLayout from '../Layout/AppLayout';
import { useFinanceStore } from '../../store/useFinanceStore';
import { Plus, Minus, Calendar, CircleDollarSign, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../Auth/AuthProvider';

const LoanPage: React.FC = () => {
  const { user } = useAuth();
  const { loans, addLoan, addLoanPayment, deleteLoanPayment, withdrawFromLoan } = useFinanceStore();
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentNotes, setPaymentNotes] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const initializeLoan = async () => {
      if (!user) return;
      
      try {
        // Check if loan exists in database
        const { data: existingLoans, error: fetchError } = await supabase
          .from('loans')
          .select('*')
          .eq('user_id', user.id);
          
        if (fetchError) throw fetchError;
        
        if (!existingLoans || existingLoans.length === 0) {
          // Create initial loan
          const { data: newLoan, error: createError } = await supabase
            .from('loans')
            .insert([{
              user_id: user.id,
              initial_amount: 100000,
              remaining_amount: 100000,
              start_date: new Date().toISOString().split('T')[0],
              lender: 'אבא של יובל'
            }])
            .select()
            .single();
            
          if (createError) throw createError;
          if (newLoan) {
            addLoan({
              initialAmount: newLoan.initial_amount,
              remainingAmount: newLoan.remaining_amount,
              startDate: newLoan.start_date,
              lender: newLoan.lender
            });
          }
        } else {
          // Load existing loan and its payments
          const loan = existingLoans[0];
          const { data: payments, error: paymentsError } = await supabase
            .from('loan_payments')
            .select('*')
            .eq('loan_id', loan.id);
            
          if (paymentsError) throw paymentsError;
          
          addLoan({
            initialAmount: loan.initial_amount,
            remainingAmount: loan.remaining_amount,
            startDate: loan.start_date,
            lender: loan.lender,
            payments: payments || []
          });
        }
      } catch (error) {
        console.error('Error initializing loan:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeLoan();
  }, [user, addLoan]);
  
  const handleAddPayment = async () => {
    if (!user || !loans?.[0] || paymentAmount <= 0) return;
    
    try {
      const { data: payment, error } = await supabase
        .from('loan_payments')
        .insert([{
          user_id: user.id,
          loan_id: loans[0].id,
          date: paymentDate,
          amount: paymentAmount,
          notes: paymentNotes || null
        }])
        .select()
        .single();
        
      if (error) throw error;
      
      if (payment) {
        addLoanPayment(loans[0].id, {
          date: payment.date,
          amount: payment.amount,
          notes: payment.notes || ''
        });
        
        // Update loan remaining amount
        await supabase
          .from('loans')
          .update({ 
            remaining_amount: loans[0].remainingAmount - paymentAmount,
            updated_at: new Date().toISOString()
          })
          .eq('id', loans[0].id);
      }
      
      setShowAddPayment(false);
      setPaymentAmount(0);
      setPaymentNotes('');
    } catch (error) {
      console.error('Error adding payment:', error);
      alert('שגיאה בהוספת התשלום. אנא נסה שוב.');
    }
  };
  
  const handleWithdraw = async () => {
    if (!user || !loans?.[0] || withdrawAmount <= 0) return;
    
    try {
      const { error } = await supabase
        .from('loans')
        .update({ 
          remaining_amount: loans[0].remainingAmount + withdrawAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', loans[0].id);
        
      if (error) throw error;
      
      withdrawFromLoan(loans[0].id, withdrawAmount);
      setShowWithdraw(false);
      setWithdrawAmount(0);
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      alert('שגיאה בביצוע המשיכה. אנא נסה שוב.');
    }
  };
  
  const handleDeletePayment = async (loanId: string, paymentId: string) => {
    if (!user || !loans?.[0]) return;
    
    try {
      if (window.confirm('האם אתה בטוח שברצונך למחוק תשלום זה?')) {
        const payment = loans[0].payments?.find(p => p.id === paymentId);
        if (!payment) return;
        
        const { error } = await supabase
          .from('loan_payments')
          .delete()
          .eq('id', paymentId);
          
        if (error) throw error;
        
        // Update loan remaining amount
        await supabase
          .from('loans')
          .update({ 
            remaining_amount: loans[0].remainingAmount + payment.amount,
            updated_at: new Date().toISOString()
          })
          .eq('id', loanId);
        
        deleteLoanPayment(loanId, paymentId);
      }
    } catch (error) {
      console.error('Error deleting payment:', error);
      alert('שגיאה במחיקת התשלום. אנא נסה שוב.');
    }
  };
  
  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }
  
  const loan = loans?.[0];
  if (!loan) return null;
  
  const totalPaid = loan.payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
  const progress = (totalPaid / loan.initialAmount) * 100;
  
  return (
    <AppLayout>
      <div className="space-y-6">
        <h1>ניהול הלוואה</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card">
            <h3 className="text-sm text-text-secondary">סכום הלוואה מקורי</h3>
            <p className="text-2xl font-bold">₪{loan.initialAmount.toLocaleString()}</p>
          </div>
          
          <div className="card">
            <h3 className="text-sm text-text-secondary">סכום ששולם</h3>
            <p className="text-2xl font-bold text-success">₪{totalPaid.toLocaleString()}</p>
          </div>
          
          <div className="card">
            <h3 className="text-sm text-text-secondary">יתרה לתשלום</h3>
            <p className="text-2xl font-bold text-primary">₪{loan.remainingAmount.toLocaleString()}</p>
          </div>
          
          <div className="card">
            <h3 className="text-sm text-text-secondary">התקדמות</h3>
            <p className="text-2xl font-bold">{progress.toFixed(1)}%</p>
          </div>
        </div>
        
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h2>תשלומים והחזרים</h2>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowWithdraw(true)}
                className="btn btn-outline flex items-center gap-2"
              >
                <Minus size={20} />
                <span>משיכה מהחיסכון</span>
              </button>
              
              <button
                onClick={() => setShowAddPayment(true)}
                className="btn btn-primary flex items-center gap-2"
              >
                <Plus size={20} />
                <span>הוסף תשלום</span>
              </button>
            </div>
          </div>
          
          {showAddPayment && (
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
              <h3 className="font-medium mb-4">הוספת תשלום חדש</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="form-label">
                    <span className="flex items-center gap-2">
                      <CircleDollarSign size={16} />
                      <span>סכום</span>
                    </span>
                  </label>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    className="form-input"
                    min="0"
                    step="100"
                  />
                </div>
                
                <div>
                  <label className="form-label">
                    <span className="flex items-center gap-2">
                      <Calendar size={16} />
                      <span>תאריך</span>
                    </span>
                  </label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="form-input"
                  />
                </div>
                
                <div>
                  <label className="form-label">הערות (אופציונלי)</label>
                  <input
                    type="text"
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    className="form-input"
                    placeholder="למשל: תשלום מהבונוס"
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowAddPayment(false)}
                    className="btn btn-outline"
                  >
                    ביטול
                  </button>
                  <button
                    onClick={handleAddPayment}
                    className="btn btn-primary"
                    disabled={paymentAmount <= 0}
                  >
                    הוסף תשלום
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {showWithdraw && (
            <div className="mb-6 p-4 border rounded-lg bg-gray-50">
              <h3 className="font-medium mb-4">משיכה מהחיסכון</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="form-label">
                    <span className="flex items-center gap-2">
                      <CircleDollarSign size={16} />
                      <span>סכום למשיכה</span>
                    </span>
                  </label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                    className="form-input"
                    min="0"
                    step="100"
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowWithdraw(false)}
                    className="btn btn-outline"
                  >
                    ביטול
                  </button>
                  <button
                    onClick={handleWithdraw}
                    className="btn btn-primary"
                    disabled={withdrawAmount <= 0}
                  >
                    משוך מהחיסכון
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            {!loan.payments || loan.payments.length === 0 ? (
              <p className="text-center text-text-secondary py-4">
                אין תשלומים עדיין
              </p>
            ) : (
              <div className="space-y-3">
                {[...loan.payments].reverse().map((payment) => (
                  <div
                    key={payment.id}
                    className="p-4 rounded-lg border hover:shadow-sm transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-lg font-bold">₪{payment.amount.toLocaleString()}</p>
                        <div className="flex items-center gap-2 text-sm text-text-secondary mt-1">
                          <Calendar size={14} />
                          <span>{new Date(payment.date).toLocaleDateString('he-IL')}</span>
                        </div>
                        {payment.notes && (
                          <p className="text-sm mt-2">{payment.notes}</p>
                        )}
                      </div>
                      
                      <button
                        onClick={() => handleDeletePayment(loan.id, payment.id)}
                        className="p-1 rounded-full hover:bg-gray-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default LoanPage;