# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Fix permissions for node_modules binaries (for Alpine Linux)
RUN chmod -R +x node_modules/.bin || true && \
    find node_modules/@esbuild -type f -name "esbuild" -exec chmod +x {} \; || true

# Replace src/ with src-qwik/ content for Qwik build
# First copy style.css from old src/ to src-qwik/ if it exists
RUN cp src/style.css src-qwik/style.css 2>/dev/null || true
# Then replace src/ with src-qwik/
RUN rm -rf src && cp -r src-qwik src

# Build client
RUN npm run build.client

# Build server (SSR) with Express adapter
RUN npx vite build -c adapters/express/vite.config.ts

# DEBUG - Show what was built
RUN echo "=== Build output ===" && \
    ls -la dist/ && \
    echo "=== Client files ===" && \
    ls -la dist/client/ && \
    echo "=== Server files ===" && \
    ls -la dist/server/

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