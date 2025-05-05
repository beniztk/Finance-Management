export interface Transaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  category: string;
  person: 'yuval' | 'benny';
  source: 'bit' | 'bank_transfer' | 'credit_card' | 'cash' | 'rent' | 'other';
  notes: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  keywords: string[];
  budget?: number;
}

export interface MonthlyIncome {
  person: 'yuval' | 'benny';
  amount: number;
  date: string;
  notes?: string;
}

export interface MonthlyData {
  income: number;
  expenses: number;
  balance: number;
  savings: number;
  topCategory: string;
}

export interface CategorySummary {
  category: string;
  amount: number;
  color: string;
  percentage: number;
  budget?: number;
  remainingBudget?: number;
}

export interface PersonSummary {
  person: 'yuval' | 'benny';
  amount: number;
  percentage: number;
}

export interface BudgetAlert {
  category: string;
  budget: number;
  spent: number;
  percentage: number;
}

export interface LoanPayment {
  id: string;
  date: string;
  amount: number;
  notes?: string;
}

export interface Loan {
  id: string;
  initialAmount: number;
  remainingAmount: number;
  payments: LoanPayment[];
  startDate: string;
  lender: string;
}