FROM node:20-alpine AS builder

WORKDIR /app

# Copy root workspace and package files
COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY apps/api/package*.json ./apps/api/

# Install dependencies
RUN npm ci

# Copy source files
COPY tsconfig.json ./
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

# Build shared package and backend application
RUN npm --workspace=packages/shared run build
RUN npm --workspace=apps/api run build

# -----------------
# Production Image
# -----------------
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
COPY packages/shared/package*.json ./packages/shared/
COPY apps/api/package*.json ./apps/api/

RUN npm ci --omit=dev

COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/apps/api/dist ./apps/api/dist

EXPOSE 4000

CMD ["node", "apps/api/dist/src/main"]
