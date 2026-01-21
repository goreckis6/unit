# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Create symlink for Qwik build (src -> src-qwik)
# This is required because Qwik expects src/ directory
RUN ln -sf src-qwik src

# Build the Qwik application
RUN npm run build:qwik:internal

# Remove symlink after build
RUN rm -f src

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
COPY --from=builder /app/src-qwik ./src-qwik
COPY --from=builder /app/vite.config.qwik.ts ./vite.config.qwik.ts
COPY --from=builder /app/tsconfig.qwik.json ./tsconfig.qwik.json

# Create symlink for runtime
RUN ln -sf src-qwik src

# Set environment
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Expose port
EXPOSE 3000

# Start Qwik SSR server using Vite preview
CMD ["npm", "run", "preview:qwik", "--", "--host", "0.0.0.0", "--port", "3000"]