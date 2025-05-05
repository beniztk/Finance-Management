/*
  # Initial Schema Setup

  1. New Tables
    - `transactions`
    - `categories`
    - `monthly_incomes`
    - `loans`
    - `loan_payments`
    - `investments`

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  amount numeric NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  person text NOT NULL CHECK (person IN ('yuval', 'benny')),
  source text NOT NULL CHECK (source IN ('bit', 'bank_transfer', 'credit_card', 'cash', 'rent', 'other')),
  notes text,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text NOT NULL,
  keywords text[] NOT NULL DEFAULT '{}',
  budget numeric DEFAULT 0,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create monthly_incomes table
CREATE TABLE IF NOT EXISTS monthly_incomes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person text NOT NULL CHECK (person IN ('yuval', 'benny')),
  amount numeric NOT NULL,
  date date NOT NULL,
  notes text,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create loans table
CREATE TABLE IF NOT EXISTS loans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  initial_amount numeric NOT NULL,
  remaining_amount numeric NOT NULL,
  start_date date NOT NULL,
  lender text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create loan_payments table
CREATE TABLE IF NOT EXISTS loan_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id uuid REFERENCES loans(id) ON DELETE CASCADE,
  date date NOT NULL,
  amount numeric NOT NULL,
  notes text,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create investments table
CREATE TABLE IF NOT EXISTS investments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('stocks', 'bonds', 'savings', 'pension', 'property', 'other')),
  initial_amount numeric NOT NULL,
  current_amount numeric NOT NULL,
  start_date date NOT NULL,
  monthly_contribution numeric DEFAULT 0,
  notes text,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security
DO $$ 
BEGIN
  ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
  ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
  ALTER TABLE monthly_incomes ENABLE ROW LEVEL SECURITY;
  ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
  ALTER TABLE loan_payments ENABLE ROW LEVEL SECURITY;
  ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
END $$;

-- Create policies safely
DO $$ 
BEGIN
  -- Transactions policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Users can manage their own transactions'
  ) THEN
    CREATE POLICY "Users can manage their own transactions"
      ON transactions
      USING (auth.uid() = user_id);
  END IF;

  -- Categories policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Users can manage their own categories'
  ) THEN
    CREATE POLICY "Users can manage their own categories"
      ON categories
      USING (auth.uid() = user_id);
  END IF;

  -- Monthly incomes policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'monthly_incomes' AND policyname = 'Users can manage their own monthly incomes'
  ) THEN
    CREATE POLICY "Users can manage their own monthly incomes"
      ON monthly_incomes
      USING (auth.uid() = user_id);
  END IF;

  -- Loans policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'loans' AND policyname = 'Users can manage their own loans'
  ) THEN
    CREATE POLICY "Users can manage their own loans"
      ON loans
      USING (auth.uid() = user_id);
  END IF;

  -- Loan payments policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'loan_payments' AND policyname = 'Users can manage their own loan payments'
  ) THEN
    CREATE POLICY "Users can manage their own loan payments"
      ON loan_payments
      USING (auth.uid() = user_id);
  END IF;

  -- Investments policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'investments' AND policyname = 'Users can manage their own investments'
  ) THEN
    CREATE POLICY "Users can manage their own investments"
      ON investments
      USING (auth.uid() = user_id);
  END IF;
END $$;