<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-lg">
      <q-btn flat round dense icon="arrow_back" @click="handleBack" />
      <div class="q-ml-md">
        <div class="text-h5">{{ sprint?.name || 'Loading...' }}</div>
        <div class="text-caption text-grey-7">스프린트 ID #{{ sprintId }}</div>
      </div>
      <q-space />
      <q-btn v-if="sprint" flat icon="edit" label="수정" color="primary" @click="handleEdit" />
      <q-btn v-if="sprint" flat icon="delete" label="삭제" color="negative" @click="handleDelete" />
    </div>

    <div v-if="isLoading" class="row justify-center q-py-xl">
      <q-spinner color="primary" size="50px" />
    </div>

    <div v-else-if="error" class="row justify-center q-py-xl">
      <q-card flat bordered class="q-pa-lg">
        <q-card-section class="text-center">
          <q-icon name="error" size="64px" color="negative" />
          <div class="text-h6 q-mt-md">{{ error }}</div>
          <q-btn
            label="목록으로 돌아가기"
            color="primary"
            flat
            class="q-mt-md"
            @click="handleBack"
          />
        </q-card-section>
      </q-card>
    </div>

    <div v-else-if="sprint" class="row q-col-gutter-lg">
      <div class="col-12 col-md-8">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6 q-mb-md">스프린트 목표</div>
            <div v-if="sprint.goal" class="text-body1">
              {{ sprint.goal }}
            </div>
            <div v-else class="text-body2 text-grey-6">설정된 목표가 없습니다.</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-md-4">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6 q-mb-md">상세 정보</div>
            <q-list dense separator>
              <q-item>
                <q-item-section avatar>
                  <q-icon name="label" />
                </q-item-section>
                <q-item-section>상태</q-item-section>
                <q-item-section side>
                  <status-badge type="sprint-status" :value="sprint.status" />
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="folder" />
                </q-item-section>
                <q-item-section>프로젝트</q-item-section>
                <q-item-section side> Project #{{ sprint.project_id }} </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="event" />
                </q-item-section>
                <q-item-section>시작일</q-item-section>
                <q-item-section side>
                  {{ formatDate(sprint.start_date) }}
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="event_busy" />
                </q-item-section>
                <q-item-section>종료일</q-item-section>
                <q-item-section side>
                  {{ formatDate(sprint.end_date) }}
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="schedule" />
                </q-item-section>
                <q-item-section>생성일</q-item-section>
                <q-item-section side>
                  {{ formatRelativeTime(sprint.created_at) }}
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="update" />
                </q-item-section>
                <q-item-section>수정일</q-item-section>
                <q-item-section side>
                  {{ formatRelativeTime(sprint.updated_at) }}
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-dialog v-model="showEditDialog">
      <q-card style="min-width: 600px">
        <q-card-section>
          <div class="text-h6">스프린트 수정</div>
        </q-card-section>
        <q-card-section>
          <sprint-form
            v-if="sprint"
            :sprint="sprint"
            :project-id="sprint.project_id"
            :loading="isSubmitting"
            :project-options="projectOptions"
            @cancel="showEditDialog = false"
            @submit="handleUpdateSprint"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useSprintStore } from 'src/stores/sprint.store';
import { useNotify } from 'src/composables/useNotify';
import { useDialog } from 'src/composables/useDialog';
import { formatDate, formatRelativeTime } from 'src/utils/formatters';
import type { SprintUpdate } from 'src/types/models.types';
import * as projectsApi from 'src/api/projects.api'; // 프로젝트 API 추가
import StatusBadge from 'src/components/common/StatusBadge.vue';
import SprintForm from 'src/components/sprint/SprintForm.vue';

// ============================================
// Composables
// ============================================

const route = useRoute();
const router = useRouter();
const sprintStore = useSprintStore();
const { notifySuccess, notifyError } = useNotify();
const { confirmDelete } = useDialog();

// ============================================
// State
// ============================================

const sprintId = Number(route.params.id);
const { currentSprint: sprint, isLoading, error } = storeToRefs(sprintStore);

const showEditDialog = ref(false);
const isSubmitting = ref(false);
const projectOptions = ref<{ label: string; value: number }[]>([]);

// ============================================
// Methods
// ============================================

async function fetchProjectOptions() {
  try {
    const projectResponse = await projectsApi.listProjects({ page: 1, size: 1000 });
    projectOptions.value = projectResponse.items.map((p) => ({
      label: p.name,
      value: p.id,
    }));
  } catch (err) {
    console.error('Failed to fetch project list:', err);
    notifyError('프로젝트 목록을 불러오는데 실패했습니다.');
  }
}

async function fetchSprintDetail() {
  try {
    // 상세 페이지에서 스프린트를 불러오는 함수는 스토어에 이미 구현되어 있습니다.
    await sprintStore.fetchSprint(sprintId);
  } catch (err) {
    console.error('스프린트 정보를 불러오는데 실패했습니다.', err);
    // 오류 처리는 스토어에서 이미 설정하지만, 명시적으로 처리
    if (!sprint.value) {
      // 스프린트 데이터가 아예 없는 경우에만 에러를 설정
    }
  }
}

function handleBack() {
  void router.push('/sprints');
}

async function handleUpdateSprint(data: SprintUpdate) {
  if (!sprint.value) return;
  isSubmitting.value = true;
  try {
    await sprintStore.updateSprint(sprint.value.id, data);
    showEditDialog.value = false;
    notifySuccess('스프린트가 성공적으로 수정되었습니다.');
  } catch (err) {
    console.error('Failed to update sprint:', err);
    notifyError('스프린트 수정에 실패했습니다.');
  } finally {
    isSubmitting.value = false;
  }
}

function handleEdit() {
  // 수정 버튼 클릭 시 다이얼로그 열기
  showEditDialog.value = true;
}

async function handleDelete() {
  if (!sprint.value) return;

  const confirmed = await confirmDelete(sprint.value.name);
  if (!confirmed) return;

  try {
    await sprintStore.deleteSprint(sprint.value.id);
    notifySuccess('스프린트가 삭제되었습니다.');
    void router.push('/sprints');
  } catch (err) {
    console.error('Failed to delete sprint:', err);
    notifyError('스프린트 삭제에 실패했습니다.');
  }
}

// ============================================
// Lifecycle
// ============================================

onMounted(() => {
  void fetchSprintDetail();
  void fetchProjectOptions(); // 수정 폼을 위해 프로젝트 목록을 미리 로드
});
</script>
