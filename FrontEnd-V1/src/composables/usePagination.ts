// ============================================
// usePagination Composable - Pagination logic
// ============================================

import { ref, computed } from 'vue';

export interface PaginationOptions {
  initialPage?: number;
  initialSize?: number;
  pageSizeOptions?: number[];
}

export function usePagination(options: PaginationOptions = {}) {
  const {
    initialPage = 1,
    initialSize = 20,
    pageSizeOptions = [10, 20, 50, 100],
  } = options;

  // ============================================
  // State
  // ============================================

  const page = ref(initialPage);
  const size = ref(initialSize);
  const total = ref(0);

  // ============================================
  // Computed
  // ============================================

  const totalPages = computed(() => Math.ceil(total.value / size.value) || 1);

  const hasNextPage = computed(() => page.value < totalPages.value);

  const hasPrevPage = computed(() => page.value > 1);

  const startIndex = computed(() => (page.value - 1) * size.value + 1);

  const endIndex = computed(() => {
    const end = page.value * size.value;
    return end > total.value ? total.value : end;
  });

  const paginationInfo = computed(() => ({
    page: page.value,
    size: size.value,
    total: total.value,
    totalPages: totalPages.value,
    startIndex: startIndex.value,
    endIndex: endIndex.value,
    hasNextPage: hasNextPage.value,
    hasPrevPage: hasPrevPage.value,
  }));

  // ============================================
  // Methods
  // ============================================

  function setPage(newPage: number) {
    if (newPage >= 1 && newPage <= totalPages.value) {
      page.value = newPage;
    }
  }

  function setSize(newSize: number) {
    size.value = newSize;
    // Reset to first page when size changes
    page.value = 1;
  }

  function setTotal(newTotal: number) {
    total.value = newTotal;
  }

  function nextPage() {
    if (hasNextPage.value) {
      page.value += 1;
    }
  }

  function prevPage() {
    if (hasPrevPage.value) {
      page.value -= 1;
    }
  }

  function firstPage() {
    page.value = 1;
  }

  function lastPage() {
    page.value = totalPages.value;
  }

  function reset() {
    page.value = initialPage;
    size.value = initialSize;
    total.value = 0;
  }

  // ============================================
  // Return
  // ============================================

  return {
    // State
    page,
    size,
    total,
    pageSizeOptions,

    // Computed
    totalPages,
    hasNextPage,
    hasPrevPage,
    startIndex,
    endIndex,
    paginationInfo,

    // Methods
    setPage,
    setSize,
    setTotal,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    reset,
  };
}
