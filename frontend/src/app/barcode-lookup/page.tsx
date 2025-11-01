"use client"

import { BarcodeImageUpload } from '@/components/scanner/barcode-image-upload'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Scan, Upload, Search } from 'lucide-react'

export default function BarcodeLookupPage() {
  const handleUPCDecoded = (upc: string, productData?: any) => {
    console.log('UPC Decoded:', upc, productData)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Scan className="h-8 w-8 text-orange-600" />
            <h1 className="text-3xl font-bold tracking-tight">
              Barcode Product Lookup
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload a barcode image to decode the UPC and find product details with discount information
          </p>
          <div className="flex items-center justify-center space-x-2">
            <Badge variant="secondary">
              <Upload className="mr-1 h-3 w-3" />
              Image Upload
            </Badge>
            <Badge variant="secondary">
              <Search className="mr-1 h-3 w-3" />
              UPC Lookup
            </Badge>
            <Badge variant="secondary">
              Product Details
            </Badge>
          </div>
        </div>

        {/* How It Works */}
        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
            <CardDescription>
              Three simple steps to get product information from barcode images
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Upload className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-medium">1. Upload Image</h3>
                <p className="text-sm text-muted-foreground">
                  Select a clear image containing a barcode from your device
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Scan className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-medium">2. Decode UPC</h3>
                <p className="text-sm text-muted-foreground">
                  Our system automatically detects and decodes the barcode
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                  <Search className="h-6 w-6 text-orange-600" />
                </div>
                <h3 className="font-medium">3. Get Details</h3>
                <p className="text-sm text-muted-foreground">
                  View product information including pricing and discounts
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Upload Component */}
        <BarcodeImageUpload onUPCDecoded={handleUPCDecoded} />

        {/* Features */}
        <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
          <CardHeader>
            <CardTitle className="text-orange-800">✨ Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-medium text-orange-800">Supported Formats</h4>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• UPC-A and UPC-E codes</li>
                  <li>• EAN-13 and EAN-8 codes</li>
                  <li>• Code 128 barcodes</li>
                  <li>• QR codes with product info</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium text-orange-800">What You Get</h4>
                <ul className="text-sm text-orange-700 space-y-1">
                  <li>• Product title and description</li>
                  <li>• Current and original pricing</li>
                  <li>• Discount percentages</li>
                  <li>• Store availability status</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card>
          <CardHeader>
            <CardTitle>📸 Photography Tips</CardTitle>
            <CardDescription>
              Get better results with these barcode photography tips
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-blue-50 border-2 border-blue-200 rounded-lg flex items-center justify-center mx-auto">
                  <span className="text-2xl">💡</span>
                </div>
                <h4 className="font-medium">Good Lighting</h4>
                <p className="text-xs text-muted-foreground">
                  Use natural light or bright indoor lighting
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-green-50 border-2 border-green-200 rounded-lg flex items-center justify-center mx-auto">
                  <span className="text-2xl">🎯</span>
                </div>
                <h4 className="font-medium">Sharp Focus</h4>
                <p className="text-xs text-muted-foreground">
                  Ensure barcode lines are crisp and clear
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-purple-50 border-2 border-purple-200 rounded-lg flex items-center justify-center mx-auto">
                  <span className="text-2xl">📐</span>
                </div>
                <h4 className="font-medium">Straight Angle</h4>
                <p className="text-xs text-muted-foreground">
                  Keep camera parallel to the barcode
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-16 h-16 bg-yellow-50 border-2 border-yellow-200 rounded-lg flex items-center justify-center mx-auto">
                  <span className="text-2xl">🔍</span>
                </div>
                <h4 className="font-medium">Full Barcode</h4>
                <p className="text-xs text-muted-foreground">
                  Include the entire barcode in the image
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
