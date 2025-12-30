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
              <strong class="text-neutral-900 dark:text-white font-bold">Misskey</strong>は、日本発の分散型SNSプラットフォームです。
              Twitter(X)のようなタイムライン形式のインターフェースを持ちながら、
              <span class="text-primary font-medium">リアクション機能</span>や
              <span class="text-primary font-medium">MFM (Misskey Flavored Markdown)</span>
              による豊かな表現力が特徴です。
            </p>
            <p>
              最大の特徴は「分散型」であることです。
              一つの巨大なサーバーに全てのユーザーが集まるのではなく、
              誰でも自由にサーバー(インスタンス)を建てることができ、
              それらが<strong>ActivityPub</strong>というプロトコルを通じて互いに繋がっています。
              これを<strong>Fediverse(フェディバース)</strong>と呼びます。
            </p>
            <p>
              あなたはこのリストから、自分に合ったサーバーを見つけて、
              広大なFediverseの世界に参加することができます。
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
            <h3 class="text-xl font-bold text-neutral-900 dark:text-white mt-4 mb-3">安全なサーバー探し</h3>
            <p class="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              CherryPickなどの偽装サーバーを自動的に検出・除外。
              スパムや悪意のあるサーバーをフィルタリングし、純粋なMisskeyサーバーのみを掲載しています。
            </p>
          </div>
          <div class="p-8 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
            <span class="text-5xl font-bold text-primary/30">02</span>
            <h3 class="text-xl font-bold text-neutral-900 dark:text-white mt-4 mb-3">常に最新情報</h3>
            <p class="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              定期的にサーバー情報を自動取得・更新しています。
              ユーザー数やノート数、活動状況など、生きた情報をもとにサーバーを選ぶことができます。
            </p>
          </div>
          <div class="p-8 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800">
            <span class="text-5xl font-bold text-primary/30">03</span>
            <h3 class="text-xl font-bold text-neutral-900 dark:text-white mt-4 mb-3">高度な検索・比較</h3>
            <p class="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
              言語、キーワード、ユーザー数、機能(登録可否など)で細かく絞り込みが可能。
              あなたの目的に合ったサーバーがきっと見つかります。
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
                「汎用(General)」サーバーは雑談や日常の投稿が多い傾向にあります。
                特定の趣味(ゲーム、技術、創作など)に特化したサーバーもあります。
                各サーバーの説明文や、実際のタイムラインを覗いてみるのがおすすめです。
              </p>
            </div>
            <div>
              <h3 class="text-xl font-bold text-neutral-900 dark:text-white mb-3">2. 規模で選ぶ</h3>
              <p>
                <strong>大規模サーバー (io, misskey.designなど)</strong>: ユーザーが多く、タイムラインの流れが速いです。常に誰かが居る安心感があります。<br>
                <strong>小・中規模サーバー</strong>: コミュニティの結束が強く、アットホームな雰囲気の場合が多いです。顔なじみを作りやすいでしょう。
              </p>
            </div>
            <div>
              <h3 class="text-xl font-bold text-neutral-900 dark:text-white mb-3">3. ルールを確認する</h3>
              <p>
                サーバーごとに利用規約が異なります。
                NSFW(閲覧注意)コンテンツの取扱いや、公用語、禁止事項などを事前に確認しましょう。
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
              このリストは、独自のクローラーが定期的にFediverseを巡回し、以下の基準で厳格なフィルタリングを行っています。
            </p>
            <ul class="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong>リポジトリ/ソフトウェア検証:</strong>
                <span class="text-sm">
                  NodeInfoおよびAPIメタデータを照合し、Misskey (およびその正当なフォーク) 以外のソフトウェアを自動的に除外します。
                </span>
              </li>
              <li>
                <strong>スプーフィング検出:</strong>
                <span class="text-sm">
                  複数の異なるUser-Agentを用いてサーバーにアクセスし、特定のUAに対してのみMisskeyを偽装する"CherryPick"のような挙動を検知・ブロックします。
                </span>
              </li>
              <li>
                <strong>除外リスト:</strong>
                <span class="text-sm">
                  スパム、違法コンテンツ、悪意のある運営者が管理するサーバーは自動的にリストから排除されます。
                </span>
              </li>
            </ul>
          </div>

          <div class="space-y-6 text-neutral-600 dark:text-neutral-300 leading-relaxed">
            <h3 class="text-xl font-bold text-neutral-900 dark:text-white mb-2">
              <span class="text-primary">02.</span> Discovery & Ranking
            </h3>
            <p>
              「あなたにぴったりのサーバー」を見つけやすくするために、単なるリストアップ以上の工夫を行っています。
            </p>
            <ul class="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong>連合検出 (Federation Crawling):</strong>
                <span class="text-sm">
                  既知のサーバーから繋がっている別のサーバーを再帰的に・自動的に発見します。管理者が手動で登録しなくても、コミュニティの一部であれば自動的に掲載されます。
                </span>
              </li>
              <li>
                <strong>アクティブ指標:</strong>
                <span class="text-sm">
                  単なる登録者数だけでなく、「今、どれくらい活発か」(ノート数やアクティブユーザー数) を重視して表示順を調整しています。
                </span>
              </li>
              <li>
                <strong>言語解析:</strong>
                <span class="text-sm">
                  サーバーのメタデータだけでなく、実際のタイムライン(公開投稿)の一部をサンプリング・解析し、主要言語を自動判定しています。
                </span>
              </li>
            </ul>
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
                A. 多くのサーバーは有志によって運営されており、無料で利用できます。
                ただし、サーバー維持費の支援(寄付)を募っている場合や、一部機能が有料の場合もあります。
              </p>
            </div>
            <div class="bg-neutral-50 dark:bg-neutral-950 p-6 rounded-lg">
              <h4 class="font-bold text-lg text-neutral-900 dark:text-white mb-2">Q. 複数のサーバーに登録できますか？</h4>
              <p class="text-neutral-600 dark:text-neutral-400">
                A. はい、可能です。趣味用、実況用、技術用など、用途に合わせて複数のサーバーを使い分けるユーザーも多くいます。
              </p>
            </div>
          </div>
          <div class="space-y-4">
            <div class="bg-neutral-50 dark:bg-neutral-950 p-6 rounded-lg">
              <h4 class="font-bold text-lg text-neutral-900 dark:text-white mb-2">Q. 他のサーバーの人と話せますか？</h4>
              <p class="text-neutral-600 dark:text-neutral-400">
                A. はい。ActivityPubに対応しているため、他のMisskeyサーバーやMastodonなどのユーザーともフォロー・リプライ等のやり取りが可能です。
              </p>
            </div>
            <div class="bg-neutral-50 dark:bg-neutral-950 p-6 rounded-lg">
              <h4 class="font-bold text-lg text-neutral-900 dark:text-white mb-2">Q. 自分のサーバーを掲載したいです</h4>
              <p class="text-neutral-600 dark:text-neutral-400">
                A. このリストは自動的にFediverseを巡回してサーバーを発見しています。
                他の主要なサーバーと連合(Federation)していれば、自動的に掲載される可能性が高いです。
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
  title: 'Servers - (Unofficial) Misskey Server List | Misskeyサーバー・インスタンスリスト',
  meta: [
    { name: 'keywords', content: 'Misskey,Server List,Instance List,Misskeyサーバー,インスタンス,Fediverse,ActivityPub,サーバー検索,分散型SNS' },
    { name: 'description', content: 'あなたにぴったりのMisskeyサーバーを見つけよう。登録数、ノート数、活動率などで検索できる非公式のMisskeyサーバーリスト(インスタンスリスト)です。' },
    { property: 'og:title', content: 'Servers - (Unofficial) Misskey Server List | Misskeyサーバー・インスタンスリスト' },
    { property: 'og:description', content: 'あなたにぴったりのMisskeyサーバーを見つけよう。登録数、ノート数、活動率などで検索できる非公式のMisskeyサーバーリスト(インスタンスリスト)です。' },
    { property: 'og:url', content: 'https://servers.misskey.ink/' },
    { name: 'twitter:title', content: 'Servers - (Unofficial) Misskey Server List | Misskeyサーバー・インスタンスリスト' },
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
          text: '多くのサーバーは有志によって運営されており、無料で利用できます。ただし、サーバー維持費の支援（寄付）を募っている場合や、一部機能が有料の場合もあります。'
        }
      },
      {
        '@type': 'Question',
        name: '複数のサーバーに登録できますか？',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'はい、可能です。趣味用、実況用、技術用など、用途に合わせて複数のサーバーを使い分けるユーザーも多くいます。'
        }
      },
      {
        '@type': 'Question',
        name: '他のサーバーの人と話せますか？',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'はい。ActivityPubに対応しているため、他のMisskeyサーバーやMastodonなどのユーザーともフォロー・リプライ等のやり取りが可能です。'
        }
      },
      {
        '@type': 'Question',
        name: '自分のサーバーを掲載したいです',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'このリストは自動的にFediverseを巡回してサーバーを発見しています。他の主要なサーバーと連合（Federation）していれば、自動的に掲載される可能性が高いです。'
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
