/**
 * Dashboard API
 * 대시보드 통계 및 요약 정보 API
 */

import apiClient from './client';
import type { Project, Sprint, Issue, Deployment } from 'src/types/models.types';

// ============================================
// Response Types
// ============================================

export interface DashboardStats {
  total_projects: number;
  active_sprints: number;
  open_issues: number;
  my_tasks: number;
}

export interface RecentProjectsResponse {
  items: Project[];
}

export interface MyIssuesResponse {
  items: Issue[];
}

export interface RecentDeploymentsResponse {
  items: Deployment[];
}

// ============================================
// API Functions
// ============================================

/**
 * 대시보드 통계 조회
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await apiClient.get<DashboardStats>('/dashboard/stats');
  return response.data;
}

/**
 * 최근 프로젝트 목록 조회
 */
export async function getRecentProjects(limit: number = 5): Promise<RecentProjectsResponse> {
  const response = await apiClient.get<RecentProjectsResponse>('/dashboard/recent-projects', {
    params: { limit },
  });
  return response.data;
}

/**
 * 현재 활성 스프린트 조회
 */
export async function getActiveSprint(): Promise<Sprint | null> {
  const response = await apiClient.get<Sprint | null>('/dashboard/active-sprint');
  return response.data;
}

/**
 * 내가 담당한 이슈 목록 조회
 */
export async function getMyIssues(limit: number = 10): Promise<MyIssuesResponse> {
  const response = await apiClient.get<MyIssuesResponse>('/dashboard/my-issues', {
    params: { limit },
  });
  return response.data;
}

/**
 * 최근 배포 목록 조회
 */
export async function getRecentDeployments(limit: number = 5): Promise<RecentDeploymentsResponse> {
  const response = await apiClient.get<RecentDeploymentsResponse>('/dashboard/recent-deployments', {
    params: { limit },
  });
  return response.data;
}
