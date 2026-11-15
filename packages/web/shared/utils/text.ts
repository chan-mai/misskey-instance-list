import { decodeHTML } from 'entities';

// string以外と空文字を除外
export const firstNonEmpty = (...values: unknown[]): string | undefined =>
	values.find((value): value is string => typeof value === 'string' && value !== '');

const LINE_BREAK_TAG = /<br\b[^>]*>|<\/(?:p|div|li|h[1-6]|blockquote|pre|tr)\s*>/gi;

// SSR/クライアント共通のタグ除去
export const htmlToText = (html: string): string => decodeHTML(html.replace(LINE_BREAK_TAG, '\n').replace(/<[^>]*>/g, '')).trim();
