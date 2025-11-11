import { PaginatedScrapingTestClient } from '@/components/PaginatedScrapingTestClient'

export default function TestScrapingPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-bold text-center mb-8">🧊 French Door Refrigerators Scraper</h1>
      <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
        Dedicated scraper for Home Depot French Door Refrigerators (Special Buys). 
        Automatically detects all pages and extracts complete product information including 
        images, prices, brand/label info, and pickup/delivery status.
      </p>
      <PaginatedScrapingTestClient />
    </div>
  )
}