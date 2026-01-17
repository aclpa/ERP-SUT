<template>
  <q-form @submit="handleSubmit" class="q-gutter-md">
    <!-- Name -->
    <q-input
      v-model="formData.name"
      label="Service Name *"
      hint="Enter a descriptive name for the service"
      :rules="[(val) => !!val || 'Name is required']"
      lazy-rules
    />

    <!-- Type -->
    <q-select
      v-model="formData.type"
      :options="typeOptions"
      label="Type *"
      emit-value
      map-options
      :rules="[(val) => !!val || 'Type is required']"
      lazy-rules
    />

    <!-- Status -->
    <q-select
      v-model="formData.status"
      :options="statusOptions"
      label="Status *"
      emit-value
      map-options
      :rules="[(val) => !!val || 'Status is required']"
      lazy-rules
    />

    <!-- Server -->
    <q-select
      v-model="formData.server_id"
      :options="serverOptions"
      label="Server *"
      hint="Select the server hosting this service"
      option-value="id"
      option-label="name"
      emit-value
      map-options
      :rules="[(val) => !!val || 'Server is required']"
      lazy-rules
    />

    <!-- URL -->
    <q-input
      v-model="formData.url"
      label="Service URL"
      hint="Optional service URL"
      :rules="[
        (val) => !val || isValidURL(val) || 'Invalid URL format',
      ]"
      lazy-rules
    />

    <!-- Version -->
    <q-input
      v-model="formData.version"
      label="Version"
      hint="Optional service version"
    />

    <!-- Port -->
    <q-input
      v-model.number="formData.port"
      type="number"
      label="Port"
      hint="Optional port number"
      :rules="[
        (val) => !val || (val > 0 && val <= 65535) || 'Port must be between 1 and 65535',
      ]"
      lazy-rules
    />

    <!-- Description -->
    <q-input
      v-model="formData.description"
      type="textarea"
      label="Description"
      hint="Optional description of the service"
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
import type { Service, ServiceCreate, ServiceUpdate, Server } from 'src/types/models.types';
import { useServerStore } from 'src/stores/server.store';

// ============================================
// Props
// ============================================

interface Props {
  service?: Service | null;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  service: null,
  loading: false,
});

// ============================================
// Emits
// ============================================

const emit = defineEmits<{
  submit: [data: ServiceCreate | ServiceUpdate];
  cancel: [];
}>();

// ============================================
// Stores
// ============================================

const serverStore = useServerStore();

// ============================================
// State
// ============================================

const formData = ref<ServiceCreate>({
  name: '',
  server_id: 0,
  type: 'web',
  status: 'stopped',
});

const serverOptions = ref<Server[]>([]);

// Type options
const typeOptions = [
  { label: 'Web', value: 'web' },
  { label: 'API', value: 'api' },
  { label: 'Database', value: 'database' },
  { label: 'Cache', value: 'cache' },
  { label: 'Queue', value: 'queue' },
  { label: 'Worker', value: 'worker' },
  { label: 'Cron', value: 'cron' },
  { label: 'Other', value: 'other' },
];

// Status options
const statusOptions = [
  { label: 'Running', value: 'running' },
  { label: 'Stopped', value: 'stopped' },
  { label: 'Degraded', value: 'degraded' },
  { label: 'Maintenance', value: 'maintenance' },
  { label: 'Failed', value: 'failed' },
];

// ============================================
// Lifecycle
// ============================================

onMounted(() => {
  void loadServers();
});

// ============================================
// Watch
// ============================================

watch(
  () => props.service,
  (service) => {
    if (service) {
      formData.value = {
        name: service.name,
        server_id: service.server_id,
        type: service.type,
        status: service.status,
      };

      // Optional fields
      if (service.version) {
        formData.value.version = service.version;
      }
      if (service.url) {
        formData.value.url = service.url;
      }
      if (service.port) {
        formData.value.port = service.port;
      }
      if (service.description) {
        formData.value.description = service.description;
      }
    }
  },
  { immediate: true }
);

// ============================================
// Methods
// ============================================

async function loadServers() {
  try {
    await serverStore.fetchServers({ size: 100 });
    serverOptions.value = serverStore.servers;
  } catch (error) {
    console.error('Failed to load servers:', error);
  }
}

function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function handleSubmit() {
  const data = { ...formData.value };

  // Remove empty optional fields
  if (!data.description) {
    delete data.description;
  }
  if (!data.version) {
    delete data.version;
  }
  if (!data.url) {
    delete data.url;
  }
  if (!data.port) {
    delete data.port;
  }

  emit('submit', data);
}

function handleCancel() {
  emit('cancel');
}
</script>
