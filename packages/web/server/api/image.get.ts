
import { sendStream } from 'h3';

export default defineEventHandler(async(event) => {
  const query = getQuery(event);
  const url = query.url as string;

  if (!url) {
    throw createError({
      statusCode: 400,
      statusMessage: 'URL is required',
    });
  }

  try {
    // Validate URL scheme
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
       throw new Error('Invalid protocol');
    }
  } catch {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid URL',
    });
  }

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        // Don't send referer to bypass hotlink protection
        'Referer': '', 
      },
      redirect: 'follow', // Follow redirects if any
    });

    if (!res.ok) {
       throw createError({
         statusCode: res.status,
         statusMessage: 'Failed to fetch image',
       });
    }

    const contentType = res.headers.get('content-type');
    if (contentType) {
      setHeader(event, 'Content-Type', contentType);
    }
    
    // Cache for a while (e.g. 1 hour)
    setHeader(event, 'Cache-Control', 'public, max-age=3600');

    // Proxy the stream
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return sendStream(event, res.body as any);

  } catch (e: any) {
    console.error('Proxy error:', e.message);
    throw createError({
      statusCode: 502,
      statusMessage: 'Bad Gateway',
    });
  }
});
