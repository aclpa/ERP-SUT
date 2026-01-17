<template>
  <q-card class="server-card" :class="`server-card--${server.status}`">
    <q-card-section>
      <div class="row items-center justify-between q-mb-sm">
        <div class="col">
          <div class="text-h6 text-weight-medium">{{ server.name }}</div>
          <div class="text-caption text-grey-7">{{ server.hostname }}</div>
        </div>
        <div class="col-auto">
          <status-badge type="server-status" :value="server.status" />
        </div>
      </div>

      <div class="q-mb-sm">
        <div class="row items-center q-gutter-xs q-mb-xs">
          <q-icon name="location_on" size="xs" color="grey-7" />
          <span class="text-body2 text-grey-8">{{ server.ip_address }}</span>
        </div>
        <div class="row items-center q-gutter-xs">
          <status-badge type="server-environment" :value="server.environment" size="sm" />
          <status-badge type="server-type" :value="server.type" size="sm" />
        </div>
      </div>

      <div v-if="server.description" class="text-body2 text-grey-8 q-mb-sm">
        {{ server.description }}
      </div>

      <div v-if="server.cpu_cores || server.memory_gb || server.disk_gb" class="text-caption text-grey-7">
        <div class="row items-center q-gutter-xs">
          <q-icon name="memory" size="xs" />
          <span>
            <template v-if="server.cpu_cores">{{ server.cpu_cores }} cores</template>
            <template v-if="server.memory_gb"> • {{ server.memory_gb }}GB RAM</template>
            <template v-if="server.disk_gb"> • {{ server.disk_gb }}GB disk</template>
          </span>
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
        <q-tooltip>Edit Server</q-tooltip>
      </q-btn>
      <q-btn
        v-if="canDelete"
        flat
        dense
        icon="delete"
        color="negative"
        @click="handleDelete"
      >
        <q-tooltip>Delete Server</q-tooltip>
      </q-btn>
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import type { Server } from 'src/types/models.types';
import StatusBadge from 'src/components/common/StatusBadge.vue';

// ============================================
// Props
// ============================================

interface Props {
  server: Server;
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
  edit: [server: Server];
  delete: [server: Server];
}>();

// ============================================
// Methods
// ============================================

function handleEdit() {
  emit('edit', props.server);
}

function handleDelete() {
  emit('delete', props.server);
}
</script>

<style scoped lang="scss">
.server-card {
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
