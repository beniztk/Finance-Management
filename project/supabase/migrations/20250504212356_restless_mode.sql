/*
  # Add Benny's Monthly Income

  1. Changes
    - Insert monthly income record for Benny
    - Amount: 40,000₪
    - Set for current month
    - Link to Benny's user account
*/

-- Insert Benny's monthly income
INSERT INTO monthly_incomes (
  id,
  person,
  amount,
  date,
  notes,
  user_id
)
SELECT
  gen_random_uuid(),
  'benny',
  40000,
  date_trunc('month', current_date),
  'משכורת חודשית',
  id
FROM auth.users
WHERE email = 'benny@family.local';