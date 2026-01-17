// ============================================
// Sprints API - Sprint management endpoints
// ============================================

import apiClient from './client';
import type { Sprint, SprintCreate, SprintUpdate } from 'src/types/models.types';
import type { PaginatedResponse, QueryParams } from 'src/types/api.types';

// ============================================
// Sprint CRUD Operations
// ============================================

/**
 * Get paginated list of sprints
 */
export async function listSprints(params?: QueryParams): Promise<PaginatedResponse<Sprint>> {
  const response = await apiClient.get<PaginatedResponse<Sprint>>('/sprints', { params });
  return response.data;
}

/**
 * Get a single sprint by ID
 */
export async function getSprint(id: number): Promise<Sprint> {
  const response = await apiClient.get<Sprint>(`/sprints/${id}`);
  return response.data;
}

/**
 * Create a new sprint
 */
export async function createSprint(data: SprintCreate): Promise<Sprint> {
  const response = await apiClient.post<Sprint>('/sprints', data);
  return response.data;
}

/**
 * Update an existing sprint
 */
export async function updateSprint(id: number, data: SprintUpdate): Promise<Sprint> {
  const response = await apiClient.put<Sprint>(`/sprints/${id}`, data);
  return response.data;
}

/**
 * Delete a sprint
 */
export async function deleteSprint(id: number): Promise<void> {
  await apiClient.delete(`/sprints/${id}`);
}

// ============================================
// Sprint Status Operations
// ============================================

/**
 * Start a sprint
 */
export async function startSprint(id: number): Promise<Sprint> {
  const response = await apiClient.post<Sprint>(`/sprints/${id}/start`);
  return response.data;
}

/**
 * Complete a sprint
 */
export async function completeSprint(id: number): Promise<Sprint> {
  const response = await apiClient.post<Sprint>(`/sprints/${id}/complete`);
  return response.data;
}

// ============================================
// Additional Sprint Queries
// ============================================

/**
 * Get sprints by project
 */
export async function getSprintsByProject(
  projectId: number,
  params?: QueryParams,
): Promise<PaginatedResponse<Sprint>> {
  const response = await apiClient.get<PaginatedResponse<Sprint>>(`/sprints/project/${projectId}`, {
    params,
  });
  return response.data;
}

/**
 * Get sprints by status
 */
export async function getSprintsByStatus(
  status: string,
  params?: QueryParams,
): Promise<PaginatedResponse<Sprint>> {
  const response = await apiClient.get<PaginatedResponse<Sprint>>('/sprints', {
    params: { ...params, status },
  });
  return response.data;
}

/**
 * Get active sprints
 */
export async function getActiveSprints(params?: QueryParams): Promise<PaginatedResponse<Sprint>> {
  return getSprintsByStatus('active', params);
}

/**
 * Get sprint statistics
 */
export async function getSprintStats(sprintId: number): Promise<{
  total_issues: number;
  completed_issues: number;
  in_progress_issues: number;
  todo_issues: number;
  total_story_points: number;
  completed_story_points: number;
}> {
  const response = await apiClient.get(`/sprints/${sprintId}/stats`);
  return response.data;
}
