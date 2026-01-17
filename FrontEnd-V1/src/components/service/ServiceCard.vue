<template>
  <q-card class="service-card" :class="`service-card--${service.status}`">
    <q-card-section>
      <div class="row items-center justify-between q-mb-sm">
        <div class="col">
          <div class="text-h6 text-weight-medium">{{ service.name }}</div>
          <div v-if="service.url" class="text-caption text-grey-7">
            <a :href="service.url" target="_blank" class="text-primary">{{ service.url }}</a>
          </div>
        </div>
        <div class="col-auto">
          <status-badge type="service-status" :value="service.status" />
        </div>
      </div>

      <div class="q-mb-sm">
        <div class="row items-center q-gutter-xs">
          <status-badge type="service-type" :value="service.type" size="sm" />
          <q-badge v-if="service.port" color="grey-7" outline>
            Port: {{ service.port }}
          </q-badge>
        </div>
      </div>

      <div v-if="service.description" class="text-body2 text-grey-8 q-mb-sm">
        {{ service.description }}
      </div>

      <div class="text-caption text-grey-7">
        <div class="row items-center q-gutter-xs q-mb-xs">
          <q-icon name="dns" size="xs" />
          <span>Server ID: {{ service.server_id }}</span>
        </div>
        <div v-if="service.version" class="row items-center q-gutter-xs">
          <q-icon name="tag" size="xs" />
          <span>Version: {{ service.version }}</span>
        </div>
      </div>
    </q-card-section>

    <q-separator v-if="canEdit || canDelete" />

    <q-card-actions v-if="canEdit || canDelete" align="right">
      <q-btn
        v-if="canEdit"
        flat
        dense
        icon="edit"
        color="primary"
        @click="handleEdit"
      >
        <q-tooltip>Edit Service</q-tooltip>
      </q-btn>
      <q-btn
        v-if="canDelete"
        flat
        dense
        icon="delete"
        color="negative"
        @click="handleDelete"
      >
        <q-tooltip>Delete Service</q-tooltip>
      </q-btn>
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import type { Service } from 'src/types/models.types';
import StatusBadge from 'src/components/common/StatusBadge.vue';

// ============================================
// Props
// ============================================

interface Props {
  service: Service;
  canEdit?: boolean;
  canDelete?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  canEdit: true,
  canDelete: true,
});

// ============================================
// Emits
// ============================================

const emit = defineEmits<{
  edit: [service: Service];
  delete: [service: Service];
}>();

// ============================================
// Methods
// ============================================

function handleEdit() {
  emit('edit', props.service);
}

function handleDelete() {
  emit('delete', props.service);
}
</script>

<style scoped lang="scss">
.service-card {
  height: 100%;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  &--running {
    border-left: 4px solid $positive;
  }

  &--stopped {
    border-left: 4px solid $grey-5;
  }

  &--maintenance {
    border-left: 4px solid $warning;
  }

  &--error {
    border-left: 4px solid $negative;
  }
}
</style>
