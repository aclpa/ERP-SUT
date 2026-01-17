<template>
  <div class="login-page">
    <q-form @submit="handleLogin" class="q-gutter-md">
      <!-- Email Input -->
      <q-input
        v-model="form.email"
        type="email"
        label="이메일"
        outlined
        :rules="emailRules"
        lazy-rules
        :disable="isLoading"
      >
        <template v-slot:prepend>
          <q-icon name="mail" />
        </template>
      </q-input>

      <!-- Password Input -->
      <q-input
        v-model="form.password"
        :type="showPassword ? 'text' : 'password'"
        label="비밀번호"
        outlined
        :rules="passwordRules"
        lazy-rules
        :disable="isLoading"
      >
        <template v-slot:prepend>
          <q-icon name="lock" />
        </template>
        <template v-slot:append>
          <q-icon
            :name="showPassword ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="showPassword = !showPassword"
          />
        </template>
      </q-input>

      <!-- Remember Me -->
      <q-checkbox
        v-model="form.rememberMe"
        label="로그인 상태 유지"
        :disable="isLoading"
      />

      <!-- Login Button -->
      <q-btn
        type="submit"
        label="로그인"
        color="primary"
        class="full-width"
        size="lg"
        :loading="isLoading"
        :disable="isLoading"
      />

      <!-- Divider -->
      <div class="row items-center q-my-md">
        <q-separator class="col" />
        <div class="col-auto q-px-md text-grey-6">또는</div>
        <q-separator class="col" />
      </div>

      <!-- SSO Login Button -->
      <q-btn
        label="Authentik SSO로 로그인"
        color="secondary"
        class="full-width"
        size="lg"
        outline
        icon="login"
        :loading="isLoadingSSO"
        :disable="isLoadingSSO || isLoading"
        @click="handleSSOLogin"
      />

      <!-- Additional Links -->
      <div class="row justify-between q-mt-md">
        <q-btn
          flat
          dense
          color="primary"
          label="비밀번호 찾기"
          size="sm"
          :disable="isLoading"
        />
        <q-btn
          flat
          dense
          color="primary"
          label="회원가입"
          size="sm"
          :disable="isLoading"
        />
      </div>
    </q-form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuth } from 'src/composables/useAuth';

// ============================================
// Composables
// ============================================

const { login, loginWithSSO, isLoading } = useAuth();

// ============================================
// State
// ============================================

const form = ref({
  email: '',
  password: '',
  rememberMe: false,
});

const showPassword = ref(false);
const isLoadingSSO = ref(false);

// ============================================
// Validation Rules
// ============================================

const emailRules = [
  (val: string) => !!val || '이메일을 입력해주세요.',
  (val: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || '올바른 이메일 형식이 아닙니다.',
];

const passwordRules = [
  (val: string) => !!val || '비밀번호를 입력해주세요.',
  (val: string) => val.length >= 6 || '비밀번호는 최소 6자 이상이어야 합니다.',
];

// ============================================
// Methods
// ============================================

async function handleLogin() {
  try {
    await login(form.value.email, form.value.password);
    // Navigation is handled in the composable
  } catch (error) {
    // Error notification is handled in the composable
    console.error('Login error:', error);
  }
}

async function handleSSOLogin() {
  isLoadingSSO.value = true;
  try {
    await loginWithSSO();
    // Will redirect to Authentik
  } catch (error) {
    // Error notification is handled in the composable
    console.error('SSO login error:', error);
  } finally {
    isLoadingSSO.value = false;
  }
}
</script>

<style scoped lang="scss">
.login-page {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}
</style>
