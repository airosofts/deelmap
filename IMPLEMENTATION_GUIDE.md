# Special UTM Links Feature - Implementation Guide

## Overview
This implementation adds support for special UTM links (`?u=sl`) that allow non-logged-in users to view individual property pages with limited access, solving the issue where some users find it difficult to login.

## What's Been Implemented

### 1. SQL Migration Script
**File:** `migration.sql`

**What to do:**
1. Open your Supabase SQL Editor
2. Copy and paste the entire contents of `migration.sql`
3. Execute the script
4. Verify successful execution

**What the migration does:**
- Fixes the `upsert_property_view` function parameter mismatch error
- Adds new columns to `property_analytics` table:
  - `is_special_link_access` (boolean) - Tracks if user accessed via special link
  - `utm_code` (text) - Stores the specific UTM code used
- Adds new columns to `utm_links` table:
  - `is_special_access` (boolean) - Marks which UTM links bypass login
  - `label` (text) - Descriptive label for the link
- Creates new function `upsert_property_view_with_special_access` for enhanced tracking
- Creates `special_link_analytics` view for easy reporting
- All changes are backward compatible - no data loss

### 2. Feature Restrictions for Special Link Users

**When user visits with `?u=sl` parameter:**

✅ **Allowed:**
- View the specific property page they visited
- See first 10 photos
- View property details, description, repairs
- See map location
- Share the property

❌ **Restricted:**
- Cannot access marketplace (no "See All Deals" link)
- Cannot request inspection reports (shows "Join Ableman" prompt)
- Cannot view more than 10 photos (shows "Join Ableman" prompt)
- Cannot submit inquiries (shows "Join Ableman" prompt)

### 3. Files Modified/Created

#### New Files:
1. **`migration.sql`** - Database migration script
2. **`lib/specialLink.js`** - Utility functions for special link detection and access control
3. **`IMPLEMENTATION_GUIDE.md`** - This documentation

#### Modified Files:
1. **`components/property/PropertyDetail.js`**
   - Added special link detection
   - Conditional marketplace link visibility
   - Updated auth gate overlay logic
   - Modified handlers for inspection/inquiry/photos

2. **`components/property/PropertyImageSlider.js`**
   - Limits photos to 10 for special link users
   - Shows "X More Photos Available" overlay on last photo
   - Displays "Join Ableman" modal when user tries to view more

3. **`components/property/PropertyImageSliderMobile.js`**
   - Same photo limiting as desktop version
   - Mobile-optimized "Join Ableman" prompt

4. **`hooks/usePropertyAnalytics.js`**
   - Tracks special link access
   - Sends `utmCode` and `isSpecialLink` flags to analytics

5. **`app/api/analytics/property-tracking/route.js`**
   - Accepts new parameters: `utmCode`, `isSpecialLink`
   - Uses new `upsert_property_view_with_special_access` function
   - Includes fallback to old function for compatibility

## How to Create Special Links

### Option 1: Manual URL Creation
Simply append `?u=sl` to any property URL:
```
https://www.ableman.co/1705-frey-rd-evansville-in-47712?u=sl
```

### Option 2: Database Entry (for tracking)
To track which properties have special links and their usage:

```sql
-- Insert a special link record for a property
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
```

## Tracking & Analytics

### View Special Link Analytics
Query the new view to see all special link activity:

```sql
SELECT
  property_address,
  utm_code,
  user_email,
  user_first_name,
  user_last_name,
  view_start_time,
  duration_seconds,
  page_views,
  images_viewed,
  clicked_inquiry,
  clicked_inspection_report,
  clicked_more_photos,
  device_type,
  created_at
FROM special_link_analytics
ORDER BY created_at DESC
LIMIT 100;
```

### Key Metrics to Track
1. **Conversion Rate:** How many special link users eventually sign up
2. **Engagement:** Average time spent, photos viewed, interactions
3. **Restriction Triggers:** How often users hit the photo limit or try to request inspections
4. **Device Distribution:** Mobile vs desktop usage

## User Flow

### Regular User (No UTM)
1. Visits property page
2. Sees blurred content with "Join Ableman" overlay
3. Must sign up/login to see anything

### Special Link User (`?u=sl`)
1. Visits property page with special link
2. Sees full property details immediately (no blur/overlay)
3. Can view first 10 photos
4. When reaching photo #10, sees overlay: "X More Photos Available - Join Ableman to View All"
5. If clicks "Inspection Report" or "Inquire Now", sees "Join Ableman" modal
6. Marketplace link hidden (shows "Property Details" instead)
7. All activity tracked as special link access

## Testing Checklist

### Before Running Migration
- [ ] Backup your database
- [ ] Test on staging environment first

### After Running Migration
- [ ] Verify new columns exist in `property_analytics` table
- [ ] Verify new columns exist in `utm_links` table
- [ ] Verify `upsert_property_view_with_special_access` function exists
- [ ] Verify `special_link_analytics` view exists

### Frontend Testing
- [ ] Regular property link shows auth gate for non-logged users
- [ ] Special link (`?u=sl`) shows property without auth gate
- [ ] Special link users see only 10 photos max
- [ ] Photo counter shows "(X total)" for special link users
- [ ] Clicking last photo shows "Join Ableman" overlay
- [ ] Inspection report button shows "Join Ableman" modal for special link users
- [ ] Inquire button shows "Join Ableman" modal for special link users
- [ ] Marketplace link hidden for special link users
- [ ] Regular logged-in users see all features normally
- [ ] Test on mobile devices

### Analytics Testing
- [ ] Special link visit tracked in `property_analytics`
- [ ] `is_special_link_access` = true for special link visits
- [ ] `utm_code` = 'sl' recorded correctly
- [ ] User behavior tracked (photo views, clicks, etc.)
- [ ] Query `special_link_analytics` view returns data

## Troubleshooting

### Error: "Could not find the function upsert_property_view"
**Solution:** Run the migration script. The old function has been replaced/fixed.

### Special link not working (shows auth gate)
**Checks:**
1. Verify URL has `?u=sl` parameter
2. Check browser console for errors
3. Verify `specialLink.js` utility functions are imported correctly

### Photos not limited to 10
**Checks:**
1. Verify `photoLimit` prop is passed to image slider components
2. Check if `isSpecialLinkUser` is true in component state
3. Browser console should show the correct props being passed

### Analytics not tracking special links
**Checks:**
1. Verify migration ran successfully
2. Check browser network tab for API calls to `/api/analytics/property-tracking`
3. Verify `isSpecialLink` and `utmCode` are in the request payload
4. Check Supabase function logs

## Customization Options

### Change Photo Limit
Edit `lib/specialLink.js`:
```javascript
export function getUserAccessLevel(isLoggedIn, isSpecialLinkParam = null) {
  // ...
  photoLimit: specialLink && !isLoggedIn ? 15 : null,  // Change 10 to 15
  // ...
}
```

### Add More UTM Codes
You can create additional special link codes by:
1. Modifying `isSpecialLink()` function in `lib/specialLink.js`
2. Checking for different `u` parameter values
3. Example: `?u=vip` for VIP special access

### Customize "Join Ableman" Messages
Edit `lib/specialLink.js` - `getRestrictedFeatureMessage()` function to customize modal titles and descriptions.

## Database Schema Changes Summary

### property_analytics
```sql
-- New columns added:
is_special_link_access BOOLEAN DEFAULT false
utm_code TEXT NULL
```

### utm_links
```sql
-- New columns added:
is_special_access BOOLEAN DEFAULT false
label TEXT NULL
```

### New Indexes
- `idx_property_analytics_special_link` on `property_analytics(is_special_link_access)`
- `idx_property_analytics_utm_code` on `property_analytics(utm_code)`
- `idx_utm_links_special_access` on `utm_links(is_special_access)`

## Support

If you encounter issues:
1. Check the browser console for JavaScript errors
2. Check Supabase logs for database errors
3. Verify all files were updated correctly
4. Ensure migration script ran without errors
5. Test with different browsers and devices

## Next Steps

1. **Run the migration** - Execute `migration.sql` in Supabase
2. **Test the feature** - Try visiting a property with `?u=sl`
3. **Monitor analytics** - Check `special_link_analytics` view
4. **Share special links** - Send to users who have login issues
5. **Track conversions** - Monitor how many special link users eventually sign up

---

**Version:** 1.0
**Date:** 2025-01-29
**Feature:** Special UTM Links (u=sl) for Non-Logged-In Access
