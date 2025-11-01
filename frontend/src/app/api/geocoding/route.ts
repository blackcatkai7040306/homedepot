import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  if (!lat || !lng) {
    return NextResponse.json(
      { error: 'Missing latitude or longitude parameters' },
      { status: 400 }
    )
  }

  try {
    // In production, you would use a real geocoding service like:
    // - Google Maps Geocoding API
    // - MapBox Geocoding API
    // - OpenStreetMap Nominatim
    
    // For demo purposes, we'll mock the geocoding response
    const mockZipCode = generateMockZipCode(parseFloat(lat), parseFloat(lng))
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return NextResponse.json({
      zipCode: mockZipCode,
      city: getMockCity(mockZipCode),
      state: getMockState(parseFloat(lat), parseFloat(lng)),
      country: 'US'
    })

  } catch (error) {
    console.error('Geocoding error:', error)
    return NextResponse.json(
      { error: 'Failed to geocode location' },
      { status: 500 }
    )
  }
}

function generateMockZipCode(lat: number, lng: number): string {
  // Generate a realistic-looking ZIP code based on coordinates
  // This is just for demo purposes
  const baseZip = Math.floor(Math.abs(lat * lng * 1000)) % 90000 + 10000
  return baseZip.toString().padStart(5, '0')
}

function getMockCity(zipCode: string): string {
  const cities = [
    'Downtown', 'Midtown', 'Uptown', 'Northside', 'Southside',
    'Westfield', 'Eastpoint', 'Central', 'Riverside', 'Hillside'
  ]
  const index = parseInt(zipCode.slice(-1)) % cities.length
  return cities[index]
}

function getMockState(lat: number, lng: number): string {
  // Very basic state determination based on coordinates
  // In production, use proper geocoding
  if (lat >= 25 && lat <= 36 && lng >= -106 && lng <= -93) {
    return 'TX'
  } else if (lat >= 32 && lat <= 42 && lng >= -124 && lng <= -114) {
    return 'CA'
  } else if (lat >= 40 && lat <= 45 && lng >= -79 && lng <= -71) {
    return 'NY'
  } else if (lat >= 25 && lat <= 31 && lng >= -87 && lng <= -80) {
    return 'FL'
  }
  return 'TX' // Default fallback
}
