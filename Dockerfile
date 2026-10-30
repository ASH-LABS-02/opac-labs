FROM node:22-bookworm-slim AS deps
WORKDIR /app
ENV MONGOMS_DISABLE_POSTINSTALL=1
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-bookworm-slim AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-bookworm-slim AS production
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
RUN groupadd --system nextjs && useradd --system --gid nextjs nextjs
COPY --chown=nextjs:nextjs --from=builder /app/public ./public
COPY --chown=nextjs:nextjs --from=builder /app/.next/standalone ./
COPY --chown=nextjs:nextjs --from=builder /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
