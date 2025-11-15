import { projectsApi } from '@/services/projects'
import type { ProjectWithStatsResponse } from '@/services/types'
import { VerificationStatus } from '@/services/types'
import ProjectDetailClient from './project-detail-client'

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  try {
    const project = await projectsApi.getById(id)
    return <ProjectDetailClient initialProject={project} projectId={id} />
  } catch (error) {
    return <ProjectDetailClient projectId={id} error="Failed to load project" />
  }
}
