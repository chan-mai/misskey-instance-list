
<template>
  <div class="min-h-screen bg-back dark:bg-[#0b1220]">
    <div class="container mx-auto max-w-screen-lg px-6 py-16">
      <div class="mb-8">
        <NuxtLink to="/docs/api/v1" class="text-primary hover:underline text-sm">&larr; API Documentation</NuxtLink>
      </div>
      
      <!-- Header -->
      <div class="flex items-center gap-3 mb-4">
        <span class="px-3 py-1 rounded text-sm font-mono font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">GET</span>
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white font-mono">/api/v1/stats</h1>
      </div>
      <p class="text-slate-600 dark:text-slate-300 mb-8">
        インスタンス全体の統計情報と、使用されているリポジトリのランキングを取得します。
      </p>

      <!-- Parameters -->
      <section class="mb-12">
        <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-4">Query Parameters</h2>
        <p class="text-slate-600 dark:text-slate-300">なし</p>
      </section>

      <!-- Response -->
      <section class="mb-12">
        <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-4">Response</h2>
        <pre class="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm"><code>{
  "counts": {
    "known": 1500,
    "active": 800
  },
  "repositories": [
    {
      "url": "https://github.com/misskey-dev/misskey",
      "count": 600
    },
    {
      "url": "https://github.com/firefish-dev/firefish",
      "count": 50
    }
  ]
}</code></pre>
        <div class="mt-4">
          <h3 class="font-bold text-slate-900 dark:text-white mb-2">Fields</h3>
          <ul class="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1">
            <li><code class="font-mono text-sm">counts.known</code>: データベースに登録されている全インスタンス数</li>
            <li><code class="font-mono text-sm">counts.active</code>: 生存確認ができているインスタンス数</li>
            <li><code class="font-mono text-sm">repositories</code>: リポジトリごとの使用インスタンス数（多い順）</li>
          </ul>
        </div>
      </section>

      <!-- Example -->
      <section class="mb-12">
        <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-4">Example</h2>
        <pre class="bg-slate-800 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm"><code>curl "https://servers.misskey.ink/api/v1/stats"</code></pre>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'GET /api/v1/stats - API Documentation',
  meta: [
    { name: 'description', content: '統計情報を取得するAPIのドキュメント。' },
    { property: 'og:title', content: 'GET /api/v1/stats - API Documentation' },
    { property: 'og:description', content: '統計情報を取得するAPIのドキュメント。' },
    { property: 'og:url', content: 'https://servers.misskey.ink/docs/api/v1/stats' },
  ]
});
</script>
