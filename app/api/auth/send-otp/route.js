// /app/api/auth/send-otp/route.js
// OPTIMIZED & IMPROVED DESIGN VERSION
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { withTimeout } from '@/lib/timeout'

const resend = new Resend(process.env.RESEND_API_KEY)

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

export async function POST(request) {
  try {
    const { email, firstName, lastName } = await request.json()

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 })
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    
    otpStore.set(email, {
      otp,
      expires: Date.now() + 10 * 60 * 1000,
      firstName,
      lastName
    })

    console.log(`Generated OTP for ${email}: ${otp}`)

    const displayName = firstName && lastName 
      ? `${firstName} ${lastName}` 
      : firstName || lastName || ''

    // IMPROVED DESIGN - Fast & Professional
    const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
          
          <!-- Header with Company Name -->
          <tr>
            <td style="background: linear-gradient(135deg, #022b41 0%, #034d6e 100%); padding: 40px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: 1px;">
                ABLEMAN GROUP
              </h1>
              <p style="margin: 8px 0 0 0; color: #94a3b8; font-size: 13px; letter-spacing: 0.5px;">
                Real Estate Investment Platform
              </p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 35px;">
              <!-- Greeting -->
              <h2 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 600; color: #1a1a1a;">
                Welcome${displayName ? `, ${displayName}` : ''}!
              </h2>
              
              <p style="margin: 0 0 30px 0; font-size: 15px; line-height: 1.6; color: #555555;">
                Thank you for joining Ableman Group. Please verify your email address to complete your registration.
              </p>
              
              <!-- OTP Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border: 2px solid #022b41; border-radius: 10px; padding: 35px 25px; text-align: center;">
                    <p style="margin: 0 0 12px 0; font-size: 13px; color: #6c757d; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">
                      Your Verification Code
                    </p>
                    <p style="margin: 0 0 12px 0; font-size: 40px; font-weight: 700; color: #022b41; letter-spacing: 10px; font-family: 'Courier New', monospace; line-height: 1.2;">
                      ${otp}
                    </p>
                    <p style="margin: 0; font-size: 13px; color: #6c757d; font-weight: 500;">
                      ⏱ Valid for 10 minutes
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Instructions -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 25px 0;">
                <tr>
                  <td style="background-color: #fff8e1; border-left: 4px solid #ffc107; border-radius: 6px; padding: 18px 20px;">
                    <p style="margin: 0 0 6px 0; font-size: 14px; font-weight: 600; color: #f57c00;">
                      🔒 Security Tips
                    </p>
                    <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #e65100;">
                      • Never share this code with anyone<br>
                      • Ableman Group will never ask for your code<br>
                      • If you didn't request this, please ignore this email
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Footer Message -->
              <p style="margin: 30px 0 0 0; font-size: 14px; color: #666666; line-height: 1.6;">
                Need help? Contact our support team anytime.
              </p>
              
              <p style="margin: 20px 0 0 0; font-size: 14px; color: #333333;">
                Best regards,<br>
                <strong style="color: #022b41;">The Ableman Group Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #888888; line-height: 1.5;">
                This is an automated message from Ableman Group.<br>
                Please do not reply to this email.
              </p>
              <p style="margin: 8px 0 0 0; font-size: 11px; color: #aaaaaa;">
                © ${new Date().getFullYear()} Ableman Group LLC. All rights reserved.
              </p>
            </td>
          </tr>
          
        </table>
        
        <!-- Extra spacing for mobile -->
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; margin-top: 20px;">
          <tr>
            <td style="text-align: center; padding: 0 20px;">
              <p style="margin: 0; font-size: 11px; color: #999999; line-height: 1.5;">
                Ableman Group | Real Estate Investment Platform<br>
                Secure • Trusted • Professional
              </p>
            </td>
          </tr>
        </table>
        
      </td>
    </tr>
  </table>
</body>
</html>
    `

    // Plain text version
    const textContent = `ABLEMAN GROUP
Real Estate Investment Platform

Welcome${displayName ? ` ${displayName}` : ''}!

Thank you for joining Ableman Group. Please verify your email address to complete your registration.

YOUR VERIFICATION CODE:
${otp}

⏱ Valid for 10 minutes

SECURITY TIPS:
• Never share this code with anyone
• Ableman Group will never ask for your code
• If you didn't request this, please ignore this email

Need help? Contact our support team anytime.

Best regards,
The Ableman Group Team

---
This is an automated message from Ableman Group.
© ${new Date().getFullYear()} Ableman Group LLC. All rights reserved.`

    const startTime = Date.now()
    console.log(`[${new Date().toISOString()}] Sending email via Resend...`)

    const { data, error } = await withTimeout(
      resend.emails.send({
        from: 'Ableman Group <noreply@ableman.co>',
        to: [email],
        subject: `${otp} is your Ableman Group verification code`,
        html: htmlTemplate,
        text: textContent,
        headers: {
          'X-Priority': '1',
          'X-MSMail-Priority': 'High',
          'Importance': 'high',
          'Priority': 'urgent'
        }
      }),
      15000, // 15 second timeout
      'OTP email send timed out'
    )

    const endTime = Date.now()
    console.log(`[${new Date().toISOString()}] Email sent in ${endTime - startTime}ms`)

    if (error) {
      console.error('Resend error:', error)
      throw new Error(error.message)
    }

    console.log(`Email sent successfully to ${email}`, data)

    return NextResponse.json({ 
      message: 'OTP sent successfully',
      email,
      sendTime: endTime - startTime
    })

  } catch (error) {
    console.error('Send OTP error:', error)
    
    let errorMessage = 'Failed to send verification code'
    
    if (error.message?.includes('API key')) {
      errorMessage = 'Email service configuration error'
    } else if (error.message?.includes('rate')) {
      errorMessage = 'Too many requests - please wait and try again'
    }
    
    return NextResponse.json(
      { message: errorMessage, error: error.message },
      { status: 500 }
    )
  }
}