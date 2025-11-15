'use client'

import { useState, useEffect } from 'react'
import { VerificationJob, VerifiedSentence, ValidationResult, Document } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { getValidationColor, getValidationBadgeColor, formatFileSize } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'

interface VerificationViewerProps {
  job: VerificationJob
  documents: Document[]
  onSentenceClick: (sentence: VerifiedSentence) => void
}

export function VerificationViewer({ job, documents, onSentenceClick }: VerificationViewerProps) {
  const [selectedSentence, setSelectedSentence] = useState<VerifiedSentence | null>(null)
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null)

  const supportingDocs = documents.filter(d => d.document_type === 'supporting')
  const mainDoc = documents.find(d => d.id === job.main_document_id)

  const handleSentenceClick = (sentence: VerifiedSentence) => {
    setSelectedSentence(sentence)
    onSentenceClick(sentence)
  }

  return (
    <div className="flex h-[calc(100vh-200px)] gap-4">
      {/* Left Panel - Supporting Documents */}
      <div className="w-1/4 border-r pr-4">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg">Supporting Documents</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-300px)]">
              <div className="space-y-2 p-4">
                {supportingDocs.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDocument(doc.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedDocument === doc.id
                        ? 'bg-primary/10 border-primary'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <div className="font-medium text-sm truncate">
                      {doc.original_filename}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatFileSize(doc.file_size)}
                      {doc.page_count && ` • ${doc.page_count} pages`}
                    </div>
                    {doc.indexed && (
                      <Badge variant="secondary" className="mt-2">
                        Indexed
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Center Panel - Main Document with Highlighted Sentences */}
      <div className="flex-1">
        <Card className="h-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">{mainDoc?.original_filename}</CardTitle>
                <div className="text-sm text-muted-foreground mt-1">
                  {job.verified_sentences} of {job.total_sentences} sentences verified
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="validated">{job.validated_count} Validated</Badge>
                <Badge variant="uncertain">{job.uncertain_count} Uncertain</Badge>
                <Badge variant="incorrect">{job.incorrect_count} Incorrect</Badge>
              </div>
            </div>
            <Progress value={job.progress} className="mt-4" />
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[calc(100vh-400px)]">
              <div className="space-y-3 p-4">
                {job.sentences?.map((sentence, idx) => (
                  <div
                    key={sentence.id}
                    onClick={() => handleSentenceClick(sentence)}
                    className={`p-4 rounded-lg border-l-4 cursor-pointer transition-all ${
                      getValidationColor(sentence.validation_result)
                    } ${
                      selectedSentence?.id === sentence.id
                        ? 'shadow-lg scale-[1.02]'
                        : 'hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="text-xs text-muted-foreground mb-1">
                          Sentence {sentence.sentence_index + 1}
                          {sentence.page_number && ` • Page ${sentence.page_number}`}
                        </div>
                        <div className="text-sm leading-relaxed">
                          {sentence.content}
                        </div>
                        {sentence.confidence_score !== undefined && (
                          <div className="text-xs text-muted-foreground mt-2">
                            Confidence: {(sentence.confidence_score * 100).toFixed(1)}%
                          </div>
                        )}
                      </div>
                      <Badge
                        variant={
                          sentence.validation_result === ValidationResult.VALIDATED
                            ? 'validated'
                            : sentence.validation_result === ValidationResult.UNCERTAIN
                            ? 'uncertain'
                            : sentence.validation_result === ValidationResult.INCORRECT
                            ? 'incorrect'
                            : 'secondary'
                        }
                      >
                        {sentence.validation_result}
                      </Badge>
                    </div>
                    {sentence.citations.length > 0 && (
                      <div className="text-xs text-muted-foreground mt-2">
                        {sentence.citations.length} citation(s)
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Right Panel - Citations and Details */}
      <div className="w-1/3 border-l pl-4">
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedSentence ? 'Citation Details' : 'Select a sentence'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedSentence ? (
              <ScrollArea className="h-[calc(100vh-300px)]">
                <div className="space-y-4">
                  {/* Sentence Info */}
                  <div>
                    <div className="text-sm font-medium mb-2">Sentence</div>
                    <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
                      {selectedSentence.content}
                    </div>
                  </div>

                  {/* Validation Result */}
                  <div>
                    <div className="text-sm font-medium mb-2">Validation Result</div>
                    <Badge
                      variant={
                        selectedSentence.validation_result === ValidationResult.VALIDATED
                          ? 'validated'
                          : selectedSentence.validation_result === ValidationResult.UNCERTAIN
                          ? 'uncertain'
                          : selectedSentence.validation_result === ValidationResult.INCORRECT
                          ? 'incorrect'
                          : 'secondary'
                      }
                      className="text-sm"
                    >
                      {selectedSentence.validation_result}
                    </Badge>
                  </div>

                  {/* AI Reasoning */}
                  {selectedSentence.reasoning && (
                    <div>
                      <div className="text-sm font-medium mb-2">AI Reasoning</div>
                      <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
                        {selectedSentence.reasoning}
                      </div>
                    </div>
                  )}

                  {/* Citations */}
                  <div>
                    <div className="text-sm font-medium mb-2">
                      Citations ({selectedSentence.citations.length})
                    </div>
                    <div className="space-y-3">
                      {selectedSentence.citations.map((citation, idx) => (
                        <div key={idx} className="border rounded-lg p-3 bg-card">
                          <div className="flex items-start justify-between mb-2">
                            <div className="text-xs font-medium text-primary">
                              Citation {idx + 1}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {(citation.similarity_score * 100).toFixed(0)}% match
                            </Badge>
                          </div>

                          {citation.filename && (
                            <div className="text-xs text-muted-foreground mb-1">
                              📄 {citation.filename}
                              {citation.page_number && ` (Page ${citation.page_number})`}
                            </div>
                          )}

                          <div className="text-sm bg-muted p-2 rounded mt-2">
                            "{citation.cited_text}"
                          </div>

                          {citation.relevance && (
                            <div className="text-xs text-muted-foreground mt-2">
                              <strong>Relevance:</strong> {citation.relevance}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Review Notes */}
                  {selectedSentence.manually_reviewed && selectedSentence.reviewer_notes && (
                    <div>
                      <div className="text-sm font-medium mb-2">Reviewer Notes</div>
                      <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
                        {selectedSentence.reviewer_notes}
                      </div>
                    </div>
                  )}

                  {/* Review Actions */}
                  <div className="pt-4 border-t">
                    <div className="text-sm font-medium mb-2">Review Actions</div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline">
                        Mark as Validated
                      </Button>
                      <Button size="sm" variant="outline">
                        Mark as Uncertain
                      </Button>
                      <Button size="sm" variant="outline">
                        Mark as Incorrect
                      </Button>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Click on a sentence to view details and citations
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
