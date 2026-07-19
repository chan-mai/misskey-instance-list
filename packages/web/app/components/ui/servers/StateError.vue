<script setup lang="ts">
defineProps<{
  message?: string;
  subMessage?: string;
}>();
</script>

<template>
  <div class="col-span-full py-24 text-center">
    <div class="max-w-sm mx-auto">
      <div class="w-20 h-20 mx-auto mb-6 bg-red-50 dark:bg-red-900/10 flex items-center justify-center">
        <Icon name="lucide:alert-circle" class="w-10 h-10 text-red-500 dark:text-red-400" />
      </div>
      <p class="text-neutral-900 dark:text-neutral-200 mb-2 font-medium">
        {{ message || 'An error occurred' }}
      </p>
      <p class="text-xs text-neutral-500 dark:text-neutral-400 mb-6">
        {{ subMessage || 'Please try again later' }}
      </p>
      <slot name="action" />
    </div>
  </div>
</template>
