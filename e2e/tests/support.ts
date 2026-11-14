import { readFileSync } from 'node:fs';
import { expect } from '@playwright/test';

import type { APIRequestContext, Page } from '@playwright/test';

export const AGENT = 'http://app:8788';

export const ADMIN_STATE = '.auth/admin.json';

export const HOSTS = {
	alpha: 'alpha.mil-e2e.test',
	beta: 'beta.mil-e2e.test',
	cherrypick: 'cherrypick.mil-e2e.test',
	tempura: 'tempura.mil-e2e.test',
	gts: 'gts.mil-e2e.test',
	spoof: 'spoof.mil-e2e.test',
	gone: 'gone.mil-e2e.test',
	down: 'down.mil-e2e.test',
	private: 'private.mil-e2e.test',
	missing: 'missing.mil-e2e.test',
} as const;

export const OFFICIAL_REPOSITORY_URL = 'https://github.com/misskey-dev/misskey';

const accounts = () => JSON.parse(readFileSync('/shared/accounts.json', 'utf8')) as { password: string };

type JobRow = { id: string; binding: string; state: string; attempts: number; result: string | null };
type RunRow = { id: string; flow: string; state: string; node_total: number; node_done: number; node_failed: number };

const TERMINAL = ['COMPLETED', 'FAILED', 'CANCELLED'];

export const triggerSchedule = async (request: APIRequestContext, name: string): Promise<{ kind: 'job' | 'flow'; id: string }> => {
	const res = await request.post(`${AGENT}/__e2e/schedules/${name}/trigger`);
	expect(res.ok()).toBe(true);
	const body = await res.json();
	expect(body.ok, JSON.stringify(body)).toBe(true);
	return body;
};

export const waitForJob = async (request: APIRequestContext, id: string, timeout = 300_000): Promise<JobRow> => {
	let job: JobRow | undefined;
	await expect
		.poll(
			async () => {
				const res = await request.get(`${AGENT}/__e2e/jobs/${encodeURIComponent(id)}`);
				if (!res.ok()) return undefined;
				job = await res.json();
				return job?.state;
			},
			{ timeout, intervals: [1_000] },
		)
		.toMatch(new RegExp(`^(${TERMINAL.join('|')})$`));
	if (!job) throw new Error(`job ${id} not found`);
	return job;
};

export const waitForRun = async (request: APIRequestContext, id: string, timeout = 600_000): Promise<RunRow> => {
	let run: RunRow | undefined;
	await expect
		.poll(
			async () => {
				const res = await request.get(`${AGENT}/__e2e/runs/${encodeURIComponent(id)}`);
				if (!res.ok()) return undefined;
				run = await res.json();
				return run?.state;
			},
			{ timeout, intervals: [1_000] },
		)
		.toMatch(/^(COMPLETED|FAILED|CANCELLED)$/);
	if (!run) throw new Error(`run ${id} not found`);
	return run;
};

export const listJobs = async (request: APIRequestContext, binding: string): Promise<JobRow[]> => {
	const res = await request.get(`${AGENT}/__e2e/jobs?binding=${binding}`);
	expect(res.ok()).toBe(true);
	return res.json();
};

export const resultOf = <T>(job: JobRow): T => JSON.parse(job.result ?? 'null') as T;

// ZITADELのログインUI(v2)でログイン, 入力欄はラベル未関連付け
export const loginWithZitadel = async (page: Page, username: string) => {
	await page.locator('input[name="loginName"]').fill(username);
	await page.getByRole('button', { name: '続行', exact: true }).click();
	// hydration前の入力はReactの状態へ未反映, 空パスワード送信で検証失敗
	await page.waitForURL(/\/ui\/v2\/login\/password/);
	await page.waitForFunction(() => {
		const input = document.querySelector('input[name="password"]');
		return !!input && Object.keys(input).some(key => key.startsWith('__react'));
	});
	await page.locator('input[name="password"]').fill(accounts().password);
	await page.getByRole('button', { name: '続行', exact: true }).click();
};
