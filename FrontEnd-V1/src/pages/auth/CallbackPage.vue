<template>
  <div class="callback-page flex flex-center">
    <div class="text-center">
      <q-spinner-dots size="80px" color="primary" />
      <div class="text-h6 q-mt-md text-grey-7">인증 처리 중...</div>
      <div class="text-caption text-grey-6 q-mt-sm">
        잠시만 기다려주세요.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuth } from 'src/composables/useAuth';

// ============================================
// Composables
// ============================================

const route = useRoute();
const { handleSSOCallback } = useAuth();

// ============================================
// Lifecycle
// ============================================

onMounted(async () => {
  // Get authorization code and state from URL query params
  const code = route.query.code as string;
  const state = route.query.state as string;

  if (!code) {
    console.error('No authorization code found in callback URL');
    // Redirect to login with error message
    return;
  }

  try {
    // Handle SSO callback
    await handleSSOCallback(code, state);
    // Navigation is handled in the composable
  } catch (error) {
    console.error('SSO callback error:', error);
    // Error notification and navigation are handled in the composable
  }
});
</script>

<style scoped lang="scss">
.callback-page {
  min-height: 300px;
}
</style>
