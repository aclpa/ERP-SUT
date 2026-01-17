<template>
  <q-card>
    <q-card-section>
      <q-skeleton v-if="loading" type="rect" height="80px" />
      <div v-else class="row items-center">
        <q-icon
          :name="icon"
          size="48px"
          :color="color"
          class="q-mr-md"
        />
        <div>
          <div class="text-h6 text-weight-bold">{{ formattedValue }}</div>
          <div class="text-caption text-grey-7">{{ title }}</div>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';

// ============================================
// Props
// ============================================

interface Props {
  title: string;
  value: number | string;
  icon: string;
  color?: string;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  color: 'primary',
  loading: false,
});

// ============================================
// Computed
// ============================================

const formattedValue = computed(() => {
  if (typeof props.value === 'number') {
    return props.value.toLocaleString();
  }
  return props.value;
});
</script>
