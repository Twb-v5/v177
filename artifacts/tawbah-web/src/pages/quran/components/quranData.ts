// ─── Audio helpers ──────────────────────────────────────────────────────────

export const SURAH_LENGTHS = [
  7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128, 111,
  110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73, 54, 45,
  83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60, 49, 62, 55,
  78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52, 44, 28, 28, 20,
  56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19, 26, 30, 20, 15, 21,
  11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3, 6, 3, 5, 4, 5, 6,
];

export function toGlobalAyah(surah: number, ayah: number): number {
  let count = 0;
  for (let i = 0; i < surah - 1; i++) count += SURAH_LENGTHS[i] ?? 0;
  return count + ayah;
}

export function cdnAudioUrl(surahId: number, ayahNum: number, reciterId: string): string {
  return `https://cdn.islamic.network/quran/audio/128/${reciterId}/${toGlobalAyah(surahId, ayahNum)}.mp3`;
}

const TO_AR = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
export function toEasternArabic(n: number): string {
  return String(n).split("").map((d) => TO_AR[parseInt(d)] ?? d).join("");
}

export let activeQuranAudio: { element: HTMLAudioElement; stop: () => void } | null = null;
export function setActiveQuranAudio(v: typeof activeQuranAudio) { activeQuranAudio = v; }

// ─── Types ──────────────────────────────────────────────────────────────────

export interface Surah {
  id: number;
  name: string;
  nameEn: string;
  revelation: "مكية" | "مدنية";
  ayahCount: number;
  juz: number;
  meaning: string;
}

export interface QuranMiracle {
  id: number;
  title: string;
  icon: string;
  category: "عددي" | "علمي" | "لغوي" | "تاريخي";
  description: string;
  detail: string;
  color: string;
}

export interface QuranScience {
  id: number;
  title: string;
  icon: string;
  description: string;
  gradient: string;
  border: string;
  route: string;
}

export interface DailyAyah {
  arabic: string;
  surah: string;
  ayahNum: number;
  tafsir: string;
  memorize: string;
}

export interface AlQuranAyah {
  numberInSurah: number;
  text: string;
}

export interface AlQuranResponse {
  code: number;
  data: {
    name: string;
    englishName: string;
    numberOfAyahs: number;
    ayahs: AlQuranAyah[];
  };
}

// ─── Data ───────────────────────────────────────────────────────────────────

export const SURAHS: Surah[] = [
  { id: 1, name: "الفاتحة", nameEn: "Al-Fatiha", revelation: "مكية", ayahCount: 7, juz: 1, meaning: "الفاتحة" },
  { id: 2, name: "البقرة", nameEn: "Al-Baqara", revelation: "مدنية", ayahCount: 286, juz: 1, meaning: "البقرة" },
  { id: 3, name: "آل عمران", nameEn: "Aal Imran", revelation: "مدنية", ayahCount: 200, juz: 3, meaning: "آل عمران" },
  { id: 4, name: "النساء", nameEn: "An-Nisa", revelation: "مدنية", ayahCount: 176, juz: 4, meaning: "النساء" },
  { id: 5, name: "المائدة", nameEn: "Al-Maida", revelation: "مدنية", ayahCount: 120, juz: 6, meaning: "المائدة" },
  { id: 6, name: "الأنعام", nameEn: "Al-Anam", revelation: "مكية", ayahCount: 165, juz: 7, meaning: "الأنعام" },
  { id: 7, name: "الأعراف", nameEn: "Al-Araf", revelation: "مكية", ayahCount: 206, juz: 8, meaning: "الأعراف" },
  { id: 8, name: "الأنفال", nameEn: "Al-Anfal", revelation: "مدنية", ayahCount: 75, juz: 9, meaning: "الأنفال" },
  { id: 9, name: "التوبة", nameEn: "At-Tawba", revelation: "مدنية", ayahCount: 129, juz: 10, meaning: "التوبة" },
  { id: 10, name: "يونس", nameEn: "Yunus", revelation: "مكية", ayahCount: 109, juz: 11, meaning: "نبي الله يونس" },
  { id: 11, name: "هود", nameEn: "Hud", revelation: "مكية", ayahCount: 123, juz: 11, meaning: "نبي الله هود" },
  { id: 12, name: "يوسف", nameEn: "Yusuf", revelation: "مكية", ayahCount: 111, juz: 12, meaning: "نبي الله يوسف" },
  { id: 13, name: "الرعد", nameEn: "Ar-Rad", revelation: "مدنية", ayahCount: 43, juz: 13, meaning: "الرعد" },
  { id: 14, name: "إبراهيم", nameEn: "Ibrahim", revelation: "مكية", ayahCount: 52, juz: 13, meaning: "نبي الله إبراهيم" },
  { id: 15, name: "الحجر", nameEn: "Al-Hijr", revelation: "مكية", ayahCount: 99, juz: 14, meaning: "الحجر" },
  { id: 16, name: "النحل", nameEn: "An-Nahl", revelation: "مكية", ayahCount: 128, juz: 14, meaning: "النحل" },
  { id: 17, name: "الإسراء", nameEn: "Al-Isra", revelation: "مكية", ayahCount: 111, juz: 15, meaning: "الإسراء" },
  { id: 18, name: "الكهف", nameEn: "Al-Kahf", revelation: "مكية", ayahCount: 110, juz: 15, meaning: "الكهف" },
  { id: 19, name: "مريم", nameEn: "Maryam", revelation: "مكية", ayahCount: 98, juz: 16, meaning: "مريم" },
  { id: 20, name: "طه", nameEn: "Ta-Ha", revelation: "مكية", ayahCount: 135, juz: 16, meaning: "طه" },
  { id: 21, name: "الأنبياء", nameEn: "Al-Anbiya", revelation: "مكية", ayahCount: 112, juz: 17, meaning: "الأنبياء" },
  { id: 22, name: "الحج", nameEn: "Al-Hajj", revelation: "مدنية", ayahCount: 78, juz: 17, meaning: "الحج" },
  { id: 23, name: "المؤمنون", nameEn: "Al-Muminun", revelation: "مكية", ayahCount: 118, juz: 18, meaning: "المؤمنون" },
  { id: 24, name: "النور", nameEn: "An-Nur", revelation: "مدنية", ayahCount: 64, juz: 18, meaning: "النور" },
  { id: 25, name: "الفرقان", nameEn: "Al-Furqan", revelation: "مكية", ayahCount: 77, juz: 18, meaning: "الفرقان" },
  { id: 26, name: "الشعراء", nameEn: "Ash-Shuara", revelation: "مكية", ayahCount: 227, juz: 19, meaning: "الشعراء" },
  { id: 27, name: "النمل", nameEn: "An-Naml", revelation: "مكية", ayahCount: 93, juz: 19, meaning: "النمل" },
  { id: 28, name: "القصص", nameEn: "Al-Qasas", revelation: "مكية", ayahCount: 88, juz: 20, meaning: "القصص" },
  { id: 29, name: "العنكبوت", nameEn: "Al-Ankabut", revelation: "مكية", ayahCount: 69, juz: 20, meaning: "العنكبوت" },
  { id: 30, name: "الروم", nameEn: "Ar-Rum", revelation: "مكية", ayahCount: 60, juz: 21, meaning: "الروم" },
  { id: 31, name: "لقمان", nameEn: "Luqman", revelation: "مكية", ayahCount: 34, juz: 21, meaning: "لقمان الحكيم" },
  { id: 32, name: "السجدة", nameEn: "As-Sajda", revelation: "مكية", ayahCount: 30, juz: 21, meaning: "السجدة" },
  { id: 33, name: "الأحزاب", nameEn: "Al-Ahzab", revelation: "مدنية", ayahCount: 73, juz: 21, meaning: "الأحزاب" },
  { id: 34, name: "سبأ", nameEn: "Saba", revelation: "مكية", ayahCount: 54, juz: 22, meaning: "سبأ" },
  { id: 35, name: "فاطر", nameEn: "Fatir", revelation: "مكية", ayahCount: 45, juz: 22, meaning: "الملائكة" },
  { id: 36, name: "يس", nameEn: "Ya-Sin", revelation: "مكية", ayahCount: 83, juz: 22, meaning: "قلب القرآن" },
  { id: 37, name: "الصافات", nameEn: "As-Saffat", revelation: "مكية", ayahCount: 182, juz: 23, meaning: "الصافات" },
  { id: 38, name: "ص", nameEn: "Sad", revelation: "مكية", ayahCount: 88, juz: 23, meaning: "ص" },
  { id: 39, name: "الزمر", nameEn: "Az-Zumar", revelation: "مكية", ayahCount: 75, juz: 23, meaning: "الزمر" },
  { id: 40, name: "غافر", nameEn: "Ghafir", revelation: "مكية", ayahCount: 85, juz: 24, meaning: "المؤمن" },
  { id: 41, name: "فصلت", nameEn: "Fussilat", revelation: "مكية", ayahCount: 54, juz: 24, meaning: "فصلت" },
  { id: 42, name: "الشورى", nameEn: "Ash-Shura", revelation: "مكية", ayahCount: 53, juz: 25, meaning: "الشورى" },
  { id: 43, name: "الزخرف", nameEn: "Az-Zukhruf", revelation: "مكية", ayahCount: 89, juz: 25, meaning: "الزخرف" },
  { id: 44, name: "الدخان", nameEn: "Ad-Dukhan", revelation: "مكية", ayahCount: 59, juz: 25, meaning: "الدخان" },
  { id: 45, name: "الجاثية", nameEn: "Al-Jathiya", revelation: "مكية", ayahCount: 37, juz: 25, meaning: "الجاثية" },
  { id: 46, name: "الأحقاف", nameEn: "Al-Ahqaf", revelation: "مكية", ayahCount: 35, juz: 26, meaning: "الأحقاف" },
  { id: 47, name: "محمد", nameEn: "Muhammad", revelation: "مدنية", ayahCount: 38, juz: 26, meaning: "محمد ﷺ" },
  { id: 48, name: "الفتح", nameEn: "Al-Fath", revelation: "مدنية", ayahCount: 29, juz: 26, meaning: "الفتح" },
  { id: 49, name: "الحجرات", nameEn: "Al-Hujurat", revelation: "مدنية", ayahCount: 18, juz: 26, meaning: "الحجرات" },
  { id: 50, name: "ق", nameEn: "Qaf", revelation: "مكية", ayahCount: 45, juz: 26, meaning: "ق" },
  { id: 51, name: "الذاريات", nameEn: "Adh-Dhariyat", revelation: "مكية", ayahCount: 60, juz: 26, meaning: "الذاريات" },
  { id: 52, name: "الطور", nameEn: "At-Tur", revelation: "مكية", ayahCount: 49, juz: 27, meaning: "الطور" },
  { id: 53, name: "النجم", nameEn: "An-Najm", revelation: "مكية", ayahCount: 62, juz: 27, meaning: "النجم" },
  { id: 54, name: "القمر", nameEn: "Al-Qamar", revelation: "مكية", ayahCount: 55, juz: 27, meaning: "القمر" },
  { id: 55, name: "الرحمن", nameEn: "Ar-Rahman", revelation: "مدنية", ayahCount: 78, juz: 27, meaning: "عروس القرآن" },
  { id: 56, name: "الواقعة", nameEn: "Al-Waqia", revelation: "مكية", ayahCount: 96, juz: 27, meaning: "الواقعة" },
  { id: 57, name: "الحديد", nameEn: "Al-Hadid", revelation: "مدنية", ayahCount: 29, juz: 27, meaning: "الحديد" },
  { id: 58, name: "المجادلة", nameEn: "Al-Mujadila", revelation: "مدنية", ayahCount: 22, juz: 28, meaning: "المجادلة" },
  { id: 59, name: "الحشر", nameEn: "Al-Hashr", revelation: "مدنية", ayahCount: 24, juz: 28, meaning: "الحشر" },
  { id: 60, name: "الممتحنة", nameEn: "Al-Mumtahina", revelation: "مدنية", ayahCount: 13, juz: 28, meaning: "الممتحنة" },
  { id: 61, name: "الصف", nameEn: "As-Saf", revelation: "مدنية", ayahCount: 14, juz: 28, meaning: "الصف" },
  { id: 62, name: "الجمعة", nameEn: "Al-Jumua", revelation: "مدنية", ayahCount: 11, juz: 28, meaning: "الجمعة" },
  { id: 63, name: "المنافقون", nameEn: "Al-Munafiqun", revelation: "مدنية", ayahCount: 11, juz: 28, meaning: "المنافقون" },
  { id: 64, name: "التغابن", nameEn: "At-Taghabun", revelation: "مدنية", ayahCount: 18, juz: 28, meaning: "التغابن" },
  { id: 65, name: "الطلاق", nameEn: "At-Talaq", revelation: "مدنية", ayahCount: 12, juz: 28, meaning: "الطلاق" },
  { id: 66, name: "التحريم", nameEn: "At-Tahrim", revelation: "مدنية", ayahCount: 12, juz: 28, meaning: "التحريم" },
  { id: 67, name: "الملك", nameEn: "Al-Mulk", revelation: "مكية", ayahCount: 30, juz: 29, meaning: "المانعة" },
  { id: 68, name: "القلم", nameEn: "Al-Qalam", revelation: "مكية", ayahCount: 52, juz: 29, meaning: "ن" },
  { id: 69, name: "الحاقة", nameEn: "Al-Haaqqa", revelation: "مكية", ayahCount: 52, juz: 29, meaning: "الحاقة" },
  { id: 70, name: "المعارج", nameEn: "Al-Maarij", revelation: "مكية", ayahCount: 44, juz: 29, meaning: "المعارج" },
  { id: 71, name: "نوح", nameEn: "Nuh", revelation: "مكية", ayahCount: 28, juz: 29, meaning: "نبي الله نوح" },
  { id: 72, name: "الجن", nameEn: "Al-Jinn", revelation: "مكية", ayahCount: 28, juz: 29, meaning: "الجن" },
  { id: 73, name: "المزمل", nameEn: "Al-Muzzammil", revelation: "مكية", ayahCount: 20, juz: 29, meaning: "المزمل" },
  { id: 74, name: "المدثر", nameEn: "Al-Muddaththir", revelation: "مكية", ayahCount: 56, juz: 29, meaning: "المدثر" },
  { id: 75, name: "القيامة", nameEn: "Al-Qiyama", revelation: "مكية", ayahCount: 40, juz: 29, meaning: "القيامة" },
  { id: 76, name: "الإنسان", nameEn: "Al-Insan", revelation: "مدنية", ayahCount: 31, juz: 29, meaning: "الإنسان" },
  { id: 77, name: "المرسلات", nameEn: "Al-Mursalat", revelation: "مكية", ayahCount: 50, juz: 29, meaning: "المرسلات" },
  { id: 78, name: "النبأ", nameEn: "An-Naba", revelation: "مكية", ayahCount: 40, juz: 30, meaning: "النبأ العظيم" },
  { id: 79, name: "النازعات", nameEn: "An-Naziat", revelation: "مكية", ayahCount: 46, juz: 30, meaning: "النازعات" },
  { id: 80, name: "عبس", nameEn: "Abasa", revelation: "مكية", ayahCount: 42, juz: 30, meaning: "عبس" },
  { id: 81, name: "التكوير", nameEn: "At-Takwir", revelation: "مكية", ayahCount: 29, juz: 30, meaning: "التكوير" },
  { id: 82, name: "الانفطار", nameEn: "Al-Infitar", revelation: "مكية", ayahCount: 19, juz: 30, meaning: "الانفطار" },
  { id: 83, name: "المطففين", nameEn: "Al-Mutaffifin", revelation: "مكية", ayahCount: 36, juz: 30, meaning: "المطففين" },
  { id: 84, name: "الانشقاق", nameEn: "Al-Inshiqaq", revelation: "مكية", ayahCount: 25, juz: 30, meaning: "الانشقاق" },
  { id: 85, name: "البروج", nameEn: "Al-Buruj", revelation: "مكية", ayahCount: 22, juz: 30, meaning: "البروج" },
  { id: 86, name: "الطارق", nameEn: "At-Tariq", revelation: "مكية", ayahCount: 17, juz: 30, meaning: "الطارق" },
  { id: 87, name: "الأعلى", nameEn: "Al-Ala", revelation: "مكية", ayahCount: 19, juz: 30, meaning: "الأعلى" },
  { id: 88, name: "الغاشية", nameEn: "Al-Ghashiya", revelation: "مكية", ayahCount: 26, juz: 30, meaning: "الغاشية" },
  { id: 89, name: "الفجر", nameEn: "Al-Fajr", revelation: "مكية", ayahCount: 30, juz: 30, meaning: "الفجر" },
  { id: 90, name: "البلد", nameEn: "Al-Balad", revelation: "مكية", ayahCount: 20, juz: 30, meaning: "البلد" },
  { id: 91, name: "الشمس", nameEn: "Ash-Shams", revelation: "مكية", ayahCount: 15, juz: 30, meaning: "الشمس" },
  { id: 92, name: "الليل", nameEn: "Al-Layl", revelation: "مكية", ayahCount: 21, juz: 30, meaning: "الليل" },
  { id: 93, name: "الضحى", nameEn: "Ad-Duha", revelation: "مكية", ayahCount: 11, juz: 30, meaning: "الضحى" },
  { id: 94, name: "الشرح", nameEn: "Ash-Sharh", revelation: "مكية", ayahCount: 8, juz: 30, meaning: "ألم نشرح" },
  { id: 95, name: "التين", nameEn: "At-Tin", revelation: "مكية", ayahCount: 8, juz: 30, meaning: "التين" },
  { id: 96, name: "العلق", nameEn: "Al-Alaq", revelation: "مكية", ayahCount: 19, juz: 30, meaning: "اقرأ" },
  { id: 97, name: "القدر", nameEn: "Al-Qadr", revelation: "مكية", ayahCount: 5, juz: 30, meaning: "ليلة القدر" },
  { id: 98, name: "البينة", nameEn: "Al-Bayyina", revelation: "مدنية", ayahCount: 8, juz: 30, meaning: "البينة" },
  { id: 99, name: "الزلزلة", nameEn: "Az-Zalzala", revelation: "مدنية", ayahCount: 8, juz: 30, meaning: "الزلزلة" },
  { id: 100, name: "العاديات", nameEn: "Al-Adiyat", revelation: "مكية", ayahCount: 11, juz: 30, meaning: "العاديات" },
  { id: 101, name: "القارعة", nameEn: "Al-Qaria", revelation: "مكية", ayahCount: 11, juz: 30, meaning: "القارعة" },
  { id: 102, name: "التكاثر", nameEn: "At-Takathur", revelation: "مكية", ayahCount: 8, juz: 30, meaning: "التكاثر" },
  { id: 103, name: "العصر", nameEn: "Al-Asr", revelation: "مكية", ayahCount: 3, juz: 30, meaning: "العصر" },
  { id: 104, name: "الهمزة", nameEn: "Al-Humaza", revelation: "مكية", ayahCount: 9, juz: 30, meaning: "الهمزة" },
  { id: 105, name: "الفيل", nameEn: "Al-Fil", revelation: "مكية", ayahCount: 5, juz: 30, meaning: "الفيل" },
  { id: 106, name: "قريش", nameEn: "Quraysh", revelation: "مكية", ayahCount: 4, juz: 30, meaning: "قريش" },
  { id: 107, name: "الماعون", nameEn: "Al-Maun", revelation: "مكية", ayahCount: 7, juz: 30, meaning: "الماعون" },
  { id: 108, name: "الكوثر", nameEn: "Al-Kawthar", revelation: "مكية", ayahCount: 3, juz: 30, meaning: "نهر الجنة" },
  { id: 109, name: "الكافرون", nameEn: "Al-Kafirun", revelation: "مكية", ayahCount: 6, juz: 30, meaning: "الكافرون" },
  { id: 110, name: "النصر", nameEn: "An-Nasr", revelation: "مدنية", ayahCount: 3, juz: 30, meaning: "نصر الله" },
  { id: 111, name: "المسد", nameEn: "Al-Masad", revelation: "مكية", ayahCount: 5, juz: 30, meaning: "أبو لهب" },
  { id: 112, name: "الإخلاص", nameEn: "Al-Ikhlas", revelation: "مكية", ayahCount: 4, juz: 30, meaning: "ثلث القرآن" },
  { id: 113, name: "الفلق", nameEn: "Al-Falaq", revelation: "مكية", ayahCount: 5, juz: 30, meaning: "المعوذتان" },
  { id: 114, name: "الناس", nameEn: "An-Nas", revelation: "مكية", ayahCount: 6, juz: 30, meaning: "المعوذتان" },
];

export const DAILY_AYAHS: DailyAyah[] = [
  {
    arabic: "إِنَّ هَٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ",
    surah: "الإسراء",
    ayahNum: 9,
    tafsir: "إن القرآن الكريم يرشد الناس إلى أعدل الطرق وأقومها وأصوبها في الاعتقاد والعمل والسلوك — فهو دستور الحياة الكاملة.",
    memorize: "احفظ هذه الآية اليوم وكررها ٣ مرات",
  },
  {
    arabic: "وَنُنَزِّلُ مِنَ الْقُرْآنِ مَا هُوَ شِفَاءٌ وَرَحْمَةٌ لِّلْمُؤْمِنِينَ",
    surah: "الإسراء",
    ayahNum: 82,
    tafsir: "القرآن شفاء للقلوب من الشك والنفاق، وشفاء للأجساد بالرقية، ورحمة لمن آمن به وعمل بأحكامه.",
    memorize: "رددها عند قراءة القرآن",
  },
  {
    arabic: "كِتَابٌ أَنزَلْنَاهُ إِلَيْكَ مُبَارَكٌ لِّيَدَّبَّرُوا آيَاتِهِ",
    surah: "ص",
    ayahNum: 29,
    tafsir: "أنزلنا هذا القرآن المبارك ليتأمل الناس آياته ويفهموا معانيها — والغاية الكبرى من الإنزال هي التدبر لا مجرد التلاوة.",
    memorize: "تأمل آية من القرآن اليوم",
  },
  {
    arabic: "أَفَلَا يَتَدَبَّرُونَ الْقُرْآنَ ۚ وَلَوْ كَانَ مِنْ عِندِ غَيْرِ اللَّهِ لَوَجَدُوا فِيهِ اخْتِلَافًا كَثِيرًا",
    surah: "النساء",
    ayahNum: 82,
    tafsir: "ألا يتأملون القرآن تأملاً عميقاً؟ لو كان من عند غير الله لوجدوا فيه تناقضات كثيرة — لكنه كلام الله فهو محكم متسق.",
    memorize: "هذه الآية دليل الإعجاز",
  },
];

export const MIRACLES: QuranMiracle[] = [
  {
    id: 1,
    title: "إعجاز عددي مذهل",
    icon: "🔢",
    category: "عددي",
    description: "تكررت كلمة «يوم» في القرآن ٣٦٥ مرة — عدد أيام السنة",
    detail: "الدنيا والآخرة ١١٥ مرة لكلٍّ منهما • الملائكة والشياطين ٨٨ مرة • الحياة والموت ١٤٥ مرة — توازن مستحيل في أي كتاب بشري",
    color: "from-violet-600/20 to-purple-400/5",
  },
  {
    id: 2,
    title: "إعجاز علمي كوني",
    icon: "🌌",
    category: "علمي",
    description: "وصف القرآن توسع الكون قبل ١٤٠٠ سنة من اكتشافه",
    detail: "﴿وَالسَّمَاءَ بَنَيْنَاهَا بِأَيْدٍ وَإِنَّا لَمُوسِعُونَ﴾ — الذاريات: ٤٧. اكتشف العلماء عام ١٩٢٩ أن الكون يتوسع. القرآن أخبرنا بهذا قبل ١٤ قرناً.",
    color: "from-blue-600/20 to-sky-400/5",
  },
  {
    id: 3,
    title: "إعجاز بيولوجي دقيق",
    icon: "🧬",
    category: "علمي",
    description: "وصف مراحل خلق الجنين بدقة لم يعرفها العلم إلا حديثاً",
    detail: "﴿وَلَقَدْ خَلَقْنَا الْإِنسَانَ مِن سُلَالَةٍ مِّن طِينٍ﴾ — ثم العلقة والمضغة والعظام. قال الدكتور كيث مور: «لم يكن ممكناً وصف هذا بدون مجهر متطور».",
    color: "from-emerald-600/20 to-teal-400/5",
  },
  {
    id: 4,
    title: "إعجاز بحري أسرار",
    icon: "🌊",
    category: "علمي",
    description: "ذكر وجود حواجز بين البحار اكتُشفت حديثاً",
    detail: "﴿مَرَجَ الْبَحْرَيْنِ يَلْتَقِيَانِ * بَيْنَهُمَا بَرْزَخٌ لَّا يَبْغِيَانِ﴾ — الرحمن. اكتشف العلماء وجود حواجز سطحية وعمقية تفصل البحار. الإنسان لم يعرف ذلك إلا بعد اختراع الغواصات.",
    color: "from-cyan-600/20 to-blue-400/5",
  },
  {
    id: 5,
    title: "الإعجاز اللغوي الفريد",
    icon: "📖",
    category: "لغوي",
    description: "تحدى القرآن البشر أن يأتوا بمثله منذ ١٤ قرناً — والتحدي قائم",
    detail: "﴿قُل لَّئِنِ اجْتَمَعَتِ الْإِنسُ وَالْجِنُّ عَلَىٰ أَن يَأْتُوا بِمِثْلِ هَٰذَا الْقُرْآنِ لَا يَأْتُونَ بِمِثْلِهِ﴾. بعد ١٤ قرناً من الزمن ولم يستطع أحد — لا شعراء العرب ولا أدباء العالم.",
    color: "from-amber-600/20 to-yellow-400/5",
  },
  {
    id: 6,
    title: "حفظ إلهي ضامن",
    icon: "🛡️",
    category: "تاريخي",
    description: "الوحيد في التاريخ المحفوظ حرفاً بحرف منذ نزوله",
    detail: "﴿إِنَّا نَحْنُ نَزَّلْنَا الذِّكْرَ وَإِنَّا لَهُ لَحَافِظُونَ﴾ — الحجر: ٩. أكثر من مليار مسلم يحفظونه عن ظهر قلب. أي تحريف في أي نسخة يُكتشف فوراً من قِبل الحافظين.",
    color: "from-rose-600/20 to-pink-400/5",
  },
];

export const SCIENCES: QuranScience[] = [
  { id: 1, title: "علم التفسير", icon: "📚", description: "شرح معاني القرآن وبيان مراد الله من كلامه", gradient: "from-emerald-500/15 to-teal-400/5", border: "border-emerald-400/30", route: "/quran/tafsir" },
  { id: 2, title: "علم التجويد", icon: "🎙️", description: "إتقان النطق وأحكام تلاوة القرآن الكريم", gradient: "from-blue-500/15 to-sky-400/5", border: "border-blue-400/30", route: "/quran/tajweed" },
  { id: 3, title: "علم أسباب النزول", icon: "⚡", description: "القصص والأحداث التي نزلت فيها الآيات الكريمة", gradient: "from-amber-500/15 to-yellow-400/5", border: "border-amber-400/30", route: "/quran/asbab" },
  { id: 4, title: "علم الناسخ والمنسوخ", icon: "🔄", description: "فهم تطور الأحكام الشرعية في القرآن الكريم", gradient: "from-violet-500/15 to-purple-400/5", border: "border-violet-400/30", route: "/quran/naskh" },
  { id: 5, title: "علم القراءات", icon: "🌐", description: "الروايات والقراءات المتواترة للقرآن الكريم", gradient: "from-rose-500/15 to-pink-400/5", border: "border-rose-400/30", route: "/quran/qiraat" },
  { id: 6, title: "إعجاز القرآن", icon: "✨", description: "الوجوه الإعجازية العلمية والأدبية والتشريعية", gradient: "from-cyan-500/15 to-blue-400/5", border: "border-cyan-400/30", route: "/quran/miracles" },
];

export const VIRTUES = [
  { icon: "👑", text: "خيركم من تعلّم القرآن وعلّمه", source: "البخاري" },
  { icon: "🌟", text: "الماهر بالقرآن مع السفرة الكرام البررة", source: "مسلم" },
  { icon: "💎", text: "اقرأ القرآن فإنه يأتي شفيعاً لأصحابه يوم القيامة", source: "مسلم" },
  { icon: "🔥", text: "من قرأ حرفاً من كتاب الله فله حسنة والحسنة بعشر أمثالها", source: "الترمذي" },
  { icon: "🏠", text: "البيت الذي يُقرأ فيه القرآن يتسع على أهله وتحضره الملائكة", source: "أحمد" },
  { icon: "💫", text: "يُقال لصاحب القرآن اقرأ وارتقِ ورتّل كما كنت ترتّل في الدنيا", source: "أبو داود" },
];

// ─── Reading Tracker constants ───────────────────────────────────────────────

export const WIRD_TARGET = 5;
export const MUSHAF_PAGES = 604;

export const SURAH_PAGE_MAP: [number, string][] = [
  [1,"الفاتحة"],[2,"البقرة"],[50,"آل عمران"],[77,"النساء"],[106,"المائدة"],
  [128,"الأنعام"],[151,"الأعراف"],[177,"الأنفال"],[187,"التوبة"],[208,"يونس"],
  [221,"هود"],[235,"يوسف"],[249,"الرعد"],[255,"إبراهيم"],[262,"الحجر"],
  [267,"النحل"],[282,"الإسراء"],[293,"الكهف"],[305,"مريم"],[312,"طه"],
  [322,"الأنبياء"],[333,"الحج"],[342,"المؤمنون"],[350,"النور"],[359,"الفرقان"],
  [367,"الشعراء"],[377,"النمل"],[385,"القصص"],[396,"العنكبوت"],[404,"الروم"],
  [411,"لقمان"],[415,"السجدة"],[418,"الأحزاب"],[428,"سبأ"],[434,"فاطر"],
  [440,"يس"],[446,"الصافات"],[453,"ص"],[458,"الزمر"],[467,"غافر"],
  [477,"فصلت"],[483,"الشورى"],[489,"الزخرف"],[496,"الدخان"],[499,"الجاثية"],
  [502,"الأحقاف"],[507,"محمد"],[511,"الفتح"],[515,"الحجرات"],[518,"ق"],
  [520,"الذاريات"],[523,"الطور"],[526,"النجم"],[528,"القمر"],[531,"الرحمن"],
  [534,"الواقعة"],[537,"الحديد"],[542,"المجادلة"],[545,"الحشر"],[549,"الممتحنة"],
  [551,"الصف"],[553,"الجمعة"],[554,"المنافقون"],[556,"التغابن"],[558,"الطلاق"],
  [560,"التحريم"],[562,"الملك"],[564,"القلم"],[566,"الحاقة"],[568,"المعارج"],
  [570,"نوح"],[572,"الجن"],[574,"المزمل"],[575,"المدثر"],[577,"القيامة"],
  [578,"الإنسان"],[580,"المرسلات"],[582,"النبأ"],[583,"النازعات"],[585,"عبس"],
  [586,"التكوير"],[587,"الانفطار"],[587,"المطففين"],[589,"الانشقاق"],[590,"البروج"],
  [591,"الطارق"],[591,"الأعلى"],[592,"الغاشية"],[593,"الفجر"],[594,"البلد"],
  [595,"الشمس"],[595,"الليل"],[596,"الضحى"],[596,"الشرح"],[597,"التين"],
  [597,"العلق"],[598,"القدر"],[598,"البينة"],[599,"الزلزلة"],[599,"العاديات"],
  [600,"القارعة"],[600,"التكاثر"],[601,"العصر"],[601,"الهمزة"],[601,"الفيل"],
  [602,"قريش"],[602,"الماعون"],[602,"الكوثر"],[603,"الكافرون"],[603,"النصر"],
  [603,"المسد"],[604,"الإخلاص"],[604,"الفلق"],[604,"الناس"],
];

export function getSurahForPage(page: number): string {
  let result = "الفاتحة";
  for (const [startPage, name] of SURAH_PAGE_MAP) {
    if (page >= startPage) result = name;
    else break;
  }
  return result;
}

export function todayDateStr(): string {
  return new Date().toISOString().split("T")[0]!;
}
