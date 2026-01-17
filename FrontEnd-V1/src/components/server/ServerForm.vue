<template>
  <q-form @submit="handleSubmit" class="q-gutter-md">
    <!-- Name -->
    <q-input
      v-model="formData.name"
      label="Server Name *"
      hint="Enter a descriptive name for the server"
      :rules="[(val) => !!val || 'Name is required']"
      lazy-rules
    />

    <!-- Hostname -->
    <q-input
      v-model="formData.hostname"
      label="Hostname *"
      hint="Enter the server hostname"
      :rules="[(val) => !!val || 'Hostname is required']"
      lazy-rules
    />

    <!-- IP Address -->
    <q-input
      v-model="formData.ip_address"
      label="IP Address *"
      hint="Enter the server IP address"
      :rules="[
        (val) => !!val || 'IP address is required',
        (val) => isValidIP(val) || 'Invalid IP address format',
      ]"
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

    <!-- Description -->
    <q-input
      v-model="formData.description"
      type="textarea"
      label="Description"
      hint="Optional description of the server"
      rows="3"
    />

    <!-- Hardware Specifications -->
    <div class="row q-col-gutter-sm">
      <div class="col-12 col-sm-4">
        <q-input
          v-model.number="formData.cpu_cores"
          type="number"
          label="CPU Cores"
          hint="Number of CPU cores"
          min="1"
        />
      </div>
      <div class="col-12 col-sm-4">
        <q-input
          v-model.number="formData.memory_gb"
          type="number"
          label="Memory (GB)"
          hint="RAM in gigabytes"
          min="1"
        />
      </div>
      <div class="col-12 col-sm-4">
        <q-input
          v-model.number="formData.disk_gb"
          type="number"
          label="Disk (GB)"
          hint="Disk space in gigabytes"
          min="1"
        />
      </div>
    </div>

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
import { ref, watch } from 'vue';
import type { Server, ServerCreate, ServerUpdate } from 'src/types/models.types';

// ============================================
// Props
// ============================================

interface Props {
  server?: Server | null;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  server: null,
  loading: false,
});

// ============================================
// Emits
// ============================================

const emit = defineEmits<{
  submit: [data: ServerCreate | ServerUpdate];
  cancel: [];
}>();

// ============================================
// State
// ============================================

const formData = ref<ServerCreate>({
  name: '',
  hostname: '',
  ip_address: '',
  environment: 'development',
  type: 'web',
  status: 'stopped',
});

// Environment options
const environmentOptions = [
  { label: 'Production', value: 'production' },
  { label: 'Staging', value: 'staging' },
  { label: 'Development', value: 'development' },
];

// Type options
const typeOptions = [
  { label: 'Web Server', value: 'web' },
  { label: 'Database', value: 'database' },
  { label: 'Cache', value: 'cache' },
  { label: 'Queue', value: 'queue' },
  { label: 'Other', value: 'other' },
];

// Status options
const statusOptions = [
  { label: 'Running', value: 'running' },
  { label: 'Stopped', value: 'stopped' },
  { label: 'Maintenance', value: 'maintenance' },
  { label: 'Error', value: 'error' },
];

// ============================================
// Watch
// ============================================

watch(
  () => props.server,
  (server) => {
    if (server) {
      formData.value = {
        name: server.name,
        hostname: server.hostname,
        ip_address: server.ip_address,
        environment: server.environment,
        type: server.type,
        status: server.status,
      };

      // Optional fields
      if (server.description) {
        formData.value.description = server.description;
      }
      if (server.cpu_cores) {
        formData.value.cpu_cores = server.cpu_cores;
      }
      if (server.memory_gb) {
        formData.value.memory_gb = server.memory_gb;
      }
      if (server.disk_gb) {
        formData.value.disk_gb = server.disk_gb;
      }
    }
  },
  { immediate: true }
);

// ============================================
// Methods
// ============================================

function isValidIP(ip: string): boolean {
  // Simple IPv4 validation
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipv4Regex.test(ip)) {
    return false;
  }

  const parts = ip.split('.');
  return parts.every((part) => {
    const num = parseInt(part, 10);
    return num >= 0 && num <= 255;
  });
}

function handleSubmit() {
  const data = { ...formData.value };

  // Remove empty optional fields
  if (!data.description) {
    delete data.description;
  }
  if (!data.cpu_cores) {
    delete data.cpu_cores;
  }
  if (!data.memory_gb) {
    delete data.memory_gb;
  }
  if (!data.disk_gb) {
    delete data.disk_gb;
  }

  emit('submit', data);
}

function handleCancel() {
  emit('cancel');
}
</script>
