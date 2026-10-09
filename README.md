# MENYESHA

A citizen reporting app for Kigali. See a problem — crime, broken infrastructure,
environmental damage, utility cuts, traffic hazards — report it in a few taps, then
follow what happens.

Authentication and citizen report data require the backend. Police, admin, and
discovery content still use local mock data.

## Run it

```bash
npm install
npx expo start        # then press w (web), a (Android), i (iOS)
```

For backend-backed auth and reports, start the API and database as described in
[`backend/README.md`](backend/README.md), then configure `EXPO_PUBLIC_API_URL` if
the default host is not reachable from your device. Android emulators use
`http://10.0.2.2:4000`; physical devices need the computer's LAN address.

Create an account in the app. In development, the verification code is printed
in the backend terminal; production sends it through the configured SMS webhook.

## What is here

| Flow | Route | Notes |
| --- | --- | --- |
| Log in | `/login` | Phone + password, with a **Call 112** block that needs no login |
| Sign up | `/signup` | username, +250 number, password |
| Phone check | `/verify` | 6-digit SMS code (demo: `123456`) |
| Home | `/` | Greeting, emergency banner, FixPoints, two big buttons, recent reports, "Kigali this week" |
| Report · 1. Pick a problem | `/report` | 5 categories, one tap moves you on |
| Report · 2. Details | `/report/details` | One sentence, optional photo/video, location on a small map |
| Report · 3. Check | `/report/review` | Everything in one look, then **Send** |
| Report · 4. Done | `/report/done` | Report number + honest duplicate/points answer |
| My reports | `/track` | Status chip on every row |
| Report detail | `/report/[id]` | Vertical timeline, one plain line per stage |
| FixPoints | `/points` | Balance, how it works, history, language, log out |

Emergency hotlines (112, 912, 111, 113, 3512, 116) open as a bottom sheet from the
login screen, home banner, and the report flow.

## How it is put together

```
src/
  app/                 every file is a screen (Expo Router)
    _layout.tsx        fonts, providers, and the login/verify/app gate
    login.tsx  signup.tsx  verify.tsx
    (app)/
      (tabs)/          index (home) · track · points
      report/          index (step 1) · details · review · done · [id] (timeline)
  components/          Button, Card, Screen, TopBar, Field, StatusChip, Note,
                       ReportCard, Balance, KigaliMap, EmergencySheet
  data/                categories + status metadata, Kigali areas, mock reports
  hooks/               useKigaliLocation (expo-location with a safe fallback)
  i18n/                en.ts · rw.ts · fr.ts  — all UI text lives here
  store/               AppProvider (auth, reports, points) + duplicate/rate-limit rules
  theme.ts             colors, spacing, radii, Fraunces + Manrope type styles
  types.ts             Report, PointEntry, status and category types
```

### Design tokens
- Brand: deep teal `#1F4B43`, warm amber `#D98F2B`
- Status: muted green = resolved/verified, warm ochre = in review, brick red = emergency only
- Fraunces for big numbers and headings, Manrope for everything else
- Cards are rounded on a soft off-white/sage background, minimum 48px tap targets,
  one primary action per screen

### Rules that are already implemented (in mock form)
- **Duplicate detection** — `src/store/rules.ts`: same category, within 250 m,
  within 14 days, not yet resolved. The new report is linked to the older one,
  only the first report stays eligible for points, and the confirmation screen
  says so in plain words.
- **Points** — credited only when a report reaches *Verified*, shown as
  `pending` until then, and *Taken back* exists for reports later found false.
  1 FixPoint = 10 RWF.
- **Rate limit** — 5 reports per person per day.
- **Privacy** — no witness names anywhere, and the public view of a location is a
  blurred "general area" (`KigaliMap blurred`), never the exact pin.

## Adding a language

Add keys to `src/i18n/rw.ts` or `src/i18n/fr.ts`. Any key you add overrides
English; anything you skip falls back to English. Screens never change.
The language switcher on the FixPoints screen proves it works.

## Backend API

The standalone Express and PostgreSQL API is in [`backend/README.md`](backend/README.md).
The Expo app connects signup, verification, login, session hydration, report
submission and history, points history, and Kigali weekly statistics through
`src/store/AppProvider.tsx` and `src/utils/api.ts`.

- Photo/video uploads need a storage provider; report creation currently accepts
  an already-hosted `photoUrl`.
- Push notifications and admin report/status workflows remain future backend work.

### Maps
`src/components/KigaliMap.tsx` is a dependency-free placeholder so the prototype
runs anywhere, including the web. Swap it for the Mapbox or Google Maps SDK —
the props (`label`, `blurred`, `height`) are already shaped for it. The exact pin
must stay server-side for the responding authority; the community view keeps the
`blurred` variant.
