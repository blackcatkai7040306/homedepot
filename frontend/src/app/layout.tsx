import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ErrorBoundary } from '@/components/error-boundary'
import { Header } from '@/components/navigation/header'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '🏠 Home Depot Clearance Deals',
  description: 'Find ultra-low clearance prices nationwide. Scan barcodes for local pricing verification.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <div className="min-h-screen bg-background font-sans antialiased">
            <Header />
            <main>
              {children}
            </main>
          </div>
        </ErrorBoundary>
      </body>
    </html>
  )
}
