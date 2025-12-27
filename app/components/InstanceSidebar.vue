<template>
  <aside
    class="transition-all duration-200 lg:static lg:z-auto lg:w-full lg:mx-0 lg:bg-transparent lg:dark:bg-transparent lg:border-none"
    :class="isOpen
      ? 'fixed inset-0 z-50 w-full h-full bg-white dark:bg-black overflow-y-auto'
      : 'sticky top-16 z-40 -mx-6 w-[calc(100%+3rem)] bg-white dark:bg-black border-b border-neutral-200 dark:border-neutral-800'">
    <!-- Header (Universal) -->
    <div class="flex items-center justify-between px-6 py-4 lg:px-0 lg:py-0 lg:mb-6"
      :class="isOpen ? 'bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-10 lg:static lg:bg-transparent lg:border-none' : ''">
      
      <div class="flex items-baseline gap-2">
        <template v-if="loading">
          <span class="text-xl font-bold text-neutral-400">...</span>
        </template>
        <template v-else>
          <span class="text-2xl font-bold text-primary">{{ totalCount }}</span>
          <span class="text-xs text-neutral-500 dark:text-neutral-400 uppercase">servers</span>
        </template>
      </div>

      <button @click="isOpen = !isOpen"
        class="flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-full transition-colors text-neutral-700 dark:text-neutral-200 lg:hidden">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <span class="text-xs font-medium tracking-wide uppercase">Filters</span>
        <span v-if="searchQuery" class="w-2 h-2 bg-primary rounded-full"></span>
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 transition-transform duration-200" :class="isOpen ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <!-- Desktop Filter Button (Non-functional label for now, or toggle?) -->
      <!-- User asked to move the button next to count. I will show the button on desktop too. -->
      <button @click="isOpen = !isOpen"
        class="hidden lg:flex items-center gap-2 px-4 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-full transition-colors text-neutral-700 dark:text-neutral-200">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <span class="text-xs font-medium tracking-wide uppercase">Filters</span>
        <span v-if="searchQuery" class="w-2 h-2 bg-primary rounded-full"></span>
      </button>
    </div>

    <!-- Content -->
    <div class="lg:block lg:sticky lg:top-24 lg:overflow-y-auto lg:max-h-[calc(100vh-6rem)] lg:py-2"
      :class="isOpen ? 'block p-6 pb-24' : 'hidden'">
      <div class="space-y-6 lg:space-y-4">
        <!-- Desktop Header (Removed) -->
        
        <!-- Search form -->
        <form @submit.prevent="applyQuery">
          <label class="block text-xs font-medium tracking-wide uppercase text-neutral-500 dark:text-neutral-400 mb-2" for="query">Search</label>
          <div class="flex">
            <input
              class="flex-1 px-3 py-2 border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500"
              type="search" autocomplete="off" id="query" v-model="queryPartial" placeholder="Server name" />
            <button type="submit"
              class="px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border border-neutral-900 dark:border-white hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </form>

        <!-- Sort -->
        <div>
          <label class="block text-xs font-medium tracking-wide uppercase text-neutral-500 dark:text-neutral-400 mb-2" for="orderBy">Sort by</label>
          <div class="flex">
            <select id="orderBy" v-model="orderByValue"
              class="flex-1 px-3 py-2 border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500">
              <option value="recommendedScore">Recommended</option>
              <option value="usersCount">Users</option>
              <option value="notesCount">Notes</option>
              <option value="createdAt">First seen</option>
            </select>
            <button
              class="px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border border-neutral-900 dark:border-white hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-colors"
              @click="switchOrder">
              <svg v-if="orderValue === 'desc'" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Software filter -->
        <div>
          <label class="block text-xs font-medium tracking-wide uppercase text-neutral-500 dark:text-neutral-400 mb-2" for="repository">Software</label>
          <div class="relative">
            <select id="repository" v-model="repositoryPartial"
              class="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 appearance-none">
              <option value="">All software</option>
              <option v-for="repo in repositories" :key="repo.url" :value="repo.url">
                {{ repo.name || repo.url }}
              </option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Language filter -->
        <div>
          <label class="block text-xs font-medium tracking-wide uppercase text-neutral-500 dark:text-neutral-400 mb-2" for="language">Language</label>
          <div class="relative">
            <select id="language" v-model="languagePartial"
              class="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-neutral-400 dark:focus:border-neutral-500 appearance-none">
              <option value="">All languages</option>
              <option v-for="lang in languages" :key="lang.code" :value="lang.code">
                {{ getLanguageName(lang.code) }}
              </option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-neutral-400">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <p class="mt-1 text-xs text-neutral-500 dark:text-neutral-500">* Auto-detected language</p>
        </div>

        <!-- View toggle -->
        <div>
          <label class="block text-xs font-medium tracking-wide uppercase text-neutral-500 dark:text-neutral-400 mb-2">View</label>
          <div class="flex w-full" role="group">
            <input type="radio" class="hidden" name="btnradio" id="btnradio1" autocomplete="off" value="grid"
              v-model="viewValue">
            <label
              class="flex-1 px-4 py-2 text-sm font-medium border flex items-center justify-center gap-1 cursor-pointer transition-colors"
              :class="viewValue === 'grid' ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white' : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500'"
              for="btnradio1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Grid
            </label>

            <input type="radio" class="hidden" name="btnradio" id="btnradio2" autocomplete="off" value="list"
              v-model="viewValue">
            <label
              class="flex-1 px-4 py-2 text-sm font-medium border border-l-0 flex items-center justify-center gap-1 cursor-pointer transition-colors"
              :class="viewValue === 'list' ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white' : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500'"
              for="btnradio2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              List
            </label>
          </div>
        </div>

        <!-- Mobile search button -->
        <div class="lg:hidden pt-4">
          <button @click="applyQuery"
            class="w-full py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-medium tracking-wide uppercase border-none transition-colors hover:bg-neutral-700 dark:hover:bg-neutral-200 flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
const props = defineProps<{
  loading: boolean;
  totalCount: string;
  searchQuery: string;
  repositoryFilter: string;
  repositories?: { url: string; name: string | null; count: number }[];
  languageFilter: string;
  languages?: { code: string; count: number }[];
  orderBy: 'recommendedScore' | 'notesCount' | 'usersCount' | 'createdAt';
  order: 'asc' | 'desc';
  view: 'grid' | 'list';
}>();

const emit = defineEmits<{
  search: [query: string];
  'update:repositoryFilter': [value: string];
  'update:languageFilter': [value: string];
  'update:orderBy': [value: 'recommendedScore' | 'notesCount' | 'usersCount' | 'createdAt'];
  'update:order': [value: 'asc' | 'desc'];
  'update:view': [value: 'grid' | 'list'];
}>();

const isOpen = ref(false);
const queryPartial = ref(props.searchQuery);
const repositoryPartial = ref(props.repositoryFilter);
const languagePartial = ref(props.languageFilter);

watch(isOpen, (val) => {
  if (val) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

onUnmounted(() => {
  document.body.style.overflow = '';
});

watch(() => props.searchQuery, (newVal) => {
  queryPartial.value = newVal;
});

watch(() => props.repositoryFilter, (newVal) => {
  repositoryPartial.value = newVal;
});

watch(() => props.languageFilter, (newVal) => {
  languagePartial.value = newVal;
});

watch(repositoryPartial, (newVal) => {
  if (newVal !== props.repositoryFilter) {
    emit('update:repositoryFilter', newVal);
  }
});

watch(languagePartial, (newVal) => {
  if (newVal !== props.languageFilter) {
    emit('update:languageFilter', newVal);
  }
});

const orderByValue = computed({
  get: () => props.orderBy,
  set: (val) => emit('update:orderBy', val)
});

const orderValue = computed({
  get: () => props.order,
  set: (val) => emit('update:order', val)
});

const viewValue = computed({
  get: () => props.view,
  set: (val) => emit('update:view', val)
});

function getLanguageName(code: string) {
  try {
    // detectLanguage now returns ISO 639-1 directly
    const name = new Intl.DisplayNames(code, { type: 'language' }).of(code);
    if (name && name !== code) {
      return `${name} (${code})`;
    }
  } catch {
    // ignore
  }
  return code;
}

function applyQuery() {
  isOpen.value = false;
  emit('search', queryPartial.value.toLowerCase());
}

function switchOrder() {
  emit('update:order', props.order === 'asc' ? 'desc' : 'asc');
}
</script>
