-- ============================================
-- QUICK FIX: Disable RLS for Buyer Portal
-- ============================================
-- This disables Row Level Security on the tables
-- needed for the buyer portal to work
-- Run this in Supabase SQL Editor
-- ============================================

-- Disable RLS on conversations (keeps existing policies but bypasses them for service role)
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;

-- Disable RLS on lenders (so buyer can see lender info)
ALTER TABLE lenders DISABLE ROW LEVEL SECURITY;

-- Disable RLS on financing_requests (so joins work properly)
ALTER TABLE financing_requests DISABLE ROW LEVEL SECURITY;

-- Disable RLS on messages (so chat works)
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename IN ('conversations', 'lenders', 'financing_requests', 'messages');

-- You should see rowsecurity = false for all tables
