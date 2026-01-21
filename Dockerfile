# ---------- BUILD ----------
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
RUN npm run build.client
RUN ls -la dist/build/ | head -5 || echo "No build/ directory after client build"
RUN npm run build
RUN ls -la dist/ && test -f dist/entry.express.js && echo "✅ entry.express.js found" || echo "❌ entry.express.js NOT found"
RUN test -f dist/build/preloader.js && echo "✅ preloader.js found" || echo "❌ preloader.js NOT found"
RUN ls -la dist/build/ | head -5 || echo "No build/ directory after server build"

# ---------- RUNTIME ----------
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./

# ⛔ NIE --only=production
RUN npm ci --omit=dev

EXPOSE 3000
CMD ["node", "dist/entry.express.js"]
