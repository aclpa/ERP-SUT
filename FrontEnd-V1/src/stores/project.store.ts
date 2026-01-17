// ============================================
// Project Store - Pinia
// ============================================

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Project, ProjectCreate, ProjectUpdate, ProjectStatus } from 'src/types/models.types';
import type { QueryParams } from 'src/types/api.types';
import * as projectsApi from 'src/api/projects.api';

// ============================================
// Project Store
// ============================================

export const useProjectStore = defineStore('project', () => {
  // ============================================
  // State
  // ============================================

  const projects = ref<Project[]>([]);
  const currentProject = ref<Project | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Pagination
  const currentPage = ref(1);
  const pageSize = ref(20);
  const totalCount = ref(0);

  // Filters
  const searchQuery = ref('');
  const statusFilter = ref<ProjectStatus | ''>('');
  const teamFilter = ref<number | null>(null);

  // ============================================
  // Getters
  // ============================================

  const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value));

  const hasProjects = computed(() => projects.value.length > 0);

  const activeProjects = computed(() =>
    projects.value.filter((p) => p.status === 'active')
  );

  const filteredProjects = computed(() => {
    let filtered = projects.value;

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      );
    }

    if (statusFilter.value) {
      filtered = filtered.filter((p) => p.status === statusFilter.value);
    }

    return filtered;
  });

  // ============================================
  // Actions
  // ============================================

  /**
   * Fetch projects with pagination
   */
  async function fetchProjects(params?: QueryParams) {
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

      const response = await projectsApi.listProjects(queryParams);

      projects.value = response.items;
      totalCount.value = response.total;
      currentPage.value = response.page;
      pageSize.value = response.size;

      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch projects';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetch a single project by ID
   */
  async function fetchProject(id: number) {
    isLoading.value = true;
    error.value = null;

    try {
      const project = await projectsApi.getProject(id);
      currentProject.value = project;
      return project;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch project';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Create a new project
   */
  async function createProject(data: ProjectCreate) {
    isLoading.value = true;
    error.value = null;

    try {
      const project = await projectsApi.createProject(data);
      projects.value.unshift(project);
      totalCount.value += 1;
      return project;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create project';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Update an existing project
   */
  async function updateProject(id: number, data: ProjectUpdate) {
    isLoading.value = true;
    error.value = null;

    try {
      const project = await projectsApi.updateProject(id, data);

      // Update in list
      const index = projects.value.findIndex((p) => p.id === id);
      if (index !== -1) {
        projects.value[index] = project;
      }

      // Update current project if it's the same
      if (currentProject.value?.id === id) {
        currentProject.value = project;
      }

      return project;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update project';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Delete a project
   */
  async function deleteProject(id: number) {
    isLoading.value = true;
    error.value = null;

    try {
      await projectsApi.deleteProject(id);

      // Remove from list
      projects.value = projects.value.filter((p) => p.id !== id);
      totalCount.value -= 1;

      // Clear current project if it's the same
      if (currentProject.value?.id === id) {
        currentProject.value = null;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete project';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetch projects by team
   */
  async function fetchProjectsByTeam(teamId: number, params?: QueryParams) {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await projectsApi.getProjectsByTeam(teamId, params);
      projects.value = response.items;
      totalCount.value = response.total;
      return response;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch team projects';
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
  function setStatusFilter(status: ProjectStatus | '') {
    statusFilter.value = status;
    currentPage.value = 1;
  }

  /**
   * Set team filter
   */
  function setTeamFilter(teamId: number | null) {
    teamFilter.value = teamId;
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
    teamFilter.value = null;
    currentPage.value = 1;
  }

  /**
   * Clear current project
   */
  function clearCurrentProject() {
    currentProject.value = null;
  }

  /**
   * Clear all state
   */
  function clearAll() {
    projects.value = [];
    currentProject.value = null;
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
    projects,
    currentProject,
    isLoading,
    error,
    currentPage,
    pageSize,
    totalCount,
    searchQuery,
    statusFilter,
    teamFilter,

    // Getters
    totalPages,
    hasProjects,
    activeProjects,
    filteredProjects,

    // Actions
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
    fetchProjectsByTeam,
    setSearchQuery,
    setStatusFilter,
    setTeamFilter,
    setPage,
    setPageSize,
    clearFilters,
    clearCurrentProject,
    clearAll,
  };
});
