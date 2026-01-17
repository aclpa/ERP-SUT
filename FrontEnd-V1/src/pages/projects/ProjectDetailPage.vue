<template>
  <q-page class="project-detail-page">
    <div class="q-pa-md">
      <div class="row items-center q-mb-lg">
        <q-btn flat round dense icon="arrow_back" @click="handleBack" />
        <div class="q-ml-md">
          <div class="text-h5">{{ project?.name || 'Loading...' }}</div>
          <div class="text-caption text-grey-7">
            {{ project?.key || '' }}
          </div>
        </div>

        <q-space />

        <q-btn v-if="project" flat icon="edit" label="Edit" color="primary" @click="handleEdit" />
        <q-btn
          v-if="project"
          flat
          icon="delete"
          label="Delete"
          color="negative"
          @click="handleDelete"
        />
      </div>

      <div v-if="loading" class="row justify-center q-py-xl">
        <q-spinner color="primary" size="50px" />
      </div>

      <div v-else-if="error" class="row justify-center q-py-xl">
        <q-card flat bordered class="q-pa-lg">
          <q-card-section class="text-center">
            <q-icon name="error" size="64px" color="negative" />
            <div class="text-h6 q-mt-md">{{ error }}</div>
            <q-btn label="Go Back" color="primary" flat class="q-mt-md" @click="handleBack" />
          </q-card-section>
        </q-card>
      </div>

      <div v-else-if="project">
        <q-card flat bordered class="q-mb-md">
          <q-card-section>
            <div class="row items-center q-gutter-md">
              <div>
                <q-badge
                  :color="getStatusColor(project.status)"
                  :label="project.status"
                  class="text-capitalize"
                />
              </div>
              <div class="text-body2">
                <q-icon name="calendar_today" size="xs" />
                Start: {{ formatDate(project.start_date) }}
              </div>
              <div v-if="project.end_date" class="text-body2">
                <q-icon name="event" size="xs" />
                End: {{ formatDate(project.end_date) }}
              </div>
            </div>

            <div v-if="project.description" class="q-mt-md text-body2">
              {{ project.description }}
            </div>
          </q-card-section>
        </q-card>

        <q-tabs
          v-model="activeTab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="left"
        >
          <q-tab name="overview" icon="dashboard" label="Overview" />
          <q-tab name="sprints" icon="view_week" label="Sprints" />
          <q-tab name="issues" icon="assignment" label="Issues" />
          <q-tab name="team" icon="people" label="Team" />
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="activeTab" animated>
          <q-tab-panel name="overview">
            <div class="row q-col-gutter-md">
              <div class="col-12">
                <project-stats :project-id="projectId" :loading="statsLoading" />
              </div>
            </div>
          </q-tab-panel>

          <q-tab-panel name="sprints">
            <div class="row q-mb-md">
              <q-space />
              <q-btn color="primary" icon="add" label="New Sprint" @click="handleCreateSprint" />
            </div>

            <div v-if="sprintsLoading" class="row justify-center q-py-lg">
              <q-spinner color="primary" size="40px" />
            </div>

            <div v-else-if="sprints.length === 0" class="text-center q-py-xl">
              <q-icon name="inbox" size="64px" color="grey-5" />
              <div class="text-h6 text-grey-6 q-mt-md">No sprints yet</div>
              <q-btn
                label="Create First Sprint"
                color="primary"
                flat
                class="q-mt-md"
                @click="handleCreateSprint"
              />
            </div>

            <div v-else class="row q-col-gutter-md">
              <div v-for="sprint in sprints" :key="sprint.id" class="col-12 col-md-6 col-lg-4">
                <sprint-card :sprint="sprint" />
              </div>
            </div>
          </q-tab-panel>

          <q-tab-panel name="issues">
            <div class="row q-mb-md">
              <q-space />
              <q-btn color="primary" icon="add" label="New Issue" @click="handleCreateIssue" />
            </div>

            <div v-if="issuesLoading" class="row justify-center q-py-lg">
              <q-spinner color="primary" size="40px" />
            </div>

            <div v-else-if="issues.length === 0" class="text-center q-py-xl">
              <q-icon name="inbox" size="64px" color="grey-5" />
              <div class="text-h6 text-grey-6 q-mt-md">No issues yet</div>
              <q-btn
                label="Create First Issue"
                color="primary"
                flat
                class="q-mt-md"
                @click="handleCreateIssue"
              />
            </div>

            <div v-else class="row q-col-gutter-md">
              <div v-for="issue in issues" :key="issue.id" class="col-12 col-md-6 col-lg-4">
                <issue-card :issue="issue" />
              </div>
            </div>
          </q-tab-panel>

          <q-tab-panel name="team">
            <div v-if="teamLoading" class="row justify-center q-py-lg">
              <q-spinner color="primary" size="40px" />
            </div>

            <div v-else-if="teamMembers.length === 0" class="text-center q-py-xl">
              <q-icon name="group" size="64px" color="grey-5" />
              <div class="text-h6 text-grey-6 q-mt-md">No team members assigned</div>
            </div>

            <q-card v-else flat bordered>
              <q-list separator>
                <q-item v-for="member in teamMembers" :key="member.id">
                  <q-item-section avatar>
                    <q-avatar color="primary" text-color="white">
                      {{ member.user?.full_name?.charAt(0).toUpperCase() || '?' }}
                    </q-avatar>
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ member.user?.full_name }}</q-item-label>
                    <q-item-label caption>{{ member.user?.email }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-badge :label="member.role" color="blue-grey-6" />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card>
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </div>

    <q-dialog v-model="showEditDialog">
      <project-form
        v-if="project"
        :project="project"
        @cancel="showEditDialog = false"
        @submit="handleUpdateProject"
      />
    </q-dialog>

    <q-dialog v-model="showDeleteDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Delete Project</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          Are you sure you want to delete this project? This action cannot be undone.
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey" v-close-popup />
          <q-btn flat label="Delete" color="negative" @click="confirmDelete" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { getProject, updateProject, deleteProject } from 'src/api/projects.api';
import { listSprints } from 'src/api/sprints.api';
import { listIssues } from 'src/api/issues.api';
import { listMembers } from 'src/api/members.api';
import type { Project, ProjectUpdate, Sprint, Issue, TeamMember } from 'src/types/models.types';
import { formatDate } from 'src/utils/formatters';
import ProjectStats from 'src/components/project/ProjectStats.vue';
import ProjectForm from 'src/components/project/ProjectForm.vue';
import SprintCard from 'src/components/sprint/SprintCard.vue';
import IssueCard from 'src/components/issue/IssueCard.vue';

// ============================================
// Composables
// ============================================

const route = useRoute();
const router = useRouter();
const $q = useQuasar();

// ============================================
// State
// ============================================

const projectId = Number(route.params.id);
const project = ref<Project | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

const activeTab = ref('overview');

// Sprints
const sprints = ref<Sprint[]>([]);
const sprintsLoading = ref(false);

// Issues
const issues = ref<Issue[]>([]);
const issuesLoading = ref(false);

// Team
const teamMembers = ref<TeamMember[]>([]);
const teamLoading = ref(false);

// Stats
const statsLoading = ref(false);

// Dialogs
const showEditDialog = ref(false);
const showDeleteDialog = ref(false);

// ============================================
// Methods
// ============================================

async function fetchProject() {
  loading.value = true;
  error.value = null;
  try {
    project.value = await getProject(projectId);
    // 프로젝트 로드가 성공하면, 해당 'team_id'로 멤버를 가져옵니다.
    if (project.value) {
      void fetchMembers(project.value.team_id);
    }
  } catch (err) {
    console.error('Failed to fetch project:', err);
    error.value = 'Failed to load project details';
  } finally {
    loading.value = false;
  }
}

async function fetchSprints() {
  sprintsLoading.value = true;
  try {
    const response = await listSprints({
      page: 1,
      size: 20, // 'page_size' -> 'size'
      project_id: projectId,
    });
    sprints.value = response.items;
  } catch (err) {
    console.error('Failed to fetch sprints:', err);
    $q.notify({
      type: 'negative',
      message: 'Failed to load sprints',
    });
  } finally {
    sprintsLoading.value = false;
  }
}

async function fetchIssues() {
  issuesLoading.value = true;
  try {
    const response = await listIssues({
      page: 1,
      size: 20, // 'page_size' -> 'size'
      project_id: projectId,
    });
    issues.value = response.items;
  } catch (err) {
    console.error('Failed to fetch issues:', err);
    $q.notify({
      type: 'negative',
      message: 'Failed to load issues',
    });
  } finally {
    issuesLoading.value = false;
  }
}

async function fetchMembers(teamId: number) {
  teamLoading.value = true;
  try {
    // 'members.api.ts'의 'listMembers' API를 호출합니다.
    const response = await listMembers(teamId, { page: 1, size: 50 });
    teamMembers.value = response.items;
  } catch (err) {
    console.error('Failed to fetch team members:', err);
    $q.notify({
      type: 'negative',
      message: 'Failed to load team members',
    });
  } finally {
    teamLoading.value = false;
  }
}

function handleBack() {
  void router.push('/projects');
}

function handleEdit() {
  showEditDialog.value = true;
}

function handleDelete() {
  showDeleteDialog.value = true;
}

async function handleUpdateProject(data: ProjectUpdate) {
  try {
    const updatedProject = await updateProject(projectId, data);
    project.value = updatedProject;
    showEditDialog.value = false;
    $q.notify({
      type: 'positive',
      message: 'Project updated successfully',
    });
  } catch (err) {
    console.error('Failed to update project:', err);
    $q.notify({
      type: 'negative',
      message: 'Failed to update project',
    });
  }
}

async function confirmDelete() {
  try {
    await deleteProject(projectId);
    $q.notify({
      type: 'positive',
      message: 'Project deleted successfully',
    });
    void router.push('/projects');
    // [!code !] (시작) 오류가 발생한 부분
  } catch (err) {
    // <-- { 추가
    console.error('Failed to delete project:', err);
    $q.notify({
      type: 'negative',
      message: 'Failed to delete project',
    });
  } // <-- } 추가
  // [!code !] (끝) 오류가 발생한 부분
  showDeleteDialog.value = false;
}

function handleCreateSprint() {
  void router.push('/sprints?project_id=' + projectId);
}

function handleCreateIssue() {
  void router.push('/issues?project_id=' + projectId);
}

function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    planning: 'grey',
    active: 'positive',
    on_hold: 'warning',
    completed: 'info',
    archived: 'grey-5',
  };
  return statusColors[status] || 'grey';
}

// ============================================
// Lifecycle
// ============================================

onMounted(() => {
  void fetchProject();
  void fetchSprints();
  void fetchIssues();
});
</script>

<style lang="scss" scoped>
.project-detail-page {
  min-height: 100vh;
}
</style>
