import { NextRequest, NextResponse } from 'next/server'
import { mockStores } from '@/lib/mock-data'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')
  const limit = parseInt(searchParams.get('limit') || '5')

  if (!lat || !lng) {
    return NextResponse.json(
      { error: 'Missing latitude or longitude parameters' },
      { status: 400 }
    )
  }

  try {
    const userLat = parseFloat(lat)
    const userLng = parseFloat(lng)

    // Calculate distance to each store and sort by proximity
    const storesWithDistance = mockStores
      .filter(store => store.isActive)
      .map(store => ({
        ...store,
        distance: calculateDistance(
          userLat, 
          userLng, 
          store.coordinates.latitude, 
          store.coordinates.longitude
        )
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit)

    const nearestStore = storesWithDistance[0]

    return NextResponse.json({
      store: nearestStore,
      nearbyStores: storesWithDistance,
      userLocation: {
        latitude: userLat,
        longitude: userLng
      }
    })

  } catch (error) {
    console.error('Error finding nearest stores:', error)
    return NextResponse.json(
      { error: 'Failed to find nearest stores' },
      { status: 500 }
    )
  }
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959 // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}
