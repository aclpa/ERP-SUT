<template>
  <div class="issue-distribution-chart">
    <!-- Distribution Type Selector -->
    <div class="row items-center justify-between q-mb-md">
      <div class="text-subtitle1 text-weight-medium">Issue Distribution</div>
      <q-btn-toggle
        v-model="distributionType"
        :options="[
          { label: 'Type', value: 'type' },
          { label: 'Status', value: 'status' },
          { label: 'Priority', value: 'priority' },
        ]"
        dense
        unelevated
        toggle-color="primary"
        color="grey-3"
        text-color="grey-8"
      />
    </div>

    <!-- Chart -->
    <Doughnut v-if="!isLoadingData && chartData" :data="chartData" :options="chartOptions" />
    <div v-else-if="isLoadingData || loading" class="flex flex-center q-py-xl">
      <q-spinner-dots color="primary" size="40px" />
    </div>
    <div v-else class="text-center q-py-xl text-grey-6">
      <q-icon name="pie_chart" size="48px" />
      <div class="text-body2 q-mt-sm">데이터가 없습니다</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
import { Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, type ChartData, type ChartOptions } from 'chart.js';
import { listIssues } from 'src/api/issues.api';
import type { Issue } from 'src/types/models.types';
import type { QueryParams } from 'src/types/api.types';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// ============================================
// Props
// ============================================

interface Props {
  projectId?: number | null;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  projectId: null,
  loading: false,
});

// ============================================
// State
// ============================================

type DistributionType = 'type' | 'status' | 'priority';
const distributionType = ref<DistributionType>('type');
const isLoadingData = ref(false);
const issues = ref<Issue[]>([]);

// ============================================
// Data Fetching
// ============================================

async function fetchIssues() {
  isLoadingData.value = true;
  try {
    const params: QueryParams = {
      page: 1,
      page_size: 100, // Max allowed by backend
    };

    if (props.projectId) {
      params.project_id = props.projectId;
    }

    const response = await listIssues(params);
    issues.value = response.items;
  } catch (error) {
    console.error('Failed to fetch issues for distribution chart:', error);
    issues.value = [];
  } finally {
    isLoadingData.value = false;
  }
}

// ============================================
// Computed Data
// ============================================

const distributionData = computed(() => {
  if (issues.value.length === 0) {
    return null;
  }

  if (distributionType.value === 'type') {
    const typeCounts = {
      epic: 0,
      story: 0,
      task: 0,
      bug: 0,
      improvement: 0,
    };

    issues.value.forEach((issue) => {
      typeCounts[issue.type]++;
    });

    return {
      labels: ['Epic', 'Story', 'Task', 'Bug', 'Improvement'],
      data: [
        typeCounts.epic,
        typeCounts.story,
        typeCounts.task,
        typeCounts.bug,
        typeCounts.improvement,
      ],
      colors: ['#9C27B0', '#2196F3', '#4CAF50', '#F44336', '#FF9800'],
    };
  }

  if (distributionType.value === 'status') {
    const statusCounts = {
      todo: 0,
      in_progress: 0,
      in_review: 0,
      testing: 0,
      done: 0,
      closed: 0,
    };

    issues.value.forEach((issue) => {
      statusCounts[issue.status]++;
    });

    return {
      labels: ['TODO', 'In Progress', 'In Review', 'Testing', 'Done', 'Closed'],
      data: [
        statusCounts.todo,
        statusCounts.in_progress,
        statusCounts.in_review,
        statusCounts.testing,
        statusCounts.done,
        statusCounts.closed,
      ],
      colors: ['#9E9E9E', '#2196F3', '#FF9800', '#9C27B0', '#4CAF50', '#607D8B'],
    };
  }

  if (distributionType.value === 'priority') {
    const priorityCounts = {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0,
    };

    issues.value.forEach((issue) => {
      priorityCounts[issue.priority]++;
    });

    return {
      labels: ['Low', 'Medium', 'High', 'Urgent'],
      data: [
        priorityCounts.low,
        priorityCounts.medium,
        priorityCounts.high,
        priorityCounts.urgent,
      ],
      colors: ['#4CAF50', '#FF9800', '#F44336', '#B71C1C'],
    };
  }

  return null;
});

// ============================================
// Chart Data
// ============================================

const chartData = computed<ChartData<'doughnut'> | null>(() => {
  const data = distributionData.value;
  if (!data) return null;

  return {
    labels: data.labels,
    datasets: [
      {
        data: data.data,
        backgroundColor: data.colors,
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };
});

const chartOptions = computed<ChartOptions<'doughnut'>>(() => ({
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio: 1.5,
  plugins: {
    legend: {
      display: true,
      position: 'right',
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const label = context.label || '';
          const value = context.parsed || 0;
          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
          const percentage = ((value / total) * 100).toFixed(1);
          return `${label}: ${value} (${percentage}%)`;
        },
      },
    },
  },
}));

// ============================================
// Lifecycle
// ============================================

onMounted(() => {
  void fetchIssues();
});

watch(() => props.projectId, () => {
  void fetchIssues();
});
</script>

<style scoped lang="scss">
.issue-distribution-chart {
  min-height: 300px;
}
</style>
