// ============================================
// Router Guards - Authentication & Authorization
// ============================================

import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router';
import { useAuthStore } from 'src/stores/auth.store';

// ============================================
// Authentication Guard
// ============================================

/**
 * Guard that requires authentication
 * Redirects to login page if not authenticated
 */
export async function authGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  const authStore = useAuthStore();

  // Initialize auth from localStorage if not already done
  if (!authStore.isAuthenticated) {
    authStore.initAuth();
  }

  // Check if user is authenticated
  if (!authStore.isAuthenticated) {
    // Redirect to login with return URL
    next({
      name: 'login',
      query: { redirect: to.fullPath },
    });
    return;
  }

  // Verify token validity
  const isValid = await authStore.verifyAuth();
  if (!isValid) {
    // Token is invalid, redirect to login
    next({
      name: 'login',
      query: { redirect: to.fullPath },
    });
    return;
  }

  // User is authenticated
  next();
}

// ============================================
// Guest Guard
// ============================================

/**
 * Guard that only allows unauthenticated users
 * Redirects to dashboard if already authenticated
 */
export function guestGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  const authStore = useAuthStore();

  // Initialize auth from localStorage if not already done
  if (!authStore.isAuthenticated) {
    authStore.initAuth();
  }

  // Check if user is authenticated
  if (authStore.isAuthenticated) {
    // Redirect to dashboard if already logged in
    next({ name: 'dashboard' });
    return;
  }

  // User is not authenticated, allow access
  next();
}

// ============================================
// Role-based Guard
// ============================================

/**
 * Guard that requires specific roles
 * Redirects to unauthorized page if user doesn't have required role
 */
export function roleGuard(allowedRoles: string[]) {
  return (
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
    next: NavigationGuardNext,
  ) => {
    const authStore = useAuthStore();

    // Initialize auth from localStorage if not already done
    if (!authStore.isAuthenticated) {
      authStore.initAuth();
    }

    // Check if user is authenticated
    if (!authStore.isAuthenticated) {
      next({
        name: 'login',
        query: { redirect: to.fullPath },
      });
      return;
    }

    // Check if user has required role
    // For now, we only check superuser status
    // You can extend this to check team roles from team_members table
    const isSuperuser = authStore.isSuperuser;

    if (allowedRoles.includes('superuser') && !isSuperuser) {
      // User doesn't have required role
      next({ name: 'unauthorized' });
      return;
    }

    // User has required role
    next();
  };
}

// ============================================
// Superuser Guard
// ============================================

/**
 * Guard that requires superuser permission
 */
export const superuserGuard = roleGuard(['superuser']);
