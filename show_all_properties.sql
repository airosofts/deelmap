-- ============================================
-- Show All Properties (Remove Approval Filter)
-- ============================================
-- Run this in Supabase SQL Editor to show all properties
-- regardless of approval status
-- ============================================

-- Option 1: Disable RLS completely on wholesale_deals
ALTER TABLE wholesale_deals DISABLE ROW LEVEL SECURITY;

-- Option 2: Or keep RLS but allow all reads
-- Uncomment below if you prefer to keep RLS enabled

-- DROP POLICY IF EXISTS "Allow public read access to approved deals" ON wholesale_deals;
-- DROP POLICY IF EXISTS "Enable read access for all users" ON wholesale_deals;
--
-- CREATE POLICY "Allow public read access to all deals" ON wholesale_deals
-- FOR SELECT
-- TO anon, authenticated
-- USING (true);

-- Verify the change
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'wholesale_deals';
