// ============================================
// useAuth Composable - Authentication logic wrapper
// ============================================

import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth.store';
import { useNotify } from './useNotify';

export function useAuth() {
  const authStore = useAuthStore();
  const router = useRouter();
  const { notifySuccess, notifyError } = useNotify();

  // ============================================
  // Computed
  // ============================================

  const user = computed(() => authStore.user);
  const isAuthenticated = computed(() => authStore.isAuthenticated);
  const isSuperuser = computed(() => authStore.isSuperuser);
  const isLoading = computed(() => authStore.isLoading);
  const userFullName = computed(() => authStore.userFullName);
  const userInitials = computed(() => authStore.userInitials);

  // ============================================
  // Methods
  // ============================================

  /**
   * Login with email and password
   */
  async function login(email: string, password: string) {
    try {
      await authStore.login(email, password);
      notifySuccess('로그인 성공', '환영합니다!');

      // Redirect to intended page or dashboard
      const redirect = router.currentRoute.value.query.redirect as string;
      await router.push(redirect || '/dashboard');
    } catch (error) {
      notifyError(
        '로그인 실패',
        error instanceof Error ? error.message : '이메일 또는 비밀번호를 확인해주세요.',
      );
      throw error;
    }
  }

  /**
   * Logout
   */
  async function logout() {
    try {
      await authStore.logout();
      notifySuccess('로그아웃', '안전하게 로그아웃되었습니다.');
      await router.push('/auth/login');
    } catch (error) {
      notifyError(
        '로그아웃 실패',
        error instanceof Error ? error.message : '로그아웃 중 오류가 발생했습니다.',
      );
      throw error;
    }
  }

  /**
   * Login with SSO (Authentik)
   */
  async function loginWithSSO() {
    try {
      const authUrl = await authStore.getAuthUrl();
      // Redirect to Authentik login page
      window.location.href = authUrl;
    } catch (error) {
      notifyError(
        'SSO 로그인 실패',
        error instanceof Error ? error.message : 'SSO 로그인 중 오류가 발생했습니다.',
      );
      throw error;
    }
  }

  /**
   * Handle SSO callback
   */
  async function handleSSOCallback(code: string, state?: string) {
    try {
      await authStore.handleAuthCallback(code, state);
      notifySuccess('로그인 성공', '환영합니다!');

      // Redirect to dashboard
      await router.push('/dashboard');
    } catch (error) {
      notifyError(
        'SSO 인증 실패',
        error instanceof Error ? error.message : 'SSO 인증 중 오류가 발생했습니다.',
      );
      //await router.push('/auth/login');
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async function refreshToken() {
    try {
      await authStore.refresh();
    } catch (error) {
      notifyError('토큰 갱신 실패', '다시 로그인해주세요.');
      await router.push('/auth/login');
      throw error;
    }
  }

  /**
   * Check if user has specific role
   * Note: This is a simplified version. You may need to extend this
   * to check team-specific roles from team_members table
   */
  function hasRole(role: string): boolean {
    if (role === 'superuser') {
      return isSuperuser.value;
    }
    // Add more role checks as needed
    return false;
  }

  /**
   * Check if user has any of the specified roles
   */
  function hasAnyRole(roles: string[]): boolean {
    return roles.some((role) => hasRole(role));
  }

  /**
   * Check if user has all of the specified roles
   */
  function hasAllRoles(roles: string[]): boolean {
    return roles.every((role) => hasRole(role));
  }

  // ============================================
  // Return
  // ============================================

  return {
    // State
    user,
    isAuthenticated,
    isSuperuser,
    isLoading,
    userFullName,
    userInitials,

    // Methods
    login,
    logout,
    loginWithSSO,
    handleSSOCallback,
    refreshToken,
    hasRole,
    hasAnyRole,
    hasAllRoles,
  };
}
