-- ============================================
-- PERMISSIONS FOR PUBLIC ACCESS (No Auth)
-- Run this AFTER the initial schema
-- ============================================

-- Step 1: Disable RLS on all tables
ALTER TABLE accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE budgets DISABLE ROW LEVEL SECURITY;
ALTER TABLE debts DISABLE ROW LEVEL SECURITY;
ALTER TABLE debt_payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE savings DISABLE ROW LEVEL SECURITY;
ALTER TABLE savings_contributions DISABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE activities DISABLE ROW LEVEL SECURITY;

-- Step 2: Grant all permissions to anon role
GRANT ALL ON accounts TO anon;
GRANT ALL ON transactions TO anon;
GRANT ALL ON budgets TO anon;
GRANT ALL ON debts TO anon;
GRANT ALL ON debt_payments TO anon;
GRANT ALL ON savings TO anon;
GRANT ALL ON savings_contributions TO anon;
GRANT ALL ON recurring_transactions TO anon;
GRANT ALL ON activities TO anon;

-- Step 3: Grant all permissions to authenticated role
GRANT ALL ON accounts TO authenticated;
GRANT ALL ON transactions TO authenticated;
GRANT ALL ON budgets TO authenticated;
GRANT ALL ON debts TO authenticated;
GRANT ALL ON debt_payments TO authenticated;
GRANT ALL ON savings TO authenticated;
GRANT ALL ON savings_contributions TO authenticated;
GRANT ALL ON recurring_transactions TO authenticated;
GRANT ALL ON activities TO authenticated;

-- Step 4: Grant usage on sequences (for auto-generated IDs)
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

