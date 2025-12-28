<template>
  <div class="bg-neutral-50 dark:bg-black">
    <!-- Hero -->
    <PageHero label="Network Statistics" title="Stats" description="Misskeyネットワークの統計情報" :show-scroll="true" />

    <div v-if="pending" class="py-32 text-center bg-neutral-50 dark:bg-black">
      <div
        class="w-10 h-10 border-2 border-neutral-200 dark:border-neutral-700 border-t-primary animate-spin mx-auto mb-6">
      </div>
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
          <SectionHeader number="01" title="Overview" />

          <div class="grid grid-cols-2 lg:grid-cols-4 gap-px bg-neutral-200 dark:bg-neutral-800">
            <!-- Active -->
            <button @click="openModal('active')"
              class="border-none bg-white dark:bg-neutral-900 p-6 lg:p-8 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors group">
              <p class="text-[10px] lg:text-xs font-medium tracking-widest uppercase text-neutral-400 mb-3">Active
                Servers</p>
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
              <p class="text-[10px] lg:text-xs font-medium tracking-widest uppercase text-neutral-400 mb-3">Total Known
              </p>
              <p class="text-3xl lg:text-5xl font-bold text-neutral-900 dark:text-white mb-2">
                {{ formatNumber(stats?.counts?.known) }}
              </p>
              <p class="text-[10px] lg:text-xs text-neutral-500">All discovered</p>
            </div>

            <!-- Denied -->
            <button @click="openModal('denied')"
              class="border-none bg-white dark:bg-neutral-900 p-6 lg:p-8 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors group">
              <p class="text-[10px] lg:text-xs font-medium tracking-widest uppercase text-neutral-400 mb-3">Denied</p>
              <p class="text-3xl lg:text-5xl font-bold text-neutral-900 dark:text-white mb-2">
                {{ formatNumber(stats?.counts?.denies) }}
              </p>
              <p class="text-[10px] lg:text-xs text-red-500">Blocked</p>
              <p class="mt-3 text-[10px] text-neutral-400 group-hover:text-primary transition-colors">View List →</p>
            </button>

            <!-- Ignored -->
            <button @click="openModal('ignored')"
              class="border-none bg-white dark:bg-neutral-900 p-6 lg:p-8 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors group">
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
      <InstanceListModal v-model="isModalOpen" :title="modalTitle" :type="modalType" :loading="loadingModal"
        :items="modalItems" :instances="modalInstances" :has-more="hasMore" :loading-more="loadingMore"
        @load-more="loadMore" />

      <!-- Software Section -->
      <section class="py-16 lg:py-24 bg-neutral-50 dark:bg-neutral-950">
        <div class="container mx-auto max-w-screen-xl px-4 lg:px-6">
          <SectionHeader number="02" title="Software Distribution" />

          <!-- Header (Desktop) -->
          <div
            class="hidden lg:grid grid-cols-12 gap-4 text-[10px] font-medium tracking-widest uppercase text-neutral-400 px-6 py-3">
            <div class="col-span-1">#</div>
            <div class="col-span-7">Software</div>
            <div class="col-span-4 text-right">Instances</div>
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
                    <svg xmlns="http://www.w3.org/2000/svg"
                      class="h-3.5 w-3.5 text-neutral-400 group-hover:text-primary transition-colors shrink-0"
                      viewBox="0 0 20 20" fill="currentColor">
                      <path
                        d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
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
              class="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs tracking-widest uppercase font-medium hover:bg-primary dark:hover:bg-primary dark:hover:text-white transition-colors">
              Load More
              <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
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
import { formatNumber, calculateShare } from '~/utils/format';
import type { ModalItem } from '~/types/api';

const { data: stats, pending, error } = await useFetch('/api/v1/stats', {
  lazy: true
});

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
const modalItems = ref<ModalItem[]>([]);
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
        const deniedRes = await $fetch<ModalItem[]>('/api/v1/deny_instances');
        modalItems.value = deniedRes;
        break;
      case 'ignored':
        modalTitle.value = 'Ignored Domains';
        const ignoredRes = await $fetch<ModalItem[]>('/api/v1/ignore_instances');
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
