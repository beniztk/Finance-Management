/*
  # Insert Initial User Profiles

  1. Insert profiles for both users:
    - Yuval's profile
    - Benny's profile

  2. Security:
    - Use secure UUID generation
    - Reference existing auth.users
*/

-- Insert profiles for existing users
INSERT INTO profiles (id, name, role)
SELECT 
  id,
  CASE 
    WHEN email LIKE 'yuval%' THEN 'יובל'
    WHEN email LIKE 'benny%' THEN 'בני'
  END as name,
  CASE 
    WHEN email LIKE 'yuval%' THEN 'yuval'
    WHEN email LIKE 'benny%' THEN 'benny'
  END as role
FROM auth.users
WHERE 
  email IN ('yuval@family.local', 'benny@family.local')
ON CONFLICT (id) DO UPDATE
SET 
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  updated_at = now();