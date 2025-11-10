import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function About() {
  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">About</h1>
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-4">
              This is a sample Next.js application built with modern architecture
              and best practices.
            </p>
            <p className="text-gray-600 mb-4">
              The project uses the App Router, TypeScript for type safety, and
              TailwindCSS for styling.
            </p>
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">
              Features
            </h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Next.js 14 with App Router</li>
              <li>TypeScript for type safety</li>
              <li>TailwindCSS for styling</li>
              <li>Modern folder architecture</li>
              <li>Reusable UI components</li>
            </ul>
          </div>
          <div className="mt-8">
            <Button as={Link} href="/" variant="primary">
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}

