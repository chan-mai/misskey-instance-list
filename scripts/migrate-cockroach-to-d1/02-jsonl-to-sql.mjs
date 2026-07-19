#!/usr/bin/env node
// JSONL -> 複数行INSERT のSQL。
// wrangler d1 importは生SQLを実行するのでバインドパラメータ上限100は無関係だが,
// 1ステートメント100KBの上限があるためそこで分割する。
//
// 使い方: node 02-jsonl-to-sql.mjs <input.jsonl> <table> > out.sql

import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';

const COLUMNS = {
  repositories: ['url', 'name', 'description', 'updated_at', 'created_at'],
  instances: [
    'id', 'node_name', 'users_count', 'notes_count', 'version', 'is_alive',
    'created_at', 'last_updated', 'last_check_at', 'banner_url', 'icon_url',
    'suspension_state', 'recommendation_score', 'open_registrations',
    'email_required', 'repository_url', 'language',
  ],
  excluded_hosts: ['domain', 'reason', 'source', 'created_at'],
};

/** D1の1ステートメント上限に対する余裕を見た閾値 */
const MAX_STATEMENT_BYTES = 80_000;

const [, , inputPath, table] = process.argv;
const columns = COLUMNS[table];

if (!inputPath || !columns) {
  console.error(`usage: node 02-jsonl-to-sql.mjs <input.jsonl> <${Object.keys(COLUMNS).join('|')}>`);
  process.exit(1);
}

// SQLiteの文字列リテラルはシングルクォートを2つ重ねてエスケープする
const literal = (value) => {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error(`non-finite number: ${value}`);
    return String(value);
  }
  if (typeof value === 'boolean') return value ? '1' : '0';
  return `'${String(value).replaceAll("'", "''")}'`;
};

const header = `INSERT INTO ${table} (${columns.join(', ')}) VALUES\n`;
let buffer = [];
let bufferBytes = 0;
let rowCount = 0;

const flush = () => {
  if (buffer.length === 0) return;
  process.stdout.write(header + buffer.join(',\n') + ';\n');
  buffer = [];
  bufferBytes = 0;
};

const rl = createInterface({ input: createReadStream(inputPath), crlfDelay: Infinity });

for await (const line of rl) {
  const trimmed = line.trim();
  if (!trimmed) continue;

  const row = JSON.parse(trimmed);
  const tuple = `(${columns.map((c) => literal(row[c])).join(', ')})`;
  const size = Buffer.byteLength(tuple) + 2;

  if (bufferBytes + size > MAX_STATEMENT_BYTES) flush();

  buffer.push(tuple);
  bufferBytes += size;
  rowCount++;
}

flush();
console.error(`${table}: ${rowCount} rows`);
