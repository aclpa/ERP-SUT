// ============================================
// Issue Store - Pinia
// ============================================

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  Issue,
  IssueCreate,
  IssueUpdate,
  IssueStatus,
  IssuePriority,
  IssueType,
} from 'src/types/models.types';
import type { QueryParams } from 'src/types/api.types';
import * as issuesApi from 'src/api/issues.api';

// ============================================
// Issue Store
// ============================================

export const useIssueStore = defineStore('issue', () => {
  // ============================================
  // State
  // ============================================

  const issues = ref<Issue[]>([]);
  const currentIssue = ref<Issue | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Pagination
  const currentPage = ref(1);
  const pageSize = ref(20);
  const totalCount = ref(0);

  // Filters
  const searchQuery = ref('');
  const statusFilter = ref<IssueStatus | ''>('');
  const priorityFilter = ref<IssuePriority | ''>('');
  const typeFilter = ref<IssueType | ''>('');
  const projectFilter = ref<number | null>(null);
  const sprintFilter = ref<number | null>(null);
  const assigneeFilter = ref<number | null>(null);

  // ============================================
  // Getters
  // ============================================

  const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value));

  const hasIssues = computed(() => issues.value.length > 0);

  // Issues by status (for Kanban board)
  const todoIssues = computed(() => issues.value.filter((i) => i.status === 'todo'));

  const inProgressIssues = computed(() => issues.value.filter((i) => i.status === 'in_progress'));

  const inReviewIssues = computed(() => issues.value.filter((i) => i.status === 'in_review'));

  const testingIssues = computed(() => issues.value.filter((i) => i.status === 'testing'));

  const doneIssues = computed(() => issues.value.filter((i) => i.status === 'done'));

  const closedIssues = computed(() => issues.value.filter((i) => i.status === 'closed'));

  // Issues by priority
  const urgentIssues = computed(() => issues.value.filter((i) => i.priority === 'urgent'));

  const highPriorityIssues = computed(() => issues.value.filter((i) => i.priority === 'high'));

  // Issues by type
  const epicIssues = computed(() => issues.value.filter((i) => i.type === 'epic'));

  const bugIssues = computed(() => issues.value.filter((i) => i.type === 'bug'));

  // Filtered issues
  const filteredIssues = computed(() => {
    let filtered = issues.value;

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      filtered = filtered.filter(
        (i) =>
          i.title.toLowerCase().includes(query) || i.description?.toLowerCase().includes(query),
      );
    }

    if (statusFilter.value) {
      filtered = filtered.filter((i) => i.status === statusFilter.value);
    }

    if (priorityFilter.value) {
      filtered = filtered.filter((i) => i.priority === priorityFilter.value);
    }

    if (typeFilter.value) {
      filtered = filtered.filter((i) => i.type === typeFilter.value);
    }

    if (projectFilter.value) {
      filtered = filtered.filter((i) => i.project_id === projectFilter.value);
    }

    if (sprintFilter.value !== null) {
      filtered = filtered.filter((i) => i.sprint_id === sprintFilter.value);
    }

    if (assigneeFilter.value !== null) {
      filtered = filtered.filter((i) => i.assignee_id === assigneeFilter.value);
    }

    return filtered;
  });

  // Group issues by status for Kanban board
  const issuesByStatus = computed(() => ({
    todo: todoIssues.value,
    in_progress: inProgressIssues.value,
    in_review: inReviewIssues.value,
    testing: testingIssues.value,
    done: doneIssues.value,
    closed: closedIssues.value,
  }));

  // ============================================
  // Actions
  // ============================================

  /**
   * Fetch issues with pagination
   */
  async function fetchIssues(params?: QueryParams) {
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
      if (statusFilter.value) {
        queryParams.status = statusFilter.value;
      }

      if (priorityFilter.value) {
        queryParams.priority = priorityFilter.value;
      }

      if (typeFilter.value) {
        queryParams.type = typeFilter.value;
      }

      if (projectFilter.value) {
        queryParams.project_id = projectFilter.value;
      }

      if (sprintFilter.value !== null) {
        queryParams.sprint_id = sprintFilter.value;
      }

      if (assigneeFilter.value !== null) {
        queryParams.assignee_id = assigneeFilter.value;
      }

      const response = await issuesApi.listIssues(queryParams);

      issues.value = response.items;
      totalCount.value = response.total;
      currentPage.value = response.page;
      pageSize.value = response.size;

      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch issues';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetch a single issue by ID
   */
  async function fetchIssue(id: number) {
    isLoading.value = true;
    error.value = null;

    try {
      const issue = await issuesApi.getIssue(id);
      currentIssue.value = issue;
      return issue;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch issue';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Create a new issue
   */
  async function createIssue(data: IssueCreate) {
    isLoading.value = true;
    error.value = null;

    try {
      const issue = await issuesApi.createIssue(data);
      issues.value.unshift(issue);
      totalCount.value += 1;
      return issue;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create issue';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Update an existing issue
   */
  async function updateIssue(id: number, data: IssueUpdate) {
    isLoading.value = true;
    error.value = null;

    try {
      const issue = await issuesApi.updateIssue(id, data);

      // Update in list
      const index = issues.value.findIndex((i) => i.id === id);
      if (index !== -1) {
        issues.value[index] = issue;
      }

      // Update current issue if it's the same
      if (currentIssue.value?.id === id) {
        currentIssue.value = issue;
      }

      return issue;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update issue';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Delete an issue
   */
  async function deleteIssue(id: number) {
    isLoading.value = true;
    error.value = null;

    try {
      await issuesApi.deleteIssue(id);

      // Remove from list
      issues.value = issues.value.filter((i) => i.id !== id);
      totalCount.value -= 1;

      // Clear current issue if it's the same
      if (currentIssue.value?.id === id) {
        currentIssue.value = null;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete issue';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Update issue status
   */
  async function updateStatus(id: number, status: IssueStatus) {
    isLoading.value = true;
    error.value = null;

    try {
      const issue = await issuesApi.updateIssueStatus(id, status);

      // Update in list
      const index = issues.value.findIndex((i) => i.id === id);
      if (index !== -1) {
        issues.value[index] = issue;
      }

      // Update current issue if it's the same
      if (currentIssue.value?.id === id) {
        currentIssue.value = issue;
      }

      return issue;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update issue status';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Assign issue to a user
   */
  async function assignIssue(id: number, assignee_id: number | null) {
    isLoading.value = true;
    error.value = null;

    try {
      const issue = await issuesApi.assignIssue(id, assignee_id);

      // Update in list
      const index = issues.value.findIndex((i) => i.id === id);
      if (index !== -1) {
        issues.value[index] = issue;
      }

      // Update current issue if it's the same
      if (currentIssue.value?.id === id) {
        currentIssue.value = issue;
      }

      return issue;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to assign issue';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Move issue to a sprint
   */
  async function moveToSprint(id: number, sprint_id: number | null) {
    isLoading.value = true;
    error.value = null;

    try {
      const issue = await issuesApi.moveIssueToSprint(id, sprint_id);

      // Update in list
      const index = issues.value.findIndex((i) => i.id === id);
      if (index !== -1) {
        issues.value[index] = issue;
      }

      // Update current issue if it's the same
      if (currentIssue.value?.id === id) {
        currentIssue.value = issue;
      }

      return issue;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to move issue to sprint';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetch issues by project
   */
  async function fetchIssuesByProject(projectId: number, params?: QueryParams) {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await issuesApi.getIssuesByProject(projectId, params);
      issues.value = response.items;
      totalCount.value = response.total;
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch project issues';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetch issues by sprint
   */
  async function fetchIssuesBySprint(sprintId: number, params?: QueryParams) {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await issuesApi.getIssuesBySprint(sprintId, params);
      issues.value = response.items;
      totalCount.value = response.total;
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch sprint issues';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetch issues assigned to current user
   */
  async function fetchMyIssues(params?: QueryParams) {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await issuesApi.getMyIssues(params);
      issues.value = response.items;
      totalCount.value = response.total;
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch my issues';
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
   * Set status filter
   */
  function setStatusFilter(status: IssueStatus | '') {
    statusFilter.value = status;
    currentPage.value = 1;
  }

  /**
   * Set priority filter
   */
  function setPriorityFilter(priority: IssuePriority | '') {
    priorityFilter.value = priority;
    currentPage.value = 1;
  }

  /**
   * Set type filter
   */
  function setTypeFilter(type: IssueType | '') {
    typeFilter.value = type;
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
   * Set sprint filter
   */
  function setSprintFilter(sprintId: number | null) {
    sprintFilter.value = sprintId;
    currentPage.value = 1;
  }

  /**
   * Set assignee filter
   */
  function setAssigneeFilter(assigneeId: number | null) {
    assigneeFilter.value = assigneeId;
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
   * Clear all filters
   */
  function clearFilters() {
    searchQuery.value = '';
    statusFilter.value = '';
    priorityFilter.value = '';
    typeFilter.value = '';
    projectFilter.value = null;
    sprintFilter.value = null;
    assigneeFilter.value = null;
    currentPage.value = 1;
  }

  /**
   * Clear current issue
   */
  function clearCurrentIssue() {
    currentIssue.value = null;
  }

  /**
   * Clear all state
   */
  function clearAll() {
    issues.value = [];
    currentIssue.value = null;
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
    issues,
    currentIssue,
    isLoading,
    error,
    currentPage,
    pageSize,
    totalCount,
    searchQuery,
    statusFilter,
    priorityFilter,
    typeFilter,
    projectFilter,
    sprintFilter,
    assigneeFilter,

    // Getters
    totalPages,
    hasIssues,
    todoIssues,
    inProgressIssues,
    inReviewIssues,
    testingIssues,
    doneIssues,
    closedIssues,
    urgentIssues,
    highPriorityIssues,
    epicIssues,
    bugIssues,
    filteredIssues,
    issuesByStatus,

    // Actions
    fetchIssues,
    fetchIssue,
    createIssue,
    updateIssue,
    deleteIssue,
    updateStatus,
    assignIssue,
    moveToSprint,
    fetchIssuesByProject,
    fetchIssuesBySprint,
    fetchMyIssues,
    setSearchQuery,
    setStatusFilter,
    setPriorityFilter,
    setTypeFilter,
    setProjectFilter,
    setSprintFilter,
    setAssigneeFilter,
    setPage,
    setPageSize,
    clearFilters,
    clearCurrentIssue,
    clearAll,
  };
});
