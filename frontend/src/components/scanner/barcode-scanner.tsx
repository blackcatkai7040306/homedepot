"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  X, 
  Camera, 
  CameraOff, 
  Scan, 
  AlertCircle, 
  CheckCircle,
  Keyboard,
  Upload,
  Image as ImageIcon
} from 'lucide-react'
import { BarcodeImageUpload } from './barcode-image-upload'

interface BarcodeScannerProps {
  isOpen: boolean
  onClose: () => void
  onScanComplete: (price: number) => void
  productInfo?: {
    title: string
    sku: string
    expectedUPC?: string
  }
}

type ScanMode = 'camera' | 'upload' | 'manual'

export function BarcodeScanner({ 
  isOpen, 
  onClose, 
  onScanComplete, 
  productInfo 
}: BarcodeScannerProps) {
  const [scanMode, setScanMode] = useState<ScanMode>('camera')
  const [isScanning, setIsScanning] = useState(false)
  const [scannedCode, setScannedCode] = useState<string>('')
  const [manualPrice, setManualPrice] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [scanResult, setScanResult] = useState<{
    upc: string
    price: number
    verified: boolean
  } | null>(null)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    if (isOpen) {
      startCamera()
    } else {
      stopCamera()
    }

    return () => {
      stopCamera()
    }
  }, [isOpen])

  const startCamera = async () => {
    try {
      setError('')
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment' // Use back camera if available
        } 
      })
      
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setIsScanning(true)
      }
    } catch (err) {
      console.error('Camera access denied:', err)
      setError('Camera access denied. Please enable camera permissions or use manual entry.')
      setShowManualEntry(true)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsScanning(false)
  }

  const simulateBarcodeScan = () => {
    // Simulate barcode scanning - in a real app, you'd use a barcode scanning library
    const mockUPC = productInfo?.expectedUPC || '123456789012'
    const mockPrice = Math.random() < 0.3 ? 0.10 : Math.random() * 20 + 0.99
    
    handleUPCDecoded(mockUPC)
  }

  const handleManualSubmit = () => {
    const price = parseFloat(manualPrice)
    if (isNaN(price) || price < 0) {
      setError('Please enter a valid price')
      return
    }
    
    // Save the manually entered price
    savePriceToDatabase(productInfo?.sku || '', price, false)
    onScanComplete(price)
  }

  const handleScanComplete = () => {
    if (scanResult) {
      savePriceToDatabase(scanResult.upc, scanResult.price, true)
      onScanComplete(scanResult.price)
    }
  }

  const handleUPCDecoded = (upc: string, productData?: any) => {
    setScannedCode(upc)
    setError('')
    
    if (productData) {
      // If we have product data from the image upload, use it
      setScanResult({
        upc,
        price: productData.discount_info?.current_price || 0,
        verified: true
      })
    } else {
      // For camera scanning, simulate price lookup
      const mockPrice = Math.random() < 0.3 ? 0.10 : Math.random() * 20 + 0.99
      setScanResult({
        upc,
        price: Number(mockPrice.toFixed(2)),
        verified: upc === productInfo?.expectedUPC
      })
    }
  }

  const savePriceToDatabase = async (upc: string, price: number, scanned: boolean) => {
    try {
      // Get user location for store context
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords
        
        await fetch('/api/scanned-products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            upc,
            price,
            latitude,
            longitude,
            scanned,
            timestamp: new Date().toISOString()
          })
        })
      })
    } catch (error) {
      console.error('Failed to save scanned price:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Scan className="h-5 w-5" />
              <span>Barcode Scanner</span>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {productInfo && (
            <div className="space-y-2">
              <p className="text-sm font-medium">{productInfo.title}</p>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">SKU: {productInfo.sku}</Badge>
                {productInfo.expectedUPC && (
                  <Badge variant="outline">UPC: {productInfo.expectedUPC}</Badge>
                )}
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            <button
              onClick={() => setScanMode('camera')}
              className={`
                flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center justify-center space-x-2
                ${scanMode === 'camera' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
                }
              `}
            >
              <Camera className="h-4 w-4" />
              <span>Camera</span>
            </button>
            <button
              onClick={() => setScanMode('upload')}
              className={`
                flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center justify-center space-x-2
                ${scanMode === 'upload' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
                }
              `}
            >
              <Upload className="h-4 w-4" />
              <span>Upload</span>
            </button>
            <button
              onClick={() => setScanMode('manual')}
              className={`
                flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center justify-center space-x-2
                ${scanMode === 'manual' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
                }
              `}
            >
              <Keyboard className="h-4 w-4" />
              <span>Manual</span>
            </button>
          </div>

          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {/* Camera View */}
          {scanMode === 'camera' && (
            <div className="space-y-4">
              <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
                
                {isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="border-2 border-green-400 w-64 h-40 rounded-lg relative">
                      <div className="absolute inset-0 border-2 border-green-400 animate-pulse" />
                      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500 animate-pulse" />
                    </div>
                  </div>
                )}
                
                {!isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <CameraOff className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={simulateBarcodeScan}
                  disabled={!isScanning}
                  className="flex-1"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Scan Barcode
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setShowManualEntry(true)}
                >
                  <Keyboard className="mr-2 h-4 w-4" />
                  Manual Entry
                </Button>
              </div>
            </div>
          )}

          {/* Upload View */}
          {scanMode === 'upload' && (
            <BarcodeImageUpload 
              onUPCDecoded={handleUPCDecoded}
            />
          )}

          {/* Manual Price Entry */}
          {scanMode === 'manual' && (
            <div className="space-y-4">
              <div className="text-center py-4">
                <Keyboard className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                <h3 className="font-medium">Enter Price Manually</h3>
                <p className="text-sm text-muted-foreground">
                  If you can't scan, enter the in-store price directly
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">In-store price ($)</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={manualPrice}
                  onChange={(e) => setManualPrice(e.target.value)}
                />
              </div>
              
              <div className="flex space-x-2">
                <Button
                  onClick={handleManualSubmit}
                  className="flex-1"
                  disabled={!manualPrice}
                >
                  Save Price
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setScanMode('camera')}
                >
                  Back to Camera
                </Button>
              </div>
            </div>
          )}

          {/* Scan Result */}
          {scanResult && (
            <div className="space-y-4">
              <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="mx-auto h-8 w-8 text-green-600 mb-2" />
                <h3 className="font-medium text-green-800">Barcode Scanned!</h3>
                
                <div className="space-y-2 mt-3">
                  <p className="text-sm text-green-700">
                    UPC: {scanResult.upc}
                  </p>
                  <p className="text-lg font-bold text-green-800">
                    Store Price: ${scanResult.price.toFixed(2)}
                  </p>
                  
                  {scanResult.verified ? (
                    <Badge className="bg-green-600">
                      ✓ Product Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-amber-400 text-amber-700">
                      ⚠ Different product detected
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={handleScanComplete} className="flex-1">
                  Save This Price
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setScanResult(null)
                    setScannedCode('')
                  }}
                >
                  Scan Again
                </Button>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="text-xs text-muted-foreground space-y-1 border-t pt-4">
            <p><strong>Camera:</strong> Point at barcode and hold steady</p>
            <p><strong>Upload:</strong> Select barcode image from your device</p>
            <p><strong>Manual:</strong> Enter price if scanning fails</p>
            <p>• Scanned prices are saved to help other users</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
