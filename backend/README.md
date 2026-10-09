# Menyesha API

Express and PostgreSQL service for citizen authentication, reports, points, and weekly statistics. The Expo app uses these endpoints for auth, report submission/history, points, and weekly statistics; admin and public content remain local mock data.

## Local setup

```bash
cd backend
npm install
cp .env.example .env
docker compose up -d database
npm run db:migrate -- --name init
npm run dev
```

The API listens on `http://localhost:4000`. `GET /health` checks both the API and its database connection. Run `npm test`, `npm run typecheck`, and `npm run build` for local checks.

In development, signup writes a one-time verification code to the API console. Production requires `SMS_MODE=webhook`, `SMS_WEBHOOK_URL`, and `SMS_WEBHOOK_TOKEN`. The configured endpoint receives a bearer-authenticated JSON `POST` with `{ "to": "+250...", "message": "..." }` and must return a 2xx response.

## API

- `POST /auth/signup` with `{ "username", "phone", "password" }`
- `POST /auth/verify` with `{ "phone", "code" }`; returns a bearer access token
- `POST /auth/login` with `{ "phone", "password" }`
- `GET /auth/me` with `Authorization: Bearer <token>`
- `POST /reports` with the category, description, coordinates, area, and optional `incidentAt`, `photoUrl`, and `isAnonymous`; requires a bearer token
- `GET /reports/me/reports`, `GET /reports/me/points`, and `GET /reports/stats/kigali-week`; require a bearer token
- `GET /reports/:id`; returns only the signed-in user's report
- `GET /notifications`, `PATCH /notifications/:id/read`, and `PATCH /notifications/read-all`; require a bearer token and are scoped to the signed-in user

Report coordinates are stored at full precision for authorized processing. Citizen API responses round coordinates to two decimal places. Report creation enforces the five-per-Kigali-day limit and links nearby open reports in the same category within 250 m and 14 days.

Successful report submissions also create a private notification for the report owner. Read state is persisted in PostgreSQL.

Uploaded media storage and admin workflows are not part of this initial API slice. `photoUrl` accepts an already-hosted asset URL; local device file URIs need an upload service before the mobile app can use this endpoint.