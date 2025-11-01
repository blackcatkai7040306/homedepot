'use client'

import { useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, Package, Star } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { HomeDepotProduct } from '@/types'
import { mockProducts } from '@/lib/mock-data'

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = [
    'all',
    ...Array.from(new Set(mockProducts.map(p => p.category))),
  ]

  const filteredProducts =
    selectedCategory === 'all'
      ? mockProducts
      : mockProducts.filter(p => p.category === selectedCategory)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Home Depot Clearance Products
            </h1>
            <p className="text-muted-foreground">
              Browse clearance deals and ultra-low price items
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <Search className="mr-2 h-4 w-4" />
              Search Deals
            </Button>
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Package className="mr-2 h-4 w-4" />
              View All Deals
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Deals</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockProducts.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <Filter className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories.length - 1}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Avg. Discount
              </CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(
                  mockProducts.reduce(
                    (acc, p) => acc + p.discountPercentage,
                    0
                  ) / mockProducts.length
                )}
                %
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ultra-Low Price
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockProducts.filter(p => p.isUltraLowPrice).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-2">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="capitalize"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map(product => (
            <Card key={product.id}>
              <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </div>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg line-clamp-2">
                    {product.title}
                  </CardTitle>
                  <Badge
                    variant={
                      product.isUltraLowPrice ? 'destructive' : 'secondary'
                    }
                  >
                    {product.isUltraLowPrice
                      ? 'ULTRA LOW'
                      : `${product.discountPercentage}% OFF`}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {product.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(product.discountedPrice)}
                      </div>
                      <div className="text-sm text-muted-foreground line-through">
                        {formatCurrency(product.originalPrice)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-orange-600">
                        {product.brand}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {product.category}
                      </div>
                    </div>
                  </div>
                  <Button size="sm" className="w-full">
                    View Deal Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
