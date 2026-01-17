<template>
  <div>
    <q-skeleton v-if="loading" type="rect" height="200px" />
    <div v-else-if="!sprint">
      <empty-state
        icon="timer"
        title="No Active Sprint"
        message="Start a new sprint to track progress"
      />
    </div>
    <div v-else>
      <!-- Sprint Header -->
      <div class="row items-center justify-between q-mb-md">
        <div>
          <div class="text-subtitle1 text-weight-bold">{{ sprint.name }}</div>
          <div class="text-caption text-grey-7">
            {{ formatDate(sprint.start_date) }} - {{ formatDate(sprint.end_date) }}
          </div>
        </div>
        <q-chip :color="getStatusColor(sprint.status)" text-color="white">
          {{ sprint.status }}
        </q-chip>
      </div>

      <!-- Progress Bar -->
      <div class="q-mb-md">
        <div class="row items-center justify-between q-mb-xs">
          <span class="text-caption">Progress</span>
          <span class="text-caption text-weight-bold">{{ progressPercentage }}%</span>
        </div>
        <q-linear-progress
          :value="progressPercentage / 100"
          size="12px"
          color="positive"
          track-color="grey-3"
          rounded
        />
      </div>

      <!-- Stats -->
      <div class="row q-col-gutter-sm">
        <div class="col-6">
          <q-card flat bordered>
            <q-card-section class="text-center q-pa-sm">
              <div class="text-h6 text-weight-bold text-positive">
                {{ sprint.completed_issues || 0 }}
              </div>
              <div class="text-caption text-grey-7">Completed</div>
            </q-card-section>
          </q-card>
        </div>
        <div class="col-6">
          <q-card flat bordered>
            <q-card-section class="text-center q-pa-sm">
              <div class="text-h6 text-weight-bold text-primary">
                {{ sprint.total_issues || 0 }}
              </div>
              <div class="text-caption text-grey-7">Total Issues</div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Days Remaining -->
      <div v-if="daysRemaining !== null" class="q-mt-md text-center">
        <q-chip
          :color="daysRemaining > 3 ? 'positive' : 'warning'"
          text-color="white"
          icon="event"
        >
          {{ daysRemaining }} days remaining
        </q-chip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Sprint } from 'src/types/models.types';
import { formatDate } from 'src/utils/formatters';
import { SPRINT_STATUS_COLORS } from 'src/utils/constants';
import EmptyState from 'src/components/common/EmptyState.vue';

// ============================================
// Props
// ============================================

interface Props {
  sprint: (Sprint & { completed_issues?: number; total_issues?: number }) | null;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  sprint: null,
  loading: false,
});

// ============================================
// Computed
// ============================================

const progressPercentage = computed(() => {
  if (!props.sprint || !props.sprint.total_issues) return 0;
  const completed = props.sprint.completed_issues || 0;
  const total = props.sprint.total_issues;
  return Math.round((completed / total) * 100);
});

const daysRemaining = computed(() => {
  if (!props.sprint || !props.sprint.end_date) return null;
  const endDate = new Date(props.sprint.end_date);
  const today = new Date();
  const diffTime = endDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
});

// ============================================
// Methods
// ============================================

function getStatusColor(status: string): string {
  return SPRINT_STATUS_COLORS[status as keyof typeof SPRINT_STATUS_COLORS] || 'grey';
}
</script>
