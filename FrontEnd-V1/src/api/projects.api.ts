// ============================================
// Projects API Module
// ============================================

import apiClient from './client';
import type { Project, ProjectCreate, ProjectUpdate, ProjectStats } from 'src/types/models.types';
import type { PaginatedResponse, QueryParams } from 'src/types/api.types';

// ============================================
// API Functions
// ============================================

/**
 * Get paginated list of projects
 */
export async function listProjects(params?: QueryParams): Promise<PaginatedResponse<Project>> {
  const response = await apiClient.get<PaginatedResponse<Project>>('/projects', {
    params,
  });
  return response.data;
}

/**
 * Get a single project by ID
 */
export async function getProject(id: number): Promise<Project> {
  const response = await apiClient.get<Project>(`/projects/${id}`);
  return response.data;
}

/**
 * Create a new project
 */
export async function createProject(data: ProjectCreate): Promise<Project> {
  const response = await apiClient.post<Project>('/projects', data);
  return response.data;
}

/**
 * Update an existing project
 */
export async function updateProject(id: number, data: ProjectUpdate): Promise<Project> {
  const response = await apiClient.put<Project>(`/projects/${id}`, data);
  return response.data;
}

/**
 * Delete a project
 */
export async function deleteProject(id: number): Promise<void> {
  await apiClient.delete(`/projects/${id}`);
}

/**
 * Get projects by team
 */
export async function getProjectsByTeam(
  teamId: number,
  params?: QueryParams,
): Promise<PaginatedResponse<Project>> {
  const response = await apiClient.get<PaginatedResponse<Project>>(
    `/projects/team/${teamId}`, // [수정] URL 변경
    { params },
  );
  return response.data;
}

/**
 * Get projects by status
 */
export async function getProjectsByStatus(
  status: string,
  params?: QueryParams,
): Promise<PaginatedResponse<Project>> {
  const response = await apiClient.get<PaginatedResponse<Project>>('/projects', {
    params: { ...params, status },
  });
  return response.data;
}

export async function getProjectStats(projectId: number): Promise<ProjectStats> {
  const response = await apiClient.get<ProjectStats>(`/projects/${projectId}/stats`);
  return response.data;
}
