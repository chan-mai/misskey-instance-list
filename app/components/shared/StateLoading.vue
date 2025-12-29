<script setup lang="ts">
defineProps<{
  message?: string;
}>();
</script>

<template>
  <div class="col-span-full py-24 flex items-center justify-center">
    <div class="text-center">
      <div
        class="w-10 h-10 border-2 border-neutral-200 dark:border-neutral-700 border-t-primary animate-spin mx-auto rounded-full">
      </div>
      <p class="text-neutral-400 dark:text-neutral-500 mt-6 text-xs tracking-widest uppercase">
        {{ message || 'Loading' }}
      </p>
    </div>
  </div>
</template>
