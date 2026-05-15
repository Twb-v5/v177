# دليل التوبة النصوح — Project Guide

## Overview

**دليل التوبة النصوح** — A comprehensive Arabic Islamic app guiding users through sincere repentance (Tawbah). Available as a web app and a React Native mobile app.

---

## Quick Start (New Replit Account Setup)

Every time you open this project in a new Replit account, do the following **once**:

### Step 1 — Install dependencies
```bash
pnpm install
```

### Step 2 — Set up OpenAI (AI features)
Run this in the Replit **code_execution** sandbox (not the terminal):
```javascript
const result = await setupReplitAIIntegrations({
    providerSlug: "openai",
    providerUrlEnvVarName: "AI_INTEGRATIONS_OPENAI_BASE_URL",
    providerApiKeyEnvVarName: "AI_INTEGRATIONS_OPENAI_API_KEY"
});
console.log(result);
```
This provisions the OpenAI API key automatically — no key needed from you.

### Step 3 — Set required secrets
Open **Secrets** (lock icon in sidebar) and add:

| Secret | Value | Purpose |
|--------|-------|---------|
| `EXPO_TOKEN` | Your Expo account token | Building Android APK via EAS |

To get your Expo token: https://expo.dev/accounts/[username]/settings/access-tokens

### Step 4 — Start the servers
The workflows auto-start, but if they're not running, click **Run** or restart them from the Replit workflow panel:

| Workflow | Port | What it does |
|----------|------|--------------|
| `Start backend` | 3001 | Express API server |
| `Start application` | 5000 | React web app (Vite) |
| `artifacts/tawbah-mobile: expo` | 24800 | Expo mobile dev server |

### Step 5 — Push database schema (first time only)
```bash
pnpm --filter @workspace/db run push
```

---

## Building the Android APK

### Mobile app APK (tawbah-mobile — React Native / Expo)

Uses **EAS Build** (Expo cloud build service). No Android SDK needed locally.

```bash
# Build a distributable APK (recommended)
./scripts/build-apk.sh

# Or build a production AAB (for Google Play Store)
./scripts/build-apk.sh production
```

After running, a link is printed. Open it to track the build:
```
https://expo.dev/accounts/hadysbadys/projects/tawbah-mobile/builds
```

When the build finishes, an **APK download link** appears on that page. Install it on any Android device.

> **Note:** EAS sometimes has high queue times. The build usually takes 5–20 minutes.

### Web app APK (tawbah-web — Capacitor)

The web app is wrapped as a native Android app using Capacitor.  
Building it requires **Android Studio** (Android SDK + Gradle) on your local machine.

Steps on your local machine:
```bash
# 1. Build the web bundle
pnpm --filter @workspace/tawbah-web run build

# 2. Sync with Capacitor
npx cap sync android

# 3. Open in Android Studio and build APK
npx cap open android
```
Then in Android Studio: **Build → Build Bundle(s)/APK(s) → Build APK(s)**

---

## Project Structure

```
workspace/
├── artifacts/
│   ├── api-server/       # Express 5 API server  (port 3001 / 8080)
│   ├── tawbah-web/       # React + Vite web app  (port 5000)
│   └── tawbah-mobile/    # Expo React Native app (port 24800)
├── lib/
│   ├── api-spec/         # OpenAPI spec + Orval codegen
│   ├── api-client-react/ # Generated React Query hooks
│   ├── api-zod/          # Generated Zod schemas
│   └── db/               # Drizzle ORM schema + DB connection
├── scripts/
│   └── build-apk.sh      # One-command Android APK builder
└── replit.md             # This file
```

---

## Stack

| Layer | Tech |
|-------|------|
| Monorepo | pnpm workspaces |
| Node.js | v24 |
| TypeScript | 5.9 |
| API | Express 5 |
| Database | PostgreSQL + Drizzle ORM |
| Validation | Zod v4, drizzle-zod |
| Web frontend | React 19, Vite, Tailwind CSS 4, Framer Motion |
| Mobile | Expo SDK 54, Expo Router, NativeWind |
| AI | OpenAI GPT-4o via Replit AI Integrations proxy |
| Mobile builds | EAS Build (Expo) |

---

## App Features

1. **عهد التوبة (Covenant)** — Select sin category and sign repentance covenant
2. **مهام اليوم الأول (First Day Tasks)** — 4 mandatory immediate actions
3. **رحلة الـ 30 يوماً (30-Day Journey)** — Day-by-day task list with streak tracking
4. **عداد الذكر (Dhikr Counter)** — Istighfar/100, Tasbih/33, Sayyid al-Istighfar
5. **SOS Emergency Button** — 3-phase: Alert → Breathing → Emergency duas
6. **علامات قبول التوبة** — 5 spiritual signs of accepted repentance
7. **الكفارات الشرعية (Kaffarah)** — Sin-specific expiation steps with tracking
8. **مكتبة الرجاء (Hope Library)** — Quran + Hadiths + repentance stories with TTS
9. **يوميات التوبة السرية (Private Journal)** — Encrypted diary with mood tracking
10. **البوت الزكي (Zakiy AI Chatbot)** — Arabic spiritual AI chat with voice I/O
11. **غرف الذكر الجماعية (Dhikr Rooms)** — Live group dhikr sessions
12. **مقياس الروح (Soul Meter)** — Spiritual wellness gauge
13. **القرآن الكريم** — Full Quran browser with audio, tafsir, reading tracker
14. **شجرة التوبة (Tawbah Garden)** — Gamified growth tree
15. **وضع المناجاة (Munajat Mode)** — Immersive night worship mode

---

## API Routes (`/api`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/healthz` | Health check |
| GET | `/api/user/progress` | Get session progress |
| PUT | `/api/user/progress` | Update progress |
| POST | `/api/user/covenant` | Sign covenant |
| GET | `/api/habits` | Today's habits |
| POST | `/api/habits` | Toggle habit |
| GET | `/api/dhikr/count` | Get dhikr counts |
| POST | `/api/dhikr/increment` | Increment dhikr |
| GET | `/api/quran/surah/:id` | Fetch surah text (1–114) |
| GET | `/api/audio-proxy/quran/:reciterId/:num.mp3` | Stream Quran audio |

---

## Database Schema

| Table | Purpose |
|-------|---------|
| `user_progress` | Repentance journey state per session |
| `habits` | Daily habit completion |
| `dhikr_count` | Daily dhikr counters |
| `kaffarah_steps` | Expiation step completion |
| `journal_entries` | Private journal entries with mood |

---

## Common Commands

```bash
# Install all dependencies
pnpm install

# Push DB schema changes
pnpm --filter @workspace/db run push

# Build everything (typecheck + build)
pnpm run build

# Build Android APK via EAS
./scripts/build-apk.sh

# Typecheck all packages
pnpm run typecheck
```

---

## Troubleshooting

### "No OpenAI credentials found"
Run the OpenAI setup in Step 2 above, then restart the backend workflow.

### Port already in use
The `artifacts/tawbah-web: web` workflow conflicts with `Start application` (both use port 5000). Only one needs to run — use `Start application`.

### EAS build fails with git error
The build script handles this automatically with `EAS_SKIP_AUTO_FINGERPRINT=1`. If it still fails, make sure `EXPO_TOKEN` is set in Replit Secrets.

### expo-router bundling crash (`require.context` error)
Run: `cd artifacts/tawbah-mobile && node scripts/patch-expo-router.js`  
The script patches `_ctx.js`, `_ctx.android.js`, `_ctx.ios.js`, and `_ctx.web.js`.

### Dependencies out of date
```bash
pnpm install --no-frozen-lockfile
```
