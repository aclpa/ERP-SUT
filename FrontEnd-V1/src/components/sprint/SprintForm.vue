<template>
  <q-form @submit="handleSubmit" class="q-gutter-md">
    <q-select
      v-model="form.project_id"
      :options="projectOptions"
      label="Project *"
      outlined
      dense
      emit-value
      map-options
      :rules="[(val) => (val !== 0 && !!val) || 'Project is required']"
      :disable="isEdit"
    />

    <q-input
      v-model="form.name"
      label="Sprint Name *"
      outlined
      dense
      :rules="[(val) => !!val || 'Name is required']"
    />

    <q-input v-model="form.goal" label="Sprint Goal" outlined dense type="textarea" rows="3" />

    <div class="row q-col-gutter-sm">
      <div class="col-6">
        <q-input v-model="form.start_date" label="Start Date" outlined dense type="date" />
      </div>
      <div class="col-6">
        <q-input v-model="form.end_date" label="End Date" outlined dense type="date" />
      </div>
    </div>

    <q-select
      v-model="form.status"
      :options="statusOptions"
      label="Status"
      outlined
      dense
      emit-value
      map-options
    >
      <template v-slot:option="scope">
        <q-item v-bind="scope.itemProps">
          <q-item-section avatar>
            <q-icon
              :name="getStatusIcon(scope.opt.value)"
              :color="getStatusColor(scope.opt.value)"
            />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ scope.opt.label }}</q-item-label>
          </q-item-section>
        </q-item>
      </template>
      <template v-slot:selected-item="scope">
        <div class="row items-center q-gutter-x-sm">
          <q-icon :name="getStatusIcon(scope.opt.value)" :color="getStatusColor(scope.opt.value)" />
          <span>{{ scope.opt.label }}</span>
        </div>
      </template>
    </q-select>

    <div class="row justify-end q-gutter-sm">
      <q-btn label="Cancel" flat color="grey" v-close-popup />
      <q-btn
        :label="isEdit ? 'Update' : 'Create'"
        type="submit"
        color="primary"
        :loading="loading"
      />
    </div>
  </q-form>
</template>

<script setup lang="ts">
import { reactive, computed, watch } from 'vue';
import type { Sprint, SprintCreate, SprintUpdate, SprintStatus } from 'src/types/models.types';

// Props 정의
interface Props {
  sprint?: Sprint | undefined;
  projectId: number;
  loading?: boolean;
  // [추가됨] 프로젝트 목록 옵션 (label, value 형태)
  projectOptions?: { label: string; value: number }[];
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  projectOptions: () => [],
});

const emit = defineEmits<{
  (e: 'submit', data: SprintCreate | SprintUpdate): void;
}>();

// State
const isEdit = computed(() => !!props.sprint);

// 상태 옵션
const statusOptions = [
  // { label: 'Planning', value: 'planning' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

// Form Data
const form = reactive({
  project_id: 0, // [중요] form 내부에 project_id 관리
  name: '',
  goal: '',
  start_date: '',
  end_date: '',
  status: 'planning' as SprintStatus,
});

// Helper Functions
function getStatusIcon(status: string) {
  switch (status) {
    case 'active':
      return 'play_circle';
    case 'completed':
      return 'check_circle';
    case 'cancelled':
      return 'cancel';
    default:
      return 'event_note';
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'active':
      return 'primary';
    case 'completed':
      return 'positive';
    case 'cancelled':
      return 'negative';
    default:
      return 'grey';
  }
}

// [수정됨] 초기화 로직을 watch로 변경하여 dialog 열릴 때마다 데이터 갱신
watch(
  () => props.sprint,
  (sprint) => {
    if (sprint) {
      // 수정 모드
      form.project_id = sprint.project_id;
      form.name = sprint.name;
      form.goal = sprint.goal || '';
      form.start_date = sprint.start_date ? (sprint.start_date.split('T')[0] ?? '') : '';
      form.end_date = sprint.end_date ? (sprint.end_date.split('T')[0] ?? '') : '';
      form.status = sprint.status;
    } else {
      // 생성 모드: props.projectId가 있으면(필터링된 상태 등) 기본값으로 사용, 없으면 0
      form.project_id = props.projectId || 0;
      form.name = '';
      form.goal = '';
      form.start_date = '';
      form.end_date = '';
      form.status = 'planning';
    }
  },
  { immediate: true },
);

// Submit Handler
function handleSubmit() {
  // 날짜 빈 문자열 처리 (백엔드 422 에러 방지)
  const startDate = form.start_date === '' ? null : form.start_date;
  const endDate = form.end_date === '' ? null : form.end_date;

  const data = {
    name: form.name,
    goal: form.goal,
    status: form.status,
    start_date: startDate,
    end_date: endDate,
  };

  if (isEdit.value) {
    emit('submit', data as SprintUpdate);
  } else {
    // [핵심 수정] props.projectId 대신 form.project_id 사용
    emit('submit', {
      ...data,
      project_id: form.project_id,
    } as SprintCreate);
  }
}
</script>
