import { NextRequest, NextResponse } from 'next/server'
import { ScannedProduct } from '@/types'

// In-memory storage for demo (use database in production)
const scannedProducts: ScannedProduct[] = []

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { upc, price, latitude, longitude, scanned, timestamp } = body

    if (!upc || price === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: upc and price' },
        { status: 400 }
      )
    }

    // Find nearest store based on location
    const nearestStoreId = await findNearestStoreId(latitude, longitude)

    const scannedProduct: ScannedProduct = {
      id: generateId(),
      upc,
      productId: await findProductIdByUPC(upc),
      storeId: nearestStoreId || 'unknown',
      scannedPrice: parseFloat(price.toString()),
      userId: undefined, // No user system in MVP
      coordinates: latitude && longitude ? { latitude, longitude } : undefined,
      timestamp: timestamp ? new Date(timestamp) : new Date()
    }

    // Store the scanned product
    scannedProducts.push(scannedProduct)

    // Update product pricing in the main database
    await updateProductPricing(scannedProduct)

    return NextResponse.json({
      success: true,
      scannedProduct,
      message: 'Price data saved successfully'
    })

  } catch (error) {
    console.error('Error saving scanned product:', error)
    return NextResponse.json(
      { error: 'Failed to save scanned product data' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const storeId = searchParams.get('storeId')
    const upc = searchParams.get('upc')
    const limit = parseInt(searchParams.get('limit') || '50')

    let filtered = scannedProducts

    if (storeId) {
      filtered = filtered.filter(sp => sp.storeId === storeId)
    }

    if (upc) {
      filtered = filtered.filter(sp => sp.upc === upc)
    }

    // Sort by timestamp, newest first
    filtered = filtered
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)

    return NextResponse.json({
      scannedProducts: filtered,
      total: filtered.length
    })

  } catch (error) {
    console.error('Error fetching scanned products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch scanned products' },
      { status: 500 }
    )
  }
}

// Helper functions (in production, these would interact with your database)

async function findNearestStoreId(lat?: number, lng?: number): Promise<string | null> {
  if (!lat || !lng) return null
  
  // Mock store locations
  const stores = [
    { id: 'store1', lat: 32.7767, lng: -96.7970 },
    { id: 'store2', lat: 32.8767, lng: -96.8970 },
    { id: 'store3', lat: 32.7000, lng: -96.8000 }
  ]

  let nearestStore = stores[0]
  let minDistance = calculateDistance(lat, lng, stores[0].lat, stores[0].lng)

  for (const store of stores) {
    const distance = calculateDistance(lat, lng, store.lat, store.lng)
    if (distance < minDistance) {
      minDistance = distance
      nearestStore = store
    }
  }

  return nearestStore.id
}

async function findProductIdByUPC(upc: string): Promise<string | undefined> {
  // In production, query your products database
  const { getProductByUPC } = await import('@/lib/mock-data')
  const product = getProductByUPC(upc)
  return product?.id
}

async function updateProductPricing(scannedProduct: ScannedProduct) {
  // In production, update your products database with new pricing data
  console.log(`Updating pricing for product ${scannedProduct.productId} at store ${scannedProduct.storeId}: $${scannedProduct.scannedPrice}`)
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

function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}
