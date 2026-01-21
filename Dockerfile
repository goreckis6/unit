# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies (including dev for build)
RUN npm ci

# Copy source code
COPY . .

# Fix Alpine Linux binary permissions (CRITICAL for vite/npx)
RUN chmod -R 755 node_modules/.bin

# Build client
RUN npm run build.client

# Build server (SSR) with Express adapter
RUN npx vite build -c adapters/express/vite.config.ts

# Production stage
FROM node:20-alpine
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