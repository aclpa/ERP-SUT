<template>
  <router-view />
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';

// 1. Quasar 앱 이름 설정 (기존에 있었을 가능성이 높음)
defineOptions({
  name: 'App',
});

// 2. 다크모드 강제 해제 (추가한 내용)
const $q = useQuasar();
$q.dark.set(false);
</script>
