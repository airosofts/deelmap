// app/api/analytics/property-tracking/route.js
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

function getDeviceType(userAgent) {
  const ua = userAgent.toLowerCase()
  if (/mobile|android|iphone|ipad|phone/i.test(ua)) {
    return /ipad|tablet/i.test(ua) ? 'tablet' : 'mobile'
  }
  return 'desktop'
}

function getClientIP(request) {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  if (realIP) {
    return realIP
  }
  return request.headers.get('x-vercel-forwarded-for') || 'unknown'
}

async function isSystemUser(email) {
  if (!email) return false
  
  const { data } = await supabase
    .from('system_users')
    .select('email')
    .eq('email', email.toLowerCase())
    .single()
  
  return !!data
}

export async function POST(request) {
  try {
    const body = await request.json()
    const {
      propertyId,
      propertyAddress,
      propertyPrice,
      userId,
      userEmail,
      sessionId,
      action = 'start_view',
      behaviorData = {},
      utmSource = null,
      utmCode = null,
      isSpecialLink = false
    } = body

    if (!propertyId || !sessionId) {
      return NextResponse.json(
        { error: 'Property ID and session ID are required' },
        { status: 400 }
      )
    }

    // Check if user is a system user
    if (userEmail) {
      const isSystem = await isSystemUser(userEmail)
      if (isSystem) {
        return NextResponse.json({ 
          success: true, 
          message: 'System user - tracking skipped',
          systemUser: true 
        })
      }
    }

    const userAgent = request.headers.get('user-agent') || ''
    const referrer = request.headers.get('referer') || ''
    const clientIP = getClientIP(request)
    const deviceType = getDeviceType(userAgent)

    if (action === 'start_view') {
      // Get user info if userId provided
      let userEmailData = userEmail, userFirstName = null, userLastName = null, userPhone = null
      
      if (userId) {
        const { data: userData } = await supabase
          .from('users')
          .select('email, first_name, last_name, phone')
          .eq('id', userId)
          .single()

        if (userData) {
          userEmailData = userData.email
          userFirstName = userData.first_name
          userLastName = userData.last_name
          userPhone = userData.phone

          // Double check if user is system user
          const isSystem = await isSystemUser(userEmailData)
          if (isSystem) {
            return NextResponse.json({ 
              success: true, 
              message: 'System user - tracking skipped',
              systemUser: true 
            })
          }
        }
      }

      // Track UTM click if utm_source is provided
      if (utmSource) {
        const { error: utmError } = await supabase.rpc('increment_utm_clicks', {
          p_property_id: propertyId,
          p_utm_code: utmSource
        })

        if (utmError) {
          console.error('Error tracking UTM click:', utmError)
        }
      }

      // Use the enhanced upsert function to atomically handle view tracking with special link support
      const { data, error } = await supabase.rpc('upsert_property_view_with_special_access', {
        p_property_id: propertyId,
        p_session_id: sessionId,
        p_user_id: userId,
        p_user_email: userEmailData,
        p_user_first_name: userFirstName,
        p_user_last_name: userLastName,
        p_user_phone: userPhone,
        p_property_address: propertyAddress,
        p_property_price: propertyPrice,
        p_referrer: referrer,
        p_user_agent: userAgent,
        p_ip_address: clientIP,
        p_device_type: deviceType,
        p_viewport_width: behaviorData.viewportWidth,
        p_viewport_height: behaviorData.viewportHeight,
        p_utm_source: utmSource,
        p_utm_code: utmCode,
        p_is_special_link: isSpecialLink
      })

      // Fallback to old function if new one doesn't exist yet
      if (error && error.message?.includes('upsert_property_view_with_special_access')) {
        const { data: fallbackData, error: fallbackError } = await supabase.rpc('upsert_property_view', {
          p_property_id: propertyId,
          p_session_id: sessionId,
          p_user_id: userId,
          p_user_email: userEmailData,
          p_user_first_name: userFirstName,
          p_user_last_name: userLastName,
          p_user_phone: userPhone,
          p_property_address: propertyAddress,
          p_property_price: propertyPrice,
          p_referrer: referrer,
          p_user_agent: userAgent,
          p_ip_address: clientIP,
          p_device_type: deviceType,
          p_viewport_width: behaviorData.viewportWidth,
          p_viewport_height: behaviorData.viewportHeight,
          p_utm_source: utmSource
        })

        if (fallbackError) {
          console.error('Error in upsert_property_view:', fallbackError)
          return NextResponse.json({ error: 'Failed to track view' }, { status: 500 })
        }

        // Use fallback result if needed
        const result = fallbackData?.[0]
        return NextResponse.json({
          success: true,
          sessionId: result?.record_id,
          isUniqueView: result?.is_new_view,
          isReturningView: !result?.is_new_view,
          pageViews: result?.current_page_views,
          message: result?.is_new_view ? 'Tracking session started' : 'Returning view tracked'
        })
      }

      if (error) {
        console.error('Error in upsert_property_view_with_special_access:', error)
        return NextResponse.json({ error: 'Failed to track view' }, { status: 500 })
      }

      // The function returns void, so we just return success
      // The tracking was successful if we got here
      return NextResponse.json({
        success: true,
        message: 'View tracked successfully',
        sessionId: sessionId,
        isSpecialLinkAccess: isSpecialLink
      })
    }

    if (action === 'update_active_time') {
      // Update active time when user is actively viewing
      const { data: session } = await supabase
        .from('property_analytics')
        .select('active_time_seconds, last_active_time')
        .eq('property_id', propertyId)
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (session) {
        const lastActive = session.last_active_time ? new Date(session.last_active_time) : new Date()
        const now = new Date()
        const timeDiff = Math.round((now - lastActive) / 1000)
        
        // Only add time if it's reasonable (less than 10 seconds since last update)
        const additionalTime = timeDiff < 10 ? timeDiff : 0
        const newActiveTime = (session.active_time_seconds || 0) + additionalTime

        const { error } = await supabase
          .from('property_analytics')
          .update({
            active_time_seconds: newActiveTime,
            last_active_time: now.toISOString(),
            updated_at: now.toISOString()
          })
          .eq('property_id', propertyId)
          .eq('session_id', sessionId)
          .order('created_at', { ascending: false })
          .limit(1)

        if (error) {
          console.error('Error updating active time:', error)
        }

        return NextResponse.json({ success: true, activeTime: newActiveTime })
      }
    }

    if (action === 'update_behavior') {
      const updateData = {
        updated_at: new Date().toISOString(),
        last_active_time: new Date().toISOString()
      }

      if (behaviorData.scrolledToBottom !== undefined) {
        updateData.scrolled_to_bottom = behaviorData.scrolledToBottom
      }
      if (behaviorData.viewedDescription !== undefined) {
        updateData.viewed_description = behaviorData.viewedDescription
      }
      if (behaviorData.viewedRepairs !== undefined) {
        updateData.viewed_repairs = behaviorData.viewedRepairs
      }
      if (behaviorData.viewedPhotos !== undefined) {
        updateData.viewed_photos = behaviorData.viewedPhotos
      }
      if (behaviorData.clickedInquiry !== undefined) {
        updateData.clicked_inquiry = behaviorData.clickedInquiry
      }
      if (behaviorData.clickedInspectionReport !== undefined) {
        updateData.clicked_inspection_report = behaviorData.clickedInspectionReport
      }
      if (behaviorData.clickedMorePhotos !== undefined) {
        updateData.clicked_more_photos = behaviorData.clickedMorePhotos
      }
      if (behaviorData.clickedShare !== undefined) {
        updateData.clicked_share = behaviorData.clickedShare
      }
      if (behaviorData.zoomedMap !== undefined) {
        updateData.zoomed_map = behaviorData.zoomedMap
      }
      if (behaviorData.imagesViewed !== undefined) {
        updateData.images_viewed = behaviorData.imagesViewed
      }
      if (behaviorData.fullViewAchieved !== undefined) {
        updateData.full_view_achieved = behaviorData.fullViewAchieved
      }

      const { error } = await supabase
        .from('property_analytics')
        .update(updateData)
        .eq('property_id', propertyId)
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(1)

      if (error) {
        console.error('Error updating behavior:', error)
        return NextResponse.json({ error: 'Failed to update behavior' }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: 'Behavior updated' })
    }

    if (action === 'end_view') {
      const { data: session } = await supabase
        .from('property_analytics')
        .select('view_start_time, active_time_seconds')
        .eq('property_id', propertyId)
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (session) {
        const endTime = new Date()

        const { error } = await supabase
          .from('property_analytics')
          .update({
            view_end_time: endTime.toISOString(),
            duration_seconds: session.active_time_seconds || 0,
            updated_at: endTime.toISOString()
          })
          .eq('property_id', propertyId)
          .eq('session_id', sessionId)
          .order('created_at', { ascending: false })
          .limit(1)

        if (error) {
          console.error('Error ending session:', error)
          return NextResponse.json({ error: 'Failed to end session' }, { status: 500 })
        }

        return NextResponse.json({ 
          success: true, 
          durationSeconds: session.active_time_seconds || 0,
          message: 'Session ended'
        })
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Analytics API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const type = searchParams.get('type') || 'summary'

    let query = supabase.from('property_analytics').select('*')

    if (propertyId) {
      query = query.eq('property_id', propertyId)
    }

    if (startDate) {
      query = query.gte('created_at', startDate)
    }

    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    if (type === 'summary') {
      const { data: summaryData, error } = await supabase
        .from('property_engagement_stats')
        .select('*')
        .order('total_unique_views', { ascending: false })

      if (error) {
        console.error('Error fetching summary:', error)
        return NextResponse.json({ error: 'Failed to fetch summary' }, { status: 500 })
      }

      return NextResponse.json({ success: true, data: summaryData })
    }

    if (type === 'user-patterns') {
      const { data: userData, error } = await supabase
        .from('user_engagement_patterns')
        .select('*')
        .order('total_unique_property_views', { ascending: false })

      if (error) {
        console.error('Error fetching user patterns:', error)
        return NextResponse.json({ error: 'Failed to fetch user patterns' }, { status: 500 })
      }

      return NextResponse.json({ success: true, data: userData })
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(1000)

    if (error) {
      console.error('Error fetching analytics:', error)
      return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })

  } catch (error) {
    console.error('Analytics GET API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}