# Deploy — Admin Panel + API + Database

Deployment uses **GitHub Actions** to build the Next.js app (unit/) and deploy to your VPS. The database lives in `/var/www/db-calculino` so it is **never overwritten** when the app is redeployed.

---

## Server requirements

- **Node.js 20**
- **PM2** (installed by deploy if missing)
- **Caddy** (for HTTPS reverse proxy)
- SSH access for deployment user

---

## GitHub Secrets

Configure these in your repo: **Settings → Secrets and variables → Actions**

| Secret | Required | Description |
|--------|----------|-------------|
| `FRONTEND_VPS_HOST` | ✅ | VPS hostname or IP (e.g. `123.45.67.89` or `server.example.com`) |
| `FRONTEND_VPS_USERNAME` | ✅ | SSH user for deploy |
| `FRONTEND_VPS_SSH_KEY` | ✅ | Private SSH key (full content, including `-----BEGIN ...-----`) |
| `ADMIN_SESSION_SECRET` | ✅ | Long random string (32+ chars) for admin session signing |
| `OLLAMA_API_KEY` | Optional | For Generate content / Translate features (Ollama Cloud) |

---

## Directory layout on server

| Path | Purpose |
|------|---------|
| `/var/www/calculinohub` | App code (overwritten on each deploy) |
| `/var/www/db-calculino` | SQLite database (`dev.db`) — **persistent, never overwritten** |
| `/etc/caddy/Caddyfile` | Caddy reverse-proxy config |

---

## First-time manual steps (after first deploy)

### 1. Create admin user (if seed didn’t run)

SSH into the server and run:

```bash
cd /var/www/calculinohub
export DATABASE_URL="file:/var/www/db-calculino/dev.db"
npm install   # install prisma, tsx, bcryptjs (needed for seed)
npx prisma generate
npx prisma db seed
```

Default admin (from seed): `slavomir.gorecki@gmail.com` / `Test456#` — **change password immediately**.

### 2. (Optional) Extra env variables

If you need more variables than those set by secrets, edit `/var/www/calculinohub/.env` after the first deploy. The workflow only updates `DATABASE_URL` on later deploys and keeps other keys as-is.

---

## What the deploy does

1. Builds Next.js from `unit/`
2. Creates `/var/www/db-calculino` if missing
3. Copies app files to `/var/www/calculinohub`
4. Updates `.env` with `DATABASE_URL="file:/var/www/db-calculino/dev.db"` and secrets (if set)
5. Runs `prisma migrate deploy`
6. Runs `prisma db seed` (can fail if `tsx` is missing — run manually if needed)
7. Restarts app with PM2

---

## Database backup

Backup SQLite:

```bash
cp /var/www/db-calculino/dev.db /path/to/backup/dev-$(date +%Y%m%d).db
```

---

## Troubleshooting

- **App doesn’t start:** Check `pm2 logs calculinohub`
- **Admin login fails:** Ensure `ADMIN_SESSION_SECRET` is set and run seed if needed
- **Generate/Translate errors:** Ensure `OLLAMA_API_KEY` is set in GitHub Secrets
