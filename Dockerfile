
FROM node:24-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN apt-get update -y && apt-get install -y openssl
RUN corepack enable
COPY . /app
WORKDIR /app

FROM base AS prod-deps
RUN pnpm install --prod --frozen-lockfile && pnpm prisma generate

FROM base AS build
RUN pnpm install --frozen-lockfile

ARG DATABASE_URL
ARG TASK_SECRET

ENV DATABASE_URL=$DATABASE_URL
ENV TASK_SECRET=$TASK_SECRET


RUN pnpm nuxt prepare && pnpm prisma generate && pnpm build

FROM base
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/.output /app/.output
# prisma directory is needed for migrations
COPY --from=build /app/prisma /app/prisma 

ENV NODE_ENV=production
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3000

EXPOSE 3000
CMD [ "sh", "-c", "pnpm prisma migrate deploy && pnpm start" ]
