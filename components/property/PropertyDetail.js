// /components/property/PropertyDetail.js
'use client'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Bookmark, ChevronLeft, ChevronRight, ExternalLink, Search } from 'lucide-react'

export function PropertyDetail({ property }) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [purchasePrice, setPurchasePrice] = useState(property.price || property.purchase_price || 0)
  const [downPaymentPercent, setDownPaymentPercent] = useState(25)
  const [estimatedRent, setEstimatedRent] = useState(property.estimated_rent || 0)
  const mapRef = useRef(null)

  // Build full address
  const fullAddress = property.full_address || property.display_address ||
    `${property.address || ''}, ${property.city || ''}, ${property.state || ''} ${property.zip_code || ''}`.trim()

  const formatPrice = (price) => {
    if (!price) return '-'
    return `$${Math.round(price).toLocaleString()}`
  }

  const formatPercent = (value) => {
    if (!value && value !== 0) return '-'
    return `${value.toFixed(1)}%`
  }

  // Calculate financial metrics
  const downPayment = purchasePrice * (downPaymentPercent / 100)
  const loanAmount = purchasePrice - downPayment
  const monthlyInterestRate = 0.07 / 12 // 7% annual rate
  const numberOfPayments = 30 * 12 // 30 years
  const monthlyPayment = loanAmount > 0
    ? loanAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) /
      (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1)
    : 0

  const annualRent = estimatedRent * 12
  const annualExpenses = (property.hoa_fees ? parseFloat(property.hoa_fees.replace(/[^0-9.]/g, '')) * 12 : 0) +
    (purchasePrice * 0.01) + // Property tax estimate (1%)
    (purchasePrice * 0.005) + // Insurance estimate (0.5%)
    (annualRent * 0.1) // Maintenance estimate (10% of rent)
  const netOperatingIncome = annualRent - annualExpenses
  const annualDebtService = monthlyPayment * 12
  const netCashFlow = netOperatingIncome - annualDebtService
  const monthlyNetCashFlow = netCashFlow / 12

  // Financial metrics from DB or calculated
  const grossYield = property.gross_yield || (purchasePrice > 0 ? (annualRent / purchasePrice) * 100 : 0)
  const capRate = property.cap_rate || (purchasePrice > 0 ? (netOperatingIncome / purchasePrice) * 100 : 0)
  const cashOnCash = property.cash_on_cash || (downPayment > 0 ? (netCashFlow / downPayment) * 100 : 0)
  const estNetCashFlow = property.est_net_cash_flow || monthlyNetCashFlow

  // Photo gallery
  const photos = property.photos || []
  const currentPhoto = photos[currentPhotoIndex]

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length)
  }

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length)
  }

  // Initialize Google Map
  useEffect(() => {
    if (!property.address_google_lat || !property.address_google_lng) return

    const loadGoogleMaps = () => {
      if (window.google && mapRef.current) {
        const map = new window.google.maps.Map(mapRef.current, {
          center: {
            lat: parseFloat(property.address_google_lat),
            lng: parseFloat(property.address_google_lng)
          },
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        })

        new window.google.maps.Marker({
          position: {
            lat: parseFloat(property.address_google_lat),
            lng: parseFloat(property.address_google_lng)
          },
          map: map,
          title: fullAddress
        })
      }
    }

    if (!window.google) {
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}`
      script.async = true
      script.defer = true
      script.onload = loadGoogleMaps
      document.head.appendChild(script)
    } else {
      loadGoogleMaps()
    }
  }, [property.address_google_lat, property.address_google_lng, fullAddress])

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Marketplace Style with Deelmap Color */}
      <nav className="bg-[#152343] border-b border-gray-700 w-full relative z-30">
        <div className="flex items-center justify-between h-16 px-4 lg:px-6">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image
                src="/assets/logo.webp"
                alt="Logo"
                width={140}
                height={45}
                className="h-9 w-auto"
                priority
              />
            </Link>
          </div>

          {/* Search Bar - Center */}
          <div className="flex-1 max-w-2xl mx-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by address, market, or zip code"
                className="w-full pl-12 pr-4 py-2.5 bg-[#1a2d4d] border border-gray-600 rounded-lg text-sm text-white placeholder:text-gray-400 focus:ring-2 focus:ring-[#4A90E2] focus:border-[#4A90E2] focus:outline-none"
              />
            </div>
          </div>

          {/* Right Side - Login / Sign up */}
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-white hover:text-gray-200"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 text-sm font-medium text-white bg-[#4A90E2] hover:bg-[#357ABD] rounded-lg transition-colors"
            >
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      {/* Back to All Listings */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <Link
            href="/marketplace"
            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>All listings</span>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Photos */}
          <div className="lg:col-span-2">
            {/* Photo Gallery */}
            <div className="mb-6">
              <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ height: '420px' }}>
                {photos.length > 0 ? (
                  <>
                    <Image
                      src={currentPhoto?.photo_url || '/placeholder.jpg'}
                      alt={`Property photo ${currentPhotoIndex + 1}`}
                      fill
                      className="object-cover"
                    />
                    {photos.length > 1 && (
                      <>
                        <button
                          onClick={prevPhoto}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg"
                        >
                          <ChevronLeft className="h-6 w-6 text-gray-800" />
                        </button>
                        <button
                          onClick={nextPhoto}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg"
                        >
                          <ChevronRight className="h-6 w-6 text-gray-800" />
                        </button>
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                          {currentPhotoIndex + 1} / {photos.length}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-gray-400">No photos available</span>
                  </div>
                )}
              </div>

              {/* Thumbnail strip */}
              {photos.length > 1 && (
                <div className="grid grid-cols-6 gap-2 mt-4">
                  {photos.slice(0, 6).map((photo, idx) => (
                    <button
                      key={photo.id || idx}
                      onClick={() => setCurrentPhotoIndex(idx)}
                      className={`relative aspect-video rounded overflow-hidden border-2 ${
                        idx === currentPhotoIndex ? 'border-blue-600' : 'border-transparent'
                      }`}
                    >
                      <Image
                        src={photo.photo_url}
                        alt={`Thumbnail ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                  {photos.length > 6 && (
                    <div className="relative aspect-video rounded overflow-hidden bg-gray-800 flex items-center justify-center text-white text-sm font-medium">
                      +{photos.length - 6}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Property Address & Basic Info */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{fullAddress}</h1>
              <div className="text-4xl font-bold text-gray-900 mb-1">{formatPrice(property.price)}</div>
              {property.status && (
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  {property.status}
                </span>
              )}
            </div>

            {/* Basic Stats */}
            <div className="flex items-center gap-6 mb-6 text-gray-700">
              {property.bedrooms && (
                <div className="text-lg">
                  <span className="font-semibold">{property.bedrooms}</span> beds
                </div>
              )}
              {property.bathrooms && (
                <div className="text-lg">
                  <span className="font-semibold">{property.bathrooms}</span> baths
                </div>
              )}
              {property.sqft && (
                <div className="text-lg">
                  <span className="font-semibold">{property.sqft.toLocaleString()}</span> sq ft
                </div>
              )}
              {property.year_built && (
                <div className="text-lg">
                  Built in <span className="font-semibold">{property.year_built}</span>
                </div>
              )}
            </div>

            {/* Financial Metrics */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div>
                <div className="text-2xl font-bold text-gray-900">{formatPercent(grossYield)}</div>
                <div className="text-sm text-gray-600">Gross yield</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{formatPercent(capRate)}</div>
                <div className="text-sm text-gray-600">Cap rate</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{formatPercent(cashOnCash)}</div>
                <div className="text-sm text-gray-600">Cash on cash</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{formatPrice(estNetCashFlow)}</div>
                <div className="text-sm text-gray-600">Est. cash flow</div>
              </div>
            </div>

            {/* Purchase Calculator */}
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Purchase price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                    <input
                      type="number"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || 0)}
                      className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Down payment</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={downPaymentPercent}
                      onChange={(e) => setDownPaymentPercent(parseFloat(e.target.value) || 0)}
                      className="w-full pr-7 pl-3 py-2 border border-gray-300 rounded-lg"
                    />
                    <span className="absolute right-3 top-2.5 text-gray-500">%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estimated rent</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                    <input
                      type="number"
                      value={estimatedRent}
                      onChange={(e) => setEstimatedRent(parseFloat(e.target.value) || 0)}
                      className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Edit assumptions
                </button>
                <div className="flex items-center text-sm text-orange-600">
                  <span className="mr-2">⚠</span>
                  <span>Low confidence</span>
                </div>
              </div>
            </div>

            {/* About This Property */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">About this property</h2>
              <div className="text-gray-700 leading-relaxed">
                {property.description || 'No description available.'}
              </div>
              {property.description && property.description.length > 300 && (
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 flex items-center">
                  Show more
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}
            </div>

            {/* Property Details Table */}
            <div className="border-t border-gray-200 pt-6">
              <div className="space-y-3">
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Days on market</span>
                  <span className="font-medium text-gray-900">{property.days_on_market || '-'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Property type</span>
                  <span className="font-medium text-gray-900">{property.property_type || '-'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Price per square foot</span>
                  <span className="font-medium text-gray-900">
                    {property.price_per_square_foot ? `$${property.price_per_square_foot}` : '-'}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Lot size</span>
                  <span className="font-medium text-gray-900">{property.lot_size || '-'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">HOA fees</span>
                  <span className="font-medium text-gray-900">{property.hoa_fees || '-'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Neighborhood score</span>
                  <span className="font-medium text-gray-900">
                    {property.neighborhood_score ? `${property.neighborhood_score} / 5` : '-'}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">School score</span>
                  <span className="font-medium text-gray-900">
                    {property.school_score ? `${property.school_score} / 10` : '-'}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Crime score</span>
                  <span className="font-medium text-gray-900">
                    {property.crime_score ? `${property.crime_score} / 10` : '-'}
                  </span>
                </div>
              </div>
            </div>

            {/* MLS Information */}
            {(property.agent_name || property.mls_number) && (
              <div className="mt-6 border-t border-gray-200 pt-6">
                <div className="flex items-start">
                  {property.data_source_brokerage && (
                    <div className="mr-4">
                      <div className="text-sm font-medium text-gray-900">
                        Listed By: {property.agent_name || 'N/A'}
                        {property.mls_number && `, ${property.mls_number}`}
                      </div>
                      <div className="text-sm text-gray-600">
                        Source: {property.data_source_brokerage}
                        {property.mls_last_updated_at && (
                          <>, last updated on {new Date(property.mls_last_updated_at).toLocaleDateString()}</>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* External Links */}
            <div className="mt-6 flex items-center gap-4">
              {property.listing_url && (
                <a
                  href={property.listing_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Zillow listing
                </a>
              )}
              {property.address_google_lat && property.address_google_lng && (
                <a
                  href={`https://www.google.com/maps?q=${property.address_google_lat},${property.address_google_lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Google maps
                </a>
              )}
            </div>
          </div>

          {/* Right Column - Actions & Info */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              {/* Data Source & Save */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {property.data_source_brokerage && (
                    <>
                      <span className="text-sm font-medium text-gray-700">Data Source Brokerage:</span>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-semibold text-gray-900">
                          {property.data_source_brokerage}
                        </span>
                        {property.mls_source_name && (
                          <span className="text-sm text-gray-600">{property.mls_source_name}</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
                <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
                  <Bookmark className="h-5 w-5" />
                  <span>Save</span>
                </button>
              </div>

              {/* Connect with Agent Card */}
              <div className="bg-blue-600 text-white rounded-lg p-6 mb-4">
                <h3 className="text-lg font-semibold mb-2">Connect with an agent</h3>
                <button className="w-full bg-white text-blue-600 font-semibold py-3 rounded-lg hover:bg-gray-50">
                  Contact Agent
                </button>
              </div>

              {/* Google Maps Preview */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div
                  ref={mapRef}
                  className="w-full h-[400px]"
                  style={{ minHeight: '400px' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
