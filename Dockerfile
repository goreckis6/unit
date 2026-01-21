# Runtime stage - Serve Vue SPA
FROM node:20-slim
WORKDIR /app

# Install serve globally
RUN npm install -g serve

# Copy pre-built Vue application from CI
COPY dist ./dist

# Set environment
ENV NODE_ENV=production

# Expose port
EXPOSE 3000

# Start static file server with SPA fallback
CMD ["serve", "-s", "dist", "-l", "3000"]
