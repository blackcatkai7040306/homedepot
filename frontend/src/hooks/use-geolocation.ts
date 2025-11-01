"use client"

import { useState, useEffect } from 'react'
import { UserLocation } from '@/types'

interface UseGeolocationReturn {
  location: UserLocation | null
  error: string | null
  isLoading: boolean
  getCurrentLocation: () => void
}

export function useGeolocation(): UseGeolocationReturn {
  const [location, setLocation] = useState<UserLocation | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.')
      return
    }

    setIsLoading(true)
    setError(null)

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000 // 5 minutes
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords
        
        try {
          // Get ZIP code from coordinates using reverse geocoding
          const zipCode = await getZipCodeFromCoordinates(latitude, longitude)
          
          // Find nearest Home Depot store
          const nearestStore = await findNearestStore(latitude, longitude)
          
          const locationData: UserLocation = {
            latitude,
            longitude,
            zipCode,
            nearestStoreId: nearestStore?.id,
            accuracy,
            timestamp: new Date()
          }
          
          setLocation(locationData)
          
          // Store in localStorage for future use (client-side only)
          if (typeof window !== 'undefined') {
            localStorage.setItem('userLocation', JSON.stringify(locationData))
          }
          
        } catch (error) {
          console.error('Error processing location:', error)
          // Still set basic location even if additional data fails
          setLocation({
            latitude,
            longitude,
            accuracy,
            timestamp: new Date()
          })
        } finally {
          setIsLoading(false)
        }
      },
      (error) => {
        setIsLoading(false)
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError('Location access denied by user.')
            break
          case error.POSITION_UNAVAILABLE:
            setError('Location information is unavailable.')
            break
          case error.TIMEOUT:
            setError('Location request timed out.')
            break
          default:
            setError('An unknown error occurred while fetching location.')
            break
        }
      },
      options
    )
  }

  // Load saved location on mount (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLocation = localStorage.getItem('userLocation')
      if (savedLocation) {
        try {
          const locationData = JSON.parse(savedLocation)
          // Check if location is not too old (1 hour)
          const locationAge = Date.now() - new Date(locationData.timestamp).getTime()
          if (locationAge < 3600000) { // 1 hour in milliseconds
            setLocation(locationData)
          }
        } catch (error) {
          console.error('Error loading saved location:', error)
        }
      }
    }
  }, [])

  return {
    location,
    error,
    isLoading,
    getCurrentLocation
  }
}

// Helper function to get ZIP code from coordinates
async function getZipCodeFromCoordinates(lat: number, lng: number): Promise<string | undefined> {
  try {
    // You can use any geocoding service here
    // For demo purposes, we'll use a mock implementation
    // In production, you might use Google Maps API, MapBox, or similar
    
    const response = await fetch(`/api/geocoding?lat=${lat}&lng=${lng}`)
    if (response.ok) {
      const data = await response.json()
      return data.zipCode
    }
  } catch (error) {
    console.error('Failed to get ZIP code:', error)
  }
  return undefined
}

// Helper function to find nearest Home Depot store
async function findNearestStore(lat: number, lng: number) {
  try {
    const response = await fetch(`/api/stores/nearest?lat=${lat}&lng=${lng}`)
    if (response.ok) {
      const data = await response.json()
      return data.store
    }
  } catch (error) {
    console.error('Failed to find nearest store:', error)
  }
  return null
}
