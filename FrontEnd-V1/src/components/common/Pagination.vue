<template>
  <div class="pagination-wrapper row items-center justify-between q-pa-md">
    <!-- Info -->
    <div class="col-auto text-body2 text-grey-7">
      {{ startIndex }}-{{ endIndex }} / 전체 {{ total }}개
    </div>

    <!-- Pagination Controls -->
    <div class="col-auto">
      <q-pagination
        v-model="currentPage"
        :max="totalPages"
        :max-pages="maxPages"
        direction-links
        boundary-links
        @update:model-value="handlePageChange"
      />
    </div>

    <!-- Page Size Selector -->
    <div class="col-auto row items-center q-gutter-sm">
      <span class="text-body2 text-grey-7">페이지당:</span>
      <q-select
        v-model="currentSize"
        :options="pageSizeOptions"
        dense
        outlined
        style="min-width: 80px"
        @update:model-value="handleSizeChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';

defineOptions({
  name: 'CommonPagination',
});

// ============================================
// Props
// ============================================

interface Props {
  page: number;
  size: number;
  total: number;
  pageSizeOptions?: number[];
  maxPages?: number;
}

const props = withDefaults(defineProps<Props>(), {
  pageSizeOptions: () => [10, 20, 50, 100],
  maxPages: 7,
});

// ============================================
// Emits
// ============================================

const emit = defineEmits<{
  'update:page': [value: number];
  'update:size': [value: number];
}>();

// ============================================
// State
// ============================================

const currentPage = ref(props.page);
const currentSize = ref(props.size);

// ============================================
// Computed
// ============================================

const totalPages = computed(() => Math.ceil(props.total / currentSize.value) || 1);

const startIndex = computed(() => {
  if (props.total === 0) return 0;
  return (currentPage.value - 1) * currentSize.value + 1;
});

const endIndex = computed(() => {
  const end = currentPage.value * currentSize.value;
  return end > props.total ? props.total : end;
});

// ============================================
// Watch
// ============================================

watch(
  () => props.page,
  (newPage) => {
    currentPage.value = newPage;
  }
);

watch(
  () => props.size,
  (newSize) => {
    currentSize.value = newSize;
  }
);

// ============================================
// Methods
// ============================================

function handlePageChange(newPage: number) {
  emit('update:page', newPage);
}

function handleSizeChange(newSize: number) {
  emit('update:size', newSize);
  emit('update:page', 1); // Reset to first page
}
</script>

<style scoped lang="scss">
.pagination-wrapper {
  border-top: 1px solid rgba(0, 0, 0, 0.12);
}
</style>
