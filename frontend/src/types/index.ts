// Home Depot Product Types
export interface HomeDepotProduct {
  id: string
  sku: string
  title: string
  description?: string
  imageUrl: string
  originalPrice: number
  discountedPrice: number
  discountPercentage: number
  category: string
  brand?: string
  model?: string
  upc?: string // Universal Product Code for barcode scanning
  availability: 'in_stock' | 'out_of_stock' | 'limited'
  isUltraLowPrice: boolean // for $0.10 and below items
  storeLocations: StoreAvailability[]
  lastUpdated: Date
  createdAt: Date
}

// Store Location and Availability
export interface HomeDepotStore {
  id: string
  storeNumber: string
  name: string
  address: string
  city: string
  state: string
  zipCode: string
  coordinates: {
    latitude: number
    longitude: number
  }
  phone?: string
  isActive: boolean
}

export interface StoreAvailability {
  storeId: string
  store: HomeDepotStore
  price: number
  stock: number
  lastScanned?: Date
  verifiedByUser?: boolean
}

// Barcode Scanning
export interface ScannedProduct {
  id: string
  upc: string
  productId?: string
  storeId: string
  scannedPrice: number
  userId?: string // optional for future user system
  timestamp: Date
  coordinates?: {
    latitude: number
    longitude: number
  }
}

// Geolocation
export interface UserLocation {
  latitude: number
  longitude: number
  zipCode?: string
  nearestStoreId?: string
  accuracy: number
  timestamp: Date
}

// Data Scraping
export interface ScrapingJob {
  id: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  type: 'clearance' | 'deals' | 'all'
  startTime: Date
  endTime?: Date
  productsFound: number
  errors?: string[]
}

export interface ChartData {
  name: string
  value: number
  date?: string
  category?: string
}

export type SortOrder = 'asc' | 'desc'

export interface SortConfig {
  key: string
  direction: SortOrder
}

export interface PaginationConfig {
  page: number
  limit: number
  total: number
}
