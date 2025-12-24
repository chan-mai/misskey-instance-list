<template>
  <footer class="py-20 bg-slate-900 text-white dark:bg-slate-950">
    <div class="container mx-auto max-w-screen-lg px-6">
      <div class="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
        <div class="flex flex-col gap-4 items-center md:items-start">
          <NuxtLink to="/" class="text-lg font-bold hover:text-slate-300 transition-colors">
            (Unofficial) Misskey Server List
          </NuxtLink>
          <div class="flex gap-6 text-sm text-slate-400">
            <NuxtLink to="/" class="hover:text-white transition-colors">Servers</NuxtLink>
            <NuxtLink to="/about" class="hover:text-white transition-colors">About</NuxtLink>
            <NuxtLink to="/docs/api/v1" class="hover:text-white transition-colors">API Docs</NuxtLink>
            <NuxtLink to="/privacy" class="hover:text-white transition-colors">Privacy Policy</NuxtLink>
          </div>
        </div>

        <div class="flex gap-6">
          <NuxtLink to="https://github.com/chan-mai/misskey-instance-list" target="_blank" rel="noopener noreferrer"
            class="text-slate-400 hover:text-white transition-colors flex items-center gap-2">
            <span>GitHub</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              class="lucide lucide-external-link">
              <path d="M15 3h6v6" />
              <path d="M10 14 21 3" />
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            </svg>
          </NuxtLink>
          <NuxtLink to="https://mq1.dev/about" target="_blank" rel="noopener noreferrer"
            class="text-slate-400 hover:text-white transition-colors flex items-center gap-2">
            <span>Developer</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
              class="lucide lucide-external-link">
              <path d="M15 3h6v6" />
              <path d="M10 14 21 3" />
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            </svg>
          </NuxtLink>
        </div>
      </div>

      <div
        class="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-slate-500 uppercase tracking-widest">
        <p>© {{ new Date().getFullYear() }} chan-mai</p>
        <p>This site is unofficial and not affiliated with Misskey or Syuilo.</p>
      </div>
    </div>
  </footer>


  <section class="py-8 bg-slate-950 text-white">
    <div class="container mx-auto max-w-screen-lg px-6">
      <p class="text-xs leading-relaxed">
        このリストは非公式のプロジェクトであり、Misskey開発チームとは関係ありません。
        掲載されているサーバーの運営状況やセキュリティについて、当プロジェクトは一切の責任を負いません。
      </p>
    </div>
  </section>
</template>
