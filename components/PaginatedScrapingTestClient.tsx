'use client'

import { useState } from 'react'
import { scrapeHomeDepotRefrigeratorsPaginated } from '@/app/action/scraping-paginated'
import { Button } from '@/components/ui/Button'

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

export function PaginatedScrapingTestClient() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PaginatedScrapingResult | null>(null)
  const [showRawJson, setShowRawJson] = useState(false)
  const [currentViewPage, setCurrentViewPage] = useState(1)
  
  // Fixed URL - no user input allowed
  const FIXED_URL = "https://www.homedepot.com/b/Appliances-Refrigerators-French-Door-Refrigerators/Special-Buys/N-5yc1vZc3ooZ1z11ao3"

  const handleScrape = async () => {
    setLoading(true)
    setResult(null)
    setCurrentViewPage(1) // Reset to first page view
    
    try {
      console.log("🔄 Starting COMPLETE paginated scrape for URL:", FIXED_URL)
      console.log("📊 Will automatically detect and scrape ALL pages")
      const data = await scrapeHomeDepotRefrigeratorsPaginated(FIXED_URL)
      console.log("✓ Complete paginated scrape finished:", data)
      setResult(data)
    } catch (error) {
      console.error("❌ Scraping error:", error)
      setResult({
        success: false,
        baseUrl: FIXED_URL,
        totalPages: 0,
        totalProducts: 0,
        pages: [],
        allProducts: [],
        error: error instanceof Error ? error.message : "Unknown error occurred"
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    if (!result?.allProducts) return
    
    try {
      await navigator.clipboard.writeText(JSON.stringify(result.allProducts, null, 2))
      alert("All product data copied to clipboard!")
    } catch (error) {
      console.error("Failed to copy:", error)
      alert("Failed to copy data to clipboard")
    }
  }

  const downloadJson = () => {
    if (!result?.allProducts) return
    
    const jsonData = JSON.stringify(result.allProducts, null, 2)
    const blob = new Blob([jsonData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `homedepot-products-paginated-${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const downloadPaginatedJson = () => {
    if (!result) return
    
    const jsonData = JSON.stringify(result, null, 2)
    const blob = new Blob([jsonData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `homedepot-full-paginated-${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Get current page data for viewing
  const getCurrentPageData = () => {
    if (!result?.pages) return null
    return result.pages.find(page => page.pageNumber === currentViewPage) || null
  }

  return (
    <div className="space-y-6">
      {/* Fixed Target Info */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">🧊 Home Depot French Door Refrigerators Scraper</h3>
        
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">🎯 Target Page</h4>
          <p className="text-sm text-gray-700 mb-2">
            <strong>French Door Refrigerators - Special Buys</strong>
          </p>
          <p className="text-xs text-gray-600 font-mono break-all">
            {FIXED_URL}
          </p>
        </div>
        
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">🤖 Automatic Complete Scraping</h4>
          <p className="text-sm text-blue-700">
            The system will automatically detect the total number of pages from the pagination 
            and scrape <strong>ALL pages</strong> without any limits. Each page is scraped with 
            proper 3-second synchronization delays for accuracy.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="text-center">
        <Button
          onClick={handleScrape}
          disabled={loading}
          variant="primary"
          className="px-8 py-3 text-lg"
        >
          {loading ? "🔄 Auto-Scraping All Pages..." : "🚀 Start Complete Auto-Scraping"}
        </Button>
        
        {loading && (
          <div className="mt-3 text-sm text-gray-600 space-y-1">
            <p className="font-medium">⏳ Automatically detecting and scraping ALL pages...</p>
            <p>• Each page requires 3+ seconds for proper synchronization</p>
            <p>• The system will automatically stop when all pages are scraped</p>
            <p>• This may take several minutes depending on total pages found</p>
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">
              {result.success ? "✅ Complete Auto-Scraping Results" : "❌ Scraping Failed"}
            </h2>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowRawJson(!showRawJson)}
              >
                {showRawJson ? "Show Visual" : "Show JSON"}
              </Button>
              {result.success && result.allProducts.length > 0 && (
                <>
                  <Button variant="secondary" onClick={copyToClipboard}>
                    Copy JSON
                  </Button>
                  <Button variant="secondary" onClick={downloadJson}>
                    Download All Products
                  </Button>
                  <Button variant="secondary" onClick={downloadPaginatedJson}>
                    Download Full Results
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Summary Stats */}
          {result.success && (
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{result.totalPages}</div>
                <div className="text-sm text-blue-800">Total Pages</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{result.totalProducts}</div>
                <div className="text-sm text-green-800">Total Products</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {result.totalPages > 0 ? Math.round(result.totalProducts / result.totalPages) : 0}
                </div>
                <div className="text-sm text-purple-800">Avg Per Page</div>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-orange-600">{currentViewPage}</div>
                <div className="text-sm text-orange-800">Current View</div>
              </div>
            </div>
          )}

          {/* Page Navigation */}
          {result.success && result.pages.length > 1 && (
            <div className="flex justify-center items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <Button
                variant="secondary"
                onClick={() => setCurrentViewPage(Math.max(1, currentViewPage - 1))}
                disabled={currentViewPage <= 1}
              >
                ← Previous Page
              </Button>
              
              <div className="flex gap-1">
                {result.pages.map((page) => (
                  <button
                    key={page.pageNumber}
                    onClick={() => setCurrentViewPage(page.pageNumber)}
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      currentViewPage === page.pageNumber
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {page.pageNumber}
                  </button>
                ))}
              </div>
              
              <Button
                variant="secondary"
                onClick={() => setCurrentViewPage(Math.min(result.totalPages, currentViewPage + 1))}
                disabled={currentViewPage >= result.totalPages}
              >
                Next Page →
              </Button>
              
              <div className="text-sm text-gray-600 ml-4">
                Page {currentViewPage} of {result.totalPages}
                {(() => {
                  const pageData = getCurrentPageData()
                  return pageData ? ` (${pageData.productsCount} products)` : ""
                })()}
              </div>
            </div>
          )}

          {/* Content Display */}
          {!showRawJson ? (
            <div>
              {result.success ? (
                <div>
                  {(() => {
                    const pageData = getCurrentPageData()
                    const displayProducts = pageData?.products || []
                    
                    return (
                      <div>
                        {pageData && (
                          <p className="mb-4 text-gray-600">
                            Showing <strong>{displayProducts.length}</strong> products from page{" "}
                            <strong>{pageData.pageNumber}</strong> of <strong>{result.totalPages}</strong>
                            {" "}({result.totalProducts} total products)
                          </p>
                        )}

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {displayProducts.map((product, index) => (
                            <div
                              key={product.sku || index}
                              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                              {product.image && (
                                <div className="aspect-square mb-3 bg-gray-100 rounded-lg overflow-hidden">
                                  <img
                                    src={product.image}
                                    alt={product.title || "Product"}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                  />
                                </div>
                              )}

                              <div>
                                {(product.brand || product.label) && (
                                  <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                                    {product.brand && (
                                      <span className="font-bold text-blue-600">
                                        {product.brand}{product.label && " "}
                                      </span>
                                    )}
                                    {product.label}
                                  </h3>
                                )}

                                <div className="mb-2">
                                  {product.price && (
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xl font-bold text-green-600">
                                        {product.price}
                                      </span>
                                      {product.oldPrice && (
                                        <span className="text-sm text-gray-500 line-through">
                                          {product.oldPrice}
                                        </span>
                                      )}
                                    </div>
                                  )}
                                  
                                  {(product.saveAmount || product.savePercentage) && (
                                    <div className="text-sm text-green-600">
                                      Save {product.saveAmount}
                                      {product.savePercentage && (
                                        <span> ({product.savePercentage})</span>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {(product.pickup || product.delivery) && (
                                  <div className="text-xs text-gray-600 mb-2 space-y-1">
                                    {product.pickup && (
                                      <div>
                                        <span className="font-semibold">🏪 Pickup:</span> {product.pickup}
                                      </div>
                                    )}
                                    {product.delivery && (
                                      <div>
                                        <span className="font-semibold">🚛 Delivery:</span> {product.delivery}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {product.sku && (
                                  <p className="text-xs text-gray-500 mb-2">
                                    SKU: {product.sku}
                                  </p>
                                )}

                                {product.url && (
                                  <a
                                    href={product.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block text-sm text-blue-600 hover:underline"
                                  >
                                    View Product →
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })()}
                </div>
              ) : (
                <div className="text-red-600">
                  <p className="font-medium">Error: {result.error}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-auto">
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
