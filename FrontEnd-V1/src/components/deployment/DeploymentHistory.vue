<template>
  <div class="deployment-history">
    <!-- Loading -->
    <div v-if="isLoading" class="flex flex-center q-py-xl">
      <q-spinner-dots color="primary" size="50px" />
    </div>

    <!-- Empty State -->
    <empty-state
      v-else-if="!hasDeployments"
      icon="cloud_upload"
      title="No deployments found"
      description="No deployment history available for this service"
    />

    <!-- Timeline -->
    <q-timeline v-else color="primary">
      <q-timeline-entry
        v-for="deployment in deployments"
        :key="deployment.id"
        :title="deployment.version"
        :subtitle="formatDateTime(deployment.created_at)"
        :icon="getStatusIcon(deployment.status)"
        :color="getStatusColor(deployment.status)"
      >
        <div class="q-mb-sm">
          <div class="row items-center q-gutter-xs q-mb-xs">
            <status-badge type="deployment-status" :value="deployment.status" size="sm" />
            <status-badge type="deployment-type" :value="deployment.type" size="sm" />
            <q-badge :color="getEnvironmentColor(deployment.environment)" outline>
              {{ formatEnvironment(deployment.environment) }}
            </q-badge>
          </div>
        </div>

        <div v-if="deployment.branch || deployment.tag" class="q-mb-sm">
          <q-badge v-if="deployment.branch" color="grey-7" outline class="q-mr-xs">
            <q-icon name="call_split" size="xs" class="q-mr-xs" />
            {{ deployment.branch }}
          </q-badge>
          <q-badge v-if="deployment.tag" color="primary" outline>
            <q-icon name="local_offer" size="xs" class="q-mr-xs" />
            {{ deployment.tag }}
          </q-badge>
        </div>

        <div v-if="deployment.commit_hash" class="text-caption text-grey-7 q-mb-xs">
          <q-icon name="commit" size="xs" />
          <span class="q-ml-xs">{{ deployment.commit_hash.substring(0, 8) }}</span>
        </div>

        <div v-if="deployment.notes" class="text-body2 q-mb-sm">
          {{ deployment.notes }}
        </div>

        <div v-if="deployment.error_message" class="text-body2 text-negative q-mb-sm">
          <q-icon name="error" size="sm" />
          <span class="q-ml-xs">{{ deployment.error_message }}</span>
        </div>

        <div class="text-caption text-grey-7 q-mb-sm">
          <div v-if="deployment.started_at">
            시작: {{ formatDateTime(deployment.started_at) }}
          </div>
          <div v-if="deployment.completed_at">
            완료: {{ formatDateTime(deployment.completed_at) }}
          </div>
          <div v-if="deployment.started_at && deployment.completed_at">
            소요시간: {{ calculateDuration(deployment.started_at, deployment.completed_at) }}
          </div>
        </div>

        <div class="row q-gutter-xs">
          <q-btn
            v-if="deployment.log_url"
            flat
            dense
            size="sm"
            color="primary"
            icon="description"
            label="로그 보기"
            :href="deployment.log_url"
            target="_blank"
          />
          <q-btn
            v-if="canRollback && deployment.status === 'success'"
            flat
            dense
            size="sm"
            color="warning"
            icon="undo"
            label="롤백"
            @click="$emit('rollback', deployment)"
          />
        </div>
      </q-timeline-entry>
    </q-timeline>

    <!-- Load More -->
    <div v-if="hasMore" class="flex flex-center q-mt-md">
      <q-btn
        flat
        color="primary"
        label="Load More"
        @click="$emit('load-more')"
        :loading="isLoading"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { date } from 'quasar';
import type { Deployment } from 'src/types/models.types';
import StatusBadge from 'src/components/common/StatusBadge.vue';
import EmptyState from 'src/components/common/EmptyState.vue';
import { SERVER_ENVIRONMENT_COLORS } from 'src/utils/constants';

// ============================================
// Props
// ============================================

interface Props {
  deployments: Deployment[];
  isLoading?: boolean;
  hasMore?: boolean;
  canRollback?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  hasMore: false,
  canRollback: true,
});

// ============================================
// Emits
// ============================================

defineEmits<{
  rollback: [deployment: Deployment];
  'load-more': [];
}>();

// ============================================
// Computed
// ============================================

const hasDeployments = computed(() => props.deployments.length > 0);

// ============================================
// Methods
// ============================================

function formatDateTime(datetime: string): string {
  return date.formatDate(datetime, 'YYYY-MM-DD HH:mm:ss');
}

function formatEnvironment(env: string): string {
  const envMap: Record<string, string> = {
    production: '프로덕션',
    staging: '스테이징',
    dev: '개발',
    development: '개발',
    test: '테스트',
  };
  return envMap[env] || env;
}

function getEnvironmentColor(env: string): string {
  if (env === 'dev') env = 'development';
  return SERVER_ENVIRONMENT_COLORS[env as keyof typeof SERVER_ENVIRONMENT_COLORS] || 'grey';
}

function getStatusIcon(status: string): string {
  const iconMap: Record<string, string> = {
    pending: 'hourglass_empty',
    in_progress: 'cloud_upload',
    success: 'check_circle',
    failed: 'error',
    rolled_back: 'undo',
  };
  return iconMap[status] || 'circle';
}

function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    pending: 'grey',
    in_progress: 'primary',
    success: 'positive',
    failed: 'negative',
    rolled_back: 'warning',
  };
  return colorMap[status] || 'grey';
}

function calculateDuration(startTime: string, endTime: string): string {
  const start = new Date(startTime).getTime();
  const end = new Date(endTime).getTime();
  const diff = end - start;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours}시간 ${minutes % 60}분`;
  } else if (minutes > 0) {
    return `${minutes}분 ${seconds % 60}초`;
  } else {
    return `${seconds}초`;
  }
}
</script>

<style scoped lang="scss">
.deployment-history {
  width: 100%;
}
</style>
