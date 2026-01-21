# Runtime stage - NO BUILD, app is pre-built in CI
FROM node:20-slim
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install ONLY production dependencies
RUN npm ci --omit=dev

# Copy pre-built application from CI
COPY dist ./dist

# Set environment
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
ENV ORIGIN=https://unitconverterhub.com

# Expose port
EXPOSE 3000

# Start Express SSR server
CMD ["node", "dist/server/entry.express.js"]
