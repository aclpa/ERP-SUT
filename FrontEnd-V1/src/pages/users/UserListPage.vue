<template>
  <q-page class="q-pa-lg">
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bold">Users</div>
        <div class="text-subtitle2 text-grey-7">Manage system users and permissions</div>
      </div>
      <q-btn color="primary" icon="add" label="New User" @click="openCreateDialog" />
    </div>

    <q-card flat bordered class="q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-input
              v-model="userStore.searchQuery"
              dense
              outlined
              placeholder="Search by name, email..."
              @keyup.enter="loadUsers"
            >
              <template #append>
                <q-icon name="search" class="cursor-pointer" @click="loadUsers" />
              </template>
            </q-input>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-table
      flat
      bordered
      :rows="userStore.users"
      :columns="columns"
      row-key="id"
      :loading="userStore.isLoading"
      v-model:pagination="pagination"
      @request="onRequest"
    >
      <template v-slot:body-cell-username="props">
        <q-td :props="props">
          <div class="row items-center no-wrap">
            <q-avatar size="sm" class="q-mr-sm">
              <img v-if="props.row.avatar_url" :src="props.row.avatar_url" />
              <q-icon v-else name="person" color="grey" />
            </q-avatar>
            <div>
              <div class="text-weight-bold">{{ props.row.username }}</div>
              <div class="text-caption text-grey">{{ props.row.full_name }}</div>
            </div>
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-is_active="props">
        <q-td :props="props">
          <q-badge :color="props.row.is_active ? 'positive' : 'grey'" rounded>
            {{ props.row.is_active ? 'Active' : 'Inactive' }}
          </q-badge>
        </q-td>
      </template>

      <template v-slot:body-cell-is_admin="props">
        <q-td :props="props">
          <q-chip
            v-if="props.row.is_admin"
            color="negative"
            text-color="white"
            size="sm"
            icon="security"
            label="Admin"
          />
          <span v-else class="text-grey-7">User</span>
        </q-td>
      </template>

      <template v-slot:body-cell-actions="props">
        <q-td :props="props" align="right">
          <q-btn
            flat
            round
            color="primary"
            icon="edit"
            size="sm"
            @click="openEditDialog(props.row)"
          />
          <q-btn
            flat
            round
            color="negative"
            icon="delete"
            size="sm"
            @click="handleDelete(props.row)"
          />
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="dialogVisible" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">{{ editingUser ? 'Edit User' : 'New User' }}</div>
        </q-card-section>

        <q-card-section>
          <UserForm :user="editingUser" :loading="userStore.isLoading" @submit="handleFormSubmit" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useQuasar, type QTableColumn } from 'quasar'; // [Fix] type import
import { useUserStore } from 'src/stores/user.store';
import type { User, UserCreate, UserUpdate } from 'src/types/models.types';
import UserForm from 'src/components/users/UserForm.vue';

const $q = useQuasar();
const userStore = useUserStore();

// 상태
const dialogVisible = ref(false);
const editingUser = ref<User | undefined>(undefined);

// 테이블 컬럼 정의
const columns: QTableColumn[] = [
  { name: 'id', label: 'ID', field: 'id', sortable: true, align: 'left' },
  { name: 'username', label: 'User', field: 'username', sortable: true, align: 'left' },
  { name: 'email', label: 'Email', field: 'email', sortable: true, align: 'left' },
  { name: 'phone', label: 'Phone', field: 'phone', align: 'left' },
  { name: 'is_active', label: 'Status', field: 'is_active', sortable: true, align: 'center' },
  { name: 'is_admin', label: 'Role', field: 'is_admin', sortable: true, align: 'center' },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'right' },
];

// 페이지네이션 바인딩 (QTable용)
const pagination = computed({
  get: () => ({
    page: userStore.currentPage,
    rowsPerPage: userStore.pageSize,
    rowsNumber: userStore.totalCount,
  }),
  set: (val) => {
    userStore.setPage(val.page);
    userStore.setPageSize(val.rowsPerPage);
  },
});

// 데이터 로드
async function loadUsers() {
  await userStore.fetchUsers();
}

// QTable Request 핸들러 (페이지네이션, 정렬 시 호출)
// [Fix] props 타입 명시
function onRequest(props: { pagination: { page: number; rowsPerPage: number } }) {
  const { page, rowsPerPage } = props.pagination;
  userStore.setPage(page);
  userStore.setPageSize(rowsPerPage);
  void loadUsers(); // [Fix] void operator
}

// 다이얼로그 열기
function openCreateDialog() {
  editingUser.value = undefined;
  dialogVisible.value = true;
}

function openEditDialog(user: User) {
  editingUser.value = user;
  dialogVisible.value = true;
}

// 폼 제출 처리
async function handleFormSubmit(data: UserCreate | UserUpdate) {
  try {
    if (editingUser.value) {
      await userStore.updateUser(editingUser.value.id, data as UserUpdate);
      $q.notify({ type: 'positive', message: 'User updated successfully' });
    } else {
      await userStore.createUser(data as UserCreate);
      $q.notify({ type: 'positive', message: 'User created successfully' });
    }
    dialogVisible.value = false;
    void loadUsers(); // [Fix] void operator
  } catch {
    // [Fix] unused error removed
    $q.notify({ type: 'negative', message: 'Operation failed' });
  }
}

// 삭제 처리
function handleDelete(user: User) {
  $q.dialog({
    title: 'Confirm Delete',
    message: `Are you sure you want to delete user "${user.username}"?`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    // [Fix] async wrapper for onOk void return
    void (async () => {
      try {
        await userStore.deleteUser(user.id);
        $q.notify({ type: 'positive', message: 'User deleted' });
        void loadUsers();
      } catch {
        // [Fix] unused error removed
        $q.notify({ type: 'negative', message: 'Failed to delete user' });
      }
    })();
  });
}

onMounted(() => {
  void loadUsers(); // [Fix] void operator
});
</script>
