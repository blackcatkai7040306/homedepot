"use server"

import * as cheerio from "cheerio"

// Enhanced interfaces for paginated scraping
interface ProductData {
  title?: string
  brand?: string
  label?: string
  price?: string
  oldPrice?: string
  saveAmount?: string
  savePercentage?: string
  image?: string
  url?: string
  rating?: string
  sku?: string
  reviewCount?: string
  pickup?: string
  delivery?: string
}

interface PageResult {
  products: ProductData[]
  pageNumber: number
  productsCount: number
  hasNextPage: boolean
  nextPageUrl?: string
}

interface PaginatedScrapingResult {
  success: boolean
  baseUrl: string
  totalPages: number
  totalProducts: number
  pages: PageResult[]
  allProducts: ProductData[]
  error?: string
}

const SCRAPINGBEE_API_KEY = "GE686H463Y0EVSGKQII5V0FJ2XNEDJDAXFH9LW6S3V1A1J4RKTT5KAZ0664A9YO5RJUZHDLNDIH0JHQA"

/**
 * Scrapes a single URL using ScrapingBee API
 */
async function scrapeUrlPaginated(url: string): Promise<{ success: boolean; html?: string; error?: string }> {
  if (!SCRAPINGBEE_API_KEY) {
    return {
      success: false,
      error: "ScrapingBee API key not found"
    }
  }

  try {
    const apiUrl = new URL("https://app.scrapingbee.com/api/v1/")
    apiUrl.searchParams.append("api_key", SCRAPINGBEE_API_KEY)
    apiUrl.searchParams.append("url", url)
    apiUrl.searchParams.append("render_js", "true")
    apiUrl.searchParams.append("stealth_proxy", "true")
    apiUrl.searchParams.append("country_code", "us")
    apiUrl.searchParams.append("wait", "5000")
    apiUrl.searchParams.append("wait_for", "div[data-product-id]")
    apiUrl.searchParams.append("block_ads", "true")

    // Add scrolling to load all products
    const jsScenario = {
      instructions: [
        { wait: 2000 },
        { scroll_y: 1000 },
        { wait: 2000 },
        { scroll_y: 2000 },
        { wait: 2000 },
        { scroll_y: 3000 },
        { wait: 2000 },
        { scroll_y: 0 },
        { wait: 2000 }
      ]
    }
    apiUrl.searchParams.append("js_scenario", JSON.stringify(jsScenario))

    const response = await fetch(apiUrl.toString(), {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    })

    if (!response.ok) {
      throw new Error(`ScrapingBee API error: ${response.status} ${response.statusText}`)
    }

    const html = await response.text()
    return { success: true, html }

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown scraping error"
    }
  }
}

/**
 * Parses Home Depot products from HTML using the specific structure you provided
 */
function parseHomeDepotProductsNew(html: string): ProductData[] {
  const products: ProductData[] = []
  
  try {
    const $ = cheerio.load(html)
    console.log("🔍 Parsing products with new structure...")
    
    // Find product containers with data-product-id
    const productCards = $('div[data-product-id]')
    
    if (productCards.length === 0) {
      console.log("⚠️ No product cards found with data-product-id")
      return products
    }
    
    console.log(`✓ Found ${productCards.length} product cards`)
    
    productCards.each((index, element) => {
      const $productCard = $(element)
      const productId = $productCard.attr("data-product-id") || ""
      
      // Extract product image
      const imageElement = $productCard.find("img").first()
      let image = imageElement.attr("src") || imageElement.attr("data-src") || ""
      
      if (image && image.startsWith("//")) {
        image = "https:" + image
      }
      
      // Extract brand and product label from h3 structure
      // <h3 class="sui-flex-col sui-line-clamp-2...">
      //   <span data-testid="attribute-brandname-inline">Frigidaire</span>
      //   <span data-testid="attribute-product-label">31.5 in. 18 cu. ft...</span>
      // </h3>
      const h3Element = $productCard.find('h3.sui-flex-col, h3[class*="sui-line-clamp"]').first()
      
      const brand = h3Element.find('span[data-testid="attribute-brandname-inline"]').text().trim()
      const label = h3Element.find('span[data-testid="attribute-product-label"]').text().trim()
      const title = brand && label ? `${brand} ${label}` : (label || brand)
      
      // Extract price information from data-testid="price-simple"
      const priceContainer = $productCard.find('div[data-testid="price-simple"]').first()
      
      let price = ""
      let oldPrice = ""
      let saveAmount = ""
      let savePercentage = ""
      
      if (priceContainer.length > 0) {
        // Extract current price: $1,198.00
        const priceMain = priceContainer.find('.sui-font-display.sui-text-3xl, .sui-font-display.sui-text-4xl').text().trim()
        const priceCents = priceContainer.find('.sui-sr-only').next('.sui-font-display.sui-text-xs').text().trim()
        
        if (priceMain) {
          price = `$${priceMain.replace(/,/g, '')}.${priceCents || "00"}`
        }
        
        // Extract old price: Was $1,999.00
        const wasPriceText = priceContainer.find('.sui-line-through span').text().trim()
        if (wasPriceText) {
          oldPrice = wasPriceText
        }
        
        // Extract save amount and percentage: Save $801.00 (40%)
        const saveText = priceContainer.find('.sui-text-success').text().trim()
        if (saveText) {
          const saveAmountMatch = saveText.match(/\$([\d,]+\.?\d*)/)
          if (saveAmountMatch) {
            saveAmount = `$${saveAmountMatch[1]}`
          }
          
          const savePercentMatch = saveText.match(/\((\d+)%\)/)
          if (savePercentMatch) {
            savePercentage = savePercentMatch[1] + "%"
          }
        }
      }
      
      // Extract pickup information from FulfillmentPodStore
      let pickup = ""
      const pickupContainer = $productCard.find('[data-component*="FulfillmentPodStore"]').first()
      if (pickupContainer.length > 0) {
        const pickupText = pickupContainer.text().trim()
        const pickupMatch = pickupText.match(/Pickup:\s*(.+)/)
        if (pickupMatch) {
          pickup = pickupMatch[1].trim()
        } else {
          pickup = pickupText.replace(/^\s*Pickup\s*/i, '').trim()
        }
      }
      
      // Extract delivery information from FulfillmentPodShipping
      let delivery = ""
      const deliveryContainer = $productCard.find('[data-component*="FulfillmentPodShipping"]').first()
      if (deliveryContainer.length > 0) {
        const deliveryText = deliveryContainer.text().trim()
        const deliveryMatch = deliveryText.match(/Delivery:\s*(.+)/)
        if (deliveryMatch) {
          delivery = deliveryMatch[1].trim()
        } else {
          delivery = deliveryText.replace(/^\s*Delivery\s*/i, '').trim()
        }
      }
      
      // Extract product URL
      const urlElement = $productCard.find('a[href*="/p/"]').first()
      let productUrl = urlElement.attr("href") || ""
      
      if (productUrl && !productUrl.startsWith("http")) {
        productUrl = "https://www.homedepot.com" + productUrl
      }
      
      // Log first 3 products for debugging
      if (index < 3) {
        console.log(`Product ${index + 1}:`, {
          sku: productId,
          brand,
          label: label.length > 50 ? label.substring(0, 50) + "..." : label,
          price,
          oldPrice,
          saveAmount,
          savePercentage,
          pickup: pickup.length > 30 ? pickup.substring(0, 30) + "..." : pickup,
          delivery: delivery.length > 30 ? delivery.substring(0, 30) + "..." : delivery,
          hasImage: !!image,
          hasUrl: !!productUrl
        })
      }
      
      // Add product if we have essential data
      if ((title || label) && productId) {
        products.push({
          title,
          brand,
          label,
          price,
          oldPrice,
          saveAmount,
          savePercentage,
          image,
          url: productUrl,
          sku: productId,
          pickup,
          delivery
        })
      }
    })
    
    console.log(`✓ Parsed ${products.length} products successfully`)
    return products
    
  } catch (error) {
    console.error("❌ Error parsing products:", error)
    return products
  }
}

/**
 * Main function: Scrapes Home Depot Refrigerators with complete pagination support
 * Automatically detects total pages and scrapes ALL pages
 * @param baseUrl - The base URL to scrape (first page)
 * @returns Paginated scraping result with all products from all pages
 */
export async function scrapeHomeDepotRefrigeratorsPaginated(
  baseUrl: string = "https://www.homedepot.com/b/Appliances-Refrigerators-French-Door-Refrigerators/Special-Buys/N-5yc1vZc3ooZ1z11ao3"
): Promise<PaginatedScrapingResult> {
  console.log(`🔄 Starting COMPLETE paginated scraping for: ${baseUrl}`)
  console.log(`📊 Will automatically detect and scrape ALL pages`)
  
  const pages: PageResult[] = []
  let allProducts: ProductData[] = []
  let productsPerPage = 0
  
  try {
    // Step 1: Scrape the first page
    console.log(`📄 Scraping page 1...`)
    const firstPageResult = await scrapeUrlPaginated(baseUrl)
    
    if (!firstPageResult.success || !firstPageResult.html) {
      return {
        success: false,
        baseUrl,
        totalPages: 0,
        totalProducts: 0,
        pages: [],
        allProducts: [],
        error: firstPageResult.error || "Failed to scrape first page"
      }
    }

    // Parse first page products
    const firstPageProducts = parseHomeDepotProductsNew(firstPageResult.html)
    productsPerPage = firstPageProducts.length
    
    console.log(`✓ First page scraped: ${firstPageProducts.length} products found`)
    
    // Add first page to results
    pages.push({
      products: firstPageProducts,
      pageNumber: 1,
      productsCount: firstPageProducts.length,
      hasNextPage: true, // Will be determined later
      nextPageUrl: productsPerPage > 0 ? `${baseUrl}?Nao=${productsPerPage}` : undefined
    })
    
    allProducts.push(...firstPageProducts)
    
    // Step 2: Comprehensive pagination detection from HTML
    const $ = cheerio.load(firstPageResult.html)
    
    // Try multiple selectors to find pagination
    const paginationSelectors = [
      '[data-testid*="pagination"]',
      '.pagination a',
      '[role="navigation"] a',
      '[aria-label*="page"]',
      '.pagination button',
      '.pagination span',
      '[class*="pagination"] a',
      '[class*="pagination"] button',
      '[class*="pager"] a',
      'nav a[href*="Nao="]',
      'a[href*="Nao="]'
    ]
    
    let maxPageFromPagination = 1
    
    for (const selector of paginationSelectors) {
      const elements = $(selector)
      if (elements.length > 0) {
        console.log(`🔍 Found pagination elements with selector: ${selector} (${elements.length} elements)`)
        
        const numbers = elements.map((_, el) => {
          const $el = $(el)
          const text = $el.text().trim()
          const href = $el.attr('href') || ''
          
          // Extract number from text
          const textNum = parseInt(text)
          
          // Extract page number from href (Nao parameter)
          let hrefPageNum = 0
          if (href.includes('Nao=')) {
            const naoMatch = href.match(/Nao=(\d+)/)
            if (naoMatch && productsPerPage > 0) {
              const naoValue = parseInt(naoMatch[1])
              hrefPageNum = Math.floor(naoValue / productsPerPage) + 1
            }
          }
          
          console.log(`   - Element: text="${text}", href page=${hrefPageNum}, text num=${textNum}`)
          
          return Math.max(textNum || 0, hrefPageNum || 0)
        }).get().filter(num => num > 0)
        
        if (numbers.length > 0) {
          const maxFromSelector = Math.max(...numbers)
          maxPageFromPagination = Math.max(maxPageFromPagination, maxFromSelector)
          console.log(`   - Max page from ${selector}: ${maxFromSelector}`)
        }
      }
    }
    
    console.log(`📊 Pagination analysis:`)
    console.log(`   - Products per page: ${productsPerPage}`)
    console.log(`   - Max page detected from HTML: ${maxPageFromPagination}`)
    console.log(`   - Will scrape ALL ${maxPageFromPagination} pages`)
    
    // If no products on first page or only 1 page, return early
    if (productsPerPage === 0 || maxPageFromPagination <= 1) {
      if (pages.length > 0) {
        pages[0].hasNextPage = false
      }
      console.log(`✅ Only 1 page detected. Total: ${allProducts.length} products`)
      return {
        success: true,
        baseUrl,
        totalPages: pages.length,
        totalProducts: allProducts.length,
        pages,
        allProducts,
      }
    }
    
    // Step 3: Scrape ALL remaining pages with proper synchronization
    for (let page = 2; page <= maxPageFromPagination; page++) {
      const offset = (page - 1) * productsPerPage
      const pageUrl = `${baseUrl}?Nao=${offset}`
      
      console.log(`📄 Scraping page ${page}/${maxPageFromPagination}`)
      console.log(`   URL: ${pageUrl}`)
      console.log(`   Expected offset: ${offset}`)
      
      // Critical: Wait between requests for proper synchronization
      console.log(`⏳ Waiting 3 seconds before scraping page ${page} for synchronization...`)
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const pageResult = await scrapeUrlPaginated(pageUrl)
      
      if (!pageResult.success || !pageResult.html) {
        console.log(`⚠️ Failed to scrape page ${page}: ${pageResult.error}`)
        // Don't break completely - continue with what we have
        break
      }
      
      const pageProducts = parseHomeDepotProductsNew(pageResult.html)
      
      console.log(`✓ Page ${page} scraped: ${pageProducts.length} products found`)
      
      // Detect if this is the last page
      const isLastPage = pageProducts.length < productsPerPage || pageProducts.length === 0
      
      if (pageProducts.length > 0) {
        pages.push({
          products: pageProducts,
          pageNumber: page,
          productsCount: pageProducts.length,
          hasNextPage: !isLastPage,
          nextPageUrl: isLastPage ? undefined : `${baseUrl}?Nao=${page * productsPerPage}`
        })
        
        allProducts.push(...pageProducts)
        console.log(`   Total products so far: ${allProducts.length}`)
      } else {
        console.log(`   No products found on page ${page} - stopping pagination`)
      }
      
      // Stop if we've reached the last page
      if (isLastPage) {
        console.log(`📄 Reached last page: ${page} (found ${pageProducts.length} products)`)
        break
      }
    }
    
    // Update hasNextPage for the last page
    if (pages.length > 0) {
      pages[pages.length - 1].hasNextPage = false
    }
    
    console.log(`✅ Pagination complete!`)
    console.log(`   - Total pages scraped: ${pages.length}`)
    console.log(`   - Total products found: ${allProducts.length}`)
    console.log(`   - Average products per page: ${Math.round(allProducts.length / pages.length)}`)
    
    return {
      success: true,
      baseUrl,
      totalPages: pages.length,
      totalProducts: allProducts.length,
      pages,
      allProducts,
    }
    
  } catch (error) {
    console.error("❌ Pagination scraping error:", error)
    return {
      success: false,
      baseUrl,
      totalPages: pages.length,
      totalProducts: allProducts.length,
      pages,
      allProducts,
      error: error instanceof Error ? error.message : "Unknown pagination error"
    }
  }
}
