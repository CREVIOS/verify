export enum DocumentType {
  MAIN = 'main',
  SUPPORTING = 'supporting',
}

export enum VerificationStatus {
  PENDING = 'pending',
  INDEXING = 'indexing',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum ValidationResult {
  VALIDATED = 'validated',
  UNCERTAIN = 'uncertain',
  INCORRECT = 'incorrect',
  PENDING = 'pending',
}

export interface Project {
  id: string
  name: string
  description?: string
  background_context?: string
  created_at: string
  updated_at: string
  document_count?: number
  verification_job_count?: number
  main_document_count?: number
  supporting_document_count?: number
}

export interface Document {
  id: string
  project_id: string
  filename: string
  original_filename: string
  file_path: string
  file_size: number
  mime_type: string
  document_type: DocumentType
  page_count?: number
  indexed: boolean
  indexed_at?: string
  created_at: string
  metadata?: Record<string, any>
}

export interface Citation {
  source_document_id: string
  cited_text: string
  page_number?: number
  start_char?: number
  end_char?: number
  similarity_score: number
  context_before?: string
  context_after?: string
  filename?: string
  relevance?: string
}

export interface VerifiedSentence {
  id: string
  sentence_index: number
  content: string
  page_number?: number
  start_char?: number
  end_char?: number
  validation_result: ValidationResult
  confidence_score?: number
  reasoning?: string
  citations: Citation[]
  manually_reviewed: boolean
  reviewer_notes?: string
}

export interface VerificationJob {
  id: string
  project_id: string
  main_document_id?: string
  status: VerificationStatus
  progress: number
  total_sentences: number
  verified_sentences: number
  validated_count: number
  uncertain_count: number
  incorrect_count: number
  celery_task_id?: string
  started_at?: string
  completed_at?: string
  created_at: string
  updated_at: string
  error_message?: string
  sentences?: VerifiedSentence[]
}

export interface VerificationProgress {
  job_id: string
  status: VerificationStatus
  progress: number
  current_sentence: number
  total_sentences: number
  message: string
}
