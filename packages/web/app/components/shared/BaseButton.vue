<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'icon';
}>(), {
  variant: 'primary'
});
</script>

<template>
  <button class="transition-colors flex items-center justify-center" :class="[
    variant === 'icon'
      ? 'p-2 text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
      : variant === 'secondary'
        ? 'px-4 py-3 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 font-medium tracking-wide hover:border-neutral-400 dark:hover:border-neutral-500'
        : 'px-4 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border border-neutral-900 dark:border-white hover:bg-neutral-700 dark:hover:bg-neutral-200'
  ]">
    <slot />
  </button>
</template>
