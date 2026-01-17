<template>
  <q-page class="team-list-page">
    <div class="q-pa-md">
      <div class="row items-center justify-between q-mb-md">
        <div class="col">
          <h4 class="text-h4 text-weight-bold">Teams</h4>
          <div class="text-body2 text-grey-7">Manage teams and members</div>
        </div>
        <div class="col-auto row q-gutter-sm">
          <q-btn
            color="secondary"
            label="New User"
            icon="person_add"
            outline
            @click="openCreateUserDialog"
          />
          <q-btn color="primary" label="New Team" icon="add" @click="showCreateDialog = true" />
        </div>
      </div>

      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <q-input
            v-model="teamStore.searchQuery"
            label="Search teams"
            outlined
            dense
            clearable
            @update:model-value="handleSearch"
          >
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </q-card-section>
      </q-card>

      <div v-if="teamStore.isLoading" class="row justify-center q-pa-xl">
        <q-spinner-dots size="50px" color="primary" />
      </div>

      <div v-else-if="!teamStore.hasTeams" class="row justify-center q-pa-xl">
        <empty-state
          icon="groups"
          title="No teams found"
          description="Create your first team to get started"
        >
          <q-btn color="primary" label="Create Team" @click="showCreateDialog = true" />
        </empty-state>
      </div>

      <div v-else>
        <div class="row items-center justify-between q-mb-md">
          <div class="col-auto">
            <div class="text-subtitle2 text-grey-7">{{ teamStore.totalCount }} team(s) found</div>
          </div>
          <div class="col-auto">
            <q-btn-toggle
              v-model="viewMode"
              toggle-color="primary"
              :options="[
                { label: 'Grid', value: 'grid', icon: 'grid_view' },
                { label: 'List', value: 'list', icon: 'view_list' },
              ]"
              flat
            />
          </div>
        </div>

        <div v-if="viewMode === 'grid'" class="row q-col-gutter-md">
          <div
            v-for="team in teamStore.filteredTeams"
            :key="team.id"
            class="col-12 col-sm-6 col-md-4 col-lg-3"
          >
            <team-card
              :team="team"
              :show-actions="true"
              @click="handleTeamClick(team)"
              @edit="handleEditTeam(team)"
              @delete="handleDeleteTeam(team)"
            />
          </div>
        </div>

        <q-card v-else flat bordered>
          <q-list separator>
            <q-item
              v-for="team in teamStore.filteredTeams"
              :key="team.id"
              clickable
              @click="handleTeamClick(team)"
            >
              <q-item-section>
                <q-item-label class="text-weight-bold">
                  {{ team.name }}
                </q-item-label>
                <q-item-label caption>
                  {{ team.description }}
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-chip v-if="team.is_active" color="positive" text-color="white" size="sm">
                  Active
                </q-chip>
                <q-chip v-else color="grey" text-color="white" size="sm"> Inactive </q-chip>
              </q-item-section>

              <q-item-section side>
                <div class="row q-gutter-xs">
                  <q-btn
                    flat
                    dense
                    round
                    icon="edit"
                    color="primary"
                    @click.stop="handleEditTeam(team)"
                  >
                    <q-tooltip>Edit</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    dense
                    round
                    icon="delete"
                    color="negative"
                    @click.stop="handleDeleteTeam(team)"
                  >
                    <q-tooltip>Delete</q-tooltip>
                  </q-btn>
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>

        <div class="row justify-center q-mt-md">
          <common-pagination
            :page="teamStore.currentPage"
            :size="teamStore.pageSize"
            :total="teamStore.totalCount"
            @page-change="handlePageChange"
            @size-change="handleSizeChange"
          />
        </div>
      </div>
    </div>

    <q-dialog v-model="showCreateDialog">
      <q-card style="min-width: 600px">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ editingTeam ? 'Edit Team' : 'New Team' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <team-form
            :team="editingTeam"
            :loading="teamStore.isLoading"
            @submit="handleSubmit"
            @cancel="handleCancel"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <UserCreateDialog v-model="showCreateUserDialog" @created="handleUserCreated" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTeamStore } from 'src/stores/team.store';
import { useNotify } from 'src/composables/useNotify';
import { useDialog } from 'src/composables/useDialog';
import type { Team, TeamCreate, TeamUpdate, User } from 'src/types/models.types';
import TeamCard from 'src/components/team/TeamCard.vue';
import TeamForm from 'src/components/team/TeamForm.vue';
import CommonPagination from 'src/components/common/Pagination.vue';
import EmptyState from 'src/components/common/EmptyState.vue';
// [추가] UserCreateDialog 임포트
import UserCreateDialog from 'src/components/users/UserCreateDialog.vue';

// ============================================
// Composables
// ============================================

const router = useRouter();
const teamStore = useTeamStore();
const { notifySuccess, notifyError } = useNotify();
const { confirmDelete } = useDialog();

// ============================================
// State
// ============================================

const viewMode = ref<'grid' | 'list'>('grid');
const showCreateDialog = ref(false);
const editingTeam = ref<Team | null>(null);

// [추가] 유저 생성 다이얼로그 상태
const showCreateUserDialog = ref(false);

// ============================================
// Methods
// ============================================

// [추가] 유저 생성 다이얼로그 열기
function openCreateUserDialog() {
  showCreateUserDialog.value = true;
}

// [추가] 유저 생성 완료 콜백
function handleUserCreated(newUser: User) {
  notifySuccess(`User '${newUser.username}' created successfully.`);
  // 필요하다면 여기서 유저 관련 추가 작업 수행 (예: 스토어 갱신 등)
}

async function loadTeams() {
  try {
    await teamStore.fetchTeams();
  } catch {
    notifyError('Failed to load teams');
  }
}

function handleSearch() {
  void loadTeams();
}

function handlePageChange(page: number) {
  teamStore.setPage(page);
  void loadTeams();
}

function handleSizeChange(size: number) {
  teamStore.setPageSize(size);
  void loadTeams();
}

function handleTeamClick(team: Team) {
  void router.push(`/teams/${team.id}`);
}

function handleEditTeam(team: Team) {
  editingTeam.value = team;
  showCreateDialog.value = true;
}

async function handleDeleteTeam(team: Team) {
  const confirmed = await confirmDelete(team.name);

  if (!confirmed) return;

  try {
    await teamStore.deleteTeam(team.id);
    notifySuccess('Team deleted successfully');
  } catch {
    notifyError('Failed to delete team');
  }
}

async function handleSubmit(data: TeamCreate | TeamUpdate) {
  try {
    if (editingTeam.value) {
      await teamStore.updateTeam(editingTeam.value.id, data as TeamUpdate);
      notifySuccess('Team updated successfully');
    } else {
      await teamStore.createTeam(data as TeamCreate);
      notifySuccess('Team created successfully');
    }

    showCreateDialog.value = false;
    editingTeam.value = null;
  } catch {
    notifyError(editingTeam.value ? 'Failed to update team' : 'Failed to create team');
  }
}

function handleCancel() {
  showCreateDialog.value = false;
  editingTeam.value = null;
}

// ============================================
// Lifecycle
// ============================================

onMounted(() => {
  void loadTeams();
});
</script>

<style lang="scss" scoped>
.team-list-page {
  max-width: 1400px;
  margin: 0 auto;
}
</style>
