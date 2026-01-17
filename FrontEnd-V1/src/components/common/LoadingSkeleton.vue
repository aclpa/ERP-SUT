<template>
  <div class="loading-skeleton">
    <!-- Card Skeleton -->
    <q-card v-if="type === 'card'" flat bordered>
      <q-card-section>
        <div class="row items-center q-gutter-sm">
          <q-skeleton type="QAvatar" v-if="avatar" />
          <div class="col">
            <q-skeleton type="text" width="60%" />
            <q-skeleton type="text" width="40%" />
          </div>
        </div>
      </q-card-section>
      <q-card-section>
        <q-skeleton type="text" :count="lines" />
      </q-card-section>
      <q-card-actions v-if="actions">
        <q-skeleton type="QBtn" />
        <q-skeleton type="QBtn" />
      </q-card-actions>
    </q-card>

    <!-- Table Skeleton -->
    <q-table v-else-if="type === 'table'" flat bordered :rows="[]" :columns="tableColumns">
      <template v-slot:body>
        <q-tr v-for="n in rows" :key="n">
          <q-td v-for="col in tableColumns.length" :key="col">
            <q-skeleton type="text" />
          </q-td>
        </q-tr>
      </template>
    </q-table>

    <!-- List Skeleton -->
    <q-list v-else-if="type === 'list'" bordered separator>
      <q-item v-for="n in rows" :key="n">
        <q-item-section avatar v-if="avatar">
          <q-skeleton type="QAvatar" />
        </q-item-section>
        <q-item-section>
          <q-skeleton type="text" width="70%" />
          <q-skeleton type="text" width="50%" />
        </q-item-section>
      </q-item>
    </q-list>

    <!-- Text Skeleton (Default) -->
    <div v-else>
      <q-skeleton type="text" :count="lines" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// ============================================
// Props
// ============================================

interface Props {
  type?: 'card' | 'table' | 'list' | 'text';
  lines?: number;
  rows?: number;
  avatar?: boolean;
  actions?: boolean;
  columns?: number;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  lines: 3,
  rows: 5,
  avatar: false,
  actions: false,
  columns: 4,
});

// ============================================
// Computed
// ============================================

const tableColumns = computed(() => {
  return Array.from({ length: props.columns }, (_, i) => ({
    name: `col${i}`,
    label: '',
    field: `col${i}`,
    align: 'left' as const,
  }));
});
</script>

<style scoped lang="scss">
.loading-skeleton {
  width: 100%;
}
</style>
