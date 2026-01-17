<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <q-card style="min-width: 500px">
      <q-card-section>
        <div class="text-h6">Create New User</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="handleSubmit">
          <div class="row q-col-gutter-md q-mb-md">
            <div class="col-6">
              <q-input
                v-model="form.username"
                label="Username *"
                outlined
                dense
                :rules="[(val) => !!val || 'Required']"
              />
            </div>
            <div class="col-6">
              <q-input
                v-model="form.full_name"
                label="Full Name *"
                outlined
                dense
                :rules="[(val) => !!val || 'Required']"
              />
            </div>
          </div>

          <q-input
            v-model="form.email"
            label="Email *"
            type="email"
            outlined
            dense
            class="q-mb-md"
            :rules="[
              (val) => !!val || 'Required',
              (val) => /.+@.+\..+/.test(val) || 'Invalid email',
            ]"
          />

          <q-input
            v-model="form.phone"
            label="Phone *"
            outlined
            dense
            mask="###-####-####"
            placeholder="010-0000-0000"
            class="q-mb-md"
            :rules="[(val) => !!val || 'Required']"
          />

          <q-toggle v-model="form.is_admin" label="Is Admin?" class="q-mb-md" />

          <div class="row justify-end">
            <q-btn label="Cancel" flat v-close-popup class="q-mr-sm" />
            <q-btn label="Create" type="submit" color="primary" :loading="loading" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useQuasar } from 'quasar';
import { createUser } from 'src/api/users.api';
import type { User, UserCreate } from 'src/types/models.types';

defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'created', user: User): void;
}>();

const $q = useQuasar();
const loading = ref(false);

const form = reactive<UserCreate>({
  username: '',
  full_name: '',
  email: '',
  phone: '',
  is_admin: false,
  authentik_id: '',
  avatar_url: '',
});

async function handleSubmit() {
  loading.value = true;
  try {
    const createPayload: UserCreate = {
      ...form,
      authentik_id: form.authentik_id || undefined,
      avatar_url: form.avatar_url || undefined,
    };

    const newUser = await createUser(createPayload);

    $q.notify({ type: 'positive', message: 'User created successfully' });
    emit('created', newUser);
    emit('update:modelValue', false);

    // 폼 초기화
    form.username = '';
    form.full_name = '';
    form.email = '';
    form.phone = '';
    form.is_admin = false;
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Failed to create user';
    $q.notify({ type: 'negative', message: msg });
  } finally {
    loading.value = false;
  }
}
</script>
