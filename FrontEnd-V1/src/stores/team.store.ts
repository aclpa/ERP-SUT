// ============================================
// Team Store - Pinia
// ============================================

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  Team,
  TeamCreate,
  TeamUpdate,
  TeamMember,
  TeamMemberCreate,
  TeamMemberUpdate,
  TeamRole,
} from 'src/types/models.types';
import type { QueryParams } from 'src/types/api.types';
import * as teamsApi from 'src/api/teams.api';
import * as usersApi from 'src/api/users.api';

import { useNotify } from 'src/composables/useNotify';

// ============================================
// Team Store
// ============================================

export const useTeamStore = defineStore('team', () => {
  // ============================================
  // State
  // ============================================
  const { notifySuccess, notifyError } = useNotify();
  const teams = ref<Team[]>([]);
  const currentTeam = ref<Team | null>(null);
  const teamMembers = ref<TeamMember[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Pagination
  const currentPage = ref(1);
  const pageSize = ref(20);
  const totalCount = ref(0);

  // Filters
  const searchQuery = ref('');

  // Team stats
  const currentTeamStats = ref<{
    member_count: number;
    project_count: number;
    active_sprint_count: number;
    total_issues: number;
  } | null>(null);

  // ============================================
  // Getters
  // ============================================

  const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value));

  const hasTeams = computed(() => teams.value.length > 0);

  const filteredTeams = computed(() => {
    let filtered = teams.value;

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      filtered = filtered.filter(
        (t) => t.name.toLowerCase().includes(query) || t.description?.toLowerCase().includes(query),
      );
    }

    return filtered;
  });

  // ============================================
  // Actions - Teams
  // ============================================

  /**
   * Fetch teams with pagination
   */
  async function fetchTeams(params?: QueryParams) {
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

      const response = await teamsApi.listTeams(queryParams);

      teams.value = response.items;
      totalCount.value = response.total;
      currentPage.value = response.page;
      pageSize.value = response.size;

      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch teams';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetch a single team by ID
   */
  async function fetchTeam(id: number) {
    isLoading.value = true;
    error.value = null;

    try {
      const team = await teamsApi.getTeam(id);
      currentTeam.value = team;
      return team;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch team';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Create a new team
   */
  async function createTeam(data: TeamCreate) {
    isLoading.value = true;
    error.value = null;

    try {
      const team = await teamsApi.createTeam(data);
      teams.value.unshift(team);
      totalCount.value += 1;
      return team;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create team';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Update an existing team
   */
  async function updateTeam(id: number, data: TeamUpdate) {
    isLoading.value = true;
    error.value = null;

    try {
      const team = await teamsApi.updateTeam(id, data);

      // Update in list
      const index = teams.value.findIndex((t) => t.id === id);
      if (index !== -1) {
        teams.value[index] = team;
      }

      // Update current team if it's the same
      if (currentTeam.value?.id === id) {
        currentTeam.value = team;
      }

      return team;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update team';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Delete a team
   */
  async function deleteTeam(id: number) {
    isLoading.value = true;
    error.value = null;

    try {
      await teamsApi.deleteTeam(id);

      // Remove from list
      teams.value = teams.value.filter((t) => t.id !== id);
      totalCount.value -= 1;

      // Clear current team if it's the same
      if (currentTeam.value?.id === id) {
        currentTeam.value = null;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete team';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetch teams that the current user is a member of
   */
  async function fetchMyTeams(params?: QueryParams) {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await teamsApi.getMyTeams(params);
      teams.value = response.items;
      totalCount.value = response.total;
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch my teams';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  // ============================================
  // Actions - Team Members
  // ============================================

  /**
   * Fetch team members
   */
  async function fetchTeamMembers(teamId: number, params?: QueryParams) {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await teamsApi.getTeamMembers(teamId, params);
      teamMembers.value = response.items;
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch team members';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Add a member to a team
   */
  async function addTeamMember(teamId: number, data: TeamMemberCreate) {
    isLoading.value = true;
    error.value = null;

    try {
      const member = await teamsApi.addTeamMember(teamId, data);
      teamMembers.value.unshift(member);
      return member;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add team member';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Update a team member's role
   */
  async function updateTeamMemberRole(teamId: number, memberId: number, data: TeamMemberUpdate) {
    isLoading.value = true;
    error.value = null;

    try {
      const member = await teamsApi.updateTeamMember(teamId, memberId, data);

      // Update in list
      const index = teamMembers.value.findIndex((m) => m.id === memberId);
      if (index !== -1) {
        teamMembers.value[index] = member;
      }

      return member;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update team member';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Remove a member from a team
   */
  async function removeTeamMember(teamId: number, memberId: number) {
    isLoading.value = true;
    error.value = null;

    try {
      await teamsApi.removeTeamMember(teamId, memberId);

      // Remove from list
      teamMembers.value = teamMembers.value.filter((m) => m.id !== memberId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove team member';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Fetch team statistics
   */
  async function fetchTeamStats(teamId: number) {
    isLoading.value = true;
    error.value = null;

    try {
      const stats = await teamsApi.getTeamStats(teamId);
      currentTeamStats.value = stats;
      return stats;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch team stats';
      error.value = message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }
  /**
   * 팀원의 정보(역할 및 이름)를 수정합니다.
   * @param teamId 팀 ID
   * @param userId 사용자 ID (팀원 ID가 아님)
   * @param updates 수정할 정보 객체 { role: 역할, full_name: 이름 }
   */
  /**
   * Update team member info (Role & Name)
   */
  async function updateMemberInfo(
    teamId: number,
    userId: number,
    updates: { role?: TeamRole; full_name?: string },
  ) {
    try {
      // 1. 역할(Role) 업데이트
      if (updates.role) {
        // [수정됨] updateTeamMemberRole -> updateTeamMember
        await teamsApi.updateTeamMember(teamId, userId, { role: updates.role });
      }

      // 2. 이름(Full Name) 업데이트
      if (updates.full_name) {
        await usersApi.updateUser(userId, { full_name: updates.full_name });
      }

      notifySuccess('Member information updated successfully');

      // 변경 사항 반영을 위해 멤버 목록 새로고침
      await fetchTeamMembers(teamId);
    } catch (error) {
      // [수정됨] 에러 메시지 추출하여 전달
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      notifyError('Failed to update member information', message);
      throw error;
    }
  }

  // ============================================
  // Utility Actions
  // ============================================

  /**
   * Set search query
   */
  function setSearchQuery(query: string) {
    searchQuery.value = query;
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
   * Clear current team
   */
  function clearCurrentTeam() {
    currentTeam.value = null;
    teamMembers.value = [];
    currentTeamStats.value = null;
  }

  /**
   * Clear all state
   */
  function clearAll() {
    teams.value = [];
    currentTeam.value = null;
    teamMembers.value = [];
    isLoading.value = false;
    error.value = null;
    currentPage.value = 1;
    pageSize.value = 20;
    totalCount.value = 0;
    searchQuery.value = '';
    currentTeamStats.value = null;
  }

  // ============================================
  // Return
  // ============================================

  return {
    updateMemberInfo,
    // State
    teams,
    currentTeam,
    teamMembers,
    isLoading,
    error,
    currentPage,
    pageSize,
    totalCount,
    searchQuery,
    currentTeamStats,

    // Getters
    totalPages,
    hasTeams,
    filteredTeams,

    // Actions - Teams
    fetchTeams,
    fetchTeam,
    createTeam,
    updateTeam,
    deleteTeam,
    fetchMyTeams,

    // Actions - Team Members
    fetchTeamMembers,
    addTeamMember,
    updateTeamMemberRole,
    removeTeamMember,
    fetchTeamStats,

    // Utility Actions
    setSearchQuery,
    setPage,
    setPageSize,
    clearCurrentTeam,
    clearAll,
  };
});
