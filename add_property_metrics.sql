-- Migration to add property metrics fields
-- Run this in your Supabase SQL Editor

-- Add new columns to properties table for investment metrics
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS gross_yield NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS cap_rate NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS cash_on_cash NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS price_per_sqft NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS year_built INTEGER,
ADD COLUMN IF NOT EXISTS monthly_rent NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS annual_rent NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS estimated_expenses NUMERIC(10,2);

-- Add comments to describe the columns
COMMENT ON COLUMN properties.gross_yield IS 'Gross rental yield percentage (annual rent / purchase price * 100)';
COMMENT ON COLUMN properties.cap_rate IS 'Capitalization rate percentage ((annual rent - expenses) / purchase price * 100)';
COMMENT ON COLUMN properties.cash_on_cash IS 'Cash on cash return percentage (annual cash flow / total cash invested * 100)';
COMMENT ON COLUMN properties.price_per_sqft IS 'Price per square foot';
COMMENT ON COLUMN properties.year_built IS 'Year the property was built';
COMMENT ON COLUMN properties.monthly_rent IS 'Expected monthly rental income';
COMMENT ON COLUMN properties.annual_rent IS 'Expected annual rental income';
COMMENT ON COLUMN properties.estimated_expenses IS 'Estimated annual operating expenses';

-- Create an index on metrics for better query performance
CREATE INDEX IF NOT EXISTS idx_properties_gross_yield ON properties(gross_yield);
CREATE INDEX IF NOT EXISTS idx_properties_cap_rate ON properties(cap_rate);
CREATE INDEX IF NOT EXISTS idx_properties_cash_on_cash ON properties(cash_on_cash);
CREATE INDEX IF NOT EXISTS idx_properties_year_built ON properties(year_built);

-- Optional: Update existing properties with calculated metrics if you have the data
-- You can uncomment and modify this to calculate metrics for existing properties
/*
UPDATE properties
SET
  price_per_sqft = CASE
    WHEN floor_area > 0 THEN price / floor_area
    ELSE NULL
  END,
  gross_yield = CASE
    WHEN price > 0 AND annual_rent IS NOT NULL THEN (annual_rent / price * 100)::NUMERIC(5,2)
    ELSE NULL
  END
WHERE status = 'active';
*/
