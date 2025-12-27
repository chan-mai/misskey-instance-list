<template>
  <div class="bg-neutral-50 dark:bg-black">
    <!-- Hero -->
    <PageHero
      label="(Unofficial) Misskey Server List"
      title="Privacy Policy"
      description="本サイトにおける個人情報の取り扱い方針について"
      :show-scroll="true"
    />

    <!-- Content Section -->
    <section class="py-24 bg-white dark:bg-neutral-900">
      <div class="container mx-auto max-w-screen-lg px-6">
        <div class="space-y-12">
          
          <!-- 基本方針 -->
          <div class="grid lg:grid-cols-3 gap-8">
            <div>
              <h2 class="text-xl font-bold text-neutral-900 dark:text-white">基本方針</h2>
            </div>
            <div class="lg:col-span-2">
              <p class="text-neutral-600 dark:text-neutral-300 leading-relaxed">
                本サイトは、円滑な運営に必要な範囲で、ユーザーの個人情報を収集しております。収集した個人情報は、利用目的の範囲内で適切に取り扱います。また、個人情報の取り扱いに関する運用状況を適宜見直し、改善を図ってまいります。
              </p>
            </div>
          </div>

          <!-- 適用範囲 -->
          <div class="grid lg:grid-cols-3 gap-8">
            <div>
              <h2 class="text-xl font-bold text-neutral-900 dark:text-white">適用範囲</h2>
            </div>
            <div class="lg:col-span-2">
              <p class="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                本プライバシーポリシーは、ユーザーが本サイトを利用しているときにのみ適用されます。第三者が運営するサービスには適用されません。
              </p>
            </div>
          </div>

          <!-- 個人情報の収集範囲 -->
          <div class="grid lg:grid-cols-3 gap-8">
            <div>
              <h2 class="text-xl font-bold text-neutral-900 dark:text-white">個人情報の収集範囲</h2>
            </div>
            <div class="lg:col-span-2">
              <p class="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                本サイトは、ユーザーが利用している情報端末に関する情報や Cookie (ユーザーが利用している情報端末とウェブサイトとの間で、利用者を識別するためにやり取りされる情報のこと)を自動的に収集します。これには第三者が収集するものを含みますが、個人を特定できる情報は含まれておりません。第三者が収集するものにつきましては本プライバシーポリシー内の「アクセス解析ツールについて」をご覧ください。
              </p>
            </div>
          </div>

          <!-- 個人情報の利用目的 -->
          <div class="grid lg:grid-cols-3 gap-8">
            <div>
              <h2 class="text-xl font-bold text-neutral-900 dark:text-white">個人情報の利用目的</h2>
            </div>
            <div class="lg:col-span-2">
              <ul class="list-disc list-outside pl-5 text-neutral-600 dark:text-neutral-400 leading-relaxed space-y-2">
                <li>ユーザーに本サイトをご提供するため</li>
                <li>本サイトの改善およびご利用状況を調査、分析するため</li>
                <li>不正利用の防止、スパム対策、および適切なサービス運営のため</li>
              </ul>
            </div>
          </div>

          <!-- 個人情報の利用及び提供の制限 -->
          <div class="grid lg:grid-cols-3 gap-8">
            <div>
              <h2 class="text-xl font-bold text-neutral-900 dark:text-white">個人情報の利用及び提供の制限</h2>
            </div>
            <div class="lg:col-span-2">
              <p class="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                当方は、ユーザーの許諾がない限り、本プライバシーポリシー内の「個人情報の利用目的」に記載した目的以外で収集した個人情報を利用することはありません。また、法令に基づく開示要請があった場合、不正アクセス・脅迫等の違法行為があった場合、その他特別の理由のある場合を除き、収集した個人情報を本プライバシーポリシーの「個人情報の利用目的」に記載した目的以外で第三者に提供することはありません。ただし、個人を特定できる情報を含まない、統計的に処理された本サイトの利用状況については公表することがあります。
              </p>
            </div>
          </div>

          <!-- 個人情報の開示 -->
          <div class="grid lg:grid-cols-3 gap-8">
            <div>
              <h2 class="text-xl font-bold text-neutral-900 dark:text-white">個人情報の開示</h2>
            </div>
            <div class="lg:col-span-2">
              <p class="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                ユーザーが、当方が保有する個人情報の開示・訂正・削除をご希望される場合には、ご本人であることを確認した上で対応させていただきます。ご希望される場合はお問い合わせください。
              </p>
            </div>
          </div>

          <!-- アクセス解析ツールについて -->
          <div class="grid lg:grid-cols-3 gap-8">
            <div>
              <h2 class="text-xl font-bold text-neutral-900 dark:text-white">アクセス解析ツールについて</h2>
            </div>
            <div class="lg:col-span-2 space-y-4">
              <p class="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                本サイトでは、Googleによるアクセス解析ツール「Googleアナリティクス」を使用しています。このGoogleアナリティクスはデータの収集のためにCookieを使用しています。このデータは匿名で収集されており、個人を特定するものではありません。
              </p>
              <p class="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                この機能はCookieを無効にすることで収集を拒否することが出来ますので、お使いのブラウザの設定をご確認ください。この規約に関しての詳細は
                <NuxtLink to="https://marketingplatform.google.com/about/analytics/terms/jp/" target="_blank" class="text-primary hover:text-primary/70 transition-colors">Google アナリティクス利用規約</NuxtLink>
                や
                <NuxtLink to="https://policies.google.com/technologies/ads?hl=ja" target="_blank" class="text-primary hover:text-primary/70 transition-colors">Google ポリシーと規約</NuxtLink>
                をご覧ください。
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Privacy Policy - (Unofficial) Misskey Server List',
  meta: [
    { name: 'description', content: 'プライバシーポリシー' },
    { property: 'og:title', content: 'Privacy Policy - (Unofficial) Misskey Server List' },
    { property: 'og:description', content: 'プライバシーポリシー' },
    { property: 'og:url', content: 'https://servers.misskey.ink/privacy' },
    { name: 'twitter:title', content: 'Privacy Policy - (Unofficial) Misskey Server List' },
    { name: 'twitter:description', content: 'プライバシーポリシー' },
  ]
});
</script>
