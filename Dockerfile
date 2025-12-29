
FROM node:24-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN apt-get update -y && apt-get install -y openssl
RUN corepack enable
COPY . /app
WORKDIR /app

FROM base AS prod-deps
RUN pnpm install --prod --frozen-lockfile --ignore-scripts

FROM base AS build
RUN pnpm install --frozen-lockfile

ARG DATABASE_URL
ARG TASK_SECRET
ARG GCP_PROJECT_ID
ARG GCP_REGION
ARG SERVICE_NAME
ARG SERVICE_ACCOUNT_EMAIL

ENV DATABASE_URL=$DATABASE_URL
ENV TASK_SECRET=$TASK_SECRET
ENV GCP_PROJECT_ID=$GCP_PROJECT_ID
ENV GCP_REGION=$GCP_REGION
ENV SERVICE_NAME=$SERVICE_NAME
ENV SERVICE_ACCOUNT_EMAIL=$SERVICE_ACCOUNT_EMAIL

RUN pnpm nuxt prepare && pnpm prisma generate && pnpm build && pnpm prisma migrate deploy

FROM base
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/.output /app/.output

ENV NODE_ENV=production
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3000

EXPOSE 3000
CMD [ "sh", "-c", "pnpm start" ]
