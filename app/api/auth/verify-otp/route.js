// /app/api/auth/verify-otp/route.js
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import { withTimeout, fireAndForget } from '@/lib/timeout'

// Shared OTP storage - must match send-otp route
let otpStore = new Map()
if (typeof global !== 'undefined') {
  if (!global.otpStore) global.otpStore = new Map()
  otpStore = global.otpStore
}

// Cleanup expired OTPs periodically to prevent memory leaks
function cleanupExpiredOTPs() {
  const now = Date.now()
  let cleanedCount = 0

  for (const [email, data] of otpStore.entries()) {
    if (data.expires < now) {
      otpStore.delete(email)
      cleanedCount++
    }
  }

  if (cleanedCount > 0) {
    console.log(`Cleaned up ${cleanedCount} expired OTPs. Current store size: ${otpStore.size}`)
  }
}

// Run cleanup every 5 minutes
if (typeof global !== 'undefined' && !global.otpCleanupInterval) {
  global.otpCleanupInterval = setInterval(cleanupExpiredOTPs, 5 * 60 * 1000)
}

// Format phone number to American format
function formatPhoneNumber(phone) {
  if (!phone) return ''
  
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '')
  
  // If it's empty after removing non-digits, return as is
  if (!digitsOnly) return phone
  
  // If it's 10 digits (missing country code), add +1
  if (digitsOnly.length === 10) {
    return `+1${digitsOnly}`
  }
  
  // If it's 11 digits and starts with 1, add +
  if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
    return `+${digitsOnly}`
  }
  
  // If it already has correct length with country code, add + if missing
  if (digitsOnly.length === 11) {
    return `+${digitsOnly}`
  }
  
  // For any other case, return the original (don't abort operation)
  return phone
}

// Insert user to Monday.com
async function insertToMonday(userData) {
  const MONDAY_API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjQzMTQ5MDY2OCwiYWFpIjoxMSwidWlkIjo2NzgyNDc3MywiaWFkIjoiMjAyNC0xMS0wM1QxMDo0OToyMi4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MTQ5NDQ5MTQsInJnbiI6InVzZTEifQ.M2y5qvKTBugSmKQLJnPFinl9o1h0H70yCAVnsM75p0M'
  const BOARD_ID = '6039063783'
  const GROUP_ID = 'group_mkwgts1s'

  try {
    const formattedPhone = formatPhoneNumber(userData.phone)

    // Create full name for item_name
    const fullName = `${userData.firstName || ''} ${userData.lastName || ''}`.trim()
    const itemName = fullName || userData.email // Fallback to email if no name provided

    // Build column values object
    const columnValues = {
      text_mkvmfa36: userData.firstName || '',
      text_mkvm3swk: userData.lastName || '',
      text2: formattedPhone,
      text0: userData.email
    }

    // Add states of interest if provided (dropdown_mky8cygf column)
    if (userData.statesOfInterest && userData.statesOfInterest.length > 0) {
      // Monday.com dropdown expects { ids: [index1, index2, ...] } format
      // For multiple select with text labels, use { labels: ["label1", "label2"] }
      columnValues.dropdown_mky8cygf = { labels: userData.statesOfInterest }
    }

    const mutation = `
      mutation {
        create_item (
          board_id: ${BOARD_ID},
          group_id: "${GROUP_ID}",
          item_name: "${itemName}",
          column_values: ${JSON.stringify(JSON.stringify(columnValues))}
        ) {
          id
        }
      }
    `

    console.log('Monday.com mutation:', mutation)

    const response = await withTimeout(
      fetch('https://api.monday.com/v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': MONDAY_API_KEY
        },
        body: JSON.stringify({
          query: mutation
        })
      }),
      10000, // 10 second timeout for Monday.com API
      'Monday.com API request timed out'
    )

    const result = await response.json()

    if (result.errors) {
      console.error('Monday.com API errors:', result.errors)
      return { success: false, error: result.errors }
    }

    console.log('User inserted to Monday.com successfully:', result.data)
    return { success: true, data: result.data }

  } catch (error) {
    console.error('Error inserting to Monday.com:', error)
    return { success: false, error: error.message }
  }
}

export async function POST(request) {
  try {
    const { email, otp, userData } = await request.json()

    if (!email || !otp) {
      return NextResponse.json({ message: 'Email and OTP are required' }, { status: 400 })
    }

    console.log(`Verifying OTP for ${email}: ${otp}`)
    console.log('Received userData:', userData)

    // Check if OTP exists and is valid
    const storedOtpData = otpStore.get(email)
    
    if (!storedOtpData) {
      console.log('OTP not found for email:', email)
      return NextResponse.json({ message: 'OTP not found or expired' }, { status: 400 })
    }

    if (storedOtpData.expires < Date.now()) {
      console.log('OTP expired for email:', email)
      otpStore.delete(email)
      return NextResponse.json({ message: 'OTP has expired' }, { status: 400 })
    }

    if (storedOtpData.otp !== otp.toString()) {
      console.log(`OTP mismatch for ${email}. Expected: ${storedOtpData.otp}, Got: ${otp}`)
      return NextResponse.json({ message: 'Invalid OTP' }, { status: 400 })
    }

    // Check if userData is provided (for new user registration)
    if (!userData || !userData.password || (!userData.firstName && !userData.lastName)) {
      return NextResponse.json({ message: 'User data with first name or last name is required' }, { status: 400 })
    }

    // Check if user already exists in database
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 12)

    // Create user in database with first_name, last_name, and states_of_interest
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([
        {
          email,
          first_name: userData.firstName || '',
          last_name: userData.lastName || '',
          phone: userData.phone || '',
          password: hashedPassword,
          states_of_interest: userData.statesOfInterest || [],
          verified: true,
          created_at: new Date().toISOString()
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Database error creating user:', error)
      return NextResponse.json({ message: 'Failed to create user account' }, { status: 500 })
    }

    console.log('User created successfully in database:', email)
    console.log('States of interest:', userData.statesOfInterest)

    // Insert to Monday.com (non-blocking - don't fail registration if Monday fails)
    // Use fireAndForget to ensure errors don't crash the process
    fireAndForget(
      insertToMonday({
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        phone: newUser.phone,
        statesOfInterest: userData.statesOfInterest || []
      }).then(result => {
        if (result.success) {
          console.log('User synced to Monday.com with states of interest')
        } else {
          console.error('Failed to sync to Monday.com, but user registration succeeded')
        }
      }),
      'Monday.com user sync'
    )

    // Clean up OTP
    otpStore.delete(email)

    // Return user data in the format expected by useAuth
    return NextResponse.json({
      message: 'Account created successfully',
      user: {
        id: newUser.id,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        phone: newUser.phone,
        // Computed full name for backward compatibility
        name: `${newUser.first_name} ${newUser.last_name}`.trim()
      }
    })

  } catch (error) {
    console.error('Verify OTP error:', error)
    return NextResponse.json(
      { message: 'Failed to verify OTP', error: error.message },
      { status: 500 }
    )
  }
}