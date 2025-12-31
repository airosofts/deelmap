// /app/api/auth/signin/route.js
import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function POST(request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 })
    }

    // Find user in database
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !user) {
      console.log('User not found:', email)
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 })
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      console.log('Invalid password for user:', email)
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 })
    }

    console.log('User signed in successfully:', email)

    return NextResponse.json({
      message: 'Sign in successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone
      }
    })

  } catch (error) {
    console.error('Sign in error:', error)
    return NextResponse.json(
      { message: 'Sign in failed' },
      { status: 500 }
    )
  }
}