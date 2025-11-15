/**
 * API service for Verified Sentences
 */

import { apiClient } from './client'
import type {
  VerifiedSentence,
  ValidationResult,
  PaginatedResponse,
} from './types'

export const sentencesApi = {
  /**
   * Get sentences for a verification job
   */
  async getByJobId(
    jobId: string,
    page: number = 1,
    perPage: number = 50,
    status?: ValidationResult
  ): Promise<PaginatedResponse<VerifiedSentence>> {
    let url = `/api/verification-jobs/${jobId}/sentences?page=${page}&per_page=${perPage}`
    if (status) {
      url += `&status=${status}`
    }
    return apiClient.get<PaginatedResponse<VerifiedSentence>>(url)
  },

  /**
   * Get a single sentence by ID
   */
  async getById(sentenceId: string): Promise<VerifiedSentence> {
    return apiClient.get<VerifiedSentence>(`/api/sentences/${sentenceId}`)
  },

  /**
   * Update manual review for a sentence
   */
  async updateReview(
    sentenceId: string,
    data: { manually_reviewed: boolean; reviewer_notes?: string }
  ): Promise<VerifiedSentence> {
    return apiClient.put<VerifiedSentence>(`/api/sentences/${sentenceId}/review`, data)
  },

  /**
   * Search sentences by text
   */
  async search(
    projectId: string,
    query: string,
    page: number = 1,
    perPage: number = 20
  ): Promise<PaginatedResponse<VerifiedSentence>> {
    return apiClient.get<PaginatedResponse<VerifiedSentence>>(
      `/api/projects/${projectId}/sentences/search?q=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`
    )
  },
}
