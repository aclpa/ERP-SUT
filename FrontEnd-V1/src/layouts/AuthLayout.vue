<template>
  <q-layout view="hHh lpR fFf" class="auth-layout">
    <q-page-container>
      <q-page class="flex flex-center bg-grey-2">
        <div class="auth-card-wrapper">
          <q-card class="auth-card q-pa-lg shadow-8">
            <!-- Logo and Title -->
            <q-card-section class="text-center q-pb-none">
              <div class="text-h4 text-weight-bold text-primary q-mb-xs">
                DevFlow ERP
              </div>
              <div class="text-subtitle2 text-grey-7">
                프로젝트 관리 & 배포 통합 시스템
              </div>
            </q-card-section>

            <!-- Content -->
            <q-card-section>
              <router-view />
            </q-card-section>

            <!-- Footer -->
            <q-card-section class="text-center text-caption text-grey-6 q-pt-none">
              &copy; {{ currentYear }} DevFlow ERP. All rights reserved.
            </q-card-section>
          </q-card>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const currentYear = computed(() => new Date().getFullYear());
</script>

<style scoped lang="scss">
.auth-layout {
  min-height: 100vh;
}

.auth-card-wrapper {
  width: 100%;
  max-width: 450px;
  padding: 1rem;
}

.auth-card {
  border-radius: 12px;
}

@media (max-width: 599px) {
  .auth-card-wrapper {
    max-width: 100%;
  }

  .auth-card {
    box-shadow: none;
  }
}
</style>
