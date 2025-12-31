'use client'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  })
  
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }

    // Fetch user data from database
    fetchUserData()
  }, [user, router])

  const fetchUserData = async () => {
    if (!user?.id) return

    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('users')
        .select('first_name, last_name, email, phone')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Error fetching user data:', error)
        setError('Failed to load profile data')
        return
      }

      // Populate form with fresh database data
      setFormData({
        firstName: data.first_name || '',
        lastName: data.last_name || '',
        email: data.email || '',
        phone: data.phone || ''
      })

    } catch (error) {
      console.error('Error fetching user data:', error)
      setError('Failed to load profile data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear messages when user starts typing
    if (error) setError('')
    if (success) setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    setSuccess('')

    try {
      // Update user profile in Supabase
      const { error: updateError } = await supabase
        .from('users')
        .update({
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateError) {
        throw updateError
      }

      // Update local storage
      const updatedUser = {
        ...user,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone
      }
      
      localStorage.setItem('ableman_user', JSON.stringify(updatedUser))
      
      setSuccess('Profile updated successfully!')
      setIsEditing(false)
      
      // Refresh page to update navbar
      setTimeout(() => {
        window.location.reload()
      }, 1000)

    } catch (error) {
      console.error('Profile update error:', error)
      setError('Failed to update profile. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    // Reset form to original values
    fetchUserData()
    setIsEditing(false)
    setError('')
    setSuccess('')
  }

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
      localStorage.clear()
      sessionStorage.clear()
      router.push('/')
    }
  }

  // Don't render if no user
  if (!user) {
    return null
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar currentPage="profile" />
        <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#022b41] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen">
        <Navbar currentPage="profile" />
        
        {/* Hero Section */}
        <section 
          className="relative py-10 min-h-[35vh] flex items-center justify-center overflow-hidden"
          style={{
            backgroundImage: 'url(/assets/aboutus.jpg)',
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            backgroundColor: '#022b41'
          }}
        >
          <div className="absolute inset-0" style={{ backgroundColor: '#022b41', opacity: 0.7 }} />
          
          <div className="relative z-10 text-center">
            <h1 
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white"
              style={{ 
                animation: 'fadeInUp 1.5s ease-out',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
              }}
            >
              MANAGE PROFILE
            </h1>
          </div>
        </section>

        {/* Profile Form Section */}
        <section 
          className="py-16 lg:py-20"
          style={{ backgroundColor: '#F6F4F1' }}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center mb-12">
              <p 
                className="text-sm font-semibold tracking-wider uppercase mb-4"
                style={{ color: '#b29578' }}
              >
                YOUR ACCOUNT INFORMATION
              </p>
              <h2 
                className="text-2xl sm:text-3xl lg:text-4xl font-bold"
                style={{ color: '#022b41' }}
              >
                PROFILE SETTINGS
              </h2>
            </div>

            <div className="bg-white rounded-xl shadow-xl p-8 lg:p-12">
              {error && (
                <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-600">{success}</p>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  <div>
                    <label className="block text-base font-semibold text-gray-700 mb-3">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      required
                      className={`w-full px-5 py-4 text-lg border rounded-xl transition-all duration-200 ${
                        isEditing 
                          ? 'border-gray-300 bg-white focus:border-[#022b41] focus:outline-none focus:ring-2 focus:ring-[#022b41]/20' 
                          : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-base font-semibold text-gray-700 mb-3">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      required
                      className={`w-full px-5 py-4 text-lg border rounded-xl transition-all duration-200 ${
                        isEditing 
                          ? 'border-gray-300 bg-white focus:border-[#022b41] focus:outline-none focus:ring-2 focus:ring-[#022b41]/20' 
                          : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-base font-semibold text-gray-700 mb-3">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="w-full px-5 py-4 text-lg border border-gray-200 bg-gray-50 rounded-xl cursor-not-allowed"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Email address cannot be changed. Contact support if you need to update your email.
                    </p>
                  </div>

                  <div>
                    <label className="block text-base font-semibold text-gray-700 mb-3">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Enter your phone number"
                      className={`w-full px-5 py-4 text-lg border rounded-xl transition-all duration-200 ${
                        isEditing 
                          ? 'border-gray-300 bg-white focus:border-[#022b41] focus:outline-none focus:ring-2 focus:ring-[#022b41]/20' 
                          : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                      }`}
                    />
                  </div>

                </div>

                {/* Only show form buttons when editing */}
                {isEditing && (
                  <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-12 py-4 bg-[#022b41] hover:bg-[#033a56] disabled:bg-gray-400 text-white rounded-xl font-bold text-lg uppercase tracking-wider transition-colors duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none"
                    >
                      {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={isSubmitting}
                      className="px-12 py-4 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white rounded-xl font-bold text-lg uppercase tracking-wider transition-colors duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </form>

              {/* Edit Profile button - outside form to prevent accidental submission */}
              {!isEditing && (
                <div className="mt-12 flex justify-center">
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="px-12 py-4 bg-[#022b41] hover:bg-[#033a56] text-white rounded-xl font-bold text-lg uppercase tracking-wider transition-colors duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Edit Profile
                  </button>
                </div>
              )}

              {/* Profile Information Display */}
              {!isEditing && (
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">Account Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">Full Name</h4>
                      <p className="text-lg font-medium text-gray-900">
                        {formData.firstName} {formData.lastName}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <h4 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-2">Contact Info</h4>
                      <p className="text-lg font-medium text-gray-900">{formData.email}</p>
                      {formData.phone && (
                        <p className="text-base text-gray-700 mt-1">{formData.phone}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Account Actions */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">Account Actions</h3>
                <div className="flex justify-center">
                  <button
                    onClick={() => setShowLogoutModal(true)}
                    className="px-8 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 font-semibold rounded-lg transition-all duration-200"
                  >
                    Sign Out of Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl p-8 mx-4 max-w-md w-full shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Sign Out</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to sign out of your account?
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors duration-200"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
