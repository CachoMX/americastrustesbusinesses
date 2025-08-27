'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import { Business } from '@/types'
import { LoadingSpinner } from './loading-spinner'

interface BusinessMapProps {
  businesses: Business[]
  center?: { lat: number; lng: number }
  zoom?: number
}

export function BusinessMap({ businesses, center, zoom = 10 }: BusinessMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const markersRef = useRef<any[]>([])

  useEffect(() => {
    initializeMap()
  }, [])

  useEffect(() => {
    if (map) {
      updateMarkers()
    }
  }, [businesses, map])

  const initializeMap = async () => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    
    if (!apiKey) {
      setError('Google Maps API key not configured')
      setIsLoading(false)
      return
    }

    try {
      const loader = new Loader({
        apiKey,
        version: 'weekly',
        libraries: ['places']
      })

      await loader.load()

      if (!mapRef.current) return

      const defaultCenter = center || { lat: 39.8283, lng: -98.5795 } // Center of USA
      
      const mapInstance = new (window as any).google.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom,
        styles: [
          {
            featureType: 'poi.business',
            stylers: [{ visibility: 'off' }]
          }
        ]
      })

      setMap(mapInstance)
      setIsLoading(false)
    } catch (error) {
      console.error('Error initializing map:', error)
      setError('Failed to load map')
      setIsLoading(false)
    }
  }

  const updateMarkers = async () => {
    if (!map) return

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current = []

    // Create bounds to fit all markers
    const bounds = new (window as any).google.maps.LatLngBounds()
    let hasValidLocations = false

    // Add markers for businesses with addresses
    for (const business of businesses) {
      if (business.Address) {
        try {
          const geocoder = new (window as any).google.maps.Geocoder()
          const result = await geocoder.geocode({ address: business.Address })
          
          if (result.results[0]) {
            const position = result.results[0].geometry.location
            
            const marker = new (window as any).google.maps.Marker({
              position,
              map,
              title: business.BusinessName,
              icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="16" r="12" fill="#16a34a" stroke="white" stroke-width="2"/>
                    <text x="16" y="20" font-family="Arial" font-size="16" fill="white" text-anchor="middle">★</text>
                  </svg>
                `),
                scaledSize: new (window as any).google.maps.Size(32, 32)
              }
            })

            // Create info window
            const infoWindow = new (window as any).google.maps.InfoWindow({
              content: `
                <div class="p-3 max-w-xs">
                  <h3 class="font-semibold text-gray-900 mb-2">${business.BusinessName}</h3>
                  ${business.Address ? `<p class="text-sm text-gray-600 mb-2">${business.Address}</p>` : ''}
                  ${business.Phone ? `<p class="text-sm text-gray-600 mb-2">${business.Phone}</p>` : ''}
                  ${business.Industry ? `<p class="text-sm text-gray-500 mb-3">${business.Industry}</p>` : ''}
                  <div class="flex items-center mb-2">
                    <div class="flex text-yellow-400 mr-2">
                      ${'★'.repeat(Math.floor(business.averageRating || 0))}${'☆'.repeat(5 - Math.floor(business.averageRating || 0))}
                    </div>
                    <span class="text-sm text-gray-600">
                      ${business.averageRating ? business.averageRating.toFixed(1) : 'No rating'} (${business.reviewCount || 0})
                    </span>
                  </div>
                  <a href="/businesses/${business.IdBusiness}" class="inline-block bg-primary-600 text-white px-3 py-1 rounded text-sm hover:bg-primary-700">View Details</a>
                </div>
              `
            })

            marker.addListener('click', () => {
              infoWindow.open(map, marker)
            })

            markersRef.current.push(marker)
            bounds.extend(position)
            hasValidLocations = true
          }
        } catch (error) {
          console.error(`Error geocoding address for ${business.BusinessName}:`, error)
        }
      }
    }

    // Fit map to show all markers
    if (hasValidLocations && businesses.length > 1) {
      map.fitBounds(bounds)
    } else if (hasValidLocations && businesses.length === 1) {
      map.setZoom(15)
    }
  }

  if (error) {
    return (
      <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-2">{error}</p>
          <p className="text-sm text-gray-500">Map functionality requires Google Maps API configuration</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
          <LoadingSpinner />
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  )
}