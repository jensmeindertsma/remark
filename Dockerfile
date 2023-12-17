
FROM node:21.4.0-alpine as base
ENV NODE_ENV production
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base as dependencies
WORKDIR /app
ADD prisma ./prisma
ADD package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --prod=false
RUN pnpm run database:generate

FROM base as production
WORKDIR /app
COPY --from=dependencies /app/node_modules /app/node_modules
ADD package.json pnpm-lock.yaml ./
RUN pnpm prune --prod

FROM base as build
WORKDIR /app
COPY --from=dependencies /app/node_modules /app/node_modules
ADD . .
RUN pnpm build

FROM base
WORKDIR /app
COPY --from=production /app/node_modules /app/node_modules
COPY --from=build /app/build /app/build
COPY --from=build /app/public /app/public
# Need to include migration files so they can be applied by the orchestrator.
COPY --from=build /app/prisma /app/prisma 
ADD package.json ./

CMD ["pnpm", "start"]
