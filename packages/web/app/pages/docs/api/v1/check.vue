<template>
  <div class="bg-neutral-50 dark:bg-black">
    <!-- Hero -->
    <DocApiHero method="GET" endpoint="/api/v1/check"
      description="指定されたドメインが有効なMisskeyインスタンスかどうかを確認します。" />

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
                <th class="text-left py-4 px-4 font-medium text-xs tracking-widest uppercase text-neutral-400">Required
                </th>
                <th class="text-left py-4 px-4 font-medium text-xs tracking-widest uppercase text-neutral-400">
                  Description</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-100 dark:divide-neutral-800">
              <tr class="hover:bg-neutral-50 dark:hover:bg-neutral-900">
                <td class="py-4 px-4 font-mono text-primary">domain</td>
                <td class="py-4 px-4 text-neutral-500">string</td>
                <td class="py-4 px-4 text-red-500">true</td>
                <td class="py-4 px-4 text-neutral-600 dark:text-neutral-300">確認対象のドメイン</td>
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

        <pre
          class="bg-back-dark text-neutral-100 p-6 lg:p-8 overflow-x-auto text-sm font-mono leading-relaxed mb-12"><code>{
  "is_misskey": true,
  "data": {
    "name": "Misskey.Example",
    "version": "2024.1.0",
    "icon": "https://media.example.com/assets/icon.png",
    "banner": "https://media.example.com/assets/banner.jpg",
    "softwareName": "misskey",
    "description": "Misskey Example"
  },
  "is_embeddable": true,
  "source": "database"
}</code></pre>

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
                <td class="py-4 px-4 font-mono text-primary">is_misskey</td>
                <td class="py-4 px-4 text-neutral-500">boolean</td>
                <td class="py-4 px-4 text-neutral-600 dark:text-neutral-300">Misskeyインスタンスかどうか</td>
              </tr>
              <tr class="hover:bg-neutral-50 dark:hover:bg-neutral-900">
                <td class="py-4 px-4 font-mono text-primary">is_embeddable</td>
                <td class="py-4 px-4 text-neutral-500">boolean</td>
                <td class="py-4 px-4 text-neutral-600 dark:text-neutral-300">埋め込み(iframe)に対応しているか</td>
              </tr>
              <tr class="hover:bg-neutral-50 dark:hover:bg-neutral-900">
                <td class="py-4 px-4 font-mono text-primary">data</td>
                <td class="py-4 px-4 text-neutral-500">object | null</td>
                <td class="py-4 px-4 text-neutral-600 dark:text-neutral-300">インスタンス情報(is_misskey=true時)</td>
              </tr>
              <tr class="hover:bg-neutral-50 dark:hover:bg-neutral-900">
                <td class="py-4 px-4 font-mono text-primary pl-8">.name</td>
                <td class="py-4 px-4 text-neutral-500">string</td>
                <td class="py-4 px-4 text-neutral-600 dark:text-neutral-300">インスタンス名</td>
              </tr>
              <tr class="hover:bg-neutral-50 dark:hover:bg-neutral-900">
                <td class="py-4 px-4 font-mono text-primary pl-8">.version</td>
                <td class="py-4 px-4 text-neutral-500">string</td>
                <td class="py-4 px-4 text-neutral-600 dark:text-neutral-300">バージョン</td>
              </tr>
              <tr class="hover:bg-neutral-50 dark:hover:bg-neutral-900">
                <td class="py-4 px-4 font-mono text-primary pl-8">.icon</td>
                <td class="py-4 px-4 text-neutral-500">string | null</td>
                <td class="py-4 px-4 text-neutral-600 dark:text-neutral-300">アイコンURL</td>
              </tr>
               <tr class="hover:bg-neutral-50 dark:hover:bg-neutral-900">
                <td class="py-4 px-4 font-mono text-primary pl-8">.banner</td>
                <td class="py-4 px-4 text-neutral-500">string | null</td>
                <td class="py-4 px-4 text-neutral-600 dark:text-neutral-300">バナーURL</td>
              </tr>
              <tr class="hover:bg-neutral-50 dark:hover:bg-neutral-900">
                <td class="py-4 px-4 font-mono text-primary pl-8">.softwareName</td>
                <td class="py-4 px-4 text-neutral-500">string | null</td>
                <td class="py-4 px-4 text-neutral-600 dark:text-neutral-300">ソフトウェア名</td>
              </tr>
              <tr class="hover:bg-neutral-50 dark:hover:bg-neutral-900">
                <td class="py-4 px-4 font-mono text-primary pl-8">.description</td>
                <td class="py-4 px-4 text-neutral-500">string | null</td>
                <td class="py-4 px-4 text-neutral-600 dark:text-neutral-300">インスタンス説明</td>
              </tr>
              <tr class="hover:bg-neutral-50 dark:hover:bg-neutral-900">
                <td class="py-4 px-4 font-mono text-primary">reason</td>
                <td class="py-4 px-4 text-neutral-500">string | null</td>
                <td class="py-4 px-4 text-neutral-600 dark:text-neutral-300">非Misskey判定時の理由</td>
              </tr>
              <tr class="hover:bg-neutral-50 dark:hover:bg-neutral-900">
                <td class="py-4 px-4 font-mono text-primary">source</td>
                <td class="py-4 px-4 text-neutral-500">database | fetch</td>
                <td class="py-4 px-4 text-neutral-600 dark:text-neutral-300">情報の取得元 (database: DBキャッシュ, fetch: 外部取得)</td>
              </tr>
               <tr class="hover:bg-neutral-50 dark:hover:bg-neutral-900">
                <td class="py-4 px-4 font-mono text-primary">error</td>
                <td class="py-4 px-4 text-neutral-500">string | null</td>
                <td class="py-4 px-4 text-neutral-600 dark:text-neutral-300">エラーメッセージ</td>
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
            class="text-primary font-mono text-sm overflow-x-auto"><code>curl "https://servers.misskey.ink/api/v1/check?domain=example.com"</code></pre>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'GET /api/v1/check - (Unofficial) Misskey Server List',
  meta: [
    { name: 'description', content: '指定されたドメインが有効なMisskeyインスタンスかどうかを確認します。' },
    { property: 'og:title', content: 'GET /api/v1/check - (Unofficial) Misskey Server List' },
    { property: 'og:description', content: '指定されたドメインが有効なMisskeyインスタンスかどうかを確認します。' },
    { property: 'og:url', content: 'https://servers.misskey.ink/docs/api/v1/check' },
    { name: 'twitter:title', content: 'GET /api/v1/check - (Unofficial) Misskey Server List' },
    { name: 'twitter:description', content: '指定されたドメインが有効なMisskeyインスタンスかどうかを確認します。' },
  ]
});

useJsonld(() => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'GET /api/v1/check',
  description: '指定されたドメインが有効なMisskeyインスタンスかどうかを確認します。',
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
        name: 'check',
        item: 'https://servers.misskey.ink/docs/api/v1/check'
      }
    ]
  }
}));
</script>
