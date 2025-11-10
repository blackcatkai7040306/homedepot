"use client"

import { useState } from "react"
import { scrapeHomeDepotPage } from "@/app/action/scraping"
import { Button } from "@/components/ui/Button"

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
    rawHtml?: string
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
  }
  error?: string
}

type FilterType = "all" | "in-stock" | "delivery"

// Helper function to check if delivery exists (for 1-2 Day Delivery filter)
function hasDelivery(delivery?: string): boolean {
  return !!delivery && delivery.trim().length > 0
}

export function ScrapingTestClient() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ScrapingResult | null>(null)
  const [showRawJson, setShowRawJson] = useState(false)
  const [filter, setFilter] = useState<FilterType>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [url, setUrl] = useState(
    "https://www.homedepot.com/b/Appliances-Refrigerators/N-5yc1vZc3pi?catStyle=ShowProducts"
  )

  // Get filtered products
  const getFilteredProducts = () => {
    if (!result?.data?.products) return []

    return result.data.products.filter((product) => {
      if (filter === "all") return true
      if (filter === "in-stock")
        return !!product.pickup && product.pickup.trim().length > 0
      if (filter === "delivery") return hasDelivery(product.delivery)
      return true
    })
  }

  // Get products for current page
  const getCurrentPageProducts = () => {
    if (!result?.data?.pages || result.data.pages.length === 0) {
      // If no page data, show all filtered products
      return getFilteredProducts()
    }

    // Get products from the current page
    const currentPageData = result.data.pages.find(
      (p) => p.pageNumber === currentPage
    )
    if (!currentPageData) return []

    // Apply filter to page products
    return currentPageData.products.filter((product) => {
      if (filter === "all") return true
      if (filter === "in-stock")
        return !!product.pickup && product.pickup.trim().length > 0
      if (filter === "delivery") return hasDelivery(product.delivery)
      return true
    })
  }

  // Reset to page 1 when filter changes
  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter)
    setCurrentPage(1)
  }

  // Reset to page 1 when new scrape completes
  const handleScrapeComplete = (data: ScrapingResult) => {
    setResult(data)
    setCurrentPage(1)
  }

  const handleScrape = async () => {
    if (!url || !url.trim()) {
      alert("Please enter a valid URL")
      return
    }

    setLoading(true)
    setResult(null)

    try {
      console.log("🔄 Starting scrape for URL:", url)
      // Scrape first 2 pages (first page + second page)
      const data = await scrapeHomeDepotPage(url.trim(), 2)
      console.log("✓ Scrape completed:", data)
      handleScrapeComplete(data)
    } catch (error) {
      console.error("❌ Scrape failed:", error)
      setResult({
        success: false,
        url: url.trim(),
        error: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(JSON.stringify(result, null, 2))
      alert("JSON copied to clipboard!")
    }
  }

  const downloadJson = () => {
    if (result) {
      const blob = new Blob([JSON.stringify(result, null, 2)], {
        type: "application/json",
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `homedepot_scrape_${Date.now()}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }

  const downloadHtml = () => {
    if (result && result.data?.rawHtml) {
      const blob = new Blob([result.data.rawHtml], {
        type: "text/html",
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `homedepot_scraped_${Date.now()}.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="space-y-6">
      {/* URL Input */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <label
          htmlFor="url-input"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Home Depot URL
        </label>
        <input
          id="url-input"
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.homedepot.com/b/..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition mb-4"
          disabled={loading}
        />
        <div className="flex gap-2 mb-2">
          <button
            onClick={() =>
              setUrl(
                "https://www.homedepot.com/b/Appliances-Refrigerators/N-5yc1vZc3pi?catStyle=ShowProducts"
              )
            }
            className="text-xs text-blue-600 hover:underline"
            disabled={loading}
          >
            Use Refrigerators
          </button>
          <span className="text-gray-400">|</span>
          <button
            onClick={() =>
              setUrl(
                "https://www.homedepot.com/b/Appliances-Washers-Dryers/N-5yc1vZc3ol?catStyle=ShowProducts"
              )
            }
            className="text-xs text-blue-600 hover:underline"
            disabled={loading}
          >
            Use Washers/Dryers
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-wrap gap-4 items-center">
          <Button
            onClick={handleScrape}
            disabled={loading}
            variant="primary"
            className="min-w-[150px]"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Scraping...
              </span>
            ) : (
              "🔍 Start Scraping"
            )}
          </Button>

          {result && (
            <>
              <Button
                onClick={() => setShowRawJson(!showRawJson)}
                variant="secondary"
              >
                {showRawJson ? "👁️ Show Visual" : "📄 Show JSON"}
              </Button>
              <Button onClick={copyToClipboard} variant="secondary">
                📋 Copy JSON
              </Button>
              <Button onClick={downloadJson} variant="secondary">
                💾 Download JSON
              </Button>
              {result.data?.rawHtml && (
                <Button onClick={downloadHtml} variant="secondary">
                  📄 Download HTML
                </Button>
              )}
            </>
          )}
        </div>

        {loading && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 font-medium">
              ⏳ Scraping in progress...
            </p>
            <p className="text-xs text-blue-600 mt-1">
              This may take 10-30 seconds. Please wait while we fetch and parse
              the data.
            </p>
          </div>
        )}
      </div>

      {/* Results Display */}
      {result && (
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              📊 Scraping Summary
            </h2>
            {/* Pagination Display */}
            {result.data?.pagination && (
              <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg">
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                  📄 Pagination Information
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white p-3 rounded-lg border border-blue-200">
                    <p className="text-xs text-gray-600 mb-1">Total Pages</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {result.data.pagination.totalPages}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-blue-200">
                    <p className="text-xs text-gray-600 mb-1">Pages Scraped</p>
                    <p className="text-2xl font-bold text-green-600">
                      {result.data.pages?.length || 1}
                    </p>
                    {result.data.pagination.totalPages >
                      (result.data.pages?.length || 1) && (
                      <p className="text-xs text-orange-600 mt-1">
                        (Limited to {result.data.pages?.length || 1} for
                        testing)
                      </p>
                    )}
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-blue-200">
                    <p className="text-xs text-gray-600 mb-1">
                      Products Per Page
                    </p>
                    <p className="text-2xl font-bold text-purple-600">
                      {result.data.pagination.productsPerPage}
                    </p>
                  </div>
                </div>
                {result.data.pages && result.data.pages.length > 1 && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <p className="text-sm text-gray-700">
                      <strong>Progress:</strong> Scraped{" "}
                      <span className="font-bold text-green-600">
                        {result.data.pages.length}
                      </span>{" "}
                      of{" "}
                      <span className="font-bold text-blue-600">
                        {result.data.pagination.totalPages}
                      </span>{" "}
                      pages
                      {result.data.pagination.totalPages >
                        result.data.pages.length && (
                        <span className="text-orange-600 ml-2">
                          (Test limit: {result.data.pages.length} pages)
                        </span>
                      )}
                    </p>
                  </div>
                )}
              </div>
            )}
            <div className="grid md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Status</p>
                <p className="text-xl font-semibold">
                  {result.success ? (
                    <span className="text-green-600">✓ Success</span>
                  ) : (
                    <span className="text-red-600">✗ Failed</span>
                  )}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Status Code</p>
                <p className="text-xl font-semibold text-gray-900">
                  {result.statusCode || "N/A"}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Products Found</p>
                <p className="text-xl font-semibold text-blue-600">
                  {result.data?.totalCount || 0}
                </p>
                {result.data && result.data.products.length > 0 && (
                  <div className="mt-2 text-xs text-gray-500 space-y-1">
                    <div>
                      In Stock:{" "}
                      <span className="font-semibold text-gray-700">
                        {result.data.products.filter((p) => p.pickup).length}
                      </span>
                    </div>
                    <div>
                      1-2 Day Delivery:{" "}
                      <span className="font-semibold text-gray-700">
                        {
                          result.data.products.filter((p) =>
                            hasDelivery(p.delivery)
                          ).length
                        }
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Source URL</p>
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline break-all"
                >
                  View Page →
                </a>
              </div>
            </div>
            {result.error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-semibold text-red-800 mb-1">
                  ❌ Error:
                </p>
                <p className="text-sm text-red-600">{result.error}</p>
              </div>
            )}
          </div>

          {/* Filter Buttons */}
          {!showRawJson && result.data && result.data.products.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  🛒 Products
                  {result.data.pages && result.data.pages.length > 1 && (
                    <span className="text-sm font-normal text-gray-600 ml-2">
                      (from {result.data.pages.length} pages)
                    </span>
                  )}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleFilterChange("all")}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      filter === "all"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    All ({result.data.totalCount})
                  </button>
                  <button
                    onClick={() => handleFilterChange("in-stock")}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      filter === "in-stock"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    In Stock (
                    {result.data.products.filter((p) => p.pickup).length})
                  </button>
                  <button
                    onClick={() => handleFilterChange("delivery")}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      filter === "delivery"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    1-2 Day Delivery (
                    {
                      result.data.products.filter((p) =>
                        hasDelivery(p.delivery)
                      ).length
                    }
                    )
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Visual Display */}
          {!showRawJson && result.data && result.data.products.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="mb-4 text-sm text-gray-600">
                {result.data.pages && result.data.pages.length > 1 ? (
                  <>
                    Showing {getCurrentPageProducts().length} products from page{" "}
                    {currentPage}
                    {filter !== "all" && (
                      <span className="ml-2">
                        (Filtered by:{" "}
                        {filter === "in-stock"
                          ? "In Stock"
                          : filter === "delivery"
                          ? "1-2 Day Delivery"
                          : "All"}
                        )
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    Showing {getFilteredProducts().length} of{" "}
                    {result.data.totalCount} products
                    {filter !== "all" && (
                      <span className="ml-2">
                        (Filtered by:{" "}
                        {filter === "in-stock"
                          ? "In Stock"
                          : filter === "delivery"
                          ? "1-2 Day Delivery"
                          : "All"}
                        )
                      </span>
                    )}
                  </>
                )}
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {getCurrentPageProducts().map((product, index) => (
                  <div
                    key={`${product.sku || index}-${currentPage}`}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-blue-300 transition-all"
                  >
                    {product.image && (
                      <div className="mb-3 bg-gray-50 rounded-lg overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.title || "Product"}
                          className="w-full h-48 object-contain"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://placehold.co/400x400?text=No+Image"
                          }}
                        />
                      </div>
                    )}
                    <h3
                      className="font-semibold text-sm mb-2 line-clamp-2 min-h-[40px]"
                      title={product.title}
                    >
                      {product.title || "No title"}
                    </h3>
                    {product.price && (
                      <div className="mb-2">
                        <p className="text-lg font-bold text-orange-600">
                          {product.price}
                        </p>
                        {product.oldPrice && (
                          <p className="text-sm text-gray-500 line-through">
                            Was {product.oldPrice}
                          </p>
                        )}
                        {product.saveAmount && (
                          <p className="text-sm text-green-600 font-semibold">
                            Save {product.saveAmount}
                            {product.savePercentage &&
                              ` (${product.savePercentage})`}
                          </p>
                        )}
                      </div>
                    )}
                    <div className="space-y-1">
                      {product.rating && (
                        <p className="text-xs text-gray-600">
                          ⭐ {product.rating}
                          {product.reviewCount && ` (${product.reviewCount})`}
                        </p>
                      )}
                      {product.pickup && (
                        <p className="text-xs text-blue-600">
                          📍 Pickup: {product.pickup}
                        </p>
                      )}
                      {product.delivery && (
                        <p className="text-xs text-blue-600">
                          🚚 Delivery: {product.delivery}
                        </p>
                      )}
                      {product.sku && (
                        <p className="text-xs text-gray-500">
                          SKU: {product.sku}
                        </p>
                      )}
                    </div>
                    {product.url && (
                      <a
                        href={product.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline mt-3 inline-flex items-center gap-1"
                      >
                        View Product →
                      </a>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination Controls - Below Products */}
              {result.data.pages && result.data.pages.length > 1 && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">
                        Navigate to Page:
                      </span>
                      <div className="flex gap-1 flex-wrap">
                        {result.data.pages.map((page) => (
                          <button
                            key={page.pageNumber}
                            onClick={() => setCurrentPage(page.pageNumber)}
                            className={`px-3 py-1 rounded font-medium transition ${
                              currentPage === page.pageNumber
                                ? "bg-blue-600 text-white shadow-md"
                                : "bg-white text-gray-700 hover:bg-gray-200 border border-gray-300"
                            }`}
                          >
                            {page.pageNumber}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      Page {currentPage} of {result.data.pages.length}
                      {result.data.pagination && (
                        <span className="ml-2 text-gray-500">
                          ({result.data.pagination.totalPages} total)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Page {currentPage}: Showing{" "}
                    {getCurrentPageProducts().length} products
                    {result.data.pages[currentPage - 1] && (
                      <span className="ml-2">
                        (Total on page:{" "}
                        {result.data.pages[currentPage - 1].productCount})
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Raw JSON Display */}
          {showRawJson && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                📄 Raw JSON Result
              </h2>
              <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-[600px]">
                <pre className="text-green-400 text-sm font-mono">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* No Products Found */}
          {!showRawJson && result.success && result.data?.totalCount === 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-gray-700 text-lg font-medium mb-2">
                  No products found
                </p>
                <p className="text-gray-500 text-sm mb-4">
                  The HTML structure might have changed, or the parsing logic
                  needs adjustment.
                </p>
                <div className="space-x-3">
                  <button
                    onClick={() => setShowRawJson(true)}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Check raw JSON response →
                  </button>
                  <button
                    onClick={handleScrape}
                    className="text-gray-600 hover:underline"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      {!result && !loading && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
            📖 Instructions
          </h2>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">▸</span>
              <span>
                Click <strong>Start Scraping</strong> to test the scraping
                functionality
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">▸</span>
              <span>
                The scraper will fetch data from Home Depots refrigerators page
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">▸</span>
              <span>Results will show both visual cards and raw JSON data</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">▸</span>
              <span>
                Use <strong>Copy JSON</strong> or <strong>Download JSON</strong>{" "}
                to save the results
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">▸</span>
              <span>
                Check your browser console (F12) for detailed logging during
                scraping
              </span>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}
