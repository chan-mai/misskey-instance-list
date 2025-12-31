<template>
  <div class="bg-neutral-50 dark:bg-black">
    <!-- Hero -->
    <DocApiHero method="GET" endpoint="/api/v1/exclusions"
      description="除外リストに登録されているサーバー（拒否または無視）の一覧を取得します。" />

    <!-- Parameters -->
    <section class="py-24 bg-neutral-50 dark:bg-black">
      <div class="container mx-auto max-w-screen-xl px-6">
        <SectionHeader number="01" title="Query Parameters" />

        <p class="text-neutral-500">なし</p>
      </div>
    </section>

    <!-- Response -->
    <section class="py-24 bg-neutral-50 dark:bg-neutral-950">
      <div class="container mx-auto max-w-screen-xl px-6">
        <SectionHeader number="02" title="Response" />

        <pre
          class="bg-back-dark text-neutral-100 p-6 lg:p-8 overflow-x-auto text-sm font-mono leading-relaxed mb-12"><code>[
  {
    "domain": "bad-instance.example.com",
    "reason": "Not Misskey: Mastodon"
  },
  {
    "domain": "spam-instance.example.net",
    "reason": "Spam/Malware"
  }
]</code></pre>

        <div class="mb-8">
          <h3 class="text-xl font-bold text-neutral-900 dark:text-white mb-6">Fields</h3>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-neutral-200 dark:border-neutral-800">
                <th class="text-left py-4 px-4 font-medium text-xs tracking-widest uppercase text-neutral-400">Field
                </th>
                <th class="text-left py-4 px-4 font-medium text-xs tracking-widest uppercase text-neutral-400">Type</th>
                <th class="text-left py-4 px-4 font-medium text-xs tracking-widest uppercase text-neutral-400">
                  Description</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-100 dark:divide-neutral-800">
              <tr class="hover:bg-neutral-50 dark:hover:bg-neutral-900">
                <td class="py-4 px-4 font-mono text-primary">domain</td>
                <td class="py-4 px-4 text-neutral-500">string</td>
                <td class="py-4 px-4 text-neutral-600 dark:text-neutral-300">除外されたサーバーのドメイン名</td>
              </tr>
              <tr class="hover:bg-neutral-50 dark:hover:bg-neutral-900">
                <td class="py-4 px-4 font-mono text-primary">reason</td>
                <td class="py-4 px-4 text-neutral-500">string | null</td>
                <td class="py-4 px-4 text-neutral-600 dark:text-neutral-300">除外理由</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- Example -->
    <section class="py-24 bg-back dark:bg-back-dark">
      <div class="container mx-auto max-w-screen-xl px-6">
        <SectionHeader number="03" title="Example" />

        <div class="bg-back-dark p-6 lg:p-8">
          <p class="text-xs font-medium tracking-widest uppercase text-neutral-500 mb-4">cURL</p>
          <pre
            class="text-primary font-mono text-sm overflow-x-auto"><code>curl "https://servers.misskey.ink/api/v1/exclusions"</code></pre>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'GET /api/v1/exclusions - (Unofficial) Misskey Server List',
  meta: [
    { name: 'description', content: '除外リストの一覧を取得します。' },
    { property: 'og:title', content: 'GET /api/v1/exclusions - (Unofficial) Misskey Server List' },
    { property: 'og:description', content: '除外リストの一覧を取得します。' },
    { property: 'og:url', content: 'https://servers.misskey.ink/docs/api/v1/exclusions' },
    { name: 'twitter:title', content: 'GET /api/v1/exclusions - (Unofficial) Misskey Server List' },
    { name: 'twitter:description', content: '除外リストの一覧を取得します。' },
  ]
});

useJsonld(() => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'GET /api/v1/exclusions',
  description: '除外リストの一覧を取得します。',
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
        name: 'exclusions',
        item: 'https://servers.misskey.ink/docs/api/v1/exclusions'
      }
    ]
  }
}));
</script>
