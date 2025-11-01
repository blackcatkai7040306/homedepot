"use client"

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  MapPin, 
  Store, 
  Package, 
  ExternalLink,
  Heart,
  Share2
} from 'lucide-react'
import { HomeDepotProduct } from '@/types'
import { formatCurrency, cn } from '@/lib/utils'

interface ProductCardProps {
  product: HomeDepotProduct
  userLocation?: { latitude: number; longitude: number } | null
}

export function ProductCard({ product, userLocation }: ProductCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [lastScannedPrice, setLastScannedPrice] = useState<number | null>(null)

  const discountAmount = product.originalPrice - product.discountedPrice
  const discountPercentage = Math.round((discountAmount / product.originalPrice) * 100)
  
  // Find price for nearest store if available
  const nearestStorePrice = userLocation && product.storeLocations.length > 0 
    ? product.storeLocations[0].price 
    : product.discountedPrice

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `Check out this Home Depot deal: ${formatCurrency(product.discountedPrice)} (was ${formatCurrency(product.originalPrice)})`,
          url: window.location.href
        })
      } catch (error) {
        // Fallback to copy to clipboard
        navigator.clipboard.writeText(window.location.href)
      }
    } else {
      // Fallback to copy to clipboard
      navigator.clipboard.writeText(
        `${product.title} - ${formatCurrency(product.discountedPrice)} (was ${formatCurrency(product.originalPrice)}) - ${window.location.href}`
      )
    }
  }

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-200 overflow-hidden">
        <div className="relative">
          {/* Product Image */}
          <div className="aspect-square bg-gray-100 overflow-hidden">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <Package className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
          </div>
          
          {/* Badges */}
          <div className="absolute top-2 left-2 space-y-1">
            {product.isUltraLowPrice && (
              <Badge className="bg-red-500 hover:bg-red-600 text-white font-bold">
                ULTRA LOW
              </Badge>
            )}
            {discountPercentage > 70 && (
              <Badge variant="destructive">
                {discountPercentage}% OFF
              </Badge>
            )}
          </div>
          
          {/* Actions */}
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex flex-col space-y-1">
              <Button
                size="sm"
                variant="secondary"
                className="w-8 h-8 p-0 bg-white/80 hover:bg-white"
                onClick={() => setIsLiked(!isLiked)}
              >
                <Heart className={cn(
                  "h-4 w-4",
                  isLiked ? "fill-red-500 text-red-500" : "text-muted-foreground"
                )} />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="w-8 h-8 p-0 bg-white/80 hover:bg-white"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </div>
        </div>

        <CardContent className="p-4">
          {/* Brand and Category */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">
              {product.brand || 'Home Depot'}
            </span>
            <Badge variant="outline" className="text-xs">
              {product.category}
            </Badge>
          </div>

          {/* Product Title */}
          <h3 className="font-medium text-sm leading-tight mb-3 line-clamp-2">
            {product.title}
          </h3>

          {/* Pricing */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-green-600">
                  {formatCurrency(nearestStorePrice)}
                </span>
                {nearestStorePrice !== product.discountedPrice && (
                  <Badge variant="secondary" className="text-xs">
                    Local Price
                  </Badge>
                )}
              </div>
              
              {lastScannedPrice && (
                <Badge variant="outline" className="text-xs text-blue-600">
                  Scanned: {formatCurrency(lastScannedPrice)}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-muted-foreground line-through">
                {formatCurrency(product.originalPrice)}
              </span>
              <span className="text-green-600 font-medium">
                Save {formatCurrency(discountAmount)} ({discountPercentage}% off)
              </span>
            </div>
          </div>

          {/* Store Info */}
          {product.storeLocations.length > 0 && (
            <div className="flex items-center space-x-2 text-xs text-muted-foreground mb-4">
              <Store className="h-3 w-3" />
              <span>Available at {product.storeLocations.length} stores</span>
              {userLocation && (
                <>
                  <span>•</span>
                  <MapPin className="h-3 w-3" />
                  <span>Nearest location pricing shown</span>
                </>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => setIsLiked(!isLiked)}
            >
              <Heart className={cn(
                "mr-2 h-4 w-4",
                isLiked ? "fill-red-500 text-red-500" : ""
              )} />
              {isLiked ? 'Saved' : 'Save Deal'}
            </Button>
            
            <Button
              variant="default"
              size="sm"
              className="flex-1 bg-orange-500 hover:bg-orange-600"
            >
              <a
                href={`https://www.homedepot.com/p/${product.sku}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View on HD
              </a>
            </Button>
          </div>

          {/* Additional Info */}
          <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>SKU: {product.sku}</span>
              <span>Updated: {new Date(product.lastUpdated).toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>

    </>
  )
}
