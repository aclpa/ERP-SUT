<template>
  <div class="project-stats">
    <q-card flat bordered>
      <q-card-section>
        <div class="text-h6 q-mb-md">Project Statistics</div>

        <q-linear-progress v-if="isLoading" indeterminate color="primary" class="q-mb-md" />

        <div v-else-if="stats" class="stats-grid">
          <div class="stat-item">
            <q-icon name="view_week" size="32px" color="primary" />
            <div class="stat-content">
              <div class="stat-value">{{ stats.total_sprints }}</div>
              <div class="stat-label">Total Sprints</div>
            </div>
          </div>

          <div class="stat-item">
            <q-icon name="play_circle" size="32px" color="positive" />
            <div class="stat-content">
              <div class="stat-value">{{ stats.active_sprints }}</div>
              <div class="stat-label">Active Sprints</div>
            </div>
          </div>

          <div class="stat-item">
            <q-icon name="assignment" size="32px" color="info" />
            <div class="stat-content">
              <div class="stat-value">{{ stats.total_issues }}</div>
              <div class="stat-label">Total Issues</div>
            </div>
          </div>

          <div class="stat-item">
            <q-icon name="warning" size="32px" color="warning" />
            <div class="stat-content">
              <div class="stat-value">{{ stats.open_issues }}</div>
              <div class="stat-label">Open Issues</div>
            </div>
          </div>

          <div class="stat-item">
            <q-icon name="check_circle" size="32px" color="positive" />
            <div class="stat-content">
              <div class="stat-value">{{ stats.completed_issues }}</div>
              <div class="stat-label">Completed</div>
            </div>
          </div>

          <div class="stat-item">
            <q-icon name="people" size="32px" color="secondary" />
            <div class="stat-content">
              <div class="stat-value">{{ stats.team_members }}</div>
              <div class="stat-label">Team Members</div>
            </div>
          </div>
        </div>

        <div v-else-if="!isLoading && !stats" class="text-grey-7 q-pa-md">
          Failed to load project statistics.
        </div>

        <div v-if="!isLoading && stats" class="q-mt-lg">
          <div class="text-body2 text-grey-7 q-mb-xs">Completion Rate: {{ completionRate }}%</div>
          <q-linear-progress :value="completionRate / 100" color="positive" size="12px" rounded />
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { getProjectStats } from 'src/api/projects.api';
import type { ProjectStats } from 'src/types/models.types';
import { useNotify } from 'src/composables/useNotify';

// ============================================
// Props & Emits
// ============================================

interface Props {
  projectId: number;
}
const props = defineProps<Props>();

// ============================================
// State
// ============================================

const stats = ref<ProjectStats | null>(null);
const isLoading = ref(false);
const { notifyError } = useNotify();

// ============================================
// Computed
// ============================================

const completionRate = computed(() => {
  if (!stats.value || stats.value.total_issues === 0) return 0;
  return Math.round((stats.value.completed_issues / stats.value.total_issues) * 100);
});

// ============================================
// Methods
// ============================================

async function fetchStats() {
  if (!props.projectId) return;

  isLoading.value = true;
  try {
    // 실제 API 호출
    stats.value = await getProjectStats(props.projectId);
  } catch (error) {
    console.error('Failed to fetch project stats:', error);
    const message = error instanceof Error ? error.message : 'An unknown error occurred';
    notifyError('Failed to fetch project stats', message);
    stats.value = null;
  } finally {
    isLoading.value = false;
  }
}

// ============================================
// Lifecycle
// ============================================

watch(
  () => props.projectId,
  (newId) => {
    if (newId) {
      void fetchStats();
    }
  },
  { immediate: true }, // 컴포넌트 마운트 시 즉시 실행
);
</script>

<style lang="scss" scoped>
/* 목업 UI의 스타일을 그대로 사용 */
.project-stats {
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 16px;
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: rgba(0, 0, 0, 0.02);
    border-radius: 8px;
    transition: all 0.2s;

    &:hover {
      background: rgba(0, 0, 0, 0.04);
      transform: translateY(-2px);
    }
  }

  .stat-content {
    flex: 1;
  }

  .stat-value {
    font-size: 24px;
    font-weight: 700;
    line-height: 1.2;
  }

  .stat-label {
    font-size: 12px;
    color: rgba(0, 0, 0, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
}

// Dark mode support
.body--dark {
  .project-stats {
    .stat-item {
      background: rgba(255, 255, 255, 0.05);

      &:hover {
        background: rgba(255, 255, 255, 0.08);
      }
    }

    .stat-label {
      color: rgba(255, 255, 255, 0.6);
    }
  }
}
</style>
