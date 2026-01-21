# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Create symlink for Qwik build (src -> src-qwik)
RUN ln -sf src-qwik src

# Build the application
RUN npm run build:qwik:internal

# Remove symlink after build
RUN rm -f src

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --production

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/src-qwik ./src-qwik

# Create symlink for runtime (needed for imports)
RUN ln -sf src-qwik src

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Start the server using Vite preview (Qwik SSR)
CMD ["npm", "run", "preview:qwik", "--", "--host", "0.0.0.0", "--port", "3000"]
