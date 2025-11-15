'use client'

import { use, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ArrowLeft,
  Search,
  FileText,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Download,
  Filter,
  Loader2,
} from 'lucide-react'
import Link from 'next/link'
import { projectsApi } from '@/services/projects'
import { sentencesApi } from '@/services/sentences'
import type { ProjectWithStatsResponse, VerifiedSentenceResponse, DocumentResponse } from '@/services/types'
import { ValidationResult } from '@/services/types'
import { toast } from '@/hooks/use-toast'

export default function VerificationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [project, setProject] = useState<ProjectWithStatsResponse | null>(null)
  const [sentences, setSentences] = useState<VerifiedSentenceResponse[]>([])
  const [supportingDocs, setSupportingDocs] = useState<DocumentResponse[]>([])
  const [selectedSentence, setSelectedSentence] = useState<VerifiedSentenceResponse | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    loadData()
  }, [id])

  async function loadData() {
    try {
      setLoading(true)

      // Load project details
      const projectData = await projectsApi.getById(id)
      setProject(projectData)

      // Load supporting documents
      setSupportingDocs(projectData.supporting_documents)

      // Load verified sentences if verification job exists
      if (projectData.latest_job) {
        const sentencesData = await sentencesApi.getByJobId(projectData.latest_job.id, {
          page: 1,
          limit: 100,
        })
        setSentences(sentencesData.items)
        if (sentencesData.items.length > 0) {
          setSelectedSentence(sentencesData.items[0])
        }
      }
    } catch (error: any) {
      toast({
        title: 'Error loading verification data',
        description: error.message || 'Failed to load verification details',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredSentences = sentences.filter((s) => {
    const matchesSearch = s.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: ValidationResult) => {
    switch (status) {
      case ValidationResult.VALIDATED:
        return 'bg-validated/10 hover:bg-validated/20 border-validated/30'
      case ValidationResult.UNCERTAIN:
        return 'bg-uncertain/10 hover:bg-uncertain/20 border-uncertain/30'
      case ValidationResult.INCORRECT:
        return 'bg-rejected/10 hover:bg-rejected/20 border-rejected/30'
      default:
        return 'bg-muted hover:bg-muted/80'
    }
  }

  const getStatusBadge = (status: ValidationResult) => {
    switch (status) {
      case ValidationResult.VALIDATED:
        return <Badge variant="validated">Validated</Badge>
      case ValidationResult.UNCERTAIN:
        return <Badge variant="uncertain">Uncertain</Badge>
      case ValidationResult.INCORRECT:
        return <Badge variant="destructive">Incorrect</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="h-screen flex flex-col bg-background">
        <div className="border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/dashboard/projects/${id}`}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <Skeleton className="h-6 w-48" />
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading verification data...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!project || !project.latest_job) {
    return (
      <div className="h-screen flex flex-col bg-background">
        <div className="border-b px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/projects/${id}`}>
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="text-lg font-semibold">{project?.name || 'Project'}</h1>
              <p className="text-sm text-muted-foreground">Verification Interface</p>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-2">No Verification Data</h2>
            <p className="text-sm text-muted-foreground">
              Start verification from the project page to see results here
            </p>
            <Link href={`/dashboard/projects/${id}`}>
              <Button className="mt-4">Go to Project</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/projects/${id}`}>
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="text-lg font-semibold">{project.name}</h1>
              <p className="text-sm text-muted-foreground">
                Verification Interface - {sentences.length} sentences analyzed
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Three-Panel Layout */}
      <div className="flex-1 grid grid-cols-12 divide-x overflow-hidden">
        {/* Left Panel - Supporting Documents */}
        <div className="col-span-3 flex flex-col bg-muted/30">
          <div className="p-4 border-b bg-background">
            <h2 className="font-semibold mb-3">Supporting Documents</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                className="pl-9 h-9"
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-2">
              {supportingDocs.map((doc) => (
                <Card
                  key={doc.id}
                  className="cursor-pointer transition-all hover:border-primary/50 hover:shadow-sm"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{doc.original_filename}</p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{doc.page_count || 0} pages</span>
                          <span>•</span>
                          <span>{(doc.file_size / 1024 / 1024).toFixed(1)} MB</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {supportingDocs.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-xs text-muted-foreground">No supporting documents</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Center Panel - Main Document Viewer */}
        <div className="col-span-6 flex flex-col">
          <div className="p-4 border-b bg-background">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">
                {project.main_document?.original_filename || 'Main Document'}
                {selectedSentence && ` - Page ${selectedSentence.page_number}`}
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search in document..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] h-9">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="validated">Validated</SelectItem>
                  <SelectItem value="uncertain">Uncertain</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-6 space-y-4 max-w-4xl">
              {filteredSentences.map((sentence) => (
                <div
                  key={sentence.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    getStatusColor(sentence.status)
                  } ${
                    selectedSentence.id === sentence.id
                      ? 'ring-2 ring-primary ring-offset-2'
                      : ''
                  }`}
                  onClick={() => setSelectedSentence(sentence)}
                >
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(sentence.status)}
                      <span className="text-xs text-muted-foreground">
                        Page {sentence.page_number}
                      </span>
                    </div>
                    <div className="text-xs font-medium">
                      {(sentence.confidence_score * 100).toFixed(0)}% confidence
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed">{sentence.content}</p>
                </div>
              ))}

              {filteredSentences.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                  <p className="mt-4 text-muted-foreground">No sentences found</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Right Panel - Citation Details */}
        <div className="col-span-3 flex flex-col bg-muted/30">
          <div className="p-4 border-b bg-background">
            <h2 className="font-semibold">Citation Details</h2>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              {selectedSentence && (
                <>
                  {/* Selected Sentence Info */}
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm">Status</CardTitle>
                        {getStatusBadge(selectedSentence.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Confidence Score</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                selectedSentence.confidence_score >= 0.8
                                  ? 'bg-validated'
                                  : selectedSentence.confidence_score >= 0.6
                                  ? 'bg-uncertain'
                                  : 'bg-rejected'
                              }`}
                              style={{ width: `${selectedSentence.confidence_score * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium">
                            {(selectedSentence.confidence_score * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Page Number</p>
                        <p className="text-sm font-medium">Page {selectedSentence.page_number}</p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Citations Found</p>
                        <p className="text-sm font-medium">
                          {selectedSentence.citations.length} source(s)
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Citations */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold">Source Citations</h3>
                    {selectedSentence.citations && selectedSentence.citations.length > 0 ? (
                      selectedSentence.citations.map((citation, idx) => (
                        <Card key={idx} className="border-primary/30">
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium truncate">
                                    Supporting Document
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    Page {citation.page_number}
                                  </p>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {(citation.similarity_score * 100).toFixed(0)}% match
                                </Badge>
                              </div>

                              <Separator />

                              <div>
                                <p className="text-xs text-muted-foreground mb-2">
                                  Relevant excerpt:
                                </p>
                                <div className="text-xs bg-muted/50 p-3 rounded border">
                                  "{citation.content}"
                                </div>
                              </div>

                              {citation.metadata && (
                                <div className="text-xs text-muted-foreground">
                                  <span className="font-medium">Source:</span> {citation.metadata.document_name || 'Supporting document'}
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <p className="text-xs text-muted-foreground text-center py-4">
                        No citations found
                      </p>
                    )}
                  </div>

                  {/* AI Reasoning */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">AI Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {selectedSentence.ai_reasoning && (
                          <div>
                            <p className="text-xs font-medium mb-1">Reasoning:</p>
                            <p className="text-xs leading-relaxed text-muted-foreground">
                              {selectedSentence.ai_reasoning}
                            </p>
                          </div>
                        )}
                        {selectedSentence.metadata && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-xs font-medium mb-1">Analyzed by:</p>
                            <p className="text-xs text-muted-foreground">
                              GPT-4 and Gemini 2.5 Pro
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  )
}
