// ============================================
// useFilters Composable - Filtering logic
// ============================================

import { ref, computed } from 'vue';

export interface FilterConfig {
  [key: string]: unknown;
}

export function useFilters<T extends FilterConfig>(
  initialFilters: T = {} as T
) {
  // ============================================
  // State
  // ============================================

  const filters = ref<T>({ ...initialFilters });
  const search = ref('');

  // ============================================
  // Computed
  // ============================================

  const hasActiveFilters = computed(() => {
    // Check if any filter has a non-empty value
    return Object.values(filters.value).some((value) => {
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'string') return value.length > 0;
      if (typeof value === 'number') return value !== 0;
      return value !== null && value !== undefined;
    });
  });

  const activeFilterCount = computed(() => {
    let count = 0;
    Object.values(filters.value).forEach((value) => {
      if (Array.isArray(value) && value.length > 0) count++;
      else if (typeof value === 'string' && value.length > 0) count++;
      else if (typeof value === 'number' && value !== 0) count++;
      else if (value !== null && value !== undefined) count++;
    });
    return count;
  });

  const filterParams = computed(() => {
    const params: Record<string, unknown> = {};

    // Add search
    if (search.value) {
      params.search = search.value;
    }

    // Add filters
    Object.entries(filters.value).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        params[key] = value.join(',');
      } else if (value !== null && value !== undefined && value !== '') {
        params[key] = value;
      }
    });

    return params;
  });

  // ============================================
  // Methods
  // ============================================

  function setFilter<K extends keyof T>(key: K, value: T[K]) {
    filters.value[key] = value;
  }

  function clearFilter<K extends keyof T>(key: K) {
    if (Array.isArray(filters.value[key])) {
      filters.value[key] = [] as T[K];
    } else if (typeof filters.value[key] === 'string') {
      filters.value[key] = '' as T[K];
    } else {
      filters.value[key] = null as T[K];
    }
  }

  function clearAllFilters() {
    Object.keys(filters.value).forEach((key) => {
      clearFilter(key as keyof T);
    });
    search.value = '';
  }

  function setSearch(value: string) {
    search.value = value;
  }

  function clearSearch() {
    search.value = '';
  }

  function reset() {
    filters.value = { ...initialFilters };
    search.value = '';
  }

  function updateFilters(newFilters: Partial<T>) {
    filters.value = { ...filters.value, ...newFilters };
  }

  // ============================================
  // Return
  // ============================================

  return {
    // State
    filters,
    search,

    // Computed
    hasActiveFilters,
    activeFilterCount,
    filterParams,

    // Methods
    setFilter,
    clearFilter,
    clearAllFilters,
    setSearch,
    clearSearch,
    reset,
    updateFilters,
  };
}
