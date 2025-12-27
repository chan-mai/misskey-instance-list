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
          <h1 class="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white font-mono">/api/v1/instances</h1>
        </div>
        <p class="text-neutral-600 dark:text-neutral-400 max-w-2xl">
          Misskeyサーバーの一覧を取得します。検索、ソート、ページネーションに対応しています。
        </p>
      </div>
    </section>

    <!-- Parameters -->
    <section class="py-24 bg-neutral-50 dark:bg-black">
      <div class="container mx-auto max-w-screen-xl px-6">
        <div class="mb-16">
          <p class="text-xs font-medium tracking-widest uppercase text-neutral-400 mb-4">01</p>
          <h2 class="text-3xl font-bold text-neutral-900 dark:text-white mb-6">Query Parameters</h2>
          <div class="w-16 h-px bg-primary"></div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-neutral-200 dark:border-neutral-800">
                <th class="text-left py-4 px-4 font-medium text-xs tracking-widest uppercase text-neutral-400">Parameter</th>
                <th class="text-left py-4 px-4 font-medium text-xs tracking-widest uppercase text-neutral-400">Type</th>
                <th class="text-left py-4 px-4 font-medium text-xs tracking-widest uppercase text-neutral-400">Default</th>
                <th class="text-left py-4 px-4 font-medium text-xs tracking-widest uppercase text-neutral-400">Description</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-100 dark:divide-neutral-800">
              <tr class="hover:bg-neutral-50 dark:hover:bg-neutral-900">
                <td class="py-4 px-4 font-mono text-primary">sort</td>
                <td class="py-4 px-4 text-neutral-500">string</td>
                <td class="py-4 px-4 text-neutral-400">"users"</td>
                <td class="py-4 px-4 text-neutral-600 dark:text-neutral-300">ソート項目。<code class="bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5">users</code>, <code class="bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5">notes</code>, <code class="bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5">createdAt</code>, <code class="bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5">recommended</code>, <code class="bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5">repository</code> のいずれか</td>
              </tr>
              <tr class="hover:bg-neutral-50 dark:hover:bg-neutral-900">
                <td class="py-4 px-4 font-mono text-primary">language</td>
                <td class="py-4 px-4 text-neutral-500">string</td>
                <td class="py-4 px-4 text-neutral-400">なし</td>
                <td class="py-4 px-4 text-neutral-600 dark:text-neutral-300">言語コード (ISO 639-1)。自動検出のため、実際の主要言語と異なる場合があります。</td>
              </tr>
              <tr class="hover:bg-neutral-50 dark:hover:bg-neutral-900">
                <td class="py-4 px-4 font-mono text-primary">order</td>
                <td class="py-4 px-4 text-neutral-500">string</td>
                <td class="py-4 px-4 text-neutral-400">"desc"</td>
                <td class="py-4 px-4 text-neutral-600 dark:text-neutral-300">ソート順。<code class="bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5">asc</code> または <code class="bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5">desc</code></td>
              </tr>
              <tr class="hover:bg-neutral-50 dark:hover:bg-neutral-900">
                <td class="py-4 px-4 font-mono text-primary">limit</td>
                <td class="py-4 px-4 text-neutral-500">number</td>
                <td class="py-4 px-4 text-neutral-400">30</td>
                <td class="py-4 px-4 text-neutral-600 dark:text-neutral-300">取得件数 (最大100)</td>
              </tr>
              <tr class="hover:bg-neutral-50 dark:hover:bg-neutral-900">
                <td class="py-4 px-4 font-mono text-primary">offset</td>
                <td class="py-4 px-4 text-neutral-500">number</td>
                <td class="py-4 px-4 text-neutral-400">0</td>
                <td class="py-4 px-4 text-neutral-600 dark:text-neutral-300">ページネーションのオフセット</td>
              </tr>
              <tr class="hover:bg-neutral-50 dark:hover:bg-neutral-900">
                <td class="py-4 px-4 font-mono text-primary">search</td>
                <td class="py-4 px-4 text-neutral-500">string</td>
                <td class="py-4 px-4 text-neutral-400">-</td>
                <td class="py-4 px-4 text-neutral-600 dark:text-neutral-300">サーバー名で検索 (部分一致)</td>
              </tr>
              <tr class="hover:bg-neutral-50 dark:hover:bg-neutral-900">
                <td class="py-4 px-4 font-mono text-primary">repository</td>
                <td class="py-4 px-4 text-neutral-500">string</td>
                <td class="py-4 px-4 text-neutral-400">-</td>
                <td class="py-4 px-4 text-neutral-600 dark:text-neutral-300">リポジトリURL (完全一致)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- Response -->
    <section class="py-24 bg-neutral-50 dark:bg-neutral-950">
      <div class="container mx-auto max-w-screen-xl px-6">
        <div class="mb-16">
          <p class="text-xs font-medium tracking-widest uppercase text-neutral-400 mb-4">02</p>
          <h2 class="text-3xl font-bold text-neutral-900 dark:text-white mb-6">Response</h2>
          <div class="w-16 h-px bg-primary"></div>
        </div>

        <pre class="bg-back-dark text-neutral-100 p-6 lg:p-8 overflow-x-auto text-sm font-mono leading-relaxed"><code>{
  "items": [
    {
      "id": "example.com",
      "node_name": "Example Instance",
      "users_count": 100,
      "notes_count": 10000,
      "created_at": 1704067200000,
      "version": "2024.1.0",
      "is_alive": true,
      "last_updated": 1704153600000,
      "last_check_at": 1704153600000,
      "banner_url": "https://example.com/banner.jpg",
      "icon_url": "https://example.com/icon.png",
      "language": "ja"
    }
  ],
  "total": 500,
  "limit": 30,
  "offset": 0
}</code></pre>
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
          <pre class="text-primary font-mono text-sm overflow-x-auto"><code>curl "https://servers.misskey.ink/api/v1/instances?sort=users&order=desc&limit=10"</code></pre>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'GET /api/v1/instances - API Documentation',
  meta: [
    { name: 'description', content: 'Misskeyサーバー一覧を取得するAPIのドキュメント。' },
    { property: 'og:title', content: 'GET /api/v1/instances - API Documentation' },
    { property: 'og:description', content: 'Misskeyサーバー一覧を取得するAPIのドキュメント。' },
    { property: 'og:url', content: 'https://servers.misskey.ink/docs/api/v1/instances' },
  ]
});
</script>
