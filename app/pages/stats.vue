<template>
  <div class="min-h-screen bg-back dark:bg-[#0b1220]">
    <!-- Header Section -->
    <header class="min-h-screen flex flex-col justify-center relative py-24 overflow-hidden">
      <!-- 背景テキスト -->
      <div
        class="absolute right-0 top-1/4 text-[15vw] font-bold text-primary/70 opacity-30 pointer-events-none select-none leading-none whitespace-nowrap">
        NETWORK<br>STATS
      </div>

      <div class="container mx-auto max-w-screen-lg px-6 relative z-10">
        <p class="text-xs md:text-sm uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400 font-medium mb-8">
          Network Statistics
        </p>

        <h1
          class="text-5xl md:text-7xl lg:text-8xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-12 leading-tight">
          Network<br>Statistics
        </h1>

        <div class="w-16 md:w-24 h-0.5 bg-slate-900 dark:bg-white mb-12"></div>

        <p class="text-sm md:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
          ネットワーク全体の詳細な統計情報です。<br>
          アクティブなインスタンス数や、使用されているソフトウェアの分布などを確認できます。
        </p>
      </div>

      <!-- スクロール指示 -->
      <div class="absolute bottom-8 left-6 md:left-24 flex items-center gap-4 opacity-60 animate-bounce">
        <span class="text-[10px] uppercase tracking-widest dark:text-white">Scroll</span>
        <div class="w-px h-10 bg-slate-900 dark:bg-white"></div>
      </div>
    </header>

    <div v-if="pending" class="py-32 text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p class="text-slate-500">Loading statistics...</p>
    </div>

    <div v-else-if="error" class="py-32 text-center">
      <div class="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-lg inline-block">
        <h3 class="font-bold mb-2">Failed to load statistics</h3>
        <p>{{ error.message }}</p>
      </div>
    </div>

    <div v-else>
      <!-- Overview Section -->
      <section class="py-32 bg-white dark:bg-slate-900">
        <div class="container mx-auto max-w-screen-lg px-6">
          <div class="flex items-end justify-between mb-24 border-b border-primary/70 pb-6">
            <h2 class="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">Overview</h2>
            <span class="text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary">概要</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            <!-- Active -->
            <div
              class="bg-back dark:bg-[#0b1220] rounded-2xl p-8 border border-slate-100 dark:border-slate-800 relative overflow-hidden group cursor-pointer hover:border-primary/50 transition-colors"
              @click="openModal('active')">
              <div
                class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-transparent rounded-bl-full -mr-6 -mt-6 transition-transform group-hover:scale-110">
              </div>
              <div class="relative">
                <p class="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Active
                  Servers</p>
                <p class="text-5xl font-extrabold text-slate-900 dark:text-white mb-2">
                  {{ formatNumber(stats?.counts?.active) }}
                </p>
                <p class="text-xs text-green-500 font-medium flex items-center">
                  <span class="inline-block w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                  Online & Healthy
                </p>
                <div
                  class="mt-4 flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                  View List <span class="ml-1">→</span>
                </div>
              </div>
            </div>

            <!-- Known -->
            <div
              class="bg-back dark:bg-[#0b1220] rounded-2xl p-8 border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
              <div
                class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-bl-full -mr-6 -mt-6 transition-transform group-hover:scale-110">
              </div>
              <div class="relative">
                <p class="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Total
                  Known</p>
                <p class="text-5xl font-extrabold text-slate-900 dark:text-white mb-2">
                  {{ formatNumber(stats?.counts?.known) }}
                </p>
                <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  All discovered instances
                </p>
              </div>
            </div>

            <!-- Denied -->
            <div
              class="bg-back dark:bg-[#0b1220] rounded-2xl p-8 border border-slate-100 dark:border-slate-800 relative overflow-hidden group cursor-pointer hover:border-primary/50 transition-colors"
              @click="openModal('denied')">
              <div
                class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-red-500/10 to-transparent rounded-bl-full -mr-6 -mt-6 transition-transform group-hover:scale-110">
              </div>
              <div class="relative">
                <p class="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Denied
                  Domains</p>
                <p class="text-4xl font-bold text-slate-900 dark:text-white mb-1">
                  {{ formatNumber(stats?.counts?.denies) }}
                </p>
                <p class="text-xs text-red-500/70">Blocked</p>
                <div
                  class="mt-4 flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                  View List <span class="ml-1">→</span>
                </div>
              </div>
            </div>

            <!-- Ignored -->
            <div
              class="bg-back dark:bg-[#0b1220] rounded-2xl p-8 border border-slate-100 dark:border-slate-800 relative overflow-hidden group cursor-pointer hover:border-primary/50 transition-colors"
              @click="openModal('ignored')">
              <div
                class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-500/10 to-transparent rounded-bl-full -mr-6 -mt-6 transition-transform group-hover:scale-110">
              </div>
              <div class="relative">
                <p class="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">Ignored
                  Domains</p>
                <p class="text-4xl font-bold text-slate-900 dark:text-white mb-1">
                  {{ formatNumber(stats?.counts?.ignores) }}
                </p>
                <p class="text-xs text-slate-500 dark:text-slate-400">Excluded</p>
                <div
                  class="mt-4 flex items-center text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                  View List <span class="ml-1">→</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Modal -->
      <BaseModal v-model="isModalOpen" @close="isModalOpen = false">
        <template #title>
          {{ modalTitle }}
          <span v-if="modalItems.length > 0" class="ml-2 text-sm font-normal text-slate-500">
            ({{ formatNumber(modalItems.length) }})
          </span>
        </template>

        <div v-if="loadingModal" class="py-12 flex justify-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>

        <div v-else>
          <!-- 文字列リスト (Denied / Ignored) -->
          <ul v-if="modalType === 'denied' || modalType === 'ignored'"
            class="divide-y divide-slate-100 dark:divide-slate-800">
            <li v-for="item in modalItems" :key="item.domain" class="py-3">
              <div class="flex items-center justify-between">
                <span class="text-sm text-slate-900 dark:text-white font-mono select-all font-bold">{{ item.domain
                  }}</span>
                <span v-if="item.reason"
                  class="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{{
                  item.reason }}</span>
              </div>
            </li>
          </ul>

          <!-- インスタンスリスト (Active) -->
          <div v-else class="grid gap-3">
            <NuxtLink v-for="instance in modalInstances" :key="instance.id" :to="`https://${instance.id}`"
              target="_blank" rel="noopener noreferrer"
              class="flex items-center gap-3 p-3 rounded-lg border border-slate-100 dark:border-slate-800 hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/15 transition-colors duration-200 group">
              <img v-if="instance.icon_url" :src="instance.icon_url"
                class="w-10 h-10 rounded bg-slate-100 dark:bg-slate-800 object-cover" loading="lazy"
                @error="(e) => (e.target as HTMLImageElement).src = 'https://placehold.co/40x40?text=?'" />
              <div v-else
                class="w-10 h-10 rounded bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold">
                {{ (instance.node_name || instance.id).charAt(0).toUpperCase() }}
              </div>

              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <h4
                    class="font-bold text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors">
                    {{
                      instance.node_name || instance.id }}</h4>
                  <span v-if="!instance.is_alive"
                    class="px-1.5 py-0.5 rounded text-[10px] bg-red-50 text-red-600 border border-red-200">Offline</span>
                </div>
                <span class="text-xs text-slate-500 group-hover:text-primary/70 transition-colors truncate block">
                  {{ instance.id }}
                </span>
              </div>

              <div class="text-right shrink-0">
                <div
                  class="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors">
                  {{ formatNumber(instance.users_count) }} users
                </div>
                <div class="text-[10px] text-slate-400 group-hover:text-primary/70 transition-colors">
                  v{{ instance.version }}
                </div>
              </div>
            </NuxtLink>

            <!-- もっと見るリンク/ボタン -->
            <div v-if="hasMore" class="mt-4 text-center">
              <button @click="loadMore" :disabled="loadingMore"
                class="text-sm text-primary disabled:opacity-50 disabled:cursor-not-allowed border-none hover:no-underline hover:text-primary/50 transition-colors duration-200">
                <span v-if="loadingMore">読み込み中...</span>
                <span v-else>もっと見る</span>
              </button>
            </div>
            <div v-if="!hasMore && modalInstances.length > 0" class="mt-4 text-center text-xs text-slate-400">
              すべてのサーバーを表示しました
            </div>
          </div>
        </div>
      </BaseModal>

      <!-- Software Section -->
      <section class="py-32 bg-back dark:bg-[#0b1220]">
        <div class="container mx-auto max-w-screen-lg px-6">
          <div class="flex items-end justify-between mb-12 md:mb-24 border-b border-primary/70 pb-6">
            <h2 class="text-3xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">Software</h2>
            <span class="text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary">ソフトウェア</span>
          </div>

          <!-- Header -->
          <div
            class="hidden md:flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-4 py-2 mb-2">
            <div class="w-16">Rank</div>
            <div class="flex-1 px-4">Software / Repository</div>
            <div class="text-right whitespace-nowrap">Instances & Share</div>
          </div>

          <div class="grid gap-4">
            <NuxtLink v-for="(repo, index) in visibleRepositories" :key="repo.url" :to="repo.url" target="_blank"
              rel="noopener noreferrer"
              class="group flex flex-col md:flex-row items-stretch md:items-center p-4 rounded-lg border border-slate-300 dark:border-slate-800 hover:border-primary/50 hover:bg-primary/5 dark:hover:bg-primary/15 transition-all duration-200">
              <!-- Rank & Name Wrapper -->
              <div class="flex items-center mb-3 md:mb-0 md:flex-1 md:min-w-0">
                <!-- Rank -->
                <div
                  class="w-10 md:w-16 font-mono font-bold text-slate-500 dark:text-slate-400 group-hover:text-primary transition-colors text-lg md:text-xl">
                  #{{ index + 1 }}
                </div>

                <!-- Name / Desc -->
                <div class="flex-1 min-w-0 px-2 md:px-4">
                  <div class="flex items-center gap-2 mb-1">
                    <h3
                      class="font-bold text-base md:text-lg text-slate-900 dark:text-white group-hover:text-primary transition-colors truncate">
                      {{ repo.name || repo.url }}
                    </h3>
                    <svg xmlns="http://www.w3.org/2000/svg"
                      class="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" viewBox="0 0 20 20"
                      fill="currentColor">
                      <path
                        d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                      <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                    </svg>
                  </div>
                  <p v-if="repo.description"
                    class="text-xs text-slate-500 dark:text-slate-400 group-hover:text-primary/70 transition-colors line-clamp-1">
                    {{ repo.description }}
                  </p>
                </div>
              </div>

              <!-- Count & Share -->
              <div class="flex items-center justify-between md:block md:text-right md:shrink-0">
                <span
                  class="md:hidden text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Instances</span>
                <div class="text-right">
                  <div
                    class="text-xl md:text-2xl font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                    {{ formatNumber(repo.count) }}
                  </div>
                  <div class="flex items-center justify-end gap-2 mt-1">
                    <span class="text-xs text-slate-400 group-hover:text-primary/70 transition-colors">
                      {{ calculateShare(repo.count, stats?.counts?.active) }}%
                    </span>
                    <div class="w-16 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div class="h-full bg-primary dark:bg-primary/70 group-hover:bg-primary transition-colors"
                        :style="{ width: `${calculateShare(repo.count, stats?.counts?.active)}%` }"></div>
                    </div>
                  </div>
                </div>
              </div>
            </NuxtLink>
          </div>

          <!-- Load More Button -->
          <div v-if="hasMoreSoftware" class="mt-8 text-center">
            <button @click="loadMoreSoftware"
              class="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold hover:border-primary hover:text-primary transition-all duration-200 shadow-sm hover:shadow">
              <span>Load More Software</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      <!-- Action -->
      <section class="relative py-32 bg-white dark:bg-slate-900 overflow-hidden">
        <div
          class="absolute top-1/2 -right-[20%] md:-right-[10%] w-[120vw] h-[120vw] md:w-[60vw] md:h-[60vw] -translate-y-1/2 rounded-full border border-slate-200 dark:border-slate-800 pointer-events-none">
          <div class="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] rounded-full overflow-hidden"
            style="background-image: radial-gradient(#64748b 1px, transparent 1px); background-size: 24px 24px;">
          </div>

          <div class="absolute inset-0 flex items-center justify-center">
            <div class="relative w-full h-full">
              <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div class="w-6 h-6 bg-primary rounded-full shadow-lg shadow-primary/50 animate-pulse">
                </div>
                <div class="absolute inset-0 w-6 h-6 bg-primary rounded-full animate-ping opacity-20">
                </div>
              </div>

              <!-- Most Outer Orbit -->
              <div class="absolute top-1/2 left-1/2 w-full h-full rounded-full"
                style="animation: orbit-outer 30s linear infinite;">
                <div
                  class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-slate-300 dark:bg-slate-600 rounded-full">
                </div>
              </div>

              <div
                class="absolute top-1/2 left-1/2 w-[70%] h-[70%] border border-slate-400 dark:border-slate-600 rounded-full"
                style="animation: orbit-outer 20s linear infinite;">
                <div
                  class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-slate-500 dark:bg-slate-400 rounded-full">
                </div>
                <div
                  class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-slate-400 dark:bg-slate-500 rounded-full">
                </div>
              </div>
              <div
                class="absolute top-1/2 left-1/2 w-[45%] h-[45%] border border-slate-300 dark:border-slate-700 rounded-full"
                style="animation: orbit-inner 15s linear infinite;">
                <div
                  class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-slate-500 dark:bg-slate-400 rounded-full">
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="container mx-auto max-w-screen-lg px-6 relative z-10">
          <div class="grid md:grid-cols-2 gap-20">
            <div class="flex flex-col justify-center h-full">
              <h2
                class="text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-12 text-slate-900 dark:text-white">
                Let's find<br>your instance.
              </h2>
              <div class="mb-12">
                <NuxtLink to="/"
                  class="inline-flex items-center gap-2 text-lg text-primary hover:text-primary/70 transition-colors">
                  サーバーを探す
                  <span class="text-xs">→</span>
                </NuxtLink>
              </div>
            </div>
            <!-- Spacer -->
            <div class="hidden md:block"></div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
const { data: stats, pending, error } = await useFetch('/api/v1/stats', {
  lazy: true
});

const formatNumber = (num?: number) => {
  return typeof num === 'number' ? new Intl.NumberFormat('ja-JP').format(num) : '-';
};

const calculateShare = (count: number, total?: number) => {
  if (!total || total === 0) return '0.0';
  return ((count / total) * 100).toFixed(1);
};

useHead({
  title: 'Network Statistics | Misskey Server List',
  meta: [
    { name: 'description', content: 'Statistics about Misskey instances and software usage distribution.' },
    { property: 'og:title', content: 'Network Statistics | Misskey Server List' },
    { property: 'og:description', content: 'Statistics about Misskey instances and software usage distribution.' },
  ]
});

// Software Pagination State
const visibleSoftwareCount = ref(50);
const SOFTWARE_PAGE_SIZE = 50;

const visibleRepositories = computed(() => {
  return (stats.value?.repositories || []).slice(0, visibleSoftwareCount.value);
});

const hasMoreSoftware = computed(() => {
  return visibleSoftwareCount.value < (stats.value?.repositories || []).length;
});

const loadMoreSoftware = () => {
  visibleSoftwareCount.value += SOFTWARE_PAGE_SIZE;
};

// Modal State
const isModalOpen = ref(false);
const modalTitle = ref('');
const modalType = ref<'active' | 'denied' | 'ignored'>('active');
const loadingModal = ref(false);
const loadingMore = ref(false);
const modalItems = ref<{ domain: string; reason: string | null }[]>([]);
const modalInstances = ref<any[]>([]);
const modalOffset = ref(0);
const modalTotal = ref(0);
const PAGE_SIZE = 50;

const hasMore = computed(() => {
  if (modalType.value !== 'active') return false;
  return modalInstances.value.length < modalTotal.value;
});

async function openModal(type: 'active' | 'denied' | 'ignored') {
  isModalOpen.value = true;
  modalType.value = type;
  loadingModal.value = true;
  modalItems.value = [];
  modalInstances.value = [];
  modalOffset.value = 0;
  modalTotal.value = 0;

  try {
    switch (type) {
      case 'active':
        modalTitle.value = 'Active Servers';
        await fetchActiveInstances(true);
        break;
      case 'denied':
        modalTitle.value = 'Denied Domains';
        const deniedRes = await $fetch<{ domain: string; reason: string | null }[]>('/api/v1/deny_instances');
        modalItems.value = deniedRes;
        break;
      case 'ignored':
        modalTitle.value = 'Ignored Domains';
        const ignoredRes = await $fetch<{ domain: string; reason: string | null }[]>('/api/v1/ignore_instances');
        modalItems.value = ignoredRes;
        break;
    }
  } catch (e) {
    console.error('Failed to load modal data', e);
  } finally {
    loadingModal.value = false;
  }
}

async function fetchActiveInstances(reset = false) {
  try {
    const currentOffset = reset ? 0 : modalOffset.value;
    const res = await $fetch<any>('/api/v1/instances', {
      params: { limit: PAGE_SIZE, offset: currentOffset, sort: 'users', order: 'desc' }
    });

    if (reset) {
      modalInstances.value = res.items;
      modalTotal.value = res.total;
    } else {
      modalInstances.value = [...modalInstances.value, ...res.items];
    }

    modalOffset.value = currentOffset + res.items.length; // Update offset for next fetch
  } catch (e) {
    console.error('Failed to fetch instances', e);
  }
}

async function loadMore() {
  if (loadingMore.value || !hasMore.value) return;
  loadingMore.value = true;
  await fetchActiveInstances(false);
  loadingMore.value = false;
}
</script>
