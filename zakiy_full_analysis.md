# 🧠 تشريح كامل لـ "الزكي" — وثيقة لتحويله إلى تطبيق Expo

> هذه الوثيقة تشريح شامل لمساعد الذكاء الاصطناعي "الزكي" الموجود في تطبيق **دليل التوبة النصوح**، مكتوبة لتسليمها لـ Agent لتحويل التطبيق من Web إلى React Native / Expo بشكل مطابق للأصل.

---

## 📌 نظرة عامة — ما هو الزكي؟

الزكي هو **مساعد روحاني إسلامي بالذكاء الاصطناعي** يعمل كـ "الأخ الأكبر الحكيم". ليس بوتاً رسمياً ولا شيخاً — بل صاحب صادق يعرف دينه، يحبك ويخاف عليك، ويقولك الحق في وجهك.

**الهدف الجوهري:** مساعدة المستخدم في رحلة التوبة والاستقامة والنمو الروحي.

---

## 👤 شخصية الزكي — بالتفصيل

### الهوية والدور:
- **الاسم:** الزكي
- **الدور:** الأخ الأكبر الحكيم / الرفيق الروحاني
- **اللغة:** عربية عامية مصرية طبيعية مع فصحى في المواضع المناسبة
- **الجمهور:** المسلمون الذين يسعون للتوبة والاستقامة، خاصة الشباب العربي

### سمات الشخصية:
| السمة | التفاصيل |
|-------|----------|
| 🤝 حنون لكن بلا تهاون | بيحبك وبيخاف عليك ويقولك الحق |
| ⚖️ عادل بلا محاباة | الذنب ذنب مهما كانت الأسباب، لكن الباب مفتوح |
| 🧠 حكيم | يعطي من قلبه لا من حفظه، القصة والمثل أقوى من المحاضرة |
| 💬 طبيعي وحيوي | فيه طاقة وحياة، مش بيتكلم بصوت النوم |
| 🔒 ثابت المبادئ | لا يتساهل في الحلال والحرام، لكن لا ييأّس من رحمة الله |

### طريقة الكلام:
- طبيعي وعفوي كأقرب صاحب
- لما الكلام عن ذنب: هادئ وصادق كما لو بينهما سر
- لما يحاسب: مباشر وواضح بلا مجاملة
- لما يشجع: فيه طاقة وأمل حقيقي
- لما المستخدم قلقان: دافئ وحنين كأخوه الصغير
- **لا يكتب وصف للنبرة بين قوسين** — الكلام نفسه يعبّر

### حدود التخصص:
الزكي يتكلم **فقط** في: الدين الإسلامي، التوبة، الاستقامة، العبادات، الأخلاق، والتزكية النفسية.
أي موضوع خارج هذا النطاق → اعتذار بلطف ومحبة وإعادة توجيه.

---

## 🏗️ البنية التقنية الكاملة

### Stack الويب الحالي:
```
Frontend: React + Vite + TypeScript + Tailwind CSS
Routing:  Wouter
Animation: Framer Motion
Icons:    Lucide React
UI Components: Radix UI (Shadcn/ui)
State/Fetch: TanStack Query
Mobile Bridge: Capacitor (Android/iOS)
```

### Backend (API Server):
```
Runtime: Node.js + Express + TypeScript
ORM:    Drizzle ORM
DB:     PostgreSQL (Supabase)
Auth:   Jose (JWT) + Supabase Auth
AI:     OpenAI GPT-4o (Chat + Whisper + TTS)
Push:   Web-Push
```

### بنية المشروع (Monorepo):
```
/artifacts/tawbah-web/     ← Frontend React
/artifacts/api-server/     ← Backend Express
/packages/db/              ← Drizzle ORM Schema
/packages/integrations-openai-ai-server/ ← OpenAI wrapper
```

---

## 🧩 المكونات والصفحات الكاملة

### صفحات التطبيق (Routes):

| المسار | الصفحة | الوصف |
|--------|--------|--------|
| `/` | Home | الصفحة الرئيسية |
| `/login` | Login | تسجيل الدخول |
| `/covenant` | Covenant | عهد التوبة |
| `/day-one` | DayOne | اليوم الأول |
| `/plan` / `/habits` | HabitsPage | خطة الاستقامة والعادات |
| `/dhikr` | Dhikr | الذكر |
| `/sos` | Sos | وضع الطوارئ 🚨 |
| `/signs` | Signs | علامات القبول |
| `/relapse` | Relapse | الانتكاسة |
| `/kaffarah` | Kaffarah | الكفارة |
| `/rajaa` | Rajaa | الرجاء |
| `/raja-libr` | RajaaLibrary | مكتبة الرجاء |
| `/zakiy` | **Zakiy** | **المحادثة مع الزكي** |
| `/journal` | Journal | اليوميات |
| `/progress` | ProgressChart | مخطط التقدم |
| `/danger-times` | DangerTimes | أوقات الخطر |
| `/hadi-tasks` | HadiTasks | مهام الهادي |
| `/card` | TawbahCard | بطاقة التوبة |
| `/challenge/create` | ChallengeCreate | إنشاء تحدي |
| `/challenge/:slug` | ChallengeView | عرض التحدي |
| `/map` | TawbahMap | خريطة التوبة |
| `/journey` | Journey30 | رحلة ٣٠ يوم |
| `/dhikr-rooms` | DhikrRooms | غرف الذكر |
| `/secret-dua` | SecretDua | الدعاء السري |
| `/prayer-times` | PrayerTimes | مواقيت الصلاة |
| `/ameen` | CommunityDuas | أدعية الجماعة |
| `/account` | Account | الحساب |
| `/sins` | SinsList | قائمة الذنوب |
| `/eid` | EidPage | العيد |
| `/notifications` | Notifications | الإشعارات |
| `/inbox` | Inbox | صندوق الرسائل |
| `/dua-timing` | DuaTiming | توقيت الدعاء |
| `/garden` | Garden | الحديقة |
| `/munajat` | Munajat | المناجاة |
| `/adhkar` | Adhkar | الأذكار |
| `/quran` | QuranPage | القرآن (الصفحة الرئيسية) |
| `/quran/read` | QuranRead | قراءة القرآن |
| `/quran/listen` | QuranListen | سماع القرآن |
| `/quran/memorize` | QuranMemorize | حفظ القرآن |
| `/quran/tafsir` | QuranTafsir | تفسير القرآن |
| `/quran/khatma` | QuranKhatma | ختمة القرآن |
| `/quran/challenges` | QuranChallenges | تحديات القرآن |
| `/quran/map` | QuranMap | خريطة القرآن |
| `/quran/ai` | QuranAi | الزكي للقرآن |
| `/quran/cards` | QuranCards | بطاقات القرآن |
| `/quran/miracles` | QuranMiracles | إعجاز القرآن |
| `/quran/khatmat` | QuranKhatmat | الختمات |
| `/islamic-programs` | IslamicPrograms | البرامج الإسلامية |

---

## 🤖 محادثة الزكي — البنية التفصيلية

### ملف: `/pages/zakiy/index.tsx`

#### الـ State المستخدم:
```typescript
messages: Message[]           // قائمة الرسائل
input: string                 // نص المدخل
chatState: "idle" | "thinking" | "responding" | "error"
recording: boolean            // حالة التسجيل الصوتي
voiceProfileId: string        // معرف البروفايل الصوتي المختار
riskAlert: { level, message, sign } | null  // تنبيه الخطر
anniversaryMilestone: string | null         // احتفال الذكرى
autoPlayMsgId: string | null               // الرسالة المشغّلة صوتياً
impressionOpenId: string | null            // الرسالة المفتوح تفسيرها
interimText: string                        // نص مؤقت أثناء التسجيل
dismissedSuggestions: Set<string>          // الاقتراحات المُرفضة
```

#### التحيات المبنية على الوقت:
```
03:00 - 07:00 → "أهلاً يا صاحبي! 🌙 جوه الليل، ربنا معاك."
07:00 - 12:00 → "أهلاً يا صاحبي! 🌅 الصبح جميل، ربنا يبارك يومك."
12:00 - 15:00 → "أهلاً! ☀️ وقت الظهيرة..."
15:00 - 18:00 → "أهلاً يا صاحبي! 🌤️ العصر جاي..."
18:00 - 20:00 → "أهلاً! 🌇 وقت المغرب..."
20:00 - 22:00 → "أهلاً! 🌆 العشاء..."
```

#### منطق اختيار الصوت الافتراضي:
```typescript
// من localStorage: "tawbah_gender" = "male" | "female"
const defaultVoice = gender === "female" ? "sister-caring" : "young-guide"
```

---

## 🎙️ البروفايلات الصوتية (Voice Profiles)

6 أصوات كاملة، مبنية على OpenAI TTS:

| ID | الاسم | الجنس | صوت OpenAI | الوصف |
|----|-------|-------|-----------|-------|
| `sheikh-calm` | الشيخ الهادئ | ذكر | `onyx` | صوت رجولي وقور بفصحى سليمة |
| `wise-friend` | الصاحب الحكيم | ذكر | `fable` | شاب ٣٥، دافئ وحكيم كصاحب |
| `young-guide` | المرشد الشاب | ذكر | `echo` | شاب حيوي وواضح ومُشجِّع (الافتراضي للذكر) |
| `wise-teacher` | المعلمة الفاضلة | أنثى | `shimmer` | صوت أنثوي رزين بفصحى واضحة |
| `sister-caring` | الأخت المتفهمة | أنثى | `nova` | شابة دافئة بصدق وحنان (الافتراضي للأنثى) |
| `gentle-mentor` | المرشدة الحنونة | أنثى | `coral` | ناعمة ومطمئنة تبثّ السكينة |

---

## 📨 أنواع الرسائل وSegments

### MessageSegment — أنواع:
```typescript
type SegmentType = "text" | "quran" | "fatwa" | "promise" | "surah-link"

interface MessageSegment {
  type: SegmentType
  text: string
  audioBase64?: string   // صوت TTS مشفر base64 (للـ text فقط)
  surah?: number         // رقم السورة (للـ quran)
  ayah?: number          // رقم الآية
  source?: string        // مصدر الفتوى
  url?: string           // رابط الفتوى أو السورة
}
```

### كيف يُولّد الـ AI الـ Markers:

#### آية قرآنية:
```
{{quran:2:255|آية الكرسي...}}
→ يُعرض كبطاقة قرآنية مع زر تشغيل صوت القارئ من Quran.com
```

#### فتوى شرعية:
```
{{fatwa:دار الإفتاء المصرية|https://...|نص الحكم}}
→ يُعرض كبطاقة فتوى مع رابط المصدر
```

#### وعد:
```
{{promise:أتعهد أمام الله أن أترك [الذنب]...}}
→ يُعرض كبطاقة وعد مع زر "أقطع الوعد" يحفظه في الذاكرة
```

#### سورة كاملة:
```
{{full-surah:18}}  ← سورة الكهف
→ يجلب السورة من API alquran.cloud ويعرض أول 20 آية + رابط للباقي
```

---

## 🧠 نظام الذاكرة (Memory System)

### هيكل البيانات:
```typescript
interface ZakiyMemoryData {
  traits: string[]       // صفات المستخدم (max 5)
  challenges: string[]   // تحدياته (max 5)
  recentTopics: string[] // آخر مواضيع المحادثة
  personalNote: string   // ملاحظة شخصية مختصرة
  promises: ZakiyPromise[]  // الوعود
  slips: ZakiySlip[]        // الزللات
}

interface ZakiyPromise {
  text: string
  date: string    // YYYY-MM-DD
  broken: boolean
  brokenCount: number
}

interface ZakiySlip {
  sin: string
  date: string
  afterPromise: boolean  // هل كسر بعد وعد؟
}
```

### كيف يعمل:
1. **بعد كل رسالة:** GPT-4o يحلل الحوار ويستخرج المعلومات الجديدة
2. **يحفظ في DB:** Drizzle ORM → `zakiyMemoryTable` بالـ `sessionId`
3. **في كل محادثة:** يُحقن في system prompt كـ "ما تعرفه عن صاحبك"

### شكل حقن الذاكرة في الـ Prompt:
```
╔══════════════════════════════╗
║       ما تعرفه عن صاحبك       ║
╚══════════════════════════════╝
🧠 صفاته: [صفاته]
⚡ تحدياته: [تحدياته]
📌 آخر مواضيعه: [المواضيع]
📝 ملاحظة: [ملاحظة شخصية]
🤝 وعوده القائمة: [الوعود الفعّالة]
💔 وعود كسرها: [الوعود المكسورة + عدد الكسر]
⚠️ زللاته الأخيرة: [آخر 5 زللات]
```

---

## ⚡ محرك القرارات (Decision Engine)

### ZakiyContext — المدخلات:
```typescript
interface ZakiyContext {
  sessionId: string
  streakDays: number      // أيام الالتزام المتواصلة
  inactiveDays: number    // أيام الغياب
  sinCategory: string     // فئة الذنب
  riskScore: number       // 0.0 - 1.0
  currentPhase: number    // مرحلة الرحلة
  covenantSigned: boolean // هل وقّع العهد؟
  trustLevel: number      // مستوى الثقة
  todayTasks: UnifiedTask[]
  timeOfDay: string
  memoryTraits?: string[]
  memoryContext?: { lastAdvice, lastTask, repetitionCount }
}
```

### منطق القرار (Rule-Based):
```
riskScore > 0.9         → emergency  → /sos
inactiveDays >= 3       → repentance → /relapse
!covenantSigned         → stabilize  → /covenant
مهمة مطلوبة ناقصة      → stabilize  → route المهمة
مهمة موصى بها ناقصة    → growth     → route المهمة
covenantSigned          → growth     → /journey
Default                 → growth     → /dhikr
```

### أنواع الحالات (DecisionType):
| النوع | اللون | المعنى |
|-------|-------|--------|
| `emergency` | 🔴 أحمر | خطر مرتفع — نحو SOS |
| `repentance` | 🔵 أزرق | غياب طويل — باب مفتوح |
| `stabilize` | 🟡 أصفر | تثبيت — خطوة محددة |
| `growth` | 🟢 أخضر | نمو — استمرار ومضي |

---

## 🚨 محرك الخطر (Risk Engine)

### حساب الـ riskScore:
```
+0.4 → انتكاسة حديثة (أقل من 24 ساعة)
+0.3 → غياب 3 أيام أو أكثر
+0.1 → غياب يوم واحد
+0.2 → الوقت الحالي في "أوقات الخطر" المحددة من المستخدم
+0.1 → لا يوجد streak نشط
-0.2 → streak أكثر من 7 أيام (خصم إيجابي)

shouldTriggerSOS = score > 0.9
```

---

## 📞 API Endpoints الكاملة

### Zakiy Chat Endpoints:
```
POST /api/zakiy/message
  Body: { message, history, sessionId, voiceProfile }
  Returns: { response, segments[] }

POST /api/zakiy/voice
  Body: { audioBase64, history, sessionId, voiceProfile }
  Returns: { response, segments[], transcription }

POST /api/zakiy/decide
  Body: { context: ZakiyContext }
  Returns: { decision: ZakiyDecision }

GET  /api/zakiy/risk-check?sessionId=...
  Returns: { risk: { level, message, sign } | null }

GET  /api/zakiy/anniversary?sessionId=...
  Returns: { anniversary: { milestone, message } | null }

POST /api/zakiy/promise
  Body: { sessionId, text }
  Returns: { ok: true }

POST /api/zakiy/suggestions
  Body: { history, sessionId }
  Returns: { suggestions: string[] }
```

### Audio/TTS:
```
POST /api/tts
  Body: { text, voiceProfile }
  Returns: { audioBase64 }

GET  /api/audio-proxy?url=...
  Proxy لصوت القرآن من Quran.com
```

### Journey/Tasks:
```
GET  /api/journey?sessionId=...
POST /api/journey/complete
GET  /api/hadi-tasks?sessionId=...
POST /api/hadi-tasks/complete
```

### Auth:
```
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### Misc:
```
GET  /api/health
GET  /api/hero
GET  /api/quran/...
POST /api/tawbah/...
GET  /api/dhikr-rooms/...
POST /api/push/subscribe
GET  /api/admin/...
```

---

## 🎨 نظام المظهر والثيم

### الألوان (8 ألوان):
| ID | الاسم | Light | Dark |
|----|-------|-------|------|
| `forest` | الغابة | `#174d2b` | `#c9933a` |
| `ocean` | المحيط | `#0f4c81` | `#38bdf8` |
| `aurora` | الشفق | `#6b21a8` | `#c084fc` |
| `midnight` | منتصف الليل | `#1e3a8a` | `#60a5fa` |
| `rose` | الورود | `#9f1239` | `#fb7185` |
| `sunset` | الغروب | `#92400e` | `#fbbf24` |
| `slate` | الصخري | `#1e3a5f` | `#7dd3fc` |
| `mint` | النعناع | `#065f46` | `#34d399` |

### حالة الزكي تغيّر لون الهيدر:
```
emergency  → أحمر (border-red-300)
repentance → أزرق (border-blue-300)
growth     → أخضر (border-emerald-300)
```

### Light/Dark Mode: محفوظ في localStorage وSettingsContext

---

## 💾 LocalStorage Keys المستخدمة

```
tawbah_session_id          → معرف الجلسة
tawbah_gender              → "male" | "female"
zakiy_voice_profile        → معرف البروفايل الصوتي المختار
zakiy_voice_input          → نص صوتي معلق للإرسال
tawbah_theme               → "light" | "dark"
tawbah_accent              → AccentColor
tawbah_lang                → "ar" | "en"
tawbah_streak              → عدد أيام الالتزام
tawbah_covenant_date       → تاريخ العهد
tawbah_inactive_days       → أيام الغياب
tawbah_risk_score          → riskScore المحسوب
tawbah_danger_hours        → أوقات الخطر [ساعات]
sos_count                  → عدد مرات استخدام SOS
sos_last                   → آخر استخدام SOS
sos_return                 → علم العودة من SOS
```

---

## 🆘 صفحة SOS (الطوارئ)

### 3 مراحل:
1. **alert** → شاشة تنبيه: "أنت في خطر" + زر للمتابعة
2. **breathe** → تمرين التنفس 4-4-4:
   - استنشق 4 ثواني
   - أمسك 4 ثواني
   - أخرج 4 ثواني
   - (3 دورات)
3. **dua** → أدعية الطوارئ:
   - "أعوذ بالله من الشيطان الرجيم"
   - "اللهم إني أعوذ بك من شر نفسي"
   - "رب اغفر لي وتب علي إنك أنت التواب الرحيم"
   - "حسبنا الله ونعم الوكيل"
   - "لا حول ولا قوة إلا بالله العلي العظيم"

---

## 🎴 الـ Starter Questions (أسئلة البداية)

28 سؤال جاهز يُعرض للمستخدم الجديد، يتم اختيار 6 عشوائياً:
- "إزاي أتوب توبة صادقة؟"
- "أنا بعيد عن ربنا، من فين أبدأ؟"
- "عملت ذنب كبير، ربنا هيسامحني؟"
- "إزاي أثبت على الطاعة؟"
- "أنا بحس بوحشة روحية، أعمل إيه؟"
- ... إلخ

---

## 🔔 نظام الإشعارات

### NotificationsContext:
```typescript
duaPeakVisible  → Modal وقت الدعاء المستجاب
adhkarVisible   → Modal الأذكار (صباح/مساء)
adhkarType      → "morning" | "evening"
```

### AppNotificationsContext:
- يُستمع لإشعارات Push من الـ Backend
- يعرض إشعارات داخل التطبيق

### Capacitor Local Notifications:
- الأذكار الصباحية والمسائية
- تذكير الصلاة
- احتفال الـ Streak

---

## 📱 Capacitor (Mobile Bridge)

### الـ Plugins المستخدمة:
```
@capacitor/core          → أساسي
@capacitor/status-bar    → تلوين شريط الحالة
@capacitor/app           → الزر الخلفي في Android
@capacitor/haptics       → اهتزاز عند الأحداث
@capacitor/local-notifications → إشعارات محلية
```

### الـ StatusBar يتغير حسب الثيم:
```typescript
theme === "dark" ? Style.Light : Style.Dark  // أيقونات الشريط
// لون الخلفية = accent color المختار
```

### Android Back Button:
- إذا ليس في `/` → `history.back()`
- إذا في `/` → `exitApp()`

### النظام المخصص:
```
SystemBars plugin → تلوين Navigation Bar أسفل الشاشة
```

---

## 🧬 Contexts الكاملة

| Context | المحتوى |
|---------|---------|
| `SettingsContext` | theme, accentColor, lang, translations |
| `AuthContext` | user, sessionId, isLoggedIn |
| `NotificationsContext` | duaPeak, adhkar modals |
| `AppNotificationsContext` | push notifications listener |
| `ZakiyModeContext` | حالة الزكي الحالية (emergency/growth/etc) |
| `QueryClientProvider` | TanStack Query cache |

---

## 🔄 دورة حياة المحادثة (Chat Flow)

```
1. المستخدم يفتح /zakiy
2. checkAnniversaryAndRisk() → يجلب أي احتفال أو تنبيه خطر
3. يُعرض greeting مبني على وقت اليوم
4. (إذا لا رسائل) → يُعرض 6 Starter Cards عشوائية

--- إرسال رسالة نصية ---
5. addUserMessage(text)
6. setChatState("thinking")
7. POST /api/zakiy/message
8. setChatState("responding")
9. addBotMessage(response, segments)
10. setAutoPlayMsgId → تشغيل صوت TTS تلقائياً
11. fetchSuggestions() → جلب 3 أسئلة مقترحة للرد

--- إرسال رسالة صوتية (Native App) ---
5. getUserMedia() → MediaRecorder
6. تسجيل صوتي → WebM/MP4
7. تحويل لـ Base64
8. POST /api/zakiy/voice
9. Whisper يفك التشفير
10. GPT يولد رد
11. TTS يولد صوت
12. نفس خطوات 8-11 أعلاه

--- إرسال رسالة صوتية (Web) ---
5. SpeechRecognition API (ar-EG)
6. interim text يُعرض أثناء التسجيل
7. final text → يُكتب في الـ input
8. المستخدم يضغط إرسال يدوياً
```

---

## 🎵 نظام الصوت والـ TTS

### كيف يعمل الـ Audio Playback:
1. كل `segment` من نوع `text` يحمل `audioBase64`
2. `BotMessageBody` يشغّل الصوت segment بعد segment (تسلسلي)
3. آيات القرآن تُشغَّل من Quran.com API (مباشرة)
4. زر Play/Pause على كل رسالة
5. `autoPlayMsgId` يحدد الرسالة التي تُشغَّل تلقائياً

### تنظيف النص قبل TTS:
```
- حذف {{quran:...}} markers
- حذف {{fatwa:...}} markers
- حذف الـ Emojis والرموز الخاصة
- حذف النصوص بين [] (stage directions)
- حذف الفواصل المتكررة
```

---

## 🌙 الـ Impression Panel

"انطباع الزكي" — زر صغير على كل رسالة يفتح **تفسيراً موجزاً** يشرح ما قصده الزكي في الرسالة. يُولَّد بـ AI منفصل.

---

## 📊 نظام Streak والاحتفالات

```
7  أيام → "🎉 أسبوع كامل! والله أنا فخور بك."
14 أيوم → "🌟 أسبوعين! أنت في الطريق الصحيح."
30 يوم  → "👑 شهر كامل! هذا إنجاز كبير."
60 يوم  → "🏆 شهران! أنت بطل حقيقي."
90 يوم  → "💎 ثلاثة أشهر! والله أنت غيرت حياتك."
```

---

## 🔑 نظام الوعود والمحاسبة

### متى يطلب الزكي وعداً:
عندما يعلن المستخدم عزمه على ترك ذنب أو الالتزام بشيء محدد.

### آلية الوعد:
1. الزكي يكتب `{{promise:نص الوعد}}`
2. يُعرض كـ PromiseCard مع زر "أقطع الوعد"
3. عند الضغط: `POST /api/zakiy/promise` → يحفظ في الذاكرة
4. في المحادثات اللاحقة: الزكي "يذكّر" بالوعد ويحاسب على كسره

### عند الانتكاسة بعد وعد:
1. يذكر الوعد بالاسم
2. يُعظّم كسر الوعد
3. لا يُهوّن ولا يُبرر
4. ثم يفتح باب التوبة من جديد

---

## 🌐 مصادر القرآن والفتاوى

### القرآن الكريم:
- `https://api.alquran.cloud/v1/surah/{surah}/quran-uthmani` — نص السورة
- `https://quran.com/{surah}/{ayah}` — صوت القارئ

### مصادر الفتاوى:
- دار الإفتاء المصرية: `https://www.dar-alifta.org/ar/fatawa`
- الشبكة الإسلامية: `https://www.islamweb.net/ar/fatwa`
- إسلام سؤال وجواب: `https://islamqa.info/ar`

### الأحاديث النبوية (قواعد صارمة):
- فقط من: صحيح البخاري، صحيح مسلم، أو سنن الترمذي
- يُذكر المصدر دائماً: "(رواه البخاري)" أو "(رواه مسلم)"
- ممنوع منعاً باتاً اختراع أو ذكر حديث ضعيف

---

## 📱 ملاحظات حرجة للتحويل إلى Expo

### 1. الـ Voice Recording:
- ويب: SpeechRecognition API بـ `ar-EG`
- Native: MediaRecorder → Base64 → POST `/api/zakiy/voice` (Whisper)
- في Expo: استخدم `expo-av` لـ recording + Whisper transcription

### 2. الـ Audio Playback:
- الصوت يأتي كـ Base64 WAV
- في Expo: استخدم `expo-av` `Audio.Sound.createAsync()` مع data URI
- التشغيل التسلسلي للـ segments مهم جداً

### 3. الـ localStorage:
- يُستبدل بـ `AsyncStorage` من `@react-native-async-storage/async-storage`
- أو `SecureStore` من `expo-secure-store` للبيانات الحساسة

### 4. الـ Routing (Wouter → Expo Router):
- `useLocation()` → `useRouter()` + `useLocalSearchParams()`
- `navigate("/path")` → `router.push("/path")`

### 5. الـ Haptics:
- `@capacitor/haptics` → `expo-haptics`

### 6. الـ Status Bar:
- `@capacitor/status-bar` → `expo-status-bar`

### 7. الـ Notifications:
- Web Push → `expo-notifications`

### 8. الـ Back Button (Android):
- Capacitor back handler → `useBackHandler` من `react-native-back-handler`

### 9. الـ Animations:
- Framer Motion → `react-native-reanimated` + `moti`

### 10. الـ RTL:
- التطبيق بالكامل RTL (dir="rtl")
- في React Native: `I18nManager.forceRTL(true)` + layout RTL

### 11. الـ WebView لصفحات القرآن:
- قد تحتاج بعض صفحات القرآن (الـ Tafsir خاصةً) لـ WebView

### 12. الـ TanStack Query:
- يعمل مباشرة في React Native بنفس الكود

### 13. الـ Framer Motion:
- لا تعمل في React Native — بديلها `moti` + `react-native-reanimated`

---

## 🔌 متغيرات البيئة (Environment Variables)

```
OPENAI_API_KEY           → GPT-4o + Whisper + TTS
DATABASE_URL             → PostgreSQL (Supabase)
SUPABASE_URL             → Supabase URL
SUPABASE_ANON_KEY        → Supabase Anon Key
VAPID_PUBLIC_KEY         → Web Push
VAPID_PRIVATE_KEY        → Web Push
API_BASE_URL             → رابط الـ Backend من Frontend
```

---

## 📋 ملخص تنفيذي للـ Agent

### ما يجب تحويله:
1. ✅ كل الصفحات المذكورة أعلاه (53 صفحة)
2. ✅ محادثة الزكي بالكامل مع الـ Voice
3. ✅ نظام الـ Segments (quran, fatwa, promise, surah-link, text)
4. ✅ الـ TTS والـ Audio Playback
5. ✅ نظام الذاكرة والوعود
6. ✅ SOS mode بمراحله الثلاث
7. ✅ الـ Starter Questions
8. ✅ Risk alerts والـ Anniversary celebrations
9. ✅ الـ Voice Profiles الست
10. ✅ الثيم بألوانه الثمانية + Dark/Light mode
11. ✅ الـ Notifications
12. ✅ RTL كامل

### ما لا يتغير (Backend يبقى كما هو):
- كل الـ API Endpoints
- نظام الذاكرة في DB
- GPT-4o prompts والـ system prompt
- Risk Engine والـ Decision Engine
- الـ TTS generation

---

*وثيقة التشريح مكتملة — آخر تحديث: 8 أبريل 2026*
