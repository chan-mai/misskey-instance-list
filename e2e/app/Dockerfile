FROM node:26-bookworm-slim

RUN apt-get update \
	&& apt-get install -y --no-install-recommends ca-certificates \
	&& rm -rf /var/lib/apt/lists/* \
	&& npm install -g pnpm@10.33.2

WORKDIR /repo
COPY . .
RUN pnpm install --frozen-lockfile

# OIDCの各エンドポイントURLはビルド時に確定
ARG NUXT_OIDC_PROVIDERS_ZITADEL_BASE_URL=https://zitadel.mil-e2e.test
RUN NUXT_OIDC_PROVIDERS_ZITADEL_BASE_URL=$NUXT_OIDC_PROVIDERS_ZITADEL_BASE_URL pnpm build

ENV CI=true
CMD ["sh", "/repo/e2e/app/start.sh"]
