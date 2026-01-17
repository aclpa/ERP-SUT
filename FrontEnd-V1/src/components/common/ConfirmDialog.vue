<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card style="min-width: 350px">
      <q-card-section>
        <div class="text-h6">{{ title }}</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        {{ message }}
      </q-card-section>

      <q-card-actions align="right">
        <q-btn
          flat
          :label="cancelLabel"
          color="grey-7"
          @click="handleCancel"
        />
        <q-btn
          :label="confirmLabel"
          :color="confirmColor"
          @click="handleConfirm"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// ============================================
// Props
// ============================================

interface Props {
  modelValue: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: '확인',
  confirmLabel: '확인',
  cancelLabel: '취소',
  confirmColor: 'primary',
});

// ============================================
// Emits
// ============================================

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  confirm: [];
  cancel: [];
}>();

// ============================================
// State
// ============================================

const isOpen = ref(props.modelValue);

// ============================================
// Methods
// ============================================

function handleConfirm() {
  emit('confirm');
  isOpen.value = false;
  emit('update:modelValue', false);
}

function handleCancel() {
  emit('cancel');
  isOpen.value = false;
  emit('update:modelValue', false);
}
</script>
