<template>
  <q-card class="team-card" @click="handleClick">
    <q-card-section>
      <!-- Header -->
      <div class="row items-center justify-between q-mb-sm">
        <div class="col">
          <div class="text-h6 text-weight-bold">
            {{ team.name }}
          </div>
        </div>
        <div class="col-auto">
          <q-chip v-if="team.is_active" color="positive" text-color="white" size="sm">
            Active
          </q-chip>
          <q-chip v-else color="grey" text-color="white" size="sm">
            Inactive
          </q-chip>
        </div>
      </div>

      <!-- Description -->
      <div v-if="team.description" class="text-body2 text-grey-7 q-mb-md line-clamp-2">
        {{ team.description }}
      </div>

      <!-- Stats -->
      <div v-if="showStats && stats" class="row q-col-gutter-sm q-mb-md">
        <div class="col-6">
          <q-card flat bordered class="bg-blue-1">
            <q-card-section class="q-pa-sm text-center">
              <div class="text-h6 text-primary">{{ stats.member_count }}</div>
              <div class="text-caption text-grey-7">Members</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-6">
          <q-card flat bordered class="bg-green-1">
            <q-card-section class="q-pa-sm text-center">
              <div class="text-h6 text-positive">{{ stats.project_count }}</div>
              <div class="text-caption text-grey-7">Projects</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Metadata -->
      <div class="row items-center text-caption text-grey-6">
        <q-icon name="event" size="xs" class="q-mr-xs" />
        Created {{ formatRelativeTime(team.created_at) }}
      </div>
    </q-card-section>

    <!-- Actions -->
    <q-card-actions v-if="showActions" align="right">
      <q-btn
        flat
        dense
        icon="edit"
        color="primary"
        @click.stop="handleEdit"
      >
        <q-tooltip>Edit</q-tooltip>
      </q-btn>
      <q-btn
        flat
        dense
        icon="delete"
        color="negative"
        @click.stop="handleDelete"
      >
        <q-tooltip>Delete</q-tooltip>
      </q-btn>
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import type { Team } from 'src/types/models.types';
import { formatRelativeTime } from 'src/utils/formatters';

// ============================================
// Props
// ============================================

interface Props {
  team: Team;
  showActions?: boolean;
  showStats?: boolean;
  stats?: {
    member_count: number;
    project_count: number;
    active_sprint_count: number;
    total_issues: number;
  } | null;
}

const props = withDefaults(defineProps<Props>(), {
  showActions: false,
  showStats: false,
  stats: null,
});

// ============================================
// Emits
// ============================================

const emit = defineEmits<{
  click: [team: Team];
  edit: [team: Team];
  delete: [team: Team];
}>();

// ============================================
// Methods
// ============================================

function handleClick() {
  emit('click', props.team);
}

function handleEdit() {
  emit('edit', props.team);
}

function handleDelete() {
  emit('delete', props.team);
}
</script>

<style lang="scss" scoped>
.team-card {
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
