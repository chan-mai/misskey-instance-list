import { cloudflareAccess } from 'tsumugi';

import type { Env } from './env.js';
import type { AuthMiddleware } from 'tsumugi';

export const accessAuth: AuthMiddleware<Env> = (request, env) => {
	if (!env.CF_ACCESS_TEAM_DOMAIN || !env.CF_ACCESS_AUD) {
		return Response.json({ error: 'Cloudflare Access is not configured' }, { status: 503 });
	}
	return cloudflareAccess({
		teamDomain: env.CF_ACCESS_TEAM_DOMAIN,
		aud: env.CF_ACCESS_AUD,
	})(request, env);
};
