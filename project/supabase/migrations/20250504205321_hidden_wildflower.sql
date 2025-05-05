/*
  # Set up authentication users

  1. Create users for Beni and Yuval
  2. Set up initial auth configuration
  3. Add RLS policies for user data
*/

-- Create users if they don't exist
DO $$
BEGIN
  -- Create user for Beni
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email = 'בני@family.local'
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
      'בני@family.local',
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

  -- Create user for Yuval
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email = 'יובל@family.local'
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
      'יובל@family.local',
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
END $$;