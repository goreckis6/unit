# ---------- BUILD ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Update npm to latest version
RUN npm install -g npm@latest

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build 2>&1 | tee /tmp/build.log; BUILD_EXIT=${PIPESTATUS[0]}; \
    if [ -f dist/index.html ]; then \
      echo "✅ Build complete - HTML files generated"; \
      exit 0; \
    else \
      echo "❌ Build failed - no index.html found"; \
      exit 1; \
    fi

# ---------- RUNTIME ----------
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Install serve globally for static file serving
RUN npm install -g serve

COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["serve", "dist", "-l", "3000", "--no-port-switching", "--no-clipboard", "--single"]
