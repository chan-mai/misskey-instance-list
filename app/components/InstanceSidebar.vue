<template>
  <aside
    class="transition-all duration-300 lg:static lg:z-auto lg:w-full lg:mx-0 lg:shadow-none lg:bg-transparent lg:dark:bg-transparent lg:backdrop-blur-none lg:border-none"
    :class="isOpen
      ? 'fixed inset-0 z-50 w-full h-full bg-slate-50 dark:bg-slate-900 overflow-y-auto'
      : 'sticky top-16 z-40 -mx-6 w-[calc(100%+3rem)] bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-sm border-b border-slate-200 dark:border-slate-700'">
    <!-- Toggle Button (Mobile Only) -->
    <button @click="isOpen = !isOpen"
      class="flex items-center justify-between w-full px-6 py-4 lg:hidden text-left border-none focus:outline-none group"
      :class="isOpen ? 'bg-white dark:bg-slate-800 shadow-sm sticky top-0 z-10' : ''">
      <div class="flex items-center gap-3 text-slate-700 dark:text-slate-200">
        <svg xmlns="http://www.w3.org/2000/svg"
          class="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:text-primary transition-colors" fill="none"
          viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <span class="font-medium text-sm tracking-wide">絞り込み条件</span>

        <span v-if="searchQuery" class="flex relative w-2.5 h-2.5">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
        </span>
      </div>

      <svg xmlns="http://www.w3.org/2000/svg"
        class="w-4 h-4 text-slate-400 dark:text-slate-600 transition-transform duration-300 ease-out"
        :class="isOpen ? 'rotate-180' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    <!-- Content Area -->
    <div class="lg:block lg:sticky lg:top-24 lg:overflow-y-auto lg:max-h-[calc(100vh-6rem)] lg:py-2"
      :class="isOpen ? 'block p-6 pb-24' : 'hidden'">
      <div class="space-y-6 lg:space-y-4">
        <!-- Desktop Header -->
        <div class="hidden lg:flex items-center">
          <h3 class="text-xl font-bold">絞り込み条件</h3>
        </div>
        <div class="text-primary font-bold text-lg">
          <template v-if="loading">
            Loading...
          </template>
          <template v-else>
            <span class="text-3xl">{{ totalCount }}</span> instances
          </template>
        </div>

        <!-- 検索フォーム -->
        <form @submit.prevent="applyQuery">
          <label class="form-label block text-sm font-medium mb-1" for="query">検索</label>
          <div class="flex">
            <input
              class="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-l-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60"
              type="search" autocomplete="off" id="query" v-model="queryPartial" placeholder="サーバー名で検索" />
            <button type="submit"
              class="px-4 py-2 bg-primary text-white rounded-r-lg hover:bg-primary/90 border border-l-0 border-slate-300 dark:border-slate-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </form>

        <!-- 並び順 -->
        <div>
          <label class="form-label block text-sm font-medium mb-1" for="orderBy">並び順</label>
          <div class="flex">
            <select id="orderBy" v-model="orderByValue"
              class="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-l-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60">
              <option value="recommendedScore">おすすめ順</option>
              <option value="usersCount">ユーザー数</option>
              <option value="notesCount">ノート数</option>
              <option value="createdAt">初観測日</option>
            </select>
            <button
              class="px-4 py-2 bg-primary text-white rounded-r-lg hover:bg-primary/90 border border-l-0 border-slate-300 dark:border-slate-600 transition-colors"
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

        <!-- リポジトリフィルタ -->
        <div class="mb-6">
          <label class="form-label block text-sm font-medium mb-1" for="repository">ソフトウェア</label>
          <div class="relative">
            <select id="repository" v-model="repositoryPartial"
              class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 appearance-none">
              <option value="">すべてのソフトウェア</option>
              <option v-for="repo in repositories" :key="repo.url" :value="repo.url">
                {{ repo.name || repo.url }}
              </option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <!-- 言語フィルタ -->
        <div class="mb-6">
          <label class="form-label block text-sm font-medium mb-1" for="language">言語</label>
          <div class="relative">
            <select id="language" v-model="languagePartial"
              class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/60 appearance-none">
              <option value="">すべての言語</option>
              <option v-for="lang in languages" :key="lang.code" :value="lang.code">
                {{ getLanguageName(lang.code) }}
              </option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">※ 自動検出のため、実際の主要言語と異なる場合があります</p>
        </div>

        <!-- 表示 -->
        <div>
          <h3 class="lg:pt-2 text-xl font-bold mb-2">表示</h3>
          <div class="flex w-full" role="group">
            <input type="radio" class="hidden" name="btnradio" id="btnradio1" autocomplete="off" value="grid"
              v-model="viewValue">
            <label
              class="flex-1 px-4 py-2 text-sm font-medium border flex items-center justify-center gap-1 cursor-pointer transition-colors"
              :class="viewValue === 'grid' ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'"
              style="border-radius: 0.5rem 0 0 0.5rem;" for="btnradio1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              グリッド
            </label>

            <input type="radio" class="hidden" name="btnradio" id="btnradio2" autocomplete="off" value="list"
              v-model="viewValue">
            <label
              class="flex-1 px-4 py-2 text-sm font-medium border flex items-center justify-center gap-1 cursor-pointer transition-colors"
              :class="viewValue === 'list' ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'"
              style="border-radius: 0 0.5rem 0.5rem 0;" for="btnradio2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              リスト
            </label>
          </div>
        </div>

        <div class="lg:hidden pt-4">
          <button @click="applyQuery"
            class="w-full py-2 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 border-none">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            検索
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
