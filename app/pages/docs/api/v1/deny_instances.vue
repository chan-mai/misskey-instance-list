<template>
  <div class="bg-neutral-50 dark:bg-black">
    <!-- Hero -->
    <DocApiHero method="GET" endpoint="/api/v1/deny_instances"
      description="拒否リスト (Denylist)に登録されているサーバーの一覧を取得します。これらのサーバーはリストから除外されています。" />

    <!-- Response -->
    <section class="py-24 bg-neutral-50 dark:bg-black">
      <div class="container mx-auto max-w-screen-xl px-6">
        <SectionHeader number="01" title="Response" />

        <pre
          class="bg-neutral-900 dark:bg-neutral-900 text-neutral-100 p-6 lg:p-8 overflow-x-auto text-sm font-mono leading-relaxed"><code>[
  {
    "domain": "example1.com",
    "reason": "Spam"
  },
  {
    "domain": "example2.com",
    "reason": null
  }
]</code></pre>
      </div>
    </section>

    <!-- Response Fields -->
    <section class="py-24 bg-neutral-50 dark:bg-neutral-950">
      <div class="container mx-auto max-w-screen-xl px-6">
        <SectionHeader number="02" title="Response Body" />

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
              <p class="text-neutral-600 dark:text-neutral-300 mt-1">拒否理由 (設定されている場合)</p>
            </div>
          </div>
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
            class="text-primary font-mono text-sm overflow-x-auto"><code>curl "https://servers.misskey.ink/api/v1/deny_instances"</code></pre>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'GET /api/v1/deny_instances - (Unofficial) Misskey Server List',
  meta: [
    { name: 'description', content: '拒否リストに登録されているサーバーの一覧を取得します。' },
    { property: 'og:title', content: 'GET /api/v1/deny_instances - (Unofficial) Misskey Server List' },
    { property: 'og:description', content: '拒否リストに登録されているサーバーの一覧を取得します。' },
    { property: 'og:url', content: 'https://servers.misskey.ink/docs/api/v1/deny_instances' },
    { name: 'twitter:title', content: 'GET /api/v1/deny_instances - (Unofficial) Misskey Server List' },
    { name: 'twitter:description', content: '拒否リストに登録されているサーバーの一覧を取得します。' },
  ]
});

defineOptions({
  jsonld() {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'GET /api/v1/deny_instances',
      description: '拒否リストに登録されているサーバーの一覧を取得します。',
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
            name: 'deny_instances',
            item: 'https://servers.misskey.ink/docs/api/v1/deny_instances'
          }
        ]
      }
    };
  }
});
</script>
