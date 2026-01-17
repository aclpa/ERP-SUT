<template>
  <div>
    <q-skeleton v-if="loading" type="rect" height="200px" />
    <div v-else-if="issues.length === 0">
      <empty-state
        icon="task_alt"
        title="No Issues"
        message="You have no assigned issues"
      />
    </div>
    <q-list v-else separator>
      <q-item
        v-for="issue in issues"
        :key="issue.id"
        clickable
        @click="handleIssueClick(issue)"
      >
        <q-item-section avatar>
          <q-avatar :color="getTypeColor(issue.type)" text-color="white">
            <q-icon :name="getTypeIcon(issue.type)" />
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ issue.title }}</q-item-label>
          <q-item-label caption>
            <q-badge
              :color="getPriorityColor(issue.priority)"
              :label="issue.priority"
              class="q-mr-xs"
            />
            {{ formatRelativeTime(issue.updated_at) }}
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <status-badge type="issue-status" :value="issue.status" />
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import type { Issue } from 'src/types/models.types';
import { formatRelativeTime } from 'src/utils/formatters';
import { ISSUE_TYPE_COLORS, ISSUE_TYPE_ICONS, ISSUE_PRIORITY_COLORS } from 'src/utils/constants';
import StatusBadge from 'src/components/common/StatusBadge.vue';
import EmptyState from 'src/components/common/EmptyState.vue';

// ============================================
// Props
// ============================================

interface Props {
  issues: Issue[];
  loading?: boolean;
}

withDefaults(defineProps<Props>(), {
  loading: false,
});

// ============================================
// Router
// ============================================

const router = useRouter();

// ============================================
// Methods
// ============================================

function handleIssueClick(issue: Issue) {
  void router.push(`/issues/${issue.id}`);
}

function getTypeIcon(type: string): string {
  return ISSUE_TYPE_ICONS[type as keyof typeof ISSUE_TYPE_ICONS] || 'help_outline';
}

function getTypeColor(type: string): string {
  return ISSUE_TYPE_COLORS[type as keyof typeof ISSUE_TYPE_COLORS] || 'grey';
}

function getPriorityColor(priority: string): string {
  return ISSUE_PRIORITY_COLORS[priority as keyof typeof ISSUE_PRIORITY_COLORS] || 'grey';
}
</script>
