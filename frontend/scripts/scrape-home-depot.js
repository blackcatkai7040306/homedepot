/**
 * Home Depot Web Scraper
 * 
 * This script scrapes clearance and discount data from Home Depot.
 * Run with: npm run scrape
 * 
 * IMPORTANT: This is for educational/demo purposes only.
 * Always respect robots.txt and terms of service.
 * Consider using official APIs when available.
 */

const axios = require('axios')
const cheerio = require('cheerio')
const fs = require('fs').promises

class HomeDepotScraper {
  constructor() {
    this.baseURL = 'https://www.homedepot.com'
    this.userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    this.delay = 2000 // 2 second delay between requests
  }

  async scrape() {
    console.log('🏠 Starting Home Depot scraper...')
    console.log('⚠️  This is a demo implementation - use official APIs when available')
    
    try {
      // In a real implementation, you would:
      // 1. Navigate to clearance sections
      // 2. Parse product listings
      // 3. Extract pricing data
      // 4. Handle pagination
      // 5. Store data in database
      
      const categories = [
        'tools',
        'garden',
        'hardware',
        'paint',
        'electrical',
        'plumbing'
      ]

      const scrapedData = []
      
      for (const category of categories) {
        console.log(`📦 Scraping ${category} category...`)
        
        // Use structured mock data instead of random generation
        const categoryData = await this.getCategoryProducts(category)
        scrapedData.push(...categoryData)
        
        // Respectful delay
        await this.sleep(this.delay)
      }
      
      // Save results
      await this.saveResults(scrapedData)
      
      console.log(`✅ Scraping completed! Found ${scrapedData.length} products`)
      return scrapedData
      
    } catch (error) {
      console.error('❌ Scraping error:', error)
      throw error
    }
  }

  async getCategoryProducts(category) {
    // Use structured mock data from our centralized source
    // In production, this would parse actual Home Depot pages
    
    const structuredProducts = {
      tools: [
        {
          sku: 'HD001',
          title: 'DEWALT 20V MAX Cordless Drill Kit with Battery and Charger',
          description: 'Powerful cordless drill with variable speed trigger and LED light. Includes battery and charger.',
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
          scrapedAt: new Date().toISOString()
        },
        {
          sku: 'HD004',
          title: 'Husky LED Work Light 2000 Lumens Portable Construction Light',
          description: 'Bright LED work light with adjustable stand for construction and maintenance work.',
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
          scrapedAt: new Date().toISOString()
        }
      ],
      garden: [
        {
          sku: 'HD002',
          title: 'Flexible Garden Hose 50ft Heavy Duty with Spray Nozzle',
          description: 'Durable rubber garden hose perfect for all outdoor watering needs. Includes spray nozzle.',
          imageUrl: '/images/products/2.webp',
          originalPrice: 49.99,
          discountedPrice: 0.10,
          discountPercentage: 99,
          category: 'Garden',
          brand: 'Flexzilla',
          model: 'HFZG550YW',
          upc: '123456789013',
          availability: 'limited',
          isUltraLowPrice: true,
          scrapedAt: new Date().toISOString()
        },
        {
          sku: 'HD005',
          title: 'Plastic Plant Pots Set of 20 Mixed Sizes for Indoor/Outdoor',
          description: 'Various sized plastic plant pots perfect for gardening and plant propagation.',
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
          scrapedAt: new Date().toISOString()
        }
      ],
      hardware: [
        {
          sku: 'HD006',
          title: 'Everbilt Heavy-Duty Metal Shelf Brackets 12 inch (4-Pack)',
          description: 'Strong metal shelf brackets for wall mounting. Supports up to 40 lbs per bracket.',
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
          scrapedAt: new Date().toISOString()
        },
        {
          sku: 'HD010',
          title: 'Assorted Screws and Fasteners Clearance Bin Mix (5 lbs)',
          description: 'Mixed bag of assorted screws, bolts, and fasteners from clearance inventory.',
          imageUrl: '/images/products/2.webp',
          originalPrice: 18.99,
          discountedPrice: 0.10,
          discountPercentage: 99,
          category: 'Hardware',
          brand: 'Mixed Brands',
          model: 'CLEARANCE-MIX-5LB',
          upc: '000111222333',
          availability: 'limited',
          isUltraLowPrice: true,
          scrapedAt: new Date().toISOString()
        }
      ],
      paint: [
        {
          sku: 'HD003',
          title: 'BEHR Paint Color Sample Cards Bundle (100 pieces)',
          description: 'Assorted paint color samples for home decoration and design planning.',
          imageUrl: '/images/products/3.webp',
          originalPrice: 25.00,
          discountedPrice: 0.01,
          discountPercentage: 99,
          category: 'Paint',
          brand: 'Behr',
          model: 'COLOR-SAMPLES-100',
          upc: '999888777666',
          availability: 'in_stock',
          isUltraLowPrice: true,
          scrapedAt: new Date().toISOString()
        }
      ],
      electrical: [
        {
          sku: 'HD008',
          title: 'Commercial Electric Extension Cord 25ft Outdoor Heavy Duty',
          description: 'Weather-resistant outdoor extension cord with lighted end for visibility.',
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
          scrapedAt: new Date().toISOString()
        }
      ]
    }
    
    return structuredProducts[category] || []
  }


  async saveResults(data) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `scraped-data-${timestamp}.json`
    
    await fs.writeFile(filename, JSON.stringify(data, null, 2))
    console.log(`💾 Results saved to ${filename}`)
    
    // Also save a summary
    const summary = {
      timestamp: new Date().toISOString(),
      totalProducts: data.length,
      categories: [...new Set(data.map(p => p.category))],
      ultraLowPriceCount: data.filter(p => p.isUltraLowPrice).length,
      avgDiscount: data.reduce((sum, p) => sum + p.discountPercentage, 0) / data.length
    }
    
    await fs.writeFile(`summary-${timestamp}.json`, JSON.stringify(summary, null, 2))
    console.log(`📊 Summary saved to summary-${timestamp}.json`)
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// CLI interface
async function main() {
  console.log('🚀 Home Depot Clearance Scraper')
  console.log('================================')
  
  const scraper = new HomeDepotScraper()
  
  try {
    await scraper.scrape()
    process.exit(0)
  } catch (error) {
    console.error('💥 Scraper failed:', error)
    process.exit(1)
  }
}

// Run if called directly
if (require.main === module) {
  main()
}

module.exports = HomeDepotScraper
