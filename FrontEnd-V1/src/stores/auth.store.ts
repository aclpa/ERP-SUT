// ============================================
// Authentication Store - Pinia
// ============================================

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User } from 'src/types/models.types';
import * as authApi from 'src/api/auth.api';

// ============================================
// Auth Store
// ============================================

export const useAuthStore = defineStore('auth', () => {
  // ============================================
  // State
  // ============================================

  const user = ref<User | null>(null);
  const accessToken = ref<string | null>(null);
  const refreshToken = ref<string | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // ============================================
  // Getters
  // ============================================

  const isAuthenticated = computed(() => !!accessToken.value && !!user.value);

  const isSuperuser = computed(() => user.value?.is_admin || user.value?.is_superuser || false);

  const userFullName = computed(() => {
    if (!user.value) return '';
    return user.value.full_name || user.value.username || user.value.email;
  });

  const userInitials = computed(() => {
    if (!user.value) return '';
    const name = userFullName.value;
    const parts = name.split(' ');
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  });

  // ============================================
  // Actions
  // ============================================

  /**
   * Initialize auth state from localStorage
   */
  function initAuth() {
    const storedToken = localStorage.getItem('access_token');
    const storedRefreshToken = localStorage.getItem('refresh_token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      accessToken.value = storedToken;
      refreshToken.value = storedRefreshToken;
      try {
        user.value = JSON.parse(storedUser);
      } catch (e) {
        console.error('Failed to parse stored user:', e);
        clearAuth();
      }
    }
  }

  /**
   * Login with email and password
   */
  async function login(email: string, password: string) {
    isLoading.value = true;
    error.value = null;

    // (기존 로그인 로직)
    try {
      const response = await authApi.login({ email, password });

      // Store tokens
      accessToken.value = response.access_token;
      refreshToken.value = response.refresh_token;

      // Persist tokens to localStorage
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);

      // Fetch user info from /api/v1/auth/me
      const fetchedUser = await authApi.getCurrentUser();
      user.value = fetchedUser;
      localStorage.setItem('user', JSON.stringify(fetchedUser));

      return response;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Logout
   */
  async function logout() {
    isLoading.value = true;
    error.value = null;

    try {
      // Call logout endpoint (optional - to invalidate token on server)
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
      // Continue with local logout even if server call fails
    } finally {
      clearAuth();
      isLoading.value = false;
    }
  }

  /**
   * Refresh access token
   */
  async function refresh() {
    if (!refreshToken.value) {
      throw new Error('No refresh token available');
    }

    isLoading.value = true;
    error.value = null;

    try {
      const response = await authApi.refreshToken({
        refresh_token: refreshToken.value,
      });

      // Update access token
      accessToken.value = response.access_token;
      localStorage.setItem('access_token', response.access_token);

      return response;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Token refresh failed';
      error.value = message;
      clearAuth();
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetch current user
   */
  async function fetchCurrentUser() {
    if (!accessToken.value) {
      throw new Error('Not authenticated');
    }

    isLoading.value = true;
    error.value = null;

    try {
      const fetchedUser = await authApi.getCurrentUser();
      user.value = fetchedUser;
      localStorage.setItem('user', JSON.stringify(fetchedUser));
      return fetchedUser;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch user';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Get Authentik SSO authorization URL
   */
  async function getAuthUrl() {
    isLoading.value = true;
    error.value = null;

    try {
      const authUrl = await authApi.getAuthUrl();
      return authUrl;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to get auth URL';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Handle Authentik SSO callback
   */
  async function handleAuthCallback(code: string, state?: string) {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await authApi.handleAuthCallback(
        state !== undefined ? { code, state } : { code },
      );

      // Store tokens and user
      accessToken.value = response.access_token;
      refreshToken.value = response.refresh_token;
      user.value = response.user ?? null;

      // Persist to localStorage
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }

      return response;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Auth callback failed';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Verify authentication status
   */
  async function verifyAuth() {
    if (!accessToken.value) {
      return false;
    }

    try {
      return await authApi.verifyAuth();
    } catch {
      clearAuth();
      return false;
    }
  }

  /**
   * Clear authentication state
   */
  function clearAuth() {
    accessToken.value = null;
    refreshToken.value = null;
    user.value = null;
    error.value = null;

    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }

  // ============================================
  // Return
  // ============================================

  return {
    // State
    user,
    accessToken,
    refreshToken,
    isLoading,
    error,

    // Getters
    isAuthenticated,
    isSuperuser,
    userFullName,
    userInitials,

    // Actions
    initAuth,
    login,
    logout,
    refresh,
    fetchCurrentUser,
    getAuthUrl,
    handleAuthCallback,
    verifyAuth,
    clearAuth,
  };
});
