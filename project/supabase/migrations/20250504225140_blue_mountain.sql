/*
  # Create initial users and profiles

  1. Create users for Yuval and Benny
  2. Set up corresponding profile records
  3. Ensure proper role assignments
*/

-- Create users if they don't exist
DO $$
BEGIN
  -- Create user for Yuval
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email = 'yuval@example.com'
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
      'yuval@example.com',
      crypt('yuval123456', gen_salt('bf')),
      NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "yuval"}',
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
    WHERE email = 'benny@example.com'
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
      'benny@example.com',
      crypt('benny123456', gen_salt('bf')),
      NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "benny"}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );
  END IF;
END $$;

-- Insert corresponding profile records
INSERT INTO public.profiles (id, name, role)
SELECT 
  id,
  CASE 
    WHEN email = 'yuval@example.com' THEN 'yuval'
    WHEN email = 'benny@example.com' THEN 'benny'
  END as name,
  CASE 
    WHEN email = 'yuval@example.com' THEN 'yuval'
    WHEN email = 'benny@example.com' THEN 'benny'
  END as role
FROM auth.users
WHERE email IN ('yuval@example.com', 'benny@example.com')
ON CONFLICT (id) DO NOTHING;