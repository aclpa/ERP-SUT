<template>
  <q-breadcrumbs v-if="breadcrumbs.length > 0" class="text-grey-7" active-color="primary">
    <q-breadcrumbs-el
      v-for="(item, index) in breadcrumbs"
      :key="index"
      :label="item.label"
      :icon="item.icon"
      :to="item.to"
      :class="{ 'cursor-default': !item.to }"
    />
  </q-breadcrumbs>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

// ============================================
// Types
// ============================================

interface BreadcrumbItem {
  label: string;
  icon?: string;
  to?: string;
}

// ============================================
// Composables
// ============================================

const route = useRoute();

// ============================================
// Breadcrumb Configuration
// ============================================

const breadcrumbMap: Record<string, BreadcrumbItem> = {
  dashboard: { label: 'Dashboard', icon: 'dashboard' },
  projects: { label: 'Projects', icon: 'folder' },
  'project-detail': { label: 'Project Detail', icon: 'folder_open' },
  sprints: { label: 'Sprints', icon: 'sprint' },
  'sprint-detail': { label: 'Sprint Detail', icon: 'event' },
  issues: { label: 'Issues', icon: 'bug_report' },
  'issue-detail': { label: 'Issue Detail', icon: 'assignment' },
  kanban: { label: 'Kanban', icon: 'view_column' },
  teams: { label: 'Teams', icon: 'groups' },
  'team-detail': { label: 'Team Detail', icon: 'group' },
  servers: { label: 'Servers', icon: 'storage' },
  'server-detail': { label: 'Server Detail', icon: 'storage' },
  services: { label: 'Services', icon: 'api' },
  'service-detail': { label: 'Service Detail', icon: 'api' },
  deployments: { label: 'Deployments', icon: 'rocket_launch' },
  'deployment-detail': { label: 'Deployment Detail', icon: 'cloud_upload' },
  profile: { label: 'Profile', icon: 'person' },
  settings: { label: 'Settings', icon: 'settings' },
};

// ============================================
// Computed
// ============================================

const breadcrumbs = computed(() => {
  const items: BreadcrumbItem[] = [];

  // Always start with Home
  items.push({
    label: 'home',
    icon: 'home',
    to: '/dashboard',
  });

  // Get current route name
  const routeName = route.name as string;
  if (!routeName) return items;

  // Handle special cases
  if (routeName.startsWith('project')) {
    items.push({
      label: 'Projects',
      to: '/projects',
    });
    if (routeName === 'project-detail') {
      items.push({
        label: breadcrumbMap['project-detail']?.label || '상세',
      });
    }
  } else if (routeName.startsWith('sprint')) {
    items.push({
      label: 'Sprints',
      to: '/sprints',
    });
    if (routeName === 'sprint-detail') {
      items.push({
        label: breadcrumbMap['sprint-detail']?.label || '상세',
      });
    }
  } else if (routeName.startsWith('issue')) {
    items.push({
      label: 'Issues',
      to: '/issues',
    });
    if (routeName === 'issue-detail') {
      items.push({
        label: breadcrumbMap['issue-detail']?.label || '상세',
      });
    }
  } else if (routeName.startsWith('team')) {
    items.push({
      label: 'Teams',
      to: '/teams',
    });
    if (routeName === 'team-detail') {
      items.push({
        label: breadcrumbMap['team-detail']?.label || '상세',
      });
    }
  } else if (routeName === 'servers' || routeName === 'server-detail') {
    items.push({
      label: 'Resources',
    });
    items.push({
      label: 'Servers',
      ...(routeName === 'server-detail' && { to: '/resources/servers' }),
    });
    if (routeName === 'server-detail') {
      items.push({
        label: 'Server Detail',
      });
    }
  } else if (routeName === 'services' || routeName === 'service-detail') {
    items.push({
      label: 'Resources',
    });
    items.push({
      label: 'Services',
      ...(routeName === 'service-detail' && { to: '/resources/services' }),
    });
    if (routeName === 'service-detail') {
      items.push({
        label: 'Service Detail',
      });
    }
  } else if (routeName.startsWith('deployment')) {
    items.push({
      label: 'Deployments',
      to: '/deployments',
    });
    if (routeName === 'deployment-detail') {
      items.push({
        label: breadcrumbMap['deployment-detail']?.label || '상세',
      });
    }
  } else if (breadcrumbMap[routeName]) {
    // Simple routes (dashboard, kanban, profile, settings)
    if (routeName !== 'dashboard') {
      const item = breadcrumbMap[routeName];
      items.push({
        label: item.label,
        ...(item.icon && { icon: item.icon }),
      });
    }
  }

  return items;
});
</script>

<style scoped lang="scss">
.cursor-default {
  cursor: default;
  pointer-events: none;
}
</style>
