'use client'
import { useState } from 'react'
import { Map, LayoutGrid } from 'lucide-react'
import { MarketplaceNavbar } from '@/components/layout/MarketplaceNavbar'
import { FilterBar } from '@/components/property/FilterBar'
import { PropertyMap } from '@/components/property/PropertyMap'
import PropertyCard from '@/components/property/PropertyCard'
import { AuthModal } from '@/components/AuthModal'
import { useProperties } from '@/hooks/useProperties'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'

export default function DealsPage() {
  const { user } = useAuth()
  const [filters, setFilters] = useState({
    states: [],
    statuses: ['all'], // Show all properties by default
    minPrice: undefined,
    maxPrice: undefined,
    minBeds: undefined,
    maxBeds: undefined,
    minBaths: undefined,
    maxBaths: undefined,
    minFloorArea: undefined,
    maxFloorArea: undefined
  })

  const [selectedProperty, setSelectedProperty] = useState(null)
  const [viewMode, setViewMode] = useState('list')
  const [mobileTab, setMobileTab] = useState('list') // 'list' or 'map'
  const [sortBy, setSortBy] = useState('newest') // 'newest', 'price-low', 'price-high'
  const [searchQuery, setSearchQuery] = useState('')
  const { properties, loading, error } = useProperties(filters)
  const [showAuth, setShowAuth] = useState(false)
  const [authInitialStep, setAuthInitialStep] = useState('signup')

  const handleMarkerClick = (property) => setSelectedProperty(property)
  const handleFiltersChange = (newFilters) => setFilters(newFilters)

  // Filter and sort properties
  const getFilteredAndSortedProperties = () => {
    let filtered = [...properties]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p =>
        p.address?.toLowerCase().includes(query) ||
        p.full_address?.toLowerCase().includes(query) ||
        p.city?.toLowerCase().includes(query) ||
        p.state?.toLowerCase().includes(query) ||
        p.zip_code?.toLowerCase().includes(query)
      )
    }

    // Sort
    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    } else if (sortBy === 'price-low') {
      filtered.sort((a, b) => (a.price || 0) - (b.price || 0))
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => (b.price || 0) - (a.price || 0))
    }

    return filtered
  }

  const filteredProperties = getFilteredAndSortedProperties()

  const RightHeader = () => (
    <div className="p-4 border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Investment properties for sale</h1>
        </div>
      </div>

      {/* Sort */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {filteredProperties.length.toLocaleString()} results
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4A90E2] focus:border-[#4A90E2] bg-white"
          >
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>
    </div>
  )

  const MobileHeader = () => (
    <div className="lg:hidden bg-white border-b border-gray-200">
      <div className="px-4 py-3">
        <h1 className="text-lg font-bold text-gray-900">Investment properties for sale</h1>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-600">
            {filteredProperties.length.toLocaleString()} results
          </p>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-[#b29578] focus:border-[#b29578] bg-white"
          >
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>
      </div>
      
      {/* Mobile Tabs */}
      <div className="flex">
        <button
          onClick={() => setMobileTab('list')}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 border-b-2 transition-colors ${
            mobileTab === 'list'
              ? 'border-[#b29578] text-[#b29578] bg-[#b29578]/5'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <LayoutGrid className="h-4 w-4" />
          <span className="font-medium">List</span>
        </button>
        <button
          onClick={() => setMobileTab('map')}
          className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 border-b-2 transition-colors ${
            mobileTab === 'map'
              ? 'border-[#b29578] text-[#b29578] bg-[#b29578]/5'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Map className="h-4 w-4" />
          <span className="font-medium">Map</span>
        </button>
      </div>
    </div>
  )

  const LoadingState = () => (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#b29578' }}></div>
        <p className="text-gray-600">Loading properties...</p>
      </div>
    </div>
  )

  const ErrorState = () => (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="text-center">
        <div className="text-red-500 text-lg mb-2">Error Loading Properties</div>
        <p className="text-gray-600">{error}</p>
      </div>
    </div>
  )

  const EmptyState = () => (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center text-gray-500">
        <div className="text-6xl mb-4">🏠</div>
        <h3 className="text-xl font-semibold mb-2">No properties found</h3>
        <p>Try adjusting your filters to see more results.</p>
      </div>
    </div>
  )

  // Removed MapBlurOverlay - no login popup on map

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <MarketplaceNavbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        <FilterBar
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />

        {/* Mobile Layout */}
        <div className="lg:hidden">
          <MobileHeader />

          <div className="h-[calc(100vh-200px)] relative">
            {mobileTab === 'list' ? (
              <div className="h-full bg-white">
                {loading ? (
                  <LoadingState />
                ) : error ? (
                  <ErrorState />
                ) : (
                  <div className="h-full overflow-y-auto p-4" style={{ scrollBehavior: 'smooth' }}>
                    <div className="space-y-4">
                      {filteredProperties.map((p) => (
                        <div key={p.id} className="w-full">
                          <PropertyCard property={p} isLoggedIn={!!user} />
                        </div>
                      ))}
                    </div>
                    {filteredProperties.length === 0 && <EmptyState />}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full relative">
                <PropertyMap
                  properties={filteredProperties}
                  onMarkerClick={handleMarkerClick}
                  selectedProperty={selectedProperty}
                  filters={filters}
                />
              </div>
            )}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:block h-[calc(100vh-120px)] relative">
          <div className="flex h-full">
            <div className="flex-1 border-r border-gray-200 bg-gray-50 relative">
              <PropertyMap
                properties={filteredProperties}
                onMarkerClick={handleMarkerClick}
                selectedProperty={selectedProperty}
                filters={filters}
              />
            </div>

            <div className="w-[420px] flex flex-col bg-white">
              <RightHeader />

              {loading ? (
                <LoadingState />
              ) : error ? (
                <ErrorState />
              ) : (
                <div className="flex-1 overflow-y-auto p-4" style={{ scrollBehavior: 'smooth' }}>
                  <div className="space-y-4">
                    {filteredProperties.map((p) => <PropertyCard key={p.id} property={p} isLoggedIn={!!user} />)}
                  </div>
                  {filteredProperties.length === 0 && <EmptyState />}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuth} 
        onClose={() => setShowAuth(false)}
        initialStep={authInitialStep}
      />
    </>
  )
}