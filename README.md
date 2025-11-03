# Money Burner 3000

MeetingBurner is a lightweight productivity tool for running and analyzing meetings. It helps teams run tighter, more efficient meetings by tracking agenda items, per-item timing, live transcription, and a simple efficiency scoring system. The app is a Vite + React frontend with an optional Express backend. In development the server uses an in-memory store; the frontend also persists meeting reports to localStorage so the app works in static deployments.

## Features

- Create meetings with attendees and an ordered agenda
- Per-agenda-item timer, skip and completion tracking
- Live transcription using the Web Speech API (browser support required)
- Candle-style progress visual and a 2x-overtime red pulse alarm
- Meeting report with per-item analysis (actual vs allotted, burned cash)
- Efficiency scoring and grade
- Local persistence to `localStorage` (meetingReport:<id>) and optional server API

## Tech stack

- Frontend: React 18, Vite, TypeScript
- Styling: Tailwind CSS
- Data fetching: @tanstack/react-query
- Icons: Lucide
- Backend (optional): Express (TypeScript) with a simple in-memory `MemStorage` (server/storage.ts)

## Project structure (important files)

- `client/` – React app (Vite root is configured to `client/`) 
  - `src/` – main frontend source
  - `src/lib/api.ts` – API helpers and client-side fallback
  - `src/pages/ActiveMeeting.tsx` – meeting UI, timers, transcript
  - `src/pages/Dashboard.tsx` – shows recent meetings and metrics
- `server/` – lightweight Express server used in development
  - `server/index.ts` – server entry
  - `server/routes.ts` – API routes
  - `server/storage.ts` – `MemStorage` (in-memory)
- `shared/` – shared schema types

## Running locally

Requirements: Node.js (v18+ recommended), npm

1. Install dependencies

```bash
npm install
```

2. Development run (starts the Express server with Vite middleware)

```bash
# start the dev server (server + Vite)
PORT=3000 npm run dev
```

Notes:
- If the server fails to start with `EADDRINUSE`, change the `PORT` environment variable or free the port.
- On macOS we guard `reusePort` for compatibility; if you hit `ENOTSUP`, ensure your environment is up to date.

## Build & production (frontend only)

The Vite frontend is configured to output the static build to `dist/public`.

- Build full app (frontend + server bundle):

```bash
npm run build
```

- Build frontend only (convenience script used for Vercel deployments):

```bash
npm run build:client
# preview the built static site
npx vite preview --port 5173
```

## Deploying the frontend to Vercel (recommended quick path)

We recommend deploying the frontend only to Vercel (static site). The app includes a client-side fallback so it works without a server.

Vercel settings:
- Build Command: `npm run build:client`
- Output Directory: `dist/public`

Caveats:
- The Express `/api/*` endpoints are not available in this mode. The frontend will fall back to localStorage for meetings and meeting reports.
- For a full deployed API, either convert Express routes into Vercel Serverless Functions or host the Express server on a Node host (Render, Railway, Fly) and set an API base URL.

## Persistence and data model

- Development server storage: `server/storage.ts` uses an in-memory `Map`. This is ephemeral — server restarts lose meetings.
- Client persistence: `localStorage` keys used by the app include:
  - `meetingReport:<id>` – full meeting report stored when a meeting ends
  - `lastMeetingResult` – most recent meeting report
  - `meetingAgenda`, `meetingAgendaChecked`, `meetingAgendaTimes`, `meetingAgendaSkipped` – active meeting state
  - `localMeetings` – fallback list of created meetings when no server API is available

If you need persistence across users and server restarts, add a proper database (Postgres/Neon/Supabase) and replace `MemStorage` with a DB-backed storage adapter.

## Important behaviours and edge cases

- The Web Speech API is used for live transcription; browsers that don't support it will see a notice and transcription will be disabled.
- The app uses a 1s interval timer for per-item timing. Background tab throttling can affect timer accuracy; switching to a Date.now() delta approach is recommended for production.
- When operating without a server (static deploy), meeting creation and updates fall back to localStorage. The Dashboard merges server data (if any) with local reports so recently finished meetings appear immediately.

