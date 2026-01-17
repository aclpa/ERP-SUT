// ============================================
// useNotify Composable - Quasar Notify wrapper
// ============================================

import { Notify } from 'quasar';
import type { QNotifyCreateOptions } from 'quasar';

export function useNotify() {
  /**
   * Show success notification
   */
  function notifySuccess(
    message: string,
    caption?: string,
    options?: Partial<QNotifyCreateOptions>,
  ) {
    Notify.create({
      type: 'positive',
      message,
      ...(caption && { caption }),
      position: 'top',
      timeout: 3000,
      ...options,
    });
  }

  /**
   * Show error notification
   */
  function notifyError(message: string, caption?: string, options?: Partial<QNotifyCreateOptions>) {
    Notify.create({
      type: 'negative',
      message,
      ...(caption && { caption }),
      position: 'top',
      timeout: 5000,
      ...options,
    });
  }

  /**
   * Show warning notification
   */
  function notifyWarning(
    message: string,
    caption?: string,
    options?: Partial<QNotifyCreateOptions>,
  ) {
    Notify.create({
      type: 'warning',
      message,
      ...(caption && { caption }),
      position: 'top',
      timeout: 4000,
      ...options,
    });
  }

  /**
   * Show info notification
   */
  function notifyInfo(message: string, caption?: string, options?: Partial<QNotifyCreateOptions>) {
    Notify.create({
      type: 'info',
      message,
      ...(caption && { caption }),
      position: 'top',
      timeout: 3000,
      ...options,
    });
  }

  /**
   * Show custom notification
   */
  function notify(options: QNotifyCreateOptions) {
    Notify.create(options);
  }

  return {
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    notify,
  };
}
