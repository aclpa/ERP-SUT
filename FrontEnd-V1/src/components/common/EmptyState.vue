<template>
  <div class="empty-state text-center q-pa-lg">
    <q-icon
      :name="icon"
      :size="iconSize"
      :color="iconColor"
      class="q-mb-md"
    />

    <div class="text-h6 text-weight-medium q-mb-sm">
      {{ title }}
    </div>

    <div v-if="description" class="text-body2 text-grey-7 q-mb-md">
      {{ description }}
    </div>

    <div v-if="$slots.action" class="q-mt-md">
      <slot name="action" />
    </div>

    <q-btn
      v-else-if="actionLabel"
      :label="actionLabel"
      :icon="actionIcon"
      color="primary"
      @click="$emit('action')"
    />
  </div>
</template>

<script setup lang="ts">
// ============================================
// Props
// ============================================

interface Props {
  title: string;
  description?: string;
  icon?: string;
  iconSize?: string;
  iconColor?: string;
  actionLabel?: string;
  actionIcon?: string;
}

withDefaults(defineProps<Props>(), {
  icon: 'inbox',
  iconSize: '80px',
  iconColor: 'grey-5',
});

// ============================================
// Emits
// ============================================

defineEmits<{
  action: [];
}>();
</script>

<style scoped lang="scss">
.empty-state {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
