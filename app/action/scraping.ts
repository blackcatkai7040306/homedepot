"use server"

import * as cheerio from "cheerio"

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
 * MAIN ENTRY POINT: Enhanced pagination scraping with reliable product loading
 */
export async function scrapeHomeDepotPage(
  url: string,
  maxPages: number = 2
): Promise<ScrapingResult> {
  console.log(`🔄 STARTING PAGINATION SCRAPER (max ${maxPages} pages)...`)
  console.log(`🔗 Target URL: ${url}`)

  // Scrape first page with comprehensive strategy
  console.log("\n📄 STEP 1: Scraping FIRST page...")
  const firstPageResult = await scrapeWithPaginationStrategy(url, 1)

  if (!firstPageResult.success || !firstPageResult.data) {
    console.error("❌ FIRST PAGE FAILED - Aborting pagination")
    return firstPageResult
  }

  const firstPageProducts = firstPageResult.data.products || []
  const allProducts: ProductData[] = [...firstPageProducts]
  const pages: {
    pageNumber: number
    url: string
    products: ProductData[]
    productCount: number
  }[] = [
    {
      pageNumber: 1,
      url: url,
      products: firstPageProducts,
      productCount: firstPageProducts.length,
    },
  ]

  console.log(`✅ FIRST PAGE SUCCESS: ${firstPageProducts.length} products`)

  // If only scraping first page, return early
  if (maxPages === 1) {
    console.log(
      `🏁 TEST MODE: Returning ${firstPageProducts.length} products from first page only`
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

  // Detect total pages from first page
  console.log("\n📊 STEP 2: Detecting pagination...")
  const totalPages = detectTotalPages(
    firstPageResult.data.rawHtml || "",
    firstPageProducts.length
  )
  const pagesToScrape = Math.min(maxPages, totalPages)

  console.log(
    `📊 Pagination detected: ${totalPages} total pages, scraping ${pagesToScrape} pages`
  )

  // Scrape subsequent pages with PAGINATION-OPTIMIZED strategy
  console.log("\n📄 STEP 3: Scraping subsequent pages...")
  for (let page = 2; page <= pagesToScrape; page++) {
    console.log(`\n${"=".repeat(60)}`)
    console.log(`📄 SCRAPING PAGE ${page}/${pagesToScrape}...`)
    console.log(`${"=".repeat(60)}`)

    const naoValue = (page - 1) * firstPageProducts.length
    const pageUrl = updateUrlParameter(url, "Nao", naoValue.toString())

    console.log(`🔗 Page ${page} URL: ${pageUrl}`)
    console.log(
      `🔗 Nao parameter: ${naoValue} (${firstPageProducts.length} products per page)`
    )

    // Use PAGINATION-OPTIMIZED scraping with extended waiting
    const pageResult = await scrapeWithPaginationStrategy(pageUrl, page)

    if (pageResult.success && pageResult.data) {
      const pageProducts = pageResult.data.products

      if (pageProducts.length === 0) {
        console.warn(
          `🚨 PAGE ${page} RETURNED 0 PRODUCTS! Attempting recovery...`
        )

        // Recovery Strategy 1: Retry with extended wait
        console.log(`🔄 RECOVERY: Retrying page ${page} with extended wait...`)
        await new Promise((resolve) => setTimeout(resolve, 10000))
        const retryResult = await scrapeWithExtendedPaginationWait(
          pageUrl,
          page
        )

        if (
          retryResult.success &&
          retryResult.data &&
          retryResult.data.products.length > 0
        ) {
          console.log(
            `✅ RECOVERY SUCCESS: Page ${page} retry got ${retryResult.data.products.length} products`
          )
          allProducts.push(...retryResult.data.products)
          pages.push({
            pageNumber: page,
            url: pageUrl,
            products: retryResult.data.products,
            productCount: retryResult.data.products.length,
          })
        } else {
          // Recovery Strategy 2: Ultra-extended wait as last resort
          console.log(
            `🐌 FINAL ATTEMPT: Ultra-extended wait for page ${page}...`
          )
          await new Promise((resolve) => setTimeout(resolve, 15000))
          const finalResult = await scrapeWithUltraExtendedWait(pageUrl, page)

          if (
            finalResult.success &&
            finalResult.data &&
            finalResult.data.products.length > 0
          ) {
            console.log(
              `🎉 ULTRA RECOVERY: Page ${page} final attempt got ${finalResult.data.products.length} products`
            )
            allProducts.push(...finalResult.data.products)
            pages.push({
              pageNumber: page,
              url: pageUrl,
              products: finalResult.data.products,
              productCount: finalResult.data.products.length,
            })
          } else {
            console.warn(`💀 PAGE ${page} FAILED: All recovery attempts failed`)
            pages.push({
              pageNumber: page,
              url: pageUrl,
              products: [],
              productCount: 0,
            })
          }
        }
      } else {
        // Normal success case
        allProducts.push(...pageProducts)
        pages.push({
          pageNumber: page,
          url: pageUrl,
          products: pageProducts,
          productCount: pageProducts.length,
        })
        console.log(`✅ PAGE ${page} SUCCESS: ${pageProducts.length} products`)
      }
    } else {
      console.warn(`❌ PAGE ${page} FAILED: ${pageResult.error}`)
      pages.push({
        pageNumber: page,
        url: pageUrl,
        products: [],
        productCount: 0,
      })
    }

    // Strategic delay between pagination requests
    const delay = calculatePageDelay(page)
    console.log(
      `⏳ Strategic delay: ${delay / 1000}s before page ${page + 1}...`
    )
    await new Promise((resolve) => setTimeout(resolve, delay))

    console.log(
      `📊 Running total: ${allProducts.length} products from ${pages.length} pages`
    )
  }

  // Final processing and validation
  console.log("\n🏁 STEP 4: Final processing...")
  const uniqueProducts = removeDuplicates(allProducts)
  const validProducts = validateProducts(uniqueProducts)

  console.log(`\n${"🎉".repeat(20)}`)
  console.log(`🎯 SCRAPING COMPLETE!`)
  console.log(
    `📊 Final Results: ${validProducts.length} valid products from ${pages.length} pages`
  )
  console.log(
    `📊 Successful pages: ${pages.filter((p) => p.products.length > 0).length}`
  )
  console.log(
    `📊 Failed pages: ${pages.filter((p) => p.products.length === 0).length}`
  )
  console.log(`${"🎉".repeat(20)}`)

  return {
    success: true,
    url,
    statusCode: firstPageResult.statusCode,
    data: {
      products: validProducts,
      totalCount: validProducts.length,
      pagination: {
        currentPage: 1,
        totalPages: totalPages,
        productsPerPage: firstPageProducts.length,
      },
      pages: pages,
    },
  }
}

/**
 * PAGINATION-OPTIMIZED scraping strategy
 */
async function scrapeWithPaginationStrategy(
  url: string,
  pageNumber: number,
  retryCount: number = 0
): Promise<ScrapingResult> {
  const SCRAPINGBEE_API_KEY = process.env.SCRAPINGBEE_API_KEY || ""

  const maxRetries = 2
  const isPaginationPage = pageNumber > 1

  try {
    console.log(
      `🎯 ${
        isPaginationPage ? "PAGINATION-OPTIMIZED " : ""
      }Scraping page ${pageNumber} (attempt ${retryCount + 1})...`
    )

    const apiUrl = new URL("https://app.scrapingbee.com/api/v1/")
    apiUrl.searchParams.append("api_key", SCRAPINGBEE_API_KEY)
    apiUrl.searchParams.append("url", url)
    apiUrl.searchParams.append("render_js", "true")
    apiUrl.searchParams.append("stealth_proxy", "true")
    apiUrl.searchParams.append("premium_proxy", "true")
    apiUrl.searchParams.append("country_code", "us")
    apiUrl.searchParams.append("block_resources", "false")
    apiUrl.searchParams.append("timeout", "120000")

    // PAGINATION-OPTIMIZED waiting times
    if (isPaginationPage) {
      // Extended settings for pagination pages
      apiUrl.searchParams.append("wait", "12000") // 12 seconds initial wait
      apiUrl.searchParams.append("wait_browser", "networkidle")
      apiUrl.searchParams.append(
        "wait_for",
        ".sui-grid, [data-product-id], .product-pod, .search-results"
      )

      // Comprehensive JavaScript scenario for pagination
      const paginationScenario = {
        instructions: [
          { wait: 7000 }, // Extended initial wait for pagination
          {
            evaluate:
              "console.log('Pagination loading: Initial wait complete')",
          },
          // Progressive scrolling to trigger all lazy loading
          { scroll_y: 800 },
          { wait: 2000 },
          { scroll_y: 1600 },
          { wait: 2000 },
          { scroll_y: 2400 },
          { wait: 2000 },
          { scroll_y: 3200 },
          { wait: 2000 },
          { scroll_y: 4000 },
          { wait: 2000 },
          // Wait for any dynamic content
          { wait: 4000 },
          // Additional scroll to ensure all content loaded
          { scroll_y: 2000 },
          { wait: 2000 },
          { scroll_y: 0 },
          { wait: 1500 },
          // Final wait for any pending product loads
          { wait: 3000 },
          { evaluate: "console.log('Pagination loading complete')" },
        ],
      }
      apiUrl.searchParams.append(
        "js_scenario",
        JSON.stringify(paginationScenario)
      )
    } else {
      // First page - standard optimized settings
      apiUrl.searchParams.append("wait", "8000")
      apiUrl.searchParams.append("wait_for", ".sui-grid")

      const firstPageScenario = {
        instructions: [
          { wait: 4000 },
          { scroll_y: 1200 },
          { wait: 1500 },
          { scroll_y: 2400 },
          { wait: 1500 },
          { scroll_y: 0 },
          { wait: 1000 },
        ],
      }
      apiUrl.searchParams.append(
        "js_scenario",
        JSON.stringify(firstPageScenario)
      )
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 120000)

    const response = await fetch(apiUrl.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": getRandomUserAgent(),
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(
        `ScrapingBee API error: ${response.status} ${response.statusText}`
      )
    }

    const htmlContent = await response.text()
    const statusCode = response.status

    // CRITICAL: Validate that page actually contains products
    const hasProductIndicators = validateProductPresence(htmlContent)

    if (!hasProductIndicators && isPaginationPage && retryCount < maxRetries) {
      console.warn(
        `⚠️ Page ${pageNumber} missing product indicators, retrying...`
      )
      await new Promise((resolve) =>
        setTimeout(resolve, 8000 * (retryCount + 1))
      )
      return scrapeWithPaginationStrategy(url, pageNumber, retryCount + 1)
    }

    // Parse products with enhanced parser
    const products = parseHomeDepotProductsEnhanced(
      htmlContent,
      url,
      pageNumber
    )

    // CRITICAL: If no products found on pagination page, retry
    if (products.length === 0 && isPaginationPage && retryCount < maxRetries) {
      console.warn(`⚠️ Page ${pageNumber} returned 0 products, retrying...`)
      await new Promise((resolve) =>
        setTimeout(resolve, 10000 * (retryCount + 1))
      )
      return scrapeWithPaginationStrategy(url, pageNumber, retryCount + 1)
    }

    console.log(`✅ Page ${pageNumber} parsing: ${products.length} products`)

    return {
      success: true,
      url,
      statusCode,
      data: {
        products,
        totalCount: products.length,
        rawHtml: htmlContent,
      },
    }
  } catch (error) {
    console.error(`❌ Page ${pageNumber} scraping failed:`, error)

    if (retryCount < maxRetries) {
      console.log(`🔄 Retrying page ${pageNumber}...`)
      await new Promise((resolve) =>
        setTimeout(resolve, 10000 * (retryCount + 1))
      )
      return scrapeWithPaginationStrategy(url, pageNumber, retryCount + 1)
    }

    return {
      success: false,
      url,
      error: `Page ${pageNumber} failed after ${
        maxRetries + 1
      } attempts: ${error}`,
    }
  }
}

/**
 * EXTENDED waiting for problematic pagination pages
 */
async function scrapeWithExtendedPaginationWait(
  url: string,
  pageNumber: number
): Promise<ScrapingResult> {
  console.log(`🐌 EXTENDED scraping for problematic page ${pageNumber}...`)

  const SCRAPINGBEE_API_KEY =
    "GE686H463Y0EVSGKQII5V0FJ2XNEDJDAXFH9LW6S3V1A1J4RKTT5KAZ0664A9YO5RJUZHDLNDIH0JHQA"

  try {
    const apiUrl = new URL("https://app.scrapingbee.com/api/v1/")
    apiUrl.searchParams.append("api_key", SCRAPINGBEE_API_KEY)
    apiUrl.searchParams.append("url", url)
    apiUrl.searchParams.append("render_js", "true")
    apiUrl.searchParams.append("stealth_proxy", "true")
    apiUrl.searchParams.append("premium_proxy", "true")
    apiUrl.searchParams.append("country_code", "us")
    apiUrl.searchParams.append("block_resources", "false")
    apiUrl.searchParams.append("timeout", "150000")

    // Extended waiting settings
    apiUrl.searchParams.append("wait", "15000") // 15 seconds initial wait
    apiUrl.searchParams.append("wait_browser", "networkidle")
    apiUrl.searchParams.append("wait_for", "body")

    const extendedScenario = {
      instructions: [
        { wait: 8000 }, // Extended initial wait
        {
          evaluate:
            "console.log('Extended loading: Starting comprehensive scroll...')",
        },
        // Comprehensive scrolling
        { scroll_y: 1000 },
        { wait: 2500 },
        { scroll_y: 2000 },
        { wait: 2500 },
        { scroll_y: 3000 },
        { wait: 2500 },
        { scroll_y: 4000 },
        { wait: 2500 },
        { scroll_y: 5000 },
        { wait: 2500 },
        // Wait for dynamic content
        { wait: 6000 },
        // Additional scroll patterns
        { scroll_y: 2500 },
        { wait: 2500 },
        { scroll_y: 1500 },
        { wait: 2500 },
        { scroll_y: 500 },
        { wait: 2500 },
        // Final extended wait
        { wait: 5000 },
        { evaluate: "console.log('Extended loading complete')" },
      ],
    }
    apiUrl.searchParams.append("js_scenario", JSON.stringify(extendedScenario))

    const response = await fetch(apiUrl.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": getRandomUserAgent(),
      },
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const htmlContent = await response.text()
    const products = parseHomeDepotProductsEnhanced(
      htmlContent,
      url,
      pageNumber
    )

    console.log(`✅ Extended page ${pageNumber}: ${products.length} products`)

    return {
      success: true,
      url,
      statusCode: response.status,
      data: {
        products,
        totalCount: products.length,
        rawHtml: htmlContent,
      },
    }
  } catch (error) {
    console.error(`❌ Extended page ${pageNumber} failed:`, error)
    return {
      success: false,
      url,
      error: `Extended scraping failed: ${error}`,
    }
  }
}

/**
 * ULTRA-EXTENDED waiting as last resort
 */
async function scrapeWithUltraExtendedWait(
  url: string,
  pageNumber: number
): Promise<ScrapingResult> {
  console.log(
    `🚀 ULTRA-EXTENDED scraping for page ${pageNumber} (LAST RESORT)...`
  )

  const SCRAPINGBEE_API_KEY =
    "GE686H463Y0EVSGKQII5V0FJ2XNEDJDAXFH9LW6S3V1A1J4RKTT5KAZ0664A9YO5RJUZHDLNDIH0JHQA"

  try {
    const apiUrl = new URL("https://app.scrapingbee.com/api/v1/")
    apiUrl.searchParams.append("api_key", SCRAPINGBEE_API_KEY)
    apiUrl.searchParams.append("url", url)
    apiUrl.searchParams.append("render_js", "true")
    apiUrl.searchParams.append("stealth_proxy", "true")
    apiUrl.searchParams.append("premium_proxy", "true")
    apiUrl.searchParams.append("country_code", "us")
    apiUrl.searchParams.append("block_resources", "false")
    apiUrl.searchParams.append("timeout", "180000") // 3 minute timeout

    // Ultra-extended waiting
    apiUrl.searchParams.append("wait", "20000") // 20 seconds initial wait
    apiUrl.searchParams.append("wait_browser", "networkidle")
    apiUrl.searchParams.append("wait_for", "body")

    const ultraScenario = {
      instructions: [
        { wait: 10000 }, // 10 second initial wait
        { evaluate: "console.log('ULTRA loading: Maximum wait engaged...')" },
        // Maximum comprehensive scroll
        { scroll_y: 1000 },
        { wait: 3000 },
        { scroll_y: 2000 },
        { wait: 3000 },
        { scroll_y: 3000 },
        { wait: 3000 },
        { scroll_y: 4000 },
        { wait: 3000 },
        { scroll_y: 5000 },
        { wait: 3000 },
        { scroll_y: 6000 },
        { wait: 3000 },
        // Extended wait for dynamic content
        { wait: 8000 },
        // Additional comprehensive scroll
        { scroll_y: 3000 },
        { wait: 3000 },
        { scroll_y: 1500 },
        { wait: 3000 },
        { scroll_y: 500 },
        { wait: 3000 },
        { scroll_y: 0 },
        { wait: 3000 },
        // Final ultra wait
        { wait: 10000 },
        { evaluate: "console.log('ULTRA loading complete')" },
      ],
    }
    apiUrl.searchParams.append("js_scenario", JSON.stringify(ultraScenario))

    const response = await fetch(apiUrl.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": getRandomUserAgent(),
      },
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const htmlContent = await response.text()
    const products = parseHomeDepotProductsEnhanced(
      htmlContent,
      url,
      pageNumber
    )

    console.log(
      `✅ Ultra-extended page ${pageNumber}: ${products.length} products`
    )

    return {
      success: true,
      url,
      statusCode: response.status,
      data: {
        products,
        totalCount: products.length,
        rawHtml: htmlContent,
      },
    }
  } catch (error) {
    console.error(`❌ Ultra-extended page ${pageNumber} failed:`, error)
    return {
      success: false,
      url,
      error: `Ultra-extended scraping failed: ${error}`,
    }
  }
}

/**
 * ENHANCED product parsing with comprehensive strategies
 */
function parseHomeDepotProductsEnhanced(
  html: string,
  url: string,
  pageNumber: number
): ProductData[] {
  const products: ProductData[] = []
  const $ = cheerio.load(html)

  console.log(`🔍 Page ${pageNumber}: Starting multi-strategy parsing...`)

  // Validate this is actually a product page
  if (!validateProductPresence(html)) {
    console.warn(`⚠️ Page ${pageNumber}: No product indicators found in HTML`)
    return products
  }

  // Strategy 1: Direct data-product-id elements (MOST RELIABLE)
  let productCards = $(
    "div[data-product-id], article[data-product-id], li[data-product-id]"
  )
  console.log(
    `📊 Page ${pageNumber}: Direct data-product-id elements: ${productCards.length}`
  )

  // Strategy 2: Grid-based detection
  if (productCards.length === 0) {
    console.log(`🔄 Page ${pageNumber}: Trying grid-based detection...`)
    const gridSelectors = [
      ".sui-grid",
      "[data-testid='product-grid']",
      ".search-results",
      ".browse-search__pod-container",
      ".plp-grid",
    ]

    gridSelectors.forEach((selector) => {
      $(selector).each((_, container) => {
        const $container = $(container)
        const gridProducts = $container.find(
          "> div, > article, > li, > section"
        )

        gridProducts.each((_, el) => {
          const $el = $(el)
          if (isLikelyProductCard($el, $)) {
            productCards = productCards.add($el)
          }
        })
      })
    })
    console.log(
      `📊 Page ${pageNumber}: Grid-based detection: ${productCards.length} potential products`
    )
  }

  // Strategy 3: Comprehensive search as last resort
  if (productCards.length === 0) {
    console.log(`🔄 Page ${pageNumber}: Using comprehensive search...`)
    const allPotentialProducts = $("div, article")
      .filter((_, el) => {
        const $el = $(el)
        return isLikelyProductCard($el, $)
      })
      .slice(0, 200) // Limit to prevent performance issues

    productCards = allPotentialProducts
    console.log(
      `📊 Page ${pageNumber}: Comprehensive search: ${productCards.length} potential products`
    )
  }

  // Parse all found cards
  let successCount = 0
  productCards.each((index, el) => {
    try {
      const $card = $(el)
      const product = extractProductData($card, $)

      if (
        product &&
        product.title &&
        product.title !== "Unknown Product" &&
        (product.price || product.url)
      ) {
        products.push(product)
        successCount++
      }
    } catch (error) {
      // Skip invalid cards silently
    }
  })

  console.log(
    `✅ Page ${pageNumber}: Successfully parsed ${successCount}/${productCards.length} products`
  )

  return removeDuplicates(products)
}

/**
 * Validate that HTML contains product indicators
 */
function validateProductPresence(html: string): boolean {
  const productIndicators = [
    "data-product-id",
    "sui-grid",
    "product-pod",
    "search-results",
    "browse-search",
    "product-card",
    "data-sku",
  ]

  return productIndicators.some((indicator) => html.includes(indicator))
}

/**
 * Detect if element is likely a product card
 */
function isLikelyProductCard(
  $el: cheerio.Cheerio<any>,
  $: cheerio.CheerioAPI
): boolean {
  const text = $el.text()
  const html = $.html($el)

  // Must have price indicator
  const hasPrice = /\$[0-9,]+\.?[0-9]*/.test(text)
  if (!hasPrice) return false

  // Should have product identifiers
  const hasProductId = html.includes("data-product-id")
  const hasImage = $el.find("img").length > 0
  const hasProductLink = $el.find('a[href*="/p/"]').length > 0
  const hasProductText =
    /product|item|sku|buy|add to cart|reviews?|rating/i.test(text)

  // Reasonable content length
  const reasonableLength = text.length > 50 && text.length < 3000

  return (
    (hasProductId || hasImage || hasProductLink) &&
    hasProductText &&
    reasonableLength
  )
}

/**
 * Extract product data from element
 */
function extractProductData(
  $el: cheerio.Cheerio<any>,
  $: cheerio.CheerioAPI
): ProductData {
  const sku =
    $el.attr("data-product-id") || $el.attr("data-sku") || generateTempId()

  // Enhanced title extraction
  const title = extractTitle($el, $)

  // Price extraction
  const priceData = extractPriceData($el, $)

  // URL extraction
  const url = extractProductUrl($el, $)

  // Image extraction
  const image = extractImage($el, $)

  // Additional data
  const rating = $el.find('[data-testid="rating"]').text().trim()
  const reviewCount = $el.find('[data-testid="review-count"]').text().trim()
  const brand = $el
    .find('[data-testid="attribute-product-brand"]')
    .text()
    .trim()
  const label = $el
    .find('[data-testid="attribute-product-label"]')
    .text()
    .trim()

  return {
    title,
    brand,
    label,
    price: priceData.price,
    oldPrice: priceData.oldPrice,
    saveAmount: priceData.saveAmount,
    savePercentage: priceData.savePercentage,
    image,
    url,
    rating,
    sku,
    reviewCount,
    pickup: extractFulfillment($el, $, "pickup"),
    delivery: extractFulfillment($el, $, "delivery"),
  }
}

/**
 * Enhanced title extraction with multiple fallbacks
 */
function extractTitle(
  $el: cheerio.Cheerio<any>,
  $: cheerio.CheerioAPI
): string {
  const brand = $el
    .find('[data-testid="attribute-product-brand"]')
    .text()
    .trim()
  const productLabel = $el
    .find('[data-testid="attribute-product-label"]')
    .text()
    .trim()

  if (brand && productLabel) return `${brand} ${productLabel}`
  if (productLabel) return productLabel
  if (brand) return brand

  // Multiple fallback strategies
  const fallbacks = [
    $el.find("img").attr("alt"),
    $el.find("a").attr("title"),
    $el.find("h1, h2, h3, h4").first().text().trim(),
    $el
      .find('[data-testid*="title"], [data-testid*="name"]')
      .first()
      .text()
      .trim(),
    $el.find(".product-title, .product-name").first().text().trim(),
  ]

  return fallbacks.find((text) => text && text.length > 3) || "Unknown Product"
}

/**
 * Enhanced price extraction
 */
function extractPriceData(
  $el: cheerio.Cheerio<any>,
  $: cheerio.CheerioAPI
): {
  price: string
  oldPrice: string
  saveAmount: string
  savePercentage: string
} {
  let price = ""
  let oldPrice = ""
  let saveAmount = ""
  let savePercentage = ""

  // Primary price selectors
  const priceMain = $el
    .find(
      ".sui-font-display.sui-leading-none.sui-text-3xl, .sui-font-display.sui-leading-none.sui-text-4xl"
    )
    .text()
    .trim()
  const priceCents = $el
    .find(".sui-font-display.sui-leading-none.sui-text-xs")
    .last()
    .text()
    .trim()
    .replace(".", "")

  if (priceMain) {
    price = `$${priceMain}.${priceCents || "00"}`
  }

  // Fallback price detection
  if (!price) {
    const priceSelectors = [
      '[data-testid*="price"]',
      ".price",
      ".product-price",
      '[class*="price__current"]',
      ".text-price",
    ]

    for (const selector of priceSelectors) {
      const priceText = $el.find(selector).first().text().trim()
      const priceMatch = priceText.match(/\$[0-9,]+\.?[0-9]*/)
      if (priceMatch) {
        price = priceMatch[0]
        break
      }
    }
  }

  // Old price detection
  oldPrice = $el
    .find(".sui-text-subtle .sui-line-through")
    .first()
    .text()
    .trim()

  // Savings detection
  const saveText = $el.find(".sui-text-success").text()
  if (saveText) {
    const saveAmountMatch = saveText.match(/\$([\d,]+\.?\d*)/)
    if (saveAmountMatch) saveAmount = `$${saveAmountMatch[1]}`

    const savePercentMatch = saveText.match(/\((\d+)%\)/)
    if (savePercentMatch) savePercentage = `${savePercentMatch[1]}%`
  }

  return { price, oldPrice, saveAmount, savePercentage }
}

/**
 * Extract product URL
 */
function extractProductUrl(
  $el: cheerio.Cheerio<any>,
  $: cheerio.CheerioAPI
): string {
  let productUrl =
    $el.find("a").first().attr("href") ||
    $el.find('a[href*="/p/"]').first().attr("href") ||
    ""

  if (productUrl && !productUrl.startsWith("http")) {
    productUrl = `https://www.homedepot.com${productUrl}`
  }

  return productUrl
}

/**
 * Extract product image
 */
function extractImage(
  $el: cheerio.Cheerio<any>,
  $: cheerio.CheerioAPI
): string {
  const img = $el.find("img").first()
  return (
    img.attr("src") ||
    img.attr("data-src") ||
    img.attr("data-lazy") ||
    img.attr("data-srcset")?.split(",")[0]?.trim() ||
    ""
  )
}

/**
 * Extract fulfillment info
 */
function extractFulfillment(
  $el: cheerio.Cheerio<any>,
  $: cheerio.CheerioAPI,
  type: "pickup" | "delivery"
): string {
  const selectors = {
    pickup: [
      '[data-component*="FulfillmentPodStore"]',
      '[data-testid*="Pickup"]',
      '[data-testid*="Store"]',
      ".pickup-availability",
    ],
    delivery: [
      '[data-component*="FulfillmentPodShipping"]',
      '[data-testid*="Delivery"]',
      '[data-testid*="Shipping"]',
      ".delivery-option",
    ],
  }

  for (const selector of selectors[type]) {
    const element = $el.find(selector).first()
    if (element.length) {
      return element.text().trim()
    }
  }

  return ""
}

/**
 * Detect total pages from HTML content
 */
function detectTotalPages(html: string, productsPerPage: number): number {
  if (!html) return 1

  const $ = cheerio.load(html)
  let maxPage = 1

  try {
    // Look for pagination elements
    const paginationText = $("*").text()

    // Pattern: "Page X of Y"
    const pageOfMatch = paginationText.match(/page\s+\d+\s+of\s+(\d+)/i)
    if (pageOfMatch) {
      maxPage = Math.max(maxPage, parseInt(pageOfMatch[1]))
    }

    // Look for page numbers in pagination
    $(
      '[data-component*="pagination"] a, .pagination a, [aria-label*="page"]'
    ).each((_, el) => {
      const text = $(el).text().trim()
      const pageNum = parseInt(text)
      if (!isNaN(pageNum) && pageNum > maxPage) {
        maxPage = pageNum
      }
    })

    // Estimate from product count (fallback)
    const productCount = (html.match(/data-product-id/g) || []).length
    if (productCount > 0) {
      const estimatedPages = Math.ceil(productCount / productsPerPage)
      maxPage = Math.max(maxPage, estimatedPages)
    }
  } catch (error) {
    console.log("⚠️ Pagination detection failed, using default")
  }

  return Math.min(Math.max(maxPage, 1), 10) // Cap at 10 pages for safety
}

/**
 * Calculate strategic delay between pages
 */
function calculatePageDelay(pageNumber: number): number {
  // Increasing delays: 6s, 7s, 8s, 9s, 10s...
  return 6000 + pageNumber * 1000
}

/**
 * Update URL parameter helper
 */
function updateUrlParameter(url: string, key: string, value: string): string {
  try {
    const urlObj = new URL(url)
    urlObj.searchParams.delete("Nao")
    urlObj.searchParams.delete("nao")
    urlObj.searchParams.set(key, value)
    return urlObj.toString()
  } catch {
    // Manual fallback
    const [base, query] = url.split("?")
    if (!query) return `${base}?${key}=${value}`

    const params = new URLSearchParams(query)
    params.delete("Nao")
    params.delete("nao")
    params.set(key, value)
    return `${base}?${params.toString()}`
  }
}

/**
 * Utility functions
 */
function removeDuplicates(products: ProductData[]): ProductData[] {
  return products.filter(
    (product, index, self) =>
      index ===
      self.findIndex(
        (p) => p.sku === product.sku && p.sku && p.title === product.title
      )
  )
}

function validateProducts(products: ProductData[]): ProductData[] {
  return products.filter(
    (product) =>
      product.title &&
      product.title !== "Unknown Product" &&
      product.sku &&
      !product.sku.startsWith("temp-") &&
      (product.price || product.url) // Must have at least price or URL
  )
}

function generateTempId(): string {
  return `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function getRandomUserAgent(): string {
  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36",
  ]
  return userAgents[Math.floor(Math.random() * userAgents.length)]
}

/**
 * Single page scraping function (backward compatibility)
 */
export async function scrapeUrl(
  url: string,
  parseProducts: boolean = true,
  saveHtml: boolean = true
): Promise<ScrapingResult> {
  console.log("🔗 Single page scraping...")
  const result = await scrapeWithPaginationStrategy(url, 1)

  if (!saveHtml && result.data) {
    result.data.rawHtml = undefined
  }

  return result
}

/**
 * Discounted products specialization
 */
export async function scrapeDiscountedProducts(
  baseUrl: string,
  maxPages: number = 2
): Promise<ScrapingResult> {
  console.log("🎯 Scraping discounted products specifically...")

  const result = await scrapeHomeDepotPage(baseUrl, maxPages)

  if (result.success && result.data) {
    // Filter for discounted products
    const discountedProducts = result.data.products.filter(
      (product) =>
        product.saveAmount || product.savePercentage || product.oldPrice
    )

    console.log(
      `🎯 Found ${discountedProducts.length} discounted products out of ${result.data.products.length} total`
    )

    return {
      ...result,
      data: {
        ...result.data,
        products: discountedProducts,
        totalCount: discountedProducts.length,
      },
    }
  }

  return result
}
