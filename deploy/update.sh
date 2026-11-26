#!/usr/bin/env bash
# Deploy the latest code:   sudo bash /opt/cost-simulator/deploy/update.sh [branch]
set -euo pipefail
BRANCH="${1:-bookings-app}"
cd /opt/cost-simulator
git fetch origin "$BRANCH"
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"
npm ci
npm run build
pm2 reload cost-simulator --update-env
echo "Updated to $(git rev-parse --short HEAD)"
