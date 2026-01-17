// ============================================
// Sprint Store - Pinia
// ============================================

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Sprint, SprintCreate, SprintUpdate, SprintStatus } from 'src/types/models.types';
import type { QueryParams } from 'src/types/api.types';
import * as sprintsApi from 'src/api/sprints.api';

// ============================================
// Sprint Store
// ============================================

export const useSprintStore = defineStore('sprint', () => {
  // ============================================
  // State
  // ============================================

  const sprints = ref<Sprint[]>([]);
  const currentSprint = ref<Sprint | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Pagination
  const currentPage = ref(1);
  const pageSize = ref(20);
  const totalCount = ref(0);

  // Filters
  const searchQuery = ref('');
  const statusFilter = ref<SprintStatus | ''>('');
  const projectFilter = ref<number | null>(null);

  // ============================================
  // Getters
  // ============================================

  const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value));

  const hasSprints = computed(() => sprints.value.length > 0);

  const activeSprints = computed(() =>
    sprints.value.filter((s) => s.status === 'active')
  );

  const plannedSprints = computed(() =>
    sprints.value.filter((s) => s.status === 'planning')
  );

  const completedSprints = computed(() =>
    sprints.value.filter((s) => s.status === 'completed')
  );

  const filteredSprints = computed(() => {
    let filtered = sprints.value;

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.goal?.toLowerCase().includes(query)
      );
    }

    if (statusFilter.value) {
      filtered = filtered.filter((s) => s.status === statusFilter.value);
    }

    if (projectFilter.value) {
      filtered = filtered.filter((s) => s.project_id === projectFilter.value);
    }

    return filtered;
  });

  // ============================================
  // Actions
  // ============================================

  /**
   * Fetch sprints with pagination
   */
  async function fetchSprints(params?: QueryParams) {
    isLoading.value = true;
    error.value = null;

    try {
      const queryParams: QueryParams = {
        page: currentPage.value,
        size: pageSize.value,
        ...params,
      };

      // Add search if not empty
      if (searchQuery.value) {
        queryParams.search = searchQuery.value;
      }

      // Add status filter if set
      if (statusFilter.value) {
        queryParams.status = statusFilter.value;
      }

      // Add project filter if set
      if (projectFilter.value) {
        queryParams.project_id = projectFilter.value;
      }

      const response = await sprintsApi.listSprints(queryParams);

      sprints.value = response.items;
      totalCount.value = response.total;
      currentPage.value = response.page;
      pageSize.value = response.size;

      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch sprints';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetch a single sprint by ID
   */
  async function fetchSprint(id: number) {
    isLoading.value = true;
    error.value = null;

    try {
      const sprint = await sprintsApi.getSprint(id);
      currentSprint.value = sprint;
      return sprint;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch sprint';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Create a new sprint
   */
  async function createSprint(data: SprintCreate) {
    isLoading.value = true;
    error.value = null;

    try {
      const sprint = await sprintsApi.createSprint(data);
      sprints.value.unshift(sprint);
      totalCount.value += 1;
      return sprint;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create sprint';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Update an existing sprint
   */
  async function updateSprint(id: number, data: SprintUpdate) {
    isLoading.value = true;
    error.value = null;

    try {
      const sprint = await sprintsApi.updateSprint(id, data);

      // Update in list
      const index = sprints.value.findIndex((s) => s.id === id);
      if (index !== -1) {
        sprints.value[index] = sprint;
      }

      // Update current sprint if it's the same
      if (currentSprint.value?.id === id) {
        currentSprint.value = sprint;
      }

      return sprint;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update sprint';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Delete a sprint
   */
  async function deleteSprint(id: number) {
    isLoading.value = true;
    error.value = null;

    try {
      await sprintsApi.deleteSprint(id);

      // Remove from list
      sprints.value = sprints.value.filter((s) => s.id !== id);
      totalCount.value -= 1;

      // Clear current sprint if it's the same
      if (currentSprint.value?.id === id) {
        currentSprint.value = null;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete sprint';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Start a sprint
   */
  async function startSprint(id: number) {
    isLoading.value = true;
    error.value = null;

    try {
      const sprint = await sprintsApi.startSprint(id);

      // Update in list
      const index = sprints.value.findIndex((s) => s.id === id);
      if (index !== -1) {
        sprints.value[index] = sprint;
      }

      // Update current sprint if it's the same
      if (currentSprint.value?.id === id) {
        currentSprint.value = sprint;
      }

      return sprint;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start sprint';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Complete a sprint
   */
  async function completeSprint(id: number) {
    isLoading.value = true;
    error.value = null;

    try {
      const sprint = await sprintsApi.completeSprint(id);

      // Update in list
      const index = sprints.value.findIndex((s) => s.id === id);
      if (index !== -1) {
        sprints.value[index] = sprint;
      }

      // Update current sprint if it's the same
      if (currentSprint.value?.id === id) {
        currentSprint.value = sprint;
      }

      return sprint;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to complete sprint';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetch sprints by project
   */
  async function fetchSprintsByProject(projectId: number, params?: QueryParams) {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await sprintsApi.getSprintsByProject(projectId, params);
      sprints.value = response.items;
      totalCount.value = response.total;
      return response;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch project sprints';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Set search query
   */
  function setSearchQuery(query: string) {
    searchQuery.value = query;
    currentPage.value = 1; // Reset to first page
  }

  /**
   * Set status filter
   */
  function setStatusFilter(status: SprintStatus | '') {
    statusFilter.value = status;
    currentPage.value = 1;
  }

  /**
   * Set project filter
   */
  function setProjectFilter(projectId: number | null) {
    projectFilter.value = projectId;
    currentPage.value = 1;
  }

  /**
   * Set current page
   */
  function setPage(page: number) {
    currentPage.value = page;
  }

  /**
   * Set page size
   */
  function setPageSize(size: number) {
    pageSize.value = size;
    currentPage.value = 1;
  }

  /**
   * Clear filters
   */
  function clearFilters() {
    searchQuery.value = '';
    statusFilter.value = '';
    projectFilter.value = null;
    currentPage.value = 1;
  }

  /**
   * Clear current sprint
   */
  function clearCurrentSprint() {
    currentSprint.value = null;
  }

  /**
   * Clear all state
   */
  function clearAll() {
    sprints.value = [];
    currentSprint.value = null;
    isLoading.value = false;
    error.value = null;
    currentPage.value = 1;
    pageSize.value = 20;
    totalCount.value = 0;
    clearFilters();
  }

  // ============================================
  // Return
  // ============================================

  return {
    // State
    sprints,
    currentSprint,
    isLoading,
    error,
    currentPage,
    pageSize,
    totalCount,
    searchQuery,
    statusFilter,
    projectFilter,

    // Getters
    totalPages,
    hasSprints,
    activeSprints,
    plannedSprints,
    completedSprints,
    filteredSprints,

    // Actions
    fetchSprints,
    fetchSprint,
    createSprint,
    updateSprint,
    deleteSprint,
    startSprint,
    completeSprint,
    fetchSprintsByProject,
    setSearchQuery,
    setStatusFilter,
    setProjectFilter,
    setPage,
    setPageSize,
    clearFilters,
    clearCurrentSprint,
    clearAll,
  };
});
