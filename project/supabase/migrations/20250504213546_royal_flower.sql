/*
  # Initial Schema Setup

  1. Tables
    - profiles
    - transactions
    - categories
    - monthly_incomes
    - investments
    - loans
    - loan_payments

  2. Security
    - Enable RLS
    - Add policies for authenticated users
    - Add triggers for updated_at
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('yuval', 'benny')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  amount numeric NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  person text NOT NULL CHECK (person IN ('yuval', 'benny')),
  source text NOT NULL CHECK (source IN ('bit', 'bank_transfer', 'credit_card', 'cash', 'rent', 'other')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text NOT NULL,
  keywords text[] DEFAULT '{}',
  budget numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create monthly_incomes table
CREATE TABLE IF NOT EXISTS monthly_incomes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  person text NOT NULL CHECK (person IN ('yuval', 'benny')),
  amount numeric NOT NULL,
  date date NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create investments table
CREATE TABLE IF NOT EXISTS investments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('stocks', 'bonds', 'savings', 'pension', 'property', 'other')),
  initial_amount numeric NOT NULL,
  current_amount numeric NOT NULL,
  start_date date NOT NULL,
  monthly_contribution numeric DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create loans table
CREATE TABLE IF NOT EXISTS loans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  initial_amount numeric NOT NULL,
  remaining_amount numeric NOT NULL,
  start_date date NOT NULL,
  lender text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create loan_payments table
CREATE TABLE IF NOT EXISTS loan_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  loan_id uuid REFERENCES loans(id) ON DELETE CASCADE,
  date date NOT NULL,
  amount numeric NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
DO $$ 
BEGIN
  ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
  ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
  ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
  ALTER TABLE monthly_incomes ENABLE ROW LEVEL SECURITY;
  ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
  ALTER TABLE loans ENABLE ROW LEVEL SECURITY;
  ALTER TABLE loan_payments ENABLE ROW LEVEL SECURITY;
END $$;

-- Create policies safely
DO $$ 
BEGIN
  -- Profiles policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can manage their own profile'
  ) THEN
    CREATE POLICY "Users can manage their own profile"
      ON profiles FOR ALL TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;

  -- Transactions policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'transactions' AND policyname = 'Users can manage their own transactions'
  ) THEN
    CREATE POLICY "Users can manage their own transactions"
      ON transactions FOR ALL TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Categories policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Users can manage their own categories'
  ) THEN
    CREATE POLICY "Users can manage their own categories"
      ON categories FOR ALL TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Monthly incomes policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'monthly_incomes' AND policyname = 'Users can manage their own monthly incomes'
  ) THEN
    CREATE POLICY "Users can manage their own monthly incomes"
      ON monthly_incomes FOR ALL TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Investments policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'investments' AND policyname = 'Users can manage their own investments'
  ) THEN
    CREATE POLICY "Users can manage their own investments"
      ON investments FOR ALL TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Loans policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'loans' AND policyname = 'Users can manage their own loans'
  ) THEN
    CREATE POLICY "Users can manage their own loans"
      ON loans FOR ALL TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Loan payments policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'loan_payments' AND policyname = 'Users can manage their own loan payments'
  ) THEN
    CREATE POLICY "Users can manage their own loan payments"
      ON loan_payments FOR ALL TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers safely
DO $$
BEGIN
  -- Profiles trigger
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at'
  ) THEN
    CREATE TRIGGER update_profiles_updated_at
      BEFORE UPDATE ON profiles
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;

  -- Transactions trigger
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_transactions_updated_at'
  ) THEN
    CREATE TRIGGER update_transactions_updated_at
      BEFORE UPDATE ON transactions
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;

  -- Categories trigger
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_categories_updated_at'
  ) THEN
    CREATE TRIGGER update_categories_updated_at
      BEFORE UPDATE ON categories
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;

  -- Monthly incomes trigger
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_monthly_incomes_updated_at'
  ) THEN
    CREATE TRIGGER update_monthly_incomes_updated_at
      BEFORE UPDATE ON monthly_incomes
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;

  -- Investments trigger
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_investments_updated_at'
  ) THEN
    CREATE TRIGGER update_investments_updated_at
      BEFORE UPDATE ON investments
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;

  -- Loans trigger
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_loans_updated_at'
  ) THEN
    CREATE TRIGGER update_loans_updated_at
      BEFORE UPDATE ON loans
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;

  -- Loan payments trigger
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_loan_payments_updated_at'
  ) THEN
    CREATE TRIGGER update_loan_payments_updated_at
      BEFORE UPDATE ON loan_payments
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;