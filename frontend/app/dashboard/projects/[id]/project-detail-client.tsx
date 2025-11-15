'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ArrowLeft,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Download,
  Loader2,
  PlayCircle,
  AlertCircle,
} from 'lucide-react'
import { projectsApi } from '@/services/projects'
import type { ProjectWithStatsResponse } from '@/services/types'
import { VerificationStatus } from '@/services/types'
import { toast } from '@/hooks/use-toast'
import { Alert, AlertDescription } from '@/components/ui/alert'

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

interface Props {
  projectId: string
  initialProject?: ProjectWithStatsResponse
  error?: string
}

export default function ProjectDetailClient({ projectId, initialProject, error: initialError }: Props) {
  const router = useRouter()
  const [project, setProject] = useState<ProjectWithStatsResponse | null>(initialProject || null)
  const [loading, setLoading] = useState(!initialProject && !initialError)
  const [error, setError] = useState(initialError)
  const [startingVerification, setStartingVerification] = useState(false)

  useEffect(() => {
    if (!initialProject && !initialError) {
      loadProject()
    }
  }, [projectId])

  async function loadProject() {
    try {
      setLoading(true)
      const data = await projectsApi.getById(projectId)
      setProject(data)
      setError(undefined)
    } catch (err: any) {
      setError(err.message || 'Failed to load project')
      toast({
        title: 'Error loading project',
        description: err.message || 'Failed to load project details',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleStartVerification() {
    if (!project) return

    try {
      setStartingVerification(true)
      await projectsApi.startVerification(projectId)
      toast({
        title: 'Verification started',
        description: 'Your documents are being verified with GPT-4 and Gemini 2.5 Pro',
        variant: 'default',
      })
      await loadProject()
    } catch (err: any) {
      toast({
        title: 'Failed to start verification',
        description: err.message || 'An error occurred',
        variant: 'destructive',
      })
    } finally {
      setStartingVerification(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30">
        <div className="border-b bg-background">
          <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-10 w-96" />
            <Skeleton className="h-5 w-80 mt-4" />
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 bg-destructive/10 rounded-lg">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <CardTitle>Error Loading Project</CardTitle>
                <CardDescription>{error}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button onClick={loadProject} className="flex-1">
              Try Again
            </Button>
            <Link href="/dashboard" className="flex-1">
              <Button variant="outline" className="w-full">
                Go to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!project) {
    return null
  }

  const hasMainDocument = !!project.main_document
  const hasSupportingDocs = project.supporting_documents.length > 0
  const canStartVerification = hasMainDocument && hasSupportingDocs && !project.latest_job

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="border-b bg-background">
        <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Projects
            </Button>
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
                {project.latest_job && getStatusBadge(project.latest_job.status as VerificationStatus)}
              </div>
              {project.description && (
                <p className="mt-2 text-muted-foreground">{project.description}</p>
              )}
              <div className="mt-4 flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>{project.document_count} document{project.document_count !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              {project.latest_job?.status === VerificationStatus.COMPLETED && (
                <>
                  <Button variant="outline" className="gap-2">
                    <Download className="h-4 w-4" />
                    Export Report
                  </Button>
                  <Link href={`/dashboard/projects/${projectId}/verify`}>
                    <Button className="gap-2">
                      <Eye className="h-4 w-4" />
                      View Verification
                    </Button>
                  </Link>
                </>
              )}
              {canStartVerification && (
                <Button
                  onClick={handleStartVerification}
                  disabled={startingVerification}
                  className="gap-2"
                >
                  {startingVerification ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <PlayCircle className="h-4 w-4" />
                      Start Verification
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {!hasMainDocument && (
            <Alert className="mt-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Upload a main IPO document to begin verification
              </AlertDescription>
            </Alert>
          )}

          {hasMainDocument && !hasSupportingDocs && (
            <Alert className="mt-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Upload at least one supporting document for verification
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      {/* Content - Rest of the component same as before */}
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Stats Overview */}
          {project.latest_job && (
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <CardTitle>Verification Progress</CardTitle>
                  <CardDescription>
                    AI-powered verification using GPT-4 and Gemini 2.5 Pro
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Overall Progress</span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round(project.latest_job.progress * 100)}%
                      </span>
                    </div>
                    <Progress value={project.latest_job.progress * 100} />

                    <Separator className="my-4" />

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <FileText className="h-4 w-4" />
                          <span>Total Sentences</span>
                        </div>
                        <p className="text-2xl font-bold">{project.latest_job.total_sentences}</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-validated" />
                          <span>Validated</span>
                        </div>
                        <p className="text-2xl font-bold text-validated">
                          {project.latest_job.validated_count}
                        </p>
                        {project.latest_job.total_sentences > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {((project.latest_job.validated_count / project.latest_job.total_sentences) * 100).toFixed(1)}%
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 text-uncertain" />
                          <span>Uncertain</span>
                        </div>
                        <p className="text-2xl font-bold text-uncertain">
                          {project.latest_job.uncertain_count}
                        </p>
                        {project.latest_job.total_sentences > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {((project.latest_job.uncertain_count / project.latest_job.total_sentences) * 100).toFixed(1)}%
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <XCircle className="h-4 w-4 text-rejected" />
                          <span>Incorrect</span>
                        </div>
                        <p className="text-2xl font-bold text-rejected">
                          {project.latest_job.incorrect_count}
                        </p>
                        {project.latest_job.total_sentences > 0 && (
                          <p className="text-xs text-muted-foreground">
                            {((project.latest_job.incorrect_count / project.latest_job.total_sentences) * 100).toFixed(1)}%
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Documents */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="main">
              <TabsList>
                <TabsTrigger value="main">Main Document</TabsTrigger>
                <TabsTrigger value="supporting">
                  Supporting Documents ({project.supporting_documents.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="main" className="mt-6">
                {project.main_document ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Main IPO Document</CardTitle>
                      <CardDescription>
                        Primary document being verified
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-primary/10 rounded-lg">
                            <FileText className="h-8 w-8 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">{project.main_document.original_filename}</p>
                            <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{(project.main_document.file_size / 1024 / 1024).toFixed(2)} MB</span>
                              {project.main_document.page_count && (
                                <span>{project.main_document.page_count} pages</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-sm text-muted-foreground">No main document uploaded</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="supporting" className="mt-6">
                {project.supporting_documents.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {project.supporting_documents.map((doc) => (
                      <Card key={doc.id}>
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-4">
                            <div className="p-3 bg-primary/10 rounded-lg">
                              <FileText className="h-6 w-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{doc.original_filename}</p>
                              <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                                <span>{(doc.file_size / 1024 / 1024).toFixed(2)} MB</span>
                                {doc.page_count && <span>{doc.page_count} pages</span>}
                              </div>
                              <div className="mt-3 flex gap-2">
                                <Button variant="outline" size="sm" className="text-xs">
                                  <Download className="mr-1 h-3 w-3" />
                                  Download
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-sm text-muted-foreground">No supporting documents uploaded</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
