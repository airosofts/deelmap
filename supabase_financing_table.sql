-- ============================================
-- Financing Requests Table Setup for Supabase
-- ============================================
-- This script creates the financing_requests table
-- with proper indexes and Row Level Security (RLS) policies
-- ============================================

-- Create financing_requests table
CREATE TABLE IF NOT EXISTS financing_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  property_type VARCHAR(50) NOT NULL,
  transaction_type VARCHAR(50) NOT NULL,
  loan_amount DECIMAL(15, 2) NOT NULL,
  credit_score VARCHAR(50) NOT NULL,
  comments TEXT,
  monday_item_id VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- Create Indexes for Performance
-- ============================================

-- Index on user_id for faster user-specific queries
CREATE INDEX IF NOT EXISTS idx_financing_requests_user_id
  ON financing_requests(user_id);

-- Index on email for faster email-based queries
CREATE INDEX IF NOT EXISTS idx_financing_requests_email
  ON financing_requests(email);

-- Index on created_at for faster sorting by date
CREATE INDEX IF NOT EXISTS idx_financing_requests_created_at
  ON financing_requests(created_at DESC);

-- ============================================
-- Enable Row Level Security (RLS)
-- ============================================

ALTER TABLE financing_requests ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies
-- ============================================

-- Policy: Users can view their own financing requests
CREATE POLICY "Users can view their own financing requests"
  ON financing_requests
  FOR SELECT
  USING (auth.uid() = user_id OR email = (SELECT email FROM users WHERE id = auth.uid()));

-- Policy: Users can insert their own financing requests
CREATE POLICY "Users can insert their own financing requests"
  ON financing_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR email = (SELECT email FROM users WHERE id = auth.uid()));

-- Policy: Users can update their own financing requests
CREATE POLICY "Users can update their own financing requests"
  ON financing_requests
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Updated At Trigger (Optional but Recommended)
-- ============================================

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function
DROP TRIGGER IF EXISTS update_financing_requests_updated_at ON financing_requests;
CREATE TRIGGER update_financing_requests_updated_at
  BEFORE UPDATE ON financing_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Verification Query
-- ============================================

-- Run this to verify the table was created successfully
-- SELECT * FROM financing_requests LIMIT 1;

-- ============================================
-- END OF SCRIPT
-- ============================================
