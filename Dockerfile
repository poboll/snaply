# Snaply Server Dockerfile
# Multi-stage build for minimal image size

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY server/package.json server/pnpm-lock.yaml* ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source
COPY server/src ./src
COPY server/tsconfig.json ./

# Build
RUN pnpm build

# Stage 2: Production
FROM node:20-alpine AS runner

WORKDIR /app

# Install pnpm for production deps
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY server/package.json ./

# Install production dependencies only
RUN pnpm install --prod

# Copy built files
COPY --from=builder /app/dist ./dist

# Create data directories
RUN mkdir -p data uploads

# Set environment
ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

# Start server
CMD ["node", "dist/index.js"]
