<template>
  <div class="team-member-list">
    <div class="row items-center justify-between q-mb-md">
      <div class="col">
        <div class="text-h6">Team Members</div>
        <div class="text-caption text-grey-7">{{ members.length }} member(s)</div>
      </div>
      <div class="col-auto">
        <q-btn
          v-if="canAddMember"
          color="primary"
          label="Add Member"
          icon="person_add"
          @click="handleAddMember"
        />
      </div>
    </div>

    <q-list bordered separator v-if="members.length > 0">
      <q-item v-for="member in members" :key="member.id">
        <q-item-section avatar>
          <q-avatar color="primary" text-color="white">
            <q-icon name="person" />
          </q-avatar>
        </q-item-section>

        <q-item-section>
          <q-item-label class="text-weight-bold">
            {{ member.user?.full_name || member.user?.username }}
          </q-item-label>
          <q-item-label caption>
            <status-badge type="team-role" :value="member.role" size="sm" />
            • {{ member.user?.email }}
          </q-item-label>
        </q-item-section>

        <q-item-section side>
          <div class="row q-gutter-xs">
            <q-btn
              v-if="canEditRole"
              flat
              dense
              round
              icon="edit"
              color="primary"
              @click="openEditDialog(member)"
            >
              <q-tooltip>Edit Member Info</q-tooltip>
            </q-btn>

            <q-btn
              v-if="canRemoveMember"
              flat
              dense
              round
              icon="person_remove"
              color="negative"
              @click="handleRemoveMember(member)"
            >
              <q-tooltip>Remove from Team</q-tooltip>
            </q-btn>
          </div>
        </q-item-section>
      </q-item>
    </q-list>

    <empty-state
      v-else
      icon="people"
      title="No team members"
      description="Add members to start collaborating"
    >
      <q-btn v-if="canAddMember" color="primary" label="Add Member" @click="handleAddMember" />
    </empty-state>

    <TeamMemberEditDialog
      v-model="showEditDialog"
      :member="selectedMember"
      :loading="loading"
      @submit="handleUpdateMember"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { TeamMember, TeamRole } from 'src/types/models.types';
import StatusBadge from 'src/components/common/StatusBadge.vue';
import EmptyState from 'src/components/common/EmptyState.vue';
// [!] 추가된 임포트
import TeamMemberEditDialog from './TeamMemberEditDialog.vue';
import { useTeamStore } from 'src/stores/team.store';

// Props
interface Props {
  members: TeamMember[];
  canAddMember?: boolean;
  canEditRole?: boolean; // 수정 권한
  canRemoveMember?: boolean;
}

withDefaults(defineProps<Props>(), {
  canAddMember: false,
  canEditRole: false,
  canRemoveMember: false,
});

// Emits
const emit = defineEmits<{
  addMember: [];
  removeMember: [member: TeamMember];
}>();

// [!] 추가된 로직
const teamStore = useTeamStore();
const showEditDialog = ref(false);
const selectedMember = ref<TeamMember | null>(null);
const loading = ref(false);

function openEditDialog(member: TeamMember) {
  selectedMember.value = member;
  showEditDialog.value = true;
}

async function handleUpdateMember(data: { role: TeamRole; full_name: string }) {
  if (!selectedMember.value) return;

  loading.value = true;
  try {
    await teamStore.updateMemberInfo(
      selectedMember.value.team_id,
      selectedMember.value.user_id,
      data,
    );
    showEditDialog.value = false;
  } finally {
    loading.value = false;
  }
}

function handleAddMember() {
  emit('addMember');
}

function handleRemoveMember(member: TeamMember) {
  emit('removeMember', member);
}
</script>
