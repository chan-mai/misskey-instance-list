import { firstNonEmpty } from '~~/shared/utils/text';

type FetchErrorLike = { data?: { statusMessage?: unknown } | null; statusMessage?: unknown; message?: unknown } | null | undefined;

export const useFetchError = () => {
	const getErrorMessage = (e: unknown, fallback: string): string => {
		const err = e as FetchErrorLike;
		return firstNonEmpty(err?.data?.statusMessage, err?.statusMessage, err?.message) ?? fallback;
	};

	return { getErrorMessage };
};
