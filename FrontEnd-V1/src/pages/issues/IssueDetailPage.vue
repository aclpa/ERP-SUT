<template>
  <q-page class="issue-detail-page q-pa-md">
    <div class="row items-center q-mb-lg">
      <q-btn flat round dense icon="arrow_back" @click="handleBack" />
      <div class="q-ml-md">
        <div class="text-h5">{{ issue?.title || 'Loading...' }}</div>
        <div class="text-caption text-grey-7">이슈 ID #{{ issueId }}</div>
      </div>
      <q-space />
      <q-btn v-if="issue" flat icon="edit" label="수정" color="primary" @click="handleEdit" />
      <q-btn v-if="issue" flat icon="delete" label="삭제" color="negative" @click="handleDelete" />
    </div>

    <div v-if="loading" class="row justify-center q-py-xl">
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

    <div v-else-if="issue" class="row q-col-gutter-lg">
      <div class="col-12 col-md-8">
        <q-card flat bordered>
          <q-card-section>
            <div class="text-h6 q-mb-md">설명</div>
            <div v-if="issue.description" class="text-body1">
              {{ issue.description }}
            </div>
            <div v-else class="text-body2 text-grey-6">설명이 없습니다.</div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div class="text-h6 q-mb-md">댓글</div>
            <div class="text-body2 text-grey-6 text-center q-pa-md">댓글 기능은 준비 중입니다.</div>
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
                  <status-badge type="issue-status" :value="issue.status" />
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="priority_high" />
                </q-item-section>
                <q-item-section>우선순위</q-item-section>
                <q-item-section side>
                  <status-badge type="issue-priority" :value="issue.priority" />
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="bookmark" />
                </q-item-section>
                <q-item-section>유형</q-item-section>
                <q-item-section side>
                  <status-badge type="issue-type" :value="issue.type" />
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="person" />
                </q-item-section>
                <q-item-section>담당자</q-item-section>
                <q-item-section side>
                  {{ issue.assignee_id ? `User #${issue.assignee_id}` : '미지정' }}
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="person_outline" />
                </q-item-section>
                <q-item-section>보고자</q-item-section>
                <q-item-section side> User #{{ issue.reporter_id }} </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="folder" />
                </q-item-section>
                <q-item-section>프로젝트</q-item-section>
                <q-item-section side> Project #{{ issue.project_id }} </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="sprint" />
                </q-item-section>
                <q-item-section>스프린트</q-item-section>
                <q-item-section side>
                  {{ issue.sprint_id ? `Sprint #${issue.sprint_id}` : '미지정' }}
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="event" />
                </q-item-section>
                <q-item-section>마감일</q-item-section>
                <q-item-section side>
                  {{ issue.due_date ? formatDate(issue.due_date) : '미지정' }}
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="schedule" />
                </q-item-section>
                <q-item-section>생성일</q-item-section>
                <q-item-section side>
                  {{ formatRelativeTime(issue.created_at) }}
                </q-item-section>
              </q-item>

              <q-item>
                <q-item-section avatar>
                  <q-icon name="update" />
                </q-item-section>
                <q-item-section>수정일</q-item-section>
                <q-item-section side>
                  {{ formatRelativeTime(issue.updated_at) }}
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
          <div class="text-h6">이슈 수정</div>
        </q-card-section>
        <q-card-section>
          <issue-form
            v-if="issue"
            :issue="issue"
            :loading="isSubmitting"
            :project-options="projectOptions"
            :sprint-options="sprintOptions"
            @submit="handleUpdateIssue"
            @cancel="showEditDialog = false"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
// import { useQuasar } from 'quasar'; // [REMOVED]
import { getIssue, updateIssue, deleteIssue } from 'src/api/issues.api';
import { listProjects } from 'src/api/projects.api';
import { listSprints } from 'src/api/sprints.api';
import type { Issue, IssueUpdate } from 'src/types/models.types';
import { formatDate, formatRelativeTime } from 'src/utils/formatters';
import { useNotify } from 'src/composables/useNotify';
import { useDialog } from 'src/composables/useDialog';
import StatusBadge from 'src/components/common/StatusBadge.vue';
import IssueForm from 'src/components/issue/IssueForm.vue';

// ============================================
// Composables
// ============================================

const route = useRoute();
const router = useRouter();
// const $q = useQuasar(); // [REMOVED]
const { notifySuccess, notifyError } = useNotify();
const { confirmDelete } = useDialog();

// ============================================
// State
// ============================================

const issueId = Number(route.params.id);
const issue = ref<Issue | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

const showEditDialog = ref(false);
const isSubmitting = ref(false);

const projectOptions = ref<{ label: string; value: number }[]>([]);
const sprintOptions = ref<{ label: string; value: number }[]>([]);
// TODO: 담당자 목록 API 연동 필요
// const assigneeOptions = ref<{ label: string; value: number }[]>([]);

// ============================================
// Methods
// ============================================

async function fetchIssue() {
  loading.value = true;
  error.value = null;
  try {
    issue.value = await getIssue(issueId);
  } catch (err) {
    console.error('Failed to fetch issue:', err);
    error.value = '이슈를 불러오는데 실패했습니다.';
    notifyError(error.value);
  } finally {
    loading.value = false;
  }
}

async function fetchRelatedData() {
  try {
    // 프로젝트 목록
    const projectResponse = await listProjects({ page: 1, size: 1000 });
    projectOptions.value = projectResponse.items.map((p) => ({
      label: p.name,
      value: p.id,
    }));

    // 스프린트 목록
    const sprintResponse = await listSprints({ page: 1, size: 1000 });
    sprintOptions.value = sprintResponse.items.map((s) => ({
      label: s.name,
      value: s.id,
    }));
  } catch (err) {
    console.error('Failed to fetch related data:', err);
    notifyError('프로젝트 또는 스프린트 목록을 불러오는데 실패했습니다.');
  }
}

function handleBack() {
  void router.push('/issues');
}

function handleEdit() {
  showEditDialog.value = true;
}

async function handleDelete() {
  if (!issue.value) return;

  const confirmed = await confirmDelete(issue.value.title);
  if (!confirmed) return;

  try {
    await deleteIssue(issueId);
    notifySuccess('이슈가 삭제되었습니다.');
    void router.push('/issues');
  } catch (err) {
    console.error('Failed to delete issue:', err);
    notifyError('이슈 삭제에 실패했습니다.');
  }
}

async function handleUpdateIssue(data: IssueUpdate) {
  isSubmitting.value = true;
  try {
    const updatedIssue = await updateIssue(issueId, data);
    issue.value = updatedIssue;
    showEditDialog.value = false;
    notifySuccess('이슈가 성공적으로 수정되었습니다.');
  } catch (err) {
    console.error('Failed to update issue:', err);
    notifyError('이슈 수정에 실패했습니다.');
  } finally {
    isSubmitting.value = false;
  }
}

// ============================================
// Lifecycle
// ============================================

onMounted(() => {
  void fetchIssue();
  void fetchRelatedData(); // 수정 폼을 위해 미리 로드
});
</script>

<style lang="scss" scoped>
.issue-detail-page {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
