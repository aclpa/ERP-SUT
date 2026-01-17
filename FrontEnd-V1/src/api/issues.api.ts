// ============================================
// Issue API Module
// ============================================

import apiClient from './client';
import type { Issue, IssueCreate, IssueUpdate } from 'src/types/models.types';
import type { PaginatedResponse, QueryParams } from 'src/types/api.types';

/**
 * Get paginated list of issues
 */
export async function listIssues(params?: QueryParams): Promise<PaginatedResponse<Issue>> {
  const response = await apiClient.get<PaginatedResponse<Issue>>('/issues', {
    params,
  });
  return response.data;
}

/**
 * Get a single issue by ID
 */
export async function getIssue(id: number): Promise<Issue> {
  const response = await apiClient.get<Issue>(`/issues/${id}`);
  return response.data;
}

/**
 * Create a new issue
 */
export async function createIssue(data: IssueCreate): Promise<Issue> {
  const response = await apiClient.post<Issue>('/issues', data);
  return response.data;
}

/**
 * Update an existing issue
 */
export async function updateIssue(id: number, data: IssueUpdate): Promise<Issue> {
  const response = await apiClient.put<Issue>(`/issues/${id}`, data);
  return response.data;
}

/**
 * Delete an issue
 */
export async function deleteIssue(id: number): Promise<void> {
  await apiClient.delete(`/issues/${id}`);
}

/**
 * Update issue status
 */
export async function updateIssueStatus(id: number, status: string): Promise<Issue> {
  const response = await apiClient.patch<Issue>(
    `/issues/${id}/status`,
    null, // 1. JSON 본문(body)을 null로 비웁니다.
    {
      params: { status }, // 2. 데이터를 쿼리 파라미터로 보냅니다.
    },
  );
  return response.data;
}

/**
 * Assign issue to a user
 */
export async function assignIssue(id: number, assignee_id: number | null): Promise<Issue> {
  const response = await apiClient.patch<Issue>(`/issues/${id}/assign`, {
    assignee_id,
  });
  return response.data;
}

/**
 * Move issue to a sprint
 */
export async function moveIssueToSprint(id: number, sprint_id: number | null): Promise<Issue> {
  const response = await apiClient.patch<Issue>(`/issues/${id}/sprint`, {
    sprint_id,
  });
  return response.data;
}

/**
 * Get issues by project
 */
export async function getIssuesByProject(
  projectId: number,
  params?: QueryParams,
): Promise<PaginatedResponse<Issue>> {
  const response = await apiClient.get<PaginatedResponse<Issue>>('/issues', {
    params: { ...params, project_id: projectId },
  });
  return response.data;
}

/**
 * Get issues by sprint
 */

export async function getIssuesBySprint(
  sprintId: number,
  params?: QueryParams,
): Promise<PaginatedResponse<Issue>> {
  // 기존 params에 sprint_id를 쿼리 파라미터로 추가
  const combinedParams: QueryParams = {
    ...params,
    sprint_id: sprintId,
  };

  const response = await apiClient.get<PaginatedResponse<Issue>>(
    '/issues', // 올바른 엔드포인트
    { params: combinedParams }, // 쿼리 파라미터로 전달
  );
  return response.data;
}

/**
 * Get issues assigned to current user
 */
export async function getMyIssues(params?: QueryParams): Promise<PaginatedResponse<Issue>> {
  const response = await apiClient.get<PaginatedResponse<Issue>>('/issues/my', { params });
  return response.data;
}
