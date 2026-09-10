<template>
  <div class="bg-neutral-50 dark:bg-black">
    <!-- Hero -->
    <Hero label="Network Statistics" title="Stats" description="Misskeyネットワークの統計情報" :show-scroll="true" />

    <StateLoading v-if="pending" message="Loading statistics" class="py-32" />

    <div v-else-if="error" class="py-32 text-center bg-neutral-50 dark:bg-black">
      <div class="inline-block bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-8">
        <p class="font-display text-xs tracking-widest uppercase mb-2">Error</p>
        <p class="font-medium">{{ error.message }}</p>
      </div>
    </div>

    <div v-else>
      <!-- Overview Section -->
      <section class="py-16 lg:py-24 bg-neutral-50 dark:bg-black">
        <div class="container mx-auto max-w-screen-xl px-4 lg:px-6">
          <SectionHeader number="01" title="Overview" />

          <div class="grid grid-cols-2 lg:grid-cols-4 gap-px bg-neutral-200 dark:bg-neutral-800">
            <!-- Active -->
            <button @click="openModal('active')"
              class="border-none bg-white dark:bg-neutral-900 p-6 lg:p-8 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors group">
              <p class="font-display text-[10px] lg:text-xs font-medium tracking-widest uppercase text-neutral-400 mb-3">Active
                Servers</p>
              <p class="font-display text-3xl lg:text-5xl font-bold text-primary mb-2 whitespace-nowrap">
                {{ formatNumber(stats?.counts?.active, true) }}
              </p>
              <p class="text-[10px] lg:text-xs text-green-500 flex items-center gap-2">
                <span class="w-1.5 h-1.5 bg-green-500 animate-pulse"></span>
                Online
              </p>
              <p class="mt-3 text-[10px] text-neutral-400 group-hover:text-primary transition-colors">View List →</p>
            </button>

            <!-- Total Users -->
            <div class="bg-white dark:bg-neutral-900 p-6 lg:p-8">
              <p class="font-display text-[10px] lg:text-xs font-medium tracking-widest uppercase text-neutral-400 mb-3">Total Users
              </p>
              <p class="font-display text-3xl lg:text-5xl font-bold text-neutral-900 dark:text-white mb-2 whitespace-nowrap">
                {{ formatNumber(stats?.counts?.users, true) }}
              </p>
              <p class="text-[10px] lg:text-xs text-neutral-500">Across active servers</p>
            </div>

            <!-- Known -->
            <div class="bg-white dark:bg-neutral-900 p-6 lg:p-8">
              <p class="font-display text-[10px] lg:text-xs font-medium tracking-widest uppercase text-neutral-400 mb-3">Total Known
              </p>
              <p class="font-display text-3xl lg:text-5xl font-bold text-neutral-900 dark:text-white mb-2 whitespace-nowrap">
                {{ formatNumber(stats?.counts?.known, true) }}
              </p>
              <p class="text-[10px] lg:text-xs text-neutral-500">All discovered</p>
            </div>

            <!-- Excluded -->
            <button @click="openModal('excluded')"
              class="border-none bg-white dark:bg-neutral-900 p-6 lg:p-8 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors group">
              <p class="font-display text-[10px] lg:text-xs font-medium tracking-widest uppercase text-neutral-400 mb-3">Excluded</p>
              <p class="font-display text-3xl lg:text-5xl font-bold text-neutral-900 dark:text-white mb-2 whitespace-nowrap">
                {{ formatNumber(stats?.counts?.exclusions, true) }}
              </p>
              <p class="text-[10px] lg:text-xs text-red-500">Blocked / Ignored</p>
              <p class="mt-3 text-[10px] text-neutral-400 group-hover:text-primary transition-colors">View List →</p>
            </button>
          </div>
        </div>
      </section>

      <!-- Modal -->
      <InstanceListModal v-model="isModalOpen" :title="modalTitle" :type="modalType" :loading="loadingModal"
        :items="modalItems" :instances="modalInstances" :has-more="hasMore" :loading-more="loadingMore"
        @load-more="loadMore" />

      <!-- IPv6 Section -->
      <section class="py-16 lg:py-24 bg-neutral-50 dark:bg-neutral-950">
        <div class="container mx-auto max-w-screen-xl px-4 lg:px-6">
          <SectionHeader number="02" title="IPv6 Readiness" />

          <div class="grid grid-cols-2 lg:grid-cols-4 gap-px bg-neutral-200 dark:bg-neutral-800">
            <button v-for="tile in ipStackTiles" :key="tile.key" @click="openModal(tile.key)"
              class="border-none bg-white dark:bg-neutral-900 p-6 lg:p-8 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors group">
              <p class="font-display text-[10px] lg:text-xs font-medium tracking-widest uppercase text-neutral-400 mb-3">
                {{ tile.label }}</p>
              <p class="font-display text-3xl lg:text-5xl font-bold text-neutral-900 dark:text-white mb-2 whitespace-nowrap">
                {{ formatNumber(stats?.ip_stacks?.[tile.key]?.count, true) }}
              </p>
              <p class="text-[10px] lg:text-xs flex items-center gap-2" :class="tile.textClass">
                <span class="w-1.5 h-1.5" :class="tile.barClass"></span>
                {{ calculateShare(stats?.ip_stacks?.[tile.key]?.count ?? 0, stats?.counts?.active) }}% · {{ tile.description }}
              </p>
              <p class="mt-3 text-[10px] text-neutral-400 group-hover:text-primary transition-colors">View List →</p>
            </button>

            <!-- Unknown -->
            <div class="bg-white dark:bg-neutral-900 p-6 lg:p-8">
              <p class="font-display text-[10px] lg:text-xs font-medium tracking-widest uppercase text-neutral-400 mb-3">Unknown</p>
              <p class="font-display text-3xl lg:text-5xl font-bold text-neutral-900 dark:text-white mb-2 whitespace-nowrap">
                {{ formatNumber(stats?.ip_stacks?.unknown?.count, true) }}
              </p>
              <p class="text-[10px] lg:text-xs text-neutral-500 flex items-center gap-2">
                <span class="w-1.5 h-1.5 bg-neutral-300 dark:bg-neutral-700"></span>
                {{ calculateShare(stats?.ip_stacks?.unknown?.count ?? 0, stats?.counts?.active) }}% · Not checked yet
              </p>
            </div>
          </div>

          <!-- Share bar -->
          <div class="mt-8">
            <div class="flex h-2 w-full overflow-hidden bg-neutral-200 dark:bg-neutral-800">
              <div v-for="tile in ipStackTiles" :key="tile.key" class="h-full" :class="tile.barClass"
                :style="{ width: `${calculateShare(stats?.ip_stacks?.[tile.key]?.count ?? 0, stats?.counts?.active)}%` }"></div>
            </div>
            <div class="mt-3 flex flex-wrap items-center justify-between gap-4">
              <div class="flex flex-wrap items-center gap-4 text-[10px] lg:text-xs text-neutral-500">
                <span v-for="tile in ipStackTiles" :key="tile.key" class="flex items-center gap-2">
                  <span class="w-1.5 h-1.5" :class="tile.barClass"></span>{{ tile.label }}
                </span>
                <span class="flex items-center gap-2">
                  <span class="w-1.5 h-1.5 bg-neutral-300 dark:bg-neutral-700"></span>Unknown
                </span>
              </div>
              <p class="text-[10px] lg:text-xs text-neutral-500">
                IPv6 reachable users:
                <span class="font-bold text-primary">{{ ipv6ReachableUserShare }}%</span>
                <span class="text-neutral-400">({{ formatNumber(ipv6ReachableUsers, true) }} / {{ formatNumber(stats?.counts?.users, true) }})</span>
              </p>
            </div>
          </div>

          <p class="mt-6 text-xs text-neutral-500">* DNSレコード(A / AAAA)の有無による判定です。プロキシ配下のサーバーはオリジンの対応状況に関わらずデュアルスタックとして扱われます。</p>
        </div>
      </section>

      <!-- Software Section -->
      <section class="py-16 lg:py-24 bg-neutral-50 dark:bg-black">
        <div class="container mx-auto max-w-screen-xl px-4 lg:px-6">
          <SectionHeader number="03" title="Software Distribution" />

          <!-- Header (Desktop) -->
          <div
            class="hidden lg:grid grid-cols-12 gap-4 text-[10px] font-medium tracking-widest uppercase text-neutral-400 px-6 py-3">
            <div class="font-display col-span-1">#</div>
            <div class="font-display col-span-7">Software</div>
            <div class="font-display col-span-4 text-right">Instances</div>
          </div>

          <div class="divide-y divide-neutral-200 dark:divide-neutral-800">
            <NuxtLink v-for="(repo, index) in visibleRepositories" :key="repo.url" :to="repo.url" target="_blank"
              rel="noopener noreferrer"
              class="group grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 p-4 lg:p-6 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors">
              <!-- Rank -->
              <div class="lg:col-span-1 flex items-center">
                <span
                  class="text-xl lg:text-2xl font-bold text-neutral-300 dark:text-neutral-700 group-hover:text-primary transition-colors">
                  {{ String(index + 1).padStart(2, '0') }}
                </span>
              </div>

              <!-- Name -->
              <div class="lg:col-span-7 flex items-center gap-3">
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2 mb-0.5">
                    <h3
                      class="font-bold text-base lg:text-lg text-neutral-900 dark:text-white group-hover:text-primary transition-colors truncate">
                      {{ repo.name || repo.url }}
                    </h3>
                    <Icon name="lucide:external-link" class="h-3.5 w-3.5 text-neutral-400 group-hover:text-primary transition-colors shrink-0" />
                  </div>
                  <p v-if="repo.description" class="text-xs text-neutral-500 line-clamp-1">
                    {{ repo.description }}
                  </p>
                </div>
              </div>

              <!-- Count & Share -->
              <div class="lg:col-span-4 flex items-center justify-between lg:justify-end gap-4 lg:gap-6">
                <div class="lg:text-right">
                  <div
                    class="text-xl lg:text-2xl font-bold text-neutral-900 dark:text-white group-hover:text-primary transition-colors">
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
                    <div class="h-full bg-primary transition-all"
                      :style="{ width: `${calculateShare(repo.count, stats?.counts?.active)}%` }"></div>
                  </div>
                </div>
              </div>
            </NuxtLink>
          </div>

          <!-- Load More Button -->
          <div v-if="hasMoreSoftware" class="mt-8 lg:mt-12 text-center">
            <button @click="loadMoreSoftware"
              class="font-display inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs tracking-widest uppercase font-medium hover:bg-primary dark:hover:bg-primary dark:hover:text-white transition-colors">
              Load More
              <Icon name="lucide:chevron-down" class="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <CtaSection :stats="stats" />
    </div>
  </div>
</template>

<script setup lang="ts">
const { formatNumber, calculateShare } = useFormat();

const { data: stats, pending, error } = await useFetch<Stats>('/api/v1/stats', {
  lazy: true
});

useHead({
  title: 'Network Statistics - (Unofficial) Misskey Server List',
  meta: [
    { name: 'description', content: 'Statistics about Misskey instances and software usage distribution.' },
    { property: 'og:title', content: 'Network Statistics - (Unofficial) Misskey Server List' },
    { property: 'og:description', content: 'Statistics about Misskey instances and software usage distribution.' },
    { property: 'og:url', content: 'https://servers.misskey.ink/stats' },
  ]
});

useJsonld(() => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Network Statistics',
  description: 'Statistics about Misskey instances and software usage distribution.',
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://servers.misskey.ink/'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Stats',
        item: 'https://servers.misskey.ink/stats'
      }
    ]
  }
}));

const ipStackTiles = [
  { key: 'dual', label: 'Dual Stack', description: 'IPv4 + IPv6', textClass: 'text-green-500', barClass: 'bg-green-500' },
  { key: 'v6', label: 'IPv6', description: 'IPv6 only', textClass: 'text-blue-500', barClass: 'bg-blue-500' },
  { key: 'v4', label: 'IPv4', description: 'IPv4 only', textClass: 'text-amber-500', barClass: 'bg-amber-500' },
] as const;

// デュアルスタックとIPv6のみのサーバーのユーザー数合計
const ipv6ReachableUsers = computed(() =>
  (stats.value?.ip_stacks?.dual?.users ?? 0) + (stats.value?.ip_stacks?.v6?.users ?? 0)
);
const ipv6ReachableUserShare = computed(() =>
  calculateShare(ipv6ReachableUsers.value, stats.value?.counts?.users)
);

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
type ModalType = 'active' | 'excluded' | IpStackFilter;
const MODAL_TITLES: Record<ModalType, string> = {
  active: 'Active Servers',
  excluded: 'Excluded Domains',
  dual: 'Dual Stack Servers',
  v6: 'IPv6 Only Servers',
  v4: 'IPv4 Only Servers',
};
const isModalOpen = ref(false);
const modalTitle = ref('');
const modalType = ref<ModalType>('active');
const loadingModal = ref(false);
const loadingMore = ref(false);
const modalItems = ref<{ domain: string; reason: string | null }[]>([]);
const modalInstances = ref<Instance[]>([]);
const modalOffset = ref(0);
const modalTotal = ref(0);
const PAGE_SIZE = 50;

const hasMore = computed(() => {
  if (modalType.value === 'excluded') return false;
  return modalInstances.value.length < modalTotal.value;
});

async function openModal(type: ModalType) {
  isModalOpen.value = true;
  modalType.value = type;
  modalTitle.value = MODAL_TITLES[type];
  loadingModal.value = true;
  modalItems.value = [];
  modalInstances.value = [];
  modalOffset.value = 0;
  modalTotal.value = 0;

  try {
    if (type === 'excluded') {
      modalItems.value = await $fetch<{ domain: string; reason: string | null }[]>('/api/v1/exclusions');
    } else {
      await fetchActiveInstances(true);
    }
  } catch (e) {
    console.error('Failed to load modal data', e);
  } finally {
    loadingModal.value = false;
  }
}

// activeはip_stack条件なし
async function fetchActiveInstances(reset = false) {
  try {
    const currentOffset = reset ? 0 : modalOffset.value;
    const type = modalType.value;
    const res = await $fetch<{ items: Instance[]; total: number }>('/api/v1/instances', {
      params: {
        limit: PAGE_SIZE,
        offset: currentOffset,
        sort: 'users',
        order: 'desc',
        ...(type !== 'active' && type !== 'excluded' && { ip_stack: type }),
      }
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
