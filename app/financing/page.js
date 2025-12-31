'use client'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { AuthModal } from '@/components/AuthModal'
import { useAuth } from '@/hooks/useAuth'
import { useState } from 'react'

export default function FinancingPage() {
  const { user } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    propertyType: '',
    transactionType: '',
    loanAmount: '',
    creditScore: '',
    comments: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const submitToMonday = async (data) => {
    const mutation = `
      mutation ($boardId: ID!, $groupId: String!, $itemName: String!, $columnValues: JSON!) {
        create_item (
          board_id: $boardId,
          group_id: $groupId,
          item_name: $itemName,
          column_values: $columnValues
        ) {
          id
        }
      }
    `

    // Clean phone number - remove all non-numeric characters
    const cleanedPhone = data.phone.replace(/\D/g, '')

    const columnValues = {
      short_text_mkkzeeqc: data.lastName,
      email_mkkzetwa: { email: data.email, text: data.email },
      phone_mkkz1s7x: cleanedPhone,
      single_select_mkkzwvhe: { label: data.propertyType },
      single_select_mkkz5zhz: { label: data.transactionType },
      number_mkme6wx0: parseFloat(data.loanAmount) || 0,
      single_select_mkkz1688: { label: data.creditScore }
    }

    // Add comments if provided
    if (data.comments && data.comments.trim()) {
      columnValues.long_text_mkkzmg6r = data.comments
    }

    const variables = {
      boardId: "8175758520",
      groupId: "topics",
      itemName: data.firstName,
      columnValues: JSON.stringify(columnValues)
    }

    try {
      const response = await fetch('https://api.monday.com/v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjQzMTQ5MDY2OCwiYWFpIjoxMSwidWlkIjo2NzgyNDc3MywiaWFkIjoiMjAyNC0xMS0wM1QxMDo0OToyMi4wMDBaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MTQ5NDQ5MTQsInJnbiI6InVzZTEifQ.M2y5qvKTBugSmKQLJnPFinl9o1h0H70yCAVnsM75p0M'
        },
        body: JSON.stringify({ query: mutation, variables })
      })

      if (!response.ok) {
        throw new Error('Failed to submit to Monday.com')
      }

      const result = await response.json()
      
      if (result.errors) {
        console.error('Monday.com API errors:', result.errors)
        throw new Error(result.errors[0]?.message || 'Failed to create item')
      }

      return result
    } catch (error) {
      console.error('Error submitting to Monday.com:', error)
      throw error
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Check if user is logged in
    if (!user) {
      setShowAuthModal(true)
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      // Submit to Monday.com first
      const mondayResult = await submitToMonday(formData)
      const mondayItemId = mondayResult?.data?.create_item?.id

      // Save to Supabase
      const response = await fetch('/api/financing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          propertyType: formData.propertyType,
          transactionType: formData.transactionType,
          loanAmount: formData.loanAmount,
          creditScore: formData.creditScore,
          comments: formData.comments,
          mondayItemId: mondayItemId
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save financing request')
      }

      setSubmitted(true)
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        propertyType: '',
        transactionType: '',
        loanAmount: '',
        creditScore: '',
        comments: ''
      })
    } catch (error) {
      console.error('Submission error:', error)
      setError('There was an error submitting your request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen">
        <Navbar currentPage="financing" />
        <div className="min-h-[60vh] flex items-center justify-center bg-gray-50">
          <div className="text-center p-8">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
            <p className="text-gray-600">Your financing request has been submitted successfully. We'll get back to you soon.</p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-4 text-[#022b41] hover:underline"
            >
              Submit another request
            </button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar currentPage="financing" />

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialStep="login"
      />

      {/* Form Section */}
      <section
        className="py-16 lg:py-20 relative"
        style={{ backgroundColor: '#F6F4F1' }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section Header */}
          <div className="text-center mb-12">
            <p
              className="text-sm font-semibold tracking-wider uppercase mb-4"
              style={{ color: 'var(--secondary-color)' }}
            >
              GET STARTED WITH FINANCING
            </p>
            <h2
              className="text-2xl sm:text-3xl lg:text-4xl font-bold"
              style={{ color: 'var(--primary-color)' }}
            >
              REQUEST FINANCING
            </h2>
          </div>

          {/* Financing Form */}
          <div className="relative">
            <form onSubmit={handleSubmit} className={`bg-white rounded-lg shadow-lg p-6 lg:p-8 ${!user ? 'blur-sm pointer-events-none select-none' : ''}`}>
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#022b41] focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#022b41] focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#022b41] focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="+1 222 333 4444"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#022b41] focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Type of Property */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type of Property <span className="text-red-500">*</span>
                </label>
                <select
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#022b41] focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select property type</option>
                  <option value="Single Family">Single Family</option>
                  <option value="2-4 Units">2-4 Units</option>
                  <option value="5+ Units">5+ Units</option>
                </select>
              </div>

              {/* Transaction Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="transactionType"
                  value={formData.transactionType}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#022b41] focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select transaction type</option>
                  <option value="Purchase">Purchase</option>
                  <option value="Cash Out Refinance">Cash Out Refinance</option>
                  <option value="Rate & Term Refinance">Rate & Term Refinance</option>
                </select>
              </div>

              {/* Loan Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loan Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="loanAmount"
                  value={formData.loanAmount}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="1000"
                  placeholder="$"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#022b41] focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Credit Score */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Credit Score <span className="text-red-500">*</span>
                </label>
                <select
                  name="creditScore"
                  value={formData.creditScore}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#022b41] focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select credit score range</option>
                  <option value="Under 550">Under 550</option>
                  <option value="660 - 680">660 - 680</option>
                  <option value="680 - 700">680 - 700</option>
                  <option value="700 - 700">700 - 700</option>
                  <option value="720 - 740">720 - 740</option>
                  <option value="740 - 760">740 - 760</option>
                  <option value="760+">760+</option>
                </select>
              </div>

              {/* Comments or Questions */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comments or Questions
                </label>
                <textarea
                  name="comments"
                  value={formData.comments}
                  onChange={handleInputChange}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#022b41] focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Tell us more about your financing needs..."
                />
              </div>

            </div>

            {/* Submit Button */}
            <div className="mt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#022b41] hover:bg-[#033a56] disabled:bg-gray-400 text-white py-4 px-6 rounded-lg font-bold text-lg uppercase tracking-wider transition-colors duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'SUBMITTING...' : 'SUBMIT REQUEST'}
              </button>
            </div>
          </form>

          {/* Login Prompt Overlay - Only shown when user is not logged in */}
          {!user && (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md mx-4 pointer-events-auto border-2 border-[#022b41]">
                <div className="text-center">
                  {/* Lock Icon */}
                  <div className="w-16 h-16 bg-[#022b41] rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Login Required
                  </h3>

                  <p className="text-gray-600 mb-6 text-base">
                    Please sign in or create an account to submit a financing request. This helps us provide you with personalized service and track your applications.
                  </p>

                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="w-full bg-[#022b41] hover:bg-[#033a56] text-white py-3 px-6 rounded-lg font-bold text-lg uppercase tracking-wider transition-colors duration-200 shadow-lg hover:shadow-xl"
                  >
                    Login / Sign Up
                  </button>

                  <p className="text-sm text-gray-500 mt-4">
                    Don't have an account? Sign up takes less than a minute!
                  </p>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
