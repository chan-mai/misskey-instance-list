<template>
  <div class="bg-neutral-50 dark:bg-black">
    <!-- Hero -->
    <IndexHero :stats="stats" />

    <!-- Background Section -->
    <section class="py-24 bg-white dark:bg-neutral-900">
      <div class="container mx-auto max-w-screen-xl px-6">
        <div class="grid lg:grid-cols-2 gap-16 items-start">
          <!-- Section header -->
          <SectionHeader number="01" title="Background" />

          <!-- Content -->
          <div class="space-y-6 text-neutral-600 dark:text-neutral-300 leading-relaxed">
            <p>
              公式のMisskeyHubに掲載されていたサーバーリストが突如メンテナンス状態となり、長期間にわたって復旧する気配がありませんでした。
            </p>
            <p>
              開発者は「混乱を避けるため」と説明していましたが、おそらく
              <NuxtLink class="text-primary hover:text-primary/70 transition-colors"
                to="https://github.com/yunfie-twitter/cherrypick/commit/98ae8b5d869bac470aad2b8f025318f2c222e432"
                target="_blank">CherryPickの実装変更</NuxtLink>
              が原因と思われます。
            </p>
            <p>
              CherryPickは、Misskeyの派生プロジェクトの一つですが、現行のCherryPickは、
              <NuxtLink class="text-primary hover:text-primary/70 transition-colors"
                to="https://github.com/yunfie-twitter/cherrypick/commit/98ae8b5d869bac470aad2b8f025318f2c222e432#diff-c99e10daaf6c2db57012b73a31a76d7e3bbbf9e2599ed226e2f1651cdff40c20"
                target="_blank">特定のUAに対し、メタデータで自身をMisskeyのように偽って返す仕組み</NuxtLink>
              になっています。
            </p>
            <p>
              このリストでは、CherryPickのようなスプーフィングを自動的に除外し、純粋なMisskeyサーバーのみを掲載しています。
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-24 bg-neutral-50 dark:bg-black">
      <div class="container mx-auto max-w-screen-xl px-6">
        <SectionHeader number="02" title="Features" />

        <div class="grid md:grid-cols-3 gap-8">
          <div class="p-8 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
            <span class="text-5xl font-bold text-primary/30">01</span>
            <h3 class="text-xl font-bold text-neutral-900 dark:text-white mt-4 mb-3">スプーフィング除外</h3>
            <p class="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              CherryPickなどの偽装サーバーを自動的に検出・除外。純粋なMisskeyサーバーのみを掲載。
            </p>
          </div>
          <div class="p-8 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
            <span class="text-5xl font-bold text-primary/30">02</span>
            <h3 class="text-xl font-bold text-neutral-900 dark:text-white mt-4 mb-3">自動更新</h3>
            <p class="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              定期的にサーバー情報を自動取得・更新。常に最新の状態を維持。
            </p>
          </div>
          <div class="p-8 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
            <span class="text-5xl font-bold text-primary/30">03</span>
            <h3 class="text-xl font-bold text-neutral-900 dark:text-white mt-4 mb-3">検索・ソート</h3>
            <p class="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              サーバー名での検索、ユーザー数・ノート数でのソートなど、便利な機能を提供。
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <CtaSection :stats="stats" />
  </div>
</template>

<script setup lang="ts">
const { data: stats } = await useFetch('/api/v1/stats');

useHead({
  title: '(Unofficial) Misskey Server List | Misskeyサーバー・インスタンスリスト',
  meta: [
    { name: 'keywords', content: 'Misskey,Server List,Instance List,Misskeyサーバー,インスタンス,Fediverse,ActivityPub,サーバー検索,About' },
    { name: 'description', content: '非公式Misskeyサーバーリスト(インスタンスリスト)について' },
    { property: 'og:title', content: '(Unofficial) Misskey Server List | Misskeyサーバー・インスタンスリスト' },
    { property: 'og:description', content: '非公式Misskeyサーバーリスト(インスタンスリスト)について' },
    { property: 'og:url', content: 'https://servers.misskey.ink/' },
    { name: 'twitter:title', content: '(Unofficial) Misskey Server List | Misskeyサーバー・インスタンスリスト' },
    { name: 'twitter:description', content: '非公式Misskeyサーバーリスト(インスタンスリスト)について' },
  ]
});

defineOptions({
  jsonld() {
    return [
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: '(Unofficial) Misskey Server List',
        url: 'https://servers.misskey.ink/',
        description: 'あなたにぴったりのMisskeyサーバーを見つけよう。登録数、ノート数、活動率などで検索できる非公式のMisskeyサーバーリスト(インスタンスリスト)です。',
        inLanguage: 'ja',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://servers.misskey.ink/servers?q={search_term_string}',
          'query-input': 'required name=search_term_string'
        }
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: '(Unofficial) Misskey Server List',
        url: 'https://servers.misskey.ink/',
        logo: 'https://servers.misskey.ink/icon.png',
        description: '非公式Misskeyサーバーリスト(インスタンスリスト)'
      }
    ];
  }
});
</script>
