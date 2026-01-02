import type { H3Event } from 'h3';
import crypto from 'node:crypto';

/**
 * 管理者権限チェックユーティリティ
 *
 * Basic認証を使用して管理者アクセスを検証します。
 * 環境変数 ADMIN_USER, ADMIN_PASSWORD と照合します。
 *
 * @param event H3Event
 * @throws 401 Unauthorized (Basic認証ヘッダー付き)
 * @throws 500 Server misconfiguration (環境変数が未設定の場合)
 */

const safeCompare = (a: string, b: string) => {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  const len = Math.max(bufA.length, bufB.length);
  
  const padA = Buffer.alloc(len, 0);
  bufA.copy(padA);
  
  const padB = Buffer.alloc(len, 0);
  bufB.copy(padB);
  
  try {
    return crypto.timingSafeEqual(padA, padB) && bufA.length === bufB.length;
  } catch {
    return false;
  }
};

export const requireAdminAuth = (event: H3Event) => {
  const config = useRuntimeConfig();
  const authHeader = getRequestHeader(event, 'Authorization');

  const validUser = config.adminUser;
  const validPass = config.adminPassword;

  // 環境変数が設定されていない場合はサーバーエラー
  if (!validUser || !validPass) {
    console.error('ADMIN_USER or ADMIN_PASSWORD not set in environment variables');
    throw createError({
      statusCode: 500,
      statusMessage: 'Server misconfiguration',
    });
  }

  const throwAuthError = (): never => {
    // ブラウザに認証ダイアログを表示させるためのヘッダー
    setHeader(event, 'WWW-Authenticate', 'Basic realm="Admin Area"');
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  };

  if (!authHeader) {
    throwAuthError();
  }

  // Basic認証ヘッダーの形式チェック
  const match = authHeader!.match(/^Basic\s+(.*)$/);
  if (!match || !match[1]) {
    throwAuthError();
  }

  const token = match![1] as string;

  // Base64デコードしてユーザー名とパスワードを取得
  const credentials = Buffer.from(token, 'base64').toString().split(':');
  const user = credentials[0];
  const pass = credentials[1];

  if (!user || !pass) {
    throwAuthError();
  }

  // 認証情報の照合
  const userMatch = safeCompare(user as string, validUser);
  const passMatch = safeCompare(pass as string, validPass);

  if (!userMatch || !passMatch) {
    throwAuthError();
  }

  return true;
};
