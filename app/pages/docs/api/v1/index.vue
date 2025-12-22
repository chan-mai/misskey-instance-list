<template>
  <div class="min-h-screen bg-back">
    <div class="container mx-auto max-w-screen-lg px-6 py-16">
      <div class="mb-12">
        <NuxtLink to="/docs/api/v1" class="text-primary hover:underline text-sm">&larr; API Documentation</NuxtLink>
      </div>
      
      <h1 class="text-4xl font-bold text-slate-900 mb-4">API v1 Documentation</h1>
      <p class="text-slate-600 mb-12">
        (Unofficial) Misskey Instance List API v1のドキュメントです。
      </p>

      <!-- Endpoints -->
      <div class="space-y-8">
        <!-- Instances API -->
        <NuxtLink 
          to="/docs/api/v1/instances" 
          class="block bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
        >
          <div class="flex items-center gap-3 mb-2">
            <span class="px-2 py-1 rounded text-xs font-mono font-bold bg-green-100 text-green-700">GET</span>
            <code class="text-lg font-mono text-slate-900">/api/v1/instances</code>
          </div>
          <p class="text-slate-600 text-sm">Misskeyインスタンスの一覧を取得します。検索、ソート、ページネーションに対応。</p>
        </NuxtLink>

        <!-- Deny Instances API -->
        <NuxtLink 
          to="/docs/api/v1/deny_instances" 
          class="block bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
        >
          <div class="flex items-center gap-3 mb-2">
            <span class="px-2 py-1 rounded text-xs font-mono font-bold bg-green-100 text-green-700">GET</span>
            <code class="text-lg font-mono text-slate-900">/api/v1/deny_instances</code>
          </div>
          <p class="text-slate-600 text-sm">拒否リストに登録されているインスタンスの一覧を取得します。</p>
        </NuxtLink>

        <!-- Ignore Instances API -->
        <NuxtLink 
          to="/docs/api/v1/ignore_instances" 
          class="block bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
        >
          <div class="flex items-center gap-3 mb-2">
            <span class="px-2 py-1 rounded text-xs font-mono font-bold bg-green-100 text-green-700">GET</span>
            <code class="text-lg font-mono text-slate-900">/api/v1/ignore_instances</code>
          </div>
          <p class="text-slate-600 text-sm">無視リストに登録されているインスタンスの一覧を取得します。</p>
        </NuxtLink>
      </div>

      <!-- Base URL -->
      <div class="mt-12 p-6 bg-slate-100 rounded-xl">
        <h2 class="text-lg font-bold text-slate-900 mb-2">Base URL</h2>
        <code class="text-sm text-slate-700">https://misskey-instances.mq1.dev/api/v1</code>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'API v1 Documentation - (Unofficial) Misskey Instance List',
  meta: [
    { name: 'description', content: 'Misskey Instance List API v1のドキュメント。' },
    { property: 'og:title', content: 'API v1 Documentation - (Unofficial) Misskey Instance List' },
    { property: 'og:description', content: 'Misskey Instance List API v1のドキュメント。' },
    { property: 'og:url', content: 'https://misskey-instances.mq1.dev/docs/api/v1' },
    { name: 'twitter:title', content: 'API v1 Documentation - (Unofficial) Misskey Instance List' },
    { name: 'twitter:description', content: 'Misskey Instance List API v1のドキュメント。' },
  ]
});
</script>
