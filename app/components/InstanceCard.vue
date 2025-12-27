<template>
  <!-- Chronicle.city style card -->
  <NuxtLink
    :to="`https://${instance.id}`"
    target="_blank"
    rel="noopener noreferrer"
    class="group relative block overflow-hidden bg-neutral-100 dark:bg-neutral-900 transition-all duration-300 hover:scale-[1.01] focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
  >
    <!-- Image area with overlay -->
    <div class="relative aspect-[4/3] w-full overflow-hidden">
      <img 
        v-if="fetchedBanner" 
        loading="lazy" 
        :src="fetchedBanner" 
        :alt="instance.node_name"
        class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div v-else class="absolute inset-0 bg-neutral-800 flex items-center justify-center">
        <div class="text-neutral-600 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
      </div>

      <!-- Gradient overlay -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

      <!-- Content overlay -->
      <div class="absolute inset-0 p-4 flex flex-col justify-end">
        <!-- Icon and name -->
        <div class="flex items-center gap-2.5 mb-2">
          <img 
            v-if="fetchedIcon" 
            :src="fetchedIcon" 
            class="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-sm shadow-sm"
            alt=""
          />
          <div 
            v-else 
            class="w-8 h-8 bg-primary flex items-center justify-center text-white text-sm font-bold rounded-sm shadow-sm"
          >
            {{ (instance.node_name || instance.id).charAt(0).toUpperCase() }}
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-base font-bold text-white truncate group-hover:text-primary transition-colors drop-shadow-md">
              {{ instance.node_name || instance.id }}
            </h3>
            <p class="text-[10px] text-white/70 font-mono drop-shadow-sm">v{{ instance.version }}</p>
          </div>
        </div>

        <!-- Description -->
        <p class="text-xs text-white/80 line-clamp-2 mb-3 drop-shadow-sm">
          <span v-if="loadingDescription" class="text-white/50">Loading...</span>
          <span v-else>{{ description || instance.id }}</span>
        </p>

        <!-- Stats row -->
        <div class="flex items-center gap-3 text-[10px] text-white/60 font-medium drop-shadow-sm">
          <span class="flex items-center gap-1" title="Users">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
            {{ formatNumber(instance.users_count) }}
          </span>
          <span class="flex items-center gap-1" title="Notes">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            {{ formatNumber(instance.notes_count) }}
          </span>
          <span 
            class="flex items-center gap-1"
            :class="instance.is_alive ? 'text-green-400' : 'text-red-400'"
            :title="instance.is_alive ? 'Online' : 'Offline'"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="instance.is_alive ? 'bg-green-400' : 'bg-red-400'"></span>
            {{ instance.is_alive ? 'Online' : 'Offline' }}
          </span>
        </div>
      </div>

      <!-- Hover arrow indicator -->
      <div class="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
import { useFormat } from '~/composables/useFormat';

const props = defineProps<{
  instance: Instance;
}>();

const { formatNumber } = useFormat();

const fetchedIcon = ref<string | null>(null);
const fetchedBanner = ref<string | null>(null);

function getProxiedUrl(url: string): string {
  return `/api/image?url=${encodeURIComponent(url)}`;
}

async function resolveUrl(url: string | null | undefined): Promise<string | null> {
  if (!url) return null;
  
  // GETリクエストを送ってみる
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s

    const res = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      // 200 OK ならそのまま使用
      return url;
    }
  } catch (error) {
    // CORSエラー、タイムアウト、ネットワークエラーなどはプロキシを使用
    console.debug(`Direct fetch failed for ${url}, falling back to proxy:`, error);
  }

  // 200以外、またはエラーの場合はプロキシを使用
  return getProxiedUrl(url);
}

async function updateImages() {
  const icon = await resolveUrl(props.instance.icon_url);
  fetchedIcon.value = icon;
  
  const banner = await resolveUrl(props.instance.banner_url);
  fetchedBanner.value = banner;
}

// 説明文の状態
const description = ref<string>('');
const loadingDescription = ref(true);

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
      const meta = await res.json() as { description?: string, iconUrl?: string, bannerUrl?: string, backgroundImageUrl?: string };
      if (meta.description) description.value = stripTags(meta.description);
      
      if (meta.iconUrl) {
          const resolved = await resolveUrl(meta.iconUrl);
          fetchedIcon.value = resolved;
      }
      if (meta.bannerUrl || meta.backgroundImageUrl) {
          const resolved = await resolveUrl(meta.bannerUrl || meta.backgroundImageUrl);
          fetchedBanner.value = resolved;
      }
    }
  } catch {
    // エラーは無視
  } finally {
    loadingDescription.value = false;
  }
}

// インスタンス変更時に実行
watch(() => props.instance, () => {
  updateImages();
  updateDescription();
}, { immediate: true });

function getLanguageName(code: string) {
  try {
    const name = new Intl.DisplayNames(['ja'], { type: 'language' }).of(code);
    if (name && name !== code) {
      return name;
    }
  } catch {
    // ignore
  }
  return code;
}
</script>
