<template>
  <q-form @submit="handleSubmit" class="project-form">
    <!-- Name -->
    <q-input
      v-model="formData.name"
      label="프로젝트 이름 *"
      :rules="[(val) => !!val || '프로젝트 이름은 필수입니다']"
      outlined
      class="q-mb-md"
    />

    <!-- Key -->
    <q-input
      v-model="formData.key"
      label="프로젝트 키 *"
      hint="대문자로 시작, 대문자와 숫자만 가능 (예: PROJ1, DEV)"
      :rules="[
        (val) => !!val || '프로젝트 키는 필수입니다',
        (val) => /^[A-Z][A-Z0-9]*$/.test(val) || '대문자로 시작하고 대문자와 숫자만 사용 가능합니다'
      ]"
      outlined
      class="q-mb-md"
      maxlength="10"
    />

    <!-- Description -->
    <q-input
      v-model="formData.description"
      label="Description"
      type="textarea"
      rows="3"
      outlined
      class="q-mb-md"
    />

    <!-- Status -->
    <q-select
      v-model="formData.status"
      :options="PROJECT_STATUS_OPTIONS"
      label="Status"
      outlined
      emit-value
      map-options
      class="q-mb-md"
    />

    <!-- Team -->
    <q-select
      v-model="formData.team_id"
      :options="teamOptions"
      label="Team *"
      :rules="[(val) => !!val || 'Team is required']"
      outlined
      emit-value
      map-options
      class="q-mb-md"
    />

    <!-- Dates -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-sm-6">
        <q-input
          v-model="formData.start_date"
          label="Start Date"
          type="date"
          outlined
        />
      </div>
      <div class="col-12 col-sm-6">
        <q-input
          v-model="formData.end_date"
          label="End Date"
          type="date"
          outlined
        />
      </div>
    </div>

    <!-- Repository URL -->
    <q-input
      v-model="formData.repository_url"
      label="Repository URL"
      outlined
      class="q-mb-md"
    />

    <!-- Actions -->
    <div class="row q-col-gutter-sm justify-end">
      <div class="col-auto">
        <q-btn
          label="Cancel"
          flat
          @click="handleCancel"
        />
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
import type { Project, ProjectCreate, ProjectUpdate } from 'src/types/models.types';
import { PROJECT_STATUS_OPTIONS } from 'src/utils/constants';

// ============================================
// Props
// ============================================

interface Props {
  project?: Project | null;
  loading?: boolean;
  teamOptions?: { label: string; value: number }[];
}

const props = withDefaults(defineProps<Props>(), {
  project: null,
  loading: false,
  teamOptions: () => [],
});

// ============================================
// Emits
// ============================================

const emit = defineEmits<{
  submit: [data: ProjectCreate | ProjectUpdate];
  cancel: [];
}>();

// ============================================
// State
// ============================================

const isEdit = ref(!!props.project);

const formData = ref<ProjectCreate>({
  name: '',
  key: '',
  team_id: 0,
  description: '',
  status: 'planning',
  start_date: '',
  end_date: '',
  repository_url: '',
});

// ============================================
// Watch
// ============================================

watch(
  () => props.project,
  (project) => {
    if (project) {
      isEdit.value = true;
      formData.value = {
        name: project.name,
        key: project.key,
        team_id: project.team_id,
        description: project.description || '',
        status: project.status,
        start_date: project.start_date || '',
        end_date: project.end_date || '',
        repository_url: project.repository_url || '',
      };
    }
  },
  { immediate: true }
);

// ============================================
// Methods
// ============================================

function handleSubmit() {
  emit('submit', formData.value);
}

function handleCancel() {
  emit('cancel');
}
</script>
