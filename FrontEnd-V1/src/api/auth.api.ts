// ============================================
// Authentication API Module
// ============================================

import apiClient from './client';
import type { User } from 'src/types/models.types';

// ============================================
// Types
// ============================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user?: User; // Optional - filled by getCurrentUser after login
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface AuthCallbackRequest {
  code: string;
  state?: string;
}

// ============================================
// API Functions
// ============================================

/**
 * Login with email and password
 */
export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/auth/login', data);
  return response.data;
}

/**
 * Logout (invalidate token)
 */
export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}

/**
 * Refresh access token
 */
export async function refreshToken(data: RefreshTokenRequest): Promise<RefreshTokenResponse> {
  const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh', data);
  return response.data;
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser(): Promise<User> {
  const response = await apiClient.get<User>('/auth/me');
  return response.data;
}

/**
 * Get Authentik SSO authorization URL
 */
export async function getAuthUrl(): Promise<string> {
  const response = await apiClient.get<{ auth_url: string }>('/auth/authorize');
  return response.data.auth_url;
}

/**
 * Handle Authentik SSO callback
 */
export async function handleAuthCallback(data: AuthCallbackRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>('/auth/callback', data);
  return response.data;
}

/**
 * Verify if user is authenticated (check token validity)
 */
export async function verifyAuth(): Promise<boolean> {
  try {
    await apiClient.get('/auth/verify');
    return true;
  } catch {
    return false;
  }
}
