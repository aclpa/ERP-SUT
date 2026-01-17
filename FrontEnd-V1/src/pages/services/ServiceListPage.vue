<template>
  <q-page padding>
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
      <div class="col">
        <div class="text-h4 text-weight-bold">Services</div>
        <div class="text-subtitle2 text-grey-7">
          Manage your application services
        </div>
      </div>
      <div class="col-auto">
        <q-btn
          color="primary"
          label="Add Service"
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
              placeholder="Search services..."
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
    <div v-if="serviceStore.isLoading" class="flex flex-center q-py-xl">
      <q-spinner-dots color="primary" size="50px" />
    </div>

    <!-- Empty State -->
    <empty-state
      v-else-if="!serviceStore.hasServices"
      icon="cloud"
      title="No services found"
      description="Start by adding your first service"
    >
      <q-btn
        color="primary"
        label="Add Service"
        @click="handleCreate"
      />
    </empty-state>

    <!-- Grid View -->
    <div v-else-if="viewMode === 'grid'" class="row q-col-gutter-md">
      <div
        v-for="service in serviceStore.services"
        :key="service.id"
        class="col-12 col-sm-6 col-md-4"
      >
        <service-card
          :service="service"
          @edit="handleEdit"
          @delete="handleDelete"
        />
      </div>
    </div>

    <!-- List View -->
    <q-table
      v-else
      :rows="serviceStore.services"
      :columns="columns"
      row-key="id"
      flat
      bordered
      :loading="serviceStore.isLoading"
    >
      <template v-slot:body-cell-name="props">
        <q-td :props="props">
          <div class="text-weight-medium">{{ props.row.name }}</div>
          <div v-if="props.row.url" class="text-caption text-grey-7">
            <a :href="props.row.url" target="_blank" class="text-primary">{{ props.row.url }}</a>
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-type="props">
        <q-td :props="props">
          <status-badge type="service-type" :value="props.row.type" />
        </q-td>
      </template>

      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <status-badge type="service-status" :value="props.row.status" />
        </q-td>
      </template>

      <template v-slot:body-cell-port="props">
        <q-td :props="props">
          <q-badge v-if="props.row.port" color="grey-7" outline>
            {{ props.row.port }}
          </q-badge>
          <span v-else class="text-grey-5">-</span>
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
    <div v-if="serviceStore.totalPages > 1" class="row justify-center q-mt-md">
      <q-pagination
        v-model="currentPage"
        :max="serviceStore.totalPages"
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
          <service-form
            :service="selectedService"
            :loading="serviceStore.isLoading"
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
import { useServiceStore } from 'src/stores/service.store';
import { useDialog } from 'src/composables/useDialog';
import type {
  Service,
  ServiceCreate,
  ServiceUpdate,
  ServiceType,
  ServiceStatus
} from 'src/types/models.types';
import ServiceCard from 'src/components/service/ServiceCard.vue';
import ServiceForm from 'src/components/service/ServiceForm.vue';
import StatusBadge from 'src/components/common/StatusBadge.vue';
import EmptyState from 'src/components/common/EmptyState.vue';

// ============================================
// Stores
// ============================================

const serviceStore = useServiceStore();
const { confirmDelete } = useDialog();

// ============================================
// State
// ============================================

const viewMode = ref<'grid' | 'list'>('grid');
const searchQuery = ref('');
const typeFilter = ref<ServiceType | ''>('');
const statusFilter = ref<ServiceStatus | ''>('');
const currentPage = ref(1);

const showDialog = ref(false);
const selectedService = ref<Service | null>(null);

// Type options
const typeOptions = [
  { label: 'Web Service', value: 'web' },
  { label: 'API Service', value: 'api' },
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
    label: 'Service',
    field: 'name',
    align: 'left' as const,
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
    name: 'port',
    label: 'Port',
    field: 'port',
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
  return selectedService.value ? 'Edit Service' : 'Create Service';
});

// ============================================
// Lifecycle
// ============================================

onMounted(() => {
  void loadServices();
});

// ============================================
// Methods
// ============================================

async function loadServices() {
  try {
    serviceStore.setSearchQuery(searchQuery.value);
    serviceStore.setTypeFilter(typeFilter.value);
    serviceStore.setStatusFilter(statusFilter.value);
    await serviceStore.fetchServices();
  } catch (error) {
    console.error('Failed to load services:', error);
  }
}

function handleSearch() {
  void loadServices();
}

function handlePageChange(page: number) {
  serviceStore.setPage(page);
  void loadServices();
}

function handleCreate() {
  selectedService.value = null;
  showDialog.value = true;
}

function handleEdit(service: Service) {
  selectedService.value = service;
  showDialog.value = true;
}

async function handleDelete(service: Service) {
  const confirmed = await confirmDelete(service.name);

  if (confirmed) {
    try {
      await serviceStore.deleteService(service.id);
      void loadServices();
    } catch (error) {
      console.error('Failed to delete service:', error);
    }
  }
}

async function handleSubmit(data: ServiceCreate | ServiceUpdate) {
  try {
    if (selectedService.value) {
      await serviceStore.updateService(selectedService.value.id, data as ServiceUpdate);
    } else {
      await serviceStore.createService(data as ServiceCreate);
    }
    showDialog.value = false;
    void loadServices();
  } catch (error) {
    console.error('Failed to save service:', error);
  }
}
</script>
