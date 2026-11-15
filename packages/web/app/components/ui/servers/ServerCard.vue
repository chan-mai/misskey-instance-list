<template>
	<NuxtLink
		:to="instanceUrl"
		target="_blank"
		rel="noopener noreferrer"
		class="group relative block overflow-hidden bg-neutral-100 dark:bg-neutral-900 transition-all duration-300 hover:scale-[1.005] focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
		:class="view === 'list' ? 'h-48' : ''"
	>
		<div
			class="relative overflow-hidden"
			:class="view === 'list' ? 'absolute inset-0 w-full h-full' : 'aspect-[10/12] lg:aspect-[4/3] w-full'"
		>
			<img
				v-if="bannerSrc"
				ref="bannerImg"
				loading="lazy"
				:src="bannerSrc"
				:alt="instance.name || instance.host || 'Server banner'"
				class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
				@error="bannerSrc = fallbackSrc(bannerSrc, instance.banner_url)"
			/>
			<div v-else class="absolute inset-0 bg-neutral-800 flex items-center justify-center">
				<div class="text-neutral-600 text-center">
					<Icon name="lucide:image" class="w-12 h-12 mx-auto mb-2" />
				</div>
			</div>
			<div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
		</div>

		<div
			:class="
				view === 'list'
					? 'absolute inset-0 z-10 p-4 flex flex-col justify-end gap-2'
					: 'absolute inset-0 p-3 flex flex-col justify-between lg:justify-end gap-2 sm:p-4'
			"
		>
			<div>
				<div class="flex flex-col items-start gap-2 mb-0">
					<img
						v-if="iconSrc"
						ref="iconImg"
						:src="iconSrc"
						class="w-8 h-8 bg-white/10 backdrop-blur-sm shadow-sm"
						alt=""
						@error="iconSrc = fallbackSrc(iconSrc, instance.icon_url)"
					/>
					<div v-else class="w-8 h-8 bg-primary flex items-center justify-center text-white text-sm font-bold shadow-sm">
						{{ (instance.name || instance.host).charAt(0).toUpperCase() }}
					</div>
					<div class="w-full min-w-0">
						<h3 class="font-bold truncate transition-colors text-white group-hover:text-primary text-sm sm:text-base">
							{{ instance.name || instance.host }}
						</h3>
						<div class="text-[10px] font-mono text-white/70 flex flex-wrap gap-x-1 items-baseline w-full">
							<span class="truncate max-w-full">{{ instance.host }}</span>
							<span class="truncate max-w-full opacity-80 decoration-dotted whitespace-nowrap">(v{{ instance.version }})</span>
						</div>
					</div>
				</div>
			</div>

			<div>
				<p class="text-xs line-clamp-2 mb-3 text-white/80">
					{{ description || instance.host }}
				</p>

				<div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-medium text-white/60">
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
					<span
						class="flex items-center gap-1"
						:class="instance.is_alive ? 'text-green-500' : 'text-red-500'"
						:title="instance.is_alive ? 'Online' : 'Offline'"
					>
						<span class="w-1.5 h-1.5 rounded-full" :class="instance.is_alive ? 'bg-green-500' : 'bg-red-500'"></span>
						{{ instance.is_alive ? 'Online' : 'Offline' }}
					</span>
				</div>
			</div>
		</div>
		<div
			class="absolute top-3 right-3 w-8 h-8 flex items-center justify-center bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
		>
			<Icon name="lucide:external-link" class="w-4 h-4 text-white" />
		</div>
	</NuxtLink>
</template>

<script setup lang="ts">
import { htmlToText } from '~~/shared/utils/text';

const { formatNumber, getLanguageName } = useFormat();

const props = defineProps<{
	instance: Instance;
	view?: 'grid' | 'list';
}>();

// 属性値内の//はvue-tsc誤変換(vuejs/language-tools#6322)
const instanceUrl = computed(() => `https://${props.instance.host}`);

const description = computed(() => (props.instance.description ? htmlToText(props.instance.description) : ''));

const iconSrc = ref<string | null>(props.instance.icon_url);
const bannerSrc = ref<string | null>(props.instance.banner_url);

watch(
	() => props.instance,
	instance => {
		iconSrc.value = instance.icon_url;
		bannerSrc.value = instance.banner_url;
	},
);

// 直接取得失敗時プロキシ, プロキシ失敗時非表示
function fallbackSrc(current: string | null, original: string | null): string | null {
	if (!original || current !== original) return null;
	return `/api/image?url=${encodeURIComponent(original)}`;
}

const iconImg = ref<HTMLImageElement | null>(null);
const bannerImg = ref<HTMLImageElement | null>(null);

// ハイドレーション前に失敗した画像の検出
onMounted(() => {
	if (iconImg.value?.complete && iconImg.value.naturalWidth === 0) iconSrc.value = fallbackSrc(iconSrc.value, props.instance.icon_url);
	if (bannerImg.value?.complete && bannerImg.value.naturalWidth === 0) {
		bannerSrc.value = fallbackSrc(bannerSrc.value, props.instance.banner_url);
	}
});
</script>
