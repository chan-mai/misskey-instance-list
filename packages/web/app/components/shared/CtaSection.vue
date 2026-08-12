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
                        <Icon name="lucide:arrow-right" class="w-5 h-5" />
                    </NuxtLink>
                </div>

                <div class="hidden lg:block lg:w-1/2 w-full max-w-lg">
                    <div class="hidden lg:block mt-12 lg:mt-0 w-full">
                      <div class="grid grid-cols-2 max-w-lg mx-auto lg:ml-auto lg:mr-0">
                        <div class="p-6 sm:p-8 text-center border-r-2 border-b-2 border-neutral-300 dark:border-white/30">
                          <p class="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white">{{
                            formatNumber(stats?.counts?.active) }}</p>
                          <p class="text-xs text-neutral-500 dark:text-white/50 tracking-widest uppercase mt-2">Active</p>
                        </div>
                        <div class="p-6 sm:p-8 text-center border-b-2 border-neutral-300 dark:border-white/30">
                          <p class="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white">{{
                            formatNumber(stats?.counts?.known) }}</p>
                          <p class="text-xs text-neutral-500 dark:text-white/50 tracking-widest uppercase mt-2">Known</p>
                        </div>
                        <div class="p-6 sm:p-8 text-center border-r-2 border-neutral-300 dark:border-white/30">
                          <p class="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white">{{ stats?.repositories?.length
                            || '-' }}</p>
                          <p class="text-xs text-neutral-500 dark:text-white/50 tracking-widest uppercase mt-2">Software</p>
                        </div>
                        <div class="p-6 sm:p-8 text-center">
                          <p class="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white">{{ stats?.languages?.length ||
                            '-' }}</p>
                          <p class="text-xs text-neutral-500 dark:text-white/50 tracking-widest uppercase mt-2">Languages</p>
                        </div>
                      </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
