import { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, Pressable, ScrollView, TextInput, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
  FadeIn, FadeInDown,
} from "react-native-reanimated";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import {
  ChevronLeft, ChevronRight, Play, Pause, Eye, EyeOff,
  Check, X, RotateCcw, Search, Star,
} from "lucide-react-native";
import { useColors } from "@/hooks/useColors";
import { useSettings } from "@/providers/SettingsProvider";
import { PageHeader } from "@/components/shared/PageHeader";

const ALQURAN_API = "https://api.alquran.cloud/v1";
const CDN_AUDIO = "https://cdn.islamic.network/quran/audio/128/ar.alafasy";

const SURAH_LENGTHS = [7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6];

function toGlobal(surah: number, ayah: number): number {
  let c = 0;
  for (let i = 0; i < surah - 1; i++) c += SURAH_LENGTHS[i] ?? 0;
  return c + ayah;
}

const TO_AR = ["٠","١","٢","٣","٤","٥","٦","٧","٨","٩"];
function toEA(n: number) { return String(n).split("").map(d => TO_AR[parseInt(d)] ?? d).join(""); }

interface SurahInfo {
  id: number; name: string; nameEn: string; ayahCount: number; juz: number; revelation: string;
}

const SHORT_SURAHS: SurahInfo[] = [
  { id:1,  name:"الفاتحة",  nameEn:"Al-Fatiha",    ayahCount:7,  juz:1,  revelation:"مكية"  },
  { id:36, name:"يس",       nameEn:"Ya-Sin",       ayahCount:83, juz:22, revelation:"مكية"  },
  { id:55, name:"الرحمن",   nameEn:"Ar-Rahman",    ayahCount:78, juz:27, revelation:"مدنية" },
  { id:56, name:"الواقعة",  nameEn:"Al-Waqia",     ayahCount:96, juz:27, revelation:"مكية"  },
  { id:67, name:"الملك",    nameEn:"Al-Mulk",      ayahCount:30, juz:29, revelation:"مكية"  },
  { id:73, name:"المزمل",   nameEn:"Al-Muzzammil", ayahCount:20, juz:29, revelation:"مكية"  },
  { id:78, name:"النبأ",    nameEn:"An-Naba",      ayahCount:40, juz:30, revelation:"مكية"  },
  { id:87, name:"الأعلى",   nameEn:"Al-Ala",       ayahCount:19, juz:30, revelation:"مكية"  },
  { id:93, name:"الضحى",    nameEn:"Ad-Duha",      ayahCount:11, juz:30, revelation:"مكية"  },
  { id:94, name:"الشرح",    nameEn:"Ash-Sharh",    ayahCount:8,  juz:30, revelation:"مكية"  },
  { id:97, name:"القدر",    nameEn:"Al-Qadr",      ayahCount:5,  juz:30, revelation:"مكية"  },
  { id:103,name:"العصر",    nameEn:"Al-Asr",       ayahCount:3,  juz:30, revelation:"مكية"  },
  { id:108,name:"الكوثر",   nameEn:"Al-Kawthar",   ayahCount:3,  juz:30, revelation:"مكية"  },
  { id:112,name:"الإخلاص",  nameEn:"Al-Ikhlas",    ayahCount:4,  juz:30, revelation:"مكية"  },
  { id:113,name:"الفلق",    nameEn:"Al-Falaq",     ayahCount:5,  juz:30, revelation:"مكية"  },
  { id:114,name:"الناس",    nameEn:"An-Nas",       ayahCount:6,  juz:30, revelation:"مكية"  },
];

type Mode = "listen" | "cover" | "test";
interface Ayah { numberInSurah: number; text: string; }

function MemorizeSession({ surah, onBack }: { surah: SurahInfo; onBack: () => void }) {
  const c = useColors();
  const { language } = useSettings();
  const isRTL = language === "ar";
  const isDark = c.isDark;

  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>("listen");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showText, setShowText] = useState(true);
  const [testInput, setTestInput] = useState("");
  const [testResult, setTestResult] = useState<"correct" | "wrong" | null>(null);
  const [memorized, setMemorized] = useState<Set<number>>(new Set());
  const [score, setScore] = useState({ correct: 0, wrong: 0 });
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${ALQURAN_API}/surah/${surah.id}/quran-uthmani`)
      .then(r => r.json())
      .then(data => { if (data.code === 200) setAyahs(data.data.ayahs); })
      .catch(() => setError("تعذّر تحميل السورة"))
      .finally(() => setLoading(false));
  }, [surah.id]);

  useEffect(() => {
    return () => { soundRef.current?.unloadAsync(); };
  }, []);

  const playAyah = useCallback(async (idx: number) => {
    const ayah = ayahs[idx];
    if (!ayah) return;
    try {
      await soundRef.current?.unloadAsync();
      soundRef.current = null;
      const globalNum = toGlobal(surah.id, ayah.numberInSurah);
      const url = `${CDN_AUDIO}/${globalNum}.mp3`;
      const { sound } = await Audio.Sound.createAsync({ uri: url }, { shouldPlay: true });
      soundRef.current = sound;
      setIsPlaying(true);
      sound.setOnPlaybackStatusUpdate(status => {
        if ((status as any).didJustFinish) setIsPlaying(false);
      });
    } catch { setIsPlaying(false); }
  }, [ayahs, surah.id]);

  const stopAudio = useCallback(async () => {
    await soundRef.current?.stopAsync();
    setIsPlaying(false);
  }, []);

  const currentAyah = ayahs[currentIdx];
  const progress = ayahs.length > 0 ? (currentIdx / ayahs.length) * 100 : 0;

  const checkAnswer = () => {
    if (!currentAyah) return;
    const normalize = (s: string) => s.replace(/[\u064B-\u065F\u0610-\u061A\u06D6-\u06ED]/g, "").replace(/\s+/g, " ").trim();
    const correct = normalize(testInput) === normalize(currentAyah.text);
    setTestResult(correct ? "correct" : "wrong");
    if (correct) {
      setScore(s => ({ ...s, correct: s.correct + 1 }));
      setMemorized(prev => new Set([...prev, currentIdx]));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      setScore(s => ({ ...s, wrong: s.wrong + 1 }));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const nextAyah = () => {
    setTestInput(""); setTestResult(null); setShowText(true);
    stopAudio();
    if (currentIdx < ayahs.length - 1) setCurrentIdx(currentIdx + 1);
    else setCurrentIdx(0);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const MODES: { id: Mode; labelAr: string }[] = [
    { id: "listen", labelAr: "استمع وردد" },
    { id: "cover",  labelAr: "غطِّ وتذكر" },
    { id: "test",   labelAr: "اختبر نفسك" },
  ];

  const gold = "#F59E0B";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={["top"]}>
      <View style={{
        flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center",
        paddingHorizontal: 16, paddingVertical: 12,
        borderBottomWidth: 1, borderBottomColor: `${gold}1A`,
      }}>
        <Pressable onPress={onBack} style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)", alignItems: "center", justifyContent: "center" }}>
          {isRTL ? <ChevronRight size={18} color={c.textSecondary} /> : <ChevronLeft size={18} color={c.textSecondary} />}
        </Pressable>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={{ fontSize: 16, fontWeight: "800", color: gold, fontFamily: "Amiri_400Regular" }}>سورة {surah.name}</Text>
          <Text style={{ fontSize: 10, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular", marginTop: 1 }}>{surah.ayahCount} آية</Text>
        </View>
        <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: `${gold}1A` }}>
          <Text style={{ fontSize: 10, color: gold, fontWeight: "700", fontFamily: "IBMPlexSansArabic_700Bold" }}>{memorized.size}/{surah.ayahCount}</Text>
        </View>
      </View>

      <View style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
        <View style={{ flexDirection: isRTL ? "row-reverse" : "row", gap: 6, padding: 4, borderRadius: 14, backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", borderWidth: 1, borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }}>
          {MODES.map(m => (
            <Pressable key={m.id} onPress={() => { setMode(m.id); setCurrentIdx(0); setTestInput(""); setTestResult(null); Haptics.selectionAsync(); }}
              style={{ flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: "center", backgroundColor: mode === m.id ? `${gold}20` : "transparent", borderWidth: 1, borderColor: mode === m.id ? `${gold}40` : "transparent" }}>
              <Text style={{ fontSize: 10, fontWeight: "800", color: mode === m.id ? gold : c.textMuted, fontFamily: "IBMPlexSansArabic_700Bold" }}>{m.labelAr}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
        <View style={{ height: 4, borderRadius: 4, backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)", overflow: "hidden" }}>
          <Animated.View style={{ height: "100%", borderRadius: 4, backgroundColor: gold, width: `${progress}%` }} />
        </View>
        <Text style={{ fontSize: 10, color: c.textMuted, marginTop: 4, textAlign: isRTL ? "right" : "left", fontFamily: "IBMPlexSansArabic_400Regular" }}>
          آية {toEA(currentIdx + 1)} من {toEA(surah.ayahCount)}
        </Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={gold} />
        </View>
      ) : error ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
          <Text style={{ color: "#ef4444", textAlign: "center", fontFamily: "IBMPlexSansArabic_400Regular" }}>{error}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <View style={{ padding: 20, borderRadius: 20, backgroundColor: `${gold}08`, borderWidth: 1, borderColor: `${gold}25`, marginBottom: 14, minHeight: 140, alignItems: "center", justifyContent: "center" }}>
            {currentAyah && (
              <>
                {mode === "cover" ? (
                  <>
                    <Text style={{ fontSize: 22, fontFamily: "Amiri_400Regular", color: showText ? c.text : "transparent", textAlign: "center", lineHeight: 44,
                      backgroundColor: showText ? "transparent" : (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"), borderRadius: 8, paddingHorizontal: 8 }}>
                      {currentAyah.text}
                    </Text>
                    <Text style={{ fontSize: 13, color: `${gold}AA`, marginTop: 8, fontFamily: "Amiri_400Regular" }}>﴿{toEA(currentAyah.numberInSurah)}﴾</Text>
                  </>
                ) : mode === "test" ? (
                  testResult ? (
                    <>
                      <Text style={{ fontSize: 22, fontFamily: "Amiri_400Regular", color: testResult === "correct" ? "#10b981" : c.text, textAlign: "center", lineHeight: 44 }}>{currentAyah.text}</Text>
                      {testResult === "wrong" && testInput ? (
                        <Text style={{ fontSize: 12, color: "#ef4444", marginTop: 6, fontFamily: "IBMPlexSansArabic_400Regular" }}>إجابتك: {testInput}</Text>
                      ) : null}
                    </>
                  ) : (
                    <TextInput
                      value={testInput}
                      onChangeText={setTestInput}
                      placeholder="اكتب الآية من الذاكرة..."
                      placeholderTextColor={c.textMuted}
                      multiline
                      style={{ width: "100%", minHeight: 100, fontSize: 20, fontFamily: "Amiri_400Regular", color: c.text, textAlign: "center", lineHeight: 44, borderWidth: 1, borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", borderRadius: 14, padding: 12 }}
                    />
                  )
                ) : (
                  <>
                    <Text style={{ fontSize: 22, fontFamily: "Amiri_400Regular", color: c.text, textAlign: "center", lineHeight: 44 }}>{currentAyah.text}</Text>
                    <Text style={{ fontSize: 13, color: `${gold}AA`, marginTop: 8, fontFamily: "Amiri_400Regular" }}>﴿{toEA(currentAyah.numberInSurah)}﴾</Text>
                  </>
                )}
              </>
            )}
          </View>

          {mode === "test" && testResult && (
            <Animated.View entering={FadeIn.duration(300)} style={{ padding: 14, borderRadius: 14, alignItems: "center", marginBottom: 14,
              backgroundColor: testResult === "correct" ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
              borderWidth: 1, borderColor: testResult === "correct" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)" }}>
              <Text style={{ fontWeight: "800", fontSize: 14, color: testResult === "correct" ? "#10b981" : "#ef4444", fontFamily: "IBMPlexSansArabic_700Bold" }}>
                {testResult === "correct" ? "✓ أحسنت! حفظت هذه الآية" : "✗ حاول مرة أخرى"}
              </Text>
            </Animated.View>
          )}

          {mode === "test" && (score.correct + score.wrong > 0) && (
            <View style={{ flexDirection: isRTL ? "row-reverse" : "row", gap: 10, marginBottom: 14 }}>
              <View style={{ flex: 1, padding: 12, borderRadius: 14, alignItems: "center", backgroundColor: "rgba(16,185,129,0.08)", borderWidth: 1, borderColor: "rgba(16,185,129,0.2)" }}>
                <Text style={{ fontSize: 18, fontWeight: "800", color: "#10b981" }}>{toEA(score.correct)}</Text>
                <Text style={{ fontSize: 10, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }}>صحيح</Text>
              </View>
              <View style={{ flex: 1, padding: 12, borderRadius: 14, alignItems: "center", backgroundColor: "rgba(239,68,68,0.08)", borderWidth: 1, borderColor: "rgba(239,68,68,0.2)" }}>
                <Text style={{ fontSize: 18, fontWeight: "800", color: "#ef4444" }}>{toEA(score.wrong)}</Text>
                <Text style={{ fontSize: 10, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }}>خطأ</Text>
              </View>
            </View>
          )}

          <View style={{ flexDirection: isRTL ? "row-reverse" : "row", gap: 10, marginBottom: 16 }}>
            {mode === "listen" && (
              <Pressable onPress={() => isPlaying ? stopAudio() : playAyah(currentIdx)} style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 14, backgroundColor: gold }}>
                {isPlaying ? <Pause size={16} color="#1a0e00" /> : <Play size={16} color="#1a0e00" />}
                <Text style={{ fontWeight: "800", fontSize: 13, color: "#1a0e00", fontFamily: "IBMPlexSansArabic_700Bold" }}>{isPlaying ? "إيقاف" : "استمع للآية"}</Text>
              </Pressable>
            )}
            {mode === "cover" && (
              <>
                <Pressable onPress={() => { setShowText(s => !s); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                  style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 14, backgroundColor: `${gold}14`, borderWidth: 1, borderColor: `${gold}30` }}>
                  {showText ? <EyeOff size={15} color={gold} /> : <Eye size={15} color={gold} />}
                  <Text style={{ fontWeight: "800", fontSize: 13, color: gold, fontFamily: "IBMPlexSansArabic_700Bold" }}>{showText ? "غطِّ الآية" : "اكشف"}</Text>
                </Pressable>
                <Pressable onPress={() => isPlaying ? stopAudio() : playAyah(currentIdx)}
                  style={{ width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: `${gold}14`, borderWidth: 1, borderColor: `${gold}25` }}>
                  {isPlaying ? <Pause size={16} color={gold} /> : <Play size={16} color={gold} />}
                </Pressable>
              </>
            )}
            {mode === "test" && !testResult && (
              <Pressable onPress={checkAnswer} disabled={!testInput.trim()}
                style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 14,
                  backgroundColor: testInput.trim() ? gold : (isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"),
                  opacity: testInput.trim() ? 1 : 0.5 }}>
                <Check size={16} color={testInput.trim() ? "#1a0e00" : c.textMuted} />
                <Text style={{ fontWeight: "800", fontSize: 13, color: testInput.trim() ? "#1a0e00" : c.textMuted, fontFamily: "IBMPlexSansArabic_700Bold" }}>تحقق</Text>
              </Pressable>
            )}
            {(mode !== "test" || testResult) && (
              <Pressable onPress={nextAyah}
                style={{ width: mode === "cover" ? 48 : (mode === "test" ? undefined : 48), flex: mode === "test" ? 1 : undefined, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", borderWidth: 1, borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)" }}>
                {currentIdx < ayahs.length - 1 ? <ChevronLeft size={16} color={c.textSecondary} /> : <RotateCcw size={16} color={c.textSecondary} />}
              </Pressable>
            )}
          </View>

          {memorized.size > 0 && (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
              {Array.from(memorized).sort((a, b) => a - b).map(idx => (
                <View key={idx} style={{ width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(16,185,129,0.15)", borderWidth: 1, borderColor: "rgba(16,185,129,0.3)" }}>
                  <Text style={{ fontSize: 10, color: c.primary, fontFamily: "Amiri_400Regular" }}>{toEA(idx + 1)}</Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

export default function QuranMemorizePage() {
  const router = useRouter();
  const c = useColors();
  const { language } = useSettings();
  const isRTL = language === "ar";
  const isDark = c.isDark;
  const [selected, setSelected] = useState<SurahInfo | null>(null);
  const [search, setSearch] = useState("");
  const filtered = SHORT_SURAHS.filter(s => s.name.includes(search) || s.nameEn.toLowerCase().includes(search.toLowerCase()));

  if (selected) return <MemorizeSession surah={selected} onBack={() => setSelected(null)} />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={["top"]}>
      <PageHeader titleAr="حفظ القرآن" subtitleAr="اختر سورة للبدء" />

      <View style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
        <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", borderWidth: 1, borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)" }}>
          <Search size={14} color={c.textMuted} />
          <TextInput value={search} onChangeText={setSearch} placeholder="ابحث عن سورة..." placeholderTextColor={c.textMuted}
            style={{ flex: 1, fontSize: 14, color: c.text, fontFamily: "IBMPlexSansArabic_400Regular", textAlign: isRTL ? "right" : "left" }} />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={{ gap: 8 }}>
          {filtered.map((s, i) => (
            <Animated.View key={s.id} entering={FadeInDown.delay(i * 30).springify()}>
              <Pressable onPress={() => { setSelected(s); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 16,
                  backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", borderWidth: 1, borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }}>
                <View style={{ width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(245,158,11,0.1)", borderWidth: 1, borderColor: "rgba(245,158,11,0.2)" }}>
                  <Text style={{ fontSize: 13, fontWeight: "800", color: "#F59E0B", fontFamily: "Amiri_400Regular" }}>{toEA(s.id)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: "800", color: c.text, fontFamily: "Amiri_400Regular" }}>{s.name}</Text>
                  <Text style={{ fontSize: 11, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular", marginTop: 2 }}>{s.nameEn} · {s.ayahCount} آية · {s.revelation}</Text>
                </View>
                <Star size={14} color={c.textMuted} />
              </Pressable>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
