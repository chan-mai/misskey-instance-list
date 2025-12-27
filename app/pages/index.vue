<script setup lang="ts">
import { useInstances } from '~/composables/useInstances';
import { useFormat } from '~/composables/useFormat';

const { 
  instances, 
  total, 
  isLoading, 
  initialLoading,
  hasMore, 
  filters, 
  activeFiltersCount, 
  fetchInstances 
} = useInstances();

const { formatNumber } = useFormat();
const { data: stats } = await useFetch('/api/v1/stats');

// UI state
const isFilterDrawerOpen = ref(false);
const loadMoreTrigger = ref<HTMLElement | null>(null);

// Software tabs
const softwareTabs = computed(() => {
  const tabs: { label: string; value: string }[] = [];
  const repos = stats.value?.repositories?.slice(0, 5) ?? [];
  repos.forEach(repo => {
    tabs.push({
      label: (repo.name || 'Unknown').toUpperCase(),
      value: repo.url
    });
  });
  return tabs;
});

// Lifecycle
onMounted(() => fetchInstances(true));

// Infinite scroll observer
watch(loadMoreTrigger, (el) => {
  if (!import.meta.client || !el) return;
  
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting && hasMore.value && !isLoading.value) {
        fetchInstances(false);
      }
    },
    { rootMargin: '200px' }
  );
  observer.observe(el);
  onUnmounted(() => observer.disconnect());
});

// Event handlers
function handleSearch(query: string) {
  filters.query = query;
  fetchInstances(true);
}

function handleRepoChange(repo: string) {
  filters.repository = repo;
  fetchInstances(true);
}

function handleLanguageChange(lang: string) {
  filters.language = lang;
  fetchInstances(true);
}

function handleReset() {
  Object.assign(filters, {
    query: '',
    language: '',
    orderBy: 'recommendedScore',
    order: 'desc'
  });
  fetchInstances(true);
}

useHead({
  title: '(Unofficial) Misskey Server List | Misskeyサーバー・インスタンスリスト',
  meta: [
    { name: 'keywords', content: 'Misskey,Server List,Instance List,Misskeyサーバー,インスタンス,Fediverse,ActivityPub,サーバー検索' },
    { name: 'description', content: 'あなたにぴったりのMisskeyサーバーを見つけよう。登録数、ノート数、活動率などで検索できる非公式のMisskeyサーバーリスト(インスタンスリスト)です。' },
    { property: 'og:title', content: '(Unofficial) Misskey Server List | Misskeyサーバー・インスタンスリスト' },
    { property: 'og:description', content: 'あなたにぴったりのMisskeyサーバーを見つけよう。登録数、ノート数、活動率などで検索できる非公式のMisskeyサーバーリスト(インスタンスリスト)です。' },
    { property: 'og:url', content: 'https://servers.misskey.ink/' },
    { name: 'twitter:title', content: '(Unofficial) Misskey Server List | Misskeyサーバー・インスタンスリスト' },
    { name: 'twitter:description', content: 'あなたにぴったりのMisskeyサーバーを見つけよう。登録数、ノート数、活動率などで検索できる非公式のMisskeyサーバーリスト(インスタンスリスト)です。' },
  ]
});
</script>

<template>
  <div>
    <!-- Fullscreen Hero -->
    <SiteHero :stats="stats" />

    <!-- Filter Tabs -->
    <FilterTabs
      id="servers"
      v-model="filters.repository"
      :tabs="softwareTabs"
      :active-filters-count="activeFiltersCount"
      :total-count="formatNumber(total)"
      @update:model-value="handleRepoChange"
      @open-filters="isFilterDrawerOpen = true"
    />

    <!-- Filter Drawer -->
    <FilterDrawer
      :is-open="isFilterDrawerOpen"
      :total-count="formatNumber(total)"
      :search-query="filters.query"
      :order-by="filters.orderBy"
      :order="filters.order"
      :language-filter="filters.language"
      :languages="stats?.languages"
      @close="isFilterDrawerOpen = false"
      @search="handleSearch"
      @update:order-by="(v) => filters.orderBy = v"
      @update:order="(v) => filters.order = v"
      @update:language-filter="handleLanguageChange"
      @reset="handleReset"
    />

    <!-- Server Grid -->
    <section class="py-8 lg:py-12 bg-neutral-50 dark:bg-black min-h-screen">
      <div class="container mx-auto max-w-screen-xl px-4 lg:px-6">
        <!-- Results info -->
        <div class="flex items-center justify-between mb-6">
          <!-- Removed count from here as it is now in FilterTabs -->
        </div>

        <!-- Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 lg:gap-4">
          <!-- Server cards -->
          <InstanceCard 
            v-if="instances.length > 0" 
            v-for="instance in instances" 
            :key="instance.id"
            :instance="instance"
          />
          
          <!-- Empty state -->
          <div
            v-else-if="!initialLoading"
            class="col-span-full py-24 text-center"
          >
            <div class="max-w-sm mx-auto">
              <div class="w-20 h-20 mx-auto mb-6 bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-neutral-400 dark:text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <p class="text-neutral-600 dark:text-neutral-400 mb-2">
                {{ filters.query ? `"${filters.query}" に一致するサーバーが見つかりませんでした` : 'サーバーが見つかりませんでした' }}
              </p>
              <p class="text-xs text-neutral-400 dark:text-neutral-500 mb-6">検索条件を変更してみてください</p>
              <button 
                v-if="filters.query || filters.repository || filters.language"
                @click="handleReset"
                class="px-6 py-3 text-xs tracking-widest uppercase bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-colors flex items-center justify-center mx-auto"
              >
                Reset Filters
              </button>
            </div>
          </div>
          
          <!-- Loading state -->
          <div
            v-else
            class="col-span-full py-24 flex items-center justify-center"
          >
            <div class="text-center">
              <div class="w-10 h-10 border-2 border-neutral-200 dark:border-neutral-700 border-t-primary animate-spin mx-auto"></div>
              <p class="text-neutral-400 dark:text-neutral-500 mt-6 text-xs tracking-widest uppercase">Loading servers</p>
            </div>
          </div>
        </div>
        
        <!-- Infinite scroll trigger -->
        <div 
          v-if="!initialLoading && instances.length > 0"
          ref="loadMoreTrigger" 
          class="py-12 flex justify-center"
        >
          <div v-if="isLoading" class="w-8 h-8 border-2 border-neutral-200 dark:border-neutral-700 border-t-primary animate-spin"></div>
          <p v-else-if="!hasMore" class="text-neutral-400 dark:text-neutral-600 text-xs tracking-widest uppercase">
            — All {{ formatNumber(total) }} servers —
          </p>
        </div>
      </div>
    </section>
  </div>
</template>
