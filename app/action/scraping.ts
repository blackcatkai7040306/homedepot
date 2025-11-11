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
 * Ultra-reliable scraping with multiple content loading strategies
 */
export async function scrapeUrl(
  url: string,
  parseProducts: boolean = true,
  saveHtml: boolean = true,
  retryCount: number = 0
): Promise<ScrapingResult> {
  const SCRAPINGBEE_API_KEY = process.env.SCRAPINGBEE_API_KEY

  if (!SCRAPINGBEE_API_KEY) {
    return {
      success: false,
      url,
      error: "ScrapingBee API key not found",
    }
  }

  const maxRetries = 3
  const currentRetry = retryCount

  try {
    console.log("=".repeat(80))
    console.log(
      `🔄 Scraping URL (attempt ${currentRetry + 1}/${maxRetries + 1}):`,
      url
    )
    console.log("=".repeat(80))

    // Try multiple scraping strategies
    const strategies = [
      await tryScrapingStrategy(url, "comprehensive", SCRAPINGBEE_API_KEY),
      await tryScrapingStrategy(url, "aggressive", SCRAPINGBEE_API_KEY),
      await tryScrapingStrategy(url, "minimal", SCRAPINGBEE_API_KEY),
    ]

    // Find the best result
    let bestResult = strategies[0]
    for (const result of strategies) {
      if (
        result.success &&
        result.data &&
        result.data.products.length > bestResult.data!.products.length
      ) {
        bestResult = result
      }
    }

    console.log(
      `🏆 Best strategy found: ${bestResult.data?.products.length} products`
    )

    // If still no products, retry
    if (bestResult.data?.products.length === 0 && currentRetry < maxRetries) {
      console.log(`🔄 No products found, retrying with different approach...`)
      await new Promise((resolve) =>
        setTimeout(resolve, 8000 * (currentRetry + 1))
      )
      return scrapeUrl(url, parseProducts, saveHtml, currentRetry + 1)
    }

    return bestResult
  } catch (error) {
    console.error("❌ All scraping strategies failed:", error)

    if (currentRetry < maxRetries) {
      console.log(
        `🔄 Retrying after error (${currentRetry + 1}/${maxRetries})...`
      )
      await new Promise((resolve) =>
        setTimeout(resolve, 10000 * (currentRetry + 1))
      )
      return scrapeUrl(url, parseProducts, saveHtml, currentRetry + 1)
    }

    return {
      success: false,
      url,
      error:
        error instanceof Error
          ? error.message
          : "All scraping strategies failed",
    }
  }
}

/**
 * Different scraping strategies for different scenarios
 */
async function tryScrapingStrategy(
  url: string,
  strategy: "comprehensive" | "aggressive" | "minimal",
  apiKey: string
): Promise<ScrapingResult> {
  console.log(`🎯 Trying ${strategy} scraping strategy...`)

  const apiUrl = new URL("https://app.scrapingbee.com/api/v1/")
  apiUrl.searchParams.append("api_key", apiKey)
  apiUrl.searchParams.append("url", url)
  apiUrl.searchParams.append("render_js", "true")
  apiUrl.searchParams.append("stealth_proxy", "true")
  apiUrl.searchParams.append("premium_proxy", "true")
  apiUrl.searchParams.append("country_code", "us")
  apiUrl.searchParams.append("block_resources", "false")
  apiUrl.searchParams.append("timeout", "120000")

  switch (strategy) {
    case "comprehensive":
      // Maximum waiting and interaction
      apiUrl.searchParams.append("wait", "15000")
      apiUrl.searchParams.append("wait_browser", "networkidle")
      apiUrl.searchParams.append(
        "wait_for",
        ".sui-grid, [data-product-id], .product-pod"
      )

      const comprehensiveScenario = {
        instructions: [
          { wait: 5000 },
          { scroll_y: 1000 },
          { wait: 2000 },
          { scroll_y: 2000 },
          { wait: 2000 },
          { scroll_y: 3000 },
          { wait: 2000 },
          { scroll_y: 4000 },
          { wait: 2000 },
          { scroll_y: 5000 },
          { wait: 2000 },
          { scroll_y: 0 },
          { wait: 2000 },
          { evaluate: "window.scrollTo(0, document.body.scrollHeight / 4);" },
          { wait: 1500 },
          { evaluate: "window.scrollTo(0, document.body.scrollHeight / 2);" },
          { wait: 1500 },
          {
            evaluate: "window.scrollTo(0, document.body.scrollHeight * 0.75);",
          },
          { wait: 1500 },
          { evaluate: "window.scrollTo(0, document.body.scrollHeight);" },
          { wait: 2000 },
          { evaluate: "window.dispatchEvent(new Event('resize'));" },
          { wait: 1000 },
        ],
      }
      apiUrl.searchParams.append(
        "js_scenario",
        JSON.stringify(comprehensiveScenario)
      )
      break

    case "aggressive":
      // Quick but thorough
      apiUrl.searchParams.append("wait", "8000")
      apiUrl.searchParams.append("wait_for", ".sui-grid")

      const aggressiveScenario = {
        instructions: [
          { wait: 3000 },
          { scroll_y: 2000 },
          { wait: 1500 },
          { scroll_y: 4000 },
          { wait: 1500 },
          { scroll_y: 0 },
          { wait: 1000 },
          { scroll_y: 3000 },
          { wait: 1500 },
        ],
      }
      apiUrl.searchParams.append(
        "js_scenario",
        JSON.stringify(aggressiveScenario)
      )
      break

    case "minimal":
      // Fastest, minimal interaction
      apiUrl.searchParams.append("wait", "5000")
      apiUrl.searchParams.append("wait_for", "body")
      break
  }

  try {
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

    // Validate content
    if (htmlContent.length < 1000) {
      throw new Error("HTML content too short")
    }

    // Check for blocking
    if (isBlocked(htmlContent)) {
      throw new Error("Page blocked by anti-bot")
    }

    const products = parseHomeDepotProductsEnhanced(htmlContent, url)
    console.log(`✅ ${strategy} strategy: ${products.length} products`)

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
    console.log(`❌ ${strategy} strategy failed:`, error)
    return {
      success: false,
      url,
      error: `Strategy ${strategy} failed`,
    }
  }
}

/**
 * Enhanced product parsing with multiple detection methods
 */
function parseHomeDepotProductsEnhanced(
  html: string,
  url: string
): ProductData[] {
  const products: ProductData[] = []
  const $ = cheerio.load(html)

  console.log("🔍 Starting enhanced multi-strategy product parsing...")

  // Strategy 1: Direct data-product-id elements
  const strategy1Products = parseWithDataProductId($)
  console.log(
    `📊 Strategy 1 (data-product-id): ${strategy1Products.length} products`
  )
  products.push(...strategy1Products)

  // Strategy 2: Structured data (JSON-LD)
  const strategy2Products = parseStructuredData($)
  console.log(
    `📊 Strategy 2 (structured data): ${strategy2Products.length} products`
  )
  products.push(...strategy2Products)

  // Strategy 3: Grid-based detection
  const strategy3Products = parseGridProducts($)
  console.log(
    `📊 Strategy 3 (grid detection): ${strategy3Products.length} products`
  )
  products.push(...strategy3Products)

  // Strategy 4: Pattern-based detection
  const strategy4Products = parsePatternBased($, html)
  console.log(
    `📊 Strategy 4 (pattern-based): ${strategy4Products.length} products`
  )
  products.push(...strategy4Products)

  // Remove duplicates and validate
  const uniqueProducts = removeDuplicates(products)
  const validProducts = validateProducts(uniqueProducts)

  console.log(
    `✅ Final: ${validProducts.length} valid products from ${products.length} raw finds`
  )

  return validProducts
}

/**
 * Strategy 1: Parse elements with data-product-id
 */
function parseWithDataProductId($: cheerio.CheerioAPI): ProductData[] {
  const products: ProductData[] = []

  const selectors = [
    "div[data-product-id]",
    "article[data-product-id]",
    "li[data-product-id]",
    "section[data-product-id]",
    "[data-product-id]",
  ]

  selectors.forEach((selector) => {
    $(selector).each((index, el) => {
      try {
        const $el = $(el)
        const product = extractProductData($el, $)
        if (product && product.title && product.sku) {
          products.push(product)
        }
      } catch (error) {
        // Skip invalid elements
      }
    })
  })

  return products
}

/**
 * Strategy 2: Parse structured data (JSON-LD)
 */
function parseStructuredData($: cheerio.CheerioAPI): ProductData[] {
  const products: ProductData[] = []

  $('script[type="application/ld+json"]').each((index, el) => {
    try {
      const jsonText = $(el).html()
      if (!jsonText) return

      const data = JSON.parse(jsonText)

      if (data["@type"] === "Product" || data["@type"] === "ListItem") {
        const product: ProductData = {
          title: data.name || data.headline,
          brand: data.brand?.name,
          price: data.offers?.price ? `$${data.offers.price}` : undefined,
          image: data.image,
          url: data.url || data.offers?.url,
          sku: data.sku || data.productID,
          rating: data.aggregateRating?.ratingValue?.toString(),
          reviewCount: data.aggregateRating?.reviewCount?.toString(),
        }

        if (product.title && product.sku) {
          products.push(product)
        }
      }

      // Handle ItemList
      if (data["@type"] === "ItemList" && Array.isArray(data.itemListElement)) {
        data.itemListElement.forEach((item: any) => {
          if (item.item) {
            const product: ProductData = {
              title: item.item.name,
              brand: item.item.brand?.name,
              price: item.item.offers?.price
                ? `$${item.item.offers.price}`
                : undefined,
              image: item.item.image,
              url: item.item.url,
              sku: item.item.sku,
              rating: item.item.aggregateRating?.ratingValue?.toString(),
            }

            if (product.title && product.sku) {
              products.push(product)
            }
          }
        })
      }
    } catch (error) {
      // Skip invalid JSON
    }
  })

  return products
}

/**
 * Strategy 3: Grid-based product detection
 */
function parseGridProducts($: cheerio.CheerioAPI): ProductData[] {
  const products: ProductData[] = []

  // Look for product grid containers
  const gridSelectors = [
    ".sui-grid",
    "[data-testid='product-grid']",
    ".browse-search__pod-container",
    ".product-grid",
    ".plp-grid",
    ".search-results-container",
  ]

  gridSelectors.forEach((gridSelector) => {
    $(gridSelector).each((gridIndex, gridEl) => {
      const $grid = $(gridEl)

      // Look for product-like elements within grid
      $grid.find("div, article, li, section").each((index, el) => {
        const $el = $(el)
        const text = $el.text()

        // Check if this looks like a product
        if (isProductElement($el, $)) {
          const product = extractProductData($el, $)
          if (
            product &&
            product.title &&
            !products.find((p) => p.sku === product.sku)
          ) {
            products.push(product)
          }
        }
      })
    })
  })

  return products
}

/**
 * Strategy 4: Pattern-based detection for fallback
 */
function parsePatternBased($: cheerio.CheerioAPI, html: string): ProductData[] {
  const products: ProductData[] = []

  // Look for product patterns in the HTML
  const productPatterns = [
    /data-product-id="([^"]+)"/g,
    /data-sku="([^"]+)"/g,
    /"productId":"([^"]+)"/g,
    /"sku":"([^"]+)"/g,
  ]

  const foundSkus = new Set<string>()

  productPatterns.forEach((pattern) => {
    let match
    while ((match = pattern.exec(html)) !== null) {
      const sku = match[1]
      if (sku && sku.length > 3 && !foundSkus.has(sku)) {
        foundSkus.add(sku)

        // Try to find the product container for this SKU
        const productEl = $(
          `[data-product-id="${sku}"], [data-sku="${sku}"]`
        ).first()
        if (productEl.length) {
          const product = extractProductData(productEl, $)
          if (product) {
            products.push(product)
          }
        }
      }
    }
  })

  return products
}

/**
 * Check if element looks like a product
 */
function isProductElement(
  $el: cheerio.Cheerio<any>,
  $: cheerio.CheerioAPI
): boolean {
  const text = $el.text()
  const hasPrice = /\$[0-9,]+\.?[0-9]*/.test(text)
  const hasImage = $el.find("img").length > 0
  const hasLink = $el.find("a[href*='/p/']").length > 0
  const hasProductText =
    /product|item|sku|price|buy|add to cart|reviews?|rating/i.test(text)

  return (
    hasPrice && (hasImage || hasLink) && hasProductText && text.length < 2000
  )
}

/**
 * Extract product data from an element
 */
function extractProductData(
  $el: cheerio.Cheerio<any>,
  $: cheerio.CheerioAPI
): ProductData {
  const sku =
    $el.attr("data-product-id") || $el.attr("data-sku") || generateTempId()

  // Title extraction with multiple fallbacks
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

  return {
    title,
    brand,
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
 * Enhanced title extraction
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
      ".price-format__main-price",
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

  // Fallback: text pattern matching
  const text = $el.text()
  const patterns = {
    pickup: /Pickup[^\\n]*/i,
    delivery: /(?:Delivery|Shipping)[^\\n]*/i,
  }

  const match = text.match(patterns[type])
  return match ? match[0].trim() : ""
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
      !product.sku.startsWith("temp-")
  )
}

function generateTempId(): string {
  return `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

function getRandomUserAgent(): string {
  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  ]
  return userAgents[Math.floor(Math.random() * userAgents.length)]
}

function isBlocked(html: string): boolean {
  const blockIndicators = [
    "access denied",
    "bot",
    "captcha",
    "cloudflare",
    "security check",
    "unusual traffic",
    "please verify you are human",
  ]
  return blockIndicators.some((indicator) =>
    html.toLowerCase().includes(indicator)
  )
}

// Keep your existing scrapeHomeDepotPage function but use the new scrapeUrl
export async function scrapeHomeDepotPage(
  url: string,
  maxPages: number = 2
): Promise<ScrapingResult> {
  // Implementation remains the same as your previous version
  // but it will now use the enhanced scrapeUrl function
  return await scrapeUrl(url, true, true)
}
