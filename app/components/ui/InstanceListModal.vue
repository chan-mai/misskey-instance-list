<script setup lang="ts">
import type { ModalItem } from '~/types/api';
import { formatNumber } from '~/utils/format';

interface Props {
    modelValue: boolean;
    title: string;
    type: 'active' | 'denied' | 'ignored';
    loading: boolean;
    items: ModalItem[];
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
            <div class="w-8 h-8 border-2 border-neutral-300 dark:border-neutral-600 border-t-primary animate-spin">
            </div>
        </div>

        <div v-else>
            <ul v-if="type === 'denied' || type === 'ignored'"
                class="divide-y divide-neutral-200 dark:divide-neutral-800">
                <li v-for="item in items" :key="item.domain" class="py-4">
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-neutral-900 dark:text-white font-mono select-all">{{ item.domain
                            }}</span>
                        <span v-if="item.reason"
                            class="text-xs text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2 py-1">{{
                                item.reason }}</span>
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
