'use client'
import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import Link from 'next/link'
import { Menu } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'
import { AuthModal } from '@/components/AuthModal'

// Portal-based Profile Dropdown Component
function ProfileDropdown({ user, onLogout, triggerRef, isOpen, onClose }) {
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const dropdownRef = useRef(null)

  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + 12,
        left: rect.right - 288,
      })
    }
  }

  useEffect(() => {
    if (isOpen) {
      updatePosition()
      
      const handleUpdate = () => updatePosition()
      window.addEventListener('scroll', handleUpdate, true)
      window.addEventListener('resize', handleUpdate)
      
      return () => {
        window.removeEventListener('scroll', handleUpdate, true)
        window.removeEventListener('resize', handleUpdate)
      }
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          onClose()
        }
      }
      
      const handleClickOutside = (e) => {
        if (
          triggerRef.current && 
          !triggerRef.current.contains(e.target) &&
          dropdownRef.current &&
          !dropdownRef.current.contains(e.target)
        ) {
          onClose()
        }
      }

      document.addEventListener('keydown', handleEscape)
      document.addEventListener('mousedown', handleClickOutside)
      
      return () => {
        document.removeEventListener('keydown', handleEscape)
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen, onClose])

  const handleLogoutClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    onClose()
    
    setTimeout(() => {
      onLogout()
    }, 50)
  }

  if (!isOpen) return null

  return createPortal(
    <div
      ref={dropdownRef}
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        width: '288px',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        padding: '12px 0',
        zIndex: 99999,
        opacity: 1,
        visibility: 'visible',
        pointerEvents: 'auto'
      }}
    >
      <div 
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid #f1f5f9',
          background: 'transparent'
        }}
      >
        <p 
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '6px',
            display: 'block',
            lineHeight: 1.2,
            margin: '0 0 6px 0',
            padding: 0,
            opacity: 1,
            visibility: 'visible'
          }}
        >
          Signed in as
        </p>
        <p 
          style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#1e293b',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: 'block',
            lineHeight: 1.3,
            margin: 0,
            padding: 0,
            opacity: 1,
            visibility: 'visible'
          }}
        >
          {user.email}
        </p>
      </div>
      <div 
        style={{
          padding: '8px 0',
          background: 'transparent'
        }}
      >
        <Link
          href="/buyer/dashboard"
          onClick={onClose}
          style={{
            width: '100%',
            textAlign: 'left',
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: 500,
            color: '#1e293b',
            transition: 'background-color 0.2s ease',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            display: 'block',
            opacity: 1,
            visibility: 'visible',
            textDecoration: 'none'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#f8fafc'
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent'
          }}
        >
          Buyer Portal
        </Link>
        <button
          onClick={handleLogoutClick}
          style={{
            width: '100%',
            textAlign: 'left',
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: 500,
            color: '#dc2626',
            transition: 'background-color 0.2s ease',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            display: 'block',
            opacity: 1,
            visibility: 'visible'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#fef2f2'
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent'
          }}
        >
          Sign Out
        </button>
      </div>
    </div>,
    document.body
  )
}

export function Navbar({ currentPage = 'home' }) {
  const { user, signOut } = useAuth()
  const [showAuth, setShowAuth] = useState(false)
  const [authInitialStep, setAuthInitialStep] = useState('signup')
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  const profileButtonRef = useRef(null)

  const getUserInitials = (user) => {
    // Check for first_name and last_name first (new structure)
    if (user?.first_name && user?.last_name) {
      return (user.first_name[0] + user.last_name[0]).toUpperCase()
    }
    // Check for user_metadata name (Supabase auth)
    else if (user?.user_metadata?.name) {
      const nameParts = user.user_metadata.name.trim().split(' ')
      if (nameParts.length >= 2) {
        return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
      } else {
        return nameParts[0][0].toUpperCase()
      }
    }
    // Check for single first_name
    else if (user?.first_name) {
      return user.first_name[0].toUpperCase()
    }
    // Check for single last_name
    else if (user?.last_name) {
      return user.last_name[0].toUpperCase()
    }
    // Fallback to email
    else if (user?.email) {
      return user.email[0].toUpperCase()
    }
    return 'U'
  }

  const getUserDisplayName = (user) => {
    // Check for first_name and last_name first (new structure)
    if (user?.first_name || user?.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim()
    }
    // Check for user_metadata name (Supabase auth)
    else if (user?.user_metadata?.name) {
      return user.user_metadata.name
    }
    // Fallback to email username
    else if (user?.email) {
      return user.email.split('@')[0]
    }
    return 'User'
  }

  const handleLogout = async () => {
    try {
      setShowProfile(false)
      await signOut()
      window.location.reload()
    } catch (error) {
      console.error('Logout error:', error)
      localStorage.clear()
      sessionStorage.clear()
      window.location.reload()
    }
  }

  const menuItems = [
    { label: 'Home', href: '/', page: 'home' },
    { label: 'About Us', href: '/about', page: 'about' },
    { label: 'Cash Offer', href: '/cashoffer', page: 'cashoffer' },
    { label: 'MarketPlace', href: '/marketplace', page: 'marketplace' },
    { label: 'Financing', href: '/financing', page: 'financing', hasNew: true },
    { label: 'Investor Resources', href: '/resources', page: 'resources' },
    { label: 'Contact Us', href: '/contact', page: 'contact' }
  ]

  return (
    <>
      <nav className="bg-[#022b41] text-white shadow-lg w-full relative z-30">
        <div className="flex items-center justify-between h-20 md:h-24 px-3 sm:px-4 lg:px-6">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image
                src="/assets/ablemanlogo.png"
                alt="Ableman"
                width={200}
                height={65}
                className="h-12 sm:h-14 lg:h-16 w-auto"
                priority
              />
            </Link>
          </div>

          {/* Desktop & Tablet Navigation */}
          <div className="flex items-center space-x-2 lg:space-x-4">
            {/* Navigation Links - Show on large tablets and up */}
            <div className="hidden lg:flex items-center space-x-1">
              {menuItems.map((item) => (
                <div key={item.label} className="relative">
                  <Link
                    href={item.href}
                    className={`relative px-3 xl:px-4 py-2 text-xs xl:text-sm font-medium transition-colors duration-200 rounded-lg whitespace-nowrap ${
                      currentPage === item.page
                        ? 'text-[#b29578] bg-white/10'
                        : 'text-white hover:text-[#b29578] hover:bg-white/5'
                    }`}
                  >
                    {item.label}
                  </Link>
                  {item.hasNew && (
                    <span className="absolute -top-2 right-1/2 translate-x-1/2 bg-[#b29578] text-white text-[9px] px-1.5 py-0.5 rounded-full font-semibold shadow-sm">
                      NEW
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Auth Section - Responsive for all screen sizes */}
            <div className="hidden sm:flex items-center space-x-2 lg:space-x-3">
              {user ? (
                <div className="relative">
                  <button
                    ref={profileButtonRef}
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowProfile(!showProfile)
                    }}
                    className="flex items-center space-x-2 text-white hover:text-[#b29578] transition-colors focus:outline-none"
                  >
                    <span className="text-xs lg:text-sm font-medium hidden md:inline max-w-[100px] lg:max-w-none truncate">
                      {getUserDisplayName(user)}
                    </span>
                    <div className="w-8 h-8 lg:w-9 lg:h-9 bg-[#b29578] rounded-full flex items-center justify-center text-white font-semibold text-xs lg:text-sm hover:bg-[#9a7e61] transition-colors flex-shrink-0">
                      {getUserInitials(user)}
                    </div>
                  </button>

                  <ProfileDropdown
                    user={user}
                    onLogout={handleLogout}
                    triggerRef={profileButtonRef}
                    isOpen={showProfile}
                    onClose={() => setShowProfile(false)}
                  />
                </div>
              ) : (
                <Button
                  onClick={() => {
                    setAuthInitialStep('signup')
                    setShowAuth(true)
                  }}
                  className="bg-[#b29578] hover:bg-[#9a7e61] text-white px-4 lg:px-6 py-2 lg:py-2.5 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg text-xs lg:text-sm whitespace-nowrap"
                >
                  Join Ableman
                </Button>
              )}
            </div>

            {/* Mobile/Tablet Menu Button */}
            <div className="flex lg:hidden">
              <button
                onClick={() => setShowMobileMenu(true)}
                className="p-2 text-white hover:text-[#b29578] hover:bg-white/10 rounded-lg transition-colors"
              >
                <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile/Tablet Navigation Sidebar */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-[9999] lg:hidden">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowMobileMenu(false)} />
          
          {/* Sidebar */}
          <div className="fixed right-0 top-0 h-full w-80 bg-[#022b41] transform transition-transform duration-300 ease-in-out shadow-2xl z-[10000]">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-600">
              <h2 className="text-white text-xl font-bold">Menu</h2>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="text-white hover:text-[#b29578] p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Menu Items */}
            <div className="p-6 space-y-2">
              {menuItems.map((item) => (
                <div key={item.label} className="relative">
                  <Link
                    href={item.href}
                    onClick={() => setShowMobileMenu(false)}
                    className={`block py-4 px-4 text-base font-medium transition-colors duration-200 rounded-lg ${
                      currentPage === item.page
                        ? 'text-[#b29578] bg-white/10'
                        : 'text-white hover:text-[#b29578] hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{item.label}</span>
                      {item.hasNew && (
                        <span className="bg-[#b29578] text-white text-xs px-2 py-1 rounded-full font-semibold">
                          NEW
                        </span>
                      )}
                    </div>
                  </Link>
                </div>
              ))}
            </div>
            
            {/* User Section */}
            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-600 bg-[#033a56]">
              {user ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 text-white">
                    <div className="w-10 h-10 bg-[#b29578] rounded-full flex items-center justify-center text-white font-semibold">
                      {getUserInitials(user)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {getUserDisplayName(user)}
                      </div>
                      <div className="text-xs text-gray-300 truncate">
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowMobileMenu(false)
                      handleLogout()
                    }}
                    className="w-full text-left py-3 px-4 text-white hover:text-[#b29578] hover:bg-white/5 rounded-lg transition-colors font-medium"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <Button
                  onClick={() => {
                    setShowMobileMenu(false)
                    setAuthInitialStep('signup')
                    setShowAuth(true)
                  }}
                  className="w-full bg-[#b29578] hover:bg-[#9a7e61] text-white py-4 text-base font-medium rounded-lg shadow-lg"
                >
                  Join Ableman
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuth} 
        onClose={() => setShowAuth(false)}
        initialStep={authInitialStep}
      />
    </>
  )
}