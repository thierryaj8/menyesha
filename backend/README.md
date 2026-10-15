# Menyesha API

Express and PostgreSQL service for citizen authentication/reporting and the admin
and police CMS. CMS data is stored in PostgreSQL, protected by staff access
tokens and role permissions, and is intentionally not pre-populated with demo
content or shared accounts.

## Local setup

```bash
cd backend
npm install
cp .env.example .env
docker compose up -d database
npx prisma migrate deploy
npm run db:create-admin
npm run dev
```

Before running `db:create-admin`, set `CMS_BOOTSTRAP_USERNAME`,
`CMS_BOOTSTRAP_EMAIL`, and `CMS_BOOTSTRAP_PASSWORD` in the environment. The
password must be at least 12 characters. The command creates the first
super-admin only when no admin account exists; remove the bootstrap variables
after use. Additional administrators and police department accounts are created
from the authenticated CMS.

`dev` and `start` create `.env` from `.env.example` if it is missing. The
example configuration is for local development only. Production must provide
`NODE_ENV=production`, `DATABASE_URL`, and a long random `JWT_SECRET`. The API
listens on `http://localhost:4000`; `GET /health` checks the API and database
connection. Run `npm test`, `npm run typecheck`, and `npm run build` for local
checks.

When the app and API run in GitHub Codespaces, the app automatically targets the
matching forwarded API port. Forward port `4000` in the VS Code **Ports** panel
and set its visibility to **Public** when the web app must call it from a
browser; private forwarded ports redirect browser API requests to GitHub
sign-in. The API allows CORS only for localhost origins and forwarded ports
belonging to the same Codespace.

In development, signup writes a one-time verification code to the API console.
Production requires `SMS_MODE=webhook`, `SMS_WEBHOOK_URL`, and
`SMS_WEBHOOK_TOKEN`. The configured endpoint receives a bearer-authenticated
JSON `POST` with `{ "to": "+250...", "message": "..." }` and must return a 2xx
response.

## Staff access and data

- `POST /auth/staff/login` and `GET /auth/staff/me` authenticate staff using a
  separate staff token. Passwords are hashed with bcrypt.
- `GET /cms/public` returns published content and verified/active departments
  for public app surfaces. It never returns department credentials.
- Staff `GET`, `POST`, `PATCH`, and `DELETE /cms/:resource` endpoints manage
  announcements, traffic documents, news/articles, newsletters, posts, videos,
  photos, advertisements, banners, and campaigns. Payloads are validated by
  resource-specific Zod schemas.
- `GET`, `POST`, `PATCH`, and `DELETE /cms/departments` manage police department
  profiles. Department login credentials are optional until a department
  account is needed; passwords are never returned by the API.
- `GET`, `POST`, `PATCH`, and `DELETE /cms/accounts` manage admin accounts.
  Account creation requires an initial password; updates may rotate it.
- `GET /cms/dashboard` returns database-backed counts, engagement metrics, and
  the audit activity log. Public content views, clicks, impressions, likes, and
  downloads are recorded through rate-limited `POST /cms/metrics/:resource/:id`.

Role permissions are enforced on the server: super admins manage all CMS areas
and roles; content, police, traffic, and advertising admins are limited to their
areas. A police department login is scoped to its own announcements.
Admin account deletion protects the last active super admin and prevents staff
from deleting their own account.

CMS records are not seeded. Staff can create real records after the first
super-admin account is provisioned. Uploaded media storage is not configured;
image, video, and document fields accept hosted URLs.

## Citizen API

- `POST /auth/signup` with `{ "username", "phone", "password" }`
- `POST /auth/verify` with `{ "phone", "code" }`; returns a bearer access token
- `POST /auth/login` with `{ "phone", "password" }`
- `GET /auth/me` with a citizen bearer token
- `POST /reports` with category, description, coordinates, area, and optional
  `incidentAt`, `photoUrl`, and `isAnonymous`
- `GET /reports/me/reports`, `GET /reports/me/points`, and
  `GET /reports/stats/kigali-week`
- `GET /reports/:id` returns only the signed-in user's report
- `GET /notifications`, `PATCH /notifications/:id/read`, and
  `PATCH /notifications/read-all` are scoped to the signed-in user

Report coordinates are stored at full precision for authorized processing.
Citizen API responses round coordinates to two decimal places. Report creation
enforces the five-per-Kigali-day limit and links nearby open reports in the same
category within 250 m and 14 days.
