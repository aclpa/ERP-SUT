<template>
  <q-dialog v-model="showDialog" position="top">
    <q-card style="width: 700px; max-width: 90vw">
      <!-- Search Input -->
      <q-card-section class="row items-center q-pb-none">
        <q-input
          ref="searchInputRef"
          v-model="searchQuery"
          placeholder="프로젝트, 이슈, 팀 검색... (Ctrl+K)"
          dense
          outlined
          autofocus
          class="full-width"
          @update:model-value="handleSearch"
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
          <template v-slot:append>
            <q-btn
              v-if="searchQuery"
              flat
              dense
              round
              icon="close"
              @click="searchQuery = ''"
            />
          </template>
        </q-input>
      </q-card-section>

      <!-- Loading -->
      <q-card-section v-if="isLoading" class="q-pt-none">
        <q-linear-progress indeterminate color="primary" />
      </q-card-section>

      <!-- Results -->
      <q-card-section v-if="!isLoading && hasResults" class="q-pt-none" style="max-height: 60vh; overflow-y: auto">
        <!-- Projects -->
        <div v-if="results.projects.length > 0" class="q-mb-md">
          <div class="text-caption text-grey-7 q-mb-xs">프로젝트</div>
          <q-list bordered separator>
            <q-item
              v-for="project in results.projects"
              :key="project.id"
              clickable
              v-ripple
              @click="navigateTo(`/projects/${project.id}`)"
            >
              <q-item-section avatar>
                <q-icon name="folder" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ project.name }}</q-item-label>
                <q-item-label caption v-if="project.description">{{ project.description }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <status-badge type="project-status" :value="project.status" />
              </q-item-section>
            </q-item>
          </q-list>
        </div>

        <!-- Issues -->
        <div v-if="results.issues.length > 0" class="q-mb-md">
          <div class="text-caption text-grey-7 q-mb-xs">이슈</div>
          <q-list bordered separator>
            <q-item
              v-for="issue in results.issues"
              :key="issue.id"
              clickable
              v-ripple
              @click="navigateTo(`/issues/${issue.id}`)"
            >
              <q-item-section avatar>
                <q-icon name="bug_report" color="negative" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ issue.title }}</q-item-label>
                <q-item-label caption v-if="issue.description">{{ truncate(issue.description, 60) }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <div class="column items-end q-gutter-xs">
                  <status-badge type="issue-status" :value="issue.status" />
                  <status-badge type="issue-priority" :value="issue.priority" />
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </div>

        <!-- Teams -->
        <div v-if="results.teams.length > 0">
          <div class="text-caption text-grey-7 q-mb-xs">팀</div>
          <q-list bordered separator>
            <q-item
              v-for="team in results.teams"
              :key="team.id"
              clickable
              v-ripple
              @click="navigateTo(`/teams/${team.id}`)"
            >
              <q-item-section avatar>
                <q-icon name="groups" color="secondary" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ team.name }}</q-item-label>
                <q-item-label caption v-if="team.description">{{ team.description }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </q-card-section>

      <!-- Empty State -->
      <q-card-section v-if="!isLoading && !hasResults && searchQuery" class="text-center q-py-lg">
        <q-icon name="search_off" size="64px" color="grey-5" />
        <div class="text-subtitle1 text-grey-7 q-mt-md">검색 결과가 없습니다</div>
        <div class="text-caption text-grey-6">다른 키워드로 검색해보세요</div>
      </q-card-section>

      <!-- Initial State -->
      <q-card-section v-if="!isLoading && !searchQuery" class="text-center q-py-lg">
        <q-icon name="search" size="64px" color="grey-5" />
        <div class="text-subtitle1 text-grey-7 q-mt-md">검색어를 입력하세요</div>
        <div class="text-caption text-grey-6">프로젝트, 이슈, 팀을 검색할 수 있습니다</div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useProjectStore } from 'src/stores/project.store';
import { useIssueStore } from 'src/stores/issue.store';
import { useTeamStore } from 'src/stores/team.store';
import StatusBadge from 'src/components/common/StatusBadge.vue';
import type { Project, Issue, Team } from 'src/types/models.types';

// ============================================
// Composables
// ============================================

const router = useRouter();
const projectStore = useProjectStore();
const issueStore = useIssueStore();
const teamStore = useTeamStore();

// ============================================
// State
// ============================================

const showDialog = defineModel<boolean>({ default: false });
const searchQuery = ref('');
const searchInputRef = ref();
const isLoading = ref(false);
const results = ref<{
  projects: Project[];
  issues: Issue[];
  teams: Team[];
}>({
  projects: [],
  issues: [],
  teams: [],
});

// ============================================
// Computed
// ============================================

const hasResults = computed(() => {
  return (
    results.value.projects.length > 0 ||
    results.value.issues.length > 0 ||
    results.value.teams.length > 0
  );
});

// ============================================
// Methods
// ============================================

let searchTimeout: ReturnType<typeof setTimeout> | null = null;

function handleSearch() {
  if (!searchQuery.value.trim()) {
    results.value = { projects: [], issues: [], teams: [] };
    return;
  }

  // Debounce search
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }

  searchTimeout = setTimeout(() => {
    void performSearch();
  }, 300);
}

async function performSearch() {
  isLoading.value = true;
  try {
    // Search in parallel
    const [projects, issues, teams] = await Promise.all([
      searchProjects(searchQuery.value),
      searchIssues(searchQuery.value),
      searchTeams(searchQuery.value),
    ]);

    results.value = {
      projects: projects.slice(0, 5), // Limit to 5 results per category
      issues: issues.slice(0, 5),
      teams: teams.slice(0, 5),
    };
  } catch (error) {
    console.error('Search error:', error);
    results.value = { projects: [], issues: [], teams: [] };
  } finally {
    isLoading.value = false;
  }
}

async function searchProjects(query: string): Promise<Project[]> {
  projectStore.setSearchQuery(query);
  await projectStore.fetchProjects();
  return projectStore.projects;
}

async function searchIssues(query: string): Promise<Issue[]> {
  issueStore.setSearchQuery(query);
  await issueStore.fetchIssues();
  return issueStore.issues;
}

async function searchTeams(query: string): Promise<Team[]> {
  teamStore.setSearchQuery(query);
  await teamStore.fetchTeams();
  return teamStore.teams;
}

function navigateTo(path: string) {
  showDialog.value = false;
  searchQuery.value = '';
  void router.push(path);
}

function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

// ============================================
// Keyboard Shortcut (Ctrl+K)
// ============================================

function handleKeyDown(event: KeyboardEvent) {
  if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
    event.preventDefault();
    showDialog.value = true;
  }

  // Close on Escape
  if (event.key === 'Escape' && showDialog.value) {
    showDialog.value = false;
  }
}

// ============================================
// Lifecycle
// ============================================

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
});

// Watch dialog to focus input when opened
watch(showDialog, (newValue) => {
  if (newValue) {
    setTimeout(() => {
      searchInputRef.value?.focus();
    }, 100);
  } else {
    searchQuery.value = '';
    results.value = { projects: [], issues: [], teams: [] };
  }
});
</script>

<style scoped lang="scss">
.q-card {
  border-radius: 8px;
}
</style>
