// ============================================
// Deployments API Module
// ============================================

import apiClient from './client';
import type {
  Deployment,
  DeploymentCreate,
  DeploymentUpdate,
  DeploymentStatus,
  DeploymentType,
} from 'src/types/models.types';
import type { PaginatedResponse, QueryParams } from 'src/types/api.types';

/**
 * Get paginated list of deployments
 */
export async function listDeployments(
  params?: QueryParams,
): Promise<PaginatedResponse<Deployment>> {
  const response = await apiClient.get<PaginatedResponse<Deployment>>('/deployments', { params });
  return response.data;
}

/**
 * Get a single deployment by ID
 */
export async function getDeployment(id: number): Promise<Deployment> {
  const response = await apiClient.get<Deployment>(`/deployments/${id}`);
  return response.data;
}

/**
 * Create a new deployment
 */
export async function createDeployment(data: DeploymentCreate): Promise<Deployment> {
  const response = await apiClient.post<Deployment>('/deployments', data);
  return response.data;
}

/**
 * Update an existing deployment
 */
export async function updateDeployment(id: number, data: DeploymentUpdate): Promise<Deployment> {
  const response = await apiClient.put<Deployment>(`/deployments/${id}`, data);
  return response.data;
}

/**
 * Delete a deployment
 */
export async function deleteDeployment(id: number): Promise<void> {
  await apiClient.delete(`/deployments/${id}`);
}

/**
 * Update deployment status
 */
export async function updateDeploymentStatus(
  id: number,
  status: DeploymentStatus,
): Promise<Deployment> {
  const response = await apiClient.patch<Deployment>(`/deployments/${id}/status`, null, {
    params: { status },
  });
  return response.data;
}

/**
 * Rollback to a previous deployment
 */
export async function rollbackDeployment(
  id: number,
  targetDeploymentId: number,
  notes?: string,
): Promise<Deployment> {
  const response = await apiClient.post<Deployment>(
    `/deployments/${targetDeploymentId}/rollback`,
    null,
    { params: { notes } },
  );
  return response.data;
}

/**
 * Get deployments by service
 */
export async function getDeploymentsByService(
  serviceId: number,
  params?: QueryParams,
): Promise<PaginatedResponse<Deployment>> {
  const response = await apiClient.get<PaginatedResponse<Deployment>>(
    `/deployments/service/${serviceId}`,
    { params },
  );
  return response.data;
}

/**
 * Get deployments by environment
 */
export async function getDeploymentsByEnvironment(
  environment: string,
  params?: QueryParams,
): Promise<PaginatedResponse<Deployment>> {
  const response = await apiClient.get<PaginatedResponse<Deployment>>('/deployments', {
    params: { environment, ...params },
  });
  return response.data;
}

/**
 * Get deployments by status
 */
export async function getDeploymentsByStatus(
  status: DeploymentStatus,
  params?: QueryParams,
): Promise<PaginatedResponse<Deployment>> {
  const response = await apiClient.get<PaginatedResponse<Deployment>>('/deployments', {
    params: { status, ...params },
  });
  return response.data;
}

/**
 * Get deployments by type
 */
export async function getDeploymentsByType(
  type: DeploymentType,
  params?: QueryParams,
): Promise<PaginatedResponse<Deployment>> {
  const response = await apiClient.get<PaginatedResponse<Deployment>>('/deployments', {
    params: { type, ...params },
  });
  return response.data;
}
