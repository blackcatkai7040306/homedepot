import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Target, Users, Zap } from 'lucide-react'

export default function AboutPage() {
  const features = [
    {
      icon: Target,
      title: "Goal-Oriented",
      description: "Built with clear objectives in mind to maximize your sales potential."
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Seamless integration with your team workflows and processes."
    },
    {
      icon: Zap,
      title: "Performance Focused",
      description: "Optimized for speed and efficiency in all your sales operations."
    },
    {
      icon: CheckCircle,
      title: "Reliable",
      description: "Built with modern technologies and best practices for stability."
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <Badge variant="secondary">About Our Platform</Badge>
          <h1 className="text-4xl font-bold tracking-tight">
            Modern Sales Management
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Built with Next.js, TypeScript, and Tailwind CSS to provide you with a 
            modern, scalable, and maintainable sales management platform.
          </p>
        </div>

        {/* Technology Stack */}
        <Card>
          <CardHeader>
            <CardTitle>Technology Stack</CardTitle>
            <CardDescription>
              Modern technologies powering this application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center space-y-2">
                <div className="font-semibold">Next.js 14</div>
                <p className="text-sm text-muted-foreground">React Framework</p>
              </div>
              <div className="text-center space-y-2">
                <div className="font-semibold">TypeScript</div>
                <p className="text-sm text-muted-foreground">Type Safety</p>
              </div>
              <div className="text-center space-y-2">
                <div className="font-semibold">Tailwind CSS</div>
                <p className="text-sm text-muted-foreground">Styling</p>
              </div>
              <div className="text-center space-y-2">
                <div className="font-semibold">Lucide Icons</div>
                <p className="text-sm text-muted-foreground">Icons</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <Icon className="h-6 w-6 text-primary mr-2" />
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Project Structure */}
        <Card>
          <CardHeader>
            <CardTitle>Project Structure</CardTitle>
            <CardDescription>
              Organized for scalability and maintainability
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Core Directories</h4>
                <ul className="space-y-2 text-sm">
                  <li><code className="bg-muted px-1 rounded">/app</code> - Next.js App Router pages and layouts</li>
                  <li><code className="bg-muted px-1 rounded">/components</code> - Reusable UI components</li>
                  <li><code className="bg-muted px-1 rounded">/lib</code> - Utility functions and configurations</li>
                  <li><code className="bg-muted px-1 rounded">/types</code> - TypeScript type definitions</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Additional Directories</h4>
                <ul className="space-y-2 text-sm">
                  <li><code className="bg-muted px-1 rounded">/hooks</code> - Custom React hooks</li>
                  <li><code className="bg-muted px-1 rounded">/ui</code> - Base UI components</li>
                  <li><code className="bg-muted px-1 rounded">/dashboard</code> - Dashboard-specific components</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
