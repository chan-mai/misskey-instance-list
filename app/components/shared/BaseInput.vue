<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: string | number | null;
  type?: string;
  placeholder?: string;
  size?: 'sm' | 'md';
  min?: string | number;
  step?: string | number;
}>(), {
  type: 'text',
  size: 'md'
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | null): void;
}>();

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement;
  if (props.type === 'number') {
    if (target.value === '') {
      emit('update:modelValue', null);
      return;
    }
    const parsed = Number(target.value);
    if (Number.isNaN(parsed)) {
      emit('update:modelValue', null);
    } else {
      emit('update:modelValue', parsed);
    }
  } else {
    emit('update:modelValue', target.value);
  }
}
</script>

<template>
  <input :type="type" :value="modelValue" @input="handleInput" :placeholder="placeholder" :min="min" :step="step"
    class="w-full bg-transparent border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
    :class="[
      size === 'sm' ? 'px-3 py-2 text-xs bg-white dark:bg-neutral-900' : 'px-4 py-3'
    ]" />
</template>
