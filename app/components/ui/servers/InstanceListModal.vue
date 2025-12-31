<script setup lang="ts">
const { formatNumber } = useFormat();

interface Props {
    modelValue: boolean;
    title: string;
    type: 'active' | 'excluded';
    loading: boolean;
    items: { domain: string; reason: string | null }[];
    instances: Instance[];
    hasMore: boolean;
    loadingMore: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    'update:modelValue': [value: boolean];
    'load-more': [];
}>();

const isOpen = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
});

const expandedItems = reactive(new Set<string>());

function toggleReason(domain: string) {
    if (expandedItems.has(domain)) {
        expandedItems.delete(domain);
    } else {
        expandedItems.add(domain);
    }
}
</script>

<template>
    <BaseModal v-model="isOpen" @close="isOpen = false">
        <template #title>
            {{ title }}
            <span v-if="type === 'active' && instances.length > 0" class="ml-2 text-sm font-normal text-neutral-500">
                ({{ formatNumber(instances.length) }})
            </span>
            <span v-else-if="items.length > 0" class="ml-2 text-sm font-normal text-neutral-500">
                ({{ formatNumber(items.length) }})
            </span>
        </template>

        <div v-if="loading" class="py-12 flex justify-center">
            <div
                class="w-8 h-8 border-2 border-neutral-300 dark:border-neutral-600 border-t-primary animate-spin rounded-full">
            </div>
        </div>

        <div v-else>
            <ul v-if="type === 'excluded'"
                class="divide-y divide-neutral-200 dark:divide-neutral-800">
                <li v-for="item in items" :key="item.domain" class="py-4">
                    <div class="relative flex items-center justify-between min-h-[52px]">
                        <span class="text-sm text-neutral-900 dark:text-white font-mono select-all">{{ item.domain
                        }}</span>
                        <div v-if="item.reason">
                            <span
                                class="hidden sm:inline text-xs text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-1 max-w-xs truncate block"
                                :title="item.reason">
                                {{ item.reason }}
                            </span>
                            <button v-if="!expandedItems.has(item.domain)"
                                class="sm:hidden text-xs px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 font-normal hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                                @click="toggleReason(item.domain)">
                                REASON
                            </button>
                        </div>

                        <!-- Mobile Expanded Reason Overlay -->
                        <div v-if="expandedItems.has(item.domain)"
                            class="absolute inset-0 z-10 flex items-center justify-between px-2 bg-white dark:bg-neutral-900 sm:hidden border border-neutral-200 dark:border-neutral-800 shadow-sm">
                            <span class="text-xs text-neutral-600 dark:text-neutral-300 break-all mr-2 flex-1">
                                {{ item.reason }}
                            </span>
                            <button
                                class="text-xs px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-500 font-normal hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors whitespace-nowrap"
                                @click="toggleReason(item.domain)">
                                閉じる
                            </button>
                        </div>
                    </div>
                </li>
            </ul>

            <div v-else class="grid gap-px bg-neutral-200 dark:bg-neutral-800">
                <NuxtLink v-for="instance in instances" :key="instance.id" :to="`https://${instance.id}`"
                    target="_blank" rel="noopener noreferrer"
                    class="flex items-center gap-4 p-4 bg-back dark:bg-back-dark hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors group">
                    <img v-if="instance.icon_url" :src="instance.icon_url"
                        class="w-10 h-10 bg-neutral-100 dark:bg-neutral-800 object-cover" loading="lazy"
                        @error="(e) => (e.target as HTMLImageElement).src = 'https://placehold.co/40x40?text=?'" />
                    <div v-else class="w-10 h-10 bg-primary flex items-center justify-center text-white font-bold">
                        {{ (instance.node_name || instance.id).charAt(0).toUpperCase() }}
                    </div>

                    <div class="min-w-0 flex-1">
                        <div class="flex items-center gap-2">
                            <h4
                                class="font-bold text-neutral-900 dark:text-white truncate group-hover:text-primary transition-colors">
                                <span class="sm:hidden">{{ (instance.node_name || instance.id).length > 15 ?
                                    (instance.node_name
                                        || instance.id).slice(0, 15) + '...' : (instance.node_name || instance.id) }}</span>
                                <span class="hidden sm:inline">{{ instance.node_name || instance.id }}</span>
                            </h4>
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

                <div v-if="hasMore" class="p-4 text-center bg-back dark:bg-back-dark">
                    <button @click="$emit('load-more')" :disabled="loadingMore"
                        class="text-sm text-primary disabled:opacity-50 disabled:cursor-not-allowed hover:underline transition-colors">
                        <span v-if="loadingMore">読み込み中...</span>
                        <span v-else>もっと見る →</span>
                    </button>
                </div>
                <div v-if="!hasMore && instances.length > 0"
                    class="p-4 text-center text-xs text-neutral-400 bg-back dark:bg-back-dark">
                    すべてのサーバーを表示しました
                </div>
            </div>
        </div>
    </BaseModal>


</template>
