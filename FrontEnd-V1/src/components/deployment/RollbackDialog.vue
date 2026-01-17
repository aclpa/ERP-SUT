<template>
  <q-dialog :model-value="modelValue" @update:model-value="handleClose" persistent>
    <q-card style="min-width: 500px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Rollback Deployment</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <div class="text-body1 q-mb-md">
          Are you sure you want to rollback to this deployment?
        </div>

        <!-- Current Deployment Info -->
        <q-card flat bordered class="q-mb-md">
          <q-card-section>
            <div class="text-subtitle2 text-grey-7 q-mb-xs">Target Deployment</div>
            <div class="text-h6">{{ deployment.version }}</div>
            <div class="text-caption text-grey-7">
              Environment: {{ formatEnvironment(deployment.environment) }}
            </div>
            <div v-if="deployment.branch" class="text-caption text-grey-7">
              Branch: {{ deployment.branch }}
            </div>
            <div v-if="deployment.tag" class="text-caption text-grey-7">
              Tag: {{ deployment.tag }}
            </div>
            <div v-if="deployment.commit_hash" class="text-caption text-grey-7">
              Commit: {{ deployment.commit_hash.substring(0, 8) }}
            </div>
          </q-card-section>
        </q-card>

        <!-- Notes -->
        <q-input
          v-model="notes"
          type="textarea"
          label="Rollback Reason"
          hint="Describe the reason for this rollback"
          rows="3"
          outlined
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          label="Cancel"
          color="grey-7"
          flat
          @click="handleClose"
        />
        <q-btn
          label="Confirm Rollback"
          color="warning"
          :loading="loading"
          @click="handleRollback"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Deployment } from 'src/types/models.types';

// ============================================
// Props
// ============================================

interface Props {
  modelValue: boolean;
  deployment: Deployment;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

// ============================================
// Emits
// ============================================

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  confirm: [deploymentId: number, notes: string];
}>();

// ============================================
// State
// ============================================

const notes = ref('');

// ============================================
// Watch
// ============================================

watch(
  () => props.modelValue,
  (newValue) => {
    if (!newValue) {
      notes.value = '';
    }
  }
);

// ============================================
// Methods
// ============================================

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

function handleClose() {
  emit('update:modelValue', false);
}

function handleRollback() {
  emit('confirm', props.deployment.id, notes.value);
}
</script>
