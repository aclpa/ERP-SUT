<template>
  <q-card class="issue-card" @click="handleClick">
    <q-card-section>
      <!-- Header -->
      <div class="row items-center justify-between q-mb-sm">
        <div class="col">
          <div class="row items-center q-gutter-xs">
            <!-- Type Badge -->
            <status-badge type="issue-type" :value="issue.type" size="sm" />
            <!-- Priority Badge -->
            <status-badge type="issue-priority" :value="issue.priority" size="sm" />
          </div>
        </div>
        <div class="col-auto">
          <!-- Status Badge -->
          <status-badge type="issue-status" :value="issue.status" />
        </div>
      </div>

      <!-- Title -->
      <div class="text-subtitle1 text-weight-bold q-mb-sm line-clamp-2">
        {{ issue.title }}
      </div>

      <!-- Description (if exists) -->
      <div v-if="issue.description" class="text-body2 text-grey-7 q-mb-md line-clamp-2">
        {{ issue.description }}
      </div>

      <!-- Metadata -->
      <div class="row items-center q-gutter-md text-caption text-grey-6">
        <!-- Story Points -->
        <div v-if="issue.story_points" class="row items-center">
          <q-icon name="radio_button_checked" size="xs" class="q-mr-xs" />
          {{ issue.story_points }} points
        </div>

        <!-- Assignee -->
        <div v-if="issue.assignee_id" class="row items-center">
          <q-icon name="person" size="xs" class="q-mr-xs" />
          Assignee #{{ issue.assignee_id }}
        </div>

        <!-- Due Date -->
        <div v-if="issue.due_date" class="row items-center">
          <q-icon name="event" size="xs" class="q-mr-xs" />
          {{ formatDate(issue.due_date) }}
        </div>
      </div>

      <!-- Updated At -->
      <div class="row items-center text-caption text-grey-6 q-mt-sm">
        Updated {{ formatRelativeTime(issue.updated_at) }}
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
import type { Issue } from 'src/types/models.types';
import { formatDate, formatRelativeTime } from 'src/utils/formatters';
import StatusBadge from 'src/components/common/StatusBadge.vue';

// ============================================
// Props
// ============================================

interface Props {
  issue: Issue;
  showActions?: boolean;
  draggable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showActions: false,
  draggable: false,
});

// ============================================
// Emits
// ============================================

const emit = defineEmits<{
  click: [issue: Issue];
  edit: [issue: Issue];
  delete: [issue: Issue];
}>();

// ============================================
// Methods
// ============================================

function handleClick() {
  emit('click', props.issue);
}

function handleEdit() {
  emit('edit', props.issue);
}

function handleDelete() {
  emit('delete', props.issue);
}
</script>

<style lang="scss" scoped>
.issue-card {
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
