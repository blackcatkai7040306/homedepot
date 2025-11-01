import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // In a real application, this would query your database
    // Using structured mock data instead of random generation
    
    const { mockStats } = await import('@/lib/mock-data')
    
    // Add some real-time variation to make it feel dynamic
    const stats = {
      ...mockStats,
      // Small random variations for real-time feel
      totalDeals: mockStats.totalDeals + Math.floor(Math.random() * 3),
      recentActivity: {
        ...mockStats.recentActivity,
        productsAddedToday: Math.floor(Math.random() * 8) + 3,
        pricesVerifiedToday: Math.floor(Math.random() * 15) + 8
      }
    }
    
    return NextResponse.json(stats)
    
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
