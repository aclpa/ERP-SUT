// ============================================
// UI Store - UI state management (loading, notifications, etc.)
// ============================================

import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { NotificationPayload } from 'src/types/common.types';

export const useUiStore = defineStore('ui', () => {
  // ============================================
  // State
  // ============================================

  const isLoading = ref(false);
  const loadingMessage = ref('');
  const sidebarOpen = ref(true);
  const notifications = ref<NotificationPayload[]>([]);

  // ============================================
  // Actions - Loading
  // ============================================

  function showLoading(message = '로딩 중...') {
    isLoading.value = true;
    loadingMessage.value = message;
  }

  function hideLoading() {
    isLoading.value = false;
    loadingMessage.value = '';
  }

  // ============================================
  // Actions - Sidebar
  // ============================================

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value;
    // Save to localStorage
    localStorage.setItem('sidebarOpen', String(sidebarOpen.value));
  }

  function setSidebarOpen(open: boolean) {
    sidebarOpen.value = open;
    localStorage.setItem('sidebarOpen', String(open));
  }

  function initSidebar() {
    const saved = localStorage.getItem('sidebarOpen');
    if (saved !== null) {
      sidebarOpen.value = saved === 'true';
    }
  }

  // ============================================
  // Actions - Notifications
  // ============================================

  function addNotification(notification: NotificationPayload) {
    notifications.value.push(notification);

    // Auto-remove after timeout
    if (notification.timeout) {
      setTimeout(() => {
        removeNotification(notification);
      }, notification.timeout);
    }
  }

  function removeNotification(notification: NotificationPayload) {
    const index = notifications.value.indexOf(notification);
    if (index > -1) {
      notifications.value.splice(index, 1);
    }
  }

  function clearNotifications() {
    notifications.value = [];
  }

  // ============================================
  // Return
  // ============================================

  return {
    // State
    isLoading,
    loadingMessage,
    sidebarOpen,
    notifications,

    // Actions
    showLoading,
    hideLoading,
    toggleSidebar,
    setSidebarOpen,
    initSidebar,
    addNotification,
    removeNotification,
    clearNotifications,
  };
});
