// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: true,
  devtools: {
    enabled: true,
  },
  css: ['kiso.css', '~/assets/css/fonts.css', '~/assets/css/style.css'],
  modules: ['@nuxtjs/tailwindcss', 'nuxt-gtag', '@nuxtjs/color-mode'],
  components: [
    { path: '~/components', pathPrefix: false },
  ],
  colorMode: {
    classSuffix: '',
    preference: 'dark',
    fallback: 'dark',
  },
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: '(Unofficial) Misskey Server List | Misskeyサーバー・インスタンスリスト',
      meta: [
        { name: 'keywords', content: 'Misskey,Server List,Instance List,Misskeyサーバー,インスタンス,Fediverse,ActivityPub,サーバー検索' },
        { name: 'description', content: 'あなたにぴったりのMisskeyサーバーを見つけよう。登録数、ノート数、活動率などで検索できる非公式のMisskeyサーバーリスト(インスタンスリスト)です。' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: '(Unofficial) Misskey Server List' },
        { property: 'og:title', content: '(Unofficial) Misskey Server List | Misskeyサーバー・インスタンスリスト' },
        { property: 'og:description', content: 'あなたにぴったりのMisskeyサーバーを見つけよう。登録数、ノート数、活動率などで検索できる非公式のMisskeyサーバーリスト(インスタンスリスト)です。' },
        { property: 'og:url', content: 'https://servers.misskey.ink/' },
        { property: 'og:locale', content: 'ja_JP' },
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:title', content: '(Unofficial) Misskey Server List | Misskeyサーバー・インスタンスリスト' },
        { name: 'twitter:description', content: 'あなたにぴったりのMisskeyサーバーを見つけよう。登録数、ノート数、活動率などで検索できる非公式のMisskeyサーバーリスト(インスタンスリスト)です。' },
        { property: 'og:image', content: 'https://servers.misskey.ink/ogp.png' },
        { name: 'twitter:image', content: 'https://servers.misskey.ink/ogp.png' },
      ],
      link: [
        { rel: 'canonical', href: 'https://servers.misskey.ink/' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ],
      htmlAttrs: {
        lang: 'ja',
        prefix: 'og: https://ogp.me/ns#',
      },
    },
  },
  tailwindcss: {
    config: {
      theme: {
        extend: {
          colors: {
            primary: '#fc9fa8',
            accent: '#f57aa5',
            back: '#ffffff',
            'back-dark': '#0a0a0a',
          },
        },
      },
    },
  },
  runtimeConfig: {
    database_url: process.env.DATABASE_URL,
    taskSecret: process.env.TASK_SECRET,
    githubToken: process.env.GITHUB_TOKEN,
  },
  nitro: {
    experimental: { tasks: true },
    prerender: {
      routes: [
        '/about',
        '/docs/api/v1',
        '/docs/api/v1/instances',
        '/docs/api/v1/deny_instances',
        '/docs/api/v1/ignore_instances'
      ]
    },
    // dev環境ではAPIキャッシュを無効化
    routeRules: process.env.NODE_ENV === 'development'
      ? { '/api/**': { cache: false, headers: { 'Cache-Control': 'no-cache, no-store' } } }
      : {}
  },
  gtag: {
    id: 'G-3VEDN6VL0W'
  }
});