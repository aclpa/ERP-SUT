// ============================================
// Common Types - Shared type definitions
// ============================================

/**
 * Common entity base fields
 */
export interface BaseEntity {
  id: number;
  created_at: string;
  updated_at: string;
}

/**
 * Timestamp fields
 */
export interface Timestamps {
  created_at: string;
  updated_at: string;
}

/**
 * Loading state
 */
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

/**
 * Dialog state
 */
export interface DialogState {
  isOpen: boolean;
  mode: 'create' | 'edit' | 'view';
  data: unknown;
}

/**
 * Table column definition
 */
export interface TableColumn {
  name: string;
  label: string;
  field: string | ((row: unknown) => unknown);
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  required?: boolean;
  format?: (val: unknown, row: unknown) => string;
  style?: string | ((row: unknown) => string);
  classes?: string | ((row: unknown) => string);
}

/**
 * Notification payload
 */
export interface NotificationPayload {
  type: 'positive' | 'negative' | 'warning' | 'info';
  message: string;
  caption?: string;
  timeout?: number;
}

/**
 * Breadcrumb item
 */
export interface BreadcrumbItem {
  label: string;
  icon?: string;
  to?: string;
}
