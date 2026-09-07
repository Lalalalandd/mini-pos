FROM node:20-alpine AS builder

WORKDIR /app

# Copy root workspace and package files
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY apps/web/package*.json ./apps/web/

# Install dependencies
RUN npm ci

# Copy source files
COPY tsconfig.json ./
COPY packages/shared ./packages/shared
COPY apps/web ./apps/web

# Build shared package and Next.js web application
RUN npm --workspace=packages/shared run build
RUN npm --workspace=apps/web run build

# -----------------
# Production Image
# -----------------
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY apps/web/package*.json ./apps/web/

RUN npm ci --omit=dev

COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/next.config.ts ./apps/web/

EXPOSE 3000

CMD ["npm", "--workspace=apps/web", "run", "start"]
