# (Unofficial) Misskey Instance List

[![License](https://img.shields.io/badge/license-AGPL--3.0-blue.svg)](LICENSE)

MisskeyHubのサーバーリストがメンテナンス中のまま復旧しないため、非公式のサーバーリストを作成しました。

🌐 **Website**: https://servers.misskey.ink

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

### ジョブ

クロールと集計はTsumugiのジョブとして動きます。定期実行の定義は`packages/agent/src/schedules.ts`に記載されています。

| スケジュール名 | binding | cron(UTC) | 内容 |
|---|---|---|---|
| `discover-instances` | `DiscoverInstances` | `0 0 * * *` | 既知インスタンスから未知ホストを発見 |
| `sync-exclusions` | `SyncExclusions` | `0 0 * * *` | JoinMisskeyのignorehosts.ymlと除外リストを同期 |
| `plan-stats-sync` | `PlanStatsSync` | `0 */6 * * *` | 全インスタンスの統計同期をホスト単位のジョブへ |
| `sync-recommendation-scores` | `SyncRecommendationScores` | `0 */12 * * *` | おすすめスコアを再計算 |
| `plan-instance-update` | `PlanInstanceUpdate` | `0 */12 * * *` | 更新の古い100件の再取得をホスト単位のジョブへ |




```bash
pnpm --filter @mil/agent exec wrangler dev --test-scheduled
curl "http://localhost:8787/__scheduled?cron=*/15+*+*+*+*"
```

## 🤝 Contributing

リポジトリへの貢献を歓迎します！詳細は [CONTRIBUTING.md](CONTRIBUTING.md) をご確認ください。

## 📝 License

This project is licensed under the AGPL-3.0 License - see the [LICENSE](LICENSE) file for details.

## 🙏 Disclaimer

このリストは非公式のプロジェクトであり、Misskey開発チームとは関係ありません。
掲載されているインスタンスの運営状況やセキュリティについて、当プロジェクトは一切の責任を負いません。
