<template>
  <q-page class="q-pa-md">
    <div class="text-h4 text-weight-bold">kanban board</div>

    <div v-if="issueStore.isLoading" class="flex flex-center" style="height: 50vh">
      <q-spinner-dots color="primary" size="50px" />
    </div>

    <div v-else class="kanban-board-container">
      <div v-for="status in statuses" :key="status.value" class="kanban-column">
        <q-card flat bordered>
          <q-card-section class="bg-grey-2">
            <div class="text-subtitle1 text-weight-bold">{{ status.label }}</div>
          </q-card-section>

          <q-separator />

          <q-card-section class="q-pa-sm kanban-list">
            <draggable
              :list="issueStore.issuesByStatus[status.value]"
              group="issues"
              item-key="id"
              class="draggable-area"
              tag="div"
              @change="(event: DraggableChangeEvent) => handleMove(event, status.value)"
            >
              <template #item="{ element: issue }">
                <issue-card :issue="issue" class="q-mb-sm cursor-grab" />
              </template>
            </draggable>

            <div
              v-if="!issueStore.issuesByStatus[status.value]?.length"
              class="text-center text-grey q-pa-md"
            >
              카드가 없습니다
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useIssueStore } from 'src/stores/issue.store';
import { ISSUE_STATUS_OPTIONS } from 'src/utils/constants';
import IssueCard from 'src/components/issue/IssueCard.vue';
// 1단계에서 설치한 'vuedraggable'과 필요한 타입들을 가져옵니다.
import draggable from 'vuedraggable';
import type { Issue, IssueStatus } from 'src/types/models.types';
import { useQuasar } from 'quasar'

// vuedraggable 이벤트의 타입을 명확하게 정의합니다. (TypeScript 오류 방지)
interface DraggableChangeEvent {
  added?: { element: Issue; newIndex: number };
  removed?: { element: Issue; oldIndex: number };
  moved?: { element: Issue; newIndex: number; oldIndex: number };
}

// Pinia 저장소를 가져옵니다.
const issueStore = useIssueStore();
const $q = useQuasar()
// '할 일' 등 상태 목록을 가져옵니다.
const statuses = ISSUE_STATUS_OPTIONS;

// 페이지가 처음 열릴 때, 모든 이슈 데이터를 가져옵니다.
onMounted(() => {
  // void를 붙여 ESLint 오류(no-floating-promises)를 해결합니다.
  void issueStore.fetchIssues({ size: 1000 });
});
const allowedTransitions: Record<IssueStatus, IssueStatus[]> = {
  'todo': ['in_progress'],
  'in_progress': ['in_review'],
  'in_review': ['testing'],
  'testing': ['done'],
  'done': ['closed'],
  'closed': []
}
// 카드를 드래그해서 다른 열에 놓았을 때 실행될 함수
const handleMove = async (event: DraggableChangeEvent, newStatus: IssueStatus) => {
  if (event.added) {
    const movedIssue: Issue = event.added.element;
    const currentStatus = movedIssue.status

    // 비유효 전이 차단
    if (!allowedTransitions[currentStatus].includes(newStatus)) {
      $q.notify({
        type: 'negative',
        message: `${currentStatus} → ${newStatus} 로 직접 이동할 수 없습니다.`
      })
      console.warn(`비유효 전이: ${currentStatus} → ${newStatus}`)
      void issueStore.fetchIssues({ size: 1000 })
      return
    }

    try {
      await issueStore.updateStatus(movedIssue.id, newStatus)
    } catch (error) {
      console.error('상태 변경 실패:', error)
      void issueStore.fetchIssues({ size: 1000 })
    }
  }
};


</script>

<style lang="scss" scoped>
.kanban-board-container {
  display: flex;
  gap: 16px;
  overflow-x: auto; /* 열이 많아지면 가로 스크롤 */
  padding-bottom: 16px;
}
.kanban-column {
  width: 300px;
  flex-shrink: 0; /* 열 너비 고정 */
}
.kanban-list {
  min-height: 200px;
  background-color: #f9f9f9;
}
.draggable-area {
  min-height: 200px; /* 드래그 영역이 비어있어도 최소 높이 유지 */
}
.cursor-grab {
  cursor: grab; /* 드래그할 수 있음을 알려주는 손 모양 커서 */
}
</style>
