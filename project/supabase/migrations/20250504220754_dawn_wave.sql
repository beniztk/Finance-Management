-- Drop and recreate users with correct credentials
DO $$
DECLARE
  yuval_id uuid;
  benny_id uuid;
BEGIN
  -- First, ensure we're working with a clean slate for these specific users
  DELETE FROM auth.users WHERE email IN ('yuval@family.local', 'benny@family.local');
  
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

  -- Create profiles for both users
  INSERT INTO profiles (id, name, role)
  VALUES 
    (yuval_id, 'יובל', 'yuval'),
    (benny_id, 'בני', 'benny')
  ON CONFLICT (id) DO UPDATE
  SET 
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    updated_at = now();

  -- Add initial monthly income for Benny
  INSERT INTO monthly_incomes (
    id,
    user_id,
    person,
    amount,
    date,
    notes
  )
  VALUES (
    gen_random_uuid(),
    benny_id,
    'benny',
    40000,
    date_trunc('month', current_date),
    'משכורת חודשית'
  );

  -- Add some default categories for both users
  INSERT INTO categories (
    id,
    user_id,
    name,
    color,
    keywords,
    budget
  )
  SELECT
    gen_random_uuid(),
    user_id,
    name,
    color,
    keywords,
    budget
  FROM (
    SELECT yuval_id as user_id, 'מזון' as name, '#EF4444' as color, ARRAY['סופר', 'מסעדה', 'קפה'] as keywords, 3000 as budget
    UNION ALL
    SELECT yuval_id, 'תחבורה', '#F59E0B', ARRAY['דלק', 'חניה', 'רכב'], 1500
    UNION ALL
    SELECT benny_id, 'מזון', '#EF4444', ARRAY['סופר', 'מסעדה', 'קפה'], 3000
    UNION ALL
    SELECT benny_id, 'תחבורה', '#F59E0B', ARRAY['דלק', 'חניה', 'רכב'], 1500
  ) t;
END $$;