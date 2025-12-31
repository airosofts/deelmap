-- Migration Script for Special UTM Links Feature
-- Run this script in your Supabase SQL Editor

-- =============================================================================
-- PART 1: Fix upsert_property_view function parameter mismatch
-- =============================================================================

-- Drop the existing function if it exists (will recreate with correct parameters)
DROP FUNCTION IF EXISTS public.upsert_property_view(
  p_property_id uuid,
  p_session_id text,
  p_property_address text,
  p_property_price numeric,
  p_referrer text,
  p_user_agent text,
  p_ip_address inet,
  p_device_type text,
  p_viewport_width integer,
  p_viewport_height integer,
  p_utm_source text,
  p_user_first_name text,
  p_user_last_name text,
  p_user_phone text
);

-- Create the corrected upsert_property_view function with all required parameters
CREATE OR REPLACE FUNCTION public.upsert_property_view(
  p_property_id uuid,
  p_session_id text,
  p_property_address text,
  p_property_price numeric,
  p_referrer text,
  p_user_agent text,
  p_ip_address inet,
  p_device_type text,
  p_viewport_width integer,
  p_viewport_height integer,
  p_utm_source text,
  p_user_id uuid DEFAULT NULL,
  p_user_email text DEFAULT NULL,
  p_user_first_name text DEFAULT NULL,
  p_user_last_name text DEFAULT NULL,
  p_user_phone text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_today date;
BEGIN
  v_today := CURRENT_DATE;

  -- Try to update existing record for this property, session, and day
  UPDATE property_analytics
  SET
    view_end_time = NOW(),
    page_views = page_views + 1,
    updated_at = NOW(),
    user_id = COALESCE(p_user_id, user_id),
    user_email = COALESCE(p_user_email, user_email),
    user_first_name = COALESCE(p_user_first_name, user_first_name),
    user_last_name = COALESCE(p_user_last_name, user_last_name),
    user_phone = COALESCE(p_user_phone, user_phone)
  WHERE
    property_id = p_property_id
    AND session_id = p_session_id
    AND DATE(created_at AT TIME ZONE 'UTC') = v_today;

  -- If no record exists, insert a new one
  IF NOT FOUND THEN
    INSERT INTO property_analytics (
      property_id,
      session_id,
      property_address,
      property_price,
      referrer,
      user_agent,
      ip_address,
      device_type,
      viewport_width,
      viewport_height,
      utm_source,
      user_id,
      user_email,
      user_first_name,
      user_last_name,
      user_phone,
      view_start_time,
      view_end_time,
      created_at,
      updated_at
    ) VALUES (
      p_property_id,
      p_session_id,
      p_property_address,
      p_property_price,
      p_referrer,
      p_user_agent,
      p_ip_address,
      p_device_type,
      p_viewport_width,
      p_viewport_height,
      p_utm_source,
      p_user_id,
      p_user_email,
      p_user_first_name,
      p_user_last_name,
      p_user_phone,
      NOW(),
      NOW(),
      NOW(),
      NOW()
    );
  END IF;
END;
$$;

-- =============================================================================
-- PART 2: Alter property_analytics table for better tracking
-- =============================================================================

-- Add column to track if user is viewing via special link (non-logged-in access)
ALTER TABLE public.property_analytics
ADD COLUMN IF NOT EXISTS is_special_link_access boolean DEFAULT false;

-- Add column to track the specific UTM code used
ALTER TABLE public.property_analytics
ADD COLUMN IF NOT EXISTS utm_code text NULL;

-- Add index for special link tracking queries
CREATE INDEX IF NOT EXISTS idx_property_analytics_special_link
ON public.property_analytics(is_special_link_access)
WHERE is_special_link_access = true;

-- Add index for utm_code
CREATE INDEX IF NOT EXISTS idx_property_analytics_utm_code
ON public.property_analytics(utm_code)
WHERE utm_code IS NOT NULL;

-- =============================================================================
-- PART 3: Enhance UTM links table
-- =============================================================================

-- Add column to track if this is a special access link (bypasses login)
ALTER TABLE public.utm_links
ADD COLUMN IF NOT EXISTS is_special_access boolean DEFAULT false;

-- Add column for descriptive label
ALTER TABLE public.utm_links
ADD COLUMN IF NOT EXISTS label text NULL;

-- Add index for special access links
CREATE INDEX IF NOT EXISTS idx_utm_links_special_access
ON public.utm_links(is_special_access)
WHERE is_special_access = true;

-- =============================================================================
-- PART 4: Create function to validate special link access
-- =============================================================================

-- Function to check if a UTM code is valid for special access
CREATE OR REPLACE FUNCTION public.validate_special_link_access(
  p_property_id uuid,
  p_utm_code text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_is_valid boolean;
BEGIN
  SELECT EXISTS(
    SELECT 1
    FROM utm_links
    WHERE property_id = p_property_id
      AND utm_code = p_utm_code
      AND is_special_access = true
  ) INTO v_is_valid;

  RETURN v_is_valid;
END;
$$;

-- =============================================================================
-- PART 5: Create updated upsert function with special link tracking
-- =============================================================================

CREATE OR REPLACE FUNCTION public.upsert_property_view_with_special_access(
  p_property_id uuid,
  p_session_id text,
  p_property_address text,
  p_property_price numeric,
  p_referrer text,
  p_user_agent text,
  p_ip_address inet,
  p_device_type text,
  p_viewport_width integer,
  p_viewport_height integer,
  p_utm_source text,
  p_utm_code text DEFAULT NULL,
  p_is_special_link boolean DEFAULT false,
  p_user_id uuid DEFAULT NULL,
  p_user_email text DEFAULT NULL,
  p_user_first_name text DEFAULT NULL,
  p_user_last_name text DEFAULT NULL,
  p_user_phone text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  v_today date;
BEGIN
  v_today := CURRENT_DATE;

  -- Try to update existing record for this property, session, and day
  UPDATE property_analytics
  SET
    view_end_time = NOW(),
    page_views = page_views + 1,
    updated_at = NOW(),
    user_id = COALESCE(p_user_id, user_id),
    user_email = COALESCE(p_user_email, user_email),
    user_first_name = COALESCE(p_user_first_name, user_first_name),
    user_last_name = COALESCE(p_user_last_name, user_last_name),
    user_phone = COALESCE(p_user_phone, user_phone),
    is_special_link_access = COALESCE(p_is_special_link, is_special_link_access),
    utm_code = COALESCE(p_utm_code, utm_code)
  WHERE
    property_id = p_property_id
    AND session_id = p_session_id
    AND DATE(created_at AT TIME ZONE 'UTC') = v_today;

  -- If no record exists, insert a new one
  IF NOT FOUND THEN
    INSERT INTO property_analytics (
      property_id,
      session_id,
      property_address,
      property_price,
      referrer,
      user_agent,
      ip_address,
      device_type,
      viewport_width,
      viewport_height,
      utm_source,
      utm_code,
      is_special_link_access,
      user_id,
      user_email,
      user_first_name,
      user_last_name,
      user_phone,
      view_start_time,
      view_end_time,
      created_at,
      updated_at
    ) VALUES (
      p_property_id,
      p_session_id,
      p_property_address,
      p_property_price,
      p_referrer,
      p_user_agent,
      p_ip_address,
      p_device_type,
      p_viewport_width,
      p_viewport_height,
      p_utm_source,
      p_utm_code,
      p_is_special_link,
      p_user_id,
      p_user_email,
      p_user_first_name,
      p_user_last_name,
      p_user_phone,
      NOW(),
      NOW(),
      NOW(),
      NOW()
    );
  END IF;
END;
$$;

-- =============================================================================
-- PART 6: Insert sample special link for testing (optional)
-- =============================================================================

-- Uncomment and modify this if you want to insert a test special link
-- Replace the property_id with an actual property UUID from your properties table
/*
INSERT INTO utm_links (property_id, platform, utm_code, is_special_access, label, clicks)
VALUES (
  'YOUR-PROPERTY-UUID-HERE',
  'special',
  'sl',
  true,
  'Special Access Link - No Login Required',
  0
)
ON CONFLICT (property_id, platform)
DO UPDATE SET
  is_special_access = true,
  label = 'Special Access Link - No Login Required',
  updated_at = NOW();
*/

-- =============================================================================
-- PART 7: Create view for tracking special link analytics
-- =============================================================================

CREATE OR REPLACE VIEW public.special_link_analytics AS
SELECT
  pa.property_id,
  p.address as property_address,
  pa.utm_code,
  pa.session_id,
  pa.user_email,
  pa.user_first_name,
  pa.user_last_name,
  pa.view_start_time,
  pa.view_end_time,
  pa.duration_seconds,
  pa.page_views,
  pa.images_viewed,
  pa.clicked_inquiry,
  pa.clicked_inspection_report,
  pa.clicked_more_photos,
  pa.device_type,
  pa.referrer,
  pa.created_at
FROM property_analytics pa
LEFT JOIN properties p ON pa.property_id = p.id
WHERE pa.is_special_link_access = true
ORDER BY pa.created_at DESC;

-- =============================================================================
-- VERIFICATION QUERIES (Optional - for testing)
-- =============================================================================

-- Check if columns were added successfully
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'property_analytics' AND column_name IN ('is_special_link_access', 'utm_code');

-- Check if function exists
-- SELECT routine_name FROM information_schema.routines
-- WHERE routine_name = 'upsert_property_view' AND routine_schema = 'public';

-- =============================================================================
-- NOTES:
-- =============================================================================
-- 1. This script adds support for tracking users who access properties via special links
-- 2. The upsert_property_view function now includes p_user_email parameter to fix the error
-- 3. New columns allow tracking of special link access without dropping any tables
-- 4. All changes are backward compatible with existing data
-- 5. No Row Level Security (RLS) commands are included as requested
-- =============================================================================
