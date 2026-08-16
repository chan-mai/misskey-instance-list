import { metaQuerySchema } from '@mil/core/validation';

export default defineEventHandler(async(event) => {
  const { host } = parseOrThrow(metaQuerySchema, getQuery(event));

  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`https://${host}/api/meta`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'MisskeyInstanceList/0.1.0' 
      },
      body: JSON.stringify({ detail: true }),
      signal: controller.signal
    });

    clearTimeout(id);

    if (!response.ok) {
       throw createError({
         statusCode: response.status,
         statusMessage: 'Failed to fetch metadata from instance',
       });
    }

    // キャッシュヘッダーを追加 (1時間)
    setHeader(event, 'Cache-Control', 'public, max-age=3600');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Failed to fetch metadata for ${host}:`, error);
    throw createError({
      statusCode: 502,
      statusMessage: 'Bad Gateway: Failed to communicate with instance',
    });
  }
});
