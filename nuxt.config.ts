// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: true,
  devtools: {
    enabled: true,
  },
  css: ['kiso.css', '~/assets/css/fonts.css'],
  modules: ['@nuxtjs/tailwindcss'],
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: '(Unofficial) Misskey Server List',
      meta: [
        { name: 'description', content: 'あなたにぴったりのMisskeyサーバーを見つけよう。非公式のサーバーリストです。' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: '(Unofficial) Misskey Server List' },
        { property: 'og:title', content: '(Unofficial) Misskey Server List' },
        { property: 'og:description', content: 'あなたにぴったりのMisskeyサーバーを見つけよう。非公式のサーバーリストです。' },
        { property: 'og:url', content: 'https://servers.misskey.ink/' },
        { property: 'og:locale', content: 'ja_JP' },
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:title', content: '(Unofficial) Misskey Server List' },
        { name: 'twitter:description', content: 'あなたにぴったりのMisskeyサーバーを見つけよう。' },
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
            back: '#f5f3f3',
          },
        },
      },
    },
  },
  runtimeConfig: {
    database_url: process.env.DATABASE_URL,
    taskSecret: process.env.TASK_SECRET,
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
    }
  }
});
