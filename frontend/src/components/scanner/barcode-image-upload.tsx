"use client"

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  Image as ImageIcon, 
  Loader2, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  ExternalLink,
  Package,
  DollarSign,
  Tag,
  Info
} from 'lucide-react'
import jsQR from 'jsqr'

interface BarcodeImageUploadProps {
  onUPCDecoded: (upc: string, productData?: any) => void
}

export function BarcodeImageUpload({ onUPCDecoded }: BarcodeImageUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [decodedUPC, setDecodedUPC] = useState<string | null>(null)
  const [productData, setProductData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLookingUp, setIsLookingUp] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Reset state
    setError(null)
    setDecodedUPC(null)
    setProductData(null)
    setIsProcessing(true)

    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload a valid image file (JPG, PNG, etc.)')
      }

      // Create image URL for preview
      const imageUrl = URL.createObjectURL(file)
      setUploadedImage(imageUrl)

      // Decode barcode from image
      const upc = await decodeBarcodeFromImage(file)
      
      if (upc) {
        setDecodedUPC(upc)
        onUPCDecoded(upc)
        
        // Look up product details
        await lookupProductByUPC(upc)
      } else {
        throw new Error('No barcode found in the image. Please try a clearer image with a visible barcode.')
      }

    } catch (err) {
      console.error('Barcode processing error:', err)
      setError(err instanceof Error ? err.message : 'Failed to process barcode image')
    } finally {
      setIsProcessing(false)
    }
  }

  const decodeBarcodeFromImage = (file: File): Promise<string | null> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      
      img.onload = () => {
        try {
          const canvas = canvasRef.current!
          const ctx = canvas.getContext('2d')!
          
          // Set canvas size to image size
          canvas.width = img.width
          canvas.height = img.height
          
          // Draw image on canvas
          ctx.drawImage(img, 0, 0)
          
          // Get image data
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
          
          // Decode QR/barcode
          const code = jsQR(imageData.data, imageData.width, imageData.height)
          
          if (code) {
            resolve(code.data)
          } else {
            // Try with different orientations and scales
            tryDifferentOrientations(ctx, img, imageData.width, imageData.height)
              .then(result => resolve(result))
              .catch(() => resolve(null))
          }
        } catch (error) {
          reject(new Error('Failed to process image'))
        }
      }
      
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(file)
    })
  }

  const tryDifferentOrientations = async (
    ctx: CanvasRenderingContext2D, 
    img: HTMLImageElement,
    width: number,
    height: number
  ): Promise<string | null> => {
    // Try different scales and regions of the image
    const scales = [0.5, 0.8, 1.2, 1.5]
    const regions = [
      { x: 0, y: 0, w: width, h: height }, // Full image
      { x: width * 0.1, y: height * 0.1, w: width * 0.8, h: height * 0.8 }, // Center region
      { x: 0, y: height * 0.3, w: width, h: height * 0.4 }, // Middle horizontal strip
    ]

    for (const region of regions) {
      for (const scale of scales) {
        try {
          const scaledWidth = region.w * scale
          const scaledHeight = region.h * scale
          
          const tempCanvas = document.createElement('canvas')
          const tempCtx = tempCanvas.getContext('2d')!
          tempCanvas.width = scaledWidth
          tempCanvas.height = scaledHeight
          
          tempCtx.drawImage(
            img, 
            region.x, region.y, region.w, region.h,
            0, 0, scaledWidth, scaledHeight
          )
          
          const imageData = tempCtx.getImageData(0, 0, scaledWidth, scaledHeight)
          const code = jsQR(imageData.data, imageData.width, imageData.height)
          
          if (code) {
            return code.data
          }
        } catch (error) {
          // Continue trying other combinations
        }
      }
    }
    
    return null
  }

  const lookupProductByUPC = async (upc: string) => {
    setIsLookingUp(true)
    try {
      const response = await fetch(`/api/upc/lookup?upc=${encodeURIComponent(upc)}`)
      const data = await response.json()
      
      if (data.success) {
        setProductData(data.product)
      } else {
        setError(data.message || 'Product not found in database')
      }
    } catch (error) {
      console.error('Product lookup error:', error)
      setError('Failed to lookup product details')
    } finally {
      setIsLookingUp(false)
    }
  }

  const handleRetry = () => {
    setUploadedImage(null)
    setDecodedUPC(null)
    setProductData(null)
    setError(null)
    fileInputRef.current?.click()
  }

  const handleClear = () => {
    setUploadedImage(null)
    setDecodedUPC(null)
    setProductData(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Upload Barcode Image</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Input */}
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 hover:border-muted-foreground/50 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            
            {!uploadedImage ? (
              <div className="text-center">
                <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Upload Barcode Image</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Select an image containing a barcode to decode the UPC
                </p>
                <Button onClick={() => fileInputRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" />
                  Choose Image
                </Button>
              </div>
            ) : (
              <div className="w-full">
                <div className="relative mb-4">
                  <img
                    src={uploadedImage}
                    alt="Uploaded barcode"
                    className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
                  />
                  {isProcessing && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                      <Loader2 className="h-8 w-8 text-white animate-spin" />
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2 justify-center">
                  <Button variant="outline" size="sm" onClick={handleRetry}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Another
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleClear}>
                    Clear
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Processing Status */}
          {isProcessing && (
            <div className="flex items-center justify-center space-x-2 py-4">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Processing barcode image...</span>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <XCircle className="h-5 w-5 text-red-600" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {/* UPC Result */}
          {decodedUPC && (
            <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm text-green-700">
                UPC Decoded: <strong>{decodedUPC}</strong>
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Details */}
      {(isLookingUp || productData) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Product Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLookingUp ? (
              <div className="flex items-center justify-center space-x-2 py-4">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Looking up product details...</span>
              </div>
            ) : productData ? (
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <img
                    src={productData.imageUrl || '/images/products/1.webp'}
                    alt={productData.title}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{productData.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {productData.description}
                    </p>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{productData.brand}</Badge>
                      <Badge variant="secondary">{productData.category}</Badge>
                      {productData.discount_info?.is_clearance && (
                        <Badge variant="destructive">CLEARANCE</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pricing Information */}
                {productData.discount_info && (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="font-medium mb-3 flex items-center">
                      <DollarSign className="mr-2 h-4 w-4" />
                      Pricing Information
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Original Price:</span>
                        <span className="ml-2 line-through">
                          ${productData.discount_info.original_price}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Current Price:</span>
                        <span className="ml-2 font-bold text-green-600">
                          ${productData.discount_info.current_price}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Discount:</span>
                        <span className="ml-2 text-orange-600 font-medium">
                          {productData.discount_info.discount_percentage}% off
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">You Save:</span>
                        <span className="ml-2 text-green-600 font-medium">
                          ${productData.discount_info.savings.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Product Metadata */}
                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div>SKU: {productData.sku}</div>
                    <div>UPC: {productData.upc}</div>
                    <div>Source: {productData.source || 'Database'}</div>
                    <div>Status: {productData.discount_info?.availability || 'Available'}</div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex space-x-2">
                  <Button className="flex-1 bg-orange-500 hover:bg-orange-600">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View on Home Depot
                  </Button>
                  <Button variant="outline" onClick={handleClear}>
                    <Package className="mr-2 h-4 w-4" />
                    Scan Another
                  </Button>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Hidden Canvas for Image Processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <h4 className="font-medium mb-2">Tips for best results:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Ensure the barcode is clearly visible and not blurry</li>
                <li>Good lighting helps improve barcode detection</li>
                <li>Try to capture the entire barcode within the image</li>
                <li>Supported formats: UPC, EAN, Code 128, QR codes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
