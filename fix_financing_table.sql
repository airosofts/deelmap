-- ============================================
-- Fix financing_requests table to match users table
-- ============================================
-- The users table uses SERIAL (integer) for id,
-- but financing_requests was created with UUID
-- This script fixes the mismatch
-- ============================================

-- Step 1: Drop the existing foreign key constraint
ALTER TABLE public.financing_requests
DROP CONSTRAINT IF EXISTS financing_requests_user_id_fkey;

-- Step 2: Drop the existing table (if you haven't added real data yet)
-- If you have data, use the migration approach below instead
DROP TABLE IF EXISTS public.financing_requests;

-- Step 3: Recreate the table with correct data types
CREATE TABLE public.financing_requests (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  property_type VARCHAR(50) NOT NULL,
  transaction_type VARCHAR(50) NOT NULL,
  loan_amount NUMERIC(15, 2) NOT NULL,
  credit_score VARCHAR(50) NOT NULL,
  comments TEXT NULL,
  monday_item_id VARCHAR(50) NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT financing_requests_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES users(id)
    ON DELETE CASCADE
);

-- Step 4: Recreate indexes
CREATE INDEX IF NOT EXISTS idx_financing_requests_user_id
  ON public.financing_requests(user_id);

CREATE INDEX IF NOT EXISTS idx_financing_requests_email
  ON public.financing_requests(email);

CREATE INDEX IF NOT EXISTS idx_financing_requests_created_at
  ON public.financing_requests(created_at DESC);

-- Step 5: Enable Row Level Security
ALTER TABLE financing_requests ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS Policies
-- Policy: Users can view their own financing requests
CREATE POLICY "Users can view their own financing requests"
  ON financing_requests
  FOR SELECT
  USING (user_id = (SELECT id FROM users WHERE id = user_id));

-- Policy: Users can insert their own financing requests
CREATE POLICY "Users can insert their own financing requests"
  ON financing_requests
  FOR INSERT
  WITH CHECK (user_id = (SELECT id FROM users WHERE id = user_id));

-- Policy: Users can update their own financing requests
CREATE POLICY "Users can update their own financing requests"
  ON financing_requests
  FOR UPDATE
  USING (user_id = (SELECT id FROM users WHERE id = user_id))
  WITH CHECK (user_id = (SELECT id FROM users WHERE id = user_id));

-- Step 7: Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_financing_requests_updated_at ON financing_requests;
CREATE TRIGGER update_financing_requests_updated_at
  BEFORE UPDATE ON financing_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ALTERNATIVE: If you have existing data and need to migrate
-- ============================================
-- Use this approach instead if you have real data in the table:
/*
-- 1. Add a new column with integer type
ALTER TABLE public.financing_requests
ADD COLUMN user_id_new INTEGER;

-- 2. Drop the old UUID column
ALTER TABLE public.financing_requests
DROP COLUMN user_id;

-- 3. Rename the new column
ALTER TABLE public.financing_requests
RENAME COLUMN user_id_new TO user_id;

-- 4. Add the foreign key constraint
ALTER TABLE public.financing_requests
ADD CONSTRAINT financing_requests_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE CASCADE;

-- 5. Recreate the index
DROP INDEX IF EXISTS idx_financing_requests_user_id;
CREATE INDEX idx_financing_requests_user_id
ON public.financing_requests(user_id);
*/

-- ============================================
-- Verification Query
-- ============================================
-- Run this to verify the table structure
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'financing_requests';
