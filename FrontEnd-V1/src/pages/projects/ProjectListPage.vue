<template>
  <q-page class="project-list-page">
    <!-- Header -->
    <div class="row items-center q-mb-lg">
      <div class="col">
        <div class="text-h4 text-weight-bold">Projects</div>
        <div class="text-subtitle2 text-grey-7">Manage your project portfolio</div>
      </div>
      <div class="col-auto">
        <q-btn color="primary" icon="add" label="New Project" @click="showCreateDialog = true" />
      </div>
    </div>

    <!-- Filters -->
    <q-card flat bordered class="q-mb-lg">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <!-- Search -->
          <div class="col-12 col-md-6">
            <q-input
              v-model="projectStore.searchQuery"
              placeholder="Search projects..."
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

          <!-- Status Filter -->
          <div class="col-12 col-sm-6 col-md-3">
            <q-select
              v-model="projectStore.statusFilter"
              :options="statusFilterOptions"
              label="Status"
              outlined
              dense
              emit-value
              map-options
              clearable
              @update:model-value="loadProjects"
            />
          </div>

          <!-- View Toggle -->
          <div class="col-12 col-sm-6 col-md-3">
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
    <div v-if="projectStore.isLoading" class="row q-col-gutter-md">
      <div v-for="i in 6" :key="i" class="col-12 col-sm-6 col-md-4">
        <q-skeleton type="rect" height="200px" />
      </div>
    </div>

    <!-- Empty State -->
    <empty-state
      v-else-if="!projectStore.hasProjects"
      icon="folder_open"
      title="No Projects"
      message="Create your first project to get started"
    >
      <template #actions>
        <q-btn color="primary" label="Create Project" @click="showCreateDialog = true" />
      </template>
    </empty-state>

    <!-- Grid View -->
    <div v-else-if="viewMode === 'grid'" class="row q-col-gutter-md">
      <div
        v-for="project in projectStore.filteredProjects"
        :key="project.id"
        class="col-12 col-sm-6 col-md-4"
      >
        <project-card
          :project="project"
          show-actions
          @click="handleProjectClick(project)"
          @edit="handleEdit(project)"
          @delete="handleDelete(project)"
        />
      </div>
    </div>

    <!-- List View -->
    <q-card v-else flat bordered>
      <q-list separator>
        <q-item
          v-for="project in projectStore.filteredProjects"
          :key="project.id"
          clickable
          @click="handleProjectClick(project)"
        >
          <q-item-section>
            <q-item-label>{{ project.name }}</q-item-label>
            <q-item-label caption>{{ project.description }}</q-item-label>
          </q-item-section>
          <q-item-section side>
            <status-badge type="project-status" :value="project.status" />
          </q-item-section>
        </q-item>
      </q-list>
    </q-card>

    <!-- Pagination -->
    <div v-if="projectStore.hasProjects" class="q-mt-lg flex justify-center">
      <pagination
        :page="projectStore.currentPage"
        :size="projectStore.pageSize"
        :total="projectStore.totalCount"
        @update:page="handlePageChange"
        @update:size="handlePageSizeChange"
      />
    </div>

    <!-- Create/Edit Dialog -->
    <q-dialog v-model="showCreateDialog">
      <q-card style="min-width: 600px">
        <q-card-section>
          <div class="text-h6">{{ editingProject ? 'Edit Project' : 'New Project' }}</div>
        </q-card-section>
        <q-card-section>
          <project-form
            :project="editingProject"
            :loading="projectStore.isLoading"
            :team-options="teamOptions"
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
import { useProjectStore } from 'src/stores/project.store';
import { useNotify } from 'src/composables/useNotify';
import type { Project, ProjectCreate, ProjectUpdate } from 'src/types/models.types';
import { PROJECT_STATUS_OPTIONS } from 'src/utils/constants';
import * as teamsApi from 'src/api/teams.api';
import ProjectCard from 'src/components/project/ProjectCard.vue';
import ProjectForm from 'src/components/project/ProjectForm.vue';
import StatusBadge from 'src/components/common/StatusBadge.vue';
import Pagination from 'src/components/common/Pagination.vue';
import EmptyState from 'src/components/common/EmptyState.vue';

const router = useRouter();
const projectStore = useProjectStore();
const { notifySuccess, notifyError } = useNotify();

// ============================================
// State
// ============================================

const viewMode = ref<'grid' | 'list'>('grid');
const showCreateDialog = ref(false);
const editingProject = ref<Project | null>(null);
const teamOptions = ref<{ label: string; value: number }[]>([]);

const statusFilterOptions = [{ label: 'All', value: '' }, ...PROJECT_STATUS_OPTIONS];

// ============================================
// Methods
// ============================================

async function loadProjects() {
  try {
    await projectStore.fetchProjects();
  } catch {
    notifyError('Failed to load projects');
  }
}

function handleSearch() {
  void loadProjects();
}

function handleProjectClick(project: Project) {
  void router.push(`/projects/${project.id}`);
}

function handleEdit(project: Project) {
  editingProject.value = project;
  showCreateDialog.value = true;
}

async function handleDelete(project: Project) {
  // TODO: Add confirmation dialog
  try {
    await projectStore.deleteProject(project.id);
    notifySuccess('Project deleted successfully');
  } catch {
    notifyError('Failed to delete project');
  }
}

async function handleSubmit(data: ProjectCreate | ProjectUpdate) {
  try {
    if (editingProject.value) {
      await projectStore.updateProject(editingProject.value.id, data as ProjectUpdate);
      notifySuccess('Project updated successfully');
    } else {
      await projectStore.createProject(data as ProjectCreate);
      notifySuccess('Project created successfully');
    }
    showCreateDialog.value = false;
    editingProject.value = null;
    void loadProjects();
  } catch {
    notifyError(editingProject.value ? 'Failed to update project' : 'Failed to create project');
  }
}

function handleCancel() {
  showCreateDialog.value = false;
  editingProject.value = null;
}

function handlePageChange(page: number) {
  projectStore.setPage(page);
  void loadProjects();
}

function handlePageSizeChange(size: number) {
  projectStore.setPageSize(size);
  void loadProjects();
}

// ============================================
// Lifecycle
// ============================================

async function loadTeams() {
  try {
    const response = await teamsApi.listTeams({ page: 1, size: 100 });
    teamOptions.value = response.items.map((team) => ({
      label: team.name,
      value: team.id,
    }));
  } catch {
    notifyError('Failed to load teams');
  }
}

onMounted(() => {
  void loadProjects();
  void loadTeams();
});
</script>

<style lang="scss" scoped>
.project-list-page {
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;
}
</style>
