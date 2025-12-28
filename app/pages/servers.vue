<script setup lang="ts">
import type { InstancesResponse } from '~/types/api';
import type { FilterSettings } from '~/types/storage';
import { STORAGE_KEY } from '~/types/storage';
import { formatNumber } from '~/utils/format';

let savedSettings: FilterSettings | null = null;
if (import.meta.client) {
  savedSettings = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null') as FilterSettings | null;
}

const f_query = ref<string>('');
const f_repository = ref<string>('');
const f_language = ref<string>('');
// User requested filters to reset on access, so we use default values instead of savedSettings for filters.
// We might want to keep view preference persistent? User specifically said "FILTER".
// For now, I'll reset everything as requested or imply "Settings" are reset.
// Let's reset filters but keep view if savedSettings exists?
// "FILTERは/serversにアクセスするたびにリセットして" -> Explicitly filters.
// I will use defaults for f_* refs.
const f_orderBy = ref<FilterSettings['f_orderBy']>('recommendedScore');
const f_order = ref<FilterSettings['f_order']>('desc');
const v_view = ref<FilterSettings['v_view']>('grid'); // Reset to grid on load as requested
const f_openRegistrations = ref<boolean | null>(null);
const f_emailRequired = ref<boolean | null>(null);
const f_minUsers = ref<number | null>(null);
const f_maxUsers = ref<number | null>(null);


const PAGE_SIZE = 30;
const instances = ref<Instance[]>([]);
const total = ref(0);
const offset = ref(0);
const isLoading = ref(false);
const hasMore = computed(() => offset.value + instances.value.length < total.value);
const initialLoading = ref(true);
const errorMessage = ref<string | null>(null);

watch([f_orderBy, f_order, v_view, f_openRegistrations, f_emailRequired, f_minUsers, f_maxUsers], (to) => {
  const newSettings: FilterSettings = {
    f_orderBy: to[0] as FilterSettings['f_orderBy'],
    f_order: to[1] as FilterSettings['f_order'],
    v_view: to[2] as FilterSettings['v_view'],
    f_openRegistrations: to[3] as boolean | null,
    f_emailRequired: to[4] as boolean | null,
    f_minUsers: to[5] as number | null,
    f_maxUsers: to[6] as number | null,
  };
  if (import.meta.client) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
  }
});

const sortApiValue = computed(() => {
  switch (f_orderBy.value) {
    case 'recommendedScore': return 'recommended';
    case 'notesCount': return 'notes';
    case 'usersCount': return 'users';
    case 'createdAt': return 'createdAt';
    default: return 'users';
  }
});


// Use a ref to track the timeout ID for debouncing
// const debounceTimeout = ref<NodeJS.Timeout | null>(null); // Removed debounce
const abortController = ref<AbortController | null>(null);

async function fetchInstances(reset = false) {
  // Cancel any pending request
  if (abortController.value) {
    abortController.value.abort();
    abortController.value = null;
  }

  // Create new controller
  abortController.value = new AbortController();

  if (isLoading.value && !reset) {
    // If loading and not a reset (e.g. scroll), we might want to wait or debounce more?
    // But for filters, we should probably just proceed with new controller.
    // However, existing logic had isLoading check.
    // We'll trust AbortController to handle network cancel, but we need to reset isLoading if we abort?
    // Actually, if we abort, the previous request throws AbortError.
  }

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
      order: f_order.value,
      limit: PAGE_SIZE.toString(),
      offset: currentOffset.toString(),
      ...(f_query.value && { search: f_query.value }),
      ...(f_repository.value && { repository: f_repository.value }),
      ...(f_language.value && { language: f_language.value }),
      ...(f_openRegistrations.value !== null && { open_registrations: f_openRegistrations.value.toString() }),
      ...(f_emailRequired.value !== null && { email_required: f_emailRequired.value.toString() }),
      ...(f_minUsers.value !== null && { min_users: f_minUsers.value.toString() }),
      ...(f_maxUsers.value !== null && { max_users: f_maxUsers.value.toString() })
    });

    const signal = abortController.value.signal;
    const response = await $fetch<InstancesResponse>(`/api/v1/instances?${params}`, { signal });

    if (reset) {
      instances.value = response.items;
      offset.value = response.limit;
    } else {
      instances.value = [...instances.value, ...response.items];
      offset.value = currentOffset + response.limit;
    }
    total.value = response.total;
  } catch (e: any) {
    if (e.name === 'AbortError') {
      // Ignore abort errors
      return;
    }
    errorMessage.value = e instanceof Error ? e.message : 'Failed to load instances';
  } finally {
    // Only set loading false if this is the current controller (not aborted/replaced)
    // Actually, if we aborted, the new request will set isLoading=true anyway.
    // But we should ensure we don't turn off loading for a NEW request.
    // Checks if signal is aborted?
    // Using a simple check:
    if (abortController.value?.signal.aborted) {
      // Do nothing, new request took over
    } else {
      isLoading.value = false;
      initialLoading.value = false;
      abortController.value = null;
    }
  }
}

watch([f_orderBy, f_order, f_openRegistrations, f_emailRequired, f_minUsers, f_maxUsers], () => {
  fetchInstances(true);
});

const loadMoreTrigger = ref<HTMLElement | null>(null);

const { data: stats } = await useFetch('/api/v1/stats');

onMounted(() => {
  fetchInstances(true);
});

watch(loadMoreTrigger, (el) => {
  if (import.meta.client && el) {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]!.isIntersecting && hasMore.value && !isLoading.value) {
          fetchInstances(false);
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    onUnmounted(() => observer.disconnect());
  }
});

useHead({
  title: 'Servers - (Unofficial) Misskey Server List | Misskeyサーバー・インスタンスリスト',
  meta: [
    { name: 'keywords', content: 'Misskey,Server List,Instance List,Misskeyサーバー,インスタンス,Fediverse,ActivityPub,サーバー検索' },
    { name: 'description', content: 'あなたにぴったりのMisskeyサーバーを見つけよう。登録数、ノート数、活動率などで検索できる非公式のMisskeyサーバーリスト(インスタンスリスト)です。' },
    { property: 'og:title', content: 'Servers - (Unofficial) Misskey Server List | Misskeyサーバー・インスタンスリスト' },
    { property: 'og:description', content: 'あなたにぴったりのMisskeyサーバーを見つけよう。登録数、ノート数、活動率などで検索できる非公式のMisskeyサーバーリスト(インスタンスリスト)です。' },
    { property: 'og:url', content: 'https://servers.misskey.ink/servers' },
    { name: 'twitter:title', content: 'Servers - (Unofficial) Misskey Server List | Misskeyサーバー・インスタンスリスト' },
    { name: 'twitter:description', content: 'あなたにぴったりのMisskeyサーバーを見つけよう。登録数、ノート数、活動率などで検索できる非公式のMisskeyサーバーリスト(インスタンスリスト)です。' },
  ]
});

// --- Restored UI Logic ---
const isFilterDrawerOpen = ref(false);

// Removed softwareTabs computed property as it is no longer used for tabs
// but we still need repositories for the dropdown
const repositories = computed(() => {
  const repos = stats.value?.repositories?.map(repo => ({
    name: repo.name || 'Unknown',
    url: repo.url,
    count: repo.count
  })) ?? [];
  console.log('Repositories count:', repos.length);
  return repos;
});

const activeFiltersCount = computed(() => {
  let count = 0;
  if (f_query.value) count++;
  if (f_language.value) count++;
  if (f_orderBy.value !== 'recommendedScore') count++;
  if (f_openRegistrations.value !== null) count++;
  if (f_emailRequired.value !== null) count++;
  if (f_minUsers.value !== null) count++;
  if (f_maxUsers.value !== null) count++;
  if (f_repository.value) count++; // Count repository filter
  return count;
});

function handleSearch(query: string) {
  f_query.value = query;
  fetchInstances(true);
}

function handleRepoChange(repo: string) {
  f_repository.value = repo;
  fetchInstances(true);
}

function handleLanguageChange(lang: string) {
  f_language.value = lang;
  fetchInstances(true);
}

function handleReset() {
  f_query.value = '';
  f_language.value = '';
  f_orderBy.value = 'recommendedScore';
  f_order.value = 'desc';
  f_repository.value = '';
  f_openRegistrations.value = null;
  f_emailRequired.value = null;
  f_minUsers.value = null;
  f_maxUsers.value = null;
  fetchInstances(true);
}

function handleOrderByChange(val: any) {
  f_orderBy.value = val as FilterSettings['f_orderBy'];
}

function handleOrderChange(val: any) {
  f_order.value = val as FilterSettings['f_order'];
}
</script>

<template>
  <div>
    <!-- Fullscreen Hero -->
    <Hero label="(Unofficial) Misskey Server List" title="Servers" description="Misskeyサーバーをさがす" :show-scroll="true" />

    <!-- Filter Tabs -->
    <FilterTabs id="servers" :active-filters-count="activeFiltersCount" :total-count="formatNumber(total)"
      :view="v_view" @update:view="(v: any) => v_view = v" @open-filters="isFilterDrawerOpen = true" />

    <!-- Filter Drawer -->
    <FilterDrawer :is-open="isFilterDrawerOpen" :total-count="formatNumber(total)" :search-query="f_query"
      :order-by="f_orderBy" :order="f_order" :language-filter="f_language" :languages="stats?.languages"
      :repository-filter="f_repository" :repositories="repositories" :open-registrations="f_openRegistrations"
      :email-required="f_emailRequired" :min-users="f_minUsers" :max-users="f_maxUsers"
      @close="isFilterDrawerOpen = false" @search="handleSearch" @update:order-by="handleOrderByChange"
      @update:order="handleOrderChange" @update:language-filter="handleLanguageChange"
      @update:repository-filter="handleRepoChange" @update:open-registrations="(v) => f_openRegistrations = v"
      @update:email-required="(v) => f_emailRequired = v" @update:min-users="(v) => f_minUsers = v"
      @update:max-users="(v) => f_maxUsers = v" @reset="handleReset" />

    <!-- Server Grid -->
    <section class="py-8 lg:py-12 bg-neutral-50 dark:bg-black min-h-screen">
      <div class="container mx-auto max-w-screen-xl px-4 lg:px-6">
        <!-- Results info -->
        <div class="flex items-center justify-between mb-6">
          <!-- Removed count from here as it is now in FilterTabs -->
        </div>

        <!-- Grid/List Container -->
        <div :class="v_view === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 lg:gap-4'
          : 'flex flex-col gap-3'">

          <!-- Server cards -->
          <ServerCard v-if="instances.length > 0" v-for="instance in instances" :key="instance.id" :instance="instance"
            :view="v_view" />

          <!-- Empty state -->
          <StateEmpty v-else-if="!initialLoading"
            :message="f_query ? `&quot;${f_query}&quot; に一致するサーバーが見つかりませんでした` : 'サーバーが見つかりませんでした'"
            sub-message="検索条件を変更してみてください">
            <template #action>
              <button v-if="f_query || f_repository || f_language" @click="handleReset"
                class="px-6 py-3 text-xs tracking-widest uppercase bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-700 dark:hover:bg-neutral-200 transition-colors flex items-center justify-center mx-auto border border-neutral-900 dark:border-white">
                Reset Filters
              </button>
            </template>
          </StateEmpty>

          <!-- Loading state -->
          <StateLoading v-else message="Loading servers" />
        </div>

        <!-- Infinite scroll trigger -->
        <div v-if="!initialLoading && instances.length > 0" ref="loadMoreTrigger" class="py-12 flex justify-center">
          <div v-if="isLoading"
            class="w-8 h-8 border-2 border-neutral-200 dark:border-neutral-700 border-t-primary animate-spin"></div>
          <p v-else-if="!hasMore" class="text-neutral-400 dark:text-neutral-600 text-xs tracking-widest uppercase">
            — All {{ formatNumber(total) }} servers —
          </p>
        </div>
      </div>
    </section>
  </div>
</template>
