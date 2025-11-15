/**
 * TypeScript types for API responses
 * These match the backend Pydantic models
 */

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
  metadata: Record<string, any>
  created_at: string
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
  error_message?: string
  created_at: string
  updated_at: string
}

export interface Citation {
  doc_id: string
  doc_name: string
  page: number
  excerpt: string
  match_score: number
  context_before?: string
  context_after?: string
}

export interface VerifiedSentence {
  id: string
  verification_job_id: string
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
  created_at: string
  updated_at: string
}

export interface ProjectWithStats extends Project {
  document_count: number
  main_document?: Document
  supporting_documents: Document[]
  latest_job?: VerificationJob
}

export interface CreateProjectRequest {
  name: string
  description?: string
  background_context?: string
}

export interface UploadDocumentRequest {
  file: File
  document_type: DocumentType
}

export interface VerificationJobResponse {
  job_id: string
  status: VerificationStatus
  message: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  per_page: number
  pages: number
}
