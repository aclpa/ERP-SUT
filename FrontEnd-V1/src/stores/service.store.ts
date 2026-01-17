// ============================================
// Service Store - Pinia
// ============================================

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  Service,
  ServiceCreate,
  ServiceUpdate,
  ServiceType,
  ServiceStatus,
} from 'src/types/models.types';
import type { QueryParams } from 'src/types/api.types';
import * as servicesApi from 'src/api/services.api';

// ============================================
// Service Store
// ============================================

export const useServiceStore = defineStore('service', () => {
  // ============================================
  // State
  // ============================================

  const services = ref<Service[]>([]);
  const currentService = ref<Service | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Pagination
  const currentPage = ref(1);
  const pageSize = ref(20);
  const totalCount = ref(0);

  // Filters
  const searchQuery = ref('');
  const serverFilter = ref<number | null>(null);
  const typeFilter = ref<ServiceType | ''>('');
  const statusFilter = ref<ServiceStatus | ''>('');

  // ============================================
  // Getters
  // ============================================

  const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value));

  const hasServices = computed(() => services.value.length > 0);

  // Services by type
  const webServices = computed(() => services.value.filter((s) => s.type === 'web'));

  const apiServices = computed(() => services.value.filter((s) => s.type === 'api'));

  const databaseServices = computed(() => services.value.filter((s) => s.type === 'database'));

  const cacheServices = computed(() => services.value.filter((s) => s.type === 'cache'));

  const queueServices = computed(() => services.value.filter((s) => s.type === 'queue'));

  const workerServices = computed(() => services.value.filter((s) => s.type === 'worker'));

  const cronServices = computed(() => services.value.filter((s) => s.type === 'cron'));

  // Services by status
  const runningServices = computed(() => services.value.filter((s) => s.status === 'running'));

  const stoppedServices = computed(() => services.value.filter((s) => s.status === 'stopped'));

  // Filtered services
  const filteredServices = computed(() => {
    let filtered = services.value;

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          (s.description && s.description.toLowerCase().includes(query)) ||
          (s.url && s.url.toLowerCase().includes(query))
      );
    }

    if (serverFilter.value !== null) {
      filtered = filtered.filter((s) => s.server_id === serverFilter.value);
    }

    if (typeFilter.value) {
      filtered = filtered.filter((s) => s.type === typeFilter.value);
    }

    if (statusFilter.value) {
      filtered = filtered.filter((s) => s.status === statusFilter.value);
    }

    return filtered;
  });

  // ============================================
  // Actions
  // ============================================

  /**
   * Fetch services with pagination
   */
  async function fetchServices(params?: QueryParams) {
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
      if (serverFilter.value !== null) {
        queryParams.server_id = serverFilter.value;
      }

      if (typeFilter.value) {
        queryParams.type = typeFilter.value;
      }

      if (statusFilter.value) {
        queryParams.status = statusFilter.value;
      }

      const response = await servicesApi.listServices(queryParams);

      services.value = response.items;
      totalCount.value = response.total;
      currentPage.value = response.page;
      pageSize.value = response.size;

      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch services';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetch a single service by ID
   */
  async function fetchService(id: number) {
    isLoading.value = true;
    error.value = null;

    try {
      const service = await servicesApi.getService(id);
      currentService.value = service;
      return service;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch service';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Create a new service
   */
  async function createService(data: ServiceCreate) {
    isLoading.value = true;
    error.value = null;

    try {
      const service = await servicesApi.createService(data);
      services.value.unshift(service);
      totalCount.value += 1;
      return service;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create service';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Update an existing service
   */
  async function updateService(id: number, data: ServiceUpdate) {
    isLoading.value = true;
    error.value = null;

    try {
      const service = await servicesApi.updateService(id, data);

      // Update in list
      const index = services.value.findIndex((s) => s.id === id);
      if (index !== -1) {
        services.value[index] = service;
      }

      // Update current service if it's the same
      if (currentService.value?.id === id) {
        currentService.value = service;
      }

      return service;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update service';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Delete a service
   */
  async function deleteService(id: number) {
    isLoading.value = true;
    error.value = null;

    try {
      await servicesApi.deleteService(id);

      // Remove from list
      services.value = services.value.filter((s) => s.id !== id);
      totalCount.value -= 1;

      // Clear current service if it's the same
      if (currentService.value?.id === id) {
        currentService.value = null;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete service';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Update service status
   */
  async function updateStatus(id: number, status: ServiceStatus) {
    isLoading.value = true;
    error.value = null;

    try {
      const service = await servicesApi.updateServiceStatus(id, status);

      // Update in list
      const index = services.value.findIndex((s) => s.id === id);
      if (index !== -1) {
        services.value[index] = service;
      }

      // Update current service if it's the same
      if (currentService.value?.id === id) {
        currentService.value = service;
      }

      return service;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update service status';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetch services by server
   */
  async function fetchServicesByServer(serverId: number, params?: QueryParams) {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await servicesApi.getServicesByServer(serverId, params);
      services.value = response.items;
      totalCount.value = response.total;
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch services by server';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetch services by type
   */
  async function fetchServicesByType(type: ServiceType, params?: QueryParams) {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await servicesApi.getServicesByType(type, params);
      services.value = response.items;
      totalCount.value = response.total;
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch services by type';
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
   * Set server filter
   */
  function setServerFilter(serverId: number | null) {
    serverFilter.value = serverId;
    currentPage.value = 1;
  }

  /**
   * Set type filter
   */
  function setTypeFilter(type: ServiceType | '') {
    typeFilter.value = type;
    currentPage.value = 1;
  }

  /**
   * Set status filter
   */
  function setStatusFilter(status: ServiceStatus | '') {
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
    serverFilter.value = null;
    typeFilter.value = '';
    statusFilter.value = '';
    currentPage.value = 1;
  }

  /**
   * Clear current service
   */
  function clearCurrentService() {
    currentService.value = null;
  }

  /**
   * Clear all state
   */
  function clearAll() {
    services.value = [];
    currentService.value = null;
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
    services,
    currentService,
    isLoading,
    error,
    currentPage,
    pageSize,
    totalCount,
    searchQuery,
    serverFilter,
    typeFilter,
    statusFilter,

    // Getters
    totalPages,
    hasServices,
    webServices,
    apiServices,
    databaseServices,
    cacheServices,
    queueServices,
    workerServices,
    cronServices,
    runningServices,
    stoppedServices,
    filteredServices,

    // Actions
    fetchServices,
    fetchService,
    createService,
    updateService,
    deleteService,
    updateStatus,
    fetchServicesByServer,
    fetchServicesByType,
    setSearchQuery,
    setServerFilter,
    setTypeFilter,
    setStatusFilter,
    setPage,
    setPageSize,
    clearFilters,
    clearCurrentService,
    clearAll,
  };
});
