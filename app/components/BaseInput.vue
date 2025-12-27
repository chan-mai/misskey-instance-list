<script setup lang="ts">
defineProps<{
  modelValue: string;
  type?: string;
  placeholder?: string;
}>();

defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();
</script>

<template>
  <input
    :type="type || 'text'"
    :value="modelValue"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    :placeholder="placeholder"
    class="w-full px-4 py-3 bg-transparent border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
  />
</template>
