/** D1の1ステートメントあたりバインドパラメータ上限 */
export const D1_MAX_BOUND_PARAMS = 100;

/**
 * D1のバインドパラメータ上限に収まるよう行を分割する
 *
 * 注意: drizzleはスカラーのdefault値もクライアント側でバインドするため,
 * columnsPerRowは明示した列だけでなくdefault付き列も数えること
 * (sql式のdefaultはインライン展開されるので数えない)
 *
 * @param rows 分割対象
 * @param columnsPerRow 1行あたりが消費するパラメータ数
 */
export const chunkForD1 = <T>(rows: readonly T[], columnsPerRow: number): T[][] => {
  const size = Math.max(1, Math.floor((D1_MAX_BOUND_PARAMS - 1) / Math.max(1, columnsPerRow)));
  const out: T[][] = [];
  for (let i = 0; i < rows.length; i += size) out.push(rows.slice(i, i + size) as T[]);
  return out;
};

/**
 * D1のLIKEパターン長上限(50バイト)に収まるよう検索語を切り詰め, ワイルドカードを除去する
 *
 * 日本語はUTF-8で3バイト/文字のためCJKだと約15文字
 * ESCAPE句をdrizzleのlike()が出さないので, %と_はエスケープではなく除去する
 */
export const clampLikeTerm = (raw: string, maxPatternBytes = 50): string => {
  // 前後の%で2バイト消費する
  const budget = maxPatternBytes - 2;
  const stripped = raw.replace(/[%_\\]/g, '');
  const enc = new TextEncoder();
  if (enc.encode(stripped).length <= budget) return stripped;

  let out = '';
  for (const ch of stripped) {
    if (enc.encode(out + ch).length > budget) break;
    out += ch;
  }
  return out;
};
