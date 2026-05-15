# APP_MEMORY.md — دليل التوبة النصوح
> مرجع سريع وشامل ودقيق للمطورين والوكلاء — يوفر التوكنز ويُسرّع الوصول
> آخر تحديث: مايو 2025

---

## 1. نظرة عامة

تطبيق إسلامي عربي RTL شامل يرشد المستخدمين عبر رحلة توبة نصوح. يعمل على:
- **ويب** `artifacts/tawbah-web` — React 18 + Vite، port 5000
- **API** `artifacts/api-server` — Express 5، port 3001
- **موبايل** `artifacts/tawbah-mobile` — Expo SDK 54

---

## 2. هيكل المونوريبو

```
artifacts-monorepo/
├── artifacts/
│   ├── api-server/        # Express 5 API server
│   ├── tawbah-web/        # React+Vite Web App
│   └── tawbah-mobile/     # Expo React Native
├── lib/
│   ├── db/                # Drizzle ORM + PostgreSQL schema (src/schema/tawbah.ts)
│   ├── api-client-react/  # React Query hooks (src/)
│   ├── api-zod/           # Zod schemas (src/)
│   └── integrations-openai-ai-server/  # OpenAI proxy (src/)
├── tsconfig.json          # Project references: lib/db, lib/api-client-react, lib/api-zod, lib/integrations-openai-ai-server
├── tsconfig.base.json     # composite:true, noImplicitReturns:true, noImplicitAny:true
└── APP_MEMORY.md
```

---

## 3. Stack التقني

| الطبقة | التقنية |
|--------|---------|
| Package Manager | pnpm workspaces |
| Node.js | v24 |
| Language | TypeScript 5.9 (composite projects) |
| API Server | Express 5, port 3001 |
| Database | PostgreSQL + Drizzle ORM |
| Validation | Zod v4 (`zod/v4`), drizzle-zod |
| Web Frontend | React 18, Vite, Tailwind CSS v4, Framer Motion, Wouter routing |
| Mobile | Expo SDK 54, Expo Router (file-based routing) |
| State Management | React Query (@tanstack/react-query) |
| AI | OpenAI via Replit proxy (gpt-4o + tts-1 onyx voice) |
| Auth | JWT (jose) + bcrypt (custom, NO Supabase) |
| Mobile Media | expo-av |
| Mobile Notifications | expo-notifications |
| Capacitor | Android project at `artifacts/tawbah-web/android/` |

---

## 4. Workflows النشطة

| الاسم | الأمر | Port/Mode |
|-------|-------|-----------|
| `Start application` | `pnpm --filter @workspace/tawbah-web run dev` | 5000 (webview) |
| `Start backend` | `pnpm --filter @workspace/api-server run dev` | 3001 (console) |

**Vite Proxy:** `/api/*` → `http://localhost:3001/api/*` (في dev)

**Production:** API server يخدم `artifacts/tawbah-web/dist/public/` كـ static files.

---

## 5. قاعدة البيانات — الجداول الكاملة

**ملف Schema:** `lib/db/src/schema/tawbah.ts`

| الجدول | الأعمدة الرئيسية | الغرض |
|--------|-----------------|-------|
| `users` | id, username, email, phone, **gender**, passwordHash, passwordSalt, createdAt | حسابات المستخدمين |
| `user_progress` | sessionId, sinCategory, sinIds, covenantSigned, covenantDate, currentPhase, day40Progress, firstDayTasksCompleted, streakDays, relapseCount, lastActiveDate, createdAt | تقدم رحلة التوبة |
| `habits` | sessionId, habitKey, habitNameAr, completed, date | العادات اليومية |
| `dhikr_count` | sessionId, date, istighfar, tasbih, sayyid | عدادات الذكر |
| `kaffarah_steps` | sessionId, stepKey, completed, completedAt, createdAt | خطوات الكفارة |
| `journal_entries` | sessionId, content, mood, date, createdAt | اليوميات السرية |
| `zakiy_memory` | sessionId (unique), memoryJson, updatedAt | ذاكرة محادثات زكي |
| `hadi_task_groups` | sessionId, title, createdAt | مجموعات مهام هادي |
| `hadi_task_items` | groupId, sessionId, title, completed, completedAt, orderIdx, createdAt | عناصر مهام هادي |
| `global_stats` | eventType, date, countryCode, createdAt | إحصاءات عالمية |
| `challenges` | slug (unique), duration, pledge, startDate, encouragements, createdAt | التحديات |
| `journey30` | userId, sessionId, dayNumber, completed, completedAt, date, createdAt | رحلة 30 يوم (يوم) |
| `journey30_tasks` | userId, sessionId, dayNumber, taskIndex, completed, completedAt, createdAt | مهام رحلة 30 يوم |
| `dhikr_rooms` | roomType, totalCount, updatedAt | غرف الذكر الجماعي |
| `secret_duas` | fromSessionId, toSessionId, content, isRead, createdAt | الأدعية السرية |
| `community_duas` | sessionId, content, amenCount, createdAt | الأدعية الجماعية |
| `notification_settings` | sessionId (unique), settingsJson, prayerCity, prayerCountry, prayerLat, prayerLng, updatedAt | إعدادات الإشعارات |
| `app_inbox` | sessionId, notifId (unique), type, title, body, icon, color, isRead, createdAt | صندوق التطبيق |
| `push_subscriptions` | sessionId (unique), endpoint, p256dh, auth, updatedAt | Web Push |
| `push_jobs` | sessionId, type, title, body, url, fireAt, sent, createdAt | وظائف الإشعارات |
| `push_fcm_tokens` | sessionId, platform, token, updatedAt (unique: sessionId+platform) | FCM Tokens |

**migration:** `cd lib/db && npx drizzle-kit push`

---

## 6. API Routes الكاملة

**Base:** `http://localhost:3001/api` (dev) | `/api` relative (web)

### Auth (auth.ts)
```
POST /api/auth/register     { username, email, password, phone?, gender? } → { token, user }
POST /api/auth/login        { username, password } → { token, user }
POST /api/auth/logout       → clears cookie
GET  /api/auth/me           → { user } (from JWT cookie)
```

### User Progress (tawbah.ts)
```
GET  /api/user/progress?sessionId=    → progress object (creates if missing)
PUT  /api/user/progress               { sessionId, sinCategory, ... }
POST /api/user/covenant               { sessionId, sinCategory }
GET  /api/user/profile?sessionId=     → extended profile + stats
GET  /api/user/stats?sessionId=       → comprehensive stats
PUT  /api/user/sins                   { sessionId, sinCategory, sinIds }
GET  /api/progress-data?sessionId=    → chart data (40 days grid + weekly bars)
```

### Habits (tawbah.ts)
```
GET  /api/habits?sessionId=&date?=    → habits array for today
POST /api/habits                      { sessionId, habitKey, habitNameAr } → toggle
```

### Dhikr (tawbah.ts)
```
GET  /api/dhikr/count?sessionId=      → { istighfar, tasbih, sayyid }
POST /api/dhikr/increment             { sessionId, type: 'istighfar'|'tasbih'|'sayyid' }
```

### Kaffarah (tawbah.ts)
```
GET  /api/kaffarah?sessionId=         → steps array
POST /api/kaffarah/complete           { sessionId, stepKey }
```

### Journal (tawbah.ts)
```
GET    /api/journal?sessionId=        → entries array
POST   /api/journal                   { sessionId, content, mood, date }
DELETE /api/journal/:id
```

### Danger Times (tawbah.ts)
```
GET /api/danger-times?sessionId=
POST /api/danger-times               { sessionId, times: [...] }
```

### Rajaa / Soul Meter / Signs (tawbah.ts)
```
GET  /api/rajaa?type=quran|hadith|story
GET  /api/soul-meter?sessionId=
POST /api/soul-meter                  { sessionId, level }
POST /api/signs/record               { sessionId, signKey }
POST /api/relapse                    { sessionId }
```

### Community (tawbah.ts)
```
GET  /api/community-duas             → list
POST /api/community-duas             { sessionId, content }
POST /api/ameen/:id                  → increment amenCount
GET  /api/secret-dua?sessionId=
POST /api/secret-dua                 { sessionId, content }
```

### Notifications & Inbox (tawbah.ts)
```
GET  /api/notifications?sessionId=
PUT  /api/notifications              { sessionId, ...settings }
GET  /api/inbox?sessionId=
POST /api/inbox/read/:id
```

### Tawbah Card & Map (tawbah.ts)
```
GET  /api/tawbah-card?sessionId=
GET  /api/tawbah-map?sessionId=
```

### Journey 30 Days (journey.ts)
```
GET  /api/journey30?sessionId=       → { days: [...30], currentDay, completedCount }
POST /api/journey30/complete         { sessionId, dayNumber }
POST /api/journey30/task-toggle      { sessionId, dayNumber, taskIndex }
```

**30 يوم مُعرّفة statically** في `artifacts/api-server/src/routes/journey.ts` (JOURNEY_DAYS array — 30 entries كل منها title + tasks[] + verse).

### Zakiy AI (zakiy/)
```
POST /api/zakiy/message             { sessionId, message, chatHistory? }
POST /api/zakiy/voice               { text } → audio stream (onyx TTS)
POST /api/zakiy/suggestions         { sessionId } → string[]
POST /api/zakiy/emergency           { sessionId }
GET  /api/zakiy/memory?sessionId=
POST /api/zakiy/memory              { sessionId, memory }
```

### Hadi Tasks (hadi-tasks.ts)
```
POST /api/hadi-tasks/extract        { sessionId, sinCategory, context? } → AI tasks
GET  /api/hadi-tasks?sessionId=     → groups with items
POST /api/hadi-tasks/:id/complete   { sessionId }
```

### Dhikr Rooms (dhikr-rooms.ts)
```
GET  /api/dhikr-rooms               → rooms array
POST /api/dhikr-rooms/tap           { roomType, sessionId }
```

### Challenges (tawbah.ts)
```
GET  /api/challenges/:slug
POST /api/challenges                { duration, pledge, startDate }
POST /api/challenges/:slug/encourage
```

### Quran & Audio (quran.ts, audio-proxy.ts)
```
GET /api/quran/surah/:id                              → ayahs (alquran.cloud proxy, 24h cache)
GET /api/audio-proxy/quran/:reciterId/:num.mp3        → audio stream (cdn.islamic.network)
GET /api/audio-proxy/radio                             → radio streams
```

### Push Notifications (push.ts)
```
POST /api/push/subscribe             { sessionId, subscription }
POST /api/push/unsubscribe           { sessionId }
POST /api/push/schedule              { sessionId, title, body, url, fireAt }
POST /api/push/fcm-token             { sessionId, token, platform }
DELETE /api/push/jobs/:id
```

### TTS (tts.ts)
```
POST /api/tts                        { text, voice?: 'onyx'|'echo' } → audio stream
```

### Hero Content (hero.ts)
```
GET /api/hero-content               → dynamic Islamic cards (AI-generated)
```

### Admin (admin.ts) — prefix: /api/admin/
```
GET /api/admin/overview             → لوحة التحكم الشاملة
GET /api/admin/users                ?limit&offset&search&covenant&phase
GET /api/admin/users/export         → CSV download
GET /api/admin/users/:sessionId
PUT /api/admin/users/:sessionId
GET /api/admin/habits               → habit stats by key
PUT /api/admin/habits/:id
GET /api/admin/dhikr
GET /api/admin/journal
GET /api/admin/kaffarah
GET /api/admin/zakiy
GET /api/admin/zakiy/memory/:sessionId
GET /api/admin/hadi-tasks
GET /api/admin/journey30
GET /api/admin/duas
GET /api/admin/challenges
GET /api/admin/rooms
POST /api/admin/inbox               → send inbox message to user
```

### Health
```
GET /api/healthz                    → { status: 'ok', db: 'ok'|'error' }
```

---

## 7. تطبيق الويب — Web App

### الملفات الجذرية
```
artifacts/tawbah-web/
├── src/
│   ├── App.tsx              # Router + Providers stack
│   ├── main.tsx             # React entry + RTL + theme init
│   ├── lib/
│   │   ├── session.ts       # getSessionId() → 'user_ID' or 'guest_[uuid]'
│   │   ├── api-base.ts      # apiUrl('/api/X') → relative URL
│   │   ├── api-config.ts    # Capacitor native URLs (window.location.origin)
│   │   └── auth.ts          # JWT helpers (client side)
│   ├── context/
│   │   ├── AuthContext.tsx      # user state, login/register/logout
│   │   ├── SettingsContext.tsx  # theme, language, accent color
│   │   ├── NotificationsContext.tsx
│   │   ├── AppNotificationsContext.tsx
│   │   └── ZakiyModeContext.tsx
│   ├── components/
│   │   ├── header/          # StandardHeader, HeroHeader, ContextHeader, PageHeader (shim)
│   │   ├── layout.tsx       # App shell with navigation
│   │   ├── OnboardingModal.tsx
│   │   ├── AdhkarModal.tsx
│   │   ├── DuaPeakModal.tsx
│   │   └── ...
│   ├── pages/               # جميع الصفحات
│   └── index.css            # Tailwind v4 + CSS variables للألوان الإسلامية
├── vite.config.ts           # port 5000, proxy /api → 3001, outDir: dist/public
├── capacitor.config.ts      # appId: com.aiservx.tawbah, webDir: dist/public
└── android/                 # Capacitor Android project (gradlew assembleDebug)
```

### Providers Stack (بالترتيب)
```
QueryClientProvider
  SettingsProvider
    AuthProvider
      NotificationsProvider
        AppNotificationsProvider
          ZakiyModeProvider
```

### Session Management
```typescript
// src/lib/session.ts
getSessionId():
  - مستخدم مسجّل → "user_{id}"
  - زائر → "guest_{timestamp36}{random7}" (محفوظ في localStorage: 'tawbah_guest_session_id')
  
setSessionUserId(id)  // يُستدعى من AuthContext عند تسجيل الدخول
clearGuestSessionId() // عند تسجيل الخروج
```

### Auth Flow
```
1. App mount → AuthContext checks localStorage 'tawbah_user' → immediate state
2. Background fetch GET /api/auth/me → sync with server JWT cookie
3. login() → POST /api/auth/login → sets 'tawbah_user' in localStorage
4. setSessionUserId(user.id) → future API calls use "user_{id}" as sessionId
```

### Header Components (src/components/header/)
| Component | الاستخدام | الخصائص |
|-----------|----------|---------|
| `StandardHeader` | كل الصفحات الداخلية | sticky, scroll-shrink >12px, title/subtitle/icon/showBack |
| `HeroHeader` | صفحات hero (Quran, Home) | transparent overlay, compact >60px |
| `ContextHeader` | صفحة Zakiy | يتغير اللون حسب zakiyState (emergency/repentance/growth) |
| `PageHeader` | shim للتوافق | يُفوّض إلى StandardHeader |

### جميع روابط الويب

**الرئيسية والمصادقة**
| Path | Component |
|------|-----------|
| `/` | Home — BentoGrid، SoulMeter، شجرة التوبة، QuickAccessBar |
| `/login` | LoginPage |

**رحلة التوبة**
| Path | Component |
|------|-----------|
| `/covenant` | Covenant — عهد التوبة |
| `/day-one` | DayOne — 4 مهام فورية |
| `/habits` = `/plan` | HabitsPage — العادات اليومية |
| `/journey` | Journey30 — رحلة 30 يوم |
| `/progress` | ProgressChart — خريطة التقدم |
| `/signs` | Signs — علامات قبول التوبة |
| `/relapse` | Relapse — التعامل مع الانتكاسات |
| `/kaffarah` | Kaffarah — الكفارات الشرعية |

**الذكر والعبادة**
| Path | Component |
|------|-----------|
| `/dhikr` | Dhikr — عداد الذكر (استغفار/تسبيح/سيد الاستغفار) |
| `/adhkar` | Adhkar — أذكار الصباح والمساء |
| `/prayer-times` | PrayerTimes — أوقات الصلاة + القبلة |
| `/dua-timing` | DuaTiming — حاسبة أوقات الدعاء |
| `/danger-times` | DangerTimes — أوقات الخطر |
| `/munajat` | Munajat — وضع المناجاة الليلي |

**القرآن الكريم**
| Path | Component |
|------|-----------|
| `/quran` | QuranPage — مركز القرآن + متصفح 114 سورة |
| `/quran/read` | QuranReadPage — قراءة مع تشغيل صوتي |
| `/quran/listen` | QuranListenPage — استماع |
| `/quran/memorize` | QuranMemorizePage — حفظ |
| `/quran/tafsir` | QuranTafsirPage — تفسير |
| `/quran/khatma` | QuranKhatmaPage — خطة ختمة |
| `/quran/challenges` | QuranChallengesPage — تحديات |
| `/quran/map` | QuranMapPage — خريطة القرآن |
| `/quran/ai` | QuranAiPage — القرآن بالذكاء الاصطناعي |
| `/quran/cards` | QuranCardsPage — بطاقات |
| `/quran/miracles` | QuranMiraclesPage — إعجاز |
| `/quran/khatmat` | QuranKhatmatPage — الختمات |

**الذكاء الاصطناعي والمكتبة**
| Path | Component |
|------|-----------|
| `/zakiy` | Zakiy — بوت زكي (text + voice, TTS, history) |
| `/rajaa` | Rajaa — مكتبة الرجاء المختصرة |
| `/raja-libr` | RajaaLibrary — مكتبة الرجاء الكاملة |
| `/hadi-tasks` | HadiTasks — مهام ذكي |

**المجتمع**
| Path | Component |
|------|-----------|
| `/dhikr-rooms` | DhikrRooms — غرف الذكر الجماعي |
| `/ameen` | CommunityDuas — الأدعية الجماعية |
| `/secret-dua` | SecretDua — الدعاء السري |
| `/challenge/create` | ChallengeCreate |
| `/challenge/:slug` | ChallengeView |

**الحساب والإعدادات**
| Path | Component |
|------|-----------|
| `/account` | Account — الحساب + الإحصاءات |
| `/notifications` | NotificationsPage |
| `/inbox` | InboxPage |

**أخرى**
| Path | Component |
|------|-----------|
| `/sins` | SinsList — قائمة المعاصي |
| `/eid` | EidPage — صفحة العيد |
| `/card` | TawbahCard — بطاقة التوبة |
| `/map` | TawbahMap — خريطة التوبة |
| `/garden` | Garden — شجرة التوبة |
| `/islamic-programs` | IslamicPrograms |
| `/islamic-programs/podcast/:id` | PodcastCategory |
| `/islamic-programs/:id` | ProgramDetail |

**Admin (AdminApp.tsx)**
```
/admin             → Login
/admin/overview    → لوحة التحكم
/admin/users       → إدارة المستخدمين
/admin/habits      → إحصاءات العادات
/admin/dhikr       → إحصاءات الذكر
/admin/journal     → اليوميات
/admin/kaffarah    → الكفارات
/admin/zakiy       → إحصاءات زكي
/admin/hadi-tasks  → مهام هادي
/admin/journey30   → رحلة 30 يوم
/admin/duas        → الأدعية
/admin/challenges  → التحديات
```

---

## 8. تطبيق الموبايل — Mobile App

### الإعداد
```
artifacts/tawbah-mobile/
├── app/              # Expo Router — file-based routing
│   ├── _layout.tsx   # Root: QueryClient + Providers + fonts + RTL + SplashScreen
│   └── ...screens
├── src/
│   ├── engines/      # منطق أعمال الميزات
│   ├── hooks/        # React hooks
│   ├── lib/          # utilities
│   ├── components/   # مكونات مشتركة
│   └── providers/    # Context providers
├── app.json          # Expo config: com.aiservx.tawbah
└── eas.json          # EAS build profiles
```

### Providers Stack
```
QueryClientProvider → SettingsProvider → AuthProvider → NotificationsProvider → ZakiyModeProvider
```

### جميع الشاشات

**الرئيسية والحساب**
| Screen | الوصف |
|--------|-------|
| `app/index.tsx` | الرئيسية — BentoGrid + IslamicHero |
| `app/login/index.tsx` | تسجيل الدخول |
| `app/register/index.tsx` | تسجيل جديد |
| `app/account/index.tsx` | الحساب + الثيم + اللغة |
| `app/more/index.tsx` | مركز التنقل |

**رحلة التوبة**
| Screen | الوصف |
|--------|-------|
| `app/covenant/index.tsx` | عهد التوبة |
| `app/day-one/index.tsx` | مهام اليوم الأول |
| `app/habits/index.tsx` | العادات اليومية |
| `app/journey/index.tsx` | رحلة 30 يوم |
| `app/progress/index.tsx` | مخطط التقدم |
| `app/signs/index.tsx` | علامات القبول |
| `app/relapse/index.tsx` | دعم الانتكاسة |
| `app/kaffarah/index.tsx` | دليل الكفارة |

**العبادة والذكر**
| Screen | الوصف |
|--------|-------|
| `app/dhikr/index.tsx` | اختيار نوع الذكر |
| `app/dhikr/counter/index.tsx` | عداد الذكر |
| `app/adhkar/index.tsx` | أذكار |
| `app/prayer-times.tsx` | أوقات الصلاة |
| `app/dua-timing/index.tsx` | حاسبة أوقات الدعاء |
| `app/danger-times/index.tsx` | أوقات الخطر |
| `app/munajat/index.tsx` | وضع المناجاة |

**القرآن**
| Screen | الوصف |
|--------|-------|
| `app/quran/index.tsx` | قائمة 114 سورة |
| `app/quran/read.tsx` | قارئ القرآن |
| `app/quran/listen.tsx` | استماع |
| `app/quran/memorize.tsx` | حفظ |
| `app/quran/tafsir.tsx` | تفسير |
| `app/quran/khatma.tsx` | خطة ختمة |
| `app/quran/challenges.tsx` | تحديات |
| `app/quran/map.tsx` | خريطة القرآن |
| `app/quran/ai/index.tsx` | AI + قرآن |
| `app/quran/cards/index.tsx` | بطاقات |
| `app/quran/miracles/index.tsx` | إعجاز |
| `app/quran/khatmat.tsx` | الختمات |

**AI والمكتبة**
| Screen | الوصف |
|--------|-------|
| `app/zakiy/index.tsx` | محادثة زكي (text + voice TTS) |
| `app/rajaa/index.tsx` | مكتبة الرجاء |
| `app/hadi-tasks/index.tsx` | مهام هادي |

**المجتمع**
| Screen | الوصف |
|--------|-------|
| `app/community/ameen.tsx` | أدعية جماعية |
| `app/community/rooms.tsx` | غرف الذكر |
| `app/secret-dua.tsx` | دعاء سري |
| `app/tawbah-card/index.tsx` | بطاقة التوبة |

**أخرى**
| Screen | الوصف |
|--------|-------|
| `app/sos/index.tsx` | زر الطوارئ |
| `app/journal/index.tsx` | اليوميات |
| `app/garden/index.tsx` | شجرة التوبة |
| `app/sins/index.tsx` | قائمة المعاصي |
| `app/programs/index.tsx` | البرامج الإسلامية |
| `app/inbox/index.tsx` | صندوق البريد |
| `app/notifications/index.tsx` | الإشعارات |

### Engines (src/engines/)

| Engine | الغرض |
|--------|-------|
| `account-engine/` | تفضيلات المستخدم في AsyncStorage |
| `dua-engine/` | حاسبة أوقات الدعاء (ثلث الليل، بعد الأذان...) |
| `journey/useJourney.ts` | رحلة 30 يوم + React Query + API calls + fallback |
| `media/useMediaPlayer.ts` | expo-av: راديو إسلامي (6 محطات) + بودكاست + تحميل |
| `notification-engine/` | إشعارات محلية وPush |
| `sin-engine/` | بيانات المعاصي ونقاط التوبة |
| `theme-system/` | 8+ ثيمات إسلامية (Emerald, Gold, Night, Ocean...) |
| `zakiy/useZakiy.ts` | AI chat + voice recording + TTS + ذاكرة |

### Hooks (src/hooks/)

| Hook | الغرض |
|------|-------|
| `useAdhkar.ts` | بيانات الأذكار + عداد |
| `useColors.ts` | ربط ThemeSystem بـ React components |
| `usePrayerTimes.ts` | expo-location + AlAdhan API |
| `useQuranAudio.ts` | بث + تحميل صوت القرآن |
| `useQuranData.ts` | قائمة السور + الآيات من api.alquran.cloud |

### lib/ (src/lib/)

| ملف | الغرض |
|-----|-------|
| `api.ts` | API base URL (AsyncStorage + default: https://tawbah.replit.app/api) |
| `session.ts` | UUID فريد في AsyncStorage `tawbah_session_id` |
| `dua-power.ts` | حسابات أوقات الدعاء المستجاب |
| `sins-data.ts` | بيانات ثابتة للمعاصي وتصنيفاتها |

---

## 9. المصادقة والجلسات

### الويب
```typescript
// JWT cookie: 'tawbah_session' (httpOnly, SameSite=Lax, 30d)
// ملف: artifacts/api-server/src/lib/auth.ts
// دوال: hashPassword(), verifyPassword(), signJwt(), requireAuth, optionalAuth, setAuthCookie()

// SessionId:
// - مستخدم مسجل: "user_{id}"
// - زائر: "guest_{timestamp36}{random7}" ← محفوظ localStorage 'tawbah_guest_session_id'
```

### الموبايل
```typescript
// Session ID: UUID محفوظ في AsyncStorage 'tawbah_session_id'
// src/lib/session.ts + src/providers/AuthProvider.tsx
```

---

## 10. OpenAI Integration

```javascript
// إعداد مطلوب مرة واحدة في code_execution:
await setupReplitAIIntegrations({
  providerSlug: "openai",
  providerUrlEnvVarName: "AI_INTEGRATIONS_OPENAI_BASE_URL",
  providerApiKeyEnvVarName: "AI_INTEGRATIONS_OPENAI_API_KEY"
});
```

```typescript
// Client: lib/integrations-openai-ai-server/src/client.ts
// يقرأ: AI_INTEGRATIONS_OPENAI_BASE_URL + AI_INTEGRATIONS_OPENAI_API_KEY

// نموذج الدردشة: gpt-4o
// نموذج TTS: tts-1, صوت onyx (أو echo)
// Image: gpt-image-1
```

---

## 11. بناء المشروع

### أوامر أساسية
```bash
pnpm install                              # تثبيت dependencies
pnpm run build                            # typecheck + build الكل
npx tsc --build tsconfig.json             # بناء declaration files للحزم المشتركة

# API Server (dev)
pnpm --filter @workspace/api-server run dev

# Web App (dev)
pnpm --filter @workspace/tawbah-web run dev

# Typecheck
pnpm --filter @workspace/api-server typecheck
pnpm --filter @workspace/tawbah-web typecheck

# DB Migration
cd lib/db && npx drizzle-kit push
```

### APK — تطبيق الويب (Capacitor Android)
```bash
# يحتاج Java 17+ و Android SDK
pnpm --filter @workspace/tawbah-web build    # بناء الويب → dist/public
cd artifacts/tawbah-web
npx cap copy android                          # نسخ للأندرويد
cd android && ./gradlew assembleDebug        # بناء APK
# APK: android/app/build/outputs/apk/debug/app-debug.apk
```

### APK — تطبيق الموبايل (EAS Cloud)
```bash
# EAS Dev Token: _b9Mbt2aSKcLloFX8yneFQvA-j-BxURvcnu9INx6
cd artifacts/tawbah-mobile
npx eas-cli build --platform android --profile preview
# أو
EXPO_TOKEN=_b9Mbt2aSKcLloFX8yneFQvA-j-BxURvcnu9INx6 npx eas-cli build --platform android --profile preview
```

---

## 12. متغيرات البيئة

| المتغير | الوصف | المصدر |
|---------|-------|-------|
| `DATABASE_URL` | PostgreSQL URL | Replit Database (مُعيّن تلقائياً) |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` | Replit OpenAI proxy URL | setupReplitAIIntegrations() |
| `AI_INTEGRATIONS_OPENAI_API_KEY` | Replit OpenAI proxy key | setupReplitAIIntegrations() |
| `JWT_SECRET` | سر JWT (اختياري — له fallback) | Secrets |
| `VAPID_PUBLIC_KEY` | Web Push public key | Secrets |
| `VAPID_PRIVATE_KEY` | Web Push private key | Secrets |
| `PORT` | API port (default: 3001) | Environment |

---

## 13. الإصلاحات المُطبّقة (Changelog)

| المشكلة | الحل | الملف |
|---------|------|-------|
| `session.ts` يعيد "guest" لكل الزوار | توليد UUID فريد محفوظ في localStorage | `tawbah-web/src/lib/session.ts` |
| `api-config.ts` URL قديم hardcoded | `window.location.origin` ديناميكي | `tawbah-web/src/lib/api-config.ts` |
| مجلد `src - Copy` بقايا | حُذف | (محذوف) |
| `task-engine.ts` `item.text` خطأ | `item.title` (column الصحيح) | `api-server/src/core/task-engine.ts` |
| `usersTable` لا يحتوي gender | أُضيف + migration | `lib/db/src/schema/tawbah.ts` |
| `pRetry.AbortError` غير موجود | `import { AbortError } from 'p-retry'` | `lib/integrations-openai-ai-server/src/batch/utils.ts` |
| `response.data[0]` قد يكون undefined | `response.data?.[0]` | `lib/integrations-openai-ai-server/src/image/client.ts` |
| TS7030 (not all paths return) | `return void res.X()` في كل route handlers | `tawbah.ts`, `admin.ts`, `auth.ts`, `dhikr-rooms.ts`, `hadi-tasks.ts`, `push.ts` |
| TS6305 (missing .d.ts) | `npx tsc --build tsconfig.json` + إضافة `integrations-openai-ai-server` للـ references | `tsconfig.json` |

---

## 14. خريطة التعديل السريع

### إضافة صفحة ويب جديدة
```
1. artifacts/tawbah-web/src/pages/[page].tsx  ← أنشئ الصفحة
2. artifacts/tawbah-web/src/App.tsx           ← أضف <Route path="/..." component={...} />
3. artifacts/tawbah-web/src/components/layout.tsx ← أضف للقائمة (اختياري)
```

### إضافة API endpoint
```
1. artifacts/api-server/src/routes/[route].ts  ← أضف handler
2. artifacts/api-server/src/routes/index.ts    ← سجّل router.use(...)
```

### تعديل schema DB
```
1. lib/db/src/schema/tawbah.ts    ← أضف جدول/عمود
2. cd lib/db && npx drizzle-kit push
3. npx tsc --build tsconfig.json  ← أعد بناء declarations
```

### إضافة شاشة موبايل
```
1. artifacts/tawbah-mobile/app/[screen]/index.tsx  ← أنشئ الشاشة
2. Expo Router يكتشفها تلقائياً
```

### تعديل الثيم/الألوان
```
artifacts/tawbah-web/src/index.css            ← CSS variables
artifacts/tawbah-web/tailwind.config.ts       ← Tailwind config
artifacts/tawbah-mobile/src/engines/theme-system/  ← Mobile themes
```

---

## 15. المشاكل المعروفة الحالية

| المشكلة | الخطورة | الحل المقترح |
|---------|---------|-------------|
| JWT لا يُجدَّد تلقائياً (30 يوم ثابتة) | متوسطة | إضافة refresh token |
| غرف الذكر تستخدم polling لا WebSocket | منخفضة | ترقية لـ WebSocket |
| Admin endpoints بدون rate limiting | متوسطة | إضافة express-rate-limit |
| Offline: Zakiy/Journey/Community تفشل بدون إنترنت | منخفضة | Service Worker cache |
| APK build يحتاج Java 17+ (غير متاح على Replit) | - | بناء خارجياً أو EAS |
