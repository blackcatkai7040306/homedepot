import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to Next.js
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            A modern React framework with TypeScript and TailwindCSS
          </p>
          <div className="flex gap-4 justify-center">
            <Button as={Link} href="/about" variant="primary">
              Learn More
            </Button>
            <Button as={Link} href="/contact" variant="secondary">
              Get Started
            </Button>
            <Button as={Link} href="/test-scraping" variant="secondary">
              Test Scraping
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <Card
            title="Fast Refresh"
            description="Experience instant feedback with Fast Refresh for React components"
            icon="⚡"
          />
          <Card
            title="TypeScript"
            description="Built-in TypeScript support for better developer experience"
            icon="📘"
          />
          <Card
            title="TailwindCSS"
            description="Utility-first CSS framework for rapid UI development"
            icon="🎨"
          />
        </div>
      </div>
    </main>
  )
}
