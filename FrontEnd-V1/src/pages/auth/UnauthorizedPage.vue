<template>
  <div class="unauthorized-page flex flex-center q-pa-md">
    <div class="text-center">
      <q-icon name="block" size="120px" color="negative" />

      <div class="text-h4 q-mt-md text-weight-bold">
        접근 권한이 없습니다
      </div>

      <div class="text-body1 text-grey-7 q-mt-md q-mb-lg" style="max-width: 500px">
        이 페이지에 접근할 권한이 없습니다.<br />
        필요한 권한이 있다고 생각되면 관리자에게 문의해주세요.
      </div>

      <div class="q-gutter-sm">
        <q-btn
          label="대시보드로 이동"
          color="primary"
          size="md"
          @click="$router.push('/dashboard')"
        />
        <q-btn
          label="이전 페이지로"
          color="grey-7"
          outline
          size="md"
          @click="$router.go(-1)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No additional logic needed for this page
</script>

<style scoped lang="scss">
.unauthorized-page {
  min-height: 400px;
}
</style>
