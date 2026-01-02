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
export const requireAdminAuth = (event: any) => {
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

  const throwAuthError = () => {
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

  // 認証情報の照合
  if (user !== validUser || pass !== validPass) {
    throwAuthError();
  }

  return true;
};
