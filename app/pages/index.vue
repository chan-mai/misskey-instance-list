<script setup lang="ts">
import type { SortField, SortOrder, FilterSettings } from '~/types/filters';
import type { InstancesResponse } from '~/types/api';
import { PAGE_SIZE, STORAGE_KEY, SORT_API_MAP } from '~/utils/constants';

// --- useFormat Logic ---
const formatNumber = (num: number | undefined | null) => {
  if (num == null) return '-';
  if (num >= 100000) {
    return new Intl.NumberFormat('ja-JP', { notation: 'compact', maximumFractionDigits: 1 }).format(num);
  }
  return new Intl.NumberFormat('ja-JP').format(num);
};

// --- useInstances Logic ---
// Saved settings
const savedSettings = import.meta.client 
  ? JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as Partial<FilterSettings> | null
  : null;

// State
const instances = ref<Instance[]>([]);
const total = ref(0);
const offset = ref(0);
const isLoading = ref(false);
const initialLoading = ref(true);
const errorMessage = ref<string | null>(null);

// Filter state
const filters = reactive<FilterSettings>({
  query: '',
  repository: '',
  language: '',
  orderBy: (savedSettings?.orderBy as SortField) ?? 'recommendedScore',
  order: (savedSettings?.order as SortOrder) ?? 'desc'
});

// Computed
const hasMore = computed(() => offset.value + instances.value.length < total.value);
const sortApiValue = computed(() => SORT_API_MAP[filters.orderBy] ?? 'users');

const activeFiltersCount = computed(() => {
  let count = 0;
  if (filters.query) count++;
  if (filters.language) count++;
  if (filters.orderBy !== 'recommendedScore') count++;
  return count;
});

// Persist settings
watch(
  () => [filters.orderBy, filters.order],
  ([orderBy, order]) => {
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ orderBy, order }));
    }
  }
);

// API
async function fetchInstances(reset = false) {
  if (isLoading.value) return;
  
  isLoading.value = true;
  errorMessage.value = null;
  
  if (reset) {
    initialLoading.value = true;
    instances.value = [];
  }
  
  try {
    const currentOffset = reset ? 0 : offset.value;
    const params = new URLSearchParams({
      sort: sortApiValue.value,
      order: filters.order,
      limit: PAGE_SIZE.toString(),
      offset: currentOffset.toString(),
    });
    
    if (filters.query) params.set('search', filters.query);
    if (filters.repository) params.set('repository', filters.repository);
    if (filters.language) params.set('language', filters.language);
    
    const response = await $fetch<InstancesResponse>(`/api/v1/instances?${params}`);
    
    if (reset) {
      instances.value = response.items;
      offset.value = response.limit;
    } else {
      instances.value.push(...response.items);
      offset.value = currentOffset + response.limit;
    }
    total.value = response.total;
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : 'Failed to load instances';
  } finally {
    isLoading.value = false;
    initialLoading.value = false;
  }
}

// Watchers
watch(() => [filters.orderBy, filters.order], () => fetchInstances(true));

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

// --- useInfiniteScroll Logic ---
let observer: IntersectionObserver | null = null;

const cleanupObserver = () => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
};

onMounted(() => {
  if (!import.meta.client) return;

  watch(
    loadMoreTrigger,
    (el) => {
      cleanupObserver();
      if (!el) return;

      observer = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting && hasMore.value && !isLoading.value) {
            fetchInstances(false);
          }
        },
        { rootMargin: '200px' }
      );
      observer.observe(el);
    },
    { immediate: true }
  );
});

onUnmounted(cleanupObserver);

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
