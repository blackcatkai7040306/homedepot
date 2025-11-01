"use client"

import { useState, useEffect } from 'react'

/**
 * Hook to prevent hydration mismatches by ensuring content only renders on client
 * Useful for components that depend on browser APIs or dynamic client-side data
 */
export function useClientOnly() {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  return hasMounted
}

/**
 * Component wrapper that only renders children on client-side
 * Prevents hydration mismatches for client-only content
 */
export function ClientOnly({ 
  children, 
  fallback = null 
}: { 
  children: React.ReactNode
  fallback?: React.ReactNode 
}) {
  const hasMounted = useClientOnly()

  if (!hasMounted) {
    return fallback
  }

  return <>{children}</>
}
