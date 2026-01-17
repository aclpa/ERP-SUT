<template>
  <q-card class="sprint-card" @click="handleClick">
    <q-card-section>
      <!-- Header -->
      <div class="row items-center justify-between q-mb-sm">
        <div class="col">
          <div class="text-h6 text-weight-bold ellipsis">{{ sprint.name }}</div>
        </div>
        <div class="col-auto">
          <status-badge type="sprint-status" :value="sprint.status" />
        </div>
      </div>

      <!-- Goal -->
      <div v-if="sprint.goal" class="text-body2 text-grey-7 q-mb-md line-clamp-2">
        {{ sprint.goal }}
      </div>

      <!-- Dates -->
      <div class="row q-col-gutter-sm q-mb-md">
        <div class="col-12 col-sm-6">
          <div class="text-caption text-grey-7">
            <q-icon name="event" size="xs" class="q-mr-xs" />
            Start: {{ formatDate(sprint.start_date) }}
          </div>
        </div>
        <div class="col-12 col-sm-6">
          <div class="text-caption text-grey-7">
            <q-icon name="event" size="xs" class="q-mr-xs" />
            End: {{ formatDate(sprint.end_date) }}
          </div>
        </div>
      </div>

      <!-- Progress -->
      <div v-if="sprint.total_issues && sprint.total_issues > 0" class="q-mb-md">
        <div class="row items-center q-mb-xs">
          <div class="col text-caption text-grey-7">
            {{ sprint.completed_issues || 0 }} / {{ sprint.total_issues }} issues
          </div>
          <div class="col-auto text-caption text-weight-bold">
            {{ progressPercentage }}%
          </div>
        </div>
        <q-linear-progress
          :value="progressPercentage / 100"
          color="primary"
          size="8px"
          rounded
        />
      </div>

      <!-- Metadata -->
      <div class="row items-center text-caption text-grey-6">
        <div class="col">
          Updated {{ formatRelativeTime(sprint.updated_at) }}
        </div>
      </div>
    </q-card-section>

    <!-- Actions -->
    <q-card-actions v-if="showActions" align="right">
      <q-btn
        v-if="sprint.status === 'planning'"
        flat
        dense
        icon="play_arrow"
        color="positive"
        @click.stop="handleStart"
      >
        <q-tooltip>Start Sprint</q-tooltip>
      </q-btn>
      <q-btn
        v-if="sprint.status === 'active'"
        flat
        dense
        icon="check_circle"
        color="positive"
        @click.stop="handleComplete"
      >
        <q-tooltip>Complete Sprint</q-tooltip>
      </q-btn>
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
import { computed } from 'vue';
import type { Sprint } from 'src/types/models.types';
import { formatDate, formatRelativeTime } from 'src/utils/formatters';
import StatusBadge from 'src/components/common/StatusBadge.vue';

// ============================================
// Props
// ============================================

interface Props {
  sprint: Sprint;
  showActions?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showActions: false,
});

// ============================================
// Emits
// ============================================

const emit = defineEmits<{
  click: [sprint: Sprint];
  edit: [sprint: Sprint];
  delete: [sprint: Sprint];
  start: [sprint: Sprint];
  complete: [sprint: Sprint];
}>();

// ============================================
// Computed
// ============================================

const progressPercentage = computed(() => {
  if (!props.sprint.total_issues || props.sprint.total_issues === 0) return 0;
  const completed = props.sprint.completed_issues || 0;
  return Math.round((completed / props.sprint.total_issues) * 100);
});

// ============================================
// Methods
// ============================================

function handleClick() {
  emit('click', props.sprint);
}

function handleEdit() {
  emit('edit', props.sprint);
}

function handleDelete() {
  emit('delete', props.sprint);
}

function handleStart() {
  emit('start', props.sprint);
}

function handleComplete() {
  emit('complete', props.sprint);
}
</script>

<style lang="scss" scoped>
.sprint-card {
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
