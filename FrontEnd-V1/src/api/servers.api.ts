// ============================================
// Servers API Module
// ============================================

import apiClient from './client';
import type {
  Server,
  ServerCreate,
  ServerUpdate,
  ServerEnvironment,
  ServerType,
} from 'src/types/models.types';
import type { PaginatedResponse, QueryParams } from 'src/types/api.types';

/**
 * Get paginated list of servers
 */
export async function listServers(params?: QueryParams): Promise<PaginatedResponse<Server>> {
  const response = await apiClient.get<PaginatedResponse<Server>>('/servers', { params });
  return response.data;
}

/**
 * Get a single server by ID
 */
export async function getServer(id: number): Promise<Server> {
  const response = await apiClient.get<Server>(`/servers/${id}`);
  return response.data;
}

/**
 * Create a new server
 */
export async function createServer(data: ServerCreate): Promise<Server> {
  const response = await apiClient.post<Server>('/servers', data);
  return response.data;
}

/**
 * Update an existing server
 */
export async function updateServer(id: number, data: ServerUpdate): Promise<Server> {
  const response = await apiClient.put<Server>(`/servers/${id}`, data);
  return response.data;
}

/**
 * Delete a server
 */
export async function deleteServer(id: number): Promise<void> {
  await apiClient.delete(`/servers/${id}`);
}

/**
 * Update server status
 */
export async function updateServerStatus(id: number, status: string): Promise<Server> {
  const response = await apiClient.patch<Server>(`/servers/${id}/status`, null, {
    params: { status },
  });
  return response.data;
}

/**
 * Get servers by environment
 */
export async function getServersByEnvironment(
  environment: ServerEnvironment,
  params?: QueryParams,
): Promise<PaginatedResponse<Server>> {
  const response = await apiClient.get<PaginatedResponse<Server>>(
    `/servers/environment/${environment}`,
    { params },
  );
  return response.data;
}

/**
 * Get servers by type
 */
export async function getServersByType(
  type: ServerType,
  params?: QueryParams,
): Promise<PaginatedResponse<Server>> {
  const response = await apiClient.get<PaginatedResponse<Server>>(`/servers/type/${type}`, {
    params,
  });
  return response.data;
}
