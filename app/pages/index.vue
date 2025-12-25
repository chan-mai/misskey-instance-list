<script setup lang="ts">
interface InstancesResponse {
  items: Instance[];
  total: number;
  limit: number;
  offset: number;
}

type Mq1MisskeyInstanceListStorage = {
  f_orderBy: 'recommendedScore' | 'notesCount' | 'usersCount' | 'createdAt';
  f_order: 'asc' | 'desc';
  v_view: 'grid' | 'list';
};

let savedSettings: Mq1MisskeyInstanceListStorage | null = null;
if (import.meta.client) {
  savedSettings = JSON.parse(window.localStorage.getItem('miHub_server_finder') ?? 'null') as Mq1MisskeyInstanceListStorage | null;
}

const f_query = ref<string>('');
const f_orderBy = ref<Mq1MisskeyInstanceListStorage['f_orderBy']>(savedSettings?.f_orderBy ?? 'recommendedScore');
const f_order = ref<Mq1MisskeyInstanceListStorage['f_order']>(savedSettings?.f_order ?? 'desc');
const v_view = ref<Mq1MisskeyInstanceListStorage['v_view']>(savedSettings?.v_view ?? 'grid');


const PAGE_SIZE = 30;
const instances = ref<Instance[]>([]);
const total = ref(0);
const offset = ref(0);
const isLoading = ref(false);
const hasMore = computed(() => offset.value + instances.value.length < total.value);
const initialLoading = ref(true);
const errorMessage = ref<string | null>(null);

watch([f_orderBy, f_order, v_view], (to) => {
  const newSettings: Mq1MisskeyInstanceListStorage = {
    f_orderBy: to[0],
    f_order: to[1],
    v_view: to[2],
  };
  if (import.meta.client) {
    window.localStorage.setItem('miHub_server_finder', JSON.stringify(newSettings));
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
      order: f_order.value,
      limit: PAGE_SIZE.toString(),
      offset: currentOffset.toString(),
      ...(f_query.value && { search: f_query.value })
    });
    
    const response = await $fetch<InstancesResponse>(`/api/v1/instances?${params}`);
    
    if (reset) {
      instances.value = response.items;
      offset.value = response.limit;
    } else {
      instances.value = [...instances.value, ...response.items];
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

watch([f_orderBy, f_order], () => {
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


const formatNumber = (num: number) => {
  return new Intl.NumberFormat('ja-JP').format(num);
};

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
    <!-- Hero -->
    <SiteHero 
      :server-count="initialLoading ? '...' : formatNumber(total)" 
      :loading="initialLoading"
      :stats="stats"
    />

    <!-- メインコンテンツ -->
    <div id="instances" class="pb-12 md:pt-12 bg-back dark:bg-[#0b1220] text-slate-600 dark:text-slate-200 min-h-screen">
      <div class="container mx-auto max-w-screen-xl px-6 grid server-list gap-8">
        <!-- サイドバー -->
        <InstanceSidebar
          :loading="initialLoading"
          :total-count="formatNumber(total)"
          :search-query="f_query"
          v-model:order-by="f_orderBy"
          v-model:order="f_order"
          v-model:view="v_view"
          @search="(q) => { f_query = q; fetchInstances(true); }"
        />
        
        <!-- サーバー一覧 -->
        <div>
          <div
            class="grid gap-4"
            :class="[
              v_view === 'grid' && 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4',
              v_view === 'list' && 'grid-cols-1',
            ]"
          >
            <!-- サーバーカード -->
            <InstanceCard 
              v-if="instances.length > 0" 
              v-for="instance in instances" 
              :key="instance.id"
              :instance="instance" 
              :view="v_view" 
            />
            
            <!-- 空状態 -->
            <div
              v-else-if="!initialLoading"
              class="rounded-lg p-6 min-h-[40vh] flex items-center bg-slate-100 dark:bg-slate-800"
              :class="[
                v_view === 'grid' && 'sm:col-span-2 xl:col-span-3 2xl:col-span-4 3xl:col-span-5'
              ]"
            >
              <div class="mx-auto text-center">
                <img src="https://xn--931a.moe/assets/info.jpg" class="rounded-lg mx-auto mb-4" />
                <p class="max-w-xs">{{ f_query ? `「${f_query}」に一致するサーバーが見つかりませんでした` : 'サーバーが見つかりませんでした' }}</p>
              </div>
            </div>
            
            <!-- 読み込み中 -->
            <div
              v-else
              class="rounded-lg p-6 min-h-[40vh] flex items-center bg-slate-100 dark:bg-slate-800"
              :class="[
                v_view === 'grid' && 'sm:col-span-2 xl:col-span-3 2xl:col-span-4 3xl:col-span-5'
              ]"
            >
              <div class="mx-auto text-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p class="max-w-xs mt-4">読み込み中...</p>
              </div>
            </div>
          </div>
          
          <!-- 無限スクロールトリガー -->
          <div 
            v-if="!initialLoading && instances.length > 0"
            ref="loadMoreTrigger" 
            class="py-8 flex justify-center"
          >
            <div v-if="isLoading" class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p v-else-if="!hasMore" class="text-slate-500 dark:text-slate-400 text-sm">
              すべてのサーバーを表示しました
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@media (min-width: 1024px) {
  .server-list {
    grid-template-columns: 300px 1fr;
  }
}
</style>
