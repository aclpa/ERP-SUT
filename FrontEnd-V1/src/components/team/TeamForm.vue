<template>
  <q-form @submit="handleSubmit" class="team-form">
    <q-input
      v-model="formData.name"
      label="Team Name *"
      :rules="[(val) => !!val || 'Team name is required']"
      outlined
      class="q-mb-md"
    />

    <q-input
      v-model="formData.description"
      label="Description"
      type="textarea"
      rows="4"
      outlined
      class="q-mb-md"
    />

    <q-select
      v-if="!isEdit"
      v-model="selectedUsers"
      :options="filteredUserOptions"
      label="Select Initial Members"
      multiple
      use-chips
      stack-label
      outlined
      class="q-mb-md"
      use-input
      @filter="filterUsers"
      option-value="id"
      option-label="username"
    >
      <template v-slot:selected-item="scope">
        <q-chip
          removable
          dense
          @remove="scope.removeAtIndex(scope.index)"
          :tabindex="scope.tabindex"
          color="primary"
          text-color="white"
        >
          <q-avatar v-if="scope.opt.avatar_url">
            <img :src="scope.opt.avatar_url" />
          </q-avatar>
          <q-avatar v-else icon="person" color="white" text-color="primary" />
          {{ scope.opt.full_name || scope.opt.username }}
        </q-chip>
      </template>

      <template v-slot:option="scope">
        <q-item v-bind="scope.itemProps">
          <q-item-section avatar>
            <q-avatar>
              <img v-if="scope.opt.avatar_url" :src="scope.opt.avatar_url" />
              <q-icon v-else name="person" />
            </q-avatar>
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ scope.opt.full_name }}</q-item-label>
            <q-item-label caption>@{{ scope.opt.username }}</q-item-label>
          </q-item-section>
        </q-item>
      </template>
    </q-select>

    <q-toggle v-model="formData.is_active" label="Active Team" color="positive" class="q-mb-md" />

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
import { ref, watch, onMounted } from 'vue';
import type { Team, TeamCreate, TeamUpdate, User } from 'src/types/models.types';
import { listUsers } from 'src/api/users.api'; // [!code ++] 사용자 API 임포트

// ... Props & Emits (기존 동일) ...
interface Props {
  team?: Team | null;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  team: null,
  loading: false,
});

const emit = defineEmits<{
  submit: [data: TeamCreate | TeamUpdate];
  cancel: [];
}>();

// ... State ...

const isEdit = ref(!!props.team);
const formData = ref<TeamCreate>({
  name: '',
  is_active: true,
});

// [추가] 사용자 선택 관련 상태
const userOptions = ref<User[]>([]); // 전체 사용자 목록
const filteredUserOptions = ref<User[]>([]); // 필터링된 목록
const selectedUsers = ref<User[]>([]); // q-select에 바인딩될 객체 배열

// ... Watch ...

watch(
  () => props.team,
  (team) => {
    if (team) {
      isEdit.value = true;
      const data: TeamCreate = {
        name: team.name,
        is_active: team.is_active,
      };
      if (team.description) data.description = team.description;
      formData.value = data;
    } else {
      // [추가] 생성 모드일 때 초기화
      isEdit.value = false;
      formData.value = { name: '', is_active: true };
      selectedUsers.value = [];
    }
  },
  { immediate: true },
);

// [추가] 컴포넌트 마운트 시 사용자 목록 로드 (생성 모드일 때만)
onMounted(async () => {
  if (!isEdit.value) {
    try {
      // 페이지네이션 없이 충분한 수의 사용자를 가져오거나, 필요시 검색 API 사용
      const response = await listUsers({ page: 1, size: 100 });
      userOptions.value = response.items;
      filteredUserOptions.value = response.items;
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  }
});

// ... Methods ...

// [추가] q-select 필터 함수 (검색 기능)
function filterUsers(val: string, update: (fn: () => void) => void) {
  if (val === '') {
    update(() => {
      filteredUserOptions.value = userOptions.value;
    });
    return;
  }

  update(() => {
    const needle = val.toLowerCase();
    filteredUserOptions.value = userOptions.value.filter(
      (v) =>
        v.username.toLowerCase().indexOf(needle) > -1 ||
        (v.full_name && v.full_name.toLowerCase().indexOf(needle) > -1),
    );
  });
}

function handleSubmit() {
  // Clean up empty values
  const submitData = { ...formData.value };

  if (!submitData.description) {
    delete submitData.description;
  }

  // [추가] 생성 모드일 때 선택된 사용자들의 ID만 추출해서 member_ids에 할당
  if (!isEdit.value && selectedUsers.value.length > 0) {
    submitData.member_ids = selectedUsers.value.map((u) => u.id);
  }

  emit('submit', submitData);
}

function handleCancel() {
  emit('cancel');
}
</script>
