import { NextRequest, NextResponse } from 'next/server'
import { getProductByUPC, mockProducts } from '@/lib/mock-data'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const upc = searchParams.get('upc')

  if (!upc) {
    return NextResponse.json(
      { error: 'UPC parameter is required' },
      { status: 400 }
    )
  }

  try {
    // First, try to find the product in our local database
    let product = getProductByUPC(upc)

    if (product) {
      return NextResponse.json({
        success: true,
        source: 'local_database',
        product: {
          ...product,
          upc,
          discount_info: {
            original_price: product.originalPrice,
            current_price: product.discountedPrice,
            discount_percentage: product.discountPercentage,
            savings: product.originalPrice - product.discountedPrice,
            is_clearance: product.isUltraLowPrice,
            availability: product.availability
          }
        }
      })
    }

    // If not found locally, simulate external UPC API lookup
    // In production, you'd call real APIs like UPCitemdb.com, Barcode Spider, etc.
    const externalProduct = await simulateExternalUPCLookup(upc)
    
    if (externalProduct) {
      return NextResponse.json({
        success: true,
        source: 'external_api',
        product: externalProduct
      })
    }

    // If still not found, return not found response
    return NextResponse.json({
      success: false,
      error: 'Product not found',
      message: 'UPC not found in local database or external APIs'
    }, { status: 404 })

  } catch (error) {
    console.error('Error looking up UPC:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: 'Failed to lookup UPC' 
      },
      { status: 500 }
    )
  }
}

// Simulate external UPC API lookup
async function simulateExternalUPCLookup(upc: string) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))

  // Mock external API responses for common UPCs
  const externalDatabase: Record<string, any> = {
    '012345678901': {
      id: 'ext_1',
      sku: 'EXT001',
      title: 'Generic Product from External API',
      description: 'Product found via external UPC lookup service',
      imageUrl: '/images/products/1.webp',
      upc: '012345678901',
      brand: 'Unknown Brand',
      category: 'General',
      retail_price: 29.99,
      discount_info: {
        original_price: 29.99,
        current_price: 29.99,
        discount_percentage: 0,
        savings: 0,
        is_clearance: false,
        availability: 'available'
      },
      source: 'External UPC Database',
      found_at: new Date().toISOString()
    },
    '123456789012': {
      id: 'ext_2', 
      sku: 'EXT002',
      title: 'Sample Barcode Product',
      description: 'This product was found using barcode image upload',
      imageUrl: '/images/products/2.webp',
      upc: '123456789012',
      brand: 'Sample Brand',
      category: 'Electronics',
      retail_price: 49.99,
      discount_info: {
        original_price: 49.99,
        current_price: 39.99,
        discount_percentage: 20,
        savings: 10.00,
        is_clearance: false,
        availability: 'available'
      },
      source: 'External UPC Database',
      found_at: new Date().toISOString()
    }
  }

  return externalDatabase[upc] || null
}
