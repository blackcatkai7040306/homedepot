"use client"

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Home, Scan, Package } from 'lucide-react'

export function Header() {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🏠</span>
              <div>
                <span className="font-bold text-lg text-orange-600">Home Depot</span>
                <span className="text-sm text-muted-foreground ml-2">Clearance Deals</span>
              </div>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" >
              <Link href="/" className="flex items-center space-x-2">
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Deals</span>
              </Link>
            </Button>
            
            <Button variant="ghost" size="sm" >
              <Link href="/products" className="flex items-center space-x-2">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Products</span>
              </Link>
            </Button>
            
            <Button variant="outline" size="sm" >
              <Link href="/barcode-lookup" className="flex items-center space-x-2">
                <Scan className="h-4 w-4" />
                <span>Barcode Lookup</span>
                <Badge variant="secondary" className="ml-1 text-xs">New</Badge>
              </Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  )
}
