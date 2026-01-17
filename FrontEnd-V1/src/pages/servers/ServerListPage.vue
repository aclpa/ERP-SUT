<template>
  <q-page padding>
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
      <div class="col">
        <div class="text-h4 text-weight-bold">Servers</div>
        <div class="text-subtitle2 text-grey-7">
          Manage your infrastructure servers
        </div>
      </div>
      <div class="col-auto">
        <q-btn
          color="primary"
          label="Add Server"
          icon="add"
          @click="handleCreate"
        />
      </div>
    </div>

    <!-- Filters -->
    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <!-- Search -->
          <div class="col-12 col-md-4">
            <q-input
              v-model="searchQuery"
              placeholder="Search servers..."
              dense
              outlined
              clearable
              @update:model-value="handleSearch"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>

          <!-- Environment Filter -->
          <div class="col-12 col-sm-6 col-md-2">
            <q-select
              v-model="environmentFilter"
              :options="environmentOptions"
              label="Environment"
              dense
              outlined
              emit-value
              map-options
              clearable
              @update:model-value="handleSearch"
            />
          </div>

          <!-- Type Filter -->
          <div class="col-12 col-sm-6 col-md-2">
            <q-select
              v-model="typeFilter"
              :options="typeOptions"
              label="Type"
              dense
              outlined
              emit-value
              map-options
              clearable
              @update:model-value="handleSearch"
            />
          </div>

          <!-- Status Filter -->
          <div class="col-12 col-sm-6 col-md-2">
            <q-select
              v-model="statusFilter"
              :options="statusOptions"
              label="Status"
              dense
              outlined
              emit-value
              map-options
              clearable
              @update:model-value="handleSearch"
            />
          </div>

          <!-- View Toggle -->
          <div class="col-12 col-sm-6 col-md-2">
            <q-btn-toggle
              v-model="viewMode"
              toggle-color="primary"
              :options="[
                { label: 'Grid', value: 'grid', icon: 'grid_view' },
                { label: 'List', value: 'list', icon: 'list' },
              ]"
              dense
              spread
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Loading -->
    <div v-if="serverStore.isLoading" class="flex flex-center q-py-xl">
      <q-spinner-dots color="primary" size="50px" />
    </div>

    <!-- Empty State -->
    <empty-state
      v-else-if="!serverStore.hasServers"
      icon="dns"
      title="No servers found"
      description="Start by adding your first server"
    >
      <q-btn
        color="primary"
        label="Add Server"
        @click="handleCreate"
      />
    </empty-state>

    <!-- Grid View -->
    <div v-else-if="viewMode === 'grid'" class="row q-col-gutter-md">
      <div
        v-for="server in serverStore.servers"
        :key="server.id"
        class="col-12 col-sm-6 col-md-4"
      >
        <server-card
          :server="server"
          @edit="handleEdit"
          @delete="handleDelete"
        />
      </div>
    </div>

    <!-- List View -->
    <q-table
      v-else
      :rows="serverStore.servers"
      :columns="columns"
      row-key="id"
      flat
      bordered
      :loading="serverStore.isLoading"
    >
      <template v-slot:body-cell-name="props">
        <q-td :props="props">
          <div class="text-weight-medium">{{ props.row.name }}</div>
          <div class="text-caption text-grey-7">{{ props.row.hostname }}</div>
        </q-td>
      </template>

      <template v-slot:body-cell-environment="props">
        <q-td :props="props">
          <status-badge type="server-environment" :value="props.row.environment" />
        </q-td>
      </template>

      <template v-slot:body-cell-type="props">
        <q-td :props="props">
          <status-badge type="server-type" :value="props.row.type" />
        </q-td>
      </template>

      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <status-badge type="server-status" :value="props.row.status" />
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            flat
            dense
            round
            icon="edit"
            color="primary"
            @click="handleEdit(props.row)"
          >
            <q-tooltip>Edit</q-tooltip>
          </q-btn>
          <q-btn
            flat
            dense
            round
            icon="delete"
            color="negative"
            @click="handleDelete(props.row)"
          >
            <q-tooltip>Delete</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <!-- Pagination -->
    <div v-if="serverStore.totalPages > 1" class="row justify-center q-mt-md">
      <q-pagination
        v-model="currentPage"
        :max="serverStore.totalPages"
        :max-pages="7"
        boundary-numbers
        @update:model-value="handlePageChange"
      />
    </div>

    <!-- Create/Edit Dialog -->
    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ dialogTitle }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <server-form
            :server="selectedServer"
            :loading="serverStore.isLoading"
            @submit="handleSubmit"
            @cancel="showDialog = false"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useServerStore } from 'src/stores/server.store';
import { useDialog } from 'src/composables/useDialog';
import type {
  Server,
  ServerCreate,
  ServerUpdate,
  ServerEnvironment,
  ServerType,
  ServerStatus
} from 'src/types/models.types';
import ServerCard from 'src/components/server/ServerCard.vue';
import ServerForm from 'src/components/server/ServerForm.vue';
import StatusBadge from 'src/components/common/StatusBadge.vue';
import EmptyState from 'src/components/common/EmptyState.vue';

// ============================================
// Stores
// ============================================

const serverStore = useServerStore();
const { confirmDelete } = useDialog();

// ============================================
// State
// ============================================

const viewMode = ref<'grid' | 'list'>('grid');
const searchQuery = ref('');
const environmentFilter = ref<ServerEnvironment | ''>('');
const typeFilter = ref<ServerType | ''>('');
const statusFilter = ref<ServerStatus | ''>('');
const currentPage = ref(1);

const showDialog = ref(false);
const selectedServer = ref<Server | null>(null);

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

// Table columns
const columns = [
  {
    name: 'name',
    label: 'Server',
    field: 'name',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'ip_address',
    label: 'IP Address',
    field: 'ip_address',
    align: 'left' as const,
    sortable: true,
  },
  {
    name: 'environment',
    label: 'Environment',
    field: 'environment',
    align: 'center' as const,
    sortable: true,
  },
  {
    name: 'type',
    label: 'Type',
    field: 'type',
    align: 'center' as const,
    sortable: true,
  },
  {
    name: 'status',
    label: 'Status',
    field: 'status',
    align: 'center' as const,
    sortable: true,
  },
  {
    name: 'actions',
    label: 'Actions',
    field: '',
    align: 'center' as const,
  },
];

// ============================================
// Computed
// ============================================

const dialogTitle = computed(() => {
  return selectedServer.value ? 'Edit Server' : 'Create Server';
});

// ============================================
// Lifecycle
// ============================================

onMounted(() => {
  void loadServers();
});

// ============================================
// Methods
// ============================================

async function loadServers() {
  try {
    serverStore.setSearchQuery(searchQuery.value);
    serverStore.setEnvironmentFilter(environmentFilter.value);
    serverStore.setTypeFilter(typeFilter.value);
    serverStore.setStatusFilter(statusFilter.value);
    await serverStore.fetchServers();
  } catch (error) {
    console.error('Failed to load servers:', error);
  }
}

function handleSearch() {
  void loadServers();
}

function handlePageChange(page: number) {
  serverStore.setPage(page);
  void loadServers();
}

function handleCreate() {
  selectedServer.value = null;
  showDialog.value = true;
}

function handleEdit(server: Server) {
  selectedServer.value = server;
  showDialog.value = true;
}

async function handleDelete(server: Server) {
  const confirmed = await confirmDelete(server.name);

  if (confirmed) {
    try {
      await serverStore.deleteServer(server.id);
      void loadServers();
    } catch (error) {
      console.error('Failed to delete server:', error);
    }
  }
}

async function handleSubmit(data: ServerCreate | ServerUpdate) {
  try {
    if (selectedServer.value) {
      await serverStore.updateServer(selectedServer.value.id, data as ServerUpdate);
    } else {
      await serverStore.createServer(data as ServerCreate);
    }
    showDialog.value = false;
    void loadServers();
  } catch (error) {
    console.error('Failed to save server:', error);
  }
}
</script>
