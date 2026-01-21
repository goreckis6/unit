# Build stage
FROM node:20 AS builder
WORKDIR /app

# Force esbuild to use JS implementation (not binary) - fixes buildx noexec
ENV ESBUILD_BINARY_PATH=""

# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies (including dev for build)
RUN npm ci

# Copy source code
COPY . .

# Note: No chmod needed with node:20 (Debian-based)

# Build client
RUN npm run build.client

# Build server (SSR) with Express adapter
RUN node node_modules/vite/bin/vite.js build -c adapters/express/vite.config.ts

# Production stage
FROM node:20
WORKDIR /app

# Copy package files and lock from builder
COPY --from=builder /app/package.json /app/package-lock.json ./

# Install production dependencies
RUN npm ci --omit=dev

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Set environment
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
ENV ORIGIN=https://unitconverterhub.com

# Expose port
EXPOSE 3000

# Start Express SSR server
CMD ["node", "dist/server/entry.express.mjs"]