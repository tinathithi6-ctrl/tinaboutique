Deployment guide — Frontend (Netlify) + Backend (Docker or managed)

Overview
- This repository contains a Vite + React frontend and a Node/Express TypeScript backend using PostgreSQL.
- Frontend is ready to deploy to Netlify (uses `VITE_API_URL` to reach the API).
- Backend can run in a container (Dockerfile included) or be deployed to a managed Node host.

1) Frontend — Netlify
- In Netlify, create a new site connected to this Git repository.
- Set build command: `npm run build` and publish directory: `dist` (already in `netlify.toml`).
- Add these environment variables at Site settings -> Build & deploy -> Environment:
  - `VITE_API_URL` = https://api.yourdomain.com (the public URL of your backend)
  - `NODE_ENV` = production
- If you want Netlify to proxy `/api/*` to your backend, replace the placeholder in `netlify.toml` `[[redirects]]` `to` value with your backend host or configure the redirect in Netlify UI.

2) Backend — Docker (recommended for portable deployment)
- Build the image locally:

```powershell
docker build -t tinaboutique-backend:latest .
```

- Run the container (example):

```powershell
docker run -e DB_HOST=... -e DB_USER=... -e DB_PASSWORD=... -e DB_DATABASE=... -e DB_PORT=5432 -e JWT_SECRET=your_jwt_secret -p 3001:3001 tinaboutique-backend:latest
```

- The Dockerfile runs migrations (`npm run migrate:prod`) then starts the server (`npm run start:prod`). Ensure the DB user has permissions to create tables or run migrations as a superuser.

3) Backend — Managed host (Render/Heroku/Cloud Run)
- Set environment variables:
  - `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`, `DB_PORT`, `JWT_SECRET`, `FRONTEND_URL` (your Netlify URL)
- In the service, use the start command:
  - `npm run start:prod`
- For migrations, either run `npm run migrate:prod` during deployment or before starting the app.

4) Database migrations & Permissions
- Default behavior: the migrations script tries to create tables and add comments/indexes. It is tolerant: comments or index creation will not fail the whole migration if permissions are missing; the script logs a NOTICE.
- If you prefer a clean run without permission issues, run migrations as a DB superuser or change table owners:

```sql
ALTER TABLE activity_logs OWNER TO your_db_user;
ALTER TABLE payment_logs OWNER TO your_db_user;
-- etc.
```

Or run the migration script as a user with rights to create tables:

```powershell
npm run migrate:prod
```

5) Troubleshooting
- Error "must be owner of table ..." during migrations: either run migrations with a superuser or grant ownership as shown above.
- API errors in the frontend (e.g. `.map is not a function`): the frontend includes defensive checks; if you still get logs, copy the console logs here.
- CORS issues: set `FRONTEND_URL` on your backend to allow the Netlify domain or update `allowedOrigins` in `src/server.ts`.

6) Continuous Deployment (optional)
- Add a GitHub Actions workflow that:
  - Builds the frontend and uploads it to Netlify (or pushes to Netlify via GitHub integration).
  - Builds Docker image for the backend, pushes to a container registry, and deploys to your host.

7) Security Notes
- Do not commit secrets. Use Netlify/host env vars for secrets.
- Rotate JWT_SECRET and DB passwords if they were ever exposed.

If you want, I can:
- Add a GitHub Actions workflow file for CI/CD.
- Add a `migrate:ci` script that runs migrations in CI and fails loudly on error.
- Harden the Dockerfile to avoid installing devDependencies in production (build step). Just say which option you prefer and je m'en occupe.
