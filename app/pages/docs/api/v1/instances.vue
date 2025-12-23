<template>
  <div class="min-h-screen bg-back">
    <div class="container mx-auto max-w-screen-lg px-6 py-16">
      <div class="mb-8">
        <NuxtLink to="/docs/api/v1" class="text-primary hover:underline text-sm">&larr; API Documentation</NuxtLink>
      </div>
      
      <!-- Header -->
      <div class="flex items-center gap-3 mb-4">
        <span class="px-3 py-1 rounded text-sm font-mono font-bold bg-green-100 text-green-700">GET</span>
        <h1 class="text-3xl font-bold text-slate-900 font-mono">/api/v1/instances</h1>
      </div>
      <p class="text-slate-600 mb-8">
        Misskeyサーバーの一覧を取得します。検索、ソート、ページネーションに対応しています。
      </p>

      <!-- Parameters -->
      <section class="mb-12">
        <h2 class="text-xl font-bold text-slate-900 mb-4">Query Parameters</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-slate-200">
                <th class="text-left py-3 px-4 font-semibold text-slate-700">Parameter</th>
                <th class="text-left py-3 px-4 font-semibold text-slate-700">Type</th>
                <th class="text-left py-3 px-4 font-semibold text-slate-700">Default</th>
                <th class="text-left py-3 px-4 font-semibold text-slate-700">Description</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr>
                <td class="py-3 px-4 font-mono text-slate-900">sort</td>
                <td class="py-3 px-4 text-slate-600">string</td>
                <td class="py-3 px-4 text-slate-500">"users"</td>
                <td class="py-3 px-4 text-slate-600">ソート項目。<code class="bg-slate-100 px-1 rounded">users</code>, <code class="bg-slate-100 px-1 rounded">notes</code>, <code class="bg-slate-100 px-1 rounded">createdAt</code> のいずれか</td>
              </tr>
              <tr>
                <td class="py-3 px-4 font-mono text-slate-900">order</td>
                <td class="py-3 px-4 text-slate-600">string</td>
                <td class="py-3 px-4 text-slate-500">"desc"</td>
                <td class="py-3 px-4 text-slate-600">ソート順。<code class="bg-slate-100 px-1 rounded">asc</code> または <code class="bg-slate-100 px-1 rounded">desc</code></td>
              </tr>
              <tr>
                <td class="py-3 px-4 font-mono text-slate-900">limit</td>
                <td class="py-3 px-4 text-slate-600">number</td>
                <td class="py-3 px-4 text-slate-500">30</td>
                <td class="py-3 px-4 text-slate-600">取得件数（最大100）</td>
              </tr>
              <tr>
                <td class="py-3 px-4 font-mono text-slate-900">offset</td>
                <td class="py-3 px-4 text-slate-600">number</td>
                <td class="py-3 px-4 text-slate-500">0</td>
                <td class="py-3 px-4 text-slate-600">ページネーションのオフセット</td>
              </tr>
              <tr>
                <td class="py-3 px-4 font-mono text-slate-900">search</td>
                <td class="py-3 px-4 text-slate-600">string</td>
                <td class="py-3 px-4 text-slate-500">-</td>
                <td class="py-3 px-4 text-slate-600">サーバー名で検索（部分一致）</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Response -->
      <section class="mb-12">
        <h2 class="text-xl font-bold text-slate-900 mb-4">Response</h2>
        <pre class="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm"><code>{
  "items": [
    {
      "id": "string",
      "host": "example.com",
      "name": "Example Instance",
      "description": "Instance description",
      "icon_url": "https://example.com/icon.png",
      "banner_url": "https://example.com/banner.png",
      "software_version": "2024.x.x",
      "users_count": 1000,
      "notes_count": 50000,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-12-23T00:00:00.000Z"
    }
  ],
  "total": 500,
  "limit": 30,
  "offset": 0
}</code></pre>
      </section>

      <!-- Example -->
      <section class="mb-12">
        <h2 class="text-xl font-bold text-slate-900 mb-4">Example</h2>
        <pre class="bg-slate-800 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm"><code>curl "https://servers.misskey.ink/api/v1/instances?sort=users&order=desc&limit=10"</code></pre>
      </section>
    </div>
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
