/*
  # Create initial users and profiles

  1. Create Users
    - Create Yuval and Benny in auth.users table
    - Set proper email and password
    - Enable email confirmation

  2. Create Profiles
    - Create corresponding profiles with Hebrew names
    - Link profiles to auth users
*/

-- Create users if they don't exist
DO $$
BEGIN
  -- Create user for Yuval
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email = 'yuval@family.local'
  ) THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'yuval@family.local',
      crypt('318443215', gen_salt('bf')),
      NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "יובל"}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );
  END IF;

  -- Create user for Benny
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email = 'benny@family.local'
  ) THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'benny@family.local',
      crypt('312133036', gen_salt('bf')),
      NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "בני"}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );
  END IF;
END $$;

-- Create corresponding profiles
INSERT INTO profiles (id, name, role)
SELECT 
  id,
  CASE 
    WHEN email = 'yuval@family.local' THEN 'יובל'
    WHEN email = 'benny@family.local' THEN 'בני'
  END as name,
  CASE 
    WHEN email = 'yuval@family.local' THEN 'yuval'
    WHEN email = 'benny@family.local' THEN 'benny'
  END as role
FROM auth.users
WHERE email IN ('yuval@family.local', 'benny@family.local')
ON CONFLICT (id) DO UPDATE
SET 
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  updated_at = now();