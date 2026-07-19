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
          <div class="flex items-center gap-1 mr-2 h-10">
            <button @click="emit('update:view', 'grid')" :class="[
              'w-10 h-10 flex items-center justify-center transition-colors',
              view === 'grid' ? 'text-primary dark:text-primary' : 'text-neutral-400 dark:text-neutral-500 hover:text-primary/50 dark:hover:text-primary/50 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            ]" title="Grid View">
              <Icon name="lucide:layout-grid" class="w-4 h-4" />
            </button>
            <button @click="emit('update:view', 'list')" :class="[
              'w-10 h-10 flex items-center justify-center transition-colors',
              view === 'list' ? 'text-primary dark:text-primary' : 'text-neutral-400 dark:text-neutral-500 hover:text-primary/50 dark:hover:text-primary/50 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            ]" title="List View">
              <Icon name="lucide:list" class="w-4 h-4" />
            </button>
          </div>

          <button @click="emit('openFilters')"
            class="h-10 flex items-center gap-2 px-4 text-xs font-medium tracking-widest uppercase transition-colors flex-shrink-0"
            :class="(activeFiltersCount ?? 0) > 0 ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border border-neutral-900 dark:border-white' : 'text-neutral-500 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'">
            <Icon name="lucide:sliders-horizontal" class="w-4 h-4" />
            <span class="hidden sm:inline">FILTERS</span>
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
