<template>
  <q-form @submit="handleSubmit" class="issue-form">
    <!-- Title -->
    <q-input
      v-model="formData.title"
      label="Title *"
      :rules="[(val) => !!val || 'Title is required']"
      outlined
      class="q-mb-md"
    />

    <!-- Description -->
    <q-input
      v-model="formData.description"
      label="Description"
      type="textarea"
      rows="5"
      outlined
      class="q-mb-md"
    />

    <!-- Project and Sprint -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-sm-6">
        <q-select
          v-model="formData.project_id"
          :options="projectOptions"
          label="Project *"
          :rules="[(val) => !!val || 'Project is required']"
          outlined
          emit-value
          map-options
        />
      </div>
      <div class="col-12 col-sm-6">
        <q-select
          v-model="formData.sprint_id"
          :options="sprintOptions"
          label="Sprint"
          outlined
          emit-value
          map-options
          clearable
        />
      </div>
    </div>

    <!-- Type, Priority, Status -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-sm-4">
        <q-select
          v-model="formData.type"
          :options="typeOptions"
          label="Type *"
          :rules="[(val) => !!val || 'Type is required']"
          outlined
          emit-value
          map-options
        />
      </div>
      <div class="col-12 col-sm-4">
        <q-select
          v-model="formData.priority"
          :options="priorityOptions"
          label="Priority"
          outlined
          emit-value
          map-options
        />
      </div>
      <div class="col-12 col-sm-4">
        <q-select
          v-model="formData.status"
          :options="statusOptions"
          label="Status"
          outlined
          emit-value
          map-options
        />
      </div>
    </div>

    <!-- Assignee, Story Points, Due Date -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-sm-4">
        <q-select
          v-model="formData.assignee_id"
          :options="assigneeOptions"
          label="Assignee"
          outlined
          emit-value
          map-options
          clearable
        />
      </div>
      <div class="col-12 col-sm-4">
        <q-input
          v-model.number="formData.story_points"
          label="Story Points"
          type="number"
          min="0"
          outlined
        />
      </div>
      <div class="col-12 col-sm-4">
        <q-input v-model="formData.due_date" label="Due Date" type="date" outlined />
      </div>
    </div>

    <!-- Actions -->
    <div class="row q-col-gutter-sm justify-end">
      <div class="col-auto">
        <q-btn label="Cancel" flat @click="handleCancel" />
      </div>
      <div class="col-auto">
        <q-btn
          :label="isEdit ? 'Update' : 'Create'"
          type="submit"
          color="primary"
          :loading="loading"
        />
      </div>
    </div>
  </q-form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Issue, IssueCreate, IssueUpdate } from 'src/types/models.types';

// ============================================
// Props
// ============================================

interface Props {
  issue?: Issue | null;
  loading?: boolean;
  projectOptions?: { label: string; value: number }[];
  sprintOptions?: { label: string; value: number }[];
  assigneeOptions?: { label: string; value: number }[];
}

const props = withDefaults(defineProps<Props>(), {
  issue: null,
  loading: false,
  projectOptions: () => [],
  sprintOptions: () => [],
  assigneeOptions: () => [],
});

// ============================================
// Emits
// ============================================

const emit = defineEmits<{
  submit: [data: IssueCreate | IssueUpdate];
  cancel: [];
}>();

// ============================================
// State
// ============================================

const isEdit = ref(!!props.issue);

const formData = ref<IssueCreate>({
  title: '',
  project_id: 0,
  type: 'task',
  reporter_id: 0, // Will be set from auth store
});

// ============================================
// Options
// ============================================

const typeOptions = [
  { label: 'Epic', value: 'epic' },
  //{ label: 'Story', value: 'story' },
  { label: 'Task', value: 'task' },
  { label: 'Bug', value: 'bug' },
  { label: 'Improvement', value: 'improvement' },
];

const priorityOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Urgent', value: 'urgent' },
];

const statusOptions = [
  { label: 'To Do', value: 'todo' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'In Review', value: 'in_review' },
  { label: 'Testing', value: 'testing' },
  { label: 'Done', value: 'done' },
  { label: 'Closed', value: 'closed' },
];

// ============================================
// Watch
// ============================================

watch(
  () => props.issue,
  (issue) => {
    if (issue) {
      isEdit.value = true;
      // Build formData object with only defined values
      const data: IssueCreate = {
        title: issue.title,
        project_id: issue.project_id,
        type: issue.type,
        reporter_id: issue.reporter_id,
      };

      // Add optional fields only if they exist
      if (issue.description) data.description = issue.description;
      if (issue.sprint_id) data.sprint_id = issue.sprint_id;
      if (issue.status) data.status = issue.status;
      if (issue.priority) data.priority = issue.priority;
      if (issue.assignee_id) data.assignee_id = issue.assignee_id;
      if (issue.story_points) data.story_points = issue.story_points;
      if (issue.due_date) data.due_date = issue.due_date;

      formData.value = data;
    }
  },
  { immediate: true },
);

// ============================================
// Methods
// ============================================

function handleSubmit() {
  // Clean up empty values
  const submitData = { ...formData.value };

  if (!submitData.description) {
    delete submitData.description;
  }

  if (!submitData.sprint_id) {
    delete submitData.sprint_id;
  }

  if (!submitData.assignee_id) {
    delete submitData.assignee_id;
  }

  if (!submitData.story_points) {
    delete submitData.story_points;
  }

  if (!submitData.due_date) {
    delete submitData.due_date;
  }

  emit('submit', submitData);
}

function handleCancel() {
  emit('cancel');
}
</script>
