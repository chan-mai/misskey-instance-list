<template>
  <div class="bg-neutral-50 dark:bg-black">
    <!-- Hero -->
    <IndexHero :stats="stats" />

    <!-- What is Misskey? -->
    <section class="py-24 bg-white dark:bg-neutral-900">
      <div class="container mx-auto max-w-screen-xl px-6">
        <div class="grid lg:grid-cols-2 gap-16 items-start">
          <SectionHeader number="01" title="What is Misskey?" />
          <div class="space-y-6 text-neutral-600 dark:text-neutral-300 leading-relaxed">
            <p>
              <NuxtLink to="https://misskey-hub.net/" target="_blank" class="text-primary hover:text-primary/70 transition-colors duration-200">Misskey</NuxtLink>は、日本発の分散型SNSプラットフォームです。
              Twitter(X)のようなタイムライン形式のインターフェースを持ちながら、
              <NuxtLink to="https://misskey-hub.net/ja/docs/for-users/features/reaction/" target="_blank" class="text-primary hover:text-primary/70 transition-colors duration-200">リアクション機能</NuxtLink>や
              <NuxtLink to="https://misskey-hub.net/ja/docs/for-users/features/mfm/" target="_blank" class="text-primary hover:text-primary/70 transition-colors duration-200">MFM</NuxtLink>
              による豊かな表現力が特徴です。
            </p>
            <p>
              Misskeyのサーバーは一つではありません。
              誰でも自分でサーバー(インスタンス)を建てられて、
              別のサーバーにいるユーザーともActivityPubというプロトコルを通じてやり取りが可能です。
              この繋がり全体Fediverseと呼びます。
            </p>
            <p>
              基本的に、どのサーバーに登録してもFediverse全体とやり取りできます。
              まずは気になるサーバーをこのリストから探してみてください。
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-24 bg-neutral-50 dark:bg-black">
      <div class="container mx-auto max-w-screen-xl px-6">
        <SectionHeader number="02" title="Why this list?" />

        <div class="grid md:grid-cols-3 gap-8">
          <div class="p-8 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
            <span class="text-5xl font-bold text-primary/30">01</span>
            <h3 class="text-xl font-bold text-neutral-900 dark:text-white mt-4 mb-3">偽装サーバーの除外</h3>
            <p class="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              CherryPickのようなMisskeyを名乗るサーバーを自動で検出して除外しています。
              スパムや悪質な運営のサーバーも掲載していません。
            </p>
          </div>
          <div class="p-8 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
            <span class="text-5xl font-bold text-primary/30">02</span>
            <h3 class="text-xl font-bold text-neutral-900 dark:text-white mt-4 mb-3">情報の更新</h3>
            <p class="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              クローラーが定期的に各サーバーを巡回して情報を取り直しています。
              表示しているユーザー数やノート数は、今現在のサーバーの状態です。
            </p>
          </div>
          <div class="p-8 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
            <span class="text-5xl font-bold text-primary/30">03</span>
            <h3 class="text-xl font-bold text-neutral-900 dark:text-white mt-4 mb-3">検索と絞り込み</h3>
            <p class="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              言語やキーワード、ユーザー数、新規登録の可否で絞り込むことができます。
              条件を変えながら、自分にあったサーバーを探してみてください。
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- How to Choose -->
    <section class="py-24 bg-white dark:bg-neutral-900">
      <div class="container mx-auto max-w-screen-xl px-6">
        <div class="grid lg:grid-cols-2 gap-16 items-start">
          <SectionHeader number="03" title="How to choose" />
          <div class="space-y-8 text-neutral-600 dark:text-neutral-300 leading-relaxed">
            <div>
              <h3 class="text-xl font-bold text-neutral-900 dark:text-white mb-3">1. 雰囲気で選ぶ</h3>
              <p>
                汎用サーバーには雑談や日常の投稿が多く、
                ゲームや技術、創作など特定の話題に人が集まっているサーバーもあります。
                説明文だけでは分かりにくいので、公開タイムラインを実際に見てみるのもいいかもしれません。
              </p>
            </div>
            <div>
              <h3 class="text-xl font-bold text-neutral-900 dark:text-white mb-3">2. 規模で選ぶ</h3>
              <p>
                大規模サーバ: ユーザーが多く、タイムラインの流れが速いです。常に誰かが居る安心感があります。<br>
                小・中規模サーバ: コミュニティの結束が強く、アットホームな雰囲気の場合が多いです。顔なじみを作りやすいでしょう。
              </p>
            </div>
            <div>
              <h3 class="text-xl font-bold text-neutral-900 dark:text-white mb-3">3. ルールを確認する</h3>
              <p>
                サーバーごとに利用規約が異なります。
                NSFWコンテンツの取扱いや、公用語、禁止事項などを事前に確認しましょう。
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Background Section -->
    <section class="py-24 bg-neutral-50 dark:bg-black">
      <div class="container mx-auto max-w-screen-xl px-6">
        <div class="grid lg:grid-cols-2 gap-16 items-start">
          <!-- Section header -->
          <SectionHeader number="04" title="Background" />

          <!-- Content -->
          <div class="space-y-6 text-neutral-600 dark:text-neutral-300 leading-relaxed">
            <p>
              公式のMisskeyHubにあったサーバーリストがメンテナンス状態になったまま、長いあいだ戻ってきませんでした。
            </p>
            <p>
              開発者は「混乱を避けるため」と説明していましたが、実際には
              <NuxtLink class="text-primary hover:text-primary/70 transition-colors duration-200"
                to="https://github.com/yunfie-twitter/cherrypick/commit/98ae8b5d869bac470aad2b8f025318f2c222e432"
                target="_blank">CherryPickの実装変更</NuxtLink>
              が原因かと言われています。
            </p>
            <p>
              CherryPickはMisskeyの派生プロジェクトでした。現在のCherryPickは、
              <NuxtLink class="text-primary hover:text-primary/70 transition-colors duration-200"
                to="https://github.com/yunfie-twitter/cherrypick/commit/98ae8b5d869bac470aad2b8f025318f2c222e432#diff-c99e10daaf6c2db57012b73a31a76d7e3bbbf9e2599ed226e2f1651cdff40c20"
                target="_blank">特定のUser-Agentに対してのみ、自身をMisskeyだと偽ったメタデータをレスポンスしています</NuxtLink>。
            </p>
            <p>
              このリストでは、こうした偽装を検出して除外し、Misskeyと軽微なフォークのみを掲載しています。
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Mechanism Section -->
    <section class="py-24 bg-white dark:bg-neutral-900">
      <div class="container mx-auto max-w-screen-xl px-6">
        <SectionHeader number="05" title="Mechanism" />
        <div class="grid lg:grid-cols-2 gap-16 items-start">
          <div class="space-y-6 text-neutral-600 dark:text-neutral-300 leading-relaxed">
            <h3 class="text-xl font-bold text-neutral-900 dark:text-white mb-2">
              <span class="text-primary">01.</span> Safe & Clean
            </h3>
            <p>
              クローラーは各サーバーからメタデータを収集し、独自の検証プロセスを経て掲載されています。
              Misskeyではないソフトウェアと、CherryPickやSharkey等の軽微ではないフォークは掲載されません。
            </p>
            <p>
              自身をMisskeyだと偽るホストがあるため、取得条件を変えた複数回の取得結果の整合性を確認しています。
            </p>
            <p>
              除外したホストは理由とともに記録し、明示的に除外しています。
              スパムや悪質な運営のサーバーも同様に除外されている可能性があります。
            </p>
          </div>

          <div class="space-y-6 text-neutral-600 dark:text-neutral-300 leading-relaxed">
            <h3 class="text-xl font-bold text-neutral-900 dark:text-white mb-2">
              <span class="text-primary">02.</span> Discovery & Ranking
            </h3>
            <p>
              掲載対象は連合をたどって探索しています。
              稼働中のインスタンスから無作為に数件を選び、それぞれの連合先を候補に追加しています。管理者やモデレータによる申請は原則として不要です。
            </p>
            <p>
              並び順に使うスコアは、投稿数、ユーザー数、1日あたりの投稿数、バージョンの新しさ等が加味され、独自のアルゴリズムにより算出されています。
            </p>
            <p>
              主要言語は、サーバー内で利用されている言語を元に判定されるため、公開タイムラインやサーバーのブランディング設定の影響を受けることがあります。
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="py-24 bg-neutral-50 dark:bg-black">
      <div class="container mx-auto max-w-screen-xl px-6">
        <SectionHeader number="06" title="FAQ" />

        <div class="grid md:grid-cols-2 gap-8 mt-8">
          <div class="space-y-4">
            <div class="bg-neutral-50 dark:bg-neutral-950 p-6 rounded-lg">
              <h4 class="font-bold text-lg text-neutral-900 dark:text-white mb-2">Q. 利用にお金はかかりますか？</h4>
              <p class="text-neutral-600 dark:text-neutral-400">
                A. ほとんどのサーバーは無料で使えます。
                運営費の寄付を募っているサーバーや、一部の機能だけ有料にしているサーバーもあります。
              </p>
            </div>
            <div class="bg-neutral-50 dark:bg-neutral-950 p-6 rounded-lg">
              <h4 class="font-bold text-lg text-neutral-900 dark:text-white mb-2">Q. 複数のサーバーに登録できますか？</h4>
              <p class="text-neutral-600 dark:text-neutral-400">
                A. できます。趣味用と技術用でアカウントを分けている人もよく見かけます。
              </p>
            </div>
          </div>
          <div class="space-y-4">
            <div class="bg-neutral-50 dark:bg-neutral-950 p-6 rounded-lg">
              <h4 class="font-bold text-lg text-neutral-900 dark:text-white mb-2">Q. 他のサーバーの人と話せますか？</h4>
              <p class="text-neutral-600 dark:text-neutral-400">
                A. 基本的には可能です。サーバーの設定にもよりますが、ActivityPubに対応しているため、他のMisskeyサーバーはもちろん、Mastodonなどのユーザーもフォローしたりリプライしたりできます。
              </p>
            </div>
            <div class="bg-neutral-50 dark:bg-neutral-950 p-6 rounded-lg">
              <h4 class="font-bold text-lg text-neutral-900 dark:text-white mb-2">Q. 自分のサーバーを掲載したいです</h4>
              <p class="text-neutral-600 dark:text-neutral-400">
                A. 掲載の申請は受け付けていません。
                クローラーがFediverseを巡回しているので自動で掲載されます。規模の大きいサーバーと連合することで、より掲載されやすくなる可能性があります。
              </p>
            </div>
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
    { name: 'keywords', content: 'Misskey,Server List,Instance List,Misskeyサーバー,インスタンス,Fediverse,ActivityPub,サーバー検索,分散型SNS' },
    { name: 'description', content: 'あなたにぴったりのMisskeyサーバーを見つけよう。登録数、ノート数、活動率などで検索できる非公式のMisskeyサーバーリスト(インスタンスリスト)です。' },
    { property: 'og:title', content: '(Unofficial) Misskey Server List | Misskeyサーバー・インスタンスリスト' },
    { property: 'og:description', content: 'あなたにぴったりのMisskeyサーバーを見つけよう。登録数、ノート数、活動率などで検索できる非公式のMisskeyサーバーリスト(インスタンスリスト)です。' },
    { property: 'og:url', content: 'https://servers.misskey.ink/' },
    { name: 'twitter:title', content: '(Unofficial) Misskey Server List | Misskeyサーバー・インスタンスリスト' },
    { name: 'twitter:description', content: 'あなたにぴったりのMisskeyサーバーを見つけよう。登録数、ノート数、活動率などで検索できる非公式のMisskeyサーバーリスト(インスタンスリスト)です。' },
  ]
});

useJsonld(() => [
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
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '利用にお金はかかりますか？',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'ほとんどのサーバーは無料で使えます。運営費の寄付を募っているサーバーや、一部の機能だけ有料にしているサーバーもあります。'
        }
      },
      {
        '@type': 'Question',
        name: '複数のサーバーに登録できますか？',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'できます。趣味用と技術用でアカウントを分けている人もよく見かけます。'
        }
      },
      {
        '@type': 'Question',
        name: '他のサーバーの人と話せますか？',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '話せます。ActivityPubに対応しているので、他のMisskeyサーバーはもちろん、Mastodonなどのユーザーもフォローしたりリプライしたりできます。'
        }
      },
      {
        '@type': 'Question',
        name: '自分のサーバーを掲載したいです',
        acceptedAnswer: {
          '@type': 'Answer',
          text: '掲載の申請は受け付けていません。クローラーがFediverseを巡回しているので、規模の大きいサーバーと連合していれば、そのうち見つかって掲載されます。'
        }
      }
    ]
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '(Unofficial) Misskey Server List',
    url: 'https://servers.misskey.ink/',
    logo: 'https://servers.misskey.ink/icon.png',
    description: '非公式Misskeyサーバーリスト(インスタンスリスト)'
  }
]);
</script>
