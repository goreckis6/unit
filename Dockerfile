# Qwik SSR Production Image
FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built application from CI
COPY dist ./dist

# Set environment
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Start Qwik SSR server
CMD ["node", "dist/server/entry.express.js"]
