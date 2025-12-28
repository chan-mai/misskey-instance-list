<template>
  <div
    class="w-full bg-white/95 dark:bg-black/95 backdrop-blur-sm sticky top-16 z-30 border-b border-neutral-200 dark:border-neutral-800">
    <div class="container mx-auto max-w-screen-xl px-6">
      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-4 overflow-hidden flex-1">
          <div v-if="totalCount" class="flex items-baseline gap-2 whitespace-nowrap flex-shrink-0">
            <span class="text-lg font-bold text-neutral-900 dark:text-white">{{ totalCount }}</span>
            <span class="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">servers</span>
          </div>
          <div class="flex-1"></div>
        </div>

        <div class="flex items-center gap-2">
          <!-- View Toggle -->
          <div class="flex items-center mr-2 h-10">
            <button @click="emit('update:view', 'grid')" :class="[
              'w-10 h-10 flex items-center justify-center transition-colors',
              view === 'grid' ? 'text-neutral-900 dark:text-white' : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            ]" title="Grid View">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button @click="emit('update:view', 'list')" :class="[
              'w-10 h-10 flex items-center justify-center transition-colors',
              view === 'list' ? 'text-neutral-900 dark:text-white' : 'text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            ]" title="List View">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>

          <button @click="emit('openFilters')"
            class="h-10 flex items-center gap-2 px-4 text-xs font-medium tracking-widest uppercase text-neutral-500 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span>FILTERS</span>
            <span v-if="activeFiltersCount && activeFiltersCount > 0"
              class="w-5 h-5 flex items-center justify-center text-[10px] font-bold bg-primary text-white rounded-full ml-1 pt-[1px]">
              {{ activeFiltersCount }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">


defineProps<{
  activeFiltersCount?: number;
  totalCount?: string;
  view?: 'grid' | 'list';
}>();

const emit = defineEmits<{
  'openFilters': [];
  'update:view': [view: 'grid' | 'list'];
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
