'use client'
import Image from 'next/image'
import Link from 'next/link'
import { Share2, Bed, Bath, Square, Lock } from 'lucide-react'
import { useState } from 'react'
import { ShareModal } from './ShareModal'

export default function PropertyCard({ property, isLoggedIn = false }) {
  const [showShare, setShowShare] = useState(false)

  const {
    id,
    property_photos,
    price,
    bedrooms,
    bathrooms,
    sqft,
    full_address,
    address,
    city,
    state,
    zip_code,
    status,
    gross_yield,
    cap_rate,
    cash_on_cash,
    price_per_square_foot,
    year_built,
  } = property

  // Get the first photo or use placeholder
  const featureImage = property_photos?.[0]?.photo_url ||
    'https://via.placeholder.com/300x225/f3f4f6/9ca3af?text=Property+Image'

  // Create display address
  const fullAddressText = full_address ||
    `${address || ''}, ${city || ''}, ${state || ''} ${zip_code || ''}`.trim()

  // Function to get partial address (everything after first comma)
  const getDisplayAddress = (fullAddr) => {
    if (!fullAddr) return ''
    if (isLoggedIn) return fullAddr

    const firstCommaIndex = fullAddr.indexOf(',')
    if (firstCommaIndex === -1) return fullAddr

    return fullAddr.substring(firstCommaIndex + 1).trim()
  }

  const displayAddress = getDisplayAddress(fullAddressText)

  // Create slug from ID for URL
  const slug = id
  const shareUrl = `https://ableman.co/property/${id}`

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'sold': return 'bg-red-500'
      case 'pending': return 'bg-orange-500'
      case 'available':
      default: return 'bg-[#b29578]'
    }
  }

  const formatPrice = (price) => {
    if (!price) return 'Contact for Price'
    return `$${Math.round(price).toLocaleString()}`
  }

  return (
    <>
      <Link href={`/${slug}`} className="block">
        <div className="group bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-200 overflow-hidden border border-gray-200">
          <div className="relative h-[200px] overflow-hidden">
            <Image
              src={featureImage}
              alt={fullAddressText || 'Property'}
              fill
              className="object-cover"
            />

            {/* Photo count badge - top left like Stessa */}
            <div className="absolute top-2 left-2">
              <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-[10px] font-semibold text-gray-800 rounded shadow-sm">
                {property_photos?.length > 0 ? `${property_photos.length} PHOTOS` : '1 PHOTO'}
              </span>
            </div>

            {/* Share button - top right */}
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setShowShare(true)
              }}
              className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-sm z-10"
            >
              <Share2 className="w-4 h-4 text-gray-700" />
            </button>
          </div>

          <div className="p-3">
            {/* Price */}
            <div className="text-xl font-bold text-gray-900 mb-1">
              {formatPrice(price)}
            </div>

            {/* Address */}
            <p className="text-sm text-gray-600 mb-3 line-clamp-1">
              {displayAddress}
            </p>

            {/* Property details - single line with bullets like Stessa */}
            <div className="flex items-center text-sm text-gray-700 mb-3">
              {bedrooms && <span className="font-medium">{bedrooms} bd</span>}
              {bedrooms && bathrooms && <span className="mx-1.5">•</span>}
              {bathrooms && <span className="font-medium">{bathrooms} ba</span>}
            </div>

            {/* Metrics Row - exactly like Stessa */}
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100">
              <div>
                <div className="text-xs text-gray-500 mb-1">Gross yield</div>
                <div className="text-base font-bold text-gray-900">
                  {gross_yield ? `${gross_yield}%` : '-'}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Cap rate</div>
                <div className="text-base font-bold text-gray-900">
                  {cap_rate ? `${cap_rate}%` : '-'}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Cash on cash</div>
                <div className="text-base font-bold text-gray-900">
                  {cash_on_cash ? `${cash_on_cash}%` : '-'}
                </div>
              </div>
            </div>

            {!isLoggedIn && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
                <Lock className="w-3.5 h-3.5" />
                <span>Sign in to see full details</span>
              </div>
            )}
          </div>
        </div>
      </Link>

      <ShareModal
        isOpen={showShare}
        onClose={() => setShowShare(false)}
        url={shareUrl}
        title={fullAddressText || 'Property'}
        description={`${bedrooms || 0} bed, ${bathrooms || 0} bath property${price ? ` for ${formatPrice(price)}` : ''}`}
      />
    </>
  )
}