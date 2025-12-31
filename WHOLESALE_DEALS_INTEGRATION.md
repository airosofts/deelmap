# Wholesale Deals Integration - Complete

## ✅ Marketplace Updated to Use `wholesale_deals` Table

Your marketplace now pulls data from the `wholesale_deals` and `property_photos` tables instead of the old `properties` table.

## Changes Made

### 1. **useProperties Hook** ([hooks/useProperties.js](hooks/useProperties.js))

Changed from `properties` table to `wholesale_deals`:

```javascript
// OLD: from('properties')
// NEW: from('wholesale_deals')

let query = supabase
  .from('wholesale_deals')
  .select(`
    *,
    property_photos (
      id,
      photo_url,
      photo_type,
      display_order
    )
  `)
  .eq('status', 'active')
  .order('created_at', { ascending: false })
```

**Field Mappings:**
- `floor_area` → `sqft`
- Now includes `property_photos` relationship
- All filters work with wholesale_deals fields

### 2. **PropertyCard Component** ([components/property/PropertyCard.js](components/property/PropertyCard.js))

Updated to use wholesale_deals fields:

**Address Fields:**
- Uses `full_address` as primary address
- Falls back to `address`, `city`, `state`, `zip_code`
- Creates proper display address from components

**Photo Handling:**
- Gets first photo from `property_photos` array
- `property_photos?.[0]?.photo_url`
- Falls back to placeholder if no photos

**Metrics Fields:**
- `price_per_sqft` → `price_per_square_foot`
- `floor_area` → `sqft`
- `gross_yield`, `cap_rate`, `cash_on_cash` (already correct)
- `year_built` (already correct)

**URL Slugs:**
- Uses `id` field for URLs
- Links: `/property/{id}`
- Share URLs: `https://ableman.co/property/{id}`

### 3. **PropertyMap Component** ([components/property/PropertyMap.js](components/property/PropertyMap.js))

Updated coordinates to use Google-verified data:

```javascript
// OLD: p.latitude, p.longitude
// NEW: p.address_google_lat, p.address_google_lng

const lat = parseFloat(p.address_google_lat)
const lng = parseFloat(p.address_google_lng)
```

Uses the verified Google Places API coordinates from your address verification system.

### 4. **FilterBar Component** ([components/property/FilterBar.js](components/property/FilterBar.js))

Changed states query:

```javascript
// OLD: from('properties')
// NEW: from('wholesale_deals')

const { data, error } = await supabase
  .from('wholesale_deals')
  .select('state')
  .eq('status', 'active')
```

### 5. **Marketplace Search** ([app/marketplace/page.js](app/marketplace/page.js))

Enhanced search to include `full_address`:

```javascript
filtered = filtered.filter(p =>
  p.address?.toLowerCase().includes(query) ||
  p.full_address?.toLowerCase().includes(query) ||
  p.city?.toLowerCase().includes(query) ||
  p.state?.toLowerCase().includes(query) ||
  p.zip_code?.toLowerCase().includes(query)
)
```

## Database Tables Used

### `wholesale_deals` (Main Properties)
Primary fields used in marketplace:
- `id` - Unique identifier
- `price` - Property price
- `bedrooms` - Number of bedrooms
- `bathrooms` - Number of bathrooms
- `sqft` - Square footage
- `address` - Street address
- `full_address` - Complete formatted address
- `city` - City
- `state` - State code
- `zip_code` - ZIP code
- `status` - Property status (active, sold, pending)
- `gross_yield` - Investment metric (%)
- `cap_rate` - Investment metric (%)
- `cash_on_cash` - Investment metric (%)
- `price_per_square_foot` - $/sq ft
- `year_built` - Construction year
- `address_google_lat` - Verified latitude
- `address_google_lng` - Verified longitude
- `address_google_place_id` - Google Place ID
- `created_at` - Listing date
- `updated_at` - Last update

### `property_photos` (Images)
Relationship fields:
- `id` - Photo ID
- `deal_id` - References wholesale_deals.id
- `photo_url` - Image URL
- `photo_type` - Type of photo
- `display_order` - Sort order

## Features Now Working

✅ **Property Listings**
- Shows all active wholesale deals
- Displays first photo from property_photos
- Shows investment metrics (gross yield, cap rate, cash on cash)

✅ **Search**
- Searches across address, full_address, city, state, ZIP

✅ **Filters**
- States (from wholesale_deals table)
- Price range
- Bedrooms/Bathrooms
- Square footage
- All filters working

✅ **Map**
- Uses Google-verified coordinates
- Small purple dot markers
- Click markers to see property details

✅ **Sorting**
- Newest first (by created_at)
- Price: Low to High
- Price: High to Low

## Testing

Visit: **http://localhost:3000/marketplace**

You should see:
1. Properties from `wholesale_deals` table
2. Photos from `property_photos` table
3. Investment metrics displayed
4. Map markers showing verified locations
5. Search and filters working

## Data Requirements

For properties to display properly, ensure:

1. **Required Fields:**
   - `status = 'active'`
   - `address_google_lat` and `address_google_lng` (for map)
   - At least one row in `property_photos` table

2. **Recommended Fields:**
   - `full_address` or (`address`, `city`, `state`, `zip_code`)
   - `price`
   - `bedrooms`, `bathrooms`, `sqft`
   - `gross_yield`, `cap_rate`, `cash_on_cash`
   - `price_per_square_foot`
   - `year_built`

3. **Photos:**
   - Add rows to `property_photos` with `deal_id` matching `wholesale_deals.id`
   - Set `display_order` for photo sorting
   - First photo (lowest display_order) shows as feature image

## SQL to Check Data

```sql
-- Check properties with photos
SELECT
  w.id,
  w.full_address,
  w.price,
  w.status,
  w.address_google_lat,
  w.address_google_lng,
  COUNT(pp.id) as photo_count
FROM wholesale_deals w
LEFT JOIN property_photos pp ON pp.deal_id = w.id
WHERE w.status = 'active'
GROUP BY w.id
ORDER BY w.created_at DESC
LIMIT 10;

-- Check for missing coordinates
SELECT
  id,
  full_address,
  address_google_lat,
  address_google_lng
FROM wholesale_deals
WHERE status = 'active'
  AND (address_google_lat IS NULL OR address_google_lng IS NULL);
```

## Migration Notes

### Old `properties` Table → New `wholesale_deals` Table

| Old Field | New Field | Notes |
|-----------|-----------|-------|
| `floor_area` | `sqft` | Square footage |
| `feature_image_url` | `property_photos[0].photo_url` | First photo |
| `slug` | `id` | Use ID for URLs |
| `property_status` | `status` | Same values |
| `latitude` | `address_google_lat` | Google verified |
| `longitude` | `address_google_lng` | Google verified |
| `price_per_sqft` | `price_per_square_foot` | Price calculation |

### All Other Fields
Most fields have the same name:
- `price` ✓
- `bedrooms` ✓
- `bathrooms` ✓
- `address` ✓
- `city` ✓
- `state` ✓
- `zip_code` ✓
- `gross_yield` ✓
- `cap_rate` ✓
- `cash_on_cash` ✓
- `year_built` ✓

## Result

Your marketplace now:
- ✅ Uses `wholesale_deals` table
- ✅ Displays photos from `property_photos`
- ✅ Shows Google-verified map locations
- ✅ Maintains all Stessa design features
- ✅ Search, filters, and sorting all work
- ✅ Investment metrics display correctly

Everything is connected and ready to display your wholesale deals data! 🎉
