<template>
  <q-card class="deployment-card" :class="`deployment-card--${deployment.status}`">
    <q-card-section>
      <div class="row items-center justify-between q-mb-sm">
        <div class="col">
          <div class="text-h6 text-weight-medium">{{ deployment.version }}</div>
          <div class="text-caption text-grey-7">
            {{ formatEnvironment(deployment.environment) }}
          </div>
        </div>
        <div class="col-auto">
          <status-badge type="deployment-status" :value="deployment.status" />
        </div>
      </div>

      <div class="q-mb-sm">
        <div class="row items-center q-gutter-xs">
          <status-badge type="deployment-type" :value="deployment.type" size="sm" />
          <q-badge v-if="deployment.branch" color="grey-7" outline>
            <q-icon name="call_split" size="xs" class="q-mr-xs" />
            {{ deployment.branch }}
          </q-badge>
          <q-badge v-if="deployment.tag" color="primary" outline>
            <q-icon name="local_offer" size="xs" class="q-mr-xs" />
            {{ deployment.tag }}
          </q-badge>
        </div>
      </div>

      <div v-if="deployment.commit_hash" class="text-caption text-grey-7 q-mb-sm">
        <q-icon name="commit" size="xs" />
        <span class="q-ml-xs">{{ deployment.commit_hash.substring(0, 8) }}</span>
      </div>

      <div v-if="deployment.notes" class="text-body2 text-grey-8 q-mb-sm">
        {{ deployment.notes }}
      </div>

      <div v-if="deployment.error_message" class="text-body2 text-negative q-mb-sm">
        <q-icon name="error" size="sm" />
        <span class="q-ml-xs">{{ deployment.error_message }}</span>
      </div>

      <div class="text-caption text-grey-7">
        <div class="row items-center q-gutter-xs q-mb-xs">
          <q-icon name="schedule" size="xs" />
          <span v-if="deployment.started_at">
            시작: {{ formatDateTime(deployment.started_at) }}
          </span>
          <span v-else>시작 대기 중</span>
        </div>
        <div v-if="deployment.completed_at" class="row items-center q-gutter-xs">
          <q-icon name="done" size="xs" />
          <span>완료: {{ formatDateTime(deployment.completed_at) }}</span>
        </div>
        <div v-if="deployment.log_url" class="row items-center q-gutter-xs q-mt-xs">
          <a :href="deployment.log_url" target="_blank" class="text-primary">
            <q-icon name="description" size="xs" />
            <span class="q-ml-xs">로그 보기</span>
          </a>
        </div>
      </div>
    </q-card-section>

    <q-separator v-if="canEdit || canDelete || canRollback" />

    <q-card-actions v-if="canEdit || canDelete || canRollback" align="right">
      <q-btn
        v-if="canRollback && deployment.status === 'success'"
        flat
        dense
        icon="undo"
        color="warning"
        @click="handleRollback"
      >
        <q-tooltip>롤백</q-tooltip>
      </q-btn>
      <q-btn
        v-if="canEdit"
        flat
        dense
        icon="edit"
        color="primary"
        @click="handleEdit"
      >
        <q-tooltip>수정</q-tooltip>
      </q-btn>
      <q-btn
        v-if="canDelete"
        flat
        dense
        icon="delete"
        color="negative"
        @click="handleDelete"
      >
        <q-tooltip>삭제</q-tooltip>
      </q-btn>
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import { date } from 'quasar';
import type { Deployment } from 'src/types/models.types';
import StatusBadge from 'src/components/common/StatusBadge.vue';

// ============================================
// Props
// ============================================

interface Props {
  deployment: Deployment;
  canEdit?: boolean;
  canDelete?: boolean;
  canRollback?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  canEdit: true,
  canDelete: true,
  canRollback: true,
});

// ============================================
// Emits
// ============================================

const emit = defineEmits<{
  edit: [deployment: Deployment];
  delete: [deployment: Deployment];
  rollback: [deployment: Deployment];
}>();

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

function handleEdit() {
  emit('edit', props.deployment);
}

function handleDelete() {
  emit('delete', props.deployment);
}

function handleRollback() {
  emit('rollback', props.deployment);
}
</script>

<style scoped lang="scss">
.deployment-card {
  height: 100%;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &--pending {
    border-left: 4px solid $grey-5;
  }

  &--in_progress {
    border-left: 4px solid $primary;
  }

  &--success {
    border-left: 4px solid $positive;
  }

  &--failed {
    border-left: 4px solid $negative;
  }

  &--rolled_back {
    border-left: 4px solid $warning;
  }
}
</style>
