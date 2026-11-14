import { imageQuerySchema } from '@mil/core/validation';
import { sendStream } from 'h3';

export default defineEventHandler(async event => {
	const { url } = parseOrThrow(imageQuerySchema, getQuery(event));

	const result = await fetchPublicImage(url);
	if (!result.ok) {
		console.warn(`Image proxy rejected ${url}: ${result.message}`);
		throw createError({ statusCode: result.status, statusMessage: result.message });
	}

	setHeader(event, 'Content-Type', result.contentType);
	setHeader(event, 'X-Content-Type-Options', 'nosniff');
	// 直接開かれたSVG内スクリプト実行防止
	setHeader(event, 'Content-Security-Policy', "default-src 'none'; style-src 'unsafe-inline'; sandbox");
	setHeader(event, 'Cache-Control', 'public, max-age=3600');

	return sendStream(event, result.body);
});
