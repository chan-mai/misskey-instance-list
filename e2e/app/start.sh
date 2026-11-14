#!/bin/sh
set -eu

STATE=/state
WRANGLER=/repo/packages/agent/node_modules/.bin/wrangler

cd /repo/packages/core
"$WRANGLER" d1 migrations apply misskey-instance-list --local --persist-to "$STATE"
cd /repo/e2e/app
"$WRANGLER" d1 migrations apply misskey-instance-list-jobs --local --persist-to "$STATE" -c agent.wrangler.jsonc

# ZITADELのOIDCクライアントはprovisionが発行
. /shared/oidc.env
cat >/repo/packages/web/.dev.vars <<VARS
NUXT_OIDC_PROVIDERS_ZITADEL_CLIENT_ID=$OIDC_CLIENT_ID
NUXT_OIDC_PROVIDERS_ZITADEL_CLIENT_SECRET=$OIDC_CLIENT_SECRET
NUXT_OIDC_PROVIDERS_ZITADEL_REDIRECT_URI=https://web.mil-e2e.test/auth/zitadel/callback
NUXT_OIDC_SESSION_SECRET=e2e-session-secret-0123456789abcdef0123456789abcdef
NUXT_OIDC_AUTH_SESSION_SECRET=e2e-auth-session-secret-0123456789abcdef0123456789
NUXT_OIDC_TOKEN_KEY=MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=
VARS

cd /repo/e2e/app
"$WRANGLER" dev -c agent.wrangler.jsonc --ip 0.0.0.0 --port 8788 --inspector-port 9230 --persist-to "$STATE" --show-interactive-dev-session=false &
cd /repo/packages/web
"$WRANGLER" dev --ip 0.0.0.0 --port 8787 --inspector-port 9231 --persist-to "$STATE" --show-interactive-dev-session=false &

wait
