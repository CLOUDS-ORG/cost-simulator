# Deploy to the Hostinger VPS (KVM 4, Ubuntu)

Runs the Cost Simulator + Bookings app on your own VPS at a subdomain, with nginx, free SSL and pm2 (restarts the app automatically and after a reboot). The main website on your Unlimited web hosting is not touched. The database and logins stay on Supabase.

## Before you start (about 10 minutes, in the browser)

1. **Supabase:** open SQL Editor and run `supabase/bookings.sql` once.
2. **DNS:** in hPanel go to Domains > alambalisanthi.com > DNS / Nameservers and add an **A record**: Name `app`, Points to `145.79.13.147`, TTL 300 (change the name if you prefer another subdomain). Wait a few minutes.
3. Have your Supabase values ready (Project Settings > API): project URL, publishable key, secret key. Do not paste the secret key into chat; type it on the server only.

## First install (about 10 minutes)

1. hPanel > VPS > Manage > **Browser terminal** (or `ssh root@145.79.13.147`).
2. Download and run the setup script:

   ```bash
   curl -fsSL https://raw.githubusercontent.com/CLOUDS-ORG/cost-simulator/bookings-app/deploy/vps-setup.sh -o vps-setup.sh
   sudo bash vps-setup.sh app.alambalisanthi.com your-email@example.com
   ```

3. The first run installs everything, creates `/opt/cost-simulator/.env.production` and stops. Fill it in:

   ```bash
   nano /opt/cost-simulator/.env.production
   ```

   (Ctrl+O, Enter to save, Ctrl+X to exit.) Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY`. `ANTHROPIC_API_KEY` can stay empty while the AI features are off.

4. Run the same command again. It builds the app, starts it, sets up nginx and gets the SSL certificate. Then open `https://app.alambalisanthi.com`.

If the certificate step fails, the DNS record has not reached the server yet. Wait and run the same command again.

## Updating the app later

```bash
sudo bash /opt/cost-simulator/deploy/update.sh
```

Pulls the latest code from GitHub, rebuilds and reloads with no manual steps. Pass a branch name as the first argument to deploy another branch (for example `main` after the pull request is merged; then also use `main` in future runs).

## Useful commands

| What | Command |
| --- | --- |
| Is the app running? | `pm2 status` |
| Live logs | `pm2 logs cost-simulator` |
| Restart | `pm2 restart cost-simulator` |
| nginx check | `nginx -t && systemctl status nginx` |

## Notes

- The app listens on port 3100 behind nginx, so it will not clash with other things on the server. The script adds its own nginx site and leaves existing sites alone.
- Back up: Supabase holds all data. Turn on Hostinger VPS weekly backups in hPanel if you want a snapshot of the server too.
- Keep `.env.production` private (the script sets permissions to owner-only). Never commit it.
