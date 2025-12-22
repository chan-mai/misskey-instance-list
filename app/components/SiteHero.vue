<template>
  <section class="relative overflow-hidden py-20 lg:py-28">
    <!-- 背景グラデーション -->
    <div class="absolute inset-0 bg-gradient-to-br from-primary/10 via-white to-accent/10 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900"></div>
    
    <!-- 装飾パターン -->
    <div class="absolute inset-0 opacity-30">
      <div class="absolute top-10 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl"></div>
      <div class="absolute bottom-10 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl"></div>
    </div>

    <div class="relative container mx-auto max-w-screen-xl px-6">
      <div class="flex flex-col lg:flex-row items-center justify-between gap-12">
        <!-- テキスト部分 -->
        <div class="text-center lg:text-left max-w-2xl">
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            {{ serverCount }} servers available
          </div>
          
          <h1 class="text-4xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
            Find Your Perfect
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              Misskey Instance
            </span>
          </h1>
          
          <p class="text-lg lg:text-xl text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
            Misskeyの世界を探索しよう。様々なインスタンスから、あなたに合ったコミュニティを見つけてみませんか。
          </p>
          
          <div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <NuxtLink
              to="#instances" 
              class="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-primary text-white font-semibold shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300"
            >
              Find Instances
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </NuxtLink>
          </div>
        </div>
        
        <!-- 統計カード -->
        <div class="relative">
          <!-- ドット装飾 -->
          <div class="absolute -top-4 -left-4 w-24 h-24">
            <svg viewBox="0 0 100 100" class="w-full h-full text-primary/30">
              <pattern id="hero-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="4" cy="4" r="2" fill="currentColor"/>
              </pattern>
              <rect width="100" height="100" fill="url(#hero-dots)"/>
            </svg>
          </div>
          <div class="absolute -bottom-4 -right-4 w-24 h-24">
            <svg viewBox="0 0 100 100" class="w-full h-full text-accent/30">
              <pattern id="hero-dots2" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="4" cy="4" r="2" fill="currentColor"/>
              </pattern>
              <rect width="100" height="100" fill="url(#hero-dots2)"/>
            </svg>
          </div>
          
          <!-- カード本体 -->
          <div class="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-2xl rounded-2xl p-8 min-w-[280px] border border-white/50 dark:border-slate-700/50">
            <div class="text-center">
              <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent text-white mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
              </div>
              <p class="text-sm text-slate-500 dark:text-slate-400 mb-1">インスタンス数</p>
              <p class="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                {{ serverCount }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  serverCount: string;
  loading?: boolean;
}>();
</script>
