# CalculinoHub

Next.js application with blog and calculators, supporting 25 languages.

## Stack

- **Next.js 14** (App Router)
- **pnpm** (package manager)
- **next-intl** (i18n)
- **MDX** (blog content)
- **PM2** (process manager)
- **Caddy** (reverse proxy + HTTPS)
- **GitHub Actions** (CI/CD)

## Development

```bash
# Install dependencies
pnpm install

# Run dev server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## Deployment

1. **DNS Configuration**
   - Point `calculinohub.com` and `www.calculinohub.com` to your VPS IP

2. **Server Setup**
   - Install Node.js 20+
   - Install PM2: `sudo npm install -g pm2`
   - Install Caddy
   - Copy `Caddyfile` to `/etc/caddy/Caddyfile`
   - Run `sudo caddy reload`

3. **GitHub Actions**
   - Set secrets:
     - `FRONTEND_VPS_HOST`
     - `FRONTEND_VPS_USERNAME`
     - `FRONTEND_VPS_SSH_KEY`
   - Push to `main` branch to trigger deployment

## Structure

```
app/[locale]/          # Localized routes
  calculators/         # Calculator pages
  blog/                # Blog pages
content/blog/          # MDX blog posts
i18n/                  # Translation files
public/                # Static assets
scripts/               # Build scripts
```

## Production

- Next.js runs on port 3000 (PM2 process manager)
- Caddy handles HTTPS and reverse proxy
- Standalone output for minimal deployment
- PM2 configuration: `ecosystem.config.cjs`
- Auto-deployment via GitHub Actions on push to main branch

### PM2 Commands

```bash
# Check status
pm2 status

# View logs
pm2 logs calculinohub

# Restart app
pm2 restart calculinohub

# Stop app
pm2 stop calculinohub

# Monitor
pm2 monit
```
