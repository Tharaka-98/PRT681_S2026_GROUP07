# ---------- deps ----------
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund

# ---------- build ----------
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Baked into the server bundle; override at build time for a different backend
ARG API_BASE_URL=http://api:8080
ENV API_BASE_URL=$API_BASE_URL
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ---------- runtime ----------
# next.config.mjs sets output:'standalone', so only the traced files ship.
FROM node:20-alpine AS runtime
WORKDIR /app

RUN apk add --no-cache curl && addgroup -g 1001 nodejs && adduser -D -u 1001 -G nodejs nextjs

ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000

COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=build --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
    CMD curl -fsS http://localhost:3000/api/proxy/health || exit 1

CMD ["node", "server.js"]
