// src/stores/user.store.ts

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User, UserCreate, UserUpdate, UserProfile } from 'src/types/models.types';
import type { QueryParams } from 'src/types/api.types';
import * as usersApi from 'src/api/users.api';

export const useUserStore = defineStore('user', () => {
  // State
  const users = ref<User[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const userProfile = ref<UserProfile | null>(null);

  // Pagination
  const currentPage = ref(1);
  const pageSize = ref(20);
  const totalCount = ref(0);

  // Filters
  const searchQuery = ref('');

  // Getters
  const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value));

  // Actions
  async function fetchUsers(params?: QueryParams) {
    isLoading.value = true;
    error.value = null;
    try {
      const queryParams: QueryParams = {
        page: currentPage.value,
        size: pageSize.value,
        ...params,
      };

      // 검색어가 있는 경우 추가 (백엔드 구현 필요 확인)
      // API 명세에는 검색 파라미터가 없었으나, 보통 프론트에서 param으로 넘기거나
      // 백엔드 API가 지원해야 함. 여기서는 일단 params에 병합합니다.
      if (searchQuery.value) {
        queryParams.search = searchQuery.value;
      }

      const response = await usersApi.listUsers(queryParams);
      users.value = response.items;
      totalCount.value = response.total;
      return response;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch users';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function createUser(data: UserCreate) {
    isLoading.value = true;
    try {
      const newUser = await usersApi.createUser(data);
      // 목록 최상단에 추가하거나 목록을 다시 로드
      users.value.unshift(newUser);
      totalCount.value += 1;
      return newUser;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to create user';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateUser(id: number, data: UserUpdate) {
    isLoading.value = true;
    try {
      const updatedUser = await usersApi.updateUser(id, data);
      const index = users.value.findIndex((u) => u.id === id);
      if (index !== -1) {
        users.value[index] = updatedUser;
      }
      return updatedUser;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update user';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteUser(id: number) {
    isLoading.value = true;
    try {
      await usersApi.deleteUser(id);
      users.value = users.value.filter((u) => u.id !== id);
      totalCount.value -= 1;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to delete user';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchUserProfile() {
    isLoading.value = true;
    error.value = null;
    try {
      const profile = await usersApi.getUserProfile();
      userProfile.value = profile;
      return profile;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch profile';
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  // Utility Actions
  function setPage(page: number) {
    currentPage.value = page;
  }

  function setPageSize(size: number) {
    pageSize.value = size;
    currentPage.value = 1; // 사이즈 변경 시 첫 페이지로 초기화
  }

  return {
    users,
    isLoading,
    error,
    currentPage,
    pageSize,
    totalCount,
    searchQuery,
    totalPages,
    userProfile,
    fetchUserProfile,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    setPage,
    setPageSize,
  };
});
