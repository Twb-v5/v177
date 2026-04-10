import {
  calcDuaPower,
  getPowerLabel,
  getNextPeakDescription,
  buildDuaWindows,
  type DuaWindow,
} from "@/lib/dua-power";

export { calcDuaPower, getPowerLabel, getNextPeakDescription, buildDuaWindows };
export type { DuaWindow };

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DuaContext {
  power: number;
  label: string;
  nextPeak: string;
  windows: DuaWindow[];
  activeWindows: DuaWindow[];
  now: Date;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function getDuaContext(): DuaContext {
  const now = new Date();
  const power = calcDuaPower(now);
  const label = getPowerLabel(power);
  const nextPeak = getNextPeakDescription(now);
  const windows = buildDuaWindows(now);
  const activeWindows = windows.filter(w => w.active);

  return { power, label, nextPeak, windows, activeWindows, now };
}

// ─── Munajat Data ─────────────────────────────────────────────────────────────

export interface MunajatItem {
  id: string;
  category: "tawbah" | "hope" | "fear" | "gratitude" | "hardship" | "general";
  titleAr: string;
  textAr: string;
  ref?: string;
  tags: string[];
}

export const MUNAJAT_CATEGORIES = {
  tawbah:    { labelAr: "التوبة",       emoji: "💧", color: "#10b981" },
  hope:      { labelAr: "الرجاء",       emoji: "🌅", color: "#f59e0b" },
  fear:      { labelAr: "الخوف من الله", emoji: "🌙", color: "#8b5cf6" },
  gratitude: { labelAr: "الشكر",        emoji: "✨", color: "#3b82f6" },
  hardship:  { labelAr: "الكرب",        emoji: "🤲", color: "#ef4444" },
  general:   { labelAr: "عامة",         emoji: "📿", color: "#64748b" },
} as const;

export const MUNAJAT: MunajatItem[] = [
  {
    id: "m1", category: "tawbah", titleAr: "مناجاة التائب",
    textAr: "يا من يقبل التائبين، ويعفو عن المسيئين، ها أنا بين يديك... تبت إليك توبةً نصوحاً، فاغفر لي ما قدّمت وما أخّرت، وارحمني يا أرحم الراحمين.",
    ref: "مستوحى من دعاء أبي حامد الغزالي",
    tags: ["توبة", "مغفرة", "رحمة"],
  },
  {
    id: "m2", category: "hope", titleAr: "مناجاة الراجي",
    textAr: "يا من سعت إليه الآمال من كل فجّ، ويا من لا يُخيّب من أمّ بابه... أرجوك أن لا تقطع رجائي، وأن تسبق رحمتك غضبك فيّ.",
    tags: ["رجاء", "أمل", "رحمة"],
  },
  {
    id: "m3", category: "fear", titleAr: "مناجاة الخائف",
    textAr: "يا الله، أقرّ بذنبي واعترف بخطيئتي... أخاف يوماً تشخص فيه الأبصار. فنجّني برحمتك، وأدخلني في عبادك الصالحين.",
    tags: ["خوف", "يوم القيامة", "نجاة"],
  },
  {
    id: "m4", category: "hardship", titleAr: "مناجاة المكروب",
    textAr: "يا كاشف الضرّ، ويا مُجيب دعوة المضطر... إني في ضيق وكرب لا مخرج منه إلا برحمتك. فارحمني وفرّج همّي وأصلح شأني كله.",
    tags: ["كرب", "فرج", "دعاء"],
  },
  {
    id: "m5", category: "gratitude", titleAr: "مناجاة الشاكر",
    textAr: "يا من أنعم عليّ بالإسلام والعقل والعافية... كيف أوفيك شكراً وأنت الذي هديتني وأطعمتني وكسوتني. اللهم زدني شكراً وتوفيقاً.",
    tags: ["شكر", "نعمة", "حمد"],
  },
  {
    id: "m6", category: "tawbah", titleAr: "مناجاة المذنب",
    textAr: "إلهي... أذنبت وظلمت نفسي، وجنت على روحي... ولكن أعلم أن رحمتك تسعني. فاغفر لي ما لا يعلمه أحد غيرك، وطهّر قلبي حتى ألقاك طاهراً.",
    tags: ["ذنب", "غفران", "طهارة"],
  },
  {
    id: "m7", category: "hope", titleAr: "مناجاة التضرع",
    textAr: "يا الله، يا الله، يا الله... أنت الذي تعلم سرّي وجهري. لا أسألك إلا رحمتك وعفوك. ابنِ لي بيتاً في جنتك، وارزقني النظر إلى وجهك الكريم.",
    tags: ["تضرع", "جنة", "رحمة"],
  },
  {
    id: "m8", category: "general", titleAr: "مناجاة الليل",
    textAr: "في هذا الليل الهادئ أناجيك... يا من لا تأخذه سنة ولا نوم. أسمعني نداءك وقرّب قلبي منك. واجعل الليل سكناً لروحي وضياءً لقلبي.",
    tags: ["ليل", "قرب", "سكينة"],
  },
];

// ─── Tawbah Card System ───────────────────────────────────────────────────────

export interface TawbahCard {
  id: string;
  type: "verse" | "hadith" | "wisdom" | "dua" | "reminder";
  titleAr: string;
  textAr: string;
  ref?: string;
  color: string;
  bg: string;
  bgDark: string;
  icon: string;
}

export const TAWBAH_CARDS: TawbahCard[] = [
  {
    id: "c1", type: "verse", titleAr: "آية التوبة",
    textAr: "قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ ۚ إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا",
    ref: "الزمر: ٥٣", color: "#10b981", bg: "#E8F5EE", bgDark: "#0A1F14", icon: "📖",
  },
  {
    id: "c2", type: "verse", titleAr: "آية الرجاء",
    textAr: "إِنَّ رَبَّكَ وَاسِعُ الْمَغْفِرَةِ",
    ref: "النجم: ٣٢", color: "#2563eb", bg: "#EFF6FF", bgDark: "#080F1A", icon: "🌊",
  },
  {
    id: "c3", type: "hadith", titleAr: "حديث الرحمة",
    textAr: "لَلَّهُ أَفْرَحُ بِتَوْبَةِ عَبْدِهِ مِنْ أَحَدِكُمْ سَقَطَ عَلَى بَعِيرِهِ وَقَدْ أَضَلَّهُ فِي أَرْضٍ فَلَاةٍ",
    ref: "متفق عليه", color: "#f59e0b", bg: "#FDF6E8", bgDark: "#1A1206", icon: "🤍",
  },
  {
    id: "c4", type: "dua", titleAr: "دعاء التوبة",
    textAr: "اللَّهُمَّ أَنتَ رَبِّي لَا إِلَهَ إِلَّا أَنتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ",
    ref: "سيد الاستغفار — البخاري", color: "#8b5cf6", bg: "#F5F0FF", bgDark: "#120A1A", icon: "🤲",
  },
  {
    id: "c5", type: "reminder", titleAr: "تذكير قلبي",
    textAr: "الندم توبة",
    ref: "ابن مسعود رضي الله عنه", color: "#db2777", bg: "#FDF0F8", bgDark: "#1A0A14", icon: "💚",
  },
  {
    id: "c6", type: "verse", titleAr: "آية الاطمئنان",
    textAr: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ",
    ref: "الرعد: ٢٨", color: "#10b981", bg: "#E8F5EE", bgDark: "#0A1F14", icon: "💚",
  },
  {
    id: "c7", type: "hadith", titleAr: "باب التوبة",
    textAr: "إِنَّ اللَّهَ يَبْسُطُ يَدَهُ بِاللَّيْلِ لِيَتُوبَ مُسِيءُ النَّهَارِ، وَيَبْسُطُ يَدَهُ بِالنَّهَارِ لِيَتُوبَ مُسِيءُ اللَّيْلِ",
    ref: "مسلم", color: "#0891b2", bg: "#ECFEFF", bgDark: "#091A1F", icon: "🌙",
  },
  {
    id: "c8", type: "wisdom", titleAr: "حكمة السلف",
    textAr: "لو علم المذنبون كيف ينظر الله إليهم في حال توبتهم لماتوا فرحاً",
    ref: "ابن القيم", color: "#c8963e", bg: "#FDF6E8", bgDark: "#1A1206", icon: "✨",
  },
];

export function getDailyCard(): TawbahCard {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return TAWBAH_CARDS[dayOfYear % TAWBAH_CARDS.length];
}

export function getRandomCards(count: number): TawbahCard[] {
  const shuffled = [...TAWBAH_CARDS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
