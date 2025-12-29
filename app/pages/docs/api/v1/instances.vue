<template>
  <div class="bg-neutral-50 dark:bg-black">
    <!-- Hero -->
    <DocApiHero method="GET" endpoint="/api/v1/instances" description="Misskeyサーバーの一覧を取得します。検索、ソート、ページネーションに対応しています。" />

    <!-- Parameters -->
    <section class="py-24 bg-neutral-50 dark:bg-black">
      <div class="container mx-auto max-w-screen-xl px-6">
        <SectionHeader number="01" title="Query Parameters" />

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-neutral-200 dark:border-neutral-800">
                <th class="text-left py-4 px-4 font-medium text-xs tracking-widest uppercase text-neutral-400">Parameter
                </th>
                <th class="text-left py-4 px-4 font-medium text-xs tracking-widest uppercase text-neutral-400">Type</th>
                <th class="text-left py-4 px-4 font-medium text-xs tracking-widest uppercase text-neutral-400">Default
                </th>
                <th class="text-left py-4 px-4 font-medium text-xs tracking-widest uppercase text-neutral-400">
                  Description</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-100 dark:divide-neutral-800">
              <tr class="hover:bg-neutral-50 dark:hover:bg-neutral-900">
                <td class="py-4 px-4 font-mono text-primary">sort</td>
                <td class="py-4 px-4 text-neutral-500">string</td>
                <td class="py-4 px-4 text-neutral-400">"users"</td>
                <td class="py-4 px-4 text-neutral-600 dark:text-neutral-300">ソート項目。<code
                    class="bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5">users</code>, <code
                    class="bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5">notes</code>, <code
                    class="bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5">createdAt</code>, <code
                    class="bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5">recommended</code>, <code
                    class="bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5">repository</code> のいずれか</td>
              </tr>
              <tr class="hover:bg-neutral-50 dark:hover:bg-neutral-900">
                <td class="py-4 px-4 font-mono text-primary">language</td>
                <td class="py-4 px-4 text-neutral-500">string</td>
                <td class="py-4 px-4 text-neutral-400">なし</td>
                <td class="py-4 px-4 text-neutral-600 dark:text-neutral-300">言語コード (ISO
                  639-1)。自動検出のため、実際の主要言語と異なる場合があります。</td>
              </tr>
              <tr class="hover:bg-neutral-50 dark:hover:bg-neutral-900">
                <td class="py-4 px-4 font-mono text-primary">order</td>
                <td class="py-4 px-4 text-neutral-500">string</td>
                <td class="py-4 px-4 text-neutral-400">"desc"</td>
                <td class="py-4 px-4 text-neutral-600 dark:text-neutral-300">ソート順。<code
                    class="bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5">asc</code> または <code
                    class="bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5">desc</code></td>
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
        <SectionHeader number="02" title="Response" />

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
        <SectionHeader number="03" title="Example" />

        <div class="bg-back-dark p-6 lg:p-8">
          <p class="text-xs font-medium tracking-widest uppercase text-neutral-500 mb-4">cURL</p>
          <pre
            class="text-primary font-mono text-sm overflow-x-auto"><code>curl "https://servers.misskey.ink/api/v1/instances?sort=users&order=desc&limit=10"</code></pre>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'GET /api/v1/instances - (Unofficial) Misskey Server List',
  meta: [
    { name: 'description', content: 'Misskeyサーバーの一覧を取得します。' },
    { property: 'og:title', content: 'GET /api/v1/instances - (Unofficial) Misskey Server List' },
    { property: 'og:description', content: 'Misskeyサーバーの一覧を取得します。' },
    { property: 'og:url', content: 'https://servers.misskey.ink/docs/api/v1/instances' },
    { name: 'twitter:title', content: 'GET /api/v1/instances - (Unofficial) Misskey Server List' },
    { name: 'twitter:description', content: 'Misskeyサーバーの一覧を取得します。' },
  ]
});

defineOptions({
  jsonld() {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'GET /api/v1/instances',
      description: 'Misskeyサーバーの一覧を取得します。',
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://servers.misskey.ink/'
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'API v1',
            item: 'https://servers.misskey.ink/docs/api/v1'
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'instances',
            item: 'https://servers.misskey.ink/docs/api/v1/instances'
          }
        ]
      }
    };
  }
});
</script>
