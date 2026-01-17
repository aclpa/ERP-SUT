<template>
  <q-page class="sprint-list-page">
    <!-- Header -->
    <div class="row items-center q-mb-lg">
      <div class="col">
        <div class="text-h4 text-weight-bold">Sprints</div>
        <div class="text-subtitle2 text-grey-7">Manage your sprint iterations</div>
      </div>
      <div class="col-auto">
        <q-btn color="primary" icon="add" label="New Sprint" @click="showCreateDialog = true" />
      </div>
    </div>

    <!-- Filters -->
    <q-card flat bordered class="q-mb-lg">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <!-- Search -->
          <div class="col-12 col-md-4">
            <q-input
              v-model="sprintStore.searchQuery"
              placeholder="Search sprints..."
              outlined
              dense
              clearable
              @update:model-value="handleSearch"
            >
              <template #prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>

          <!-- Project Filter -->
          <div class="col-12 col-sm-6 col-md-3">
            <q-select
              v-model="sprintStore.projectFilter"
              :options="projectFilterOptions"
              label="Project"
              outlined
              dense
              emit-value
              map-options
              clearable
              @update:model-value="loadSprints"
            />
          </div>

          <!-- Status Filter -->
          <div class="col-12 col-sm-6 col-md-3">
            <q-select
              v-model="sprintStore.statusFilter"
              :options="statusFilterOptions"
              label="Status"
              outlined
              dense
              emit-value
              map-options
              clearable
              @update:model-value="loadSprints"
            />
          </div>

          <!-- View Toggle -->
          <div class="col-12 col-md-2">
            <q-btn-toggle
              v-model="viewMode"
              :options="[
                { label: 'Grid', value: 'grid', icon: 'grid_view' },
                { label: 'List', value: 'list', icon: 'list' },
              ]"
              outline
              dense
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Loading -->
    <div v-if="sprintStore.isLoading" class="row q-col-gutter-md">
      <div v-for="i in 6" :key="i" class="col-12 col-sm-6 col-md-4">
        <q-skeleton type="rect" height="200px" />
      </div>
    </div>

    <!-- Empty State -->
    <empty-state
      v-else-if="!sprintStore.hasSprints"
      icon="event_note"
      title="No Sprints"
      message="Create your first sprint to get started"
    >
      <template #actions>
        <q-btn color="primary" label="Create Sprint" @click="showCreateDialog = true" />
      </template>
    </empty-state>

    <!-- Grid View -->
    <div v-else-if="viewMode === 'grid'" class="row q-col-gutter-md">
      <div
        v-for="sprint in sprintStore.filteredSprints"
        :key="sprint.id"
        class="col-12 col-sm-6 col-md-4"
      >
        <sprint-card
          :sprint="sprint"
          show-actions
          @click="handleSprintClick(sprint)"
          @edit="handleEdit(sprint)"
          @delete="handleDelete(sprint)"
          @start="handleStart(sprint)"
          @complete="handleComplete(sprint)"
        />
      </div>
    </div>

    <!-- List View -->
    <q-card v-else flat bordered>
      <q-list separator>
        <q-item
          v-for="sprint in sprintStore.filteredSprints"
          :key="sprint.id"
          clickable
          @click="handleSprintClick(sprint)"
        >
          <q-item-section>
            <q-item-label>{{ sprint.name }}</q-item-label>
            <q-item-label caption>{{ sprint.goal }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <status-badge type="sprint-status" :value="sprint.status" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>

    <!-- Pagination -->
    <div v-if="sprintStore.hasSprints" class="q-mt-lg flex justify-center">
      <pagination
        :page="sprintStore.currentPage"
        :size="sprintStore.pageSize"
        :total="sprintStore.totalCount"
        @update:page="handlePageChange"
        @update:size="handlePageSizeChange"
      />
    </div>

    <!-- Create/Edit Dialog -->
    <q-dialog v-model="showCreateDialog">
      <q-card style="min-width: 600px">
        <q-card-section>
          <div class="text-h6">{{ editingSprint ? 'Edit Sprint' : 'New Sprint' }}</div>
        </q-card-section>
        <q-card-section>
          <sprint-form
            :sprint="editingSprint ? editingSprint : undefined"
            :project-id="editingSprint?.project_id ?? 0"
            :loading="sprintStore.isLoading"
            :project-options="projectOptions"
            @submit="handleSubmit"
            @cancel="handleCancel"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useSprintStore } from 'src/stores/sprint.store';
import { useNotify } from 'src/composables/useNotify';
import type { Sprint, SprintCreate, SprintUpdate } from 'src/types/models.types';
import { SPRINT_STATUS_OPTIONS } from 'src/utils/constants';
import * as projectsApi from 'src/api/projects.api';
import SprintCard from 'src/components/sprint/SprintCard.vue';
import SprintForm from 'src/components/sprint/SprintForm.vue';
import StatusBadge from 'src/components/common/StatusBadge.vue';
import Pagination from 'src/components/common/Pagination.vue';
import EmptyState from 'src/components/common/EmptyState.vue';

const router = useRouter();
const sprintStore = useSprintStore();
const { notifySuccess, notifyError } = useNotify();

// ============================================
// State
// ============================================

const viewMode = ref<'grid' | 'list'>('grid');
const showCreateDialog = ref(false);
const editingSprint = ref<Sprint | null>(null);
const projectOptions = ref<{ label: string; value: number }[]>([]);

const statusFilterOptions = [{ label: 'All', value: '' }, ...SPRINT_STATUS_OPTIONS];

const projectFilterOptions = ref<{ label: string; value: number }[]>([
  { label: 'All Projects', value: 0 },
]);

// ============================================
// Methods
// ============================================

async function loadSprints() {
  try {
    await sprintStore.fetchSprints();
  } catch {
    notifyError('Failed to load sprints');
  }
}

function handleSearch() {
  void loadSprints();
}

function handleSprintClick(sprint: Sprint) {
  void router.push(`/sprints/${sprint.id}`);
}

function handleEdit(sprint: Sprint) {
  editingSprint.value = sprint;
  showCreateDialog.value = true;
}

async function handleDelete(sprint: Sprint) {
  // TODO: Add confirmation dialog
  try {
    await sprintStore.deleteSprint(sprint.id);
    notifySuccess('Sprint deleted successfully');
  } catch {
    notifyError('Failed to delete sprint');
  }
}

async function handleStart(sprint: Sprint) {
  try {
    await sprintStore.startSprint(sprint.id);
    notifySuccess('Sprint started successfully');
  } catch {
    notifyError('Failed to start sprint');
  }
}

async function handleComplete(sprint: Sprint) {
  try {
    await sprintStore.completeSprint(sprint.id);
    notifySuccess('Sprint completed successfully');
  } catch {
    notifyError('Failed to complete sprint');
  }
}

async function handleSubmit(data: SprintCreate | SprintUpdate) {
  try {
    if (editingSprint.value) {
      await sprintStore.updateSprint(editingSprint.value.id, data as SprintUpdate);
      notifySuccess('Sprint updated successfully');
    } else {
      await sprintStore.createSprint(data as SprintCreate);
      notifySuccess('Sprint created successfully');
    }
    showCreateDialog.value = false;
    editingSprint.value = null;
    void loadSprints();
  } catch {
    notifyError(editingSprint.value ? 'Failed to update sprint' : 'Failed to create sprint');
  }
}

function handleCancel() {
  showCreateDialog.value = false;
  editingSprint.value = null;
}

function handlePageChange(page: number) {
  sprintStore.setPage(page);
  void loadSprints();
}

function handlePageSizeChange(size: number) {
  sprintStore.setPageSize(size);
  void loadSprints();
}

// ============================================
// Lifecycle
// ============================================

async function loadProjects() {
  try {
    const response = await projectsApi.listProjects({ page: 1, size: 100 });
    projectOptions.value = response.items.map((project) => ({
      label: project.name,
      value: project.id,
    }));
    projectFilterOptions.value = [{ label: 'All Projects', value: 0 }, ...projectOptions.value];
  } catch {
    notifyError('Failed to load projects');
  }
}

onMounted(() => {
  void loadSprints();
  void loadProjects();
});
</script>

<style lang="scss" scoped>
.sprint-list-page {
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;
}
</style>
