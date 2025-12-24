<template>

  <!-- グリッド表示 (variant='default') -->
  <NuxtLink
    v-if="view === 'grid'"
    :to="`https://${instance.id}`"
    target="_blank"
    rel="noopener noreferrer"
    class="group flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-md focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
  >
    <!-- 画像エリア -->
    <div class="relative aspect-video w-full bg-gray-100 dark:bg-slate-700 overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-gray-100 to-white opacity-0 transition-opacity duration-300 group-hover:opacity-10"></div>
      
      <img 
        v-if="fetchedBanner" 
        loading="lazy" 
        :src="fetchedBanner" 
        :alt="instance.node_name"
        class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div v-else class="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30"></div>

      <!-- アイコンバッジ -->
      <div class="absolute bottom-3 mx-3 flex items-center gap-2 rounded bg-white/90 dark:bg-slate-800/90 px-2 py-1 backdrop-blur border border-primary/50">
        <img 
          v-if="fetchedIcon" 
          :src="fetchedIcon" 
          class="h-5 w-5 rounded"
        />
        <div 
          v-else 
          class="h-5 w-5 rounded bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold"
        >
          {{ (instance.node_name || instance.id).charAt(0).toUpperCase() }}
        </div>
        <span class="font-mono text-xs text-gray-500 dark:text-slate-400 line-clamp-1 whitespace-nowrap overflow-hidden text-ellipsis">v{{ instance.version }}</span>
      </div>
    </div>

    <!-- コンテンツエリア -->
    <div class="flex flex-1 flex-col p-4 md:p-5">
      <!-- タイトル -->
      <h3 class="mb-3 text-lg transition-colors group-hover:text-primary leading-[1.5] line-clamp-1">
        {{ instance.node_name || instance.id }}
      </h3>

      <!-- サマリー -->
      <p class="mb-4 flex-1 text-sm leading-relaxed text-gray-500 dark:text-slate-400 line-clamp-3">
        <span v-if="loadingDescription" class="text-gray-400 dark:text-slate-500">読み込み中...</span>
        <span v-else>{{ description || instance.id }}</span>
      </p>

      <!-- 統計情報 -->
      <div class="mb-3 flex flex-wrap gap-2">
        <span class="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/30">
          Users: {{ formatNumber(instance.users_count) }}
        </span>
        <span class="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/30">
          Notes: {{ formatNumber(instance.notes_count) }}
        </span>
        <span 
          class="text-[10px] px-2 py-0.5 rounded-full border"
          :class="instance.is_alive ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'"
        >
          Status: {{ instance.is_alive ? 'Online' : 'Offline' }}
        </span>
      </div>

      <!-- 続きを読む -->
      <div class="mt-auto flex items-center justify-between border-t border-gray-100 dark:border-slate-700 pt-4">
        <span class="text-xs text-gray-400 dark:text-slate-500 transition-colors group-hover:text-primary">サーバーを見る</span>
        <div class="flex h-7 w-7 items-center justify-center rounded-full bg-gray-50 dark:bg-slate-700 text-gray-600 dark:text-slate-300 transition-colors group-hover:bg-primary group-hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  </NuxtLink>

  <!-- リスト表示 -->
  <div v-else-if="view === 'list'" class="relative">
    <NuxtLink
      :to="`https://${instance.id}`" 
      target="_blank"
      rel="noopener noreferrer"
      class="slide-hover block p-4 rounded-lg"
    >
      <div class="flex flex-col md:flex-row gap-4 h-full">
        <!-- 画像コンテナ -->
        <div class="md:w-1/3 w-full md:flex-shrink-0 md:min-w-[200px]">
          <div class="relative w-full overflow-hidden rounded-lg aspect-video">
            <img 
              v-if="fetchedBanner" 
              loading="lazy" 
              :src="fetchedBanner" 
              :alt="instance.node_name"
              class="object-cover transition-transform duration-300 hover:scale-105 rounded-lg w-full h-full"
            />
            <div 
              v-else 
              class="w-full h-full bg-gradient-to-br from-primary/30 to-accent/30 rounded-lg flex items-center justify-center"
            >
              <img 
                v-if="fetchedIcon" 
                :src="fetchedIcon" 
                class="h-12 w-12 rounded"
              />
              <div 
                v-else 
                class="h-12 w-12 rounded bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xl font-bold"
              >
                {{ (instance.node_name || instance.id).charAt(0).toUpperCase() }}
              </div>
            </div>
            <!-- バージョンバッジ -->
            <div class="absolute top-2 right-2 rounded bg-white/90 dark:bg-slate-800/90 px-1.5 py-0.5 backdrop-blur border border-gray-200 dark:border-slate-600">
              <span class="font-mono text-[10px] text-gray-600 dark:text-slate-400 line-clamp-1 whitespace-nowrap overflow-hidden text-ellipsis">v{{ instance.version }}</span>
            </div>
          </div>
        </div>

        <!-- テキストコンテンツ -->
        <div class="w-full flex flex-col justify-between h-full md:flex-1 md:min-w-0">
          <div>
            <div class="flex items-center gap-2 mb-2">
              <img 
                v-if="fetchedIcon" 
                :src="fetchedIcon" 
                class="h-6 w-6 rounded flex-shrink-0"
              />
              <div 
                v-else 
                class="h-6 w-6 rounded bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              >
                {{ (instance.node_name || instance.id).charAt(0).toUpperCase() }}
              </div>
              <h3 class="text-lg font-medium text-gray-800 dark:text-slate-100 whitespace-nowrap overflow-hidden text-ellipsis">
                {{ instance.node_name || instance.id }}
              </h3>
            </div>
            <p class="text-gray-600 dark:text-slate-400 text-sm mb-2 overflow-hidden line-clamp-2">
              <span v-if="loadingDescription" class="text-gray-400 dark:text-slate-500">読み込み中...</span>
              <span v-else>{{ description || instance.id }}</span>
            </p>

            <div class="flex flex-wrap gap-2 mt-4">
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/30">
                Users: {{ formatNumber(instance.users_count) }}
              </span>
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/30">
                Notes: {{ formatNumber(instance.notes_count) }}
              </span>
              <span 
                class="text-[10px] px-2 py-0.5 rounded-full border"
                :class="instance.is_alive ? 'bg-green-50 text-green-600 border-green-200' : 'bg-red-50 text-red-600 border-red-200'"
              >
                Status: {{ instance.is_alive ? 'Online' : 'Offline' }}
              </span>
            </div>
          </div>

          <div class="w-full flex justify-end pt-4">
            <span class="text-accent text-sm inline-flex items-center gap-1">
              サーバーを見る
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  instance: Instance;
  view?: 'grid' | 'list';
}>(), {
  view: 'grid',
});

const { instance } = toRefs(props);

const fetchedIcon = ref<string | null>(null);
const fetchedBanner = ref<string | null>(null);

function getProxiedUrl(url: string): string {
  return `/api/image?url=${encodeURIComponent(url)}`;
}

function resolveUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  // はなみは強制的にプロキシ
  if (url.includes('misskey.flowers') || props.instance.id === 'misskey.flowers') {
    return getProxiedUrl(url);
  }
  return url;
}

function updateImages() {
  fetchedIcon.value = resolveUrl(props.instance.icon_url);
  fetchedBanner.value = resolveUrl(props.instance.banner_url);
}

// 説明文の状態
const description = ref<string>('');
const loadingDescription = ref(true);

/**
 * 数値をフォーマット
 */
function formatNumber(num: number | undefined | null): string {
  if (!num) return '0';
  if (num >= 100000) {
    return new Intl.NumberFormat('ja-JP', { notation: 'compact', maximumFractionDigits: 1 }).format(num);
  }
  return new Intl.NumberFormat('ja-JP').format(num);
}

/**
 * HTMLタグを除去
 */
function stripTags(str: string): string {
  if (!import.meta.client) {
    return str;
  }
  const doc = new DOMParser().parseFromString(str, 'text/html');
  return doc.body.textContent || '';
}

/**
 * 説明文と画像を更新
 */
async function updateDescription() {
  if (!props.instance) {
    description.value = '';
    loadingDescription.value = false;
    return;
  }
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`/api/meta?host=${props.instance.id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (res.ok) {
      const meta = await res.json();
      if (meta.description) description.value = stripTags(meta.description);
      
      if (meta.iconUrl) {
          fetchedIcon.value = resolveUrl(meta.iconUrl);
      }
      if (meta.bannerUrl) {
          fetchedBanner.value = resolveUrl(meta.bannerUrl || meta.backgroundImageUrl);
      }
    }
  } catch {
    // エラーは無視
  } finally {
    loadingDescription.value = false;
  }
}

// インスタンス変更時に実行
watch(instance, () => {
  updateImages();
  updateDescription();
}, { immediate: true });
</script>

<style scoped>
/* スライドホバーエフェクト */
.slide-hover {
  position: relative;
  overflow: hidden;
}

.slide-hover::before {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: white;
  transform: translateX(-100%);
  opacity: 0;
  z-index: 0;
  border-radius: 0.5rem;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-hover:hover::before {
  transform: translateX(0);
  opacity: 1;
}

.slide-hover > * {
  position: relative;
  z-index: 1;
}
</style>
