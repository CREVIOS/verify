import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Plus, Search, FileText, Clock, CheckCircle2, XCircle } from 'lucide-react'

// Mock data - replace with actual API calls
const projects = [
  {
    id: '1',
    name: 'Tech Corp IPO 2024',
    status: 'completed',
    documentsCount: 12,
    validatedSentences: 1847,
    uncertainSentences: 23,
    rejectedSentences: 5,
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'FinServe Holdings IPO',
    status: 'processing',
    documentsCount: 8,
    validatedSentences: 892,
    uncertainSentences: 45,
    rejectedSentences: 12,
    createdAt: '2024-01-18',
  },
  {
    id: '3',
    name: 'GreenEnergy Inc IPO',
    status: 'draft',
    documentsCount: 5,
    validatedSentences: 0,
    uncertainSentences: 0,
    rejectedSentences: 0,
    createdAt: '2024-01-20',
  },
]

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'completed':
      return <Badge variant="validated">Completed</Badge>
    case 'processing':
      return <Badge variant="uncertain">Processing</Badge>
    case 'draft':
      return <Badge variant="outline">Draft</Badge>
    default:
      return <Badge>{status}</Badge>
  }
}

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="border-b bg-background">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
              <p className="mt-2 text-muted-foreground">
                Manage your IPO document verification projects
              </p>
            </div>
            <Link href="/dashboard/projects/new">
              <Button size="lg" className="gap-2">
                <Plus className="h-4 w-4" />
                New Project
              </Button>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="mt-6 relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              className="pl-10 max-w-md"
            />
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} href={`/dashboard/projects/${project.id}`}>
              <Card className="group transition-all hover:shadow-lg hover:border-primary/50 cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="line-clamp-1 group-hover:text-primary transition-colors">
                        {project.name}
                      </CardTitle>
                      <CardDescription className="mt-2 flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {new Date(project.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    {getStatusBadge(project.status)}
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {project.documentsCount} documents
                      </span>
                    </div>

                    {project.status !== 'draft' && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-validated" />
                            <span>Validated</span>
                          </div>
                          <span className="font-semibold">{project.validatedSentences}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-uncertain" />
                            <span>Uncertain</span>
                          </div>
                          <span className="font-semibold">{project.uncertainSentences}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-rejected" />
                            <span>Rejected</span>
                          </div>
                          <span className="font-semibold">{project.rejectedSentences}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter>
                  <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    View Project
                  </Button>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No projects yet</h3>
            <p className="mt-2 text-muted-foreground">
              Get started by creating your first verification project
            </p>
            <Link href="/dashboard/projects/new">
              <Button className="mt-6">
                <Plus className="mr-2 h-4 w-4" />
                Create Project
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
