'use client'
import { useState, useEffect } from 'react'
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export function FilterBar({ filters, onFiltersChange }) {
  const [showAllFilters, setShowAllFilters] = useState(false)
  const [availableStates, setAvailableStates] = useState([])
  const [tempFilters, setTempFilters] = useState({
    states: filters.states || [],
    minPrice: filters.minPrice || '',
    maxPrice: filters.maxPrice || '',
    minBeds: filters.minBeds || '',
    maxBeds: filters.maxBeds || '',
    minBaths: filters.minBaths || '',
    maxBaths: filters.maxBaths || '',
    minFloorArea: filters.minFloorArea || '',
    maxFloorArea: filters.maxFloorArea || ''
  })

  const STATE_NAMES = {
    'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
    'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
    'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
    'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
    'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
    'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
    'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
    'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
    'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
    'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming'
  }

  useEffect(() => {
    fetchAvailableStates()
  }, [])

  const fetchAvailableStates = async () => {
    try {
      const { data, error } = await supabase
        .from('wholesale_deals')
        .select('state')
        .eq('status', 'active')
        .not('state', 'is', null)

      if (error) {
        console.error('Error fetching states:', error)
        return
      }

      const uniqueStates = [...new Set(data.map(item => item.state))]
        .filter(state => state)
        .sort()
        .map(stateCode => ({
          value: stateCode,
          label: STATE_NAMES[stateCode] || stateCode
        }))

      setAvailableStates(uniqueStates)
    } catch (err) {
      console.error('Error fetching available states:', err)
    }
  }

  const applyFilters = () => {
    onFiltersChange({
      ...filters,
      states: tempFilters.states,
      minPrice: tempFilters.minPrice ? parseInt(tempFilters.minPrice) : undefined,
      maxPrice: tempFilters.maxPrice ? parseInt(tempFilters.maxPrice) : undefined,
      minBeds: tempFilters.minBeds ? parseInt(tempFilters.minBeds) : undefined,
      maxBeds: tempFilters.maxBeds ? parseInt(tempFilters.maxBeds) : undefined,
      minBaths: tempFilters.minBaths ? parseFloat(tempFilters.minBaths) : undefined,
      maxBaths: tempFilters.maxBaths ? parseFloat(tempFilters.maxBaths) : undefined,
      minFloorArea: tempFilters.minFloorArea ? parseInt(tempFilters.minFloorArea) : undefined,
      maxFloorArea: tempFilters.maxFloorArea ? parseInt(tempFilters.maxFloorArea) : undefined
    })
    setShowAllFilters(false)
  }

  const resetFilters = () => {
    setTempFilters({
      states: [],
      minPrice: '',
      maxPrice: '',
      minBeds: '',
      maxBeds: '',
      minBaths: '',
      maxBaths: '',
      minFloorArea: '',
      maxFloorArea: ''
    })
  }

  const hasActiveFilters = filters.states?.length > 0 || filters.minPrice || filters.maxPrice ||
    filters.minBeds || filters.maxBeds || filters.minBaths || filters.maxBaths ||
    filters.minFloorArea || filters.maxFloorArea

  return (
    <>
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="w-full px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Left side - Search and Filters */}
            <div className="flex items-center gap-4">
              {/* Search Bar */}
              <div className="w-80">
                <input
                  type="text"
                  placeholder="Search by address, market, or zip code"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-[#4A90E2] focus:border-[#4A90E2] focus:outline-none"
                />
              </div>

              {/* Filter Buttons */}
              <div className="flex items-center gap-3">
                {/* Gross yield dropdown */}
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-all text-sm font-medium whitespace-nowrap">
                  Gross yield
                  <ChevronDown className="w-4 h-4" />
                </button>

                {/* Cap rate dropdown */}
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-all text-sm font-medium whitespace-nowrap">
                  Cap rate
                  <ChevronDown className="w-4 h-4" />
                </button>

                {/* Cash on cash dropdown */}
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-all text-sm font-medium whitespace-nowrap">
                  Cash on cash
                  <ChevronDown className="w-4 h-4" />
                </button>

                {/* All Filters */}
                <button
                  onClick={() => setShowAllFilters(true)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all text-sm font-medium whitespace-nowrap ${
                    hasActiveFilters
                      ? 'bg-[#4A90E2] border-[#4A90E2] text-white hover:bg-[#357ABD]'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  All Filters
                </button>
              </div>
            </div>

            {/* Right side - Save buy box button */}
            <button className="px-5 py-2 rounded-lg bg-[#4A90E2] text-white hover:bg-[#357ABD] transition-all text-sm font-semibold shadow-sm whitespace-nowrap">
              Save buy box
            </button>
          </div>
        </div>
      </div>

      {/* All Filters Modal */}
      {showAllFilters && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">All Filters</h2>
              <button
                onClick={() => setShowAllFilters(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8">
              {/* States */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">States</h3>
                <div className="grid grid-cols-4 gap-3">
                  {availableStates.map((state) => (
                    <label key={state.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tempFilters.states.includes(state.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setTempFilters({
                              ...tempFilters,
                              states: [...tempFilters.states, state.value]
                            })
                          } else {
                            setTempFilters({
                              ...tempFilters,
                              states: tempFilters.states.filter(s => s !== state.value)
                            })
                          }
                        }}
                        className="rounded border-gray-300 text-[#4A90E2] focus:ring-[#4A90E2]"
                      />
                      <span className="text-sm text-gray-700">{state.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Range</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Minimum</label>
                    <input
                      type="number"
                      placeholder="$ 0"
                      value={tempFilters.minPrice}
                      onChange={(e) => setTempFilters({ ...tempFilters, minPrice: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A90E2] focus:border-[#4A90E2]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Maximum</label>
                    <input
                      type="number"
                      placeholder="No max"
                      value={tempFilters.maxPrice}
                      onChange={(e) => setTempFilters({ ...tempFilters, maxPrice: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A90E2] focus:border-[#4A90E2]"
                    />
                  </div>
                </div>
              </div>

              {/* Bedrooms */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Bedrooms</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Minimum</label>
                    <select
                      value={tempFilters.minBeds}
                      onChange={(e) => setTempFilters({ ...tempFilters, minBeds: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A90E2] focus:border-[#4A90E2]"
                    >
                      <option value="">Any</option>
                      {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}+</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Maximum</label>
                    <select
                      value={tempFilters.maxBeds}
                      onChange={(e) => setTempFilters({ ...tempFilters, maxBeds: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A90E2] focus:border-[#4A90E2]"
                    >
                      <option value="">Any</option>
                      {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Bathrooms */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Bathrooms</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Minimum</label>
                    <select
                      value={tempFilters.minBaths}
                      onChange={(e) => setTempFilters({ ...tempFilters, minBaths: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A90E2] focus:border-[#4A90E2]"
                    >
                      <option value="">Any</option>
                      {[1, 1.5, 2, 2.5, 3, 3.5, 4].map(n => <option key={n} value={n}>{n}+</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Maximum</label>
                    <select
                      value={tempFilters.maxBaths}
                      onChange={(e) => setTempFilters({ ...tempFilters, maxBaths: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A90E2] focus:border-[#4A90E2]"
                    >
                      <option value="">Any</option>
                      {[1, 1.5, 2, 2.5, 3, 3.5, 4].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Square Footage */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Square Footage</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Minimum</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={tempFilters.minFloorArea}
                      onChange={(e) => setTempFilters({ ...tempFilters, minFloorArea: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A90E2] focus:border-[#4A90E2]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Maximum</label>
                    <input
                      type="number"
                      placeholder="No max"
                      value={tempFilters.maxFloorArea}
                      onChange={(e) => setTempFilters({ ...tempFilters, maxFloorArea: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A90E2] focus:border-[#4A90E2]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
              <button
                onClick={resetFilters}
                className="text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Clear all
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowAllFilters(false)}
                  className="px-6 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-all text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={applyFilters}
                  className="px-6 py-2.5 rounded-lg bg-[#4A90E2] text-white hover:bg-[#357ABD] transition-all text-sm font-medium"
                >
                  Show properties
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
