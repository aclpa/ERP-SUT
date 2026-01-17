// ============================================
// API Types - Common API request/response types
// ============================================

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  status?: number;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

/**
 * API Error response
 */
export interface ApiError {
  message: string;
  detail?: string | undefined;
  status: number;
  errors?: Record<string, string[]> | undefined;
}

/**
 * Query parameters for list endpoints
 */
export interface QueryParams {
  page?: number;
  size?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  [key: string]: string | number | boolean | undefined;
}

/**
 * Filter options
 */
export interface FilterOption {
  label: string;
  value: string | number | boolean;
  icon?: string;
}

/**
 * Sort options
 */
export interface SortOption {
  label: string;
  value: string;
  order?: 'asc' | 'desc';
}

/**
 * Select option for dropdowns
 */
export interface SelectOption<T = string | number> {
  label: string;
  value: T;
  icon?: string;
  disabled?: boolean;
}
