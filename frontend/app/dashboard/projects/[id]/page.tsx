import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  PlayCircle,
  Download,
  Eye,
} from 'lucide-react'

// Mock data - replace with actual API call
const project = {
  id: '1',
  name: 'Tech Corp IPO 2024',
  description: 'Initial Public Offering documentation for Tech Corp',
  status: 'completed',
  createdAt: '2024-01-15',
  updatedAt: '2024-01-16',
  mainDocument: {
    id: 'main-1',
    name: 'Tech_Corp_IPO_Prospectus.pdf',
    size: 4.5,
    pages: 156,
  },
  supportingDocuments: [
    { id: 'doc-1', name: 'Financial_Statements_2023.pdf', size: 2.1, pages: 45 },
    { id: 'doc-2', name: 'Audit_Report.pdf', size: 1.8, pages: 32 },
    { id: 'doc-3', name: 'Market_Analysis.pdf', size: 3.2, pages: 67 },
    { id: 'doc-4', name: 'Legal_Compliance.pdf', size: 1.5, pages: 28 },
  ],
  stats: {
    totalSentences: 1875,
    validated: 1847,
    uncertain: 23,
    rejected: 5,
    progress: 98,
  },
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

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
                <Badge variant="validated">Completed</Badge>
              </div>
              <p className="mt-2 text-muted-foreground">{project.description}</p>
              <div className="mt-4 flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>{project.supportingDocuments.length + 1} documents</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export Report
              </Button>
              <Link href={`/dashboard/projects/${id}/verify`}>
                <Button className="gap-2">
                  <Eye className="h-4 w-4" />
                  View Verification
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Stats Overview */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Verification Progress</CardTitle>
                <CardDescription>
                  Overall verification status for all sentences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {project.stats.progress}%
                    </span>
                  </div>
                  <Progress value={project.stats.progress} />

                  <Separator className="my-4" />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="h-4 w-4" />
                        <span>Total Sentences</span>
                      </div>
                      <p className="text-2xl font-bold">{project.stats.totalSentences}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-validated" />
                        <span>Validated</span>
                      </div>
                      <p className="text-2xl font-bold text-validated">
                        {project.stats.validated}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {((project.stats.validated / project.stats.totalSentences) * 100).toFixed(1)}%
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 text-uncertain" />
                        <span>Uncertain</span>
                      </div>
                      <p className="text-2xl font-bold text-uncertain">
                        {project.stats.uncertain}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {((project.stats.uncertain / project.stats.totalSentences) * 100).toFixed(1)}%
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <XCircle className="h-4 w-4 text-rejected" />
                        <span>Rejected</span>
                      </div>
                      <p className="text-2xl font-bold text-rejected">
                        {project.stats.rejected}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {((project.stats.rejected / project.stats.totalSentences) * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Documents */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="main">
              <TabsList>
                <TabsTrigger value="main">Main Document</TabsTrigger>
                <TabsTrigger value="supporting">
                  Supporting Documents ({project.supportingDocuments.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="main" className="mt-6">
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
                          <p className="font-semibold">{project.mainDocument.name}</p>
                          <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{project.mainDocument.size} MB</span>
                            <span>{project.mainDocument.pages} pages</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                        <Link href={`/dashboard/projects/${id}/verify`}>
                          <Button size="sm">
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="supporting" className="mt-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {project.supportingDocuments.map((doc) => (
                    <Card key={doc.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-primary/10 rounded-lg">
                            <FileText className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{doc.name}</p>
                            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                              <span>{doc.size} MB</span>
                              <span>{doc.pages} pages</span>
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
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
