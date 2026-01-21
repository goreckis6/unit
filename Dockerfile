# ---------- BUILD ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Update npm to latest version
RUN npm install -g npm@latest

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build
RUN ls -la dist/ && test -f dist/index.html && echo "✅ Build complete" || echo "❌ Build failed"

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
