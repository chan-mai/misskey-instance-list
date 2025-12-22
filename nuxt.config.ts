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
      charset: 'utf-16',
      viewport: 'width=device-width',
      link: [
        { rel: 'canonical', href: 'https://misskey-instances.mq1.dev/' },
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
  },
  nitro: {
    experimental: { tasks: true },
    scheduledTasks: {
      // 毎時: Denylist同期
      '0 * * * *': ['sync:denylist'],
      // 6時間おき: 全インスタンス統計同期
      '0 */6 * * *': ['sync:stats'],
      // 30分おき: インスタンス探索
      '*/30 * * * *': ['discovery'],
      // 10分おき: インスタンス更新
      '*/10 * * * *': ['update']
    }
  }
});
