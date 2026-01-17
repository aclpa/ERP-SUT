<template>
  <q-dialog :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <q-card style="min-width: 400px">
      <q-card-section>
        <div class="text-h6">Edit Team Member</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="handleSubmit" class="q-gutter-md">
          <q-input
            v-model="form.full_name"
            label="Full Name"
            outlined
            dense
            :rules="[(val) => !!val || 'Name is required']"
          />

          <q-select
            v-model="form.role"
            :options="roleOptions"
            label="Role"
            outlined
            dense
            emit-value
            map-options
          />

          <div class="row justify-end q-gutter-sm q-mt-lg">
            <q-btn label="Cancel" flat v-close-popup />
            <q-btn label="Save" type="submit" color="primary" :loading="loading" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { TeamMember, TeamRole } from 'src/types/models.types';

const props = defineProps<{
  modelValue: boolean;
  member: TeamMember | null;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'submit', data: { role: TeamRole; full_name: string }): void;
}>();

// 역할 옵션 (대문자로 정의된 ENUM 값 사용)
const roleOptions = [
  { label: 'Owner', value: 'OWNER' },
  { label: 'Admin', value: 'ADMIN' },
  { label: 'Member', value: 'MEMBER' },
  { label: 'Viewer', value: 'VIEWER' },
];

const form = ref({
  role: 'MEMBER' as TeamRole,
  full_name: '',
});

// 다이얼로그가 열리거나 선택된 멤버가 바뀔 때 폼 데이터 초기화
watch(
  () => props.member,
  (newMember) => {
    if (newMember) {
      form.value = {
        role: newMember.role,
        full_name: newMember.user?.full_name || '', // [수정] Optional Chaining 추가
      };
    }
  },
  { immediate: true },
);

function handleSubmit() {
  emit('submit', form.value);
}
</script>
