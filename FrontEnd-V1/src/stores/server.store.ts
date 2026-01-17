// ============================================
// Server Store - Pinia
// ============================================

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  Server,
  ServerCreate,
  ServerUpdate,
  ServerEnvironment,
  ServerType,
  ServerStatus,
} from 'src/types/models.types';
import type { QueryParams } from 'src/types/api.types';
import * as serversApi from 'src/api/servers.api';

// ============================================
// Server Store
// ============================================

export const useServerStore = defineStore('server', () => {
  // ============================================
  // State
  // ============================================

  const servers = ref<Server[]>([]);
  const currentServer = ref<Server | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Pagination
  const currentPage = ref(1);
  const pageSize = ref(20);
  const totalCount = ref(0);

  // Filters
  const searchQuery = ref('');
  const environmentFilter = ref<ServerEnvironment | ''>('');
  const typeFilter = ref<ServerType | ''>('');
  const statusFilter = ref<ServerStatus | ''>('');

  // ============================================
  // Getters
  // ============================================

  const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value));

  const hasServers = computed(() => servers.value.length > 0);

  // Servers by environment
  const productionServers = computed(() =>
    servers.value.filter((s) => s.environment === 'production')
  );

  const stagingServers = computed(() =>
    servers.value.filter((s) => s.environment === 'staging')
  );

  const developmentServers = computed(() =>
    servers.value.filter((s) => s.environment === 'development')
  );

  // Servers by status
  const runningServers = computed(() => servers.value.filter((s) => s.status === 'running'));

  const stoppedServers = computed(() => servers.value.filter((s) => s.status === 'stopped'));

  // Filtered servers
  const filteredServers = computed(() => {
    let filtered = servers.value;

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.hostname.toLowerCase().includes(query) ||
          s.ip_address.includes(query)
      );
    }

    if (environmentFilter.value) {
      filtered = filtered.filter((s) => s.environment === environmentFilter.value);
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
   * Fetch servers with pagination
   */
  async function fetchServers(params?: QueryParams) {
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
      if (environmentFilter.value) {
        queryParams.environment = environmentFilter.value;
      }

      if (typeFilter.value) {
        queryParams.type = typeFilter.value;
      }

      if (statusFilter.value) {
        queryParams.status = statusFilter.value;
      }

      const response = await serversApi.listServers(queryParams);

      servers.value = response.items;
      totalCount.value = response.total;
      currentPage.value = response.page;
      pageSize.value = response.size;

      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch servers';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetch a single server by ID
   */
  async function fetchServer(id: number) {
    isLoading.value = true;
    error.value = null;

    try {
      const server = await serversApi.getServer(id);
      currentServer.value = server;
      return server;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch server';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Create a new server
   */
  async function createServer(data: ServerCreate) {
    isLoading.value = true;
    error.value = null;

    try {
      const server = await serversApi.createServer(data);
      servers.value.unshift(server);
      totalCount.value += 1;
      return server;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create server';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Update an existing server
   */
  async function updateServer(id: number, data: ServerUpdate) {
    isLoading.value = true;
    error.value = null;

    try {
      const server = await serversApi.updateServer(id, data);

      // Update in list
      const index = servers.value.findIndex((s) => s.id === id);
      if (index !== -1) {
        servers.value[index] = server;
      }

      // Update current server if it's the same
      if (currentServer.value?.id === id) {
        currentServer.value = server;
      }

      return server;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update server';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Delete a server
   */
  async function deleteServer(id: number) {
    isLoading.value = true;
    error.value = null;

    try {
      await serversApi.deleteServer(id);

      // Remove from list
      servers.value = servers.value.filter((s) => s.id !== id);
      totalCount.value -= 1;

      // Clear current server if it's the same
      if (currentServer.value?.id === id) {
        currentServer.value = null;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete server';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Update server status
   */
  async function updateStatus(id: number, status: ServerStatus) {
    isLoading.value = true;
    error.value = null;

    try {
      const server = await serversApi.updateServerStatus(id, status);

      // Update in list
      const index = servers.value.findIndex((s) => s.id === id);
      if (index !== -1) {
        servers.value[index] = server;
      }

      // Update current server if it's the same
      if (currentServer.value?.id === id) {
        currentServer.value = server;
      }

      return server;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update server status';
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
   * Set environment filter
   */
  function setEnvironmentFilter(environment: ServerEnvironment | '') {
    environmentFilter.value = environment;
    currentPage.value = 1;
  }

  /**
   * Set type filter
   */
  function setTypeFilter(type: ServerType | '') {
    typeFilter.value = type;
    currentPage.value = 1;
  }

  /**
   * Set status filter
   */
  function setStatusFilter(status: ServerStatus | '') {
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
    environmentFilter.value = '';
    typeFilter.value = '';
    statusFilter.value = '';
    currentPage.value = 1;
  }

  /**
   * Clear current server
   */
  function clearCurrentServer() {
    currentServer.value = null;
  }

  /**
   * Clear all state
   */
  function clearAll() {
    servers.value = [];
    currentServer.value = null;
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
    servers,
    currentServer,
    isLoading,
    error,
    currentPage,
    pageSize,
    totalCount,
    searchQuery,
    environmentFilter,
    typeFilter,
    statusFilter,

    // Getters
    totalPages,
    hasServers,
    productionServers,
    stagingServers,
    developmentServers,
    runningServers,
    stoppedServers,
    filteredServers,

    // Actions
    fetchServers,
    fetchServer,
    createServer,
    updateServer,
    deleteServer,
    updateStatus,
    setSearchQuery,
    setEnvironmentFilter,
    setTypeFilter,
    setStatusFilter,
    setPage,
    setPageSize,
    clearFilters,
    clearCurrentServer,
    clearAll,
  };
});
