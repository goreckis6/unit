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

# DEBUG - Check what's in src/ after copy
RUN echo "=== src/ structure ===" && \
    ls -la src/ && \
    echo "=== src/routes/ structure ===" && \
    ls -la src/routes/ | head -20 && \
    echo "=== src/components/ structure ===" && \
    ls -la src/components/ | head -20 && \
    echo "=== Checking specific file ===" && \
    ls -la src/routes/calculators/adding-fractions-calculator/ && \
    ls -la src/components/ | grep AddingFractions

# Build the Qwik application using official qwik build command
# This builds both client and SSR automatically
RUN npm run build

# Remove symlink/directory after build
RUN unlink src 2>/dev/null || rm -rf src || true

# DEBUG - Show what was built
RUN echo "=== Build output ===" && \
    ls -la dist/ && \
    echo "=== Client files ===" && \
    ls -la dist/client/ || echo "No client dir" && \
    echo "=== Server files ===" && \
    ls -la dist/server/ || echo "No server dir"

# Production stage
FROM node:20-alpine
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies (including vite for preview server)
RUN npm ci

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/server.js ./server.js

# Set environment
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Expose port
EXPOSE 3000

# Start Node.js production server
CMD ["npm", "start"]