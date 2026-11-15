// string以外と空文字を除外
export const firstNonEmpty = (...values: unknown[]): string | undefined =>
	values.find((value): value is string => typeof value === 'string' && value !== '');

const NAMED_ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: String.fromCodePoint(0xa0) };

const decodeEntity = (entity: string, body: string): string => {
	if (body[0] !== '#') return NAMED_ENTITIES[body.toLowerCase()] ?? entity;
	const code = body[1] === 'x' || body[1] === 'X' ? Number.parseInt(body.slice(2), 16) : Number(body.slice(1));
	return Number.isInteger(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : entity;
};

// SSR/クライアント共通のタグ除去
export const htmlToText = (html: string): string => html.replace(/<[^>]*>/g, '').replace(/&(#\d+|#x[0-9a-f]+|[a-z]+);/gi, decodeEntity);
