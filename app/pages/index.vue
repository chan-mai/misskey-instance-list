<script setup lang="ts">
import { useInstances } from '~/composables/useInstances';
import { useFormat } from '~/composables/useFormat';
import { useInfiniteScroll } from '~/composables/useInfiniteScroll';

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
useInfiniteScroll(
  loadMoreTrigger,
  () => fetchInstances(false),
  {
    canLoad: () => hasMore.value && !isLoading.value
  }
);

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
          <StateEmpty
            v-else-if="!initialLoading"
            :message="filters.query ? `&quot;${filters.query}&quot; に一致するサーバーが見つかりませんでした` : 'サーバーが見つかりませんでした'"
            sub-message="検索条件を変更してみてください"
          >
            <template #action>
              <button 
                v-if="filters.query || filters.repository || filters.language"
                @click="handleReset"
                class="px-6 py-3 text-xs tracking-widest uppercase bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-colors flex items-center justify-center mx-auto"
              >
                Reset Filters
              </button>
            </template>
          </StateEmpty>
          
          <!-- Loading state -->
          <StateLoading
            v-else
            message="Loading servers"
          />
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
