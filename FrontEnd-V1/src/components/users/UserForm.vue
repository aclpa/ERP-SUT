<template>
  <q-form @submit="handleSubmit" class="q-gutter-y-md">
    <div class="row q-col-gutter-md">
      <div class="col-6">
        <q-input
          v-model="form.email"
          label="Email *"
          outlined
          dense
          :rules="[
            (val) => !!val || 'Email is required',
            (val) => /.+@.+\..+/.test(val) || 'Invalid email format',
          ]"
        />
      </div>
      <div class="col-6">
        <q-input
          v-model="form.username"
          label="Username *"
          outlined
          dense
          :rules="[(val) => !!val || 'Username is required']"
        />
      </div>
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-6">
        <q-input
          v-model="form.full_name"
          label="Full Name *"
          outlined
          dense
          :rules="[(val) => !!val || 'Full name is required']"
        />
      </div>
      <div class="col-6">
        <q-input
          v-model="form.phone"
          label="Phone *"
          outlined
          dense
          mask="###-####-####"
          hint="010-0000-0000"
          :rules="[(val) => !!val || 'Phone is required']"
        />
      </div>
    </div>

    <div class="row">
      <div class="col-12">
        <q-input
          v-model="form.avatar_url"
          label="Avatar URL"
          outlined
          dense
          placeholder="https://..."
        />
      </div>
    </div>

    <div class="row" v-if="!isEdit">
      <div class="col-12">
        <q-input
          v-model="form.authentik_id"
          label="Authentik ID"
          outlined
          dense
          hint="Optional for SSO linkage"
        />
      </div>
    </div>

    <div class="row q-col-gutter-md items-center">
      <div class="col-auto">
        <q-toggle v-model="form.is_admin" label="Admin User" color="negative" />
      </div>
    </div>

    <div class="row justify-end q-gutter-sm q-mt-lg">
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
// ... (스크립트 부분은 기존과 동일하므로 유지)
import { reactive, computed, onMounted } from 'vue';
import type { User, UserCreate, UserUpdate } from 'src/types/models.types';

// [기존 코드 유지] Props 인터페이스
interface Props {
  user?: User | undefined; // 수정된 타입
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const emit = defineEmits<{
  (e: 'submit', data: UserCreate | UserUpdate): void;
}>();

const isEdit = computed(() => !!props.user);

const form = reactive({
  email: '',
  username: '',
  full_name: '',
  phone: '',
  avatar_url: '',
  authentik_id: '',
  is_admin: false,
  is_active: true,
});

onMounted(() => {
  if (props.user) {
    form.email = props.user.email;
    form.username = props.user.username;
    form.full_name = props.user.full_name || '';
    form.phone = props.user.phone || '';
    form.avatar_url = props.user.avatar_url || '';
    form.is_admin = props.user.is_admin;
    form.is_active = props.user.is_active;
  }
});

function handleSubmit() {
  if (isEdit.value) {
    const updateData: UserUpdate = {
      email: form.email,
      username: form.username,
      full_name: form.full_name,
      phone: form.phone,
      avatar_url: form.avatar_url || undefined,
      is_active: form.is_active,
    };
    emit('submit', updateData);
  } else {
    const createData: UserCreate = {
      email: form.email,
      username: form.username,
      full_name: form.full_name,
      phone: form.phone,
      is_admin: form.is_admin,
      avatar_url: form.avatar_url || undefined,
      authentik_id: form.authentik_id || undefined,
    };
    emit('submit', createData);
  }
}
</script>
