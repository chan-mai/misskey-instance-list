<template>
  <section class="relative min-h-[80vh] lg:min-h-screen flex items-center justify-center overflow-hidden">
    <div class="absolute inset-0 bg-neutral-100 dark:bg-black">
      <div class="absolute inset-0 opacity-30 dark:opacity-50">
        <div
          class="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent animate-pulse-slow">
        </div>
        <div
          class="absolute inset-0 bg-gradient-to-tl from-accent/10 via-transparent to-transparent animate-pulse-slow animation-delay-1000">
        </div>
      </div>
      <!-- Grid  -->
      <div
        class="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.03)_1px,transparent_1px)] bg-[size:64px_64px]">
      </div>

      <GeometricGraphic />
    </div>

    <div class="relative z-10 container mx-auto max-w-screen-xl px-6 py-20">
      <div class="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div class="text-center lg:text-left">
          <h1
            class="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-neutral-900 dark:text-white mb-8 leading-none tracking-tight">
            <span class="block">Find Your</span>
            <span class="block mt-2 text-primary">Misskey Server</span>
          </h1>
          <p
            class="text-lg sm:text-xl text-neutral-600 dark:text-white/60 mb-12 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
            あなたにぴったりなMisskeyサーバーを見つけよう。
          </p>

          <NuxtLink to="/servers"
            class="inline-flex items-center justify-center gap-3 px-10 py-5 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-medium tracking-widest uppercase hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-colors duration-300">
            サーバーを見つける
            <Icon name="lucide:arrow-right" class="w-5 h-5" />
          </NuxtLink>
        </div>

        <!-- Stats -->
        <div class="hidden lg:block mt-12 lg:mt-0 w-full">
          <div class="grid grid-cols-2 max-w-lg mx-auto lg:ml-auto lg:mr-0">
            <div class="p-6 sm:p-8 text-center border-r-2 border-b-2 border-neutral-300 dark:border-white/30">
              <p class="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white">{{ stats?.counts?.active ?
                formatNumber(stats.counts.active) : '-' }}</p>
              <p class="text-xs text-neutral-500 dark:text-white/50 tracking-widest uppercase mt-2">Active</p>
            </div>
            <div class="p-6 sm:p-8 text-center border-b-2 border-neutral-300 dark:border-white/30">
              <p class="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white">{{ stats?.counts?.known ?
                formatNumber(stats.counts.known) : '-' }}</p>
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

    <!-- Scroll Poyon Poyon -->
    <div
      class="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-neutral-400 dark:text-white/40">
      <span class="text-xs tracking-widest uppercase">Scroll</span>
      <div class="w-px h-12 bg-gradient-to-b from-neutral-400 dark:from-white/40 to-transparent animate-bounce"></div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  stats?: {
    counts: {
      active: number;
      known: number;
    };
    repositories: Array<{
      url: string;
      name: string | null;
      count: number;
    }>;
    languages?: Array<{
      code: string;
      count: number;
    }>;
  };
}>();

const formatNumber = (num: number | undefined | null) => {
  if (num == null) return '-';
  if (num >= 100000) {
    return new Intl.NumberFormat('ja-JP', { notation: 'compact', maximumFractionDigits: 1 }).format(num);
  }
  return new Intl.NumberFormat('ja-JP').format(num);
};
</script>

<style scoped>
@keyframes pulse-slow {

  0%,
  100% {
    opacity: 0.3;
  }

  50% {
    opacity: 0.5;
  }
}

.animate-pulse-slow {
  animation: pulse-slow 4s ease-in-out infinite;
}

.animation-delay-1000 {
  animation-delay: 1s;
}
</style>
