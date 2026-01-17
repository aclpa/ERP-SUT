<template>
  <q-page class="issue-list-page">
    <div class="q-px-md q-pb-md q-pt-none">
      <!-- Page Header -->
      <div class="row items-center justify-between q-mb-md">
        <div class="col">
          <h4 class="text-h4 text-weight-bold">Issues</h4>
          <div class="text-body2 text-grey-7">Manage and track project issues</div>
        </div>
        <div class="col-auto">
          <q-btn color="primary" label="New Issue" icon="add" @click="showCreateDialog = true" />
        </div>
      </div>

      <!-- Filters -->
      <q-card flat bordered class="q-mb-md">
        <q-card-section>
          <div class="row q-col-gutter-md">
            <!-- Search -->
            <div class="col-12 col-md-3">
              <q-input
                v-model="issueStore.searchQuery"
                label="Search"
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
            <div class="col-12 col-md-3">
              <q-select
                v-model="issueStore.projectFilter"
                :options="projectOptions"
                label="Project"
                outlined
                dense
                clearable
                emit-value
                map-options
                @update:model-value="loadIssues"
              />
            </div>

            <!-- Sprint Filter -->
            <div class="col-12 col-md-2">
              <q-select
                v-model="issueStore.sprintFilter"
                :options="sprintOptions"
                label="Sprint"
                outlined
                dense
                clearable
                emit-value
                map-options
                @update:model-value="loadIssues"
              />
            </div>

            <!-- Status Filter -->
            <div class="col-12 col-md-2">
              <q-select
                v-model="issueStore.statusFilter"
                :options="statusOptions"
                label="Status"
                outlined
                dense
                clearable
                emit-value
                map-options
                @update:model-value="loadIssues"
              />
            </div>

            <!-- Priority Filter -->
            <div class="col-12 col-md-2">
              <q-select
                v-model="issueStore.priorityFilter"
                :options="priorityOptions"
                label="Priority"
                outlined
                dense
                clearable
                emit-value
                map-options
                @update:model-value="loadIssues"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Issue List -->
      <div v-if="issueStore.isLoading" class="row justify-center q-pa-xl">
        <q-spinner-dots size="50px" color="primary" />
      </div>

      <div v-else-if="!issueStore.hasIssues" class="row justify-center q-pa-xl">
        <empty-state
          icon="assignment"
          title="No issues found"
          description="Create your first issue to get started"
        >
          <q-btn color="primary" label="Create Issue" @click="showCreateDialog = true" />
        </empty-state>
      </div>

      <div v-else>
        <!-- View Mode Toggle -->
        <div class="row items-center justify-between q-mb-md">
          <div class="col-auto">
            <div class="text-subtitle2 text-grey-7">{{ issueStore.totalCount }} issue(s) found</div>
          </div>
          <div class="col-auto">
            <q-btn-toggle
              v-model="viewMode"
              toggle-color="primary"
              :options="[
                { label: 'Grid', value: 'grid', icon: 'grid_view' },
                { label: 'List', value: 'list', icon: 'view_list' },
              ]"
              flat
            />
          </div>
        </div>

        <!-- Grid View -->
        <div v-if="viewMode === 'grid'" class="row q-col-gutter-md">
          <div
            v-for="issue in issueStore.filteredIssues"
            :key="issue.id"
            class="col-12 col-sm-6 col-md-4 col-lg-3"
          >
            <issue-card
              :issue="issue"
              :show-actions="true"
              @click="handleIssueClick(issue)"
              @edit="handleEditIssue(issue)"
              @delete="handleDeleteIssue(issue)"
            />
          </div>
        </div>

        <!-- List View -->
        <q-card v-else flat bordered>
          <q-list separator>
            <q-item
              v-for="issue in issueStore.filteredIssues"
              :key="issue.id"
              clickable
              @click="handleIssueClick(issue)"
            >
              <q-item-section>
                <q-item-label class="text-weight-bold">
                  {{ issue.title }}
                </q-item-label>
                <q-item-label caption>
                  {{ issue.description }}
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <div class="row q-gutter-xs">
                  <status-badge type="issue-type" :value="issue.type" size="sm" />
                  <status-badge type="issue-priority" :value="issue.priority" size="sm" />
                  <status-badge type="issue-status" :value="issue.status" />
                </div>
              </q-item-section>

              <q-item-section side>
                <div class="row q-gutter-xs">
                  <q-btn
                    flat
                    dense
                    round
                    icon="edit"
                    color="primary"
                    @click.stop="handleEditIssue(issue)"
                  >
                    <q-tooltip>Edit</q-tooltip>
                  </q-btn>
                  <q-btn
                    flat
                    dense
                    round
                    icon="delete"
                    color="negative"
                    @click.stop="handleDeleteIssue(issue)"
                  >
                    <q-tooltip>Delete</q-tooltip>
                  </q-btn>
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card>

        <!-- Pagination -->
        <div class="row justify-center q-mt-md">
          <common-pagination
            :page="issueStore.currentPage"
            :size="issueStore.pageSize"
            :total="issueStore.totalCount"
            @page-change="handlePageChange"
            @size-change="handleSizeChange"
          />
        </div>
      </div>
    </div>

    <!-- Create/Edit Dialog -->
    <q-dialog v-model="showCreateDialog">
      <q-card style="min-width: 600px">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ editingIssue ? 'Edit Issue' : 'New Issue' }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <issue-form
            :issue="editingIssue"
            :loading="issueStore.isLoading"
            :project-options="projectOptions"
            :sprint-options="sprintOptions"
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
import { useIssueStore } from 'src/stores/issue.store';
import { useProjectStore } from 'src/stores/project.store';
import { useSprintStore } from 'src/stores/sprint.store';
import { useAuthStore } from 'src/stores/auth.store';
import { useNotify } from 'src/composables/useNotify';
import { useDialog } from 'src/composables/useDialog';
import type { Issue, IssueCreate, IssueUpdate } from 'src/types/models.types';
import IssueCard from 'src/components/issue/IssueCard.vue';
import IssueForm from 'src/components/issue/IssueForm.vue';
import StatusBadge from 'src/components/common/StatusBadge.vue';
import CommonPagination from 'src/components/common/Pagination.vue';
import EmptyState from 'src/components/common/EmptyState.vue';

// ============================================
// Composables
// ============================================

const router = useRouter();
const issueStore = useIssueStore();
const projectStore = useProjectStore();
const sprintStore = useSprintStore();
const authStore = useAuthStore();
const { notifySuccess, notifyError } = useNotify();
const { confirmDelete } = useDialog();

// ============================================
// State
// ============================================

const viewMode = ref<'grid' | 'list'>('grid');
const showCreateDialog = ref(false);
const editingIssue = ref<Issue | null>(null);

const projectOptions = ref<{ label: string; value: number }[]>([]);
const sprintOptions = ref<{ label: string; value: number }[]>([]);

const statusOptions = [
  { label: 'To Do', value: 'todo' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'In Review', value: 'in_review' },
  { label: 'Testing', value: 'testing' },
  { label: 'Done', value: 'done' },
  { label: 'Closed', value: 'closed' },
];

const priorityOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Urgent', value: 'urgent' },
];

// ============================================
// Methods
// ============================================

async function loadIssues() {
  try {
    await issueStore.fetchIssues();
  } catch {
    notifyError('Failed to load issues');
  }
}

async function loadProjects() {
  try {
    const response = await projectStore.fetchProjects({ page: 1, size: 100 });
    projectOptions.value = response.items.map((project) => ({
      label: project.name,
      value: project.id,
    }));
  } catch {
    notifyError('Failed to load projects');
  }
}

async function loadSprints() {
  try {
    const response = await sprintStore.fetchSprints({ page: 1, size: 100 });
    sprintOptions.value = response.items.map((sprint) => ({
      label: sprint.name,
      value: sprint.id,
    }));
  } catch {
    notifyError('Failed to load sprints');
  }
}

function handleSearch() {
  void loadIssues();
}

function handlePageChange(page: number) {
  issueStore.setPage(page);
  void loadIssues();
}

function handleSizeChange(size: number) {
  issueStore.setPageSize(size);
  void loadIssues();
}

function handleIssueClick(issue: Issue) {
  void router.push(`/issues/${issue.id}`);
}

function handleEditIssue(issue: Issue) {
  editingIssue.value = issue;
  showCreateDialog.value = true;
}

async function handleDeleteIssue(issue: Issue) {
  const confirmed = await confirmDelete(issue.title);

  if (!confirmed) return;

  try {
    await issueStore.deleteIssue(issue.id);
    notifySuccess('Issue deleted successfully');
  } catch {
    notifyError('Failed to delete issue');
  }
}

async function handleSubmit(data: IssueCreate | IssueUpdate) {
  try {
    // Set reporter_id from current user
    if (!editingIssue.value && authStore.user) {
      (data as IssueCreate).reporter_id = authStore.user.id;
    }

    if (editingIssue.value) {
      await issueStore.updateIssue(editingIssue.value.id, data as IssueUpdate);
      notifySuccess('Issue updated successfully');
    } else {
      await issueStore.createIssue(data as IssueCreate);
      notifySuccess('Issue created successfully');
    }

    showCreateDialog.value = false;
    editingIssue.value = null;
  } catch {
    notifyError(editingIssue.value ? 'Failed to update issue' : 'Failed to create issue');
  }
}

function handleCancel() {
  showCreateDialog.value = false;
  editingIssue.value = null;
}

// ============================================
// Lifecycle
// ============================================

onMounted(() => {
  void loadIssues();
  void loadProjects();
  void loadSprints();
});
</script>

<style lang="scss" scoped>
.issue-list-page {
  max-width: 1400px;
  margin: 0 auto;
}
</style>
