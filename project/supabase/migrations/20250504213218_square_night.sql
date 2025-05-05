/*
  # Set up profiles and audit logging

  1. New Tables
    - `profiles` - User profile information
    - `audit_log` - Track all data changes

  2. Security
    - Enable RLS on both tables
    - Add policies for user data access
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('yuval', 'benny')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create audit log table
CREATE TABLE IF NOT EXISTS audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  operation text NOT NULL,
  old_data jsonb,
  new_data jsonb,
  changed_by uuid REFERENCES auth.users(id),
  changed_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read own audit logs"
  ON audit_log
  FOR SELECT
  TO authenticated
  USING (changed_by = auth.uid());

-- Create trigger functions
DO $$ 
BEGIN
  -- Create updated_at trigger function
  CREATE OR REPLACE FUNCTION update_updated_at()
  RETURNS TRIGGER AS $func$
  BEGIN
    NEW.updated_at = now();
    RETURN NEW;
  END;
  $func$ LANGUAGE plpgsql;

  -- Create audit log trigger function
  CREATE OR REPLACE FUNCTION log_changes()
  RETURNS TRIGGER AS $func$
  BEGIN
    INSERT INTO audit_log (
      table_name,
      record_id,
      operation,
      old_data,
      new_data,
      changed_by
    ) VALUES (
      TG_TABLE_NAME,
      COALESCE(NEW.id, OLD.id),
      TG_OP,
      CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD)::jsonb ELSE NULL END,
      CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW)::jsonb ELSE NULL END,
      auth.uid()
    );
    RETURN COALESCE(NEW, OLD);
  END;
  $func$ LANGUAGE plpgsql;
END $$;

-- Add triggers
DO $$ 
BEGIN
  -- Drop existing triggers if they exist
  DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
  DROP TRIGGER IF EXISTS log_profiles_changes ON profiles;

  -- Create new triggers
  CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

  CREATE TRIGGER log_profiles_changes
    AFTER INSERT OR UPDATE OR DELETE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION log_changes();
END $$;