'use client'

import { use, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
} from 'lucide-react'
import Link from 'next/link'

// Mock data - replace with actual API
const supportingDocs = [
  { id: '1', name: 'Financial_Statements_2023.pdf', pages: 45, relevantCount: 234 },
  { id: '2', name: 'Audit_Report.pdf', pages: 32, relevantCount: 156 },
  { id: '3', name: 'Market_Analysis.pdf', pages: 67, relevantCount: 89 },
  { id: '4', name: 'Legal_Compliance.pdf', pages: 28, relevantCount: 67 },
]

const sentences = [
  {
    id: 's1',
    content: 'Tech Corp generated revenue of $150 million in fiscal year 2023, representing a 45% increase from the previous year.',
    page: 3,
    status: 'validated',
    confidence: 0.95,
    citations: [
      {
        docId: '1',
        docName: 'Financial_Statements_2023.pdf',
        page: 12,
        excerpt: 'Total revenue for FY2023: $150,000,000',
        match: 0.98,
      },
    ],
  },
  {
    id: 's2',
    content: 'The company employs approximately 500 people across three offices in major metropolitan areas.',
    page: 3,
    status: 'validated',
    confidence: 0.92,
    citations: [
      {
        docId: '2',
        docName: 'Audit_Report.pdf',
        page: 8,
        excerpt: 'Employee count as of December 31, 2023: 503 full-time employees',
        match: 0.94,
      },
    ],
  },
  {
    id: 's3',
    content: 'Our market share in the enterprise software segment is estimated at 18% according to industry analysts.',
    page: 3,
    status: 'uncertain',
    confidence: 0.65,
    citations: [
      {
        docId: '3',
        docName: 'Market_Analysis.pdf',
        page: 23,
        excerpt: 'Market share estimates vary between 15-20% depending on methodology',
        match: 0.67,
      },
    ],
  },
  {
    id: 's4',
    content: 'The company has filed patents for 50 unique technologies in the past two years.',
    page: 4,
    status: 'rejected',
    confidence: 0.35,
    citations: [
      {
        docId: '4',
        docName: 'Legal_Compliance.pdf',
        page: 15,
        excerpt: 'Total patent applications filed: 42 (not all approved)',
        match: 0.42,
      },
    ],
  },
]

export default function VerificationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [selectedSentence, setSelectedSentence] = useState(sentences[0])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredSentences = sentences.filter((s) => {
    const matchesSearch = s.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'validated':
        return 'bg-validated/10 hover:bg-validated/20 border-validated/30'
      case 'uncertain':
        return 'bg-uncertain/10 hover:bg-uncertain/20 border-uncertain/30'
      case 'rejected':
        return 'bg-rejected/10 hover:bg-rejected/20 border-rejected/30'
      default:
        return 'bg-muted hover:bg-muted/80'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'validated':
        return <Badge variant="validated">Validated</Badge>
      case 'uncertain':
        return <Badge variant="uncertain">Uncertain</Badge>
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge>{status}</Badge>
    }
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
              <h1 className="text-lg font-semibold">Tech Corp IPO 2024</h1>
              <p className="text-sm text-muted-foreground">Verification Interface</p>
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
                        <p className="text-sm font-medium truncate">{doc.name}</p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{doc.pages} pages</span>
                          <span>•</span>
                          <span>{doc.relevantCount} citations</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Center Panel - Main Document Viewer */}
        <div className="col-span-6 flex flex-col">
          <div className="p-4 border-b bg-background">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Main Document - Page 3</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
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
                        Page {sentence.page}
                      </span>
                    </div>
                    <div className="text-xs font-medium">
                      {(sentence.confidence * 100).toFixed(0)}% confidence
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
                                selectedSentence.confidence >= 0.8
                                  ? 'bg-validated'
                                  : selectedSentence.confidence >= 0.6
                                  ? 'bg-uncertain'
                                  : 'bg-rejected'
                              }`}
                              style={{ width: `${selectedSentence.confidence * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium">
                            {(selectedSentence.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Page Number</p>
                        <p className="text-sm font-medium">Page {selectedSentence.page}</p>
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
                    {selectedSentence.citations.map((citation, idx) => (
                      <Card key={idx} className="border-primary/30">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">
                                  {citation.docName}
                                </p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  Page {citation.page}
                                </p>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {(citation.match * 100).toFixed(0)}% match
                              </Badge>
                            </div>

                            <Separator />

                            <div>
                              <p className="text-xs text-muted-foreground mb-2">
                                Relevant excerpt:
                              </p>
                              <div className="text-xs bg-muted/50 p-3 rounded border">
                                "{citation.excerpt}"
                              </div>
                            </div>

                            <Button variant="outline" size="sm" className="w-full gap-2">
                              <ExternalLink className="h-3 w-3" />
                              View in Document
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* AI Reasoning */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">AI Reasoning</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        {selectedSentence.status === 'validated' &&
                          'The claim is well-supported by primary source documents with high confidence match scores. Financial figures cross-reference directly with official statements.'}
                        {selectedSentence.status === 'uncertain' &&
                          'The claim has some supporting evidence but contains qualitative assessments that vary across sources. Further manual verification recommended.'}
                        {selectedSentence.status === 'rejected' &&
                          'The numerical claim conflicts with official documentation. Source documents indicate a different figure that does not match the stated claim.'}
                      </p>
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
