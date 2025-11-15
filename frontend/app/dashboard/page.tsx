import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Plus, Search, FileText, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { projectsApi } from '@/services/projects'
import { VerificationStatus, type ProjectWithStats } from '@/services/types'

function getStatusBadge(status?: VerificationStatus) {
  switch (status) {
    case VerificationStatus.COMPLETED:
      return <Badge variant="validated">Completed</Badge>
    case VerificationStatus.PROCESSING:
      return <Badge variant="uncertain">Processing</Badge>
    case VerificationStatus.INDEXING:
      return <Badge variant="uncertain">Indexing</Badge>
    case VerificationStatus.PENDING:
      return <Badge variant="outline">Pending</Badge>
    case VerificationStatus.FAILED:
      return <Badge variant="destructive">Failed</Badge>
    default:
      return <Badge variant="outline">Draft</Badge>
  }
}

export default async function DashboardPage() {
  // Fetch real projects from API
  const { items: projects } = await projectsApi.getAll()

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
        {projects.length > 0 ? (
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
                          {new Date(project.created_at).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      {getStatusBadge(project.latest_job?.status)}
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {project.document_count} document{project.document_count !== 1 ? 's' : ''}
                        </span>
                      </div>

                      {project.latest_job && project.latest_job.status !== VerificationStatus.PENDING && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-validated" />
                              <span>Validated</span>
                            </div>
                            <span className="font-semibold">{project.latest_job.validated_count}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-uncertain" />
                              <span>Uncertain</span>
                            </div>
                            <span className="font-semibold">{project.latest_job.uncertain_count}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <XCircle className="h-4 w-4 text-rejected" />
                              <span>Incorrect</span>
                            </div>
                            <span className="font-semibold">{project.latest_job.incorrect_count}</span>
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
        ) : (
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
