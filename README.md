<div align="center">

<a href="https://servers.misskey.ink">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/assets/logo-dark.svg">
    <img src=".github/assets/logo-light.svg" alt="Unofficial Misskey Server List" width="360">
  </picture>
</a>

<br>
<br>

[![Website](https://img.shields.io/badge/web-servers.misskey.ink-fc9fa8?style=flat-square&logo=misskey&logoColor=white)](https://servers.misskey.ink)
[![API Docs](https://img.shields.io/badge/docs-API_v1-fc9fa8?style=flat-square&logo=readthedocs&logoColor=white)](https://servers.misskey.ink/docs/api/v1)
[![CI](https://img.shields.io/github/actions/workflow/status/chan-mai/misskey-instance-list/ci.yaml?branch=stg&event=push&style=flat-square&logo=github&logoColor=white&label=CI&color=fc9fa8)](https://github.com/chan-mai/misskey-instance-list/actions/workflows/ci.yaml)
[![License](https://img.shields.io/github/license/chan-mai/misskey-instance-list?style=flat-square&label=license&color=fc9fa8)](./LICENSE)

![Nuxt](https://img.shields.io/badge/Nuxt_4-00DC82?style=flat-square&logo=nuxt&logoColor=white)
![Vue](https://img.shields.io/badge/Vue_3-4FC08D?style=flat-square&logo=vuedotjs&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Hono](https://img.shields.io/badge/Hono-E36002?style=flat-square&logo=hono&logoColor=white)
![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=flat-square&logo=drizzle&logoColor=black)
![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-F38020?style=flat-square&logo=cloudflare&logoColor=white)
![D1](https://img.shields.io/badge/D1-F38020?style=flat-square)
![Durable Objects](https://img.shields.io/badge/Durable_Objects-F38020?style=flat-square)
![Queues](https://img.shields.io/badge/Queues-F38020?style=flat-square)
[![Tsumugi](https://img.shields.io/badge/Tsumugi-f7a1b2?style=flat-square)](https://tsumugi.mq1.dev)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)

MisskeyHubのサーバーリストがメンテナンス中のまま復旧しないため、非公式のサーバーリストを作成しました。

</div>

## ✨ Features

- **スプーフィング除外**: CherryPickなどの偽装インスタンスを自動的に検出・除外
- **自動更新**: 定期的にインスタンス情報を自動取得・更新
- **検索・ソート**: インスタンス名での検索、ユーザー数・ノート数でのソート
- **API提供**: RESTful APIでインスタンス情報を取得可能

## 🚀 Tech Stack

- **Frontend**: Nuxt 4, Vue 3, Tailwind CSS
- **Backend**: Nitro (Cloudflare Workers), Hono (Cloudflare Workers), Drizzle ORM
- **Database**: Cloudflare D1 (SQLite)
- **Jobs**: Tsumugi (Cloudflare Durable Objects + Queues + D1)
- **Styling**: kiso.css, Tailwind CSS

## 📖 API Documentation

APIドキュメントは https://servers.misskey.ink/docs/api/v1 で確認できます。

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/instances` | インスタンス一覧を取得 |
| GET | `/api/v1/deny_instances` | 拒否リストを取得 |
| GET | `/api/v1/ignore_instances` | 無視リストを取得 |
| GET | `/api/v1/stats` | 統計情報を取得 (リポジトリ統計含む) |
| GET | `/api/health` | ヘルスチェック |

## 🛠️ Development

### Prerequisites

- Node.js 24+
- pnpm
- Cloudflareアカウント(Workers Paid)
- Cloudflare Zero Trust(ジョブ管理画面の認証に使う)

### Setup

```bash
# 依存関係のインストール
pnpm install

# 環境変数の設定
cp .env.example .env

# ローカルD1にマイグレーションを適用
pnpm db:migrate:local

# ジョブの読み取りモデルにマイグレーションを適用
pnpm jobs:migrate:local
```

### Development Server

```bash
pnpm dev
```

http://localhost:3000 で開発サーバーが起動します。

### Production Build

```bash
pnpm build
pnpm --filter @mil/web exec wrangler deploy
pnpm --filter @mil/agent exec wrangler deploy
```

## 🤝 Contributing

リポジトリへの貢献を歓迎します！詳細は [CONTRIBUTING.md](CONTRIBUTING.md) をご確認ください。

## 📝 License

This project is licensed under the AGPL-3.0 License - see the [LICENSE](LICENSE) file for details.

## 🙏 Disclaimer

このリストは非公式のプロジェクトであり、Misskey開発チームとは関係ありません。
掲載されているインスタンスの運営状況やセキュリティについて、当プロジェクトは一切の責任を負いません。
