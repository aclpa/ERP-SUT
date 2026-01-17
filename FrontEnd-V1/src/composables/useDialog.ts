// ============================================
// useDialog Composable - Quasar Dialog wrapper
// ============================================

import { Dialog } from 'quasar';
import type { QDialogOptions } from 'quasar';

export function useDialog() {
  /**
   * Show confirmation dialog
   */
  function confirm(
    message: string,
    options?: Partial<QDialogOptions>
  ): Promise<boolean> {
    return new Promise((resolve) => {
      Dialog.create({
        title: '확인',
        message,
        cancel: {
          label: '취소',
          flat: true,
          color: 'grey-7',
        },
        ok: {
          label: '확인',
          color: 'primary',
        },
        ...options,
      })
        .onOk(() => resolve(true))
        .onCancel(() => resolve(false))
        .onDismiss(() => resolve(false));
    });
  }

  /**
   * Show delete confirmation dialog
   */
  function confirmDelete(
    itemName?: string,
    options?: Partial<QDialogOptions>
  ): Promise<boolean> {
    const message = itemName
      ? `"${itemName}"을(를) 정말 삭제하시겠습니까?`
      : '정말 삭제하시겠습니까?';

    return new Promise((resolve) => {
      Dialog.create({
        title: '삭제 확인',
        message: `${message}\n이 작업은 되돌릴 수 없습니다.`,
        cancel: {
          label: '취소',
          flat: true,
          color: 'grey-7',
        },
        ok: {
          label: '삭제',
          color: 'negative',
        },
        ...options,
      })
        .onOk(() => resolve(true))
        .onCancel(() => resolve(false))
        .onDismiss(() => resolve(false));
    });
  }

  /**
   * Show alert dialog
   */
  function alert(
    message: string,
    title?: string,
    options?: Partial<QDialogOptions>
  ): Promise<void> {
    return new Promise((resolve) => {
      Dialog.create({
        title: title || '알림',
        message,
        ok: {
          label: '확인',
          color: 'primary',
        },
        ...options,
      })
        .onOk(() => resolve())
        .onDismiss(() => resolve());
    });
  }

  /**
   * Show prompt dialog
   */
  function prompt(
    message: string,
    options?: Partial<QDialogOptions>
  ): Promise<string | null> {
    return new Promise((resolve) => {
      Dialog.create({
        title: '입력',
        message,
        prompt: {
          model: '',
          type: 'text',
        },
        cancel: {
          label: '취소',
          flat: true,
          color: 'grey-7',
        },
        ok: {
          label: '확인',
          color: 'primary',
        },
        ...options,
      })
        .onOk((data: string) => resolve(data))
        .onCancel(() => resolve(null))
        .onDismiss(() => resolve(null));
    });
  }

  /**
   * Show custom dialog
   */
  function show(options: QDialogOptions): Promise<unknown> {
    return new Promise((resolve, reject) => {
      Dialog.create(options)
        .onOk((data: unknown) => resolve(data))
        .onCancel(() => reject(new Error('Dialog cancelled')))
        .onDismiss(() => reject(new Error('Dialog dismissed')));
    });
  }

  return {
    confirm,
    confirmDelete,
    alert,
    prompt,
    show,
  };
}
