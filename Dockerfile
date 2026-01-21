# Build stage
FROM node:20 AS builder
WORKDIR /app

# Copy package files (including lock file for reproducible builds)
COPY package.json package-lock.json ./

# Install dependencies using lock file for stability
RUN npm ci

# Copy source code
COPY . .

# Build arguments for Vite environment variables
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build the application
RUN npm run build

# DEBUG – zobacz co faktycznie powstało
RUN echo "=== Client build (dist/) ===" && ls -la dist/ || echo "dist/ not found"
RUN echo "=== Server build (server/) ===" && ls -la server/ || echo "server/ not found"
RUN echo "=== Looking for entry.node-server.js ===" && ls -la server/entry.node-server.js 2>/dev/null || echo "entry.node-server.js NOT FOUND"

# Production stage with Node.js
FROM node:20
WORKDIR /app

# Copy built files (client: dist/, server: server/)
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Set environment variable
ENV NODE_ENV=production
ENV PORT=3000

# Expose port 3000
EXPOSE 3000

# Start the SSR server
# Qwik generates entry.node-server.js in server/ directory
CMD ["node", "server/entry.node-server.js"]