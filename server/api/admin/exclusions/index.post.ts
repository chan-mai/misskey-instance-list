import { prisma } from '~~/server/utils/prisma';
import { ExcludedHostSource } from '~~/generated/prisma/enums';
import { validateDomain } from '~~/server/utils/domain-validation';

/**
 * 除外ホスト追加API (管理者用)
 *
 * 新しいホストを除外リストに追加します。
 * 追加されたホストは、instancesテーブルからも削除されます。
 *
 * リクエストボディ:
 * - domain: 除外対象ドメイン
 * - reason: 除外理由 (任意)
 * - source: 除外ソース ('manual' | 'system' | 'joinmisskey') (デフォルト: 'manual')
 *
 * @throws 400 Bad Request (ドメイン不正など)
 * @throws 401 Unauthorized
 * @throws 409 Conflict (登録済みの場合)
 */
export default defineEventHandler(async(event) => {
  const body = await readBody(event);

  // ドメインのバリデーション
  const { valid, normalized, error } = validateDomain(body.domain);
  if (!valid) {
    throw createError({ statusCode: 400, statusMessage: error });
  }

  const source = body.source || 'manual';
  
  try {
    // 除外リストへ登録
    const exclusion = await prisma.excludedHost.create({
      data: {
        domain: normalized!, // バリデーション済み
        reason: body.reason,
        source: source as ExcludedHostSource,
      },
    });

    // 既存のインスタンスデータがあれば削除
    // (除外されたホストはリストに表示すべきではないため)
    await prisma.instance.deleteMany({
      where: { id: normalized! },
    });

    return exclusion;
  } catch (e: unknown) {
    // 一意制約違反 (P2002) のハンドリング
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((e as any).code === 'P2002') {
      throw createError({ statusCode: 409, statusMessage: 'Domain is already excluded' });
    }
    // Prisma validation error (e.g. invalid enum value)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((e as any).code === 'P2003' || (e as any).name === 'PrismaClientValidationError') {
       throw createError({ statusCode: 400, statusMessage: 'Invalid parameters (e.g. invalid source)' });
    }
    throw e;
  }
});
