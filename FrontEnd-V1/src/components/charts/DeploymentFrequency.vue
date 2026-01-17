<template>
  <div class="deployment-frequency-chart">
    <!-- Time Range Selector -->
    <div class="row items-center justify-between q-mb-md">
      <div class="text-subtitle1 text-weight-medium">Deployment Frequency</div>
      <q-btn-toggle
        v-model="timeRange"
        :options="[
          { label: '7 Days', value: '7d' },
          { label: '30 Days', value: '30d' },
          { label: '90 Days', value: '90d' },
        ]"
        dense
        unelevated
        toggle-color="primary"
        color="grey-3"
        text-color="grey-8"
      />
    </div>

    <!-- Chart -->
    <Bar v-if="!isLoadingData && chartData" :data="chartData" :options="chartOptions" />
    <div v-else-if="isLoadingData || loading" class="flex flex-center q-py-xl">
      <q-spinner-dots color="primary" size="40px" />
    </div>
    <div v-else class="text-center q-py-xl text-grey-6">
      <q-icon name="bar_chart" size="48px" />
      <div class="text-body2 q-mt-sm">데이터가 없습니다</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
} from 'chart.js';
import { listDeployments } from 'src/api/deployments.api';
import type { Deployment } from 'src/types/models.types';
import type { QueryParams } from 'src/types/api.types';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// ============================================
// Props
// ============================================

interface Props {
  environment?: string | null;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  environment: null,
  loading: false,
});

// ============================================
// State
// ============================================

type TimeRange = '7d' | '30d' | '90d';
const timeRange = ref<TimeRange>('30d');
const isLoadingData = ref(false);
const deployments = ref<Deployment[]>([]);

// ============================================
// Data Fetching
// ============================================

async function fetchDeployments() {
  isLoadingData.value = true;
  try {
    const params: QueryParams = {
      page: 1,
      page_size: 100, // Max allowed by backend
    };

    if (props.environment) {
      params.environment = props.environment;
    }

    const response = await listDeployments(params);
    deployments.value = response.items;
  } catch (error) {
    console.error('Failed to fetch deployments for frequency chart:', error);
    deployments.value = [];
  } finally {
    isLoadingData.value = false;
  }
}

// ============================================
// Computed Data Processing
// ============================================

const frequencyData = computed(() => {
  if (deployments.value.length === 0) {
    return null;
  }

  const now = new Date();
  const labels: string[] = [];
  const successCounts: number[] = [];
  const failedCounts: number[] = [];

  if (timeRange.value === '7d') {
    // Last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0]!;
      labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));

      const dayDeployments = deployments.value.filter((d) => {
        if (!d.created_at) return false;
        return d.created_at.startsWith(dateStr);
      });

      successCounts.push(dayDeployments.filter((d) => d.status === 'success').length);
      failedCounts.push(dayDeployments.filter((d) => d.status === 'failed').length);
    }
  } else if (timeRange.value === '30d') {
    // Last 4 weeks
    for (let i = 3; i >= 0; i--) {
      labels.push(`Week ${4 - i}`);
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() - i * 7);

      const weekDeployments = deployments.value.filter((d) => {
        if (!d.created_at) return false;
        const deployDate = new Date(d.created_at);
        return deployDate >= weekStart && deployDate < weekEnd;
      });

      successCounts.push(weekDeployments.filter((d) => d.status === 'success').length);
      failedCounts.push(weekDeployments.filter((d) => d.status === 'failed').length);
    }
  } else if (timeRange.value === '90d') {
    // Last 3 months
    for (let i = 2; i >= 0; i--) {
      const month = new Date(now);
      month.setMonth(month.getMonth() - i);
      labels.push(month.toLocaleDateString('en-US', { month: 'short' }));

      const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

      const monthDeployments = deployments.value.filter((d) => {
        if (!d.created_at) return false;
        const deployDate = new Date(d.created_at);
        return deployDate >= monthStart && deployDate <= monthEnd;
      });

      successCounts.push(monthDeployments.filter((d) => d.status === 'success').length);
      failedCounts.push(monthDeployments.filter((d) => d.status === 'failed').length);
    }
  }

  return {
    labels,
    success: successCounts,
    failed: failedCounts,
  };
});

// ============================================
// Chart Data
// ============================================

const chartData = computed<ChartData<'bar'> | null>(() => {
  const data = frequencyData.value;
  if (!data) return null;

  return {
    labels: data.labels,
    datasets: [
      {
        label: 'Successful Deployments',
        data: data.success,
        backgroundColor: '#4CAF50',
        borderColor: '#388E3C',
        borderWidth: 1,
      },
      {
        label: 'Failed Deployments',
        data: data.failed,
        backgroundColor: '#F44336',
        borderColor: '#D32F2F',
        borderWidth: 1,
      },
    ],
  };
});

const chartOptions = computed<ChartOptions<'bar'>>(() => ({
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
      ticks: {
        stepSize: 1,
      },
      title: {
        display: true,
        text: 'Number of Deployments',
      },
    },
    x: {
      title: {
        display: true,
        text: 'Time Period',
      },
    },
  },
}));

// ============================================
// Lifecycle
// ============================================

onMounted(() => {
  void fetchDeployments();
});

watch(() => props.environment, () => {
  void fetchDeployments();
});

watch(timeRange, () => {
  // Data is re-computed automatically when timeRange changes
});
</script>

<style scoped lang="scss">
.deployment-frequency-chart {
  min-height: 300px;
}
</style>
