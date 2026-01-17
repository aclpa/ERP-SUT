// ============================================
// Deployment Store - Pinia
// ============================================

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  Deployment,
  DeploymentCreate,
  DeploymentUpdate,
  DeploymentType,
  DeploymentStatus,
} from 'src/types/models.types';
import type { QueryParams } from 'src/types/api.types';
import * as deploymentsApi from 'src/api/deployments.api';

// ============================================
// Deployment Store
// ============================================

export const useDeploymentStore = defineStore('deployment', () => {
  // ============================================
  // State
  // ============================================

  const deployments = ref<Deployment[]>([]);
  const currentDeployment = ref<Deployment | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Pagination
  const currentPage = ref(1);
  const pageSize = ref(20);
  const totalCount = ref(0);

  // Filters
  const searchQuery = ref('');
  const serviceFilter = ref<number | null>(null);
  const environmentFilter = ref<string>('');
  const typeFilter = ref<DeploymentType | ''>('');
  const statusFilter = ref<DeploymentStatus | ''>('');

  // ============================================
  // Getters
  // ============================================

  const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value));

  const hasDeployments = computed(() => deployments.value.length > 0);

  // Deployments by type
  const manualDeployments = computed(() => deployments.value.filter((d) => d.type === 'manual'));

  const automaticDeployments = computed(() =>
    deployments.value.filter((d) => d.type === 'automatic'),
  );

  const rollbackDeployments = computed(() =>
    deployments.value.filter((d) => d.type === 'rollback'),
  );

  // Deployments by status
  const pendingDeployments = computed(() =>
    deployments.value.filter((d) => d.status === 'pending'),
  );

  const inProgressDeployments = computed(() =>
    deployments.value.filter((d) => d.status === 'in_progress'),
  );

  const successDeployments = computed(() =>
    deployments.value.filter((d) => d.status === 'success'),
  );

  const failedDeployments = computed(() => deployments.value.filter((d) => d.status === 'failed'));

  const rolledBackDeployments = computed(() =>
    deployments.value.filter((d) => d.status === 'rolled_back'),
  );

  // Deployments by environment
  const productionDeployments = computed(() =>
    deployments.value.filter((d) => d.environment === 'production'),
  );

  const stagingDeployments = computed(() =>
    deployments.value.filter((d) => d.environment === 'staging'),
  );

  const developmentDeployments = computed(() =>
    deployments.value.filter((d) => d.environment === 'dev' || d.environment === 'development'),
  );

  // Filtered deployments
  const filteredDeployments = computed(() => {
    let filtered = deployments.value;

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.version.toLowerCase().includes(query) ||
          (d.branch && d.branch.toLowerCase().includes(query)) ||
          (d.tag && d.tag.toLowerCase().includes(query)) ||
          (d.notes && d.notes.toLowerCase().includes(query)),
      );
    }

    if (serviceFilter.value !== null) {
      filtered = filtered.filter((d) => d.service_id === serviceFilter.value);
    }

    if (environmentFilter.value) {
      filtered = filtered.filter((d) => d.environment === environmentFilter.value);
    }

    if (typeFilter.value) {
      filtered = filtered.filter((d) => d.type === typeFilter.value);
    }

    if (statusFilter.value) {
      filtered = filtered.filter((d) => d.status === statusFilter.value);
    }

    return filtered;
  });

  // ============================================
  // Actions
  // ============================================

  /**
   * Fetch deployments with pagination
   */
  async function fetchDeployments(params?: QueryParams) {
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

      // Add filters
      if (serviceFilter.value !== null) {
        queryParams.service_id = serviceFilter.value;
      }

      if (environmentFilter.value) {
        queryParams.environment = environmentFilter.value;
      }

      if (typeFilter.value) {
        queryParams.type = typeFilter.value;
      }

      if (statusFilter.value) {
        queryParams.status = statusFilter.value;
      }

      const response = await deploymentsApi.listDeployments(queryParams);

      deployments.value = response.items;
      totalCount.value = response.total;
      currentPage.value = response.page;
      pageSize.value = response.size;

      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch deployments';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetch a single deployment by ID
   */
  async function fetchDeployment(id: number) {
    isLoading.value = true;
    error.value = null;

    try {
      const deployment = await deploymentsApi.getDeployment(id);
      currentDeployment.value = deployment;
      return deployment;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch deployment';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Create a new deployment
   */
  async function createDeployment(data: DeploymentCreate) {
    isLoading.value = true;
    error.value = null;

    try {
      const deployment = await deploymentsApi.createDeployment(data);
      deployments.value.unshift(deployment);
      totalCount.value += 1;
      return deployment;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create deployment';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Update an existing deployment
   */
  async function updateDeployment(id: number, data: DeploymentUpdate) {
    isLoading.value = true;
    error.value = null;

    try {
      const deployment = await deploymentsApi.updateDeployment(id, data);

      // Update in list
      const index = deployments.value.findIndex((d) => d.id === id);
      if (index !== -1) {
        deployments.value[index] = deployment;
      }

      // Update current deployment if it's the same
      if (currentDeployment.value?.id === id) {
        currentDeployment.value = deployment;
      }

      return deployment;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update deployment';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Delete a deployment
   */
  async function deleteDeployment(id: number) {
    isLoading.value = true;
    error.value = null;

    try {
      await deploymentsApi.deleteDeployment(id);

      // Remove from list
      deployments.value = deployments.value.filter((d) => d.id !== id);
      totalCount.value -= 1;

      // Clear current deployment if it's the same
      if (currentDeployment.value?.id === id) {
        currentDeployment.value = null;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete deployment';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Update deployment status
   */
  async function updateStatus(id: number, status: DeploymentStatus) {
    isLoading.value = true;
    error.value = null;

    try {
      const deployment = await deploymentsApi.updateDeploymentStatus(id, status);

      // Update in list
      const index = deployments.value.findIndex((d) => d.id === id);
      if (index !== -1) {
        deployments.value[index] = deployment;
      }

      // Update current deployment if it's the same
      if (currentDeployment.value?.id === id) {
        currentDeployment.value = deployment;
      }

      return deployment;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update deployment status';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Rollback to a previous deployment
   */
  async function rollbackDeployment(id: number, targetDeploymentId: number, notes?: string) {
    isLoading.value = true;
    error.value = null;

    try {
      const deployment = await deploymentsApi.rollbackDeployment(id, targetDeploymentId, notes);

      // Add to list
      deployments.value.unshift(deployment);
      totalCount.value += 1;

      return deployment;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to rollback deployment';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetch deployments by service
   */
  async function fetchDeploymentsByService(serviceId: number, params?: QueryParams) {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await deploymentsApi.getDeploymentsByService(serviceId, params);
      deployments.value = response.items;
      totalCount.value = response.total;
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch deployments by service';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetch deployments by environment
   */
  async function fetchDeploymentsByEnvironment(environment: string, params?: QueryParams) {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await deploymentsApi.getDeploymentsByEnvironment(environment, params);
      deployments.value = response.items;
      totalCount.value = response.total;
      return response;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch deployments by environment';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetch deployments by status
   */
  async function fetchDeploymentsByStatus(status: DeploymentStatus, params?: QueryParams) {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await deploymentsApi.getDeploymentsByStatus(status, params);
      deployments.value = response.items;
      totalCount.value = response.total;
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch deployments by status';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetch deployments by type
   */
  async function fetchDeploymentsByType(type: DeploymentType, params?: QueryParams) {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await deploymentsApi.getDeploymentsByType(type, params);
      deployments.value = response.items;
      totalCount.value = response.total;
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch deployments by type';
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
    currentPage.value = 1;
  }

  /**
   * Set service filter
   */
  function setServiceFilter(serviceId: number | null) {
    serviceFilter.value = serviceId;
    currentPage.value = 1;
  }

  /**
   * Set environment filter
   */
  function setEnvironmentFilter(environment: string) {
    environmentFilter.value = environment;
    currentPage.value = 1;
  }

  /**
   * Set type filter
   */
  function setTypeFilter(type: DeploymentType | '') {
    typeFilter.value = type;
    currentPage.value = 1;
  }

  /**
   * Set status filter
   */
  function setStatusFilter(status: DeploymentStatus | '') {
    statusFilter.value = status;
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
    serviceFilter.value = null;
    environmentFilter.value = '';
    typeFilter.value = '';
    statusFilter.value = '';
    currentPage.value = 1;
  }

  /**
   * Clear current deployment
   */
  function clearCurrentDeployment() {
    currentDeployment.value = null;
  }

  /**
   * Clear all state
   */
  function clearAll() {
    deployments.value = [];
    currentDeployment.value = null;
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
    deployments,
    currentDeployment,
    isLoading,
    error,
    currentPage,
    pageSize,
    totalCount,
    searchQuery,
    serviceFilter,
    environmentFilter,
    typeFilter,
    statusFilter,

    // Getters
    totalPages,
    hasDeployments,
    manualDeployments,
    automaticDeployments,
    rollbackDeployments,
    pendingDeployments,
    inProgressDeployments,
    successDeployments,
    failedDeployments,
    rolledBackDeployments,
    productionDeployments,
    stagingDeployments,
    developmentDeployments,
    filteredDeployments,

    // Actions
    fetchDeployments,
    fetchDeployment,
    createDeployment,
    updateDeployment,
    deleteDeployment,
    updateStatus,
    rollbackDeployment,
    fetchDeploymentsByService,
    fetchDeploymentsByEnvironment,
    fetchDeploymentsByStatus,
    fetchDeploymentsByType,
    setSearchQuery,
    setServiceFilter,
    setEnvironmentFilter,
    setTypeFilter,
    setStatusFilter,
    setPage,
    setPageSize,
    clearFilters,
    clearCurrentDeployment,
    clearAll,
  };
});
