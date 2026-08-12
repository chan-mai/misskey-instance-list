import { ZITADEL_ROLES_CLAIM } from './shared/utils/zitadel-roles';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  ssr: true,
  devtools: {
    enabled: true,
  },
  css: ['kiso.css', '~/assets/css/fonts.css', '~/assets/css/style.css'],
  // nitro-cloudflare-devが無いとdev時にevent.context.cloudflare.envが空になりD1へ届かない
  modules: ['@nuxtjs/tailwindcss', 'nuxt-gtag', '@nuxtjs/color-mode', '@nuxt/icon', '@nuxtjs/sitemap', 'nuxt-jsonld', 'nuxt-security', 'nuxt-oidc-auth', 'nitro-cloudflare-dev'],
  plugins: ['~/plugins/typekit.client'],
  components: [
    { path: '~/components', pathPrefix: false },
  ],
  security: {
    headers: {
      contentSecurityPolicy: false,
      strictTransportSecurity: false,
    },
    rateLimiter: false,
  },
  oidc: {
    enabled: true,
    defaultProvider: 'zitadel',
    providers: {
      zitadel: {
        // baseUrlはビルド時にauthorizationUrl/tokenUrl等の導出に使われるため既定値を持たせる。
        // 秘匿情報ではなくstg/prod共通
        baseUrl: process.env.NUXT_OIDC_PROVIDERS_ZITADEL_BASE_URL || 'https://rimely-xepglr.ch1.zitadel.cloud',
        // clientId/clientSecret/redirectUriはNUXT_OIDC_PROVIDERS_ZITADEL_*で実行時に注入
        clientId: '',
        clientSecret: '',
        redirectUri: '',
        // プリセット既定の'none'はPKCEパブリッククライアント向けでclient_secretを送らない
        // ZITADEL側の認証方式に合わせる, Basicなら'header' / Postなら'body'
        authenticationScheme: 'header',
        // offline_accessを要求しない, 理由はsessionConfigurationのコメント参照
        scope: ['openid', 'profile', 'email'],
        // ロールクレームをIDトークンから取り出す(userinfo側に載る場合もあるので判定は両方見る)
        optionalClaims: [ZITADEL_ROLES_CLAIM],
        callbackRedirectUrl: '/admin',
        sessionConfiguration: {
          // リフレッシュトークンはNitroのメモリストレージに載るため, Cloud Runの複数インスタンス間で共有されない
          // 取り回しを単純にするためリフレッシュは行わず, 期限切れ時は再ログインさせる
          automaticRefresh: false,
          expirationCheck: true,
          expirationThreshold: 0,
        },
      },
    },
    middleware: {
      // 公開ページは認証不要, /adminのみサーバーミドルウェアとルートミドルウェアで保護
      globalMiddlewareEnabled: false,
    },
  },
  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'dark',
  },
  site: {
    url: 'https://servers.misskey.ink',
  },
  sitemap: {
    urls: [
      '/',
      '/docs/api/v1',
      '/docs/api/v1/instances',
      '/docs/api/v1/exclusions',
      '/docs/api/v1/stats',
    ],
    exclude: [
      '/admin',
      '/admin/**',
      '/auth/**',
    ],
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
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://use.typekit.net' },
        { rel: 'preconnect', href: 'https://p.typekit.net', crossorigin: '' },
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
          fontFamily: {
            base: 'var(--font-base)',
            display: 'var(--font-display)',
          },
        },
      },
    },
  },
  nitro: {
    preset: 'cloudflare_module',
    cloudflare: {
      // 生成される.wrangler/deploy/config.jsonはenvを持てず --env stg|prod と両立しない
      deployConfig: false,
    },
    // workerdのconsole.createTaskは呼ぶとERR_METHOD_NOT_IMPLEMENTEDで落ちるスタブ
    // hookableが機能検出して掴むためundefinedにして無効化する
    // (ESMのimportは巻き上げられるので全チャンク先頭に注入する必要がある)
    rollupConfig: {
      output: {
        banner: 'globalThis.console && (globalThis.console.createTask = undefined);',
      },
    },
    // ローカルD1をパッケージ間で共有する
    cloudflareDev: {
      persistDir: '../../.wrangler/state/v3',
    },
    prerender: {
      // '/'はindex.vueが/api/v1/statsを引くため除外, ビルド時にD1bindingが無く500が焼き付く
      routes: [
        '/docs/api/v1',
        '/docs/api/v1/instances',
        '/docs/api/v1/exclusions',
        '/docs/api/v1/stats'
      ]
    },
    // 既定のメモリドライバはisolate毎でキャッシュが効かない。
    // oidcは不要, セッションはsealed cookieでstorageはrefreshToken用(offline_access未要求のため未使用)
    storage: {
      cache: { driver: 'cloudflare-kv-binding', binding: 'CACHE_KV' },
    },
    routeRules: {
      '/api/**': process.env.NODE_ENV === 'development'
        ? { cache: false, headers: { 'Cache-Control': 'no-cache, no-store', 'X-Robots-Tag': 'noindex' } }
        : { headers: { 'X-Robots-Tag': 'noindex' } },
    }
  },
  gtag: {
    id: 'G-3VEDN6VL0W'
  },
  vite: {
    esbuild: {
      drop: ['console', 'debugger'],
    },
  },
});
