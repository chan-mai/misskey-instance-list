<script setup lang="ts" generic="T">
export interface Option<T> {
  label: string;
  value: T;
}

defineProps<{
  modelValue: T;
  options: Option<T>[];
}>();

defineEmits<{
  (e: 'update:modelValue', value: T): void;
}>();
</script>

<template>
  <div class="flex w-full isolate">
    <button v-for="(option, index) in options" :key="index" type="button"
      class="flex-1 w-0 px-3 py-2 text-xs font-medium border transition-colors flex items-center justify-center -ml-px focus:z-10 focus:outline-none focus:ring-2 focus:ring-neutral-400"
      :class="[
        index === 0 ? 'ml-0' : '',
        modelValue === option.value
          ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white z-10'
          : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500'
      ]" @click="$emit('update:modelValue', option.value)">
      {{ option.label }}
    </button>
  </div>
</template>
