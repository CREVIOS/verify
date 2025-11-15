/**
 * API service for Projects
 */

import { apiClient } from './client'
import type {
  Project,
  ProjectWithStats,
  CreateProjectRequest,
  PaginatedResponse,
} from './types'

export const projectsApi = {
  /**
   * Get all projects with optional pagination
   */
  async getAll(page: number = 1, perPage: number = 20): Promise<PaginatedResponse<ProjectWithStats>> {
    return apiClient.get<PaginatedResponse<ProjectWithStats>>(
      `/api/projects?page=${page}&per_page=${perPage}`
    )
  },

  /**
   * Get a single project by ID with full stats
   */
  async getById(id: string): Promise<ProjectWithStats> {
    return apiClient.get<ProjectWithStats>(`/api/projects/${id}`)
  },

  /**
   * Create a new project
   */
  async create(data: CreateProjectRequest): Promise<Project> {
    return apiClient.post<Project>('/api/projects', data)
  },

  /**
   * Update an existing project
   */
  async update(id: string, data: Partial<CreateProjectRequest>): Promise<Project> {
    return apiClient.put<Project>(`/api/projects/${id}`, data)
  },

  /**
   * Delete a project
   */
  async delete(id: string): Promise<void> {
    return apiClient.delete<void>(`/api/projects/${id}`)
  },

  /**
   * Upload main document for a project
   */
  async uploadMainDocument(projectId: string, file: File): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('document_type', 'main')

    return apiClient.upload(`/api/projects/${projectId}/documents`, formData)
  },

  /**
   * Upload supporting documents for a project
   */
  async uploadSupportingDocuments(projectId: string, files: File[]): Promise<any> {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('files', file)
    })
    formData.append('document_type', 'supporting')

    return apiClient.upload(`/api/projects/${projectId}/documents`, formData)
  },

  /**
   * Start verification job for a project
   */
  async startVerification(projectId: string): Promise<any> {
    return apiClient.post(`/api/projects/${projectId}/verify`)
  },
}
