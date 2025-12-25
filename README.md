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
- **Backend**: Nitro, Prisma ORM
- **Database**: CockroachDB (PostgreSQL互換)
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

- Node.js 20+
- pnpm
- CockroachDB (または PostgreSQL)

### Setup

```bash
# 依存関係のインストール
pnpm install

# 環境変数の設定
cp .env.example .env
# .env ファイルを編集して DATABASE_URL を設定

# Prisma クライアントの生成
pnpm prisma generate

# データベースのマイグレーション
pnpm prisma migrate deploy
```

### Development Server

```bash
pnpm dev
```

http://localhost:3000 で開発サーバーが起動します。

### Production Build

```bash
pnpm build
node .output/server/index.mjs
```

## 📝 License

This project is licensed under the AGPL-3.0 License - see the [LICENSE](LICENSE) file for details.

## 🙏 Disclaimer

このリストは非公式のプロジェクトであり、Misskey開発チームとは関係ありません。
掲載されているインスタンスの運営状況やセキュリティについて、当プロジェクトは一切の責任を負いません。
