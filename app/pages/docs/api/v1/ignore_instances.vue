<template>
  <div class="bg-neutral-50 dark:bg-black">
    <!-- Hero -->
    <section class="min-h-[50vh] relative flex items-center bg-neutral-100 dark:bg-black">
      <div class="container mx-auto max-w-screen-xl px-6 py-24">
        <NuxtLink to="/docs/api/v1" class="inline-flex items-center gap-2 text-neutral-500 dark:text-neutral-400 hover:text-primary text-sm mb-8 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          API Documentation
        </NuxtLink>
        
        <div class="flex items-center gap-4 mb-6">
          <span class="px-4 py-2 text-sm font-mono font-bold bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">GET</span>
          <h1 class="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white font-mono">/api/v1/ignore_instances</h1>
        </div>
        <p class="text-neutral-600 dark:text-neutral-400 max-w-2xl">
          無視リストに登録されているサーバーの一覧を取得します。これらのサーバーはクロール対象から除外されています。
        </p>
      </div>
    </section>

    <!-- Response -->
    <section class="py-24 bg-neutral-50 dark:bg-black">
      <div class="container mx-auto max-w-screen-xl px-6">
        <div class="mb-16">
          <p class="text-xs font-medium tracking-widest uppercase text-neutral-400 mb-4">01</p>
          <h2 class="text-3xl font-bold text-neutral-900 dark:text-white mb-6">Response</h2>
          <div class="w-16 h-px bg-primary"></div>
        </div>

        <pre class="bg-neutral-900 dark:bg-neutral-900 text-neutral-100 p-6 lg:p-8 overflow-x-auto text-sm font-mono leading-relaxed"><code>[
  {
    "domain": "ignored1.com",
    "reason": "Inactive"
  },
  {
    "domain": "ignored2.com",
    "reason": null
  }
]</code></pre>
      </div>
    </section>

    <!-- Response Fields -->
    <section class="py-24 bg-neutral-50 dark:bg-neutral-950">
      <div class="container mx-auto max-w-screen-xl px-6">
        <div class="mb-16">
          <p class="text-xs font-medium tracking-widest uppercase text-neutral-400 mb-4">02</p>
          <h2 class="text-3xl font-bold text-neutral-900 dark:text-white mb-6">Response Body</h2>
          <div class="w-16 h-px bg-primary"></div>
        </div>

        <p class="text-neutral-600 dark:text-neutral-300 mb-8">
          以下のプロパティを持つオブジェクトの配列を返します。
        </p>

        <div class="grid gap-px bg-neutral-200 dark:bg-neutral-800">
          <div class="bg-back dark:bg-back-dark p-6 flex items-start gap-4">
            <code class="text-primary font-mono">domain</code>
            <div>
              <span class="text-xs text-neutral-400">string</span>
              <p class="text-neutral-600 dark:text-neutral-300 mt-1">ホスト名</p>
            </div>
          </div>
          <div class="bg-back dark:bg-back-dark p-6 flex items-start gap-4">
            <code class="text-primary font-mono">reason</code>
            <div>
              <span class="text-xs text-neutral-400">string | null</span>
              <p class="text-neutral-600 dark:text-neutral-300 mt-1">無視理由 (設定されている場合)</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Example -->
    <section class="py-24 bg-back dark:bg-back-dark">
      <div class="container mx-auto max-w-screen-xl px-6">
        <div class="mb-16">
          <p class="text-xs font-medium tracking-widest uppercase text-neutral-400 mb-4">03</p>
          <h2 class="text-3xl font-bold text-neutral-900 dark:text-white mb-6">Example</h2>
          <div class="w-16 h-px bg-primary"></div>
        </div>

        <div class="bg-back-dark p-6 lg:p-8">
          <p class="text-xs font-medium tracking-widest uppercase text-neutral-500 mb-4">cURL</p>
          <pre class="text-primary font-mono text-sm overflow-x-auto"><code>curl "https://servers.misskey.ink/api/v1/ignore_instances"</code></pre>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'GET /api/v1/ignore_instances - API Documentation',
  meta: [
    { name: 'description', content: '無視リストのサーバー一覧を取得するAPIのドキュメント。' },
    { property: 'og:title', content: 'GET /api/v1/ignore_instances - API Documentation' },
    { property: 'og:description', content: '無視リストのサーバー一覧を取得するAPIのドキュメント。' },
    { property: 'og:url', content: 'https://servers.misskey.ink/docs/api/v1/ignore_instances' },
  ]
});
</script>
