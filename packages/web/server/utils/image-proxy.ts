import { isPubliclyResolvable } from '@mil/core/net';

// レスポンスヘッダ受信までの上限
const TOTAL_TIMEOUT = 8000;

const MAX_REDIRECTS = 5;

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

export type ImageFetchResult =
	| { ok: true; body: ReadableStream<Uint8Array>; contentType: string }
	| { ok: false; status: 400 | 502; message: string };

export async function fetchPublicImage(url: string): Promise<ImageFetchResult> {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), TOTAL_TIMEOUT);

	try {
		let current = url;
		for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
			const parsed = parseHttpUrl(current);
			if (!parsed || !(await isPubliclyResolvable(stripBrackets(parsed.hostname)))) {
				return hop === 0
					? { ok: false, status: 400, message: 'Host is not allowed' }
					: { ok: false, status: 502, message: 'Redirect target is not allowed' };
			}

			const res = await fetch(parsed, {
				redirect: 'manual',
				signal: controller.signal,
				headers: {
					'User-Agent': USER_AGENT,
					// ホットリンク制限回避
					Referer: '',
				},
			});

			if (res.status >= 300 && res.status < 400) {
				const location = res.headers.get('location');
				if (!location) return { ok: false, status: 502, message: 'Failed to fetch image' };
				current = new URL(location, parsed).toString();
				continue;
			}

			if (!res.ok || !res.body) return { ok: false, status: 502, message: 'Failed to fetch image' };

			const contentType = res.headers.get('content-type')?.trim() ?? '';
			if (!contentType.toLowerCase().startsWith('image/')) {
				await res.body.cancel();
				return { ok: false, status: 502, message: 'Upstream response is not an image' };
			}

			const contentLength = Number(res.headers.get('content-length'));
			if (contentLength > MAX_IMAGE_BYTES) {
				await res.body.cancel();
				return { ok: false, status: 502, message: 'Image is too large' };
			}

			return { ok: true, body: res.body.pipeThrough(limitBytes(MAX_IMAGE_BYTES)), contentType };
		}

		return { ok: false, status: 502, message: 'Too many redirects' };
	} catch {
		return { ok: false, status: 502, message: 'Failed to fetch image' };
	} finally {
		clearTimeout(timer);
	}
}

function parseHttpUrl(raw: string): URL | null {
	try {
		const parsed = new URL(raw);
		return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? parsed : null;
	} catch {
		return null;
	}
}

// URL.hostnameはIPv6リテラルを角括弧付きで返す
function stripBrackets(hostname: string): string {
	return hostname.startsWith('[') && hostname.endsWith(']') ? hostname.slice(1, -1) : hostname;
}

// Content-Length無し応答の上限
function limitBytes(max: number): TransformStream<Uint8Array, Uint8Array> {
	let total = 0;
	return new TransformStream({
		transform(chunk, controller) {
			total += chunk.byteLength;
			if (total > max) {
				controller.error(new Error('Image is too large'));
				return;
			}
			controller.enqueue(chunk);
		},
	});
}
