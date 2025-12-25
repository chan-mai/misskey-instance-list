<template>
  <div class="min-h-screen bg-back dark:bg-[#0b1220]">
    <div class="container mx-auto max-w-screen-lg px-6 py-16">
      <h1 class="text-4xl font-bold text-slate-900 dark:text-white mb-4">API v1 Documentation</h1>
      <p class="text-slate-600 dark:text-slate-300 mb-12">
        (Unofficial) Misskey Server List API v1のドキュメントです。
      </p>

      <!-- Endpoints -->
      <div class="space-y-8">
        <!-- Instances API -->
        <NuxtLink 
          to="/docs/api/v1/instances" 
          class="block bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow"
        >
          <div class="flex items-center gap-3 mb-2">
            <span class="px-2 py-1 rounded text-xs font-mono font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">GET</span>
            <code class="text-lg font-mono text-slate-900 dark:text-white">/api/v1/instances</code>
          </div>
          <p class="text-slate-600 dark:text-slate-300 text-sm">Misskeyサーバーの一覧を取得します。検索、ソート、ページネーションに対応。</p>
        </NuxtLink>

        <!-- Deny Instances API -->
        <NuxtLink 
          to="/docs/api/v1/deny_instances" 
          class="block bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow"
        >
          <div class="flex items-center gap-3 mb-2">
            <span class="px-2 py-1 rounded text-xs font-mono font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">GET</span>
            <code class="text-lg font-mono text-slate-900 dark:text-white">/api/v1/deny_instances</code>
          </div>
          <p class="text-slate-600 dark:text-slate-300 text-sm">拒否リストに登録されているサーバーの一覧を取得します。</p>
        </NuxtLink>

        <!-- Ignore Instances API -->
        <NuxtLink 
          to="/docs/api/v1/ignore_instances" 
          class="block bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow"
        >
          <div class="flex items-center gap-3 mb-2">
            <span class="px-2 py-1 rounded text-xs font-mono font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">GET</span>
            <code class="text-lg font-mono text-slate-900 dark:text-white">/api/v1/ignore_instances</code>
          </div>
          <p class="text-slate-600 dark:text-slate-300 text-sm">無視リストに登録されているサーバーの一覧を取得します。</p>
        </NuxtLink>

        <!-- Stats API -->
        <NuxtLink 
          to="/docs/api/v1/stats" 
          class="block bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow"
        >
          <div class="flex items-center gap-3 mb-2">
            <span class="px-2 py-1 rounded text-xs font-mono font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">GET</span>
            <code class="text-lg font-mono text-slate-900 dark:text-white">/api/v1/stats</code>
          </div>
          <p class="text-slate-600 dark:text-slate-300 text-sm">統計情報とリポジトリ使用状況の一覧を取得します。</p>
        </NuxtLink>
      </div>

      <!-- Base URL -->
      <div class="mt-12 p-6 bg-slate-100 dark:bg-slate-800 rounded-xl">
        <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-2">Base URL</h2>
        <code class="text-sm text-slate-700 dark:text-slate-300">https://servers.misskey.ink/api/v1</code>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'API v1 Documentation - (Unofficial) Misskey Server List',
  meta: [
    { name: 'description', content: 'Misskey Server List API v1のドキュメント。' },
    { property: 'og:title', content: 'API v1 Documentation - (Unofficial) Misskey Server List' },
    { property: 'og:description', content: 'Misskey Server List API v1のドキュメント。' },
    { property: 'og:url', content: 'https://servers.misskey.ink/docs/api/v1' },
    { name: 'twitter:title', content: 'API v1 Documentation - (Unofficial) Misskey Server List' },
    { name: 'twitter:description', content: 'Misskey Server List API v1のドキュメント。' },
  ]
});
</script>
