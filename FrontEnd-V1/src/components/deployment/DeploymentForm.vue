<template>
  <q-form @submit="handleSubmit" class="q-gutter-md">
    <!-- Service Selection -->
    <q-select
      v-model="formData.service_id"
      :options="serviceOptions"
      label="Service *"
      hint="Select the service to deploy"
      option-value="id"
      option-label="name"
      emit-value
      map-options
      :rules="[(val) => !!val || 'Service is required']"
      lazy-rules
    />

    <!-- Version -->
    <q-input
      v-model="formData.version"
      label="Version *"
      hint="Deployment version (e.g., v1.0.0, 2024.01.15)"
      :rules="[(val) => !!val || 'Version is required']"
      lazy-rules
    />

    <!-- Environment -->
    <q-select
      v-model="formData.environment"
      :options="environmentOptions"
      label="Environment *"
      emit-value
      map-options
      :rules="[(val) => !!val || 'Environment is required']"
      lazy-rules
    />

    <!-- Git Information -->
    <div class="text-subtitle2 q-mb-sm">Git Information (Optional)</div>

    <q-input
      v-model="formData.commit_hash"
      label="Commit Hash"
      hint="Git commit hash (40 characters)"
      maxlength="40"
      :rules="[
        (val) => !val || val.length === 40 || 'Commit hash must be 40 characters',
        (val) => !val || /^[a-f0-9]+$/.test(val) || 'Invalid commit hash format',
      ]"
      lazy-rules
    />

    <q-input
      v-model="formData.branch"
      label="Branch"
      hint="Git branch name"
      maxlength="100"
    />

    <q-input
      v-model="formData.tag"
      label="Tag"
      hint="Git tag"
      maxlength="100"
    />

    <!-- Deployment Type -->
    <q-select
      v-model="formData.type"
      :options="typeOptions"
      label="Deployment Type"
      emit-value
      map-options
    />

    <!-- Status -->
    <q-select
      v-model="formData.status"
      :options="statusOptions"
      label="Status"
      emit-value
      map-options
    />

    <!-- Notes -->
    <q-input
      v-model="formData.notes"
      type="textarea"
      label="Notes"
      hint="Deployment notes or description"
      rows="3"
    />

    <!-- Actions -->
    <div class="row justify-end q-gutter-sm">
      <q-btn
        label="Cancel"
        color="grey-7"
        flat
        @click="handleCancel"
      />
      <q-btn
        label="Save"
        type="submit"
        color="primary"
        :loading="loading"
      />
    </div>
  </q-form>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import type {
  Deployment,
  DeploymentCreate,
  DeploymentUpdate,
  Service,
} from 'src/types/models.types';
import { useServiceStore } from 'src/stores/service.store';
import {
  DEPLOYMENT_TYPE_OPTIONS,
  DEPLOYMENT_STATUS_OPTIONS,
  SERVER_ENVIRONMENT_OPTIONS,
} from 'src/utils/constants';

// ============================================
// Props
// ============================================

interface Props {
  deployment?: Deployment | null;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  deployment: null,
  loading: false,
});

// ============================================
// Emits
// ============================================

const emit = defineEmits<{
  submit: [data: DeploymentCreate | DeploymentUpdate];
  cancel: [];
}>();

// ============================================
// Stores
// ============================================

const serviceStore = useServiceStore();

// ============================================
// State
// ============================================

const formData = ref<DeploymentCreate>({
  service_id: 0,
  version: '',
  environment: 'staging',
  type: 'manual',
  status: 'pending',
});

const serviceOptions = ref<Service[]>([]);

// Environment options
const environmentOptions = SERVER_ENVIRONMENT_OPTIONS.map((opt) => ({
  label: opt.label,
  value: opt.value === 'development' ? 'dev' : opt.value,
}));

// Type options
const typeOptions = DEPLOYMENT_TYPE_OPTIONS;

// Status options
const statusOptions = DEPLOYMENT_STATUS_OPTIONS;

// ============================================
// Lifecycle
// ============================================

onMounted(() => {
  void loadServices();
});

// ============================================
// Watch
// ============================================

watch(
  () => props.deployment,
  (deployment) => {
    if (deployment) {
      formData.value = {
        service_id: deployment.service_id,
        version: deployment.version,
        environment: deployment.environment,
        type: deployment.type,
        status: deployment.status,
      };

      // Optional fields
      if (deployment.commit_hash) {
        formData.value.commit_hash = deployment.commit_hash;
      }
      if (deployment.branch) {
        formData.value.branch = deployment.branch;
      }
      if (deployment.tag) {
        formData.value.tag = deployment.tag;
      }
      if (deployment.notes) {
        formData.value.notes = deployment.notes;
      }
    }
  },
  { immediate: true }
);

// ============================================
// Methods
// ============================================

async function loadServices() {
  try {
    await serviceStore.fetchServices({ size: 100 });
    serviceOptions.value = serviceStore.services;
  } catch (error) {
    console.error('Failed to load services:', error);
  }
}

function handleSubmit() {
  const data = { ...formData.value };

  // Remove empty optional fields
  if (!data.commit_hash) {
    delete data.commit_hash;
  }
  if (!data.branch) {
    delete data.branch;
  }
  if (!data.tag) {
    delete data.tag;
  }
  if (!data.notes) {
    delete data.notes;
  }

  emit('submit', data);
}

function handleCancel() {
  emit('cancel');
}
</script>
