# CockroachDB → D1 データ移行

`instances` / `repositories` / `excluded_hosts` を全件移す手順。
先にstaging D1で通し, 照合が合ってから本番D1へ同じ手順を繰り返す。

## 0. 事前確認

**FK孤児が1件でもあるとインポートがハードフェイルする** (D1はFK強制がデフォルトON)。
先に潰しておくこと。

```bash
psql "$DATABASE_URL" -f 00-preflight.sql
```

`orphan_repository_urls`が0でなければ, 該当行の`repository_url`をNULLにするか
`repositories`に不足行を足してから進む。

## 1. エクスポート

CSVではなくJSONLを使う。`reason` / `description` / `node_name`はnullableかつ
空文字も正当に持ちうるため, CSVの`NULL ''`慣習では区別できない。
改行や引用符を含む`description`の扱いもJSONの方が安全。

型変換はSQL側で済ませる (bool→1/0, TIMESTAMP→epoch ms, enum→text)。

```bash
psql "$DATABASE_URL" -At -f 01-export-repositories.sql > repositories.jsonl
psql "$DATABASE_URL" -At -f 01-export-instances.sql    > instances.jsonl
psql "$DATABASE_URL" -At -f 01-export-excluded.sql     > excluded_hosts.jsonl
```

## 2. SQLへ変換

`wrangler d1 import`は生SQLを実行するので, バインドパラメータ上限100は無関係。
リテラル値の複数行INSERTを吐き, D1の1文100KB上限に収まるよう分割する。

```bash
node 02-jsonl-to-sql.mjs repositories.jsonl   repositories   > 01_repositories.sql
node 02-jsonl-to-sql.mjs instances.jsonl      instances      > 02_instances.sql
node 02-jsonl-to-sql.mjs excluded_hosts.jsonl excluded_hosts > 03_excluded_hosts.sql
```

## 3. インポート

**順序が重要** — FKがあるので`repositories`が先。
`d1 execute --file`ではなく`d1 import`を使う (ストリーミング, サーバー側分割, `--action=retry`で再開可能)。

```bash
cd ../../packages/core
wrangler d1 import mil --remote --file=../../scripts/migrate-cockroach-to-d1/01_repositories.sql
wrangler d1 import mil --remote --file=../../scripts/migrate-cockroach-to-d1/02_instances.sql
wrangler d1 import mil --remote --file=../../scripts/migrate-cockroach-to-d1/03_excluded_hosts.sql
```

## 4. 照合

両側で実行し, **全て完全一致**すること。

```bash
psql "$DATABASE_URL" -f 03-reconcile-source.sql
wrangler d1 execute mil --remote --file=03-reconcile-d1.sql
```

カウント一致だけではクォートバグを検出できない。
加えて`description`が最長の3行と, 引用符・改行・非ASCIIを含む`reason`を目視で比較すること。
