"use server"

import * as cheerio from "cheerio"

interface ProductData {
  title?: string
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

interface ScrapingResult {
  success: boolean
  url: string
  statusCode?: number
  data?: {
    products: ProductData[]
    totalCount: number
    pagination?: {
      currentPage: number
      totalPages: number
      productsPerPage: number
    }
    pages?: {
      pageNumber: number
      url: string
      products: ProductData[]
      productCount: number
    }[]
    rawHtml?: string
  }
  error?: string
}

/**
 * Scrapes a URL using ScrapingBee API
 * @param url - The URL to scrape
 * @param parseProducts - Whether to parse product data (default: true)
 * @param saveHtml - Whether to include raw HTML in response (default: true, but files are not saved)
 * @returns JSON result with scraped data
 */
export async function scrapeUrl(
  url: string,
  parseProducts: boolean = true,
  saveHtml: boolean = true
): Promise<ScrapingResult> {
  const SCRAPINGBEE_API_KEY =
    "GE686H463Y0EVSGKQII5V0FJ2XNEDJDAXFH9LW6S3V1A1J4RKTT5KAZ0664A9YO5RJUZHDLNDIH0JHQA"

  if (!SCRAPINGBEE_API_KEY) {
    return {
      success: false,
      url,
      error: "ScrapingBee API key not found in environment variables",
    }
  }

  try {
    // Build ScrapingBee API URL with parameters
    const apiUrl = new URL("https://app.scrapingbee.com/api/v1/")
    apiUrl.searchParams.append("api_key", SCRAPINGBEE_API_KEY)
    apiUrl.searchParams.append("url", url)
    apiUrl.searchParams.append("render_js", "true") // Enable JavaScript rendering
    apiUrl.searchParams.append("stealth_proxy", "true") // Use premium proxy
    apiUrl.searchParams.append("country_code", "us") // Target US
    apiUrl.searchParams.append("wait", "5000") // Increased initial wait
    apiUrl.searchParams.append("block_resources", "false") // Allow all resources

    // Add JavaScript to scroll page and load lazy-loaded products
    // BUT: Limit scrolling to avoid triggering pagination
    const jsScenario = {
      instructions: [
        { wait: 2000 }, // Initial wait for page load
        { scroll_y: 500 }, // Scroll down a bit
        { wait: 2000 }, // Wait for lazy load
        { scroll_y: 1000 }, // Scroll more
        { wait: 2000 }, // Wait for lazy load
        { scroll_y: 2000 }, // Scroll further
        { wait: 2000 }, // Wait for lazy load
        { scroll_y: 0 }, // Scroll back to top to ensure all are in DOM
        { wait: 2000 }, // Final wait
      ],
    }

    apiUrl.searchParams.append("js_scenario", JSON.stringify(jsScenario))

    console.log("=".repeat(80))
    console.log("🔄 Starting scrape for URL:", url)
    console.log("=".repeat(80))

    // Make request to ScrapingBee
    const response = await fetch(apiUrl.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(
        `ScrapingBee API error: ${response.status} ${response.statusText}`
      )
    }

    const htmlContent = await response.text()
    const statusCode = response.status

    console.log("✓ Successfully fetched page, HTML length:", htmlContent.length)
    console.log(
      `🔍 HTML contains 'data-product-id': ${htmlContent.includes(
        "data-product-id"
      )}`
    )
    console.log(
      `🔍 HTML contains 'sui-grid': ${htmlContent.includes("sui-grid")}`
    )

    // HTML file saving disabled - no longer saving HTML files
    // Removed to avoid cluttering the file system

    // If parseProducts is false, return raw HTML
    if (!parseProducts) {
      return {
        success: true,
        url,
        statusCode,
        data: {
          products: [],
          totalCount: 0,
          rawHtml: htmlContent,
        },
      }
    }

    // Parse products from HTML using cheerio
    const products = parseHomeDepotProducts(htmlContent, url)

    console.log(`✓ Found ${products.length} products`)

    return {
      success: true,
      url,
      statusCode,
      data: {
        products,
        totalCount: products.length,
        rawHtml: saveHtml ? htmlContent : undefined,
      },
    }
  } catch (error) {
    console.error("❌ Scrape error:", error)
    return {
      success: false,
      url,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

/**
 * Parses Home Depot product data from HTML content using cheerio
 * IMPORTANT: Only extracts products that appear BEFORE the pagination section
 * @param html - Raw HTML content
 * @param url - Source URL for debugging
 * @returns Array of parsed products
 */
function parseHomeDepotProducts(html: string, url: string): ProductData[] {
  const products: ProductData[] = []

  try {
    const $ = cheerio.load(html)

    console.log("🔍 Parsing products...")

    // Find pagination section FIRST to use as a boundary
    const pagination = $(
      '[data-component*="ResultsPagination"], [role="navigation"][aria-label*="Pagination"], .pagination, [class*="pagination"]'
    ).first()

    let productCards = $("div[data-product-id]")
    console.log(
      `📊 Found ${productCards.length} div[data-product-id] elements in HTML`
    )

    // CRITICAL FIX: Filter products to only include those that appear BEFORE pagination
    // This prevents picking up products from page 2 that might be loaded via lazy loading
    // The issue: When scrolling triggers lazy loading, products from page 2 can appear in the HTML
    // Solution: Only include products that appear before the pagination section in the HTML
    if (pagination.length > 0) {
      console.log(`📄 Pagination found, filtering products...`)

      const paginationEl = pagination[0]
      const paginationHtml = $.html(paginationEl)
      const paginationPos = html.indexOf(paginationHtml)

      console.log(`📄 Pagination found at position ${paginationPos} in HTML`)

      // Filter product cards to only include those that appear before pagination
      const filteredCards: any[] = []
      let beforeCount = 0
      let afterCount = 0

      productCards.each((index, el) => {
        // Get the HTML of this product element and find its position in the original HTML
        const productHtml = $.html(el)
        const productPos = html.indexOf(productHtml)

        // Only include products that appear before pagination in the HTML
        if (
          productPos !== -1 &&
          paginationPos !== -1 &&
          productPos < paginationPos
        ) {
          filteredCards.push(el)
          beforeCount++
        } else {
          afterCount++
        }
      })

      productCards = $(filteredCards)
      console.log(
        `✓ Filtered products: ${beforeCount} before pagination, ${afterCount} after pagination (removed)`
      )
      console.log(
        `✓ Keeping ${productCards.length} products from first page only`
      )
    } else {
      console.log("⚠️ No pagination found, keeping all products")
    }

    // If no products found, try alternative selectors
    if (productCards.length === 0) {
      console.log(
        "⚠️ No products found with div[data-product-id], trying alternatives..."
      )
      productCards = $(".sui-grid > div[data-product-id]")
      if (productCards.length === 0) {
        productCards = $(".product-pod[data-product-id]")
      }
      if (productCards.length === 0) {
        productCards = $("[data-product-id]")
      }
    }

    console.log(
      `✓ Found ${productCards.length} products using div[data-product-id]`
    )

    // Parse each product card
    productCards.each((_, el) => {
      const $card = $(el)
      const productId = $card.attr("data-product-id")

      if (!productId) return

      // Extract product label (title)
      const productLabel = $card
        .find('[data-testid="attribute-product-label"]')
        .text()
        .trim()

      // Extract brand
      const brand = $card
        .find('[data-testid="attribute-product-brand"]')
        .text()
        .trim()

      // Extract title - priority: brand + productLabel > productLabel > brand
      let title = ""
      if (brand && productLabel) {
        title = `${brand} ${productLabel}`
      } else if (productLabel) {
        title = productLabel
      } else if (brand) {
        title = brand
      } else {
        // Fallback to alt text or URL
        const titleFromAlt = $card.find("img").attr("alt") || ""
        const titleFromUrl = $card.find("a").attr("title") || ""
        title = titleFromAlt || titleFromUrl
      }

      // Extract price
      let price = ""
      const priceMain = $card
        .find(
          ".sui-font-display.sui-leading-none.sui-text-3xl, .sui-font-display.sui-leading-none.sui-text-4xl"
        )
        .text()
        .trim()
      const priceCents = $card
        .find(".sui-font-display.sui-leading-none.sui-text-xs")
        .last()
        .text()
        .trim()
        .replace(".", "")

      if (priceMain) {
        price = `$${priceMain}.${priceCents || "00"}`
      }

      // Extract old price
      let oldPrice = ""
      const wasPriceContainer = $card.find(".sui-text-subtle")
      if (wasPriceContainer.length > 0) {
        oldPrice = wasPriceContainer
          .find(".sui-line-through span")
          .first()
          .text()
          .trim()
      }

      // Extract save amount and percentage
      let saveAmount = ""
      let savePercentage = ""
      const saveText = $card.find(".sui-text-success").text()
      if (saveText) {
        const saveAmountMatch = saveText.match(/\$([\d,]+\.?\d*)/)
        if (saveAmountMatch) {
          saveAmount = `$${saveAmountMatch[1]}`
        }
        const savePercentMatch = saveText.match(/\((\d+)%\)/)
        if (savePercentMatch) {
          savePercentage = `${savePercentMatch[1]}%`
        }
      }

      // Extract image
      const image =
        $card.find("img").first().attr("src") ||
        $card.find("img").first().attr("data-src") ||
        ""

      // Extract URL
      let productUrl = $card.find("a").first().attr("href") || ""
      if (productUrl && !productUrl.startsWith("http")) {
        productUrl = `https://www.homedepot.com${productUrl}`
      }

      // Extract rating
      const rating = $card.find('[data-testid="rating"]').text().trim() || ""

      // Extract review count
      const reviewCount =
        $card.find('[data-testid="review-count"]').text().trim() || ""

      // Extract SKU
      const sku = productId || ""

      // Extract pickup
      let pickup = ""
      const pickupElement = $card
        .find(
          '[data-component*="FulfillmentPodStore"], [data-component*="FulfillmentStore"], [data-testid*="Pickup"], [data-testid*="Store"]'
        )
        .first()
      if (pickupElement.length > 0) {
        pickup = pickupElement.text().trim()
      } else {
        // Fallback: search for "Pickup" text
        const pickupText = $card.text().match(/Pickup[^\n]*/i)
        if (pickupText) {
          pickup = pickupText[0].trim()
        }
      }

      // Extract delivery
      let delivery = ""
      const deliveryElement = $card
        .find(
          '[data-component*="FulfillmentPodShipping"], [data-component*="FulfillmentShipping"], [data-testid="DeliveryIcon"], [data-testid*="Delivery"], [data-testid*="Shipping"]'
        )
        .first()
      if (deliveryElement.length > 0) {
        delivery = deliveryElement.text().trim()
      } else {
        // Fallback: search for "Delivery" or "Shipping" text
        const deliveryText = $card.text().match(/(?:Delivery|Shipping)[^\n]*/i)
        if (deliveryText) {
          delivery = deliveryText[0].trim()
        }
      }

      // Only add product if it has at least a title, URL, or product ID
      if (title || productUrl || productId) {
        products.push({
          title,
          price,
          oldPrice,
          saveAmount,
          savePercentage,
          image,
          url: productUrl,
          rating,
          sku,
          reviewCount,
          pickup,
          delivery,
        })
      }
    })

    // Remove duplicates based on SKU
    const uniqueProducts = products.filter(
      (product, index, self) =>
        index ===
        self.findIndex((p) => p.sku === product.sku && p.sku && product.sku)
    )

    console.log(
      `✓ Extracted ${products.length} products (${uniqueProducts.length} unique)`
    )

    return uniqueProducts
  } catch (error) {
    console.error("❌ Parse error:", error)
    return []
  }
}

/**
 * Scrapes any Home Depot product listing page
 * @param url - The Home Depot URL to scrape
 * @param maxPages - Maximum number of pages to scrape (default: 2 for testing)
 * @returns JSON result with product data from all pages
 */
export async function scrapeHomeDepotPage(
  url: string,
  maxPages: number = 2 // Default to 2 pages for testing
): Promise<ScrapingResult> {
  console.log(`🔄 Starting scrape (max ${maxPages} pages)...`)
  if (maxPages === 1) {
    console.log("📄 Test mode: Scraping only first page")
  }

  // Scrape the first page ONCE to get products and pagination info
  // We scrape with parseProducts=true and saveHtml=true to get both products and raw HTML
  // This is the ONLY time we scrape the first page
  console.log("📄 Scraping first page (this will only happen once)...")
  const firstPageResult = await scrapeUrl(url, true, true)

  if (!firstPageResult.success || !firstPageResult.data) {
    return firstPageResult
  }

  const firstPageProducts = firstPageResult.data.products || []
  console.log(
    `📊 First page: Found ${firstPageProducts.length} products from scraper`
  )

  const allProducts: ProductData[] = [...firstPageProducts]
  const pages: {
    pageNumber: number
    url: string
    products: ProductData[]
    productCount: number
  }[] = [
    {
      pageNumber: 1,
      url: url, // Page 1 uses base URL (Nao=0 or no Nao parameter)
      products: firstPageProducts,
      productCount: firstPageProducts.length,
    },
  ]

  // If only scraping first page, return early
  if (maxPages === 1) {
    console.log(
      `✓ Test mode complete: Returning ${firstPageProducts.length} products from first page only`
    )
    return {
      success: true,
      url: url,
      statusCode: firstPageResult.statusCode,
      data: {
        products: allProducts,
        totalCount: allProducts.length,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          productsPerPage: firstPageProducts.length,
        },
        pages: pages,
      },
    }
  }

  // Parse pagination info from the first page HTML
  // Reuse the raw HTML from the first scrape instead of scraping again
  let totalPages = 1
  // Use actual number of products on first page as products per page
  // This will be used to calculate Nao for subsequent pages
  let productsPerPage = firstPageProducts.length
  console.log(
    `📊 First page has ${productsPerPage} products - using this as products per page`
  )
  console.log(`📊 Second page URL will be: baseurl&Nao=${productsPerPage}`)

  try {
    // Use the raw HTML from the first scrape instead of scraping again
    if (firstPageResult.data?.rawHtml) {
      const $ = cheerio.load(firstPageResult.data.rawHtml)

      // Find pagination links - look for page numbers
      const paginationLinks = $(
        '[data-component*="ResultsPagination"] a, [role="navigation"][aria-label*="Pagination"] a, .pagination a, [class*="pagination"] a'
      )

      let maxPageNumber = 1
      paginationLinks.each((_, el) => {
        const $link = $(el)
        const href = $link.attr("href") || ""
        const text = $link.text().trim()

        // Extract page number from href (e.g., &Nao=24, &Nao=48)
        const naoMatch = href.match(/[&?]Nao=(\d+)/i)
        if (naoMatch) {
          const naoValue = parseInt(naoMatch[1], 10)
          // Calculate page number: Nao=24 means page 2 (if 24 products per page)
          const pageNum = Math.floor(naoValue / productsPerPage) + 1
          // Only consider valid page numbers (Nao should be divisible by productsPerPage)
          if (naoValue % productsPerPage === 0 && pageNum > maxPageNumber) {
            maxPageNumber = pageNum
          }
        }

        // Also check text content for page numbers
        const pageNumMatch = text.match(/^(\d+)$/)
        if (pageNumMatch) {
          const pageNum = parseInt(pageNumMatch[1], 10)
          if (pageNum > maxPageNumber) {
            maxPageNumber = pageNum
          }
        }
      })

      // Also check for "Next" button or last page indicator
      const nextButton = $(
        '[aria-label*="Next"], [aria-label*="next"], .pagination-next, [class*="next"]'
      )
      if (nextButton.length > 0) {
        // If there's a next button, there are more pages
        // Try to find the last page number
        const lastPageLink = $(
          '[aria-label*="Last"], [aria-label*="last"], .pagination-last, [class*="last"]'
        )
        if (lastPageLink.length > 0) {
          const lastHref = lastPageLink.attr("href") || ""
          const lastNaoMatch = lastHref.match(/[&?]Nao=(\d+)/i)
          if (lastNaoMatch) {
            const lastNaoValue = parseInt(lastNaoMatch[1], 10)
            maxPageNumber = Math.floor(lastNaoValue / productsPerPage) + 1
          }
        }
      }

      totalPages = Math.max(maxPageNumber, 1)
      console.log(
        `📄 Found pagination: ${totalPages} total pages, ${productsPerPage} products per page`
      )
    }
  } catch (error) {
    console.log("⚠️ Could not parse pagination, assuming single page:", error)
  }

  // Calculate how many pages to actually scrape
  const pagesToScrape = Math.min(maxPages, totalPages)
  console.log(
    `📊 Will scrape ${pagesToScrape} pages (requested: ${maxPages}, available: ${totalPages})`
  )

  // Scrape remaining pages (only pages 2 and 3 for maxPages=3)
  // Use cumulative product count for Nao parameter
  let cumulativeProductCount = firstPageProducts.length // Start with first page count

  for (let page = 2; page <= pagesToScrape; page++) {
    console.log(`🔄 Scraping page ${page}/${pagesToScrape}...`)
    console.log(
      `📊 Cumulative product count before page ${page}: ${cumulativeProductCount}`
    )

    // Calculate Nao value using cumulative product count
    // Page 2: Nao = first page product count (e.g., 24)
    // Page 3: Nao = first page + second page product count (e.g., 24 + 24 = 48)
    // Formula: Nao = sum of all previous pages' product counts
    const naoValue = cumulativeProductCount
    console.log(
      `📊 Page ${page}: Using Nao=${naoValue} (cumulative: ${cumulativeProductCount} products)`
    )

    // If base URL already has query params, use &Nao=, otherwise use ?Nao=
    let pageUrl: string
    try {
      const urlObj = new URL(url)
      // Remove existing Nao parameter if present
      urlObj.searchParams.delete("Nao")
      // Add new Nao parameter
      urlObj.searchParams.set("Nao", naoValue.toString())
      pageUrl = urlObj.toString()
    } catch (error) {
      // Fallback: manual URL construction if URL parsing fails
      // Check if URL already has query parameters
      if (url.includes("?")) {
        // URL already has query params, use &Nao=
        // Remove existing Nao parameter if present
        const baseUrl = url.split("?")[0]
        const existingParams = url.split("?")[1]
        const params = new URLSearchParams(existingParams)
        params.delete("Nao") // Remove existing Nao if present
        params.set("Nao", naoValue.toString())
        pageUrl = `${baseUrl}?${params.toString()}`
      } else {
        // No query params, use ?Nao=
        pageUrl = `${url}?Nao=${naoValue}`
      }
    }

    console.log(`📄 Page ${page} URL: ${pageUrl} (Nao=${naoValue})`)

    // Scrape this page and wait for completion before proceeding to next page
    const pageResult = await scrapeUrl(pageUrl, true, false)

    if (pageResult.success && pageResult.data) {
      const pageProducts = pageResult.data.products || []
      console.log(
        `✓ Page ${page}: Found ${pageProducts.length} products from scraper`
      )

      // Add products to the all products array
      allProducts.push(...pageProducts)

      // Update cumulative product count for next page
      cumulativeProductCount += pageProducts.length
      console.log(
        `📊 Updated cumulative count: ${cumulativeProductCount} (added ${pageProducts.length} from page ${page})`
      )

      // Add page info
      pages.push({
        pageNumber: page,
        url: pageUrl,
        products: pageProducts,
        productCount: pageProducts.length,
      })

      console.log(
        `📊 Total products so far: ${allProducts.length} (from ${pages.length} pages)`
      )
      console.log(
        `⏳ Waiting for page ${page} to fully complete before proceeding...`
      )
    } else {
      console.log(`⚠️ Page ${page} failed:`, pageResult.error)
      // If a page fails, we still update cumulative count to avoid skipping products
      // But we don't add products from failed page
    }

    // Wait for current page scraping to fully complete before proceeding to next page
    // This ensures sequential scraping: only scrape next page after current page finishes
    console.log(
      `⏳ Page ${page} completed. Waiting before proceeding to next page...`
    )
    await new Promise((resolve) => setTimeout(resolve, 2000)) // 2 second delay for synchronization
  }

  // Remove duplicates based on SKU
  const uniqueProducts = allProducts.filter(
    (product, index, self) =>
      index ===
      self.findIndex((p) => p.sku === product.sku && p.sku && product.sku)
  )

  console.log(
    `✓ Total products scraped: ${allProducts.length} (${uniqueProducts.length} unique)`
  )

  return {
    success: true,
    url: url,
    statusCode: firstPageResult.statusCode,
    data: {
      products: uniqueProducts,
      totalCount: uniqueProducts.length,
      pagination: {
        currentPage: 1,
        totalPages: totalPages,
        productsPerPage: productsPerPage,
      },
      pages: pages,
    },
  }
}
