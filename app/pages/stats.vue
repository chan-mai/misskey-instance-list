<template>
  <div class="bg-neutral-50 dark:bg-black">
    <!-- Hero -->
    <PageHero
      label="Network Statistics"
      title="Stats"
      description="Misskeyネットワークの統計情報"
      :show-scroll="true"
    />

    <div v-if="pending" class="py-32 text-center bg-neutral-50 dark:bg-black">
      <div class="w-10 h-10 border-2 border-neutral-200 dark:border-neutral-700 border-t-primary animate-spin mx-auto mb-6"></div>
      <p class="text-neutral-400 text-xs tracking-widest uppercase">Loading statistics</p>
    </div>

    <div v-else-if="error" class="py-32 text-center bg-neutral-50 dark:bg-black">
      <div class="inline-block bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-8">
        <p class="text-xs tracking-widest uppercase mb-2">Error</p>
        <p class="font-medium">{{ error.message }}</p>
      </div>
    </div>

    <div v-else>
      <!-- Overview Section -->
      <section class="py-16 lg:py-24 bg-neutral-50 dark:bg-black">
        <div class="container mx-auto max-w-screen-xl px-4 lg:px-6">
          <div class="mb-12 lg:mb-16">
            <p class="text-xs font-medium tracking-widest uppercase text-neutral-400 mb-3">01</p>
            <h2 class="text-2xl lg:text-4xl font-bold text-neutral-900 dark:text-white mb-4">Overview</h2>
            <div class="w-12 h-px bg-primary"></div>
          </div>

          <div class="grid grid-cols-2 lg:grid-cols-4 gap-px bg-neutral-200 dark:bg-neutral-800">
            <!-- Active -->
            <button
              @click="openModal('active')"
              class="border-none bg-white dark:bg-neutral-900 p-6 lg:p-8 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors group"
            >
              <p class="text-[10px] lg:text-xs font-medium tracking-widest uppercase text-neutral-400 mb-3">Active Servers</p>
              <p class="text-3xl lg:text-5xl font-bold text-primary mb-2">
                {{ formatNumber(stats?.counts?.active) }}
              </p>
              <p class="text-[10px] lg:text-xs text-green-500 flex items-center gap-2">
                <span class="w-1.5 h-1.5 bg-green-500 animate-pulse"></span>
                Online
              </p>
              <p class="mt-3 text-[10px] text-neutral-400 group-hover:text-primary transition-colors">View List →</p>
            </button>

            <!-- Known -->
            <div class="bg-white dark:bg-neutral-900 p-6 lg:p-8">
              <p class="text-[10px] lg:text-xs font-medium tracking-widest uppercase text-neutral-400 mb-3">Total Known</p>
              <p class="text-3xl lg:text-5xl font-bold text-neutral-900 dark:text-white mb-2">
                {{ formatNumber(stats?.counts?.known) }}
              </p>
              <p class="text-[10px] lg:text-xs text-neutral-500">All discovered</p>
            </div>

            <!-- Denied -->
            <button
              @click="openModal('denied')"
              class="border-none bg-white dark:bg-neutral-900 p-6 lg:p-8 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors group"
            >
              <p class="text-[10px] lg:text-xs font-medium tracking-widest uppercase text-neutral-400 mb-3">Denied</p>
              <p class="text-3xl lg:text-5xl font-bold text-neutral-900 dark:text-white mb-2">
                {{ formatNumber(stats?.counts?.denies) }}
              </p>
              <p class="text-[10px] lg:text-xs text-red-500">Blocked</p>
              <p class="mt-3 text-[10px] text-neutral-400 group-hover:text-primary transition-colors">View List →</p>
            </button>

            <!-- Ignored -->
            <button
              @click="openModal('ignored')"
              class="border-none bg-white dark:bg-neutral-900 p-6 lg:p-8 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors group"
            >
              <p class="text-[10px] lg:text-xs font-medium tracking-widest uppercase text-neutral-400 mb-3">Ignored</p>
              <p class="text-3xl lg:text-5xl font-bold text-neutral-900 dark:text-white mb-2">
                {{ formatNumber(stats?.counts?.ignores) }}
              </p>
              <p class="text-[10px] lg:text-xs text-neutral-500">Excluded</p>
              <p class="mt-3 text-[10px] text-neutral-400 group-hover:text-primary transition-colors">View List →</p>
            </button>
          </div>
        </div>
      </section>

      <!-- Modal -->
      <BaseModal v-model="isModalOpen" @close="isModalOpen = false">
        <template #title>
          {{ modalTitle }}
          <span v-if="modalItems.length > 0" class="ml-2 text-sm font-normal text-neutral-500">
            ({{ formatNumber(modalItems.length) }})
          </span>
        </template>

        <div v-if="loadingModal" class="py-12 flex justify-center">
          <div class="w-8 h-8 border-2 border-neutral-300 dark:border-neutral-600 border-t-primary animate-spin"></div>
        </div>


        <div v-else>
          <!-- 文字列リスト (Denied / Ignored) -->
          <ul v-if="modalType === 'denied' || modalType === 'ignored'"
            class="divide-y divide-neutral-200 dark:divide-neutral-800">
            <li v-for="item in modalItems" :key="item.domain" class="py-4">
              <div class="flex items-center justify-between">
                <span class="text-sm text-neutral-900 dark:text-white font-mono select-all">{{ item.domain }}</span>
                <span v-if="item.reason"
                  class="text-xs text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-1">{{
                  item.reason }}</span>
              </div>
            </li>
          </ul>

          <!-- インスタンスリスト (Active) -->
          <div v-else class="grid gap-px bg-neutral-200 dark:bg-neutral-800">
            <NuxtLink v-for="instance in modalInstances" :key="instance.id" :to="`https://${instance.id}`"
              target="_blank" rel="noopener noreferrer"
              class="flex items-center gap-4 p-4 bg-back dark:bg-back-dark hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors group">
              <img v-if="instance.icon_url" :src="instance.icon_url"
                class="w-10 h-10 bg-neutral-100 dark:bg-neutral-800 object-cover" loading="lazy"
                @error="(e) => (e.target as HTMLImageElement).src = 'https://placehold.co/40x40?text=?'" />
              <div v-else
                class="w-10 h-10 bg-primary flex items-center justify-center text-white font-bold">
                {{ (instance.node_name || instance.id).charAt(0).toUpperCase() }}
              </div>

              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-2">
                  <h4
                    class="font-bold text-neutral-900 dark:text-white truncate group-hover:text-primary transition-colors">
                    {{ instance.node_name || instance.id }}</h4>
                  <span v-if="!instance.is_alive"
                    class="px-2 py-0.5 text-[10px] bg-red-500/10 text-red-500 border border-red-500/20">Offline</span>
                </div>
                <span class="text-xs text-neutral-500 truncate block">{{ instance.id }}</span>
              </div>

              <div class="text-right shrink-0">
                <div class="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                  {{ formatNumber(instance.users_count) }} users
                </div>
                <div class="text-[10px] text-neutral-400">v{{ instance.version }}</div>
              </div>
            </NuxtLink>

            <!-- もっと見るリンク/ボタン -->
            <div v-if="hasMore" class="p-4 text-center bg-back dark:bg-back-dark">
              <button @click="loadMore" :disabled="loadingMore"
                class="text-sm text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:underline transition-colors">
                <span v-if="loadingMore">読み込み中...</span>
                <span v-else>もっと見る →</span>
              </button>
            </div>
            <div v-if="!hasMore && modalInstances.length > 0" class="p-4 text-center text-xs text-neutral-400 bg-back dark:bg-back-dark">
              すべてのサーバーを表示しました
            </div>
          </div>
        </div>
      </BaseModal>

      <!-- Software Section -->
      <section class="py-16 lg:py-24 bg-neutral-50 dark:bg-neutral-950">
        <div class="container mx-auto max-w-screen-xl px-4 lg:px-6">
          <div class="mb-12 lg:mb-16">
            <p class="text-xs font-medium tracking-widest uppercase text-neutral-400 mb-3">02</p>
            <h2 class="text-2xl lg:text-4xl font-bold text-neutral-900 dark:text-white mb-4">Software Distribution</h2>
            <div class="w-12 h-px bg-primary"></div>
          </div>

          <!-- Header (Desktop) -->
          <div class="hidden lg:grid grid-cols-12 gap-4 text-[10px] font-medium tracking-widest uppercase text-neutral-400 px-6 py-3">
            <div class="col-span-1">#</div>
            <div class="col-span-7">Software</div>
            <div class="col-span-4 text-right">Instances</div>
          </div>

          <div class="divide-y divide-neutral-200 dark:divide-neutral-800">
            <NuxtLink 
              v-for="(repo, index) in visibleRepositories" 
              :key="repo.url" 
              :to="repo.url" 
              target="_blank"
              rel="noopener noreferrer"
              class="group grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 p-4 lg:p-6 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
            >
              <!-- Rank -->
              <div class="lg:col-span-1 flex items-center">
                <span class="text-xl lg:text-2xl font-bold text-neutral-300 dark:text-neutral-700 group-hover:text-primary transition-colors">
                  {{ String(index + 1).padStart(2, '0') }}
                </span>
              </div>

              <!-- Name -->
              <div class="lg:col-span-7 flex items-center gap-3">
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2 mb-0.5">
                    <h3 class="font-bold text-base lg:text-lg text-neutral-900 dark:text-white group-hover:text-primary transition-colors truncate">
                      {{ repo.name || repo.url }}
                    </h3>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-neutral-400 group-hover:text-primary transition-colors shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                      <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                    </svg>
                  </div>
                  <p v-if="repo.description" class="text-xs text-neutral-500 line-clamp-1">
                    {{ repo.description }}
                  </p>
                </div>
              </div>

              <!-- Count & Share -->
              <div class="lg:col-span-4 flex items-center justify-between lg:justify-end gap-4 lg:gap-6">
                <div class="lg:text-right">
                  <div class="text-xl lg:text-2xl font-bold text-neutral-900 dark:text-white group-hover:text-primary transition-colors">
                    {{ formatNumber(repo.count) }}
                  </div>
                  <div class="text-[10px] text-neutral-400">instances</div>
                </div>
                <div class="w-20 lg:w-24">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-[10px] font-medium text-primary">
                      {{ calculateShare(repo.count, stats?.counts?.active) }}%
                    </span>
                  </div>
                  <div class="h-1 bg-neutral-200 dark:bg-neutral-800">
                    <div class="h-full bg-primary transition-all" :style="{ width: `${calculateShare(repo.count, stats?.counts?.active)}%` }"></div>
                  </div>
                </div>
              </div>
            </NuxtLink>
          </div>

          <!-- Load More Button -->
          <div v-if="hasMoreSoftware" class="mt-8 lg:mt-12 text-center">
            <button 
              @click="loadMoreSoftware"
              class="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs tracking-widest uppercase font-medium hover:bg-primary dark:hover:bg-primary dark:hover:text-white transition-colors"
            >
              Load More
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="py-24 bg-neutral-100 dark:bg-black transition-colors duration-300">
        <div class="container mx-auto max-w-screen-xl px-6">
          <div class="flex flex-col lg:flex-row items-center justify-between gap-16">
            <!-- Text Content -->
            <div class="lg:w-1/2 text-center lg:text-left">
              <h2 class="text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-white mb-6">
                Let's find your server.
              </h2>
              <p class="text-lg text-neutral-600 dark:text-white/60 mb-10 max-w-xl mx-auto lg:mx-0">
                あなたにぴったりのMisskeyサーバーを見つけよう。
              </p>

              <NuxtLink 
                to="/"
                class="inline-flex items-center gap-3 px-10 py-5 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-medium tracking-widest uppercase hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-colors duration-300"
              >
                サーバーを見つける
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </NuxtLink>
            </div>

            <!-- Stats Grid -->
            <div class="hidden lg:block lg:w-1/2 w-full max-w-lg">
              <div class="grid grid-cols-2 gap-6">
                <div class="bg-white dark:bg-neutral-900 p-8 rounded-2xl shadow-sm">
                  <p class="text-4xl font-bold text-neutral-900 dark:text-white mb-2">{{ stats?.counts?.active ? formatNumber(stats.counts.active) : '-' }}</p>
                  <p class="text-xs text-neutral-500 dark:text-neutral-400 tracking-widest uppercase">Active</p>
                </div>
                <div class="bg-white dark:bg-neutral-900 p-8 rounded-2xl shadow-sm">
                  <p class="text-4xl font-bold text-neutral-900 dark:text-white mb-2">{{ stats?.counts?.known ? formatNumber(stats.counts.known) : '-' }}</p>
                  <p class="text-xs text-neutral-500 dark:text-neutral-400 tracking-widest uppercase">Known</p>
                </div>
                <div class="bg-white dark:bg-neutral-900 p-8 rounded-2xl shadow-sm">
                  <p class="text-4xl font-bold text-neutral-900 dark:text-white mb-2">{{ stats?.repositories?.length || '-' }}</p>
                  <p class="text-xs text-neutral-500 dark:text-neutral-400 tracking-widest uppercase">Software</p>
                </div>
                <div class="bg-white dark:bg-neutral-900 p-8 rounded-2xl shadow-sm">
                  <p class="text-4xl font-bold text-neutral-900 dark:text-white mb-2">{{ stats?.languages?.length || '-' }}</p>
                  <p class="text-xs text-neutral-500 dark:text-neutral-400 tracking-widest uppercase">Languages</p>
                </div>
              </div>
            </div>
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
const modalInstances = ref<Instance[]>([]);
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
    const res = await $fetch<{ items: Instance[]; total: number }>('/api/v1/instances', {
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
