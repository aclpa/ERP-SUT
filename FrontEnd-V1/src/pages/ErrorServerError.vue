<template>
  <q-page class="flex flex-center bg-grey-1">
    <div class="column items-center q-gutter-lg" style="max-width: 600px">
      <!-- Error Icon -->
      <q-icon name="error" size="120px" color="negative" />

      <!-- Error Code -->
      <div class="text-h2 text-weight-bold text-negative">500</div>

      <!-- Error Title -->
      <div class="text-h5 text-weight-medium text-center">
        서버 오류가 발생했습니다
      </div>

      <!-- Error Description -->
      <div class="text-body1 text-grey-7 text-center">
        죄송합니다. 서버에 문제가 발생했습니다.<br />
        잠시 후 다시 시도해주세요.
      </div>

      <!-- Actions -->
      <div class="row q-gutter-md">
        <q-btn
          color="primary"
          label="새로고침"
          icon="refresh"
          @click="handleRefresh"
          unelevated
        />
        <q-btn
          color="grey-7"
          label="홈으로 돌아가기"
          icon="home"
          @click="handleGoHome"
          outline
        />
      </div>

      <!-- Additional Info -->
      <q-card flat bordered class="full-width q-pa-md bg-grey-2">
        <div class="text-caption text-grey-7">
          문제가 계속되면 시스템 관리자에게 문의해주세요.
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

// ============================================
// Composables
// ============================================

const router = useRouter();

// ============================================
// Methods
// ============================================

function handleRefresh() {
  window.location.reload();
}

function handleGoHome() {
  void router.push('/dashboard');
}
</script>

<style scoped lang="scss">
.q-page {
  min-height: 100vh;
}
</style>
