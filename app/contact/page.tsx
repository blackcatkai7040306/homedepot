import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { ContactForm } from "@/components/ContactForm"

export default function Contact() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">
            Contact Us
          </h1>
          <p className="text-gray-600 mb-8 text-center">
            Get in touch with us. We would love to hear from you!
          </p>
          <ContactForm />
          <div className="mt-8 text-center">
            <Button as={Link} href="/" variant="secondary">
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
