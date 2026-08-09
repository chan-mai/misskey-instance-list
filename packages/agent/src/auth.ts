import { cloudflareAccess, type AuthMiddleware } from 'tsumugi';
import type { Env } from './env.js';

export const accessAuth: AuthMiddleware = async(c, next) => {
  const env = c.env as Env;

  if (!env.CF_ACCESS_TEAM_DOMAIN || !env.CF_ACCESS_AUD) {
    return c.json({ error: 'Cloudflare Access is not configured' }, 503);
  }
  return cloudflareAccess({
    teamDomain: env.CF_ACCESS_TEAM_DOMAIN,
    aud: env.CF_ACCESS_AUD,
  })(c, next);
};
