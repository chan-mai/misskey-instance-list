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
- **Jobs**: Cloudflare Cron Triggers + Queues
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
- Cloudflareアカウント (Workers Paidプラン, Queuesに必要)

### Setup

```bash
# 依存関係のインストール
pnpm install

# 環境変数の設定
cp .env.example .env

# ローカルD1にマイグレーションを適用
pnpm --filter @mil/core exec wrangler d1 migrations apply mil --local
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

### タスクの手動実行

定期実行はCron Triggersが担う。手動で回したい場合はagent Workerのエンドポイントを叩く。

```bash
# ローカル (実バインディング付きでWorkerを起動)
pnpm --filter @mil/agent dev

# 別ターミナルから
curl -X POST http://localhost:8787/api/tasks/update \
  -H "Authorization: Bearer $TASK_SECRET"
```

タスク名は`update` / `discovery` / `sync:stats` / `sync:recommendation-scores` / `sync:exclusions`。
キューに積まれるだけなので, 消費まで含めて確認するなら`wrangler dev`のログを見る。

Cron Triggersの動作確認は`--test-scheduled`を使う。

```bash
pnpm --filter @mil/agent exec wrangler dev --test-scheduled
curl "http://localhost:8787/__scheduled?cron=0+*/6+*+*+*"
```

## 🤝 Contributing

リポジトリへの貢献を歓迎します！詳細は [CONTRIBUTING.md](CONTRIBUTING.md) をご確認ください。

## 📝 License

This project is licensed under the AGPL-3.0 License - see the [LICENSE](LICENSE) file for details.

## 🙏 Disclaimer

このリストは非公式のプロジェクトであり、Misskey開発チームとは関係ありません。
掲載されているインスタンスの運営状況やセキュリティについて、当プロジェクトは一切の責任を負いません。
