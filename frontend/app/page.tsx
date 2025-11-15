import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { CheckCircle2, FileCheck, Sparkles, Zap, Shield, TrendingUp } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background via-background to-muted/20 py-20 sm:py-32">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,transparent,black)] dark:bg-grid-slate-700/25" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border bg-background/60 px-3 py-1 text-sm backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-muted-foreground">Powered by Mistral AI & OpenAI</span>
            </div>
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
              IPO Document Verification
              <span className="block text-primary">Made Simple</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              AI-powered verification with sentence-level validation, precise citations,
              and page-by-page tracking. Ensure accuracy and compliance with confidence.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link href="/dashboard">
                <Button size="lg" className="h-12 px-8">
                  Get Started
                </Button>
              </Link>
              <Link href="/dashboard/projects">
                <Button size="lg" variant="outline" className="h-12 px-8">
                  View Projects
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Production-Ready Verification
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Built with state-of-the-art technology stack for enterprise-grade performance
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="group relative overflow-hidden rounded-lg border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/50">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <FileCheck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Sentence-Level Validation</h3>
              <p className="text-muted-foreground">
                Every sentence verified with color-coded results: green for validated,
                yellow for uncertain, red for incorrect.
              </p>
            </div>

            <div className="group relative overflow-hidden rounded-lg border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/50">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Precise Citations</h3>
              <p className="text-muted-foreground">
                Page-by-page citation tracking with 99%+ accuracy using Mistral AI
                for perfect source attribution.
              </p>
            </div>

            <div className="group relative overflow-hidden rounded-lg border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/50">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Optimized with Turbopack, Redis caching, and async processing
                for instant results and seamless performance.
              </p>
            </div>

            <div className="group relative overflow-hidden rounded-lg border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/50">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Enterprise Security</h3>
              <p className="text-muted-foreground">
                Rate limiting, connection pooling, and secure storage with
                Supabase for production-grade reliability.
              </p>
            </div>

            <div className="group relative overflow-hidden rounded-lg border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/50">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Smart Vector Search</h3>
              <p className="text-muted-foreground">
                Weaviate vector database with OpenAI embeddings (3,072 dimensions)
                for intelligent document retrieval.
              </p>
            </div>

            <div className="group relative overflow-hidden rounded-lg border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/50">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Three-Panel Interface</h3>
              <p className="text-muted-foreground">
                Supporting docs, PDF viewer, and citation panel in one
                intuitive interface for efficient verification.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-t bg-muted/30 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 text-center">
            <div>
              <div className="text-4xl font-bold text-primary">3,072</div>
              <div className="mt-2 text-sm text-muted-foreground">Embedding Dimensions</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary">99%+</div>
              <div className="mt-2 text-sm text-muted-foreground">Citation Accuracy</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary">100x</div>
              <div className="mt-2 text-sm text-muted-foreground">Faster with Turbopack</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
