// E2E用エントリ, agentへジョブ操作エンドポイント追加
import tsumugi from '../../packages/agent/src/index.js';

import type { Env } from '../../packages/agent/src/env.js';

export * from '../../packages/agent/src/index.js';

const json = (body: unknown, status = 200) => Response.json(body, { status });

const handle = async (request: Request, env: Env): Promise<Response | null> => {
	const { pathname } = new URL(request.url);
	// '/'を含むジョブID/runIDはエンコード済みで受取
	const segments = pathname.split('/').filter(Boolean).map(decodeURIComponent);
	if (segments[0] !== '__e2e') return null;

	// POST /__e2e/schedules/:name/trigger
	if (request.method === 'POST' && segments[1] === 'schedules' && segments[3] === 'trigger' && segments[2]) {
		const scheduler = env.SCHEDULER.get(env.SCHEDULER.idFromName('scheduler'));
		await scheduler.sync();
		return json(await scheduler.trigger(segments[2]));
	}

	// GET /__e2e/jobs/:id
	if (request.method === 'GET' && segments[1] === 'jobs' && segments[2]) {
		const row = await env.TSUMUGI_DB.prepare('SELECT id, binding, state, attempts, result FROM job WHERE id = ?').bind(segments[2]).first();
		return row ? json(row) : json({ error: 'not found' }, 404);
	}

	// GET /__e2e/jobs?binding=
	if (request.method === 'GET' && segments[1] === 'jobs') {
		const binding = new URL(request.url).searchParams.get('binding');
		const { results } = await env.TSUMUGI_DB.prepare(
			'SELECT id, binding, state, attempts, result FROM job WHERE binding = ? ORDER BY created_at',
		)
			.bind(binding)
			.all();
		return json(results);
	}

	// GET /__e2e/runs/:id
	if (request.method === 'GET' && segments[1] === 'runs' && segments[2]) {
		const run = await env.TSUMUGI_DB.prepare('SELECT id, flow, state, node_total, node_done, node_failed FROM run WHERE id = ?')
			.bind(segments[2])
			.first();
		return run ? json(run) : json({ error: 'not found' }, 404);
	}

	return json({ error: 'not found' }, 404);
};

export default {
	...tsumugi,
	async fetch(request, env, ctx) {
		return (await handle(request, env)) ?? (await tsumugi.fetch?.(request, env, ctx)) ?? json({ error: 'not found' }, 404);
	},
} satisfies ExportedHandler<Env>;
