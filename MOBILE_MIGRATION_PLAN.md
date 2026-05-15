# Mobile Migration Plan: Tawbah Web to Expo Mobile

## Executive Summary
- **Source**: `artifacts/tawbah-web` (React + Vite + Capacitor)
- **Target**: `artifacts/tawbah-mobile` (Expo SDK 54 + Expo Router)
- **Total Routes**: 45+ pages
- **Complexity**: HIGH - Full feature parity required

---

## Phase 1: Foundation (Setup Complete)
| Status | Item |
|--------|------|
| [Verified] | Expo SDK 54 project initialized |
| [Verified] | Expo Router configured |
| [Verified] | TanStack Query + Workspace API client linked |
| [Verified] | expo-notifications + expo-device ready |
| [Verified] | NativeWind v4 integrated |
| [Verified] | react-native-reanimated ready |

---

## Phase 2: Core Pages Migration

### 2.1 Home Page (`/`)
| Status | Item |
|--------|------|
| [Verified Mirror] | IslamicHero component with auto-rotating content |
| [Verified Mirror] | QuickAccessBar component |
| [Verified Mirror] | MoodSelector component |
| [Verified Mirror] | CommunityTicker component |
| [Verified Mirror] | SortableUnifiedItem (grid + list cards) |
| [Verified Mirror] | SectionHeader component |
| [Verified Mirror] | ZakiyModeDashboard (AI chat) |
| [Verified Mirror] | Edit mode toggle with AsyncStorage persistence |
| [Verified Mirror] | 4 Sections: Primary, Daily, Growth, Community |

**Data Layer**: `@/hooks/use-app-data`, `@/context/ZakiyModeContext`
**UI Components**: 15+ sub-components in `home/` folder
**Native Needs**: None (animations via Reanimated)

---

### 2.2 Quran Section (`/quran/*`)
| Status | Item |
|--------|------|
| [Verified Mirror] | `/quran` - Main Quran hub with search + 8 tool pills (incl. miracles/cards/ai) |
| [Verified Mirror] | `/quran/read` - Full reader with fast pagination + audio |
| [Verified] | `/quran/listen` - Audio playback (expo-av) |
| [Verified] | `/quran/memorize` - Memorization tools |
| [Verified] | `/quran/tafsir` - Tafsir viewer |
| [Verified] | `/quran/khatma` - Khatma tracking |
| [Verified] | `/quran/challenges` - Community challenges |
| [Verified] | `/quran/map` - Mosque locations (react-native-maps) |
| [Verified] | `/quran/ai` - AI Quran assistant (Arabic GPT Q&A, starter prompts) |
| [Verified] | `/quran/cards` - Flashcard flip system (known/unknown tracking) |
| [Verified] | `/quran/miracles` - Scientific miracles (8 cards, category filter) |
| [Verified] | `/quran/khatmat` - Group khatmas |

**Data Layer**: `useSurahList`, `useAyahs`, `useSearchSurahs` from alquran.cloud API
**Native Modules**: `expo-av` (audio playback), `expo-file-system` (offline download)
**APIs**: alquran.cloud, cdn.islamic.network

---

### 2.3 Prayer Times (`/prayer-times`)
| Status | Item |
|--------|------|
| [Verified Mirror] | Prayer times display with RTL |
| [Verified Mirror] | Location detection (expo-location) |
| [Verified Mirror] | Notification scheduling (expo-notifications) |
| [Verified Mirror] | Next prayer highlight |

**Data Layer**: `usePrayerTimes` hook
**Native Modules**: `expo-location`, `expo-notifications`
**API**: aladhan.com

---

### 2.4 Dhikr Section (`/dhikr`, `/adhkar`)
| Status | Item |
|--------|------|
| [Verified] | Dhikr hub with haptic feedback counter |
| [Verified] | Dhikr counter sub-page (premium Bento-Glass design) |
| [Verified] | Adhkar categories (morning/evening/sleep/prayer) + filtering |
| [Verified] | Adhkar card → navigates to dhikr/counter |
| [Verified] | PageHeader used in all dhikr/adhkar screens |
| [Pending] | Custom dhikr creation |

**Data Layer**: Local adhkar data + `useDhikrCounts` hook
**Native Modules**: `expo-haptics`

---

### 2.5 Zakiy AI (`/zakiy`)
| Status | Item |
|--------|------|
| [Verified Mirror] | Chat interface with full history |
| [Verified Mirror] | Voice input (expo-av) |
| [Verified Mirror] | Emergency overlay |
| [Verified Mirror] | Context persistence |
| [Verified Mirror] | TTS responses (OpenAI onyx voice) |
| [Verified Mirror] | Risk alerts + anniversary milestones |

**Data Layer**: `useZakiy` engine → `/api/zakiy/*` routes
**Native Modules**: `expo-av` (voice recording + TTS playback)

---

## Phase 3: Feature Pages

### 3.1 Journey & Programs
| Status | Route | Item |
|--------|-------|------|
| [Verified] | `/journey` | 30-day journey tracker — progress card, day cards (expand/collapse), completeDay, streak |
| [Verified Mirror] | `/programs` | Islamic programs browser: hero banner, live radio, podcast series |
| [Pending] | `/islamic-programs/:id` | Program detail page |
| [Verified] | `/hadi-tasks` | Daily tasks — checklist, AsyncStorage, add/delete/toggle, progress bar |

### 3.2 Community
| Status | Route | Item |
|--------|-------|------|
| [Verified] | `/community/ameen` | Community duas — live room |
| [Verified] | `/community/rooms` | Live dhikr rooms |
| [Pending] | `/challenge/create` | Create challenge |
| [Pending] | `/challenge/:slug` | View challenge |

### 3.3 Personal Growth
| Status | Route | Item |
|--------|-------|------|
| [Verified] | `/journal` | Spiritual journal — AsyncStorage, mood tracking, write/delete, PageHeader |
| [Verified] | `/progress` | Progress charts — 30-day grid, dhikr bar chart, streak stats, habits summary |
| [Verified] | `/garden` | Gamified tawbah tree |
| [Verified] | `/habits` | Habit tracking — daily habits, toggle, streaks |

### 3.4 Support Features
| Status | Route | Item |
|--------|-------|------|
| [Verified] | `/sos` | Emergency SOS — 3-phase: Alert → Breathing → Duas |
| [Verified] | `/relapse` | Relapse support — guidance and encouragement |
| [Verified] | `/signs` | Warning signs — 5 spiritual signs of accepted repentance |
| [Verified] | `/covenant` | User covenant — sin selection + repentance pledge |

### 3.5 Utility Pages
| Status | Route | Item |
|--------|-------|------|
| [Verified] | `/more` | More hub — navigation to all sections |
| [Verified] | `/notifications` | Notification settings — AsyncStorage (was localStorage ✅ fixed) |
| [Verified] | `/account` | Account & settings — AsyncStorage (was localStorage ✅ fixed) |
| [Verified] | `/tawbah-card` | Repentance card generator — AsyncStorage (was localStorage ✅ fixed) |
| [Verified] | `/adhkar` | Adhkar browser with PageHeader (✅ fixed) |

---

## Phase 4: Context Providers Migration

| Status | Provider | Purpose |
|--------|----------|---------|
| [Verified] | SettingsProvider | Theme, language, accent color, AsyncStorage persistence |
| [In Progress] | NotificationsProvider | Prayer & dhikr notifications |
| [Pending] | AuthProvider | Supabase authentication |
| [Verified] | ZakiyModeProvider | AI mode state via useZakiy engine |
| [Pending] | AppNotificationsProvider | In-app notifications |

---

## Phase 5: Native Integration

| Status | Module | Purpose |
|--------|--------|---------|
| [Verified] | expo-notifications | Notification settings UI wired |
| [Verified] | expo-device | Device info |
| [Verified] | expo-location | GPS for prayer times |
| [Verified] | expo-av | Quran audio + Zakiy TTS + voice input |
| [Verified] | expo-haptics | Dhikr counter haptic feedback |
| [Pending] | expo-file-system | Offline Quran data |
| [Pending] | react-native-maps | Mosque locations |

---

## Engines Created (Mobile)

| Engine | Location | Purpose |
|--------|----------|---------|
| journey | `src/engines/journey/` | 30-day journey: useJourney hook, API calls, fallback data |
| media | `src/engines/media/` | Islamic media player: radio, podcasts, programs |
| zakiy | `src/engines/zakiy/` | AI spiritual chat, voice, TTS, risk alerts |
| sin-engine | `src/engines/sin-engine/` | Sin categories + severity data |
| notification-engine | `src/engines/notification-engine/` | expo-notifications wrapper |
| account-engine | `src/engines/account-engine/` | User settings + 6 accent colors |
| dua-engine | `src/engines/dua-engine/` | Dua context + munajat + tawbah cards data |
| theme-system | `src/engines/theme-system/` | 10 Islamic themes (deep-night, morning-peace, ramadan-night, etc.) |

---

## Shared Components Created

| Component | Path | Used By |
|-----------|------|---------|
| PageHeader | `src/components/shared/PageHeader.tsx` | All inner pages (dhikr, adhkar, journey, journal, sos, covenant, more, notifications, account, tawbah-card) |

---

## Data Layer: localStorage → AsyncStorage Migration

| Status | File | Fix |
|--------|------|-----|
| ✅ Fixed | `app/notifications/index.tsx` | loadSettings/saveSettings → AsyncStorage via useEffect |
| ✅ Fixed | `app/account/index.tsx` | getDayNumber/getQuranDays/getHabitsDone/name → AsyncStorage via useEffect |
| ✅ Fixed | `app/tawbah-card/index.tsx` | getDayNumber/getName/saveName → AsyncStorage via useEffect |

---

## Technical Stack Summary

### Dependencies (Already Linked)
```json
{
  "@tanstack/react-query": "catalog:",
  "@workspace/api-client-react": "workspace:*",
  "expo": "~54.0.33",
  "expo-router": "~5.0.5",
  "expo-notifications": "~0.31.1",
  "expo-device": "~8.0.3",
  "expo-location": "catalog:",
  "expo-av": "catalog:",
  "expo-haptics": "catalog:",
  "expo-file-system": "catalog:",
  "nativewind": "^4.1.23",
  "react-native-reanimated": "~3.17.4",
  "react-native-safe-area-context": "5.4.0",
  "react-native-screens": "~4.11.1",
  "react-native-maps": "catalog:",
  "zod": "catalog:"
}
```

### UI Mapping (Web to Native)
| Web Component | Native Equivalent |
|---------------|-------------------|
| `<div>` | `<View>` |
| `<span>` | `<Text>` |
| `<button>` | `<Pressable>` |
| `<img>` | `<Image>` |
| `<input>` | `<TextInput>` |
| `framer-motion` | `react-native-reanimated` |
| TailwindCSS | NativeWind |
| `localStorage` | `AsyncStorage` |

---

## APK Build Configuration

### Setup (Completed)
- `eas.json` created with `preview` (APK) + `production` (AAB) profiles
- `google-services.json` placed in `artifacts/tawbah-mobile/`
- `notification-icon.png` created in `assets/`
- Android package: `com.aiservx.tawbah`
- Bundle ID (iOS): `com.aiservx.tawbah`

### Build Command (EAS Cloud)
```bash
cd artifacts/tawbah-mobile
EXPO_TOKEN=<your-token> npx eas build --platform android --profile preview --non-interactive
```

### Signing
- Development/preview: EAS managed signing (auto)
- Production: Google Play App Signing

---

## Session Progress Summary (Latest)

### ✅ T001 — PageHeader + Dhikr Redesign
- Created `src/components/shared/PageHeader.tsx`
- Redesigned `app/dhikr/index.tsx` (Bento-Glass)
- Redesigned `app/dhikr/counter/index.tsx` (premium haptic counter)

### ✅ T002 — /more, /sos, /covenant
- `app/more/index.tsx` — navigation hub for all sections
- `app/sos/index.tsx` — 3-phase emergency (Alert → Breathing → Duas)
- `app/covenant/index.tsx` — sin selection + repentance pledge

### ✅ T003 — /adhkar, /journey, /journal
- `app/adhkar/index.tsx` — categories filter, adhkar cards, PageHeader ✅
- `app/journey/index.tsx` — 30-day tracker, day cards, progress bar, useJourney engine
- `app/journal/index.tsx` — mood tracking, AsyncStorage, write/delete

### ✅ T004 — MOBILE_MIGRATION_PLAN.md Updated
- Marked all completed items
- Added APK build configuration section
- Added Engines + Shared Components tables
- Added localStorage → AsyncStorage migration table

---

### ✅ Session 2 — Quran Sub-pages + Utility Pages

**New pages built:**
| Page | File | Details |
|------|------|---------|
| `/quran/miracles` | `app/quran/miracles/index.tsx` | 8 scientific miracles, expandable cards, category filter (cosmic/science/biology/ocean/math), Bento-Glass design |
| `/quran/cards` | `app/quran/cards/index.tsx` | Flip-card memorization: 8 seed cards, known/unknown tracking, progress bar, completion screen |
| `/quran/ai` | `app/quran/ai/index.tsx` | Arabic AI Quran assistant: 6 starter prompts, real API via `/api/zakiy/chat`, typing animation, full chat history |
| `/hadi-tasks` | `app/hadi-tasks/index.tsx` | Daily task checklist: 6 default tasks, add/delete/toggle, AsyncStorage, progress bar, category emoji |
| `/progress` | `app/progress/index.tsx` | 30-day grid, dhikr bar chart, streak stats, habits summary, motivation banner |

**Navigation links added:**
- `app/quran/index.tsx` → 3 new pills: معجزات / بطاقات / ذكاء
- `app/more/index.tsx` → "مهام اليوم" entry in رحلتي الروحية section (Zap icon, badge: جديد)

**TypeScript check**: 0 errors across entire mobile workspace.

---

## Next Recommended Steps

1. **EAS APK Build** — Run via project_tasks with `EXPO_TOKEN=_b9Mbt2aSKcLloFX8yneFQvA-j-BxURvcnu9INx6`
2. **`/islamic-programs/:id`** — Program detail/player screen
3. **`/challenge/create` + `/challenge/:slug`** — Community challenge pages
4. **Quran offline download** — `expo-file-system` cache for surahs
5. **Push notifications** — Wire NotificationsProvider to expo-notifications for prayer alerts
