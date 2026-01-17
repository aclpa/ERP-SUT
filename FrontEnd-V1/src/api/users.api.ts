// src/api/users.api.ts

import apiClient from './client';
// [수정] UserCreate 추가 Import
import type { User, UserCreate, UserUpdate, UserProfile } from 'src/types/models.types';
import type { PaginatedResponse, QueryParams } from 'src/types/api.types';

/**
 * Get paginated list of users
 * GET /api/v1/users
 */
export async function listUsers(params?: QueryParams): Promise<PaginatedResponse<User>> {
  const response = await apiClient.get<PaginatedResponse<User>>('/users', {
    params,
  });
  return response.data;
}

/**
 * Create a new user
 * POST /api/v1/users
 */
export async function createUser(data: UserCreate): Promise<User> {
  // [주의] 백엔드가 authentik_id를 필수로 요구하므로,
  // 사용자가 입력하지 않았을 경우 프론트에서 임시 값을 채워 보냅니다.
  const payload = { ...data };
  if (!payload.authentik_id) {
    // 임시 ID 생성 (실제 운영 시에는 백엔드 수정 권장)
    payload.authentik_id = `local-${Date.now()}`;
  }

  const response = await apiClient.post<User>('/users', payload);
  return response.data;
}

/**
 * Update user information
 * PUT /api/v1/users/{id}
 */
export async function updateUser(id: number, data: UserUpdate): Promise<User> {
  const response = await apiClient.put<User>(`/users/${id}`, data);
  return response.data;
}

/**
 * 사용자 삭제 (DELETE /api/v1/users/{id})
 */
export async function deleteUser(id: number): Promise<void> {
  await apiClient.delete(`/users/${id}`);
}

export async function getUserProfile(): Promise<UserProfile> {
  const response = await apiClient.get<UserProfile>('/users/me/profile');
  return response.data;
}
