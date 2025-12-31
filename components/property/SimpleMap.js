'use client'
import { useEffect, useRef, useState } from 'react'

export function SimpleMap({ properties, onMarkerClick, className = '' }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && !mapInstanceRef.current) {
      loadGoogleMaps()
    }
  }, [])

  useEffect(() => {
    if (mapInstanceRef.current && isLoaded) {
      updateMarkers()
    }
  }, [properties, isLoaded])

  const loadGoogleMaps = () => {
    if (window.google) {
      initMap()
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => {
      initMap()
    }
    document.head.appendChild(script)
  }

  const initMap = () => {
    if (!mapRef.current) return

    const map = new window.google.maps.Map(mapRef.current, {
      zoom: 4,
      center: { lat: 39.8283, lng: -98.5795 },
      styles: [
        {
          featureType: 'water',
          elementType: 'all',
          stylers: [{ color: '#a2daf2' }]
        }
      ]
    })

    mapInstanceRef.current = map
    setIsLoaded(true)
  }

  const updateMarkers = () => {
    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current = []

    if (!mapInstanceRef.current) return

    const bounds = new window.google.maps.LatLngBounds()

    properties.forEach(property => {
      if (property.latitude && property.longitude) {
        const price = Number(property.price)
        const formattedPrice = isFinite(price) ? `$${Math.round(price/1000)}K` : 'N/A'
        
        const marker = new window.google.maps.Marker({
          position: { lat: parseFloat(property.latitude), lng: parseFloat(property.longitude) },
          map: mapInstanceRef.current,
          title: property.address,
          label: {
            text: formattedPrice,
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold'
          },
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 20,
            fillColor: '#2563eb',
            fillOpacity: 1,
            strokeColor: 'white',
            strokeWeight: 2
          }
        })

        marker.addListener('click', () => {
          onMarkerClick?.(property)
          showInfoWindow(property, marker)
        })

        markersRef.current.push(marker)
        bounds.extend(marker.getPosition())
      }
    })

    if (properties.length > 0 && !bounds.isEmpty()) {
      mapInstanceRef.current.fitBounds(bounds)
    }
  }

  const showInfoWindow = (property, marker) => {
    const price = Number(property.price)
    const formattedPrice = isFinite(price) ? `$${price.toLocaleString()}` : 'N/A'
    
    const infoWindow = new window.google.maps.InfoWindow({
      content: `
        <div style="padding: 10px; min-width: 200px;">
          <div style="font-weight: bold; font-size: 16px; margin-bottom: 5px;">${formattedPrice}</div>
          <div style="margin-bottom: 8px;">${property.address}</div>
          <div style="font-size: 12px; color: #666;">
            ${property.bedrooms || 0} beds • ${property.bathrooms || 0} baths
          </div>
        </div>
      `
    })
    
    infoWindow.open(mapInstanceRef.current, marker)
  }

  if (!isLoaded) {
    return (
      <div className={`${className} bg-gray-200 animate-pulse flex items-center justify-center`}>
        <span className="text-gray-500">Loading map...</span>
      </div>
    )
  }

  return <div ref={mapRef} className={className} />
}