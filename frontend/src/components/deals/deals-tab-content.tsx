"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Package } from 'lucide-react'
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Grid3X3, 
  List,
  ArrowUpDown
} from 'lucide-react'
import { ProductCard } from './product-card'
import { HomeDepotProduct } from '@/types'
import { useGeolocation } from '@/hooks/use-geolocation'
import { useDebounce } from '@/hooks/use-debounce'

type SortOption = 'price-low' | 'price-high' | 'discount' | 'newest'
type ViewMode = 'grid' | 'list'

export function DealsTabContent() {
  const [products, setProducts] = useState<HomeDepotProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<SortOption>('discount')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [showFilters, setShowFilters] = useState(false)
  
  const { location } = useGeolocation()
  const debouncedSearch = useDebounce(searchTerm, 300)

  // Sample data - replace with API call
  useEffect(() => {
    fetchProducts()
  }, [debouncedSearch, selectedCategory, sortBy])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      // Replace with actual API call
      const queryParams = new URLSearchParams({
        search: debouncedSearch,
        category: selectedCategory !== 'all' ? selectedCategory : '',
        sort: sortBy,
        lat: location?.latitude.toString() || '',
        lng: location?.longitude.toString() || ''
      })

      const response = await fetch(`/api/products?${queryParams}`)
      
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      } else {
        // Fallback with mock data
        const { mockProducts } = await import('@/lib/mock-data')
        setProducts(mockProducts)
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
      // Fallback with mock data
      const { mockProducts } = await import('@/lib/mock-data')
      setProducts(mockProducts)
    } finally {
      setLoading(false)
    }
  }

  const categories = ['all', 'Tools', 'Garden', 'Hardware', 'Appliances', 'Lumber', 'Paint', 'Electrical']

  const filteredAndSortedProducts = products
    .filter(product => {
      const matchesSearch = product.title.toLowerCase().includes(debouncedSearch.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-64 bg-muted animate-pulse rounded" />
          <div className="h-8 w-32 bg-muted animate-pulse rounded" />
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
      {/* Search and Filters */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filters
          </Button>
          
          <div className="flex items-center space-x-1 bg-muted p-1 rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="p-2"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="p-2"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filters Row */}
      {showFilters && (
        <div className="flex flex-wrap gap-2 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Category:</span>
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                className="cursor-pointer capitalize"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            <span className="text-sm font-medium">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="text-sm border border-border rounded-md px-2 py-1"
            >
              <option value="discount">Highest Discount</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {filteredAndSortedProducts.length} deals found
          {selectedCategory !== 'all' && ` in ${selectedCategory}`}
          {searchTerm && ` matching "${searchTerm}"`}
        </p>
        
        {location && (
          <Badge variant="outline" className="text-xs">
            Showing local pricing when available
          </Badge>
        )}
      </div>

      {/* Products Grid */}
      {filteredAndSortedProducts.length > 0 ? (
        <div className={`
          grid gap-4
          ${viewMode === 'grid' 
            ? 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
            : 'grid-cols-1 md:grid-cols-2'
          }
        `}>
          {filteredAndSortedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              userLocation={location}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No deals found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search terms or filters
          </p>
        </div>
      )}
    </div>
  )
}

