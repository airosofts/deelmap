'use client'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

export function PropertyMap({ properties = [], onMarkerClick, filters }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])
  const infoOverlayRef = useRef(null)
  const router = useRouter()

  useEffect(() => { initMap() }, [])
  useEffect(() => {
    if (mapInstanceRef.current) {
      updateMarkers()
      if (filters?.states?.length) zoomToStates(filters.states)
    }
  }, [properties, filters])

  const initMap = () => {
    if (typeof window === 'undefined') return

    const bootstrap = () => {
      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 4,
        center: { lat: 39.8283, lng: -98.5795 },
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        clickableIcons: false,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      })

      mapInstanceRef.current = map
      map.addListener('click', () => hideInfoCard())
      
      window.google.maps.event.addListenerOnce(map, 'idle', () => {
        updateMarkers()
      })
    }

    if (window.google?.maps) bootstrap()
    else {
      const s = document.createElement('script')
      s.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&libraries=places`
      s.async = true
      s.defer = true
      s.onload = bootstrap
      document.head.appendChild(s)
    }
  }

  const shortPrice = (price) => {
    const n = Math.round(Number(price) || 0)
    if (!n) return 'N/A'
    if (n >= 1_000_000) return `$${(n/1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `$${Math.round(n/1_000)}K`
    return `$${n}`
  }

  const fullPrice = (price) => {
    const n = Math.round(Number(price) || 0)
    return n ? `$${n.toLocaleString()}` : 'Contact for price'
  }

  const chipColor = (status) => {
    const s = String(status || '').toLowerCase()
    if (s === 'sold') return '#6366f1'        // Purple - matching Stessa
    if (s === 'pending') return '#6366f1'     // Purple - matching Stessa
    return '#6366f1'                          // Purple - matching Stessa
  }

  const updateMarkers = () => {
    const map = mapInstanceRef.current
    if (!map || !window.google) return

    markersRef.current.forEach(({ overlay }) => overlay?.setMap(null))
    markersRef.current = []

    const bounds = new window.google.maps.LatLngBounds()

    properties.forEach((p) => {
      // Use Google verified coordinates from wholesale_deals
      const lat = parseFloat(p.address_google_lat)
      const lng = parseFloat(p.address_google_lng)
      if (!lat || !lng) return

      const anchor = new window.google.maps.Marker({
        position: { lat, lng },
        map,
        visible: false
      })

      const chip = document.createElement('div')
      chip.className = 'price-marker-dot'
      chip.style.cssText = [
        `background-color: ${chipColor(p.property_status)}`,
        'width: 14px',
        'height: 14px',
        'border-radius: 50%',
        'box-shadow: 0 2px 6px rgba(99, 102, 241, 0.5)',
        'position: absolute',
        'transform: translate(-50%, -50%)',
        'z-index: 1000',
        'cursor: pointer',
        'transition: all 0.15s ease',
        'border: 2.5px solid white'
      ].join(';')

      chip.addEventListener('mouseenter', () => {
        chip.style.transform = 'translate(-50%, -50%) scale(1.5)'
        chip.style.zIndex = '1100'
        chip.style.boxShadow = '0 3px 10px rgba(99, 102, 241, 0.7)'
      })

      chip.addEventListener('mouseleave', () => {
        chip.style.transform = 'translate(-50%, -50%) scale(1)'
        chip.style.zIndex = '1000'
        chip.style.boxShadow = '0 2px 6px rgba(99, 102, 241, 0.5)'
      })

      chip.addEventListener('click', (e) => {
        e.stopPropagation()
        showInfoCard(p, anchor)
        onMarkerClick?.(p)
      })

      const overlay = new window.google.maps.OverlayView()
      overlay.onAdd = function () { this.getPanes().overlayMouseTarget.appendChild(chip) }
      overlay.draw = function () {
        const proj = this.getProjection()
        const pt = proj.fromLatLngToDivPixel(anchor.getPosition())
        chip.style.left = `${pt.x}px`
        chip.style.top = `${pt.y}px`
      }
      overlay.onRemove = function () { chip.remove() }
      overlay.setMap(map)

      markersRef.current.push({ overlay })
      bounds.extend(anchor.getPosition())
    })

    if (!bounds.isEmpty()) {
      map.fitBounds(bounds)
      window.google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
        if (map.getZoom() > 15) map.setZoom(15)
      })
    }
  }

  const buildInfoEl = (prop) => {
    const img = prop.feature_image_url || 'https://via.placeholder.com/240x140/f3f4f6/9ca3af?text=Property+Image'
    const statusText = (prop.property_status || 'Available').toUpperCase()
    const beds = prop.bedrooms ? `${prop.bedrooms} Beds` : ''
    const baths = prop.bathrooms ? `${prop.bathrooms} Baths` : ''

    const el = document.createElement('div')
    el.className = 'map-info-card-fixed'
    el.style.cursor = 'pointer'
    el.innerHTML = `
      <div style="
        width: 240px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        overflow: hidden;
        border: 1px solid rgba(0,0,0,0.05);
        font-family: 'Inter', sans-serif;
        cursor: pointer;
        transition: transform 0.2s ease;
      ">
        <div style="position: relative; height: 120px; background: #f3f4f6;">
          <img src="${img}" alt="property" style="
            width: 100%;
            height: 100%;
            object-fit: cover;
          " />
          <div style="
            position: absolute;
            top: 8px;
            left: 8px;
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
          ">
            <span style="
              background: #3b82f6;
              color: white;
              font-size: 10px;
              font-weight: 600;
              padding: 3px 6px;
              border-radius: 8px;
              text-transform: uppercase;
            ">Active</span>
            <span style="
              background: ${chipColor(prop.property_status)};
              color: white;
              font-size: 10px;
              font-weight: 600;
              padding: 3px 6px;
              border-radius: 8px;
              text-transform: uppercase;
            ">${statusText}</span>
          </div>
        </div>
        <div style="padding: 12px;">
          <div style="
            font-size: 16px;
            font-weight: 700;
            color: #022b41;
            margin-bottom: 6px;
          ">${fullPrice(prop.price)}</div>
          <div style="
            font-size: 11px;
            color: #6b7280;
            margin-bottom: 8px;
            line-height: 1.3;
          ">${prop.address || 'Address not available'}</div>
          <div style="
            display: flex;
            gap: 12px;
            font-size: 11px;
            color: #374151;
            font-weight: 600;
          ">
            ${beds ? `<span>${beds}</span>` : ''}
            ${baths ? `<span>${baths}</span>` : ''}
          </div>
        </div>
      </div>
    `
    
    el.addEventListener('click', (e) => {
      e.stopPropagation()
      hideInfoCard()
      router.push(`/${prop.slug}`)
    })

    el.addEventListener('mouseenter', () => {
      el.firstElementChild.style.transform = 'scale(1.02)'
    })

    el.addEventListener('mouseleave', () => {
      el.firstElementChild.style.transform = 'scale(1)'
    })
    
    return el
  }

  const showInfoCard = (prop, anchorMarker) => {
    const map = mapInstanceRef.current
    if (!map) return
    hideInfoCard()

    const el = buildInfoEl(prop)

    const overlay = new window.google.maps.OverlayView()
    overlay.onAdd = function () { this.getPanes().floatPane.appendChild(el) }
    overlay.draw = function () {
      const proj = this.getProjection()
      const pt = proj.fromLatLngToDivPixel(anchorMarker.getPosition())
      
      const mapDiv = map.getDiv()
      const mapWidth = mapDiv.offsetWidth
      const mapHeight = mapDiv.offsetHeight
      
      const cardWidth = 240
      const cardHeight = 200
      const padding = 16
      
      let left = pt.x
      let top = pt.y - 20
      let transform = 'translate(-50%, -100%)'
      
      const isMobile = window.innerWidth < 768
      
      if (isMobile) {
        left = mapWidth / 2
        
        if (pt.y - cardHeight < padding) {
          top = pt.y + 40
          transform = 'translate(-50%, 0%)'
        } else if (pt.y + cardHeight > mapHeight - padding) {
          top = mapHeight - cardHeight - padding
          transform = 'translate(-50%, 0%)'
        } else {
          top = pt.y - cardHeight - 20
          transform = 'translate(-50%, 0%)'
        }
      } else {
        if (pt.x + cardWidth/2 > mapWidth - padding) {
          left = pt.x - padding
          transform = 'translate(-100%, -100%)'
        }
        else if (pt.x - cardWidth/2 < padding) {
          left = pt.x + padding
          transform = 'translate(0%, -100%)'
        }
        
        if (pt.y - cardHeight < padding) {
          top = pt.y + 30
          if (transform.includes('-50%')) {
            transform = 'translate(-50%, 0%)'
          } else if (transform.includes('-100%')) {
            transform = 'translate(-100%, 0%)'
          } else {
            transform = 'translate(0%, 0%)'
          }
        }
      }
      
      el.style.left = `${left}px`
      el.style.top = `${top}px`
      el.style.transform = transform
      el.style.position = 'absolute'
      el.style.zIndex = '1200'
    }
    overlay.onRemove = function () { el.remove() }
    overlay.setMap(map)

    infoOverlayRef.current = overlay
  }

  const hideInfoCard = () => {
    infoOverlayRef.current?.setMap?.(null)
    infoOverlayRef.current = null
  }

  const zoomToStates = (stateCodes = []) => {
    const map = mapInstanceRef.current
    if (!map || !window.google) return
    const b = new window.google.maps.LatLngBounds()
    properties.forEach((p) => {
      if (stateCodes.includes(p.state) && p.latitude && p.longitude) {
        b.extend({ lat: parseFloat(p.latitude), lng: parseFloat(p.longitude) })
      }
    })
    if (!b.isEmpty()) {
      map.fitBounds(b)
      setTimeout(() => {
        if (map.getZoom() > 15) map.setZoom(15)
      }, 100)
    }
  }

  return <div ref={mapRef} className="w-full h-full min-h-[600px] map-container" />
}