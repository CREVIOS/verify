import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight">
          IPO Document Verification
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          AI-powered document verification with citation tracking and sentence-level validation
        </p>
        <div className="flex gap-4 justify-center mt-8">
          <Link href="/dashboard">
            <Button size="lg">
              Get Started
            </Button>
          </Link>
          <Link href="/dashboard/projects">
            <Button size="lg" variant="outline">
              View Projects
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}
