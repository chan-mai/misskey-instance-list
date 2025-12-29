<template>
  <NuxtLink :to="`https://${instance.id}`" target="_blank" rel="noopener noreferrer"
    class="group relative block overflow-hidden bg-neutral-100 dark:bg-neutral-900 transition-all duration-300 hover:scale-[1.005] focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
    :class="view === 'list' ? 'h-40' : ''">

    <div class="relative overflow-hidden"
      :class="view === 'list' ? 'absolute inset-0 w-full h-full' : 'aspect-[4/3] w-full'">
      <img v-if="fetchedBanner" loading="lazy" :src="fetchedBanner" :alt="instance.node_name || ''"
        class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
      <div v-else class="absolute inset-0 bg-neutral-800 flex items-center justify-center">
        <div class="text-neutral-600 text-center">
          <Icon name="lucide:image" class="w-12 h-12 mx-auto mb-2" />
        </div>
      </div>
      <div :class="view === 'list' ? '' : ''"
        class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
      </div>
    </div>

    <div
      :class="view === 'list' ? 'absolute inset-0 z-10 p-4 flex flex-col justify-end' : 'absolute inset-0 p-4 flex flex-col justify-end'">
      <div>
        <div class="flex items-center gap-2.5 mb-2">
          <img v-if="fetchedIcon" :src="fetchedIcon" class="w-8 h-8 bg-white/10 backdrop-blur-sm shadow-sm" alt="" />
          <div v-else
            class="w-8 h-8 bg-primary flex items-center justify-center text-white text-sm font-bold shadow-sm">
            {{ (instance.node_name || instance.id).charAt(0).toUpperCase() }}
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="text-base font-bold truncate transition-colors text-white group-hover:text-primary">
              {{ instance.node_name || instance.id }}
            </h3>
            <p class="text-[10px] font-mono text-white/70">
              {{ instance.id }} (v{{ instance.version }})
            </p>
          </div>
        </div>
        <p class="text-xs line-clamp-2 mb-3 text-white/80">
          <span v-if="loadingDescription" class="opacity-50">Loading...</span>
          <span v-else>{{ description || instance.id }}</span>
        </p>
      </div>

      <div class="flex items-center gap-3 text-[10px] font-medium text-white/60">
        <span class="flex items-center gap-1" title="Users">
          <Icon name="lucide:users" class="w-3.5 h-3.5" />
          {{ formatNumber(instance.users_count) }}
        </span>
        <span class="flex items-center gap-1" title="Notes">
          <Icon name="lucide:file-text" class="w-3.5 h-3.5" />
          {{ formatNumber(instance.notes_count) }}
        </span>
        <span v-if="instance.language" class="flex items-center gap-1" title="Language">
          <Icon name="lucide:globe" class="w-3.5 h-3.5" />
          {{ getLanguageName(instance.language) }}
        </span>
        <span class="flex items-center gap-1" :class="instance.is_alive ? 'text-green-500' : 'text-red-500'"
          :title="instance.is_alive ? 'Online' : 'Offline'">
          <span class="w-1.5 h-1.5 rounded-full" :class="instance.is_alive ? 'bg-green-500' : 'bg-red-500'"></span>
          {{ instance.is_alive ? 'Online' : 'Offline' }}
        </span>
      </div>
    </div>
    <div
      class="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
      <Icon name="lucide:external-link" class="w-4 h-4 text-white" />
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
const { formatNumber, getLanguageName } = useFormat();

const props = defineProps<{
  instance: Instance;
  view?: 'grid' | 'list';
}>();

const fetchedIcon = ref<string | null>(null);
const fetchedBanner = ref<string | null>(null);

function getProxiedUrl(url: string): string {
  return `/api/image?url=${encodeURIComponent(url)}`;
}

async function resolveUrl(url: string | null | undefined): Promise<string | null> {
  if (!url) return null;


  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s

    const res = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      return url;
    }
  } catch (error) {

    console.debug(`Direct fetch failed for ${url}, falling back to proxy:`, error);
  }


  return getProxiedUrl(url);
}

async function updateImages() {
  const icon = await resolveUrl(props.instance.icon_url);
  fetchedIcon.value = icon;

  const banner = await resolveUrl(props.instance.banner_url);
  fetchedBanner.value = banner;
}

const description = ref<string>('');
const loadingDescription = ref(true);


function stripTags(str: string): string {
  if (!import.meta.client) {
    return str;
  }
  const doc = new DOMParser().parseFromString(str, 'text/html');
  return doc.body.textContent || '';
}


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
    // ignore
  } finally {
    loadingDescription.value = false;
  }
}


watch(() => props.instance, () => {
  updateImages();
  updateDescription();
}, { immediate: true });


</script>
