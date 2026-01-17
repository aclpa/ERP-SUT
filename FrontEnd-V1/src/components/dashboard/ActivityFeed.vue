<template>
  <div>
    <q-skeleton v-if="loading" type="rect" height="200px" />
    <div v-else-if="activities.length === 0">
      <empty-state
        icon="notifications_none"
        title="No Recent Activity"
        message="Activity will appear here as your team works"
      />
    </div>
    <q-timeline v-else color="primary">
      <q-timeline-entry
        v-for="activity in activities"
        :key="activity.id"
        :title="activity.title"
        :subtitle="formatRelativeTime(activity.created_at)"
        :icon="getActivityIcon(activity.type)"
      >
        <div class="text-body2">{{ activity.description }}</div>
        <q-chip
          v-if="activity.user_name"
          size="sm"
          color="grey-3"
          text-color="dark"
          class="q-mt-xs"
        >
          {{ activity.user_name }}
        </q-chip>
      </q-timeline-entry>
    </q-timeline>
  </div>
</template>

<script setup lang="ts">
import { formatRelativeTime } from 'src/utils/formatters';
import EmptyState from 'src/components/common/EmptyState.vue';

// ============================================
// Types
// ============================================

interface Activity {
  id: number;
  type: string;
  title: string;
  description: string;
  user_name?: string;
  created_at: string;
}

// ============================================
// Props
// ============================================

interface Props {
  activities: Activity[];
  loading?: boolean;
}

withDefaults(defineProps<Props>(), {
  loading: false,
});

// ============================================
// Methods
// ============================================

function getActivityIcon(type: string): string {
  const iconMap: Record<string, string> = {
    project_created: 'folder_open',
    issue_created: 'add_task',
    issue_updated: 'edit',
    sprint_started: 'play_arrow',
    sprint_completed: 'done_all',
    deployment: 'rocket_launch',
    comment: 'comment',
  };
  return iconMap[type] || 'info';
}
</script>
