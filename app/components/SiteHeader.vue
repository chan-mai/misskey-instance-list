<template>
  <header class="fixed top-0 left-0 right-0 z-50 transition-all duration-300" :class="scrolled ? 'bg-white/95 dark:bg-black/95 backdrop-blur-sm shadow-sm' : 'bg-transparent'">
    <div class="container mx-auto max-w-screen-xl px-6">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-3 group">
          <img src="/ogp.png" class="w-9 h-9 rounded-lg pointer-events-none">
          <span class="font-bold text-lg tracking-wide hidden sm:block text-neutral-900 dark:text-white">
            (Unofficial) Misskey Server List
          </span>
        </NuxtLink>

        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center gap-8">
          <NuxtLink 
            to="/" 
            class="text-sm font-medium tracking-wider transition-colors text-neutral-600 dark:text-white/70 hover:text-neutral-900 dark:hover:text-white visited:text-neutral-600 dark:visited:text-white/70"
          >
            SERVERS
          </NuxtLink>
          <NuxtLink 
            to="/about" 
            class="text-sm font-medium tracking-wider transition-colors text-neutral-600 dark:text-white/70 hover:text-neutral-900 dark:hover:text-white visited:text-neutral-600 dark:visited:text-white/70"
          >
            ABOUT
          </NuxtLink>
          <NuxtLink 
            to="/stats" 
            class="text-sm font-medium tracking-wider transition-colors text-neutral-600 dark:text-white/70 hover:text-neutral-900 dark:hover:text-white visited:text-neutral-600 dark:visited:text-white/70"
          >
            STATS
          </NuxtLink>
          <NuxtLink 
            to="/docs/api/v1" 
            class="text-sm font-medium tracking-wider transition-colors text-neutral-600 dark:text-white/70 hover:text-neutral-900 dark:hover:text-white visited:text-neutral-600 dark:visited:text-white/70"
          >
            API DOCS
          </NuxtLink>

          <ThemeToggle />
        </nav>

        <!-- Mobile menu button -->
        <div class="flex items-center gap-3 md:hidden">
          <ThemeToggle />
          <button 
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="h-9 w-9 flex items-center justify-center transition-colors duration-200 bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-white"
            aria-label="Menu"
          >
            <svg v-if="!mobileMenuOpen" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile menu -->
    <Transition name="slide-down">
      <div 
        v-if="mobileMenuOpen"
        class="md:hidden bg-white dark:bg-black border-t border-neutral-100 dark:border-neutral-800"
      >
        <nav class="container mx-auto max-w-screen-xl px-6 py-4 flex flex-col">
          <NuxtLink 
            to="/" 
            class="text-sm font-medium tracking-widest text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white visited:text-neutral-600 dark:visited:text-neutral-400 py-4 border-b border-neutral-100 dark:border-neutral-800"
            @click="mobileMenuOpen = false"
          >
            SERVERS
          </NuxtLink>
          <NuxtLink 
            to="/about" 
            class="text-sm font-medium tracking-widest text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white visited:text-neutral-600 dark:visited:text-neutral-400 py-4 border-b border-neutral-100 dark:border-neutral-800"
            @click="mobileMenuOpen = false"
          >
            ABOUT
          </NuxtLink>
          <NuxtLink 
            to="/stats" 
            class="text-sm font-medium tracking-widest text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white visited:text-neutral-600 dark:visited:text-neutral-400 py-4 border-b border-neutral-100 dark:border-neutral-800"
            @click="mobileMenuOpen = false"
          >
            STATS
          </NuxtLink>
          <NuxtLink 
            to="/docs/api/v1" 
            class="text-sm font-medium tracking-widest text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white visited:text-neutral-600 dark:visited:text-neutral-400 py-4"
            @click="mobileMenuOpen = false"
          >
            API
          </NuxtLink>
        </nav>
      </div>
    </Transition>
  </header>
  
  <!-- Header spacer -->
  <div class="h-16"></div>
</template>

<script setup lang="ts">
const scrolled = ref(false);
const mobileMenuOpen = ref(false);

onMounted(() => {
  const handleScroll = () => {
    scrolled.value = window.scrollY > 20;
    if (window.scrollY > 20) {
      mobileMenuOpen.value = false;
    }
  };
  
  window.addEventListener('scroll', handleScroll, { passive: true });
  
  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
  });
});
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.2s ease;
}
.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
