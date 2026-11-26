#!/usr/bin/env bash
# One-time setup of the Cost Simulator + Bookings app on an Ubuntu VPS (Hostinger KVM).
# Run as root:   sudo bash vps-setup.sh app.alambalisanthi.com you@example.com [branch]
# Safe to run again. It does not touch other nginx sites already on the server.
set -euo pipefail

DOMAIN="${1:?Usage: vps-setup.sh <domain> <email-for-ssl> [branch]}"
EMAIL="${2:?Usage: vps-setup.sh <domain> <email-for-ssl> [branch]}"
BRANCH="${3:-bookings-app}"
APP_DIR=/opt/cost-simulator
PORT=3100
REPO=https://github.com/CLOUDS-ORG/cost-simulator

echo "==> Packages (nginx, certbot, git)"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y nginx certbot python3-certbot-nginx git curl ca-certificates

echo "==> Node.js 22 LTS"
if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 22 ]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi
node -v
command -v pm2 >/dev/null || npm install -g pm2

echo "==> Code from GitHub (branch: $BRANCH)"
if [ -d "$APP_DIR/.git" ]; then
  git -C "$APP_DIR" fetch origin "$BRANCH"
  git -C "$APP_DIR" checkout "$BRANCH"
  git -C "$APP_DIR" pull --ff-only origin "$BRANCH"
else
  git clone --branch "$BRANCH" "$REPO" "$APP_DIR"
fi
cd "$APP_DIR"

echo "==> Environment file"
if [ ! -f .env.production ]; then
  cp .env.example .env.production
  chmod 600 .env.production
  echo
  echo "!! Fill in the secrets now:   nano $APP_DIR/.env.production"
  echo "!! (Supabase URL, publishable key, secret key; Anthropic key is optional)."
  echo "!! Then run this script again."
  exit 0
fi
chmod 600 .env.production
if grep -q "your-project-ref" .env.production; then
  echo "!! .env.production still has the example values. Edit it: nano $APP_DIR/.env.production"
  exit 1
fi

echo "==> Build"
npm ci
npm run build

echo "==> Start with pm2 (port $PORT)"
cp deploy/ecosystem.config.cjs ecosystem.config.cjs
pm2 startOrReload ecosystem.config.cjs --update-env
pm2 save
pm2 startup systemd -u root --hp /root >/dev/null 2>&1 || true

echo "==> nginx site for $DOMAIN"
sed "s/__DOMAIN__/$DOMAIN/g; s/__PORT__/$PORT/g" deploy/nginx.conf > "/etc/nginx/sites-available/$DOMAIN"
ln -sf "/etc/nginx/sites-available/$DOMAIN" "/etc/nginx/sites-enabled/$DOMAIN"
nginx -t
systemctl reload nginx

if command -v ufw >/dev/null && ufw status | grep -q "Status: active"; then
  ufw allow 'Nginx Full' || true
fi

echo "==> SSL certificate (needs the DNS A record for $DOMAIN to point at this server)"
certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos -m "$EMAIL" --redirect

echo
echo "Done. Open https://$DOMAIN"
