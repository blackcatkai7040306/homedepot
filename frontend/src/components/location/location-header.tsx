"use client"

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin, AlertCircle, Store } from 'lucide-react'
import { UserLocation } from '@/types'

interface LocationHeaderProps {
  location: UserLocation | null
  error: string | null
}

export function LocationHeader({ location, error }: LocationHeaderProps) {
  if (error) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="flex items-center space-x-2 py-3">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <span className="text-sm text-amber-700">
            Location Error: {error}
          </span>
          <Badge variant="outline" className="ml-auto">
            Using nationwide data
          </Badge>
        </CardContent>
      </Card>
    )
  }

  if (!location) {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="flex items-center space-x-2 py-3">
          <MapPin className="h-4 w-4 text-blue-600" />
          <span className="text-sm text-blue-700">
            Click "Get Location" to find deals near you and enable barcode scanning
          </span>
          <Badge variant="outline" className="ml-auto">
            Showing all locations
          </Badge>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-green-200 bg-green-50">
      <CardContent className="flex items-center justify-between py-3">
        <div className="flex items-center space-x-2">
          <MapPin className="h-4 w-4 text-green-600" />
          <span className="text-sm text-green-700">
            Location detected: {location.zipCode || 'Getting area info...'}
          </span>
          {location.nearestStoreId && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Store className="mr-1 h-3 w-3" />
              Near store {location.nearestStoreId}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <span>Accuracy: ±{Math.round(location.accuracy)}m</span>
          <span>•</span>
          <span>{new Date(location.timestamp).toLocaleTimeString()}</span>
        </div>
      </CardContent>
    </Card>
  )
}
