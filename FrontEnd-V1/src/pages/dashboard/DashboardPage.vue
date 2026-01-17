<template>
  <q-page class="dashboard-page">
    <!-- Page Header -->
    <div class="row items-center q-mb-lg">
      <div class="col">
        <div class="text-h4 text-weight-bold">Dash board</div>
        <div class="text-subtitle2 text-grey-7">Welcome back, {{ userFullName }}</div>
      </div>
      <div class="col-auto">
        <q-btn color="primary" icon="add" label="New Project" @click="handleCreateProject" />
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-3">
        <stats-card
          title="Total Projects"
          :value="stats.totalProjects"
          icon="folder"
          color="primary"
          :loading="loading"
        />
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <stats-card
          title="Active Sprints"
          :value="stats.activeSprints"
          icon="timer"
          color="secondary"
          :loading="loading"
        />
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <stats-card
          title="Open Issues"
          :value="stats.openIssues"
          icon="bug_report"
          color="warning"
          :loading="loading"
        />
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <stats-card
          title="My Tasks"
          :value="stats.myTasks"
          icon="task"
          color="positive"
          :loading="loading"
        />
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="row q-col-gutter-lg">
      <!-- Left Column -->
      <div class="col-12 col-md-8">
        <!-- Recent Projects -->
        <q-card class="q-mb-lg">
          <q-card-section>
            <div class="text-h6 q-mb-md">Recent Projects</div>
            <recent-projects :loading="loading" :projects="recentProjects" />
          </q-card-section>
        </q-card>

        <!-- Activity Feed -->
        <q-card class="q-mb-lg">
          <q-card-section>
            <div class="text-h6 q-mb-md">Recent Activity</div>
            <activity-feed :loading="loading" :activities="activities" />
          </q-card-section>
        </q-card>

        <!-- Issue Distribution Chart -->
        <q-card class="q-mb-lg">
          <q-card-section>
            <issue-distribution :loading="loading" />
          </q-card-section>
        </q-card>

        <!-- Deployment Frequency Chart -->
        <q-card>
          <q-card-section>
            <deployment-frequency :loading="loading" />
          </q-card-section>
        </q-card>
      </div>

      <!-- Right Column -->
      <div class="col-12 col-md-4">
        <!-- My Issues -->
        <q-card class="q-mb-lg">
          <q-card-section>
            <div class="text-h6 q-mb-md">My Issues</div>
            <my-issues :loading="loading" :issues="myIssues" />
          </q-card-section>
        </q-card>

        <!-- Sprint Progress -->
        <q-card class="q-mb-lg">
          <q-card-section>
            <div class="text-h6 q-mb-md">Sprint Progress</div>
            <sprint-progress :loading="loading" :sprint="currentSprint" />
          </q-card-section>
        </q-card>

        <!-- Burndown Chart -->
        <q-card class="q-mb-lg">
          <q-card-section>
            <div class="text-h6 q-mb-md">Sprint Burndown</div>
            <burndown-chart :loading="loading" :sprint-id="currentSprint?.id ?? null" />
          </q-card-section>
        </q-card>

        <!-- Deployment Status -->
        <deployment-status />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth.store';
import {
  getDashboardStats,
  getRecentProjects,
  getActiveSprint,
  getMyIssues,
} from 'src/api/dashboard.api';
import type { Sprint, Project, Issue } from 'src/types/models.types';
import StatsCard from 'src/components/dashboard/StatsCard.vue';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import RecentProjects from 'src/components/dashboard/RecentProjects.vue';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import MyIssues from 'src/components/dashboard/MyIssues.vue';
import ActivityFeed from 'src/components/dashboard/ActivityFeed.vue';
import SprintProgress from 'src/components/dashboard/SprintProgress.vue';
import DeploymentStatus from 'src/components/dashboard/DeploymentStatus.vue';
import IssueDistribution from 'src/components/charts/IssueDistribution.vue';
import BurndownChart from 'src/components/charts/BurndownChart.vue';
import DeploymentFrequency from 'src/components/charts/DeploymentFrequency.vue';

const router = useRouter();
const authStore = useAuthStore();

// ============================================
// State
// ============================================

const loading = ref(false);

const stats = ref({
  totalProjects: 0,
  activeSprints: 0,
  openIssues: 0,
  myTasks: 0,
});

const recentProjects = ref<Project[]>([]);
const myIssues = ref<Issue[]>([]);
const activities = ref([]);
const currentSprint = ref<Sprint | null>(null);

// ============================================
// Computed
// ============================================

const userFullName = computed(() => authStore.userFullName);

// ============================================
// Methods
// ============================================

async function loadDashboardData() {
  loading.value = true;
  try {
    // Fetch all dashboard data in parallel
    const [statsData, projectsData, issuesData, sprintData] = await Promise.all([
      getDashboardStats(),
      getRecentProjects(5),
      getMyIssues(10),
      getActiveSprint(),
    ]);

    // Update stats
    stats.value = {
      totalProjects: statsData.total_projects,
      activeSprints: statsData.active_sprints,
      openIssues: statsData.open_issues,
      myTasks: statsData.my_tasks,
    };

    // Update recent projects
    recentProjects.value = projectsData.items;

    // Update my issues
    myIssues.value = issuesData.items;

    // Update current sprint
    currentSprint.value = sprintData;

    // TODO: Implement activities feed API
    activities.value = [];
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
  } finally {
    loading.value = false;
  }
}

function handleCreateProject() {
  void router.push('/projects/create');
}

// ============================================
// Lifecycle
// ============================================

onMounted(() => {
  void loadDashboardData();
});
</script>

<style lang="scss" scoped>
.dashboard-page {
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;
}

@media (max-width: $breakpoint-sm-max) {
  .dashboard-page {
    padding: 16px;
  }
}
</style>
