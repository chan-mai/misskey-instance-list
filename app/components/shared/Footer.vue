<template>
  <footer class="py-24 bg-neutral-50 dark:bg-black text-neutral-900 dark:text-white transition-colors duration-300">
    <div class="container mx-auto max-w-screen-xl px-6">
      <div class="flex flex-col lg:flex-row justify-between gap-12 pb-16">
        <div class="max-w-md">
          <NuxtLink to="/#" class="inline-flex items-center gap-3 mb-6">
            <img src="/ogp.png" class="w-10 h-10">
            <span class="text-xl font-bold tracking-wide">(Unofficial) Misskey Server List</span>
          </NuxtLink>
          <p class="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
            あなたにぴったりなMisskeyサーバーを見つけよう。
          </p>
        </div>

        <!-- Nav -->
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-8 lg:gap-16">
          <div>
            <h4 class="text-xs font-medium tracking-widest uppercase text-neutral-500 mb-4">Navigation</h4>
            <nav class="flex flex-col gap-3">
              <NuxtLink to="/#"
                class="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                Home</NuxtLink>
              <NuxtLink to="/servers"
                class="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                Servers</NuxtLink>
              <NuxtLink to="/stats"
                class="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                Stats</NuxtLink>
              <NuxtLink to="/privacy"
                class="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                Privacy</NuxtLink>
            </nav>
          </div>
          <div>
            <h4 class="text-xs font-medium tracking-widest uppercase text-neutral-500 mb-4">Developer</h4>
            <nav class="flex flex-col gap-3">
              <NuxtLink to="/docs/api/v1"
                class="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                API Docs</NuxtLink>
            </nav>
          </div>
          <div>
            <h4 class="text-xs font-medium tracking-widest uppercase text-neutral-500 mb-4">Connect</h4>
            <nav class="flex flex-col gap-3">
              <NuxtLink to="https://github.com/chan-mai/misskey-instance-list"
                class="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                GitHub</NuxtLink>
            </nav>
          </div>
        </div>
      </div>

      <!-- Copyright -->
      <div
        class="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-neutral-200 dark:border-neutral-800">
        <p class="text-xs text-neutral-500 dark:text-neutral-500">
          © {{ new Date().getFullYear() }} chan-mai.
        </p>
        <p class="text-xs text-neutral-500 dark:text-neutral-500">
          このサイトはsyuilo氏及びMisskeyプロジェクトとは関係ありません。
        </p>
      </div>
    </div>
  </footer>
</template>
