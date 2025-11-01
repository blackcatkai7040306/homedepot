import { NextRequest, NextResponse } from 'next/server'
import { mockProducts, getProductsByCategory, getUltraLowPriceProducts, searchProducts } from '@/lib/mock-data'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  const search = searchParams.get('search') || ''
  const category = searchParams.get('category') || ''
  const sort = searchParams.get('sort') || 'discount'
  const ultraLowOnly = searchParams.get('ultraLowOnly') === 'true'
  const maxPrice = parseFloat(searchParams.get('maxPrice') || '999999')
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  try {
    let filteredProducts = mockProducts

    // Filter by search term
    if (search) {
      filteredProducts = searchProducts(search)
    }

    // Filter by category
    if (category && category !== 'all') {
      filteredProducts = getProductsByCategory(category)
    }

    // Filter ultra-low price items
    if (ultraLowOnly) {
      filteredProducts = getUltraLowPriceProducts(maxPrice)
    }

    // Apply combined filters if multiple are specified
    if (search && category && category !== 'all') {
      filteredProducts = getProductsByCategory(category).filter(product =>
        product.title.toLowerCase().includes(search.toLowerCase()) ||
        product.brand?.toLowerCase().includes(search.toLowerCase()) ||
        product.description?.toLowerCase().includes(search.toLowerCase())
      )
    }

    if (search && ultraLowOnly) {
      filteredProducts = getUltraLowPriceProducts(maxPrice).filter(product =>
        product.title.toLowerCase().includes(search.toLowerCase()) ||
        product.brand?.toLowerCase().includes(search.toLowerCase()) ||
        product.description?.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Sort products
    filteredProducts = filteredProducts.sort((a, b) => {
      switch (sort) {
        case 'price-low':
          return a.discountedPrice - b.discountedPrice
        case 'price-high':
          return b.discountedPrice - a.discountedPrice
        case 'discount':
          return b.discountPercentage - a.discountPercentage
        case 'newest':
          return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
        default:
          return 0
      }
    })

    // If location provided, sort by nearest stores
    if (lat && lng) {
      const userLat = parseFloat(lat)
      const userLng = parseFloat(lng)
      
      filteredProducts = filteredProducts.map(product => ({
        ...product,
        storeLocations: product.storeLocations.sort((a, b) => {
          const distA = calculateDistance(userLat, userLng, a.store.coordinates.latitude, a.store.coordinates.longitude)
          const distB = calculateDistance(userLat, userLng, b.store.coordinates.latitude, b.store.coordinates.longitude)
          return distA - distB
        })
      }))
    }

    return NextResponse.json({
      products: filteredProducts,
      total: filteredProducts.length,
      filters: {
        search,
        category,
        sort,
        ultraLowOnly,
        maxPrice
      }
    })

  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

// Haversine formula to calculate distance between two coordinates
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
