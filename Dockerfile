# multi-stage Dockerfile for production Next.js build (Node 20)
FROM node:20.19.6-bullseye AS builder
WORKDIR /app
# copy lockfile first for deterministic install
COPY package*.json ./
COPY package-lock.json ./
# install deps (only production deps left in the image later)
RUN npm ci --production=false

# copy sources
COPY . .

# build static app
RUN npm run type-check
RUN npm run lint
RUN npm run build

# production image
FROM node:20.19.6-bullseye-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
# copy only needed files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/tsconfig.json ./tsconfig.json
# expose standard Next.js port
EXPOSE 3000
CMD ["node", "node_modules/.bin/next", "start", "-p", "3000"]
