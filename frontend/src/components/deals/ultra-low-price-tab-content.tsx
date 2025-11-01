"use client"

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  DollarSign, 
  TrendingDown, 
  AlertCircle, 
  Package,
  Zap
} from 'lucide-react'
import { ProductCard } from './product-card'
import { HomeDepotProduct } from '@/types'
import { useGeolocation } from '@/hooks/use-geolocation'
import { formatCurrency } from '@/lib/utils'

export function UltraLowPriceTabContent() {
  const [products, setProducts] = useState<HomeDepotProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [priceFilter, setPriceFilter] = useState<'all' | '0.01' | '0.10'>('all')
  
  const { location } = useGeolocation()

  useEffect(() => {
    fetchUltraLowPriceProducts()
  }, [priceFilter, location])

  const fetchUltraLowPriceProducts = async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams({
        ultraLowOnly: 'true',
        maxPrice: priceFilter === 'all' ? '0.10' : priceFilter,
        lat: location?.latitude.toString() || '',
        lng: location?.longitude.toString() || ''
      })

      const response = await fetch(`/api/products?${queryParams}`)
      
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      } else {
        // Fallback with mock data
        const { getUltraLowPriceProducts } = await import('@/lib/mock-data')
        setProducts(getUltraLowPriceProducts(0.10))
      }
    } catch (error) {
      console.error('Failed to fetch ultra-low price products:', error)
      // Fallback with mock data
      const { getUltraLowPriceProducts } = await import('@/lib/mock-data')
      setProducts(getUltraLowPriceProducts(0.10))
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(product => {
    if (priceFilter === 'all') return product.discountedPrice <= 0.10
    if (priceFilter === '0.01') return product.discountedPrice <= 0.01
    if (priceFilter === '0.10') return product.discountedPrice <= 0.10
    return true
  })

  const totalSavings = filteredProducts.reduce((sum, product) => 
    sum + (product.originalPrice - product.discountedPrice), 0
  )

  const avgSavingsPercentage = filteredProducts.length > 0 
    ? Math.round(filteredProducts.reduce((sum, product) => 
        sum + product.discountPercentage, 0) / filteredProducts.length)
    : 0

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-muted animate-pulse rounded-lg h-96" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Ultra-Low Price Header */}
      <div className="text-center space-y-4 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
        <div className="flex items-center justify-center space-x-2">
          <DollarSign className="h-8 w-8 text-green-600" />
          <h2 className="text-2xl font-bold text-green-800">Ultra-Low Price Zone</h2>
          <Zap className="h-8 w-8 text-yellow-500" />
        </div>
        <p className="text-green-700 max-w-2xl mx-auto">
          These are the most extreme clearance deals - items priced at $0.10 or below! 
          Perfect for flippers, DIY enthusiasts, and bargain hunters.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">
              Items Found
            </CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">
              {filteredProducts.length}
            </div>
            <p className="text-xs text-green-600">
              Ultra-low clearance items
            </p>
          </CardContent>
        </Card>

        <Card className="border-orange-200 bg-orange-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">
              Total Savings
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800">
              {formatCurrency(totalSavings)}
            </div>
            <p className="text-xs text-orange-600">
              If bought at original price
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">
              Avg. Discount
            </CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">
              {avgSavingsPercentage}%
            </div>
            <p className="text-xs text-blue-600">
              Average savings percentage
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Price Filter Buttons */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm font-medium">Show items priced at:</span>
        <Button
          variant={priceFilter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setPriceFilter('all')}
        >
          $0.10 and below
        </Button>
        <Button
          variant={priceFilter === '0.01' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setPriceFilter('0.01')}
          className="bg-red-500 hover:bg-red-600 text-white"
        >
          $0.01 (Penny deals!)
        </Button>
      </div>

      {/* Warning Notice */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="flex items-start space-x-3 py-4">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-amber-800">
              Important: Verify prices in-store
            </p>
            <p className="text-xs text-amber-700">
              Ultra-low prices can change rapidly and may vary significantly by location. 
              Use the barcode scanner to verify current pricing at your local store. 
              Items at these prices often have limited quantity.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              userLocation={location}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <DollarSign className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No ultra-low price deals found</h3>
          <p className="text-muted-foreground">
            Check back later as new clearance items are added daily
          </p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => setPriceFilter('all')}
          >
            View all deals under $0.10
          </Button>
        </div>
      )}
    </div>
  )
}

