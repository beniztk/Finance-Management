-- Fix auth issues and ensure proper schema setup
DO $$
DECLARE
  yuval_id uuid;
  benny_id uuid;
BEGIN
  -- Clean up existing data first
  DELETE FROM auth.users WHERE email IN ('yuval@family.local', 'benny@family.local');
  DELETE FROM profiles WHERE role IN ('yuval', 'benny');
  
  -- Create Yuval's user account
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
    updated_at
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'yuval@family.local',
    crypt('318443215', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"יובל","role":"yuval"}',
    NOW(),
    NOW()
  )
  RETURNING id INTO yuval_id;

  -- Create Benny's user account
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
    updated_at
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'benny@family.local',
    crypt('312133036', gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"בני","role":"benny"}',
    NOW(),
    NOW()
  )
  RETURNING id INTO benny_id;

  -- Create profiles
  INSERT INTO profiles (id, name, role)
  VALUES 
    (yuval_id, 'יובל', 'yuval'),
    (benny_id, 'בני', 'benny');

  -- Ensure RLS is enabled
  ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

  -- Update or create RLS policies
  DROP POLICY IF EXISTS "Users can manage their own profile" ON profiles;
  CREATE POLICY "Users can manage their own profile"
    ON profiles FOR ALL
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
END $$;