import { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, Pressable, ScrollView, TextInput, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { Search, Play, Pause, BookOpen } from "lucide-react-native";
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

interface SurahInfo { id: number; name: string; nameEn: string; ayahCount: number; juz: number; revelation: string; }
interface AyahData { numberInSurah: number; text: string; }

const SURAHS: SurahInfo[] = [
  { id:1,  name:"الفاتحة",  nameEn:"Al-Fatiha",   ayahCount:7,   juz:1,  revelation:"مكية"  },
  { id:2,  name:"البقرة",   nameEn:"Al-Baqara",   ayahCount:286, juz:1,  revelation:"مدنية" },
  { id:3,  name:"آل عمران", nameEn:"Aal Imran",   ayahCount:200, juz:3,  revelation:"مدنية" },
  { id:4,  name:"النساء",   nameEn:"An-Nisa",     ayahCount:176, juz:4,  revelation:"مدنية" },
  { id:5,  name:"المائدة",  nameEn:"Al-Maida",    ayahCount:120, juz:6,  revelation:"مدنية" },
  { id:6,  name:"الأنعام",  nameEn:"Al-Anam",     ayahCount:165, juz:7,  revelation:"مكية"  },
  { id:18, name:"الكهف",    nameEn:"Al-Kahf",     ayahCount:110, juz:15, revelation:"مكية"  },
  { id:19, name:"مريم",     nameEn:"Maryam",      ayahCount:98,  juz:16, revelation:"مكية"  },
  { id:36, name:"يس",       nameEn:"Ya-Sin",      ayahCount:83,  juz:22, revelation:"مكية"  },
  { id:55, name:"الرحمن",   nameEn:"Ar-Rahman",   ayahCount:78,  juz:27, revelation:"مدنية" },
  { id:67, name:"الملك",    nameEn:"Al-Mulk",     ayahCount:30,  juz:29, revelation:"مكية"  },
  { id:78, name:"النبأ",    nameEn:"An-Naba",     ayahCount:40,  juz:30, revelation:"مكية"  },
  { id:93, name:"الضحى",    nameEn:"Ad-Duha",     ayahCount:11,  juz:30, revelation:"مكية"  },
  { id:97, name:"القدر",    nameEn:"Al-Qadr",     ayahCount:5,   juz:30, revelation:"مكية"  },
  { id:112,name:"الإخلاص",  nameEn:"Al-Ikhlas",   ayahCount:4,   juz:30, revelation:"مكية"  },
  { id:113,name:"الفلق",    nameEn:"Al-Falaq",    ayahCount:5,   juz:30, revelation:"مكية"  },
  { id:114,name:"الناس",    nameEn:"An-Nas",      ayahCount:6,   juz:30, revelation:"مكية"  },
];

const purple = "#8B5CF6";

function TafsirReader({ surah, onBack }: { surah: SurahInfo; onBack: () => void }) {
  const c = useColors();
  const { language } = useSettings();
  const isRTL = language === "ar";
  const isDark = c.isDark;

  const [ayahs, setAyahs] = useState<AyahData[]>([]);
  const [tafsirAyahs, setTafsirAyahs] = useState<AyahData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNum, setSelectedNum] = useState<number | null>(null);
  const [playingNum, setPlayingNum] = useState<number | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${ALQURAN_API}/surah/${surah.id}/quran-uthmani`).then(r => r.json()),
      fetch(`${ALQURAN_API}/surah/${surah.id}/ar.muyassar`).then(r => r.json()),
    ]).then(([main, tafsir]) => {
      if (main.code === 200) setAyahs(main.data.ayahs);
      if (tafsir.code === 200) setTafsirAyahs(tafsir.data.ayahs);
    }).catch(() => setError("تعذّر تحميل السورة")).finally(() => setLoading(false));
  }, [surah.id]);

  useEffect(() => () => { soundRef.current?.unloadAsync(); }, []);

  const playAyah = useCallback(async (num: number) => {
    try {
      await soundRef.current?.unloadAsync();
      soundRef.current = null;
      const globalNum = toGlobal(surah.id, num);
      const { sound } = await Audio.Sound.createAsync({ uri: `${CDN_AUDIO}/${globalNum}.mp3` }, { shouldPlay: true });
      soundRef.current = sound;
      setPlayingNum(num);
      sound.setOnPlaybackStatusUpdate(status => { if ((status as any).didJustFinish) setPlayingNum(null); });
    } catch { setPlayingNum(null); }
  }, [surah.id]);

  const stopAudio = useCallback(async () => {
    await soundRef.current?.stopAsync();
    setPlayingNum(null);
  }, []);

  const tafsirFor = (num: number) => tafsirAyahs.find(a => a.numberInSurah === num);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={["top"]}>
      <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: `${purple}1A` }}>
        <Pressable onPress={onBack} style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)", alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: purple, fontSize: 18, fontWeight: "700" }}>←</Text>
        </Pressable>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={{ fontSize: 16, fontWeight: "800", color: purple, fontFamily: "Amiri_400Regular" }}>سورة {surah.name}</Text>
          <Text style={{ fontSize: 10, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular", marginTop: 1 }}>{surah.ayahCount} آية · انقر آية لعرض التفسير</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={purple} />
        </View>
      ) : error ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
          <Text style={{ color: "#ef4444", textAlign: "center", fontFamily: "IBMPlexSansArabic_400Regular" }}>{error}</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingVertical: 8, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          {surah.id !== 1 && surah.id !== 9 && (
            <Text style={{ fontSize: 20, fontFamily: "Amiri_400Regular", color: `${purple}CC`, textAlign: "center", paddingVertical: 16, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: `${purple}14`, marginBottom: 8 }}>
              بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </Text>
          )}

          {ayahs.map(ayah => {
            const isSelected = selectedNum === ayah.numberInSurah;
            const isPlaying = playingNum === ayah.numberInSurah;
            const tafsir = tafsirFor(ayah.numberInSurah);

            return (
              <View key={ayah.numberInSurah} style={{ marginHorizontal: 12, marginBottom: 4 }}>
                <Pressable onPress={() => { setSelectedNum(isSelected ? null : ayah.numberInSurah); stopAudio(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                  style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "flex-start", gap: 12, padding: 14, borderRadius: 14,
                    backgroundColor: isSelected ? `${purple}10` : (isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)"),
                    borderWidth: 1, borderColor: isSelected ? `${purple}35` : (isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)") }}>
                  <View style={{ width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: isSelected ? `${purple}25` : `${purple}10`, borderWidth: 1, borderColor: `${purple}25`, flexShrink: 0, marginTop: 4 }}>
                    <Text style={{ fontSize: 11, fontWeight: "800", color: purple, fontFamily: "Amiri_400Regular" }}>{toEA(ayah.numberInSurah)}</Text>
                  </View>
                  <Text style={{ flex: 1, fontSize: 19, fontFamily: "Amiri_400Regular", color: isSelected ? purple : c.text, lineHeight: 42, textAlign: isRTL ? "right" : "left" }}>
                    {ayah.text}
                  </Text>
                </Pressable>

                {isSelected && (
                  <Animated.View entering={FadeInDown.duration(200)} style={{ marginHorizontal: 4, marginBottom: 4, borderRadius: 14, padding: 14,
                    backgroundColor: `${purple}08`, borderWidth: 1, borderColor: `${purple}20` }}>
                    <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: `${purple}14`, marginBottom: 10 }}>
                      <Pressable onPress={() => isPlaying ? stopAudio() : playAyah(ayah.numberInSurah)}
                        style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: `${purple}15`, borderWidth: 1, borderColor: `${purple}25` }}>
                        {isPlaying ? <Pause size={12} color={purple} /> : <Play size={12} color={purple} />}
                        <Text style={{ fontSize: 11, fontWeight: "700", color: purple, fontFamily: "IBMPlexSansArabic_700Bold" }}>{isPlaying ? "إيقاف" : "استمع"}</Text>
                      </Pressable>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                        <BookOpen size={11} color={purple} />
                        <Text style={{ fontSize: 10, fontWeight: "700", color: purple, fontFamily: "IBMPlexSansArabic_700Bold" }}>التفسير الميسّر</Text>
                      </View>
                    </View>
                    {tafsir ? (
                      <Text style={{ fontSize: 13, lineHeight: 26, color: isDark ? "rgba(255,255,255,0.8)" : "#374151", fontFamily: "IBMPlexSansArabic_400Regular", textAlign: isRTL ? "right" : "left" }}>
                        {tafsir.text}
                      </Text>
                    ) : (
                      <Text style={{ fontSize: 12, color: c.textMuted, textAlign: "center", fontFamily: "IBMPlexSansArabic_400Regular" }}>التفسير غير متاح</Text>
                    )}
                  </Animated.View>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

export default function QuranTafsirPage() {
  const c = useColors();
  const { language } = useSettings();
  const isRTL = language === "ar";
  const isDark = c.isDark;
  const [selected, setSelected] = useState<SurahInfo | null>(null);
  const [search, setSearch] = useState("");
  const filtered = SURAHS.filter(s => s.name.includes(search) || s.nameEn.toLowerCase().includes(search.toLowerCase()));

  if (selected) return <TafsirReader surah={selected} onBack={() => setSelected(null)} />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={["top"]}>
      <PageHeader titleAr="التفسير التفاعلي" subtitleAr="انقر على أي آية للتفسير" />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 16, marginBottom: 14,
          backgroundColor: `${purple}0A`, borderWidth: 1, borderColor: `${purple}20` }}>
          <View style={{ width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: `${purple}15`, borderWidth: 1, borderColor: `${purple}25` }}>
            <BookOpen size={18} color={purple} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: "800", fontSize: 13, color: c.text, fontFamily: "IBMPlexSansArabic_700Bold" }}>التفسير الميسّر</Text>
            <Text style={{ fontSize: 11, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular", marginTop: 2 }}>انقر على أي آية لعرض تفسيرها والاستماع إليها</Text>
          </View>
        </View>

        <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, marginBottom: 14,
          backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", borderWidth: 1, borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)" }}>
          <Search size={14} color={c.textMuted} />
          <TextInput value={search} onChangeText={setSearch} placeholder="ابحث عن سورة..." placeholderTextColor={c.textMuted}
            style={{ flex: 1, fontSize: 14, color: c.text, fontFamily: "IBMPlexSansArabic_400Regular", textAlign: isRTL ? "right" : "left" }} />
        </View>

        <View style={{ gap: 8 }}>
          {filtered.map((s, i) => (
            <Animated.View key={s.id} entering={FadeInDown.delay(i * 25).springify()}>
              <Pressable onPress={() => { setSelected(s); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 16,
                  backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", borderWidth: 1, borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)" }}>
                <View style={{ width: 38, height: 38, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: `${purple}12`, borderWidth: 1, borderColor: `${purple}20` }}>
                  <Text style={{ fontSize: 12, fontWeight: "800", color: purple, fontFamily: "Amiri_400Regular" }}>{toEA(s.id)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "800", fontSize: 14, color: c.text, fontFamily: "Amiri_400Regular" }}>{s.name}</Text>
                  <Text style={{ fontSize: 10, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular", marginTop: 2 }}>{s.nameEn} · {s.ayahCount} آية · {s.revelation}</Text>
                </View>
                <BookOpen size={13} color={`${c.textMuted}66`} />
              </Pressable>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
