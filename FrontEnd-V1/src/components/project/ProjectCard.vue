<template>
  <q-card class="project-card" @click="handleClick">
    <q-card-section>
      <!-- Header -->
      <div class="row items-center justify-between q-mb-sm">
        <div class="col">
          <div class="row items-center q-gutter-sm">
            <div class="text-h6 text-weight-bold ellipsis">{{ project.name }}</div>
            <q-badge color="grey-7" outline>{{ project.key }}</q-badge>
          </div>
        </div>
        <div class="col-auto">
          <status-badge type="project-status" :value="project.status" />
        </div>
      </div>

      <!-- Description -->
      <div v-if="project.description" class="text-body2 text-grey-7 q-mb-md line-clamp-2">
        {{ project.description }}
      </div>

      <!-- Dates -->
      <div class="row q-col-gutter-sm q-mb-md">
        <div v-if="project.start_date" class="col-12 col-sm-6">
          <div class="text-caption text-grey-7">
            <q-icon name="event" size="xs" class="q-mr-xs" />
            Start: {{ formatDate(project.start_date) }}
          </div>
        </div>
        <div v-if="project.end_date" class="col-12 col-sm-6">
          <div class="text-caption text-grey-7">
            <q-icon name="event" size="xs" class="q-mr-xs" />
            End: {{ formatDate(project.end_date) }}
          </div>
        </div>
      </div>

      <!-- Metadata -->
      <div class="row items-center text-caption text-grey-6">
        <div class="col">
          Updated {{ formatRelativeTime(project.updated_at) }}
        </div>
        <div v-if="project.repository_url" class="col-auto">
          <q-icon name="code" size="xs" />
        </div>
      </div>
    </q-card-section>

    <!-- Actions -->
    <q-card-actions v-if="showActions" align="right">
      <q-btn
        flat
        dense
        icon="edit"
        color="primary"
        @click.stop="handleEdit"
      >
        <q-tooltip>Edit</q-tooltip>
      </q-btn>
      <q-btn
        flat
        dense
        icon="delete"
        color="negative"
        @click.stop="handleDelete"
      >
        <q-tooltip>Delete</q-tooltip>
      </q-btn>
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import type { Project } from 'src/types/models.types';
import { formatDate, formatRelativeTime } from 'src/utils/formatters';
import StatusBadge from 'src/components/common/StatusBadge.vue';

// ============================================
// Props
// ============================================

interface Props {
  project: Project;
  showActions?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showActions: false,
});

// ============================================
// Emits
// ============================================

const emit = defineEmits<{
  click: [project: Project];
  edit: [project: Project];
  delete: [project: Project];
}>();

// ============================================
// Methods
// ============================================

function handleClick() {
  emit('click', props.project);
}

function handleEdit() {
  emit('edit', props.project);
}

function handleDelete() {
  emit('delete', props.project);
}
</script>

<style lang="scss" scoped>
.project-card {
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
