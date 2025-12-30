<template>
  <div class="bg-neutral-50 dark:bg-black">
    <!-- Hero -->
    <Hero label="Developer Resources" title="API v1" description="(Unofficial) Misskey Server List API v1 Documentation"
      :show-scroll="true" />

    <!-- Endpoints Section -->
    <section class="py-24 bg-neutral-50 dark:bg-black">
      <div class="container mx-auto max-w-screen-xl px-6">
        <div class="mb-16">
          <p class="text-xs font-medium tracking-widest uppercase text-neutral-400 mb-4">01</p>
          <h2 class="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white mb-6">Endpoints</h2>
          <div class="w-16 h-px bg-primary"></div>
        </div>

        <div class="grid gap-px bg-neutral-200 dark:bg-neutral-800">
          <!-- Instances API -->
          <NuxtLink to="/docs/api/v1/instances"
            class="group bg-back dark:bg-back-dark p-6 lg:p-8 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
            <div class="flex items-center gap-4 mb-3">
              <span
                class="px-3 py-1 text-xs font-mono font-bold bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">GET</span>
              <code
                class="text-lg font-mono text-neutral-900 dark:text-white group-hover:text-primary transition-colors">/api/v1/instances</code>
              <Icon name="lucide:chevron-right"
                class="h-4 w-4 text-neutral-400 group-hover:text-primary transition-colors ml-auto" />
            </div>
            <p class="text-neutral-500 text-sm">Misskeyサーバーの一覧を取得します。検索、ソート、ページネーションに対応。</p>
          </NuxtLink>

          <!-- Deny Instances API -->
          <NuxtLink to="/docs/api/v1/deny_instances"
            class="group bg-back dark:bg-back-dark p-6 lg:p-8 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
            <div class="flex items-center gap-4 mb-3">
              <span
                class="px-3 py-1 text-xs font-mono font-bold bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">GET</span>
              <code
                class="text-lg font-mono text-neutral-900 dark:text-white group-hover:text-primary transition-colors">/api/v1/deny_instances</code>
              <Icon name="lucide:chevron-right"
                class="h-4 w-4 text-neutral-400 group-hover:text-primary transition-colors ml-auto" />
            </div>
            <p class="text-neutral-500 text-sm">拒否リストに登録されているサーバーの一覧を取得します。</p>
          </NuxtLink>

          <!-- Ignore Instances API -->
          <NuxtLink to="/docs/api/v1/ignore_instances"
            class="group bg-back dark:bg-back-dark p-6 lg:p-8 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
            <div class="flex items-center gap-4 mb-3">
              <span
                class="px-3 py-1 text-xs font-mono font-bold bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">GET</span>
              <code
                class="text-lg font-mono text-neutral-900 dark:text-white group-hover:text-primary transition-colors">/api/v1/ignore_instances</code>
              <Icon name="lucide:chevron-right"
                class="h-4 w-4 text-neutral-400 group-hover:text-primary transition-colors ml-auto" />
            </div>
            <p class="text-neutral-500 text-sm">無視リストに登録されているサーバーの一覧を取得します。</p>
          </NuxtLink>

          <!-- Stats API -->
          <NuxtLink to="/docs/api/v1/stats"
            class="group bg-back dark:bg-back-dark p-6 lg:p-8 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors">
            <div class="flex items-center gap-4 mb-3">
              <span
                class="px-3 py-1 text-xs font-mono font-bold bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">GET</span>
              <code
                class="text-lg font-mono text-neutral-900 dark:text-white group-hover:text-primary transition-colors">/api/v1/stats</code>
              <Icon name="lucide:chevron-right"
                class="h-4 w-4 text-neutral-400 group-hover:text-primary transition-colors ml-auto" />
            </div>
            <p class="text-neutral-500 text-sm">統計情報とリポジトリ使用状況の一覧を取得します。</p>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Base URL Section -->
    <section class="py-24 bg-neutral-50 dark:bg-neutral-950">
      <div class="container mx-auto max-w-screen-xl px-6">
        <div class="mb-16">
          <p class="text-xs font-medium tracking-widest uppercase text-neutral-400 mb-4">02</p>
          <h2 class="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white mb-6">Base URL</h2>
          <div class="w-16 h-px bg-primary"></div>
        </div>

        <div class="bg-neutral-100 dark:bg-neutral-900 p-8">
          <code class="text-xl lg:text-2xl font-mono text-primary">https://servers.misskey.ink/api/v1</code>
        </div>

        <div class="mt-8 grid lg:grid-cols-3 gap-px bg-neutral-200 dark:bg-neutral-800">
          <div class="bg-back dark:bg-back-dark p-6">
            <p class="text-xs font-medium tracking-widest uppercase text-neutral-400 mb-2">Format</p>
            <p class="text-lg font-medium text-neutral-900 dark:text-white">JSON</p>
          </div>
          <div class="bg-back dark:bg-back-dark p-6">
            <p class="text-xs font-medium tracking-widest uppercase text-neutral-400 mb-2">Authentication</p>
            <p class="text-lg font-medium text-neutral-900 dark:text-white">Not Required</p>
          </div>
          <div class="bg-back dark:bg-back-dark p-6">
            <p class="text-xs font-medium tracking-widest uppercase text-neutral-400 mb-2">Rate Limit</p>
            <p class="text-lg font-medium text-neutral-900 dark:text-white">150 requests / min</p>
          </div>
        </div>
      </div>
    </section>
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

useJsonld(() => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'API v1 Documentation',
  description: 'Misskey Server List API v1のドキュメント。',
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
      }
    ]
  }
}
));
</script>
