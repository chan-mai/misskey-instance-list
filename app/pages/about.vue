<template>
  <div class="bg-neutral-50 dark:bg-black">
    <!-- Hero -->
    <PageHero
      label="(Unofficial) Misskey Server List"
      title="About"
      description="このサイトについて"
      :show-scroll="true"
    />

    <!-- Background Section -->
    <section class="py-24 bg-white dark:bg-neutral-900">
      <div class="container mx-auto max-w-screen-xl px-6">
        <div class="grid lg:grid-cols-2 gap-16 items-start">
          <!-- Section header -->
        <div class="mb-16">
          <p class="text-xs font-medium tracking-widest uppercase text-neutral-400 mb-4">01</p>
          <h2 class="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white mb-6">Background</h2>
          <div class="w-16 h-px bg-primary"></div>
        </div>

          <!-- Content -->
          <div class="space-y-6 text-neutral-600 dark:text-neutral-300 leading-relaxed">
            <p>
              公式のMisskeyHubに掲載されていたサーバーリストが突如メンテナンス状態となり、長期間にわたって復旧する気配がありませんでした。
            </p>
            <p>
              開発者は「混乱を避けるため」と説明していましたが、おそらく
              <NuxtLink
                class="text-primary hover:text-primary/70 transition-colors"
                to="https://github.com/yunfie-twitter/cherrypick/commit/98ae8b5d869bac470aad2b8f025318f2c222e432"
                target="_blank"
              >CherryPickの実装変更</NuxtLink>
              が原因と思われます。
            </p>
            <p>
              CherryPickは、Misskeyの派生プロジェクトの一つですが、現行のCherryPickは、
              <NuxtLink
                class="text-primary hover:text-primary/70 transition-colors"
                to="https://github.com/yunfie-twitter/cherrypick/commit/98ae8b5d869bac470aad2b8f025318f2c222e432#diff-c99e10daaf6c2db57012b73a31a76d7e3bbbf9e2599ed226e2f1651cdff40c20"
                target="_blank"
              >特定のUAに対し、メタデータで自身をMisskeyのように偽って返す仕組み</NuxtLink>
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
        <div class="mb-16">
          <p class="text-xs font-medium tracking-widest uppercase text-neutral-400 mb-4">02</p>
          <h2 class="text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white mb-6">Features</h2>
          <div class="w-16 h-px bg-primary"></div>
        </div>

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
    <section class="py-24 bg-neutral-100 dark:bg-black transition-colors duration-300">
      <div class="container mx-auto max-w-screen-xl px-6">
        <div class="flex flex-col lg:flex-row items-center justify-between gap-16">
          <!-- Text Content -->
          <div class="lg:w-1/2 text-center lg:text-left">
            <h2 class="text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-white mb-6">
              Let's find your server.
            </h2>
            <p class="text-lg text-neutral-600 dark:text-white/60 mb-10 max-w-xl mx-auto lg:mx-0">
              あなたにぴったりのMisskeyサーバーを見つけよう。
            </p>

            <NuxtLink 
              to="/"
              class="inline-flex items-center gap-3 px-10 py-5 bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 font-medium tracking-widest uppercase hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-colors duration-300"
            >
              サーバーを見つける
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </NuxtLink>
          </div>

          <!-- Stats Grid -->
          <div class="hidden lg:block lg:w-1/2 w-full  max-w-lg">
            <div class="grid grid-cols-2 gap-6">
              <div class="bg-white dark:bg-neutral-900 p-8 rounded-2xl shadow-sm">
                <p class="text-4xl font-bold text-neutral-900 dark:text-white mb-2">{{ stats?.counts?.active ? formatNumber(stats.counts.active) : '-' }}</p>
                <p class="text-xs text-neutral-500 dark:text-neutral-400 tracking-widest uppercase">Active</p>
              </div>
              <div class="bg-white dark:bg-neutral-900 p-8 rounded-2xl shadow-sm">
                <p class="text-4xl font-bold text-neutral-900 dark:text-white mb-2">{{ stats?.counts?.known ? formatNumber(stats.counts.known) : '-' }}</p>
                <p class="text-xs text-neutral-500 dark:text-neutral-400 tracking-widest uppercase">Known</p>
              </div>
              <div class="bg-white dark:bg-neutral-900 p-8 rounded-2xl shadow-sm">
                <p class="text-4xl font-bold text-neutral-900 dark:text-white mb-2">{{ stats?.repositories?.length || '-' }}</p>
                <p class="text-xs text-neutral-500 dark:text-neutral-400 tracking-widest uppercase">Software</p>
              </div>
              <div class="bg-white dark:bg-neutral-900 p-8 rounded-2xl shadow-sm">
                <p class="text-4xl font-bold text-neutral-900 dark:text-white mb-2">{{ stats?.languages?.length || '-' }}</p>
                <p class="text-xs text-neutral-500 dark:text-neutral-400 tracking-widest uppercase">Languages</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const formatNumber = (num: number | undefined | null) => {
  if (num == null) return '-';
  if (num >= 100000) {
    return new Intl.NumberFormat('ja-JP', { notation: 'compact', maximumFractionDigits: 1 }).format(num);
  }
  return new Intl.NumberFormat('ja-JP').format(num);
};

const { data: stats } = await useFetch('/api/v1/stats');

useHead({
  title: 'About - (Unofficial) Misskey Server List | Misskeyサーバー・インスタンスリスト',
  meta: [
    { name: 'keywords', content: 'Misskey,Server List,Instance List,Misskeyサーバー,インスタンス,Fediverse,ActivityPub,サーバー検索,About' },
    { name: 'description', content: '非公式Misskeyサーバーリスト(インスタンスリスト)について' },
    { property: 'og:title', content: 'About - (Unofficial) Misskey Server List | Misskeyサーバー・インスタンスリスト' },
    { property: 'og:description', content: '非公式Misskeyサーバーリスト(インスタンスリスト)について' },
    { property: 'og:url', content: 'https://servers.misskey.ink/about' },
    { name: 'twitter:title', content: 'About - (Unofficial) Misskey Server List | Misskeyサーバー・インスタンスリスト' },
    { name: 'twitter:description', content: '非公式Misskeyサーバーリスト(インスタンスリスト)について' },
  ]
});
</script>
