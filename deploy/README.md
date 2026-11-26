# Deploy on the Hostinger VPS with Coolify

The VPS already runs **Coolify** (Docker + Traefik proxy on ports 80/443, automatic SSL). Deploy this app as a new Coolify application. Do not install nginx or another web server on that VPS: it would clash with Coolify and the apps already running there.

## One-time setup

1. **Supabase:** run `supabase/bookings.sql` once in the SQL Editor (already done for the project in use).
2. **DNS:** A record `app` -> `145.79.13.147` (TTL 300) on alambalisanthi.com (done).
3. **Coolify** (usually `http://145.79.13.147:8000`, log in with your Coolify account):
   1. Projects > pick a project (or create "Alam Bali Santhi") > Environment > **+ New** > **Public Repository**.
   2. Repository URL: `https://github.com/CLOUDS-ORG/cost-simulator`. Branch: `bookings-app` (use `main` after the pull request is merged). Build pack: **Nixpacks**. Port: **3000**.
   3. Open the new application > **Configuration > General**: set **Domains** to `https://app.alambalisanthi.com` and save.
   4. **Environment Variables**: add the values from `.env.example` (leave "Build Variable" ticked so the `NEXT_PUBLIC_` ones exist at build time):
      - `NEXT_PUBLIC_SUPABASE_URL`
      - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
      - `SUPABASE_SERVICE_ROLE_KEY` (secret)
      - `ANTHROPIC_API_KEY` only if the AI features are turned on
   5. Click **Deploy**. Watch the logs; the first build takes a few minutes. Coolify issues the SSL certificate by itself once DNS points at the server.
4. Open `https://app.alambalisanthi.com`.

## Updating later

Push to the branch, then in Coolify click **Redeploy** (or enable Auto Deploy in the application's Advanced settings to deploy on every push).

## If something goes wrong

- Build fails: open the deployment log in Coolify and send the last lines to Claude.
- Site shows a certificate error: wait a few minutes after the first deploy; check the DNS record points at `145.79.13.147`.
- To go back: Coolify > the application > Stop. Existing apps are not touched. The VPS also has Hostinger backups and a snapshot taken before this setup (hPanel > VPS > Snapshot & Backup).
