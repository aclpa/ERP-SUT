<template>
  <q-card flat bordered>
    <q-card-section>
      <div class="row items-center justify-between q-mb-md">
        <div class="text-h6">최근 배포 현황</div>
        <q-btn
          flat
          dense
          icon="open_in_new"
          color="primary"
          size="sm"
          @click="handleViewAll"
        >
          <q-tooltip>전체 보기</q-tooltip>
        </q-btn>
      </div>

      <!-- Loading -->
      <div v-if="deploymentStore.isLoading" class="flex flex-center q-py-lg">
        <q-spinner-dots color="primary" size="40px" />
      </div>

      <!-- Empty State -->
      <div v-else-if="recentDeployments.length === 0" class="text-center q-py-lg">
        <q-icon name="rocket_launch" size="48px" color="grey-5" />
        <div class="text-body2 text-grey-6 q-mt-sm">배포 이력이 없습니다</div>
      </div>

      <!-- Deployment List -->
      <q-list v-else separator>
        <q-item
          v-for="deployment in recentDeployments"
          :key="deployment.id"
          clickable
          @click="handleDeploymentClick(deployment)"
        >
          <q-item-section avatar>
            <q-avatar :color="getStatusColor(deployment.status)" text-color="white" icon="rocket_launch" />
          </q-item-section>

          <q-item-section>
            <q-item-label>
              <span class="text-weight-medium">{{ deployment.version }}</span>
              <q-badge
                :color="getEnvironmentColor(deployment.environment)"
                class="q-ml-sm"
                outline
              >
                {{ formatEnvironment(deployment.environment) }}
              </q-badge>
            </q-item-label>
            <q-item-label caption>
              {{ formatRelativeTime(deployment.created_at) }}
            </q-item-label>
          </q-item-section>

          <q-item-section side>
            <status-badge type="deployment-status" :value="deployment.status" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>

    <!-- Summary Stats -->
    <q-separator />
    <q-card-section class="row q-col-gutter-md">
      <div class="col-4 text-center">
        <div class="text-h6 text-positive">{{ stats.success }}</div>
        <div class="text-caption text-grey-7">성공</div>
      </div>
      <div class="col-4 text-center">
        <div class="text-h6 text-warning">{{ stats.inProgress }}</div>
        <div class="text-caption text-grey-7">진행중</div>
      </div>
      <div class="col-4 text-center">
        <div class="text-h6 text-negative">{{ stats.failed }}</div>
        <div class="text-caption text-grey-7">실패</div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useDeploymentStore } from 'src/stores/deployment.store';
import { formatRelativeTime } from 'src/utils/formatters';
import StatusBadge from 'src/components/common/StatusBadge.vue';
import type { Deployment } from 'src/types/models.types';

// ============================================
// Composables
// ============================================

const router = useRouter();
const deploymentStore = useDeploymentStore();

// ============================================
// Computed
// ============================================

const recentDeployments = computed(() => {
  return deploymentStore.deployments.slice(0, 5);
});

const stats = computed(() => {
  const all = deploymentStore.deployments;
  return {
    success: all.filter((d) => d.status === 'success').length,
    inProgress: all.filter((d) => d.status === 'in_progress' || d.status === 'pending').length,
    failed: all.filter((d) => d.status === 'failed').length,
  };
});

// ============================================
// Methods
// ============================================

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    pending: 'grey',
    in_progress: 'blue',
    success: 'positive',
    failed: 'negative',
    rolled_back: 'warning',
  };
  return colors[status] || 'grey';
}

function getEnvironmentColor(env: string): string {
  const colors: Record<string, string> = {
    production: 'negative',
    staging: 'warning',
    development: 'info',
    dev: 'info',
  };
  return colors[env] || 'grey';
}

function formatEnvironment(env: string): string {
  const envMap: Record<string, string> = {
    production: '프로덕션',
    staging: '스테이징',
    development: '개발',
    dev: '개발',
  };
  return envMap[env] || env;
}

function handleViewAll() {
  void router.push('/deployments');
}

function handleDeploymentClick(deployment: Deployment) {
  void router.push(`/deployments/${deployment.id}`);
}

// ============================================
// Lifecycle
// ============================================

onMounted(() => {
  void deploymentStore.fetchDeployments();
});
</script>

<style scoped lang="scss">
.q-item {
  &:hover {
    background-color: rgba(0, 0, 0, 0.03);
  }
}
</style>
