<template>
  <q-page padding>
    <!-- Header -->
    <div class="row items-center justify-between q-mb-md">
      <div class="col">
        <div class="text-h4 text-weight-bold">Deployments</div>
        <div class="text-subtitle2 text-grey-7">
          Manage your deployment history
        </div>
      </div>
      <div class="col-auto">
        <q-btn
          color="primary"
          label="New Deployment"
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
              placeholder="Search deployments..."
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
    <div v-if="deploymentStore.isLoading" class="flex flex-center q-py-xl">
      <q-spinner-dots color="primary" size="50px" />
    </div>

    <!-- Empty State -->
    <empty-state
      v-else-if="!deploymentStore.hasDeployments"
      icon="cloud_upload"
      title="No deployments found"
      description="Start by creating your first deployment"
    >
      <q-btn
        color="primary"
        label="New Deployment"
        @click="handleCreate"
      />
    </empty-state>

    <!-- Grid View -->
    <div v-else-if="viewMode === 'grid'" class="row q-col-gutter-md">
      <div
        v-for="deployment in deploymentStore.deployments"
        :key="deployment.id"
        class="col-12 col-sm-6 col-md-4"
      >
        <deployment-card
          :deployment="deployment"
          @edit="handleEdit"
          @delete="handleDelete"
          @rollback="handleRollback"
        />
      </div>
    </div>

    <!-- List View -->
    <q-table
      v-else
      :rows="deploymentStore.deployments"
      :columns="columns"
      row-key="id"
      flat
      bordered
      :loading="deploymentStore.isLoading"
    >
      <template v-slot:body-cell-version="props">
        <q-td :props="props">
          <div class="text-weight-medium">{{ props.row.version }}</div>
          <div class="text-caption text-grey-7">
            {{ formatEnvironment(props.row.environment) }}
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-type="props">
        <q-td :props="props">
          <status-badge type="deployment-type" :value="props.row.type" />
        </q-td>
      </template>

      <template v-slot:body-cell-status="props">
        <q-td :props="props">
          <status-badge type="deployment-status" :value="props.row.status" />
        </q-td>
      </template>

      <template v-slot:body-cell-git="props">
        <q-td :props="props">
          <div v-if="props.row.branch">
            <q-badge color="grey-7" outline>
              <q-icon name="call_split" size="xs" class="q-mr-xs" />
              {{ props.row.branch }}
            </q-badge>
          </div>
          <div v-if="props.row.tag" class="q-mt-xs">
            <q-badge color="primary" outline>
              <q-icon name="local_offer" size="xs" class="q-mr-xs" />
              {{ props.row.tag }}
            </q-badge>
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props">
          <q-btn
            v-if="props.row.status === 'success'"
            flat
            dense
            round
            icon="undo"
            color="warning"
            @click="handleRollback(props.row)"
          >
            <q-tooltip>롤백</q-tooltip>
          </q-btn>
          <q-btn
            flat
            dense
            round
            icon="edit"
            color="primary"
            @click="handleEdit(props.row)"
          >
            <q-tooltip>수정</q-tooltip>
          </q-btn>
          <q-btn
            flat
            dense
            round
            icon="delete"
            color="negative"
            @click="handleDelete(props.row)"
          >
            <q-tooltip>삭제</q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>

    <!-- Pagination -->
    <div v-if="deploymentStore.totalPages > 1" class="row justify-center q-mt-md">
      <q-pagination
        v-model="currentPage"
        :max="deploymentStore.totalPages"
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
          <deployment-form
            :deployment="selectedDeployment"
            :loading="deploymentStore.isLoading"
            @submit="handleSubmit"
            @cancel="showDialog = false"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Rollback Dialog -->
    <rollback-dialog
      v-model="showRollbackDialog"
      :deployment="rollbackTarget!"
      :loading="deploymentStore.isLoading"
      @confirm="handleRollbackConfirm"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useDeploymentStore } from 'src/stores/deployment.store';
import { useDialog } from 'src/composables/useDialog';
import type {
  Deployment,
  DeploymentCreate,
  DeploymentUpdate,
  DeploymentType,
  DeploymentStatus,
} from 'src/types/models.types';
import DeploymentCard from 'src/components/deployment/DeploymentCard.vue';
import DeploymentForm from 'src/components/deployment/DeploymentForm.vue';
import RollbackDialog from 'src/components/deployment/RollbackDialog.vue';
import StatusBadge from 'src/components/common/StatusBadge.vue';
import EmptyState from 'src/components/common/EmptyState.vue';
import {
  DEPLOYMENT_TYPE_OPTIONS,
  DEPLOYMENT_STATUS_OPTIONS,
  SERVER_ENVIRONMENT_OPTIONS,
} from 'src/utils/constants';

// ============================================
// Stores
// ============================================

const deploymentStore = useDeploymentStore();
const { confirmDelete } = useDialog();

// ============================================
// State
// ============================================

const viewMode = ref<'grid' | 'list'>('grid');
const searchQuery = ref('');
const environmentFilter = ref<string>('');
const typeFilter = ref<DeploymentType | ''>('');
const statusFilter = ref<DeploymentStatus | ''>('');
const currentPage = ref(1);

const showDialog = ref(false);
const selectedDeployment = ref<Deployment | null>(null);

const showRollbackDialog = ref(false);
const rollbackTarget = ref<Deployment | null>(null);

// Environment options
const environmentOptions = SERVER_ENVIRONMENT_OPTIONS.map((opt) => ({
  label: opt.label,
  value: opt.value === 'development' ? 'dev' : opt.value,
}));

// Type options
const typeOptions = DEPLOYMENT_TYPE_OPTIONS;

// Status options
const statusOptions = DEPLOYMENT_STATUS_OPTIONS;

// Table columns
const columns = [
  {
    name: 'version',
    label: 'Version',
    field: 'version',
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
    name: 'git',
    label: 'Git Info',
    field: '',
    align: 'center' as const,
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
  return selectedDeployment.value ? 'Edit Deployment' : 'Create Deployment';
});

// ============================================
// Lifecycle
// ============================================

onMounted(() => {
  void loadDeployments();
});

// ============================================
// Methods
// ============================================

async function loadDeployments() {
  try {
    deploymentStore.setSearchQuery(searchQuery.value);
    deploymentStore.setEnvironmentFilter(environmentFilter.value);
    deploymentStore.setTypeFilter(typeFilter.value);
    deploymentStore.setStatusFilter(statusFilter.value);
    await deploymentStore.fetchDeployments();
  } catch (error) {
    console.error('Failed to load deployments:', error);
  }
}

function handleSearch() {
  void loadDeployments();
}

function handlePageChange(page: number) {
  deploymentStore.setPage(page);
  void loadDeployments();
}

function handleCreate() {
  selectedDeployment.value = null;
  showDialog.value = true;
}

function handleEdit(deployment: Deployment) {
  selectedDeployment.value = deployment;
  showDialog.value = true;
}

async function handleDelete(deployment: Deployment) {
  const confirmed = await confirmDelete(deployment.version);

  if (confirmed) {
    try {
      await deploymentStore.deleteDeployment(deployment.id);
      void loadDeployments();
    } catch (error) {
      console.error('Failed to delete deployment:', error);
    }
  }
}

function handleRollback(deployment: Deployment) {
  rollbackTarget.value = deployment;
  showRollbackDialog.value = true;
}

async function handleRollbackConfirm(deploymentId: number, notes: string) {
  try {
    await deploymentStore.rollbackDeployment(deploymentId, deploymentId, notes);
    showRollbackDialog.value = false;
    void loadDeployments();
  } catch (error) {
    console.error('Failed to rollback deployment:', error);
  }
}

async function handleSubmit(data: DeploymentCreate | DeploymentUpdate) {
  try {
    if (selectedDeployment.value) {
      await deploymentStore.updateDeployment(selectedDeployment.value.id, data as DeploymentUpdate);
    } else {
      await deploymentStore.createDeployment(data as DeploymentCreate);
    }
    showDialog.value = false;
    void loadDeployments();
  } catch (error) {
    console.error('Failed to save deployment:', error);
  }
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
</script>
