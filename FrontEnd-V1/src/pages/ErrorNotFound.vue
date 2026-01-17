<template>
  <q-page class="flex flex-center bg-grey-1">
    <div class="column items-center q-gutter-lg" style="max-width: 600px">
      <!-- Error Icon -->
      <q-icon name="search_off" size="120px" color="warning" />

      <!-- Error Code -->
      <div class="text-h2 text-weight-bold text-warning">404</div>

      <!-- Error Title -->
      <div class="text-h5 text-weight-medium text-center">
        페이지를 찾을 수 없습니다
      </div>

      <!-- Error Description -->
      <div class="text-body1 text-grey-7 text-center">
        요청하신 페이지가 존재하지 않거나,<br />
        이동되었거나 삭제되었을 수 있습니다.
      </div>

      <!-- Actions -->
      <div class="row q-gutter-md">
        <q-btn
          color="primary"
          label="홈으로 돌아가기"
          icon="home"
          @click="handleGoHome"
          unelevated
        />
        <q-btn
          color="grey-7"
          label="이전 페이지"
          icon="arrow_back"
          @click="handleGoBack"
          outline
        />
      </div>

      <!-- Additional Info -->
      <q-card flat bordered class="full-width q-pa-md bg-grey-2">
        <div class="text-caption text-grey-7">
          URL을 확인하시거나 홈페이지로 돌아가주세요.
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

function handleGoHome() {
  void router.push('/dashboard');
}

function handleGoBack() {
  router.back();
}
</script>

<style scoped lang="scss">
.q-page {
  min-height: 100vh;
}
</style>
