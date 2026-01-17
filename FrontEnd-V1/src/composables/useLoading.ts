// ============================================
// useLoading Composable - Loading state management
// ============================================

import { ref } from 'vue';
import { Loading, QSpinnerGears } from 'quasar';

export function useLoading() {
  const isLoading = ref(false);

  /**
   * Show global loading spinner
   */
  function showLoading(message?: string) {
    Loading.show({
      spinner: QSpinnerGears,
      message: message || '로딩 중...',
      messageColor: 'white',
      spinnerColor: 'white',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
    });
  }

  /**
   * Hide global loading spinner
   */
  function hideLoading() {
    Loading.hide();
  }

  /**
   * Execute async function with loading state
   */
  async function withLoading<T>(
    fn: () => Promise<T>,
    showGlobal = false,
    message?: string
  ): Promise<T> {
    try {
      isLoading.value = true;
      if (showGlobal) {
        showLoading(message);
      }
      return await fn();
    } finally {
      isLoading.value = false;
      if (showGlobal) {
        hideLoading();
      }
    }
  }

  /**
   * Execute async function with global loading
   */
  async function withGlobalLoading<T>(
    fn: () => Promise<T>,
    message?: string
  ): Promise<T> {
    return withLoading(fn, true, message);
  }

  return {
    isLoading,
    showLoading,
    hideLoading,
    withLoading,
    withGlobalLoading,
  };
}
