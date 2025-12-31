-- ============================================
-- Fix Conversations Relationships
-- ============================================
-- This ensures proper foreign key relationships
-- and fixes any RLS issues preventing data from loading
-- ============================================

-- Step 1: Verify current foreign key constraints
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name = 'conversations';

-- Step 2: Check RLS policies on conversations table
SELECT * FROM pg_policies WHERE tablename = 'conversations';

-- Step 3: Check RLS policies on lenders table
SELECT * FROM pg_policies WHERE tablename = 'lenders';

-- Step 4: Check RLS policies on financing_requests table
SELECT * FROM pg_policies WHERE tablename = 'financing_requests';

-- Step 5: Disable RLS temporarily for testing (re-enable after confirming it works)
-- WARNING: Only do this in development, not production!
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE lenders DISABLE ROW LEVEL SECURITY;
ALTER TABLE financing_requests DISABLE ROW LEVEL SECURITY;

-- Step 6: Test query to see if it returns data now
SELECT
    c.*,
    l.id as lender_id_check,
    l.business_name,
    l.email as lender_email,
    fr.id as fr_id_check,
    fr.property_type,
    fr.loan_amount
FROM conversations c
LEFT JOIN lenders l ON c.lender_id = l.id
LEFT JOIN financing_requests fr ON c.financing_request_id = fr.id
WHERE c.user_id = 639941955  -- Replace with your hashed email ID
ORDER BY c.last_message_at DESC;

-- Step 7: If the above query returns data, the issue is RLS
-- Create proper RLS policies that allow service role to read all data

-- Policy to allow service role full access to conversations
CREATE POLICY "Service role can access all conversations"
ON conversations
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Policy to allow service role full access to lenders
CREATE POLICY "Service role can access all lenders"
ON lenders
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Policy to allow service role full access to financing_requests
CREATE POLICY "Service role can access all financing_requests"
ON financing_requests
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Step 8: Re-enable RLS with proper policies
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE lenders ENABLE ROW LEVEL SECURITY;
ALTER TABLE financing_requests ENABLE ROW LEVEL SECURITY;

-- Step 9: Verify the relationships are working
SELECT
    'Conversations' as table_name,
    COUNT(*) as total_rows,
    COUNT(DISTINCT lender_id) as unique_lenders,
    COUNT(DISTINCT financing_request_id) as unique_requests
FROM conversations;

SELECT
    'Lenders' as table_name,
    COUNT(*) as total_rows
FROM lenders;

SELECT
    'Financing Requests' as table_name,
    COUNT(*) as total_rows
FROM financing_requests;
