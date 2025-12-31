<template>
  <div class="bg-neutral-50 dark:bg-black">
    <!-- Hero -->
    <DocApiHero method="GET" endpoint="/api/v1/stats" description="インスタンス全体の統計情報と、使用されているリポジトリのランキングを取得します。" />

    <!-- Parameters -->
    <section class="py-24 bg-neutral-50 dark:bg-black">
      <div class="container mx-auto max-w-screen-xl px-6">
        <SectionHeader number="01" title="Query Parameters" />

        <p class="text-neutral-500">なし</p>
      </div>
    </section>

    <!-- Response -->
    <section class="py-24 bg-neutral-50 dark:bg-black">
      <div class="container mx-auto max-w-screen-xl px-6">
        <SectionHeader number="02" title="Response" />

        <pre
          class="bg-neutral-900 dark:bg-neutral-900 text-neutral-100 p-6 lg:p-8 overflow-x-auto text-sm font-mono leading-relaxed mb-12"><code>{
  "counts": {
    "known": 1500,
    "active": 800,
    "exclusions": 150,
    "users": 120000
  },
  "repositories": [
    {
      "url": "https://github.com/misskey-dev/misskey",
      "name": "misskey-dev/misskey",
      "description": "🌎 A completely free and open interplanetary-microblogging platform 🚀",
      "count": 600
    }
  ],
  "languages": [
    {
      "code": "ja",
      "count": 750
    }
  ]
}</code></pre>

        <div class="mb-8">
          <h3 class="text-xl font-bold text-neutral-900 dark:text-white mb-6">Fields</h3>
        </div>

        <div class="grid gap-px bg-neutral-200 dark:bg-neutral-800">
          <div class="bg-back dark:bg-back-dark p-6 flex items-start gap-4">
            <code class="text-primary font-mono text-sm shrink-0">counts.known</code>
            <p class="text-neutral-600 dark:text-neutral-300">データベースに登録されている全インスタンス数</p>
          </div>
          <div class="bg-back dark:bg-back-dark p-6 flex items-start gap-4">
            <code class="text-primary font-mono text-sm shrink-0">counts.active</code>
            <p class="text-neutral-600 dark:text-neutral-300">生存確認ができているインスタンス数</p>
          </div>
          <div class="bg-back dark:bg-back-dark p-6 flex items-start gap-4">
            <code class="text-primary font-mono text-sm shrink-0">counts.exclusions</code>
            <p class="text-neutral-600 dark:text-neutral-300">除外リストに含まれるドメイン総数</p>
          </div>
          <div class="bg-back dark:bg-back-dark p-6 flex items-start gap-4">
            <code class="text-primary font-mono text-sm shrink-0">counts.users</code>
            <p class="text-neutral-600 dark:text-neutral-300">アクティブなインスタンスの総ユーザー数</p>
          </div>
          <div class="bg-back dark:bg-back-dark p-6 flex items-start gap-4">
            <code class="text-primary font-mono text-sm shrink-0">repositories</code>
            <p class="text-neutral-600 dark:text-neutral-300">リポジトリごとの使用インスタンス数 (多い順)</p>
          </div>
          <div class="bg-back dark:bg-back-dark p-6 flex items-start gap-4">
            <code class="text-primary font-mono text-sm shrink-0">repositories[].url</code>
            <p class="text-neutral-600 dark:text-neutral-300">リポジトリのURL</p>
          </div>
          <div class="bg-back dark:bg-back-dark p-6 flex items-start gap-4">
            <code class="text-primary font-mono text-sm shrink-0">repositories[].name</code>
            <p class="text-neutral-600 dark:text-neutral-300">リポジトリ名 (e.g. user/repo)</p>
          </div>
          <div class="bg-back dark:bg-back-dark p-6 flex items-start gap-4">
            <code class="text-primary font-mono text-sm shrink-0">repositories[].description</code>
            <p class="text-neutral-600 dark:text-neutral-300">リポジトリの説明 (GitHubの場合)</p>
          </div>
          <div class="bg-back dark:bg-back-dark p-6 flex items-start gap-4">
            <code class="text-primary font-mono text-sm shrink-0">repositories[].count</code>
            <p class="text-neutral-600 dark:text-neutral-300">このリポジトリを使用しているインスタンス数</p>
          </div>
          <div class="bg-back dark:bg-back-dark p-6 flex items-start gap-4">
            <code class="text-primary font-mono text-sm shrink-0">languages</code>
            <p class="text-neutral-600 dark:text-neutral-300">言語ごとの使用数 (多い順)</p>
          </div>
          <div class="bg-back dark:bg-back-dark p-6 flex items-start gap-4">
            <code class="text-primary font-mono text-sm shrink-0">languages[].code</code>
            <p class="text-neutral-600 dark:text-neutral-300">ISO 639-1 言語コード (e.g. ja, en)</p>
          </div>
          <div class="bg-back dark:bg-back-dark p-6 flex items-start gap-4">
            <code class="text-primary font-mono text-sm shrink-0">languages[].count</code>
            <p class="text-neutral-600 dark:text-neutral-300">この言語が主要言語のインスタンス数</p>
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
            class="text-primary font-mono text-sm overflow-x-auto"><code>curl "https://servers.misskey.ink/api/v1/stats"</code></pre>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'GET /api/v1/stats - (Unofficial) Misskey Server List',
  meta: [
    { name: 'description', content: '統計情報とリポジトリ使用状況の一覧を取得します。' },
    { property: 'og:title', content: 'GET /api/v1/stats - (Unofficial) Misskey Server List' },
    { property: 'og:description', content: '統計情報とリポジトリ使用状況の一覧を取得します。' },
    { property: 'og:url', content: 'https://servers.misskey.ink/docs/api/v1/stats' },
    { name: 'twitter:title', content: 'GET /api/v1/stats - (Unofficial) Misskey Server List' },
    { name: 'twitter:description', content: '統計情報とリポジトリ使用状況の一覧を取得します。' },
  ]
});

useJsonld(() => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'GET /api/v1/stats',
  description: '統計情報とリポジトリ使用状況の一覧を取得します。',
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
        name: 'stats',
        item: 'https://servers.misskey.ink/docs/api/v1/stats'
      }
    ]
  }
}));
</script>
