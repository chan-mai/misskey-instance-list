<template>
  <div class="min-h-screen bg-back">
    <div class="container mx-auto max-w-screen-lg px-6 py-16">
      <div class="mb-8">
        <NuxtLink to="/docs/api/v1" class="text-primary hover:underline text-sm">&larr; API Documentation</NuxtLink>
      </div>
      
      <!-- Header -->
      <div class="flex items-center gap-3 mb-4">
        <span class="px-3 py-1 rounded text-sm font-mono font-bold bg-green-100 text-green-700">GET</span>
        <h1 class="text-3xl font-bold text-slate-900 font-mono">/api/v1/deny_instances</h1>
      </div>
      <p class="text-slate-600 mb-8">
        拒否リスト（Denylist）に登録されているサーバーの一覧を取得します。
        これらのサーバーはリストから除外されています。
      </p>

      <!-- Response -->
      <section class="mb-12">
        <h2 class="text-xl font-bold text-slate-900 mb-4">Response</h2>
        <pre class="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm"><code>[
  "example1.com",
  "example2.com"
]</code></pre>
      </section>

      <!-- Response Fields -->
      <section class="mb-12">
        <h2 class="text-xl font-bold text-slate-900 mb-4">Response Body</h2>
        <p class="text-slate-600 mb-4">
          拒否リストに登録されているホスト名（ドメイン）の配列（string[]）を返します。
        </p>
      </section>

      <!-- Example -->
      <section class="mb-12">
        <h2 class="text-xl font-bold text-slate-900 mb-4">Example</h2>
        <pre class="bg-slate-800 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm"><code>curl "https://servers.misskey.ink/api/v1/deny_instances"</code></pre>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'GET /api/v1/deny_instances - API Documentation',
  meta: [
    { name: 'description', content: '拒否リストのサーバー一覧を取得するAPIのドキュメント。' },
    { property: 'og:title', content: 'GET /api/v1/deny_instances - API Documentation' },
    { property: 'og:description', content: '拒否リストのサーバー一覧を取得するAPIのドキュメント。' },
    { property: 'og:url', content: 'https://servers.misskey.ink/docs/api/v1/deny_instances' },
  ]
});
</script>
