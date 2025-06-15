FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm fetch \
  && pnpm install --frozen-lockfile
COPY . .
ENV DATABASE_URL=dummy.db
RUN pnpm run build \
  && pnpm prune --prod

FROM node:22-alpine AS runner
WORKDIR /app
COPY --from=builder /app/build build/
COPY --from=builder /app/node_modules node_modules/
COPY drizzle ./drizzle
COPY package.json drizzle.config.ts ./
EXPOSE 3000
ENV NODE_ENV=production
CMD ["sh", "-c", "npx drizzle-kit migrate && node build"]
