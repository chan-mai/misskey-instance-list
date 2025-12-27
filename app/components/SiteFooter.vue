<template>
  <footer class="py-24 bg-neutral-50 dark:bg-black text-neutral-900 dark:text-white transition-colors duration-300">
    <div class="container mx-auto max-w-screen-xl px-6">
      <!-- Top section -->
      <div class="flex flex-col lg:flex-row justify-between gap-12 pb-16">
        <!-- Logo and description -->
        <div class="max-w-md">
          <NuxtLink to="/" class="inline-flex items-center gap-3 mb-6">
            <img src="/ogp.png" class="w-10 h-10 rounded-lg">
            <span class="text-xl font-bold tracking-wide">MISSKEY SERVER LIST</span>
          </NuxtLink>
          <p class="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
            あなたにぴったりのMisskeyサーバーを見つけよう。Fediverseの世界へようこそ。
          </p>
        </div>

        <!-- Navigation grid -->
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-8 lg:gap-16">
          <div>
            <h4 class="text-xs font-medium tracking-widest uppercase text-neutral-500 mb-4">Navigation</h4>
            <nav class="flex flex-col gap-3">
              <NuxtLink to="/" class="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">Servers</NuxtLink>
              <NuxtLink to="/stats" class="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">Stats</NuxtLink>
              <NuxtLink to="/about" class="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">About</NuxtLink>
            </nav>
          </div>
          <div>
            <h4 class="text-xs font-medium tracking-widest uppercase text-neutral-500 mb-4">Developer</h4>
            <nav class="flex flex-col gap-3">
              <NuxtLink to="/docs/api/v1" class="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">API Docs</NuxtLink>
              <NuxtLink to="/privacy" class="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">Privacy</NuxtLink>
            </nav>
          </div>
          <div>
            <h4 class="text-xs font-medium tracking-widest uppercase text-neutral-500 mb-4">Connect</h4>
            <div class="flex gap-4">
              <NuxtLink 
                to="https://github.com/chan-mai/misskey-instance-list" 
                target="_blank" 
                rel="noopener noreferrer"
                class="w-10 h-10 flex items-center justify-center bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
              >
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom section -->
      <div class="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-neutral-200 dark:border-neutral-800">
        <p class="text-xs text-neutral-500 dark:text-neutral-500">
          © {{ new Date().getFullYear() }} chan-mai. This site is unofficial.
        </p>
        <p class="text-xs text-neutral-500 dark:text-neutral-500">
          このリストはMisskey開発チームとは関係ありません。
        </p>
      </div>
    </div>
  </footer>
</template>
