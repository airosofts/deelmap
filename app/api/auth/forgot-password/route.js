// /app/api/auth/forgot-password/route.js
// OPTIMIZED & IMPROVED DESIGN VERSION
import { NextResponse } from 'next/server'
import { Resend } from 'resend'

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY)

// Shared storage - in production, use Redis or database
let passwordResetStore = new Map()

if (typeof global !== 'undefined') {
  if (!global.passwordResetStore) global.passwordResetStore = new Map()
  passwordResetStore = global.passwordResetStore
}

export async function POST(request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 })
    }

    // Generate 6-digit OTP for password reset
    const resetOtp = Math.floor(100000 + Math.random() * 900000).toString()
    
    // Store password reset OTP with expiration (15 minutes for password reset)
    passwordResetStore.set(email, {
      otp: resetOtp,
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      timestamp: Date.now()
    })

    console.log(`Generated password reset OTP for ${email}: ${resetOtp}`)

    // IMPROVED DESIGN - Fast & Professional (Red theme for security alert)
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
                Password Reset Request
              </h2>
              
              <p style="margin: 0 0 30px 0; font-size: 15px; line-height: 1.6; color: #555555;">
                We received a request to reset your password. Use the verification code below to proceed with resetting your password.
              </p>
              
              <!-- OTP Box (Red theme for security alert) -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td style="background: linear-gradient(135deg, #fff5f5 0%, #fee2e2 100%); border: 2px solid #dc2626; border-radius: 10px; padding: 35px 25px; text-align: center;">
                    <p style="margin: 0 0 12px 0; font-size: 13px; color: #991b1b; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">
                      Password Reset Code
                    </p>
                    <p style="margin: 0 0 12px 0; font-size: 40px; font-weight: 700; color: #dc2626; letter-spacing: 10px; font-family: 'Courier New', monospace; line-height: 1.2;">
                      ${resetOtp}
                    </p>
                    <p style="margin: 0; font-size: 13px; color: #991b1b; font-weight: 500;">
                      ⏱ Valid for 15 minutes
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Security Notice -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 25px 0;">
                <tr>
                  <td style="background-color: #fff8e1; border-left: 4px solid #ffc107; border-radius: 6px; padding: 18px 20px;">
                    <p style="margin: 0 0 6px 0; font-size: 14px; font-weight: 600; color: #f57c00;">
                      🔒 Security Tips
                    </p>
                    <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #e65100;">
                      • This code will only work once<br>
                      • Never share this code with anyone<br>
                      • Ableman Group will never ask for your code<br>
                      • Code expires in 15 minutes
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Didn't Request Section -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 25px 0;">
                <tr>
                  <td style="background-color: #e3f2fd; border-left: 4px solid #2196f3; border-radius: 6px; padding: 18px 20px;">
                    <p style="margin: 0 0 6px 0; font-size: 14px; font-weight: 600; color: #1565c0;">
                      📧 Didn't Request This?
                    </p>
                    <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #0d47a1;">
                      If you didn't request a password reset, you can safely ignore this email. Your account remains secure and no changes will be made.
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Footer Message -->
              <p style="margin: 30px 0 0 0; font-size: 14px; color: #666666; line-height: 1.6;">
                If you need assistance, our security team is here to help.
              </p>
              
              <p style="margin: 20px 0 0 0; font-size: 14px; color: #333333;">
                Best regards,<br>
                <strong style="color: #022b41;">The Ableman Group Security Team</strong>
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #888888; line-height: 1.5;">
                This is an automated security message from Ableman Group.<br>
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

PASSWORD RESET REQUEST

We received a request to reset your password. Use the verification code below to proceed with resetting your password.

YOUR PASSWORD RESET CODE:
${resetOtp}

⏱ Valid for 15 minutes

SECURITY TIPS:
• This code will only work once
• Never share this code with anyone
• Ableman Group will never ask for your code
• Code expires in 15 minutes

DIDN'T REQUEST THIS?
If you didn't request a password reset, you can safely ignore this email. Your account remains secure and no changes will be made.

If you need assistance, our security team is here to help.

Best regards,
The Ableman Group Security Team

---
This is an automated security message from Ableman Group.
© ${new Date().getFullYear()} Ableman Group LLC. All rights reserved.`

    // Send email via Resend
    const startTime = Date.now()
    console.log(`[${new Date().toISOString()}] Sending password reset email via Resend...`)

    const { data, error } = await resend.emails.send({
      from: 'Ableman Group Security <noreply@ableman.co>',
      to: [email],
      subject: `${resetOtp} is your password reset code`,
      html: htmlTemplate,
      text: textContent,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high',
        'Priority': 'urgent'
      }
    })

    const endTime = Date.now()
    console.log(`[${new Date().toISOString()}] Password reset email sent in ${endTime - startTime}ms`)

    if (error) {
      console.error('Resend error:', error)
      throw new Error(error.message)
    }

    console.log(`Password reset email sent successfully to ${email}`, data)

    return NextResponse.json({ 
      message: 'Password reset code sent successfully',
      email,
      sendTime: endTime - startTime
    })

  } catch (error) {
    console.error('Send password reset error:', error)
    
    // Provide specific error messages
    let errorMessage = 'Failed to send password reset code'
    
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