# 502 Bad Gateway Fixes Documentation

## Overview
This document details all the fixes implemented to resolve the recurring 502 Bad Gateway errors on Railway.

## Problems Identified

### Critical Issues
1. **Unhandled Promise Rejections** - Monday.com integration crashed the app
2. **Fire-and-Forget Email Sends** - No error handling on async email operations
3. **Memory Leaks** - In-memory OTP cache grew indefinitely
4. **No Request Timeouts** - External API calls could hang forever
5. **Missing Health Check** - Railway couldn't determine app health

## Fixes Implemented

### 1. Health Check Endpoint ✅
**File:** `app/api/health/route.js`

Added `/api/health` endpoint for Railway to monitor app status.

```javascript
GET /api/health
Response: { status: 'healthy', timestamp: '...', uptime: 123 }
```

### 2. Timeout Utility Functions ✅
**File:** `lib/timeout.js`

Created three utility functions:

- `withTimeout(promise, ms, message)` - Wraps promises with timeouts
- `fireAndForget(promise, context)` - Safe fire-and-forget with error handling
- `safeAsync(asyncFn, context)` - Executes async functions safely

**Usage:**
```javascript
// Add timeout to any promise
await withTimeout(
  fetch('https://api.example.com'),
  10000,
  'API request timed out'
)

// Fire-and-forget without crashing
fireAndForget(
  sendEmail(user),
  'Welcome email'
)
```

### 3. Fixed Monday.com Integration ✅
**File:** `app/api/auth/verify-otp/route.js`

**Before:**
```javascript
// Unhandled promise - could crash the app
insertToMonday({...}).then(result => {
  console.log('Success')
}).catch(err => {
  console.error('Error')
})
```

**After:**
```javascript
// Properly wrapped with fireAndForget
fireAndForget(
  insertToMonday({...}).then(result => {
    console.log('Success')
  }),
  'Monday.com user sync'
)

// Added timeout to Monday API call
await withTimeout(
  fetch('https://api.monday.com/v2', {...}),
  10000,
  'Monday.com API request timed out'
)
```

### 4. Fixed Email Notification Hangs ✅
**File:** `app/api/buyer/chat/route.js`

**Before:**
```javascript
// Fire-and-forget without error handling
sendEmailToLender(lender.email, ...)
```

**After:**
```javascript
// Wrapped with fireAndForget
fireAndForget(
  sendEmailToLender(lender.email, ...),
  'Lender email notification'
)

// Added timeout to email send
await withTimeout(
  resend.emails.send({...}),
  15000,
  'Email send timed out'
)
```

### 5. Fixed Memory Leaks in OTP Storage ✅
**Files:**
- `app/api/auth/send-otp/route.js`
- `app/api/auth/verify-otp/route.js`

**Added automatic cleanup:**
```javascript
// Cleanup expired OTPs every 5 minutes
function cleanupExpiredOTPs() {
  const now = Date.now()
  for (const [email, data] of otpStore.entries()) {
    if (data.expires < now) {
      otpStore.delete(email)
    }
  }
}

setInterval(cleanupExpiredOTPs, 5 * 60 * 1000)
```

### 6. Railway Configuration ✅
**File:** `railway.json`

Added Railway-specific configuration:
- Health check path: `/api/health`
- Health check timeout: 300s
- Restart policy: ON_FAILURE with 10 max retries

## Timeout Values

| Operation | Timeout | Rationale |
|-----------|---------|-----------|
| Monday.com API | 10s | External API, should be fast |
| Resend Email | 15s | Email delivery can be slower |
| Default Timeout | 25s | Railway has 30s timeout, leave 5s buffer |

## Testing the Fixes

### 1. Test Health Check
```bash
curl https://your-app.railway.app/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-12-17T...",
  "uptime": 1234.56
}
```

### 2. Monitor Logs
Look for these log messages:
- `Cleaned up X expired OTPs. Current store size: Y`
- `Email sent in Xms`
- `Monday.com user sync` (background task messages)

### 3. Test User Registration
- Should work even if Monday.com is down
- Should work even if email send is slow
- OTPs should expire and be cleaned up

## Deployment Checklist

- [x] Health check endpoint created
- [x] Timeout utilities implemented
- [x] Monday.com integration fixed
- [x] Email sends wrapped with error handling
- [x] OTP cleanup implemented
- [x] Railway config created

## Monitoring Recommendations

1. **Set up Railway health checks** pointing to `/api/health`
2. **Monitor memory usage** - Should stay stable with OTP cleanup
3. **Check error logs** for timeout messages
4. **Track email delivery** success rates

## Additional Improvements (Future)

1. Replace in-memory OTP cache with Redis
2. Add request timeout middleware globally
3. Implement circuit breaker for external services
4. Add Sentry or similar error tracking
5. Database connection pooling optimization
6. Add rate limiting to prevent abuse

## Support

If 502 errors persist:
1. Check Railway logs for timeout errors
2. Verify health check is responding
3. Check OTP store size in logs
4. Monitor external API response times (Monday.com, Resend)

---
**Last Updated:** December 17, 2025
