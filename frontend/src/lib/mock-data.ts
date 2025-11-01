import { HomeDepotProduct, HomeDepotStore } from '@/types'

// Mock Home Depot Stores
export const mockStores: HomeDepotStore[] = [
  {
    id: 'store1',
    storeNumber: '1001',
    name: 'The Home Depot - Downtown Dallas',
    address: '123 Main Street',
    city: 'Dallas',
    state: 'TX',
    zipCode: '75201',
    coordinates: { latitude: 32.7767, longitude: -96.797 },
    phone: '(214) 555-0101',
    isActive: true,
  },
  {
    id: 'store2',
    storeNumber: '1002',
    name: 'The Home Depot - North Dallas',
    address: '456 Oak Avenue',
    city: 'Dallas',
    state: 'TX',
    zipCode: '75240',
    coordinates: { latitude: 32.8767, longitude: -96.897 },
    phone: '(214) 555-0102',
    isActive: true,
  },
  {
    id: 'store3',
    storeNumber: '1003',
    name: 'The Home Depot - Arlington',
    address: '789 Elm Street',
    city: 'Arlington',
    state: 'TX',
    zipCode: '76001',
    coordinates: { latitude: 32.7357, longitude: -97.1081 },
    phone: '(817) 555-0103',
    isActive: true,
  },
]

// Mock Home Depot Products with Real Data
export const mockProducts: HomeDepotProduct[] = [
  {
    id: '1',
    sku: 'HD001',
    title: 'DEWALT 20V MAX Cordless Drill Kit with Battery and Charger',
    description:
      'Powerful cordless drill with variable speed trigger and LED light. Includes battery and charger.',
    imageUrl: '/images/products/1.webp',
    originalPrice: 199.99,
    discountedPrice: 89.99,
    discountPercentage: 55,
    category: 'Tools',
    brand: 'DEWALT',
    model: 'DCD771C2',
    upc: '885911419390',
    availability: 'in_stock',
    isUltraLowPrice: false,
    storeLocations: [
      {
        storeId: 'store1',
        store: mockStores[0],
        price: 89.99,
        stock: 5,
        lastScanned: new Date('2024-11-01T10:30:00Z'),
        verifiedByUser: true,
      },
      {
        storeId: 'store2',
        store: mockStores[1],
        price: 94.99,
        stock: 3,
        lastScanned: new Date('2024-11-01T09:15:00Z'),
        verifiedByUser: false,
      },
    ],
    lastUpdated: new Date('2024-11-01T08:00:00Z'),
    createdAt: new Date('2024-10-15T00:00:00Z'),
  },
  {
    id: '2',
    sku: 'HD002',
    title: 'Flexible Garden Hose 50ft Heavy Duty with Spray Nozzle',
    description:
      'Durable rubber garden hose perfect for all outdoor watering needs. Includes spray nozzle.',
    imageUrl: '/images/products/2.webp',
    originalPrice: 49.99,
    discountedPrice: 0.1,
    discountPercentage: 99,
    category: 'Garden',
    brand: 'Flexzilla',
    model: 'HFZG550YW',
    upc: '123456789013',
    availability: 'limited',
    isUltraLowPrice: true,
    storeLocations: [
      {
        storeId: 'store2',
        store: mockStores[1],
        price: 0.1,
        stock: 2,
        lastScanned: new Date('2024-11-01T11:00:00Z'),
        verifiedByUser: true,
      },
    ],
    lastUpdated: new Date('2024-11-01T07:30:00Z'),
    createdAt: new Date('2024-10-20T00:00:00Z'),
  },
  {
    id: '3',
    sku: 'HD003',
    title: 'BEHR Paint Color Sample Cards Bundle (100 pieces)',
    description:
      'Assorted paint color samples for home decoration and design planning.',
    imageUrl: '/images/products/3.webp',
    originalPrice: 25.0,
    discountedPrice: 0.01,
    discountPercentage: 99,
    category: 'Paint',
    brand: 'Behr',
    model: 'COLOR-SAMPLES-100',
    upc: '999888777666',
    availability: 'in_stock',
    isUltraLowPrice: true,
    storeLocations: [
      {
        storeId: 'store1',
        store: mockStores[0],
        price: 0.01,
        stock: 50,
        lastScanned: new Date('2024-11-01T12:00:00Z'),
        verifiedByUser: true,
      },
      {
        storeId: 'store3',
        store: mockStores[2],
        price: 0.01,
        stock: 30,
        lastScanned: new Date('2024-11-01T10:45:00Z'),
        verifiedByUser: false,
      },
    ],
    lastUpdated: new Date('2024-11-01T06:00:00Z'),
    createdAt: new Date('2024-10-25T00:00:00Z'),
  },
  {
    id: '4',
    sku: 'HD004',
    title: 'Husky LED Work Light 2000 Lumens Portable Construction Light',
    description:
      'Bright LED work light with adjustable stand for construction and maintenance work.',
    imageUrl: '/images/products/4.webp',
    originalPrice: 79.99,
    discountedPrice: 19.99,
    discountPercentage: 75,
    category: 'Tools',
    brand: 'Husky',
    model: 'K40071',
    upc: '111222333444',
    availability: 'in_stock',
    isUltraLowPrice: false,
    storeLocations: [
      {
        storeId: 'store1',
        store: mockStores[0],
        price: 19.99,
        stock: 8,
        lastScanned: new Date('2024-11-01T09:30:00Z'),
        verifiedByUser: false,
      },
    ],
    lastUpdated: new Date('2024-11-01T05:45:00Z'),
    createdAt: new Date('2024-10-18T00:00:00Z'),
  },
  {
    id: '5',
    sku: 'HD005',
    title: 'Plastic Plant Pots Set of 20 Mixed Sizes for Indoor/Outdoor',
    description:
      'Various sized plastic plant pots perfect for gardening and plant propagation.',
    imageUrl: '/images/products/1.webp',
    originalPrice: 35.99,
    discountedPrice: 0.05,
    discountPercentage: 99,
    category: 'Garden',
    brand: 'Home Depot',
    model: 'PLANT-POTS-20',
    upc: '555666777888',
    availability: 'limited',
    isUltraLowPrice: true,
    storeLocations: [
      {
        storeId: 'store2',
        store: mockStores[1],
        price: 0.05,
        stock: 4,
        lastScanned: new Date('2024-11-01T08:20:00Z'),
        verifiedByUser: true,
      },
    ],
    lastUpdated: new Date('2024-11-01T07:00:00Z'),
    createdAt: new Date('2024-10-22T00:00:00Z'),
  },
  {
    id: '6',
    sku: 'HD006',
    title: 'Everbilt Heavy-Duty Metal Shelf Brackets 12 inch (4-Pack)',
    description:
      'Strong metal shelf brackets for wall mounting. Supports up to 40 lbs per bracket.',
    imageUrl: '/images/products/2.webp',
    originalPrice: 24.99,
    discountedPrice: 4.99,
    discountPercentage: 80,
    category: 'Hardware',
    brand: 'Everbilt',
    model: 'EB-SB-12-4PK',
    upc: '444333222111',
    availability: 'in_stock',
    isUltraLowPrice: false,
    storeLocations: [
      {
        storeId: 'store1',
        store: mockStores[0],
        price: 4.99,
        stock: 12,
        lastScanned: new Date('2024-11-01T10:00:00Z'),
        verifiedByUser: false,
      },
    ],
    lastUpdated: new Date('2024-11-01T06:30:00Z'),
    createdAt: new Date('2024-10-16T00:00:00Z'),
  },
  {
    id: '7',
    sku: 'HD007',
    title: 'Rust-Oleum Universal Primer Spray Paint 12oz Can',
    description:
      'Universal bonding primer for metal, wood, and plastic surfaces.',
    imageUrl: '/images/products/3.webp',
    originalPrice: 8.99,
    discountedPrice: 0.25,
    discountPercentage: 97,
    category: 'Paint',
    brand: 'Rust-Oleum',
    model: 'RO-UP-12OZ',
    upc: '777888999000',
    availability: 'limited',
    isUltraLowPrice: false,
    storeLocations: [
      {
        storeId: 'store3',
        store: mockStores[2],
        price: 0.25,
        stock: 6,
        lastScanned: new Date('2024-11-01T11:30:00Z'),
        verifiedByUser: true,
      },
    ],
    lastUpdated: new Date('2024-11-01T05:15:00Z'),
    createdAt: new Date('2024-10-28T00:00:00Z'),
  },
  {
    id: '8',
    sku: 'HD008',
    title: 'Commercial Electric Extension Cord 25ft Outdoor Heavy Duty',
    description:
      'Weather-resistant outdoor extension cord with lighted end for visibility.',
    imageUrl: '/images/products/4.webp',
    originalPrice: 32.99,
    discountedPrice: 7.99,
    discountPercentage: 76,
    category: 'Electrical',
    brand: 'Commercial Electric',
    model: 'CE-EC-25FT-HD',
    upc: '888999000111',
    availability: 'in_stock',
    isUltraLowPrice: false,
    storeLocations: [
      {
        storeId: 'store1',
        store: mockStores[0],
        price: 7.99,
        stock: 7,
        lastScanned: new Date('2024-11-01T09:45:00Z'),
        verifiedByUser: false,
      },
      {
        storeId: 'store2',
        store: mockStores[1],
        price: 8.99,
        stock: 3,
        lastScanned: new Date('2024-11-01T08:30:00Z'),
        verifiedByUser: true,
      },
    ],
    lastUpdated: new Date('2024-11-01T04:45:00Z'),
    createdAt: new Date('2024-10-19T00:00:00Z'),
  },
  {
    id: '9',
    sku: 'HD009',
    title: 'Miracle-Gro Potting Soil Mix 8 Quart Bag for Indoor Plants',
    description:
      'Premium potting soil blend perfect for indoor plants and container gardening.',
    imageUrl: '/images/products/1.webp',
    originalPrice: 12.99,
    discountedPrice: 1.99,
    discountPercentage: 85,
    category: 'Garden',
    brand: 'Miracle-Gro',
    model: 'MG-PS-8QT',
    upc: '999000111222',
    availability: 'in_stock',
    isUltraLowPrice: false,
    storeLocations: [
      {
        storeId: 'store2',
        store: mockStores[1],
        price: 1.99,
        stock: 15,
        lastScanned: new Date('2024-11-01T10:15:00Z'),
        verifiedByUser: true,
      },
    ],
    lastUpdated: new Date('2024-11-01T06:45:00Z'),
    createdAt: new Date('2024-10-24T00:00:00Z'),
  },
  {
    id: '10',
    sku: 'HD010',
    title: 'Assorted Screws and Fasteners Clearance Bin Mix (5 lbs)',
    description:
      'Mixed bag of assorted screws, bolts, and fasteners from clearance inventory.',
    imageUrl: '/images/products/2.webp',
    originalPrice: 18.99,
    discountedPrice: 0.1,
    discountPercentage: 99,
    category: 'Hardware',
    brand: 'Mixed Brands',
    model: 'CLEARANCE-MIX-5LB',
    upc: '000111222333',
    availability: 'limited',
    isUltraLowPrice: true,
    storeLocations: [
      {
        storeId: 'store1',
        store: mockStores[0],
        price: 0.1,
        stock: 8,
        lastScanned: new Date('2024-11-01T12:15:00Z'),
        verifiedByUser: true,
      },
      {
        storeId: 'store3',
        store: mockStores[2],
        price: 0.1,
        stock: 5,
        lastScanned: new Date('2024-11-01T11:45:00Z'),
        verifiedByUser: false,
      },
    ],
    lastUpdated: new Date('2024-11-01T03:30:00Z'),
    createdAt: new Date('2024-10-30T00:00:00Z'),
  },
]

// Statistics derived from mock data
export const mockStats = {
  totalDeals: mockProducts.length,
  ultraLowCount: mockProducts.filter(p => p.isUltraLowPrice).length,
  avgDiscount: Math.round(
    mockProducts.reduce((sum, p) => sum + p.discountPercentage, 0) /
      mockProducts.length
  ),
  avgPrice:
    Math.round(
      (mockProducts.reduce((sum, p) => sum + p.discountedPrice, 0) /
        mockProducts.length) *
        100
    ) / 100,
  storesCount: mockStores.length,
  totalSavings:
    Math.round(
      mockProducts.reduce(
        (sum, p) => sum + (p.originalPrice - p.discountedPrice),
        0
      ) * 100
    ) / 100,
  categoryCounts: mockProducts.reduce(
    (acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  ),
  recentActivity: {
    lastUpdate: new Date().toISOString(),
    productsAddedToday: Math.floor(Math.random() * 10) + 5,
    pricesVerifiedToday: Math.floor(Math.random() * 25) + 10,
  },
}

// Helper functions
export function getProductsByCategory(category: string): HomeDepotProduct[] {
  if (category === 'all') return mockProducts
  return mockProducts.filter(
    p => p.category.toLowerCase() === category.toLowerCase()
  )
}

export function getUltraLowPriceProducts(
  maxPrice: number = 0.1
): HomeDepotProduct[] {
  return mockProducts.filter(
    p => p.isUltraLowPrice && p.discountedPrice <= maxPrice
  )
}

export function searchProducts(searchTerm: string): HomeDepotProduct[] {
  const term = searchTerm.toLowerCase()
  return mockProducts.filter(
    p =>
      p.title.toLowerCase().includes(term) ||
      p.brand?.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term) ||
      p.description?.toLowerCase().includes(term)
  )
}

export function getProductById(id: string): HomeDepotProduct | undefined {
  return mockProducts.find(p => p.id === id)
}

export function getProductByUPC(upc: string): HomeDepotProduct | undefined {
  return mockProducts.find(p => p.upc === upc)
}
