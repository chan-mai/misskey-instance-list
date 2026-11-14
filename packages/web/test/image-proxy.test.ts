import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

const { isPubliclyResolvable } = vi.hoisted(() => ({ isPubliclyResolvable: vi.fn<(host: string) => Promise<boolean>>() }));
vi.mock('@mil/core/net', () => ({ isPubliclyResolvable }));

const { fetchPublicImage, MAX_IMAGE_BYTES } = await import('../server/utils/image-proxy');

const fetchMock = vi.fn<(input: URL, init: RequestInit) => Promise<Response>>();

const PRIVATE_HOSTS = new Set(['127.0.0.1', '::1', 'internal.example']);

beforeEach(() => {
	isPubliclyResolvable.mockImplementation(async host => !PRIVATE_HOSTS.has(host));
	vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
	vi.unstubAllGlobals();
	vi.resetAllMocks();
});

const image = (body: BodyInit = 'png', headers: Record<string, string> = {}) =>
	new Response(body, { status: 200, headers: { 'Content-Type': 'image/png', ...headers } });

const redirect = (location: string) => new Response(null, { status: 302, headers: { Location: location } });

const readAll = async (body: ReadableStream<Uint8Array>) => new Uint8Array(await new Response(body).arrayBuffer());

describe('fetchPublicImage', () => {
	test('publicホストの画像をContent-Type付きで返却', async () => {
		fetchMock.mockResolvedValueOnce(image('png-bytes'));

		const result = await fetchPublicImage('https://cdn.example/a.png');

		expect(result).toMatchObject({ ok: true, contentType: 'image/png' });
		if (!result.ok) throw new Error('unreachable');
		expect(new TextDecoder().decode(await readAll(result.body))).toBe('png-bytes');
		expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({ redirect: 'manual' });
	});

	test.each(['http://127.0.0.1/a.png', 'http://[::1]/a.png', 'https://internal.example/a.png'])(
		'public以外のホスト%sは接続前に400',
		async url => {
			expect(await fetchPublicImage(url)).toEqual({ ok: false, status: 400, message: 'Host is not allowed' });
			expect(fetchMock).not.toHaveBeenCalled();
		},
	);

	test('IPv6リテラルは角括弧除去後に検証', async () => {
		fetchMock.mockResolvedValueOnce(image());

		await fetchPublicImage('http://[2001:db8::1]/a.png');

		expect(isPubliclyResolvable).toHaveBeenCalledWith('2001:db8::1');
	});

	test('リダイレクト先を検証後に追従', async () => {
		fetchMock
			.mockResolvedValueOnce(redirect('/b.png'))
			.mockResolvedValueOnce(redirect('https://other.example/c.png'))
			.mockResolvedValueOnce(image());

		const result = await fetchPublicImage('https://cdn.example/a.png');

		expect(result.ok).toBe(true);
		expect(fetchMock.mock.calls.map(([input]) => input.toString())).toEqual([
			'https://cdn.example/a.png',
			'https://cdn.example/b.png',
			'https://other.example/c.png',
		]);
		expect(isPubliclyResolvable.mock.calls.map(([host]) => host)).toEqual(['cdn.example', 'cdn.example', 'other.example']);
	});

	test.each(['http://127.0.0.1/a.png', 'file:///etc/passwd'])('リダイレクト先%sは接続せず502', async location => {
		fetchMock.mockResolvedValueOnce(redirect(location));

		expect(await fetchPublicImage('https://cdn.example/a.png')).toEqual({
			ok: false,
			status: 502,
			message: 'Redirect target is not allowed',
		});
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	test('リダイレクト6回目で502', async () => {
		fetchMock.mockImplementation(async () => redirect('/loop.png'));

		expect(await fetchPublicImage('https://cdn.example/a.png')).toEqual({ ok: false, status: 502, message: 'Too many redirects' });
		expect(fetchMock).toHaveBeenCalledTimes(6);
	});

	test.each(['text/html', 'application/octet-stream', ''])('Content-Type "%s"は502', async contentType => {
		fetchMock.mockResolvedValueOnce(
			new Response('<script>alert(1)</script>', { status: 200, headers: contentType ? { 'Content-Type': contentType } : {} }),
		);

		expect(await fetchPublicImage('https://cdn.example/a.png')).toEqual({
			ok: false,
			status: 502,
			message: 'Upstream response is not an image',
		});
	});

	test('上流の非2xx応答は502', async () => {
		fetchMock.mockResolvedValueOnce(new Response('not found', { status: 404, headers: { 'Content-Type': 'image/png' } }));

		expect(await fetchPublicImage('https://cdn.example/a.png')).toEqual({ ok: false, status: 502, message: 'Failed to fetch image' });
	});

	test('fetch例外時502', async () => {
		fetchMock.mockRejectedValueOnce(new TypeError('network error'));

		expect(await fetchPublicImage('https://cdn.example/a.png')).toEqual({ ok: false, status: 502, message: 'Failed to fetch image' });
	});

	test('Content-Lengthが上限超過時502', async () => {
		fetchMock.mockResolvedValueOnce(image('x', { 'Content-Length': String(MAX_IMAGE_BYTES + 1) }));

		expect(await fetchPublicImage('https://cdn.example/a.png')).toEqual({ ok: false, status: 502, message: 'Image is too large' });
	});

	test('Content-Length無し時上限超過でストリームをエラー終了', async () => {
		const chunk = new Uint8Array(MAX_IMAGE_BYTES / 2 + 1);
		const body = new ReadableStream<Uint8Array>({
			start(controller) {
				controller.enqueue(chunk);
				controller.enqueue(chunk);
				controller.close();
			},
		});
		fetchMock.mockResolvedValueOnce(image(body));

		const result = await fetchPublicImage('https://cdn.example/a.png');

		if (!result.ok) throw new Error('unreachable');
		await expect(readAll(result.body)).rejects.toThrow('Image is too large');
	});
});
