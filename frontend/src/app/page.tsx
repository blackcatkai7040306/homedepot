"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Scan, RefreshCw, Store } from 'lucide-react'
import { DealsTabContent } from '@/components/deals/deals-tab-content'
import { UltraLowPriceTabContent } from '@/components/deals/ultra-low-price-tab-content'
import { StatsOverview } from '@/components/deals/stats-overview'
import { LocationHeader } from '@/components/location/location-header'
import { useGeolocation } from '@/hooks/use-geolocation'
import { useLocalStorage } from '@/hooks/use-local-storage'

type TabType = 'deals' | 'ultra-low'

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('deals')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { location, error: locationError, getCurrentLocation } = useGeolocation()
  const [lastRefresh, setLastRefresh] = useLocalStorage('lastDataRefresh', '')

  const handleRefreshData = async () => {
    setIsRefreshing(true)
    try {
      // Call API to refresh product data
      const response = await fetch('/api/products/refresh', {
        method: 'POST'
      })
      
      if (response.ok) {
        setLastRefresh(new Date().toISOString())
        // You can add toast notification here
      }
    } catch (error) {
      console.error('Failed to refresh data:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Initialize lastRefresh if not set
  React.useEffect(() => {
    if (!lastRefresh) {
      setLastRefresh(new Date().toISOString())
    }
  }, [lastRefresh, setLastRefresh])

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col space-y-6">
        
        {/* Header with Location */}
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-orange-600">
              🏠 Home Depot Clearance Deals
            </h1>
            <p className="text-muted-foreground">
              Find ultra-low clearance prices nationwide • Scan barcodes for local pricing
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={getCurrentLocation}
              disabled={!navigator.geolocation}
            >
              <MapPin className="mr-2 h-4 w-4" />
              Get Location
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshData}
              disabled={isRefreshing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Location Info */}
        <LocationHeader location={location} error={locationError} />

        {/* Stats Overview */}
        <StatsOverview />

        {/* Tabs Navigation */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('deals')}
            className={`
              px-4 py-2 text-sm font-medium rounded-md transition-colors
              ${activeTab === 'deals' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
              }
            `}
          >
            🔥 All Deals
          </button>
          <button
            onClick={() => setActiveTab('ultra-low')}
            className={`
              px-4 py-2 text-sm font-medium rounded-md transition-colors
              ${activeTab === 'ultra-low' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
              }
            `}
          >
            💰 $0.10 & Under
          </button>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'deals' && <DealsTabContent />}
          {activeTab === 'ultra-low' && <UltraLowPriceTabContent />}
        </div>

        {/* Footer Info */}
        <div className="bg-muted/50 rounded-lg p-4 mt-8">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              <span>
                Last updated: {lastRefresh ? new Date(lastRefresh).toLocaleString() : 'Loading...'}
              </span>
              <Badge variant="outline">
                <Store className="mr-1 h-3 w-3" />
                Data from Home Depot stores nationwide
              </Badge>
            </div>
            <span className="text-xs">
              Prices may vary by location • Use barcode scanner for local verification
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
