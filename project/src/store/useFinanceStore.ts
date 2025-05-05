import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Transaction, Category, MonthlyData, CategorySummary, PersonSummary, BudgetAlert, MonthlyIncome, Loan, LoanPayment, Investment, InvestmentSummary } from '../types';
import { supabase } from '../lib/supabase';

interface FinanceState {
  transactions: Transaction[];
  transactionHistory: Transaction[][];
  categories: Category[];
  monthlyIncomes: MonthlyIncome[];
  savingsPercentage: number;
  investments: Investment[];
  loans: Loan[];
  
  // Sync Operations
  syncWithDatabase: () => Promise<void>;
  
  // Monthly Income Operations
  addMonthlyIncome: (income: MonthlyIncome) => void;
  updateMonthlyIncome: (person: 'yuval' | 'benny', date: string, amount: number, notes?: string) => void;
  deleteMonthlyIncome: (person: 'yuval' | 'benny', date: string) => void;
  getMonthlyIncomes: (month: number, year: number) => MonthlyIncome[];
  clearMonthlyIncomes: () => void;
  
  // CRUD Operations
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  importTransactions: (transactions: Omit<Transaction, 'id'>[]) => void;
  clearTransactions: () => void;
  undoTransactions: () => void;
  
  // Category Operations
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, category: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
  
  // Budget Operations
  setBudget: (categoryId: string, amount: number) => void;
  getBudgetAlerts: () => BudgetAlert[];
  
  // Settings
  setSavingsPercentage: (percentage: number) => void;
  
  // Analytics
  getMonthlyData: () => MonthlyData;
  getCategorySummary: () => CategorySummary[];
  getPersonSummary: () => PersonSummary[];
  
  // Investment Operations
  addInvestment: (investment: Omit<Investment, 'id'>) => void;
  updateInvestment: (id: string, investment: Partial<Investment>) => void;
  deleteInvestment: (id: string) => void;
  getInvestmentSummary: () => InvestmentSummary;
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      transactions: [],
      transactionHistory: [],
      categories: [],
      monthlyIncomes: [],
      savingsPercentage: 10,
      investments: [],
      loans: [],
      
      syncWithDatabase: async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          // Fetch all data from Supabase
          const [
            transactionsResponse,
            categoriesResponse,
            monthlyIncomesResponse,
            investmentsResponse,
            loansResponse,
            loanPaymentsResponse
          ] = await Promise.all([
            supabase.from('transactions').select('*').eq('user_id', user.id),
            supabase.from('categories').select('*').eq('user_id', user.id),
            supabase.from('monthly_incomes').select('*').eq('user_id', user.id),
            supabase.from('investments').select('*').eq('user_id', user.id),
            supabase.from('loans').select('*').eq('user_id', user.id),
            supabase.from('loan_payments').select('*').eq('user_id', user.id)
          ]);

          // Update local state with database data
          set({
            transactions: transactionsResponse.data || [],
            categories: categoriesResponse.data || [],
            monthlyIncomes: monthlyIncomesResponse.data || [],
            investments: investmentsResponse.data || [],
            loans: (loansResponse.data || []).map(loan => ({
              ...loan,
              payments: loanPaymentsResponse.data?.filter(payment => payment.loan_id === loan.id) || []
            }))
          });

          // Set up realtime subscriptions
          const channel = supabase
            .channel('db-changes')
            .on('postgres_changes', { 
              event: '*', 
              schema: 'public',
              table: 'transactions',
              filter: `user_id=eq.${user.id}`
            }, payload => {
              const { transactions } = get();
              switch (payload.eventType) {
                case 'INSERT':
                  set({ transactions: [...transactions, payload.new as Transaction] });
                  break;
                case 'UPDATE':
                  set({
                    transactions: transactions.map(t => 
                      t.id === payload.new.id ? payload.new as Transaction : t
                    )
                  });
                  break;
                case 'DELETE':
                  set({
                    transactions: transactions.filter(t => t.id !== payload.old.id)
                  });
                  break;
              }
            })
            .subscribe();

          return () => {
            channel.unsubscribe();
          };
        } catch (error) {
          console.error('Error syncing with database:', error);
        }
      },
      
      clearMonthlyIncomes: () => {
        set({ monthlyIncomes: [] });
      },

      addLoan: (loan) => {
        const newLoan: Loan = {
          ...loan,
          id: crypto.randomUUID(),
          payments: []
        };
        
        set((state) => ({
          loans: [...state.loans, newLoan]
        }));
      },
      
      updateLoan: (id, loan) => {
        set((state) => ({
          loans: state.loans.map((l) =>
            l.id === id ? { ...l, ...loan } : l
          )
        }));
      },
      
      deleteLoan: (id) => {
        set((state) => ({
          loans: state.loans.filter((l) => l.id !== id)
        }));
      },
      
      addLoanPayment: (loanId, payment) => {
        const newPayment = {
          ...payment,
          id: crypto.randomUUID()
        };
        
        set((state) => ({
          loans: state.loans.map((loan) => {
            if (loan.id === loanId) {
              return {
                ...loan,
                remainingAmount: loan.remainingAmount - payment.amount,
                payments: [...(loan.payments || []), newPayment]
              };
            }
            return loan;
          })
        }));
      },
      
      deleteLoanPayment: (loanId, paymentId) => {
        set((state) => ({
          loans: state.loans.map((loan) => {
            if (loan.id === loanId) {
              const payment = loan.payments?.find((p) => p.id === paymentId);
              if (!payment) return loan;
              
              return {
                ...loan,
                remainingAmount: loan.remainingAmount + payment.amount,
                payments: loan.payments.filter((p) => p.id !== paymentId)
              };
            }
            return loan;
          })
        }));
      },
      
      withdrawFromLoan: (loanId, amount) => {
        set((state) => ({
          loans: state.loans.map((loan) => {
            if (loan.id === loanId) {
              return {
                ...loan,
                remainingAmount: loan.remainingAmount + amount
              };
            }
            return loan;
          })
        }));
      },
      
      addTransaction: (transaction) => {
        set((state) => ({
          transactions: [...state.transactions, { ...transaction, id: crypto.randomUUID() }]
        }));
      },
      
      updateTransaction: (id, transaction) => {
        set((state) => ({
          transactions: state.transactions.map((t) => 
            t.id === id ? { ...t, ...transaction } : t
          )
        }));
      },
      
      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id)
        }));
      },
      
      importTransactions: (transactions) => {
        set((state) => ({
          transactions: [
            ...state.transactions,
            ...transactions.map((t) => ({ ...t, id: crypto.randomUUID() }))
          ]
        }));
      },
      
      clearTransactions: () => {
        set({ transactions: [] });
      },
      
      undoTransactions: () => {
        const { transactionHistory } = get();
        if (transactionHistory.length === 0) return;
        
        const previousState = transactionHistory[transactionHistory.length - 1];
        set((state) => ({
          transactions: previousState,
          transactionHistory: state.transactionHistory.slice(0, -1)
        }));
      },
      
      addMonthlyIncome: (income) => {
        set((state) => ({
          monthlyIncomes: [...state.monthlyIncomes, income]
        }));
      },
      
      updateMonthlyIncome: (person, date, amount, notes) => {
        set((state) => ({
          monthlyIncomes: state.monthlyIncomes.map((income) =>
            income.person === person && income.date === date
              ? { ...income, amount, notes }
              : income
          )
        }));
      },
      
      deleteMonthlyIncome: (person, date) => {
        set((state) => ({
          monthlyIncomes: state.monthlyIncomes.filter(
            (income) => !(income.person === person && income.date === date)
          )
        }));
      },
      
      getMonthlyIncomes: (month, year) => {
        const { monthlyIncomes } = get();
        return monthlyIncomes.filter((income) => {
          const incomeDate = new Date(income.date);
          return (
            incomeDate.getMonth() === month && 
            incomeDate.getFullYear() === year
          );
        });
      },
      
      addCategory: (category) => {
        set((state) => ({
          categories: [...state.categories, { ...category, id: crypto.randomUUID() }]
        }));
      },
      
      updateCategory: (id, category) => {
        set((state) => ({
          categories: state.categories.map((c) => 
            c.id === id ? { ...c, ...category } : c
          )
        }));
      },
      
      deleteCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id)
        }));
      },
      
      setBudget: (categoryId, amount) => {
        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === categoryId ? { ...c, budget: amount } : c
          )
        }));
      },
      
      getBudgetAlerts: () => {
        const { transactions, categories } = get();
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        const monthlyTransactions = transactions.filter((t) => {
          const transactionDate = new Date(t.date);
          return (
            transactionDate.getMonth() === currentMonth &&
            transactionDate.getFullYear() === currentYear
          );
        });
        
        const categorySpending: Record<string, number> = {};
        monthlyTransactions.forEach((t) => {
          if (!categorySpending[t.category]) {
            categorySpending[t.category] = 0;
          }
          categorySpending[t.category] += t.amount;
        });
        
        return categories
          .filter((c) => c.budget && c.budget > 0)
          .map((category) => {
            const spent = categorySpending[category.name] || 0;
            const percentage = (spent / (category.budget || 0)) * 100;
            
            return {
              category: category.name,
              budget: category.budget || 0,
              spent,
              percentage,
            };
          })
          .filter((alert) => alert.percentage >= 80)
          .sort((a, b) => b.percentage - a.percentage);
      },
      
      setSavingsPercentage: (percentage) => {
        set({ savingsPercentage: percentage });
      },
      
      getMonthlyData: () => {
        const { transactions, monthlyIncomes, savingsPercentage } = get();
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        const monthIncome = monthlyIncomes
          .filter((income) => {
            const incomeDate = new Date(income.date);
            return (
              incomeDate.getMonth() === currentMonth &&
              incomeDate.getFullYear() === currentYear
            );
          })
          .reduce((sum, income) => sum + income.amount, 0);
        
        const expenses = transactions.reduce((sum, t) => sum + t.amount, 0);
        const balance = monthIncome - expenses;
        const savings = monthIncome * (savingsPercentage / 100);
        
        const categoryExpenses: Record<string, number> = {};
        transactions.forEach((t) => {
          if (!categoryExpenses[t.category]) {
            categoryExpenses[t.category] = 0;
          }
          categoryExpenses[t.category] += t.amount;
        });
        
        let topCategory = '';
        let topAmount = 0;
        
        Object.entries(categoryExpenses).forEach(([category, amount]) => {
          if (amount > topAmount) {
            topCategory = category;
            topAmount = amount;
          }
        });
        
        return {
          income: monthIncome,
          expenses,
          balance,
          savings,
          topCategory,
        };
      },
      
      getCategorySummary: () => {
        const { transactions, categories } = get();
        const totalExpenses = transactions.reduce((sum, t) => sum + t.amount, 0);
        
        const categorySummary: Record<string, number> = {};
        transactions.forEach((t) => {
          if (!categorySummary[t.category]) {
            categorySummary[t.category] = 0;
          }
          categorySummary[t.category] += t.amount;
        });
        
        return Object.entries(categorySummary).map(([category, amount]) => {
          const categoryObj = categories.find((c) => c.name === category);
          const budget = categoryObj?.budget || 0;
          
          return {
            category,
            amount,
            color: categoryObj?.color || '#CBD5E1',
            percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
            budget,
            remainingBudget: budget > 0 ? budget - amount : undefined,
          };
        }).sort((a, b) => b.amount - a.amount);
      },
      
      getPersonSummary: () => {
        const { transactions } = get();
        const totalExpenses = transactions.reduce((sum, t) => sum + t.amount, 0);
        
        const yuvalExpenses = transactions
          .filter((t) => t.person === 'yuval')
          .reduce((sum, t) => sum + t.amount, 0);
          
        const bennyExpenses = transactions
          .filter((t) => t.person === 'benny')
          .reduce((sum, t) => sum + t.amount, 0);
          
        return [
          {
            person: 'yuval' as const,
            amount: yuvalExpenses,
            percentage: totalExpenses > 0 ? (yuvalExpenses / totalExpenses) * 100 : 0,
          },
          {
            person: 'benny' as const,
            amount: bennyExpenses,
            percentage: totalExpenses > 0 ? (bennyExpenses / totalExpenses) * 100 : 0,
          },
        ];
      },
      
      addInvestment: (investment) => {
        set((state) => ({
          investments: [...state.investments, { ...investment, id: crypto.randomUUID() }]
        }));
      },
      
      updateInvestment: (id, investment) => {
        set((state) => ({
          investments: state.investments.map((i) =>
            i.id === id ? { ...i, ...investment } : i
          )
        }));
      },
      
      deleteInvestment: (id) => {
        set((state) => ({
          investments: state.investments.filter((i) => i.id !== id)
        }));
      },
      
      getInvestmentSummary: () => {
        const { investments } = get();
        
        const totalInvested = investments.reduce(
          (sum, inv) => sum + inv.initialAmount,
          0
        );
        
        const totalValue = investments.reduce(
          (sum, inv) => sum + inv.currentAmount,
          0
        );
        
        const totalReturn = totalValue - totalInvested;
        
        const returnPercentage =
          totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;
        
        const monthlyContributions = investments.reduce(
          (sum, inv) => sum + (inv.monthlyContribution || 0),
          0
        );
        
        return {
          totalInvested,
          totalValue,
          totalReturn,
          returnPercentage,
          monthlyContributions,
        };
      },
    }),
    {
      name: 'finance-store',
    }
  )
);