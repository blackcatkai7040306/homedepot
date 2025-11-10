import { ScrapingTestClient } from '@/components/ScrapingTestClient'

export const metadata = {
  title: 'Test Scraping - Home Depot',
  description: 'Test page for Home Depot scraping functionality',
}

export default function TestScrapingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Scraping Test Page
            </h1>
            <p className="text-gray-600">
              Testing Home Depot refrigerators page scraping functionality
            </p>
          </div>
          
          <ScrapingTestClient />
        </div>
      </div>
    </main>
  )
}

