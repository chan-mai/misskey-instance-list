<template>
  <header class="fixed top-0 left-0 right-0 z-50 transition-all duration-300" :class="scrolled ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-sm' : ''">
    <div class="container mx-auto max-w-screen-xl px-6">
      <div class="flex items-center justify-between h-16">
        <!-- ロゴ -->
        <NuxtLink to="/" class="flex items-center gap-2 group">
          <img src="/ogp.png" class="w-10 h-10 rounded-xl pointer-events-none">
          <span class="font-bold text-xl text-slate-900 dark:text-white hidden sm:block">
            (Unofficial) Misskey Server List
          </span>
        </NuxtLink>

        <!-- ナビゲーション -->
        <nav class="flex items-center gap-6">
          <NuxtLink 
            to="/" 
            class="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors"
          >
            Servers
          </NuxtLink>
          <NuxtLink 
            to="/about" 
            class="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors"
          >
            About
          </NuxtLink>
          <NuxtLink 
            to="/stats" 
            class="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors"
          >
            Stats
          </NuxtLink>
          <!-- sm 以下非表示 -->
          <NuxtLink 
            to="/docs/api/v1" 
            class="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary transition-colors hidden sm:block"
          >
            API Docs
          </NuxtLink>

          <DarkLightToggle />
          
        </nav>
      </div>
    </div>
  </header>
  
  <!-- ヘッダー分のスペーサー -->
  <div class="h-16"></div>
</template>

<script setup lang="ts">
const scrolled = ref(false);

onMounted(() => {
  const handleScroll = () => {
    scrolled.value = window.scrollY > 20;
  };
  
  window.addEventListener('scroll', handleScroll, { passive: true });
  
  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
  });
});
</script>
