<template>
  <div class="burndown-chart">
    <Line v-if="!isLoadingData && chartData" :data="chartData" :options="chartOptions" />
    <div v-else-if="isLoadingData || loading" class="flex flex-center q-py-xl">
      <q-spinner-dots color="primary" size="40px" />
    </div>
    <div v-else class="text-center q-py-xl text-grey-6">
      <q-icon name="show_chart" size="48px" />
      <div class="text-body2 q-mt-sm">스프린트 데이터가 없습니다</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
} from 'chart.js';
import { getSprint } from 'src/api/sprints.api';
import { getIssuesBySprint } from 'src/api/issues.api';
import type { Sprint, Issue } from 'src/types/models.types';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// ============================================
// Props
// ============================================

interface Props {
  sprintId?: number | null;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  sprintId: null,
  loading: false,
});

// ============================================
// State
// ============================================

const isLoadingData = ref(false);
const sprint = ref<Sprint | null>(null);
const issues = ref<Issue[]>([]);

// ============================================
// Data Fetching
// ============================================

async function fetchSprintData() {
  isLoadingData.value = true;
  try {
    // Fetch active sprint or use provided sprintId
    if (props.sprintId) {
      sprint.value = await getSprint(props.sprintId);

      // Fetch sprint issues
      const issuesResponse = await getIssuesBySprint(props.sprintId);
      issues.value = issuesResponse.items;
    } else {
      // Try to find an active sprint (would need project context)
      sprint.value = null;
      issues.value = [];
    }
  } catch (error) {
    console.error('Failed to fetch sprint data for burndown chart:', error);
    sprint.value = null;
    issues.value = [];
  } finally {
    isLoadingData.value = false;
  }
}

// ============================================
// Burndown Data Calculation
// ============================================

const burndownData = computed(() => {
  if (!sprint.value || issues.value.length === 0) {
    return null;
  }

  const startDate = sprint.value.start_date ? new Date(sprint.value.start_date) : new Date();
  const endDate = sprint.value.end_date ? new Date(sprint.value.end_date) : new Date();
  const now = new Date();

  // Calculate sprint duration in days
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const daysPassed = Math.min(
    Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
    totalDays
  );

  // Calculate total story points or issue count
  const totalStoryPoints = issues.value.reduce((sum, issue) => sum + (issue.story_points || 1), 0);
  const completedIssues = issues.value.filter((issue) => issue.status === 'done' || issue.status === 'closed');
  const completedStoryPoints = completedIssues.reduce((sum, issue) => sum + (issue.story_points || 1), 0);
  const remainingStoryPoints = totalStoryPoints - completedStoryPoints;

  // Generate labels
  const labels: string[] = [];
  const idealData: number[] = [];
  const actualData: number[] = [];

  for (let day = 0; day <= Math.min(totalDays, 14); day++) {
    labels.push(`Day ${day + 1}`);

    // Ideal burndown (linear decrease)
    const idealRemaining = totalStoryPoints - (totalStoryPoints * day) / totalDays;
    idealData.push(Math.max(0, Math.round(idealRemaining)));

    // Actual burndown (simplified - only show current state)
    if (day === 0) {
      actualData.push(totalStoryPoints);
    } else if (day <= daysPassed) {
      // Linear interpolation for past days (simplified)
      const progress = completedStoryPoints * (day / daysPassed);
      actualData.push(Math.max(0, Math.round(totalStoryPoints - progress)));
    } else {
      // Future days - maintain current remaining
      actualData.push(remainingStoryPoints);
    }
  }

  return {
    labels,
    ideal: idealData,
    actual: actualData,
  };
});

// ============================================
// Chart Data
// ============================================

const chartData = computed<ChartData<'line'> | null>(() => {
  const data = burndownData.value;
  if (!data) return null;

  return {
    labels: data.labels,
    datasets: [
      {
        label: 'Ideal Burndown',
        data: data.ideal,
        borderColor: '#9E9E9E',
        backgroundColor: 'rgba(158, 158, 158, 0.1)',
        borderDash: [5, 5],
        tension: 0.1,
      },
      {
        label: 'Actual Burndown',
        data: data.actual,
        borderColor: '#1976D2',
        backgroundColor: 'rgba(25, 118, 210, 0.1)',
        tension: 0.3,
        fill: true,
      },
    ],
  };
});

const chartOptions = computed<ChartOptions<'line'>>(() => ({
  responsive: true,
  maintainAspectRatio: true,
  aspectRatio: 2,
  plugins: {
    legend: {
      display: true,
      position: 'top',
    },
    title: {
      display: false,
    },
    tooltip: {
      mode: 'index',
      intersect: false,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Story Points',
      },
    },
    x: {
      title: {
        display: true,
        text: 'Sprint Days',
      },
    },
  },
}));

// ============================================
// Lifecycle
// ============================================

onMounted(() => {
  void fetchSprintData();
});

watch(() => props.sprintId, () => {
  void fetchSprintData();
});
</script>

<style scoped lang="scss">
.burndown-chart {
  min-height: 300px;
}
</style>
