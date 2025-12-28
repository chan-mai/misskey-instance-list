<script setup lang="ts">
const { formatNumber } = useFormat();

interface Props {
    stats?: StatsResponse | null;
}

defineProps<Props>();
</script>

<template>
    <section class="py-24 bg-neutral-100 dark:bg-black transition-colors duration-300">
        <div class="container mx-auto max-w-screen-xl px-6">
            <div class="flex flex-col lg:flex-row items-center justify-between gap-16">
                <div class="lg:w-1/2 text-center lg:text-left">
                    <h2 class="text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-white mb-6">
                        Let's find your server.
                    </h2>
                    <p class="text-lg text-neutral-600 dark:text-white/60 mb-10 max-w-xl mx-auto lg:mx-0">
                        あなたにぴったりのMisskeyサーバーを見つけよう。
                    </p>

                    <NuxtLink to="/servers"
                        class="inline-flex items-center gap-3 px-10 py-5 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-medium tracking-widest uppercase hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-colors duration-300">
                        サーバーを見つける
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </NuxtLink>
                </div>

                <div class="hidden lg:block lg:w-1/2 w-full max-w-lg">
                    <div class="grid grid-cols-2 gap-6">
                        <div class="bg-white dark:bg-neutral-900 p-8 rounded-2xl shadow-sm">
                            <p class="text-4xl font-bold text-neutral-900 dark:text-white mb-2">{{
                                formatNumber(stats?.counts?.active) }}</p>
                            <p class="text-xs text-neutral-500 dark:text-neutral-400 tracking-widest uppercase">Active
                            </p>
                        </div>
                        <div class="bg-white dark:bg-neutral-900 p-8 rounded-2xl shadow-sm">
                            <p class="text-4xl font-bold text-neutral-900 dark:text-white mb-2">{{
                                formatNumber(stats?.counts?.known) }}</p>
                            <p class="text-xs text-neutral-500 dark:text-neutral-400 tracking-widest uppercase">Known
                            </p>
                        </div>
                        <div class="bg-white dark:bg-neutral-900 p-8 rounded-2xl shadow-sm">
                            <p class="text-4xl font-bold text-neutral-900 dark:text-white mb-2">{{
                                stats?.repositories?.length ?? '-' }}</p>
                            <p class="text-xs text-neutral-500 dark:text-neutral-400 tracking-widest uppercase">Software
                            </p>
                        </div>
                        <div class="bg-white dark:bg-neutral-900 p-8 rounded-2xl shadow-sm">
                            <p class="text-4xl font-bold text-neutral-900 dark:text-white mb-2">{{
                                stats?.languages?.length ?? '-' }}</p>
                            <p class="text-xs text-neutral-500 dark:text-neutral-400 tracking-widest uppercase">
                                Languages</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
