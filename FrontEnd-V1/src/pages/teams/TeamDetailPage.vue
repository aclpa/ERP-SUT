<template>
  <q-page padding>
    <div v-if="isLoading" class="text-center q-pa-xl">
      <q-spinner-dots color="primary" size="3em" />
      <div class="q-mt-md text-grey-7">팀 정보를 불러오는 중...</div>
    </div>

    <template v-else-if="currentTeam">
      <div class="row justify-between items-center q-mb-md">
        <div>
          <div class="text-h4">{{ currentTeam.name }}</div>
          <div class="text-subtitle1 text-grey-7">
            {{ currentTeam.description }}
          </div>
        </div>
        <q-btn v-if="canManageTeam" color="primary" label="Edit Team" @click="openEditTeamDialog" />
      </div>

      <div class="row q-col-gutter-md q-mb-lg">
        <div class="col-3">
          <q-card>
            <q-card-section>
              <div class="text-caption text-grey-7">Members</div>
              <div class="text-h5">
                {{ currentTeamStats?.member_count || 0 }}
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <q-separator class="q-my-lg" />

      <TeamMemberList
        v-if="teamMembers.length > 0"
        :members="teamMembers"
        :can-add-member="canManageTeam"
        :can-edit-role="canManageTeam"
        :can-remove-member="canManageTeam"
        @add-member="openAddMemberDialog"
        @remove-member="handleRemoveMember"
      />

      <EmptyState
        v-else
        icon="group"
        title="No Members"
        description="There are no members in this team yet."
      >
        <q-btn
          v-if="canManageTeam"
          color="primary"
          label="Add Member"
          @click="openAddMemberDialog"
        />
      </EmptyState>
    </template>

    <template v-else-if="!isLoading && !currentTeam">
      <EmptyState
        icon="error_outline"
        title="Team Not Found"
        description="The requested team does not exist or has been deleted."
      >
        <q-btn color="primary" label="Back to Teams" to="/teams" no-caps />
      </EmptyState>
    </template>

    <q-dialog v-model="showAddMemberDialog">
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6">Add Team Member</div>
          <q-btn
            flat
            dense
            color="primary"
            icon="person_add"
            label="New User"
            size="sm"
            @click="openCreateUserDialog"
          >
            <q-tooltip>Create a completely new user in the system</q-tooltip>
          </q-btn>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="submitAddMember" class="q-gutter-md">
            <q-select
              v-model="selectedNewUser"
              :options="userOptions"
              label="Select User *"
              outlined
              dense
              use-input
              fill-input
              hide-selected
              input-debounce="300"
              @filter="filterUsers"
              option-label="username"
              option-value="id"
              :rules="[(val) => !!val || 'User is required']"
            >
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <q-avatar v-if="scope.opt.avatar_url">
                      <img :src="scope.opt.avatar_url" />
                    </q-avatar>
                    <q-avatar v-else icon="person" color="grey" text-color="white" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ scope.opt.full_name || scope.opt.username }}</q-item-label>
                    <q-item-label caption>{{ scope.opt.email }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey"> No results found </q-item-section>
                </q-item>
              </template>
            </q-select>

            <q-select
              v-model="newMemberRole"
              :options="roleOptions"
              label="Role *"
              outlined
              dense
              emit-value
              map-options
            />

            <div class="row justify-end q-mt-lg">
              <q-btn flat label="Cancel" color="grey" v-close-popup />
              <q-btn type="submit" label="Add" color="primary" :loading="addingMember" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <UserCreateDialog v-model="showCreateUserDialog" @created="handleUserCreated" />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useQuasar } from 'quasar';
import { storeToRefs } from 'pinia';
import { useTeamStore } from 'src/stores/team.store';
import { useAuthStore } from 'src/stores/auth.store';
import { listUsers } from 'src/api/users.api';
import type { TeamMember, User, TeamRole } from 'src/types/models.types';

import TeamMemberList from 'src/components/team/TeamMemberList.vue';
import EmptyState from 'src/components/common/EmptyState.vue';
// [추가됨] UserCreateDialog 임포트 (파일 경로 확인 필요)
import UserCreateDialog from 'src/components/users/UserCreateDialog.vue';

const props = defineProps({
  teamId: {
    type: Number,
    required: true,
  },
});

const $q = useQuasar();
const teamStore = useTeamStore();
const authStore = useAuthStore();

const { currentTeam, teamMembers, isLoading, currentTeamStats } = storeToRefs(teamStore);
const {
  fetchTeam,
  fetchTeamMembers,
  fetchTeamStats,
  clearCurrentTeam,
  removeTeamMember,
  addTeamMember,
} = teamStore;
const { user: currentUser, isSuperuser } = storeToRefs(authStore);

// 다이얼로그 관련 상태
const showAddMemberDialog = ref(false);
const showCreateUserDialog = ref(false); // [추가됨] 유저 생성 다이얼로그 상태
const addingMember = ref(false);
const selectedNewUser = ref<User | null>(null);
const newMemberRole = ref<TeamRole>('member');
const userOptions = ref<User[]>([]);
const allUsers = ref<User[]>([]);

const roleOptions = [
  { label: 'Admin', value: 'admin' },
  { label: 'Member', value: 'member' },
  { label: 'Viewer', value: 'viewer' },
];

// 권한 체크
const canManageTeam = computed(() => {
  if (isSuperuser.value) return true;
  if (!currentTeam.value || !currentUser.value) return false;

  if ('owner_id' in currentTeam.value && currentTeam.value.owner_id === currentUser.value.id) {
    return true;
  }
  const myMembership = teamMembers.value.find((m) => m.user_id === currentUser.value?.id);
  return myMembership?.role === 'owner' || myMembership?.role === 'admin';
});

// --- 메서드 ---

// 1. 팀원 추가 다이얼로그 열기
async function openAddMemberDialog() {
  selectedNewUser.value = null;
  newMemberRole.value = 'member';

  try {
    const response = await listUsers({ page: 1, size: 100 });
    const currentMemberIds = new Set(teamMembers.value.map((m) => m.user_id));
    allUsers.value = response.items.filter((u) => !currentMemberIds.has(u.id));
    userOptions.value = allUsers.value;

    showAddMemberDialog.value = true;
  } catch {
    $q.notify({ type: 'negative', message: 'Failed to load users list' });
  }
}

// 2. [추가됨] 신규 유저 생성 다이얼로그 열기
function openCreateUserDialog() {
  showCreateUserDialog.value = true;
}

// 3. [추가됨] 신규 유저 생성 완료 후 처리 (콜백)
function handleUserCreated(newUser: User) {
  // 전체 목록에 추가하고
  allUsers.value.unshift(newUser);
  // 검색 옵션 갱신하고
  userOptions.value = allUsers.value;
  // 팀원 추가 폼에서 바로 선택되도록 설정
  selectedNewUser.value = newUser;

  $q.notify({
    type: 'positive',
    message: `User '${newUser.username}' created and selected.`,
    timeout: 1500,
  });
}

// 4. 사용자 검색 필터링
function filterUsers(val: string, update: (fn: () => void) => void) {
  if (val === '') {
    update(() => {
      userOptions.value = allUsers.value;
    });
    return;
  }

  update(() => {
    const needle = val.toLowerCase();
    userOptions.value = allUsers.value.filter(
      (v) =>
        v.username.toLowerCase().indexOf(needle) > -1 ||
        (v.full_name && v.full_name.toLowerCase().indexOf(needle) > -1) ||
        v.email.toLowerCase().indexOf(needle) > -1,
    );
  });
}

// 5. 팀원 추가 요청 전송
async function submitAddMember() {
  if (!selectedNewUser.value) return;

  addingMember.value = true;
  try {
    await addTeamMember(props.teamId, {
      team_id: props.teamId,
      user_id: selectedNewUser.value.id,
      role: newMemberRole.value,
    });

    $q.notify({ type: 'positive', message: 'Member added successfully' });
    showAddMemberDialog.value = false;
    void fetchTeamStats(props.teamId);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to add member';
    $q.notify({ type: 'negative', message: msg });
  } finally {
    addingMember.value = false;
  }
}

// 팀 수정 (placeholder)
function openEditTeamDialog() {
  console.log('Edit Team clicked');
}

// 멤버 삭제
function handleRemoveMember(member: TeamMember) {
  $q.dialog({
    title: 'Confirm Removal',
    message: `Remove ${member.user?.full_name || member.user?.username} from team?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        await removeTeamMember(props.teamId, member.user_id);
        $q.notify({ type: 'positive', message: 'Member removed' });
        void fetchTeamStats(props.teamId);
      } catch {
        $q.notify({ type: 'negative', message: 'Failed to remove member' });
      }
    })();
  });
}

onMounted(() => {
  void fetchTeam(props.teamId);
  void fetchTeamMembers(props.teamId);
  void fetchTeamStats(props.teamId);
});

onUnmounted(() => {
  clearCurrentTeam();
});
</script>
