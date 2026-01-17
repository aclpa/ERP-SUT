// ============================================
// Teams API - Team management endpoints
// ============================================

import apiClient from './client';
import type {
  Team,
  TeamCreate,
  TeamUpdate,
  TeamMember,
  TeamMemberCreate,
  TeamMemberUpdate,
} from 'src/types/models.types';
import type { PaginatedResponse, QueryParams } from 'src/types/api.types';

// ============================================
// Team CRUD Operations
// ============================================

/**
 * Get paginated list of teams
 */
export async function listTeams(params?: QueryParams): Promise<PaginatedResponse<Team>> {
  const response = await apiClient.get<PaginatedResponse<Team>>('/teams', { params });
  return response.data;
}

/**
 * Get a single team by ID
 */
export async function getTeam(id: number): Promise<Team> {
  const response = await apiClient.get<Team>(`/teams/${id}`);
  return response.data;
}

/**
 * Create a new team
 */
export async function createTeam(data: TeamCreate): Promise<Team> {
  const response = await apiClient.post<Team>('/teams', data);
  return response.data;
}

/**
 * Update an existing team
 */
export async function updateTeam(id: number, data: TeamUpdate): Promise<Team> {
  const response = await apiClient.put<Team>(`/teams/${id}`, data);
  return response.data;
}

/**
 * Delete a team
 */
export async function deleteTeam(id: number): Promise<void> {
  await apiClient.delete(`/teams/${id}`);
}

// ============================================
// Team Member Operations
// ============================================

/**
 * Get team members
 */
export async function getTeamMembers(
  teamId: number,
  params?: QueryParams,
): Promise<PaginatedResponse<TeamMember>> {
  const response = await apiClient.get<PaginatedResponse<TeamMember>>(`/teams/${teamId}/members`, {
    params,
  });
  return response.data;
}

/**
 * Add a member to a team
 */
export async function addTeamMember(teamId: number, data: TeamMemberCreate): Promise<TeamMember> {
  const response = await apiClient.post<TeamMember>(`/teams/${teamId}/members`, data);
  return response.data;
}

/**
 * Update a team member's role
 */
export async function updateTeamMember(
  teamId: number,
  memberId: number,
  data: TeamMemberUpdate,
): Promise<TeamMember> {
  const response = await apiClient.patch<TeamMember>(`/teams/${teamId}/members/${memberId}/role`, {
    role: data.role,
  });
  return response.data;
}

/**
 * Remove a member from a team
 */
export async function removeTeamMember(teamId: number, memberId: number): Promise<void> {
  await apiClient.delete(`/teams/${teamId}/members/${memberId}`);
}

// ============================================
// Additional Team Queries
// ============================================

/**
 * Get teams that the current user is a member of
 */
export async function getMyTeams(params?: QueryParams): Promise<PaginatedResponse<Team>> {
  const response = await apiClient.get<PaginatedResponse<Team>>('/teams/my', { params });
  return response.data;
}

/**
 * Get team statistics
 */
export async function getTeamStats(teamId: number): Promise<{
  member_count: number;
  project_count: number;
  active_sprint_count: number;
  total_issues: number;
}> {
  const response = await apiClient.get(`/teams/${teamId}/stats`);
  return response.data;
}
