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
| [Verified Mirror] | Edit mode toggle with localStorage persistence |
| [Verified Mirror] | 4 Sections: Primary, Daily, Growth, Community |

**Data Layer**: `@/hooks/use-app-data`, `@/context/ZakiyModeContext`
**UI Components**: 15+ sub-components in `home/` folder
**Native Needs**: None (animations via Reanimated)

---

### 2.2 Quran Section (`/quran/*`)
| Status | Item |
|--------|------|
| [Verified Mirror] | `/quran` - Main Quran hub with search |
| [Verified Mirror] | `/quran/read` - read_file with fast pagination + audio |
| [In Progress] | `/quran/listen` - Audio playback (expo-av) |
| [Pending] | `/quran/memorize` - Memorization tools |
| [Pending] | `/quran/tafsir` - Tafsir viewer |
| [Pending] | `/quran/khatma` - Khatma tracking |
| [Pending] | `/quran/challenges` - Community challenges |
| [Pending] | `/quran/map` - Mosque locations (react-native-maps) |
| [Pending] | `/quran/ai` - AI Quran assistant |
| [Pending] | `/quran/cards` - Flashcard system |
| [Pending] | `/quran/miracles` - Scientific miracles |
| [Pending] | `/quran/khatmat` - Group khatmas |

**Data Layer**: `useSurahList`, `useAyahs`, `useSearchSurahs` from alquran.cloud API
**Native Modules**: `expo-av` (audio playback), `expo-file-system` (offline download)
**APIs**: alquran.cloud,cdn.islamic.network

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
| [In Progress] | Dhikr counter with haptic feedback |
| [In Progress] | Adhkar categories and filtering |
| [In Progress] | Morning/Evening adhkar |
| [Pending] | Custom dhikr creation |

**Data Layer**: `useAdhkar`, `useDhikrCounts`
**Native Modules**: `expo-haptics`

---

### 2.5 Zakiy AI (`/zakiy`)
| Status | Item |
|--------|------|
| [Pending] | Chat interface |
| [Pending] | Voice input (expo-av) |
| [Pending] | Emergency overlay |
| [Pending] | Context persistence |

**Data Layer**: `useZakiyMode` context
**Native Modules**: `expo-av` (voice)

---

## Phase 3: Feature Pages

### 3.1 Journey & Programs
| Status | Route | Item |
|--------|-------|------|
| [Pending] | `/journey` | 30-day journey tracker |
| [Pending] | `/islamic-programs` | Program listing |
| [Pending] | `/islamic-programs/:id` | Program detail |
| [Pending] | `/hadi-tasks` | Daily tasks |

### 3.2 Community
| Status | Route | Item |
|--------|-------|------|
| [Pending] | `/ameen` | Community duas |
| [Pending] | `/dhikr-rooms` | Live dhikr rooms |
| [Pending] | `/challenge/create` | Create challenge |
| [Pending] | `/challenge/:slug` | View challenge |

### 3.3 Personal Growth
| Status | Route | Item |
|--------|-------|------|
| [Pending] | `/journal` | Spiritual journal |
| [Pending] | `/progress` | Progress charts |
| [Pending] | `/garden` | Gamification garden |
| [Pending] | `/habits` | Habit tracking |

### 3.4 Support Features
| Status | Route | Item |
|--------|-------|------|
| [Pending] | `/sos` | Emergency SOS |
| [Pending] | `/relapse` | Relapse support |
| [Pending] | `/signs` | Warning signs |
| [Pending] | `/covenant` | User covenant |

---

## Phase 4: Context Providers Migration

| Status | Provider | Purpose |
|--------|----------|---------|
| [Pending] | SettingsProvider | Theme, language, preferences |
| [Pending] | NotificationsProvider | Prayer & dhikr notifications |
| [Pending] | AuthProvider | Supabase authentication |
| [Pending] | ZakiyModeProvider | AI mode state |
| [Pending] | AppNotificationsProvider | In-app notifications |

---

## Phase 5: Native Integration

| Status | Module | Purpose |
|--------|--------|---------|
| [Pending] | expo-notifications | Push notifications |
| [Pending] | expo-device | Device info |
| [Pending] | expo-location | GPS for prayer times |
| [Pending] | expo-av | Quran audio playback |
| [Pending] | expo-haptics | Dhikr counter feedback |
| [Pending] | expo-file-system | Offline Quran data |
| [Pending] | react-native-maps | Mosque locations |

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
| `@dnd-kit/core` | `@dnd-kit/core` (RN compatible) |
| TailwindCSS | NativeWind |

---

## Migration Order (Recommended)

1. **Home Page** - Most complex, establish patterns
2. **Quran Section** - Core feature, many sub-pages
3. **Prayer Times** - Native integrations first
4. **Dhikr** - Simple counter functionality
5. **Zakiy** - AI chat interface
6. **Journey/Programs** - Progress tracking
7. **Community** - Social features
8. **Personal** - Journal, Garden, Habits
9. **Support** - SOS, Relapse, Covenant
10. **Account/Settings** - User preferences

---

## Current Status: Awaiting Approval

**Phase 1 Complete**: Foundation ready
**Phase 2.1 Verified**: Home page migration mirrored
**Phase 2.2 Verified**: Quran `/quran/read` (tajweed parser + legend + dual-language tafsir) verified; `pnpm run typecheck` passes
**Next**: Phase 2.3 - Prayer Times

Please approve to proceed with Home page implementation.
