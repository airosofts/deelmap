'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export const useProperties = (filters = {}) => {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchProperties()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)])

  const fetchProperties = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('wholesale_deals')
        .select(`
          *,
          property_photos (
            id,
            photo_url,
            photo_type,
            display_order
          )
        `)
        .in('status', ['active', 'for sale'])
        .order('created_at', { ascending: false })

      // Apply state filter (if no states selected, show all)
      if (filters.states && filters.states.length > 0) {
        query = query.in('state', filters.states)
      }

      // Apply status filter - if 'all' is selected or no status, don't filter by property_status
      const statusesToFilter = filters.statuses && filters.statuses.length > 0
        ? filters.statuses
        : ['all']

      // Only apply property_status filter if 'all' is not included
      if (!statusesToFilter.includes('all')) {
        query = query.in('property_status', statusesToFilter)
      }

      // Apply price filters
      if (filters.minPrice && filters.minPrice > 0) {
        query = query.gte('price', filters.minPrice)
      }

      if (filters.maxPrice && filters.maxPrice > 0) {
        query = query.lte('price', filters.maxPrice)
      }

      // Apply bedroom filters
      if (filters.minBeds && filters.minBeds > 0) {
        query = query.gte('bedrooms', filters.minBeds)
      }

      if (filters.maxBeds && filters.maxBeds > 0) {
        query = query.lte('bedrooms', filters.maxBeds)
      }

      // Apply bathroom filters
      if (filters.minBaths && filters.minBaths > 0) {
        query = query.gte('bathrooms', filters.minBaths)
      }

      if (filters.maxBaths && filters.maxBaths > 0) {
        query = query.lte('bathrooms', filters.maxBaths)
      }

      // Apply square footage filters (sqft instead of floor_area)
      if (filters.minFloorArea && filters.minFloorArea > 0) {
        query = query.gte('sqft', filters.minFloorArea)
      }

      if (filters.maxFloorArea && filters.maxFloorArea > 0) {
        query = query.lte('sqft', filters.maxFloorArea)
      }

      const { data, error } = await query

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log('Fetched properties:', data?.length || 0, 'properties')
      setProperties(data || [])
    } catch (err) {
      console.error('Error fetching properties:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { properties, loading, error, refetch: fetchProperties }
}