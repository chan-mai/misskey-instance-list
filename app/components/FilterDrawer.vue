<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="fade">
      <div 
        v-if="isOpen"
        class="fixed inset-0 bg-black/60 z-50"
        @click="emit('close')"
      ></div>
    </Transition>

    <!-- Drawer panel -->
    <Transition name="slide">
      <div 
        v-if="isOpen"
        class="fixed top-0 right-0 bottom-0 w-full max-w-md bg-back dark:bg-back-dark z-50 overflow-y-auto"
      >
        <!-- Header -->
        <div class="sticky top-0 flex items-center justify-between px-6 py-4 bg-neutral-50 dark:bg-neutral-900">
          <h2 class="text-lg font-medium text-neutral-900 dark:text-white tracking-wide">FILTERS</h2>
          <BaseButton 
            variant="icon"
            @click="emit('close')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </BaseButton>
        </div>

        <!-- Content -->
        <div class="p-6 space-y-8">
          <!-- Result count -->
          <div class="text-center py-4 bg-neutral-50 dark:bg-neutral-900">
            <p class="text-4xl font-bold text-primary">{{ totalCount }}</p>
            <p class="text-sm text-neutral-500 dark:text-neutral-400 tracking-wide uppercase mt-1">Servers</p>
          </div>

          <!-- Search -->
          <div>
            <label class="block text-xs font-medium tracking-widest uppercase text-neutral-500 dark:text-neutral-400 mb-3">
              Search
            </label>
            <div class="flex">
              <BaseInput
                type="search"
                v-model="localQuery"
                placeholder="Server name..."
                class="flex-1"
              />
              <BaseButton
                @click="applySearch"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </BaseButton>
            </div>
          </div>

          <!-- Sort -->
          <div>
            <label class="block text-xs font-medium tracking-widest uppercase text-neutral-500 dark:text-neutral-400 mb-3">
              Sort by
            </label>
            <div class="flex gap-2">
              <div class="relative flex-1">
                <select
                  v-model="orderByValue"
                  class="w-full px-4 py-3 bg-transparent border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 appearance-none"
                >
                  <option value="recommendedScore">Recommended</option>
                  <option value="usersCount">Users</option>
                  <option value="notesCount">Notes</option>
                  <option value="createdAt">First seen</option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-neutral-400">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <BaseButton
                @click="toggleOrder"
                :title="order === 'desc' ? 'Descending' : 'Ascending'"
              >
                <svg v-if="order === 'desc'" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                </svg>
              </BaseButton>
            </div>
          </div>

          <!-- Language -->
          <div>
            <label class="block text-xs font-medium tracking-widest uppercase text-neutral-500 dark:text-neutral-400 mb-3">
              Language
            </label>
            <div class="relative">
              <select
                v-model="languageValue"
                class="w-full px-4 py-3 bg-transparent border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 appearance-none"
              >
                <option value="">All languages</option>
                <option v-for="lang in languages" :key="lang.code" :value="lang.code">
                  {{ getLanguageName(lang.code) }}
                </option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-neutral-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <p class="mt-2 text-xs text-neutral-500">* Auto-detected language</p>
          </div>
        </div>

        <!-- Footer -->
        <div class="sticky bottom-0 p-6 bg-neutral-50 dark:bg-neutral-900">
          <div class="flex gap-3">
            <BaseButton
              variant="secondary"
              @click="resetFilters"
              class="flex-1"
            >
              RESET
            </BaseButton>
            <BaseButton
              @click="applyAndClose"
              class="flex-1"
            >
              APPLY
            </BaseButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import type { SortField, SortOrder } from '~/types/filters';
import { useFormat } from '~/composables/useFormat';

const props = defineProps<{
  isOpen: boolean;
  totalCount: string;
  searchQuery: string;
  orderBy: SortField;
  order: SortOrder;
  languageFilter: string;
  languages?: { code: string; count: number }[];
}>();

const emit = defineEmits<{
  'close': [];
  'search': [query: string];
  'update:orderBy': [value: SortField];
  'update:order': [value: SortOrder];
  'update:languageFilter': [value: string];
  'reset': [];
}>();

const { getLanguageName } = useFormat();

const localQuery = ref(props.searchQuery);

watch(() => props.searchQuery, (val) => {
  localQuery.value = val;
});

watch(() => props.isOpen, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

onUnmounted(() => {
  document.body.style.overflow = '';
});

const orderByValue = computed({
  get: () => props.orderBy,
  set: (val) => emit('update:orderBy', val)
});

const languageValue = computed({
  get: () => props.languageFilter,
  set: (val) => emit('update:languageFilter', val)
});

function toggleOrder() {
  emit('update:order', props.order === 'asc' ? 'desc' : 'asc');
}

function applySearch() {
  emit('search', localQuery.value.toLowerCase());
}

function resetFilters() {
  localQuery.value = '';
  emit('reset');
}

function applyAndClose() {
  applySearch();
  emit('close');
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>
