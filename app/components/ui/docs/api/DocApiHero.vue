<script setup lang="ts">
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface Props {
    method: HttpMethod;
    endpoint: string;
    description: string;
    backLink?: string;
    backLabel?: string;
}

withDefaults(defineProps<Props>(), {
    backLink: '/docs/api/v1',
    backLabel: 'API Documentation'
});

const methodColors: Record<HttpMethod, { bg: string; text: string; border: string }> = {
    GET: { bg: 'bg-green-500/10', text: 'text-green-600 dark:text-green-400', border: 'border-green-500/20' },
    POST: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/20' },
    PUT: { bg: 'bg-yellow-500/10', text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-500/20' },
    PATCH: { bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-500/20' },
    DELETE: { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', border: 'border-red-500/20' }
};
</script>

<template>
    <section class="min-h-[50vh] relative flex items-center bg-neutral-100 dark:bg-black">
        <div class="container mx-auto max-w-screen-xl px-6 py-24">
            <NuxtLink :to="backLink"
                class="inline-flex items-center gap-2 text-neutral-500 dark:text-neutral-400 hover:text-primary text-sm mb-8 transition-colors">
                <Icon name="lucide:chevron-left" class="h-4 w-4" />
                {{ backLabel }}
            </NuxtLink>

            <div class="flex items-center gap-4 mb-6">
                <span class="px-4 py-2 text-sm font-mono font-bold border"
                    :class="[methodColors[method].bg, methodColors[method].text, methodColors[method].border]">
                    {{ method }}
                </span>
                <h1 class="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white font-mono">{{ endpoint }}
                </h1>
            </div>
            <p class="text-neutral-600 dark:text-neutral-400 max-w-2xl">
                {{ description }}
            </p>
        </div>
    </section>
</template>
