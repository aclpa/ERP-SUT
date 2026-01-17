<template>
  <div>
    <q-skeleton v-if="loading" type="rect" height="200px" />
    <div v-else-if="projects.length === 0">
      <empty-state
        icon="folder_open"
        title="No Recent Projects"
        message="Start by creating your first project"
      />
    </div>
    <q-list v-else separator>
      <q-item
        v-for="project in projects"
        :key="project.id"
        clickable
        @click="handleProjectClick(project)"
      >
        <q-item-section avatar>
          <q-avatar color="primary" text-color="white" icon="folder" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ project.name }}</q-item-label>
          <q-item-label caption>
            {{ formatRelativeTime(project.updated_at) }}
          </q-item-label>
        </q-item-section>
        <q-item-section side>
          <status-badge type="project-status" :value="project.status" />
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import type { Project } from 'src/types/models.types';
import { formatRelativeTime } from 'src/utils/formatters';
import StatusBadge from 'src/components/common/StatusBadge.vue';
import EmptyState from 'src/components/common/EmptyState.vue';

// ============================================
// Props
// ============================================

interface Props {
  projects: Project[];
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

function handleProjectClick(project: Project) {
  void router.push(`/projects/${project.id}`);
}
</script>
