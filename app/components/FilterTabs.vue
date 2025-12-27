<template>
  <div class="w-full bg-white/95 dark:bg-black/95 backdrop-blur-sm sticky top-16 z-30 border-b border-neutral-200 dark:border-neutral-800">
    <div class="container mx-auto max-w-screen-xl px-4 lg:px-6">
      <div class="flex items-center justify-between gap-4">
        <!-- Left side: Count + Tabs -->
        <div class="flex items-center gap-4 overflow-hidden flex-1">
          <!-- Count -->
          <div v-if="totalCount" class="hidden md:flex items-baseline gap-2 whitespace-nowrap flex-shrink-0">
            <span class="text-lg font-bold text-neutral-900 dark:text-white">{{ totalCount }}</span>
            <span class="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">servers</span>
          </div>
          
          <!-- Divider -->
          <div v-if="totalCount" class="hidden md:block w-px h-6 bg-neutral-200 dark:bg-neutral-800 flex-shrink-0"></div>

          <!-- Software tabs -->
          <div class="flex items-center gap-0 overflow-x-auto scrollbar-hide w-full">
            <button
              v-for="tab in tabs"
              :key="tab.value"
              @click="emit('update:modelValue', tab.value)"
              class="px-4 py-4 text-xs font-medium tracking-widest uppercase whitespace-nowrap transition-colors"
              :class="modelValue === tab.value 
                ? 'text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-800' 
                : 'text-neutral-500 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900'"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>

        <!-- Filter button -->
        <button
          @click="emit('openFilters')"
          class="flex items-center gap-2 px-4 py-3 text-xs font-medium tracking-widest uppercase text-neutral-500 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex-shrink-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span class="hidden sm:inline">FILTERS</span>
          <span 
            v-if="activeFiltersCount && activeFiltersCount > 0"
            class="w-5 h-5 flex items-center justify-center text-[10px] font-bold bg-primary text-white rounded-full ml-1"
          >
            {{ activeFiltersCount }}
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Tab {
  label: string;
  value: string;
  count?: number;
}

defineProps<{
  modelValue: string;
  tabs: Tab[];
  activeFiltersCount?: number;
  totalCount?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'openFilters': [];
}>();
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
