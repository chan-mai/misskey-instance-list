<script setup lang="ts">
defineProps<{
  message?: string;
  subMessage?: string;
}>();

defineEmits<{
  (e: 'reset'): void;
}>();
</script>

<template>
  <div class="col-span-full py-24 text-center">
    <div class="max-w-sm mx-auto">
      <div class="w-20 h-20 mx-auto mb-6 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-neutral-400 dark:text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <p class="text-neutral-600 dark:text-neutral-400 mb-2">
        {{ message || 'No results found' }}
      </p>
      <p class="text-xs text-neutral-400 dark:text-neutral-500 mb-6">
        {{ subMessage || 'Try changing your search criteria' }}
      </p>
      <slot name="action" />
    </div>
  </div>
</template>
