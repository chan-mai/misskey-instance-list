
FROM node:24-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN corepack enable
WORKDIR /app

FROM base AS build
# 依存の変更時だけinstallキャッシュが落ちるようマニフェストだけ先に置く
# webのpostinstall(nuxt prepare)はソース展開前だと失敗するため--ignore-scriptsで飛ばす
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/core/package.json packages/core/
COPY packages/agent/package.json packages/agent/
COPY packages/web/package.json packages/web/
RUN pnpm install --frozen-lockfile --ignore-scripts

COPY . .

# --ignore-scriptsで飛ばした依存側のビルドスクリプト(prisma, esbuild等)を実行する
RUN pnpm rebuild -r

ARG DATABASE_URL
# ZITADELのbaseUrlからauthorizationUrl/tokenUrl等がビルド時に導出されるため, ビルド時にも必要
ARG NUXT_OIDC_PROVIDERS_ZITADEL_BASE_URL

ENV DATABASE_URL=$DATABASE_URL
ENV NUXT_OIDC_PROVIDERS_ZITADEL_BASE_URL=$NUXT_OIDC_PROVIDERS_ZITADEL_BASE_URL

RUN pnpm --filter @mil/core build \
 && pnpm --filter @mil/web exec nuxt prepare \
 && pnpm --filter @mil/web build \
 && pnpm --filter @mil/core db:migrate:deploy

# Nitroの.outputは自己完結しているためnode_modulesもpnpmも不要
FROM node:24-slim
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build /app/packages/web/.output ./.output

ENV NODE_ENV=production
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3000

EXPOSE 3000
CMD [ "node", ".output/server/index.mjs" ]
