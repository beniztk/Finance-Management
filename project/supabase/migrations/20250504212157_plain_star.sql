/*
  # Add monthly income for Benny

  1. Add monthly income record for Benny
    - Amount: 40000
    - Person: benny
    - Date: Current month
*/

INSERT INTO monthly_incomes (
  person,
  amount,
  date,
  user_id
)
SELECT
  'benny',
  40000,
  date_trunc('month', current_date),
  id
FROM auth.users
WHERE email = 'benny@family.local';