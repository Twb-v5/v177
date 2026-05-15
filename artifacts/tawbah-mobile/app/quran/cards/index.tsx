import { useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable, Dimensions, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeIn, FadeInDown,
  useSharedValue, useAnimatedStyle,
  withSpring, withTiming, interpolate,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { RotateCcw, ChevronLeft, ChevronRight, Check, X, Star, BookOpen, RefreshCw } from "lucide-react-native";
import { useColors } from "@/hooks/useColors";
import { useSettings } from "@/providers/SettingsProvider";
import { PageHeader } from "@/components/shared/PageHeader";
import { useSurahList } from "@/hooks/useQuranData";

const { width } = Dimensions.get("window");

interface FlashCard {
  id: string;
  front: string;
  back: string;
  surah: string;
  surahNum: number;
  ayahNum: number;
}

const SEED_CARDS: FlashCard[] = [
  { id: "1",  surahNum: 1,  ayahNum: 1,  surah: "الفاتحة",   front: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",           back: "بسم الله الرحمن الرحيم" },
  { id: "2",  surahNum: 2,  ayahNum: 255, surah: "البقرة",    front: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ", back: "آية الكرسي — أعظم آية في القرآن" },
  { id: "3",  surahNum: 36, ayahNum: 1,  surah: "يس",         front: "يس",                                               back: "قلب القرآن" },
  { id: "4",  surahNum: 112, ayahNum: 1, surah: "الإخلاص",    front: "قُلْ هُوَ اللَّهُ أَحَدٌ",                          back: "تعدل ثلث القرآن" },
  { id: "5",  surahNum: 67,  ayahNum: 1, surah: "الملك",      front: "تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ",              back: "الشافعة — تدرأ عذاب القبر" },
  { id: "6",  surahNum: 18,  ayahNum: 1, surah: "الكهف",      front: "الْحَمْدُ لِلَّهِ الَّذِي أَنزَلَ عَلَىٰ عَبْدِهِ الْكِتَابَ", back: "من قرأها يوم الجمعة نوره بين الجمعتين" },
  { id: "7",  surahNum: 55,  ayahNum: 1, surah: "الرحمن",     front: "الرَّحْمَٰنُ",                                      back: "علّم القرآن — عروس القرآن" },
  { id: "8",  surahNum: 56,  ayahNum: 1, surah: "الواقعة",    front: "إِذَا وَقَعَتِ الْوَاقِعَةُ",                       back: "من قرأها لم يصبه الفقر" },
];

function FlipCard({ card, isDark, c }: { card: FlashCard; isDark: boolean; c: ReturnType<typeof useColors> }) {
  const [flipped, setFlipped] = useState(false);
  const rot = useSharedValue(0);

  const frontAnim = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }, { rotateY: `${interpolate(rot.value, [0, 1], [0, 180])}deg` }],
    backfaceVisibility: "hidden",
    position: "absolute", inset: 0,
  }));
  const backAnim = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }, { rotateY: `${interpolate(rot.value, [0, 1], [180, 360])}deg` }],
    backfaceVisibility: "hidden",
    position: "absolute", inset: 0,
  }));

  const flip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!flipped) {
      rot.value = withSpring(1, { damping: 14, stiffness: 120 });
    } else {
      rot.value = withSpring(0, { damping: 14, stiffness: 120 });
    }
    setFlipped(f => !f);
  };

  return (
    <Pressable onPress={flip} style={{ width: width - 48, height: 240 }}>
      {/* Front */}
      <Animated.View style={[frontAnim, {
        borderRadius: 28,
        backgroundColor: isDark ? "rgba(14,14,14,0.98)" : "#fff",
        borderWidth: 2, borderColor: c.primaryGlow,
        alignItems: "center", justifyContent: "center", padding: 24,
        shadowColor: c.primary, shadowOpacity: 0.2, shadowRadius: 16, shadowOffset: { width: 0, height: 6 },
        elevation: 8,
      }]}>
        <View style={{ position: "absolute", inset: 0, backgroundColor: c.primaryGlow, opacity: 0.25, borderRadius: 26 }} />
        <View style={{ backgroundColor: isDark ? "rgba(16,185,129,0.15)" : "rgba(45,106,79,0.1)", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginBottom: 16 }}>
          <Text style={{ fontSize: 10, color: c.primary, fontWeight: "700", fontFamily: "IBMPlexSansArabic_700Bold" }}>{card.surah}</Text>
        </View>
        <Text style={{ fontSize: 20, color: c.text, fontFamily: "IBMPlexSansArabic_700Bold", textAlign: "center", lineHeight: 34 }}>
          {card.front}
        </Text>
        <Text style={{ fontSize: 10, color: c.textMuted, marginTop: 16, fontFamily: "IBMPlexSansArabic_400Regular" }}>اضغط للكشف</Text>
      </Animated.View>

      {/* Back */}
      <Animated.View style={[backAnim, {
        borderRadius: 28,
        backgroundColor: isDark ? "rgba(16,185,129,0.1)" : "rgba(45,106,79,0.06)",
        borderWidth: 2, borderColor: c.borderStrong,
        alignItems: "center", justifyContent: "center", padding: 24,
        shadowColor: c.primary, shadowOpacity: 0.15, shadowRadius: 14, shadowOffset: { width: 0, height: 6 },
        elevation: 8,
      }]}>
        <Text style={{ fontSize: 16, color: c.primary, fontFamily: "IBMPlexSansArabic_700Bold", textAlign: "center", lineHeight: 28, fontWeight: "800" }}>
          {card.back}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export default function QuranCardsScreen() {
  const c = useColors();
  const { language } = useSettings();
  const isDark = c.isDark;

  const [idx, setIdx] = useState(0);
  const [known, setKnown] = useState<string[]>([]);
  const [unknown, setUnknown] = useState<string[]>([]);
  const [done, setDone] = useState(false);

  const cards = SEED_CARDS;
  const current = cards[idx];
  const progress = Math.round(((known.length + unknown.length) / cards.length) * 100);

  const advance = useCallback((result: "known" | "unknown") => {
    if (!current) return;
    Haptics.impactAsync(result === "known" ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light);
    if (result === "known") setKnown(k => [...k, current.id]);
    else setUnknown(u => [...u, current.id]);
    if (idx + 1 >= cards.length) setDone(true);
    else setIdx(i => i + 1);
  }, [current, idx, cards.length]);

  const reset = () => {
    setIdx(0); setKnown([]); setUnknown([]); setDone(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <PageHeader titleAr="بطاقات الحفظ" subtitleAr={`${cards.length} بطاقة`} />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40, alignItems: "center" }}>

          {done ? (
            <Animated.View entering={FadeIn.duration(500)} style={{ marginTop: 40, alignItems: "center", width: "100%" }}>
              <Text style={{ fontSize: 48, marginBottom: 16 }}>🎉</Text>
              <Text style={{ fontSize: 22, fontWeight: "800", color: c.text, fontFamily: "IBMPlexSansArabic_700Bold", marginBottom: 8 }}>أحسنت!</Text>
              <Text style={{ fontSize: 14, color: c.textSecondary, fontFamily: "IBMPlexSansArabic_400Regular", textAlign: "center", marginBottom: 28 }}>
                حفظت {known.length} بطاقة، وتراجعت {unknown.length}
              </Text>
              <View style={{ flexDirection: "row", gap: 16, width: "100%", justifyContent: "center" }}>
                <View style={{ backgroundColor: isDark ? "rgba(16,185,129,0.15)" : "rgba(45,106,79,0.08)", borderRadius: 20, padding: 20, flex: 1, alignItems: "center" }}>
                  <Text style={{ fontSize: 28, fontWeight: "800", color: c.primary, fontFamily: "IBMPlexSansArabic_700Bold" }}>{known.length}</Text>
                  <Text style={{ fontSize: 11, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }}>محفوظ</Text>
                </View>
                <View style={{ backgroundColor: isDark ? "rgba(248,113,113,0.1)" : "rgba(220,38,38,0.06)", borderRadius: 20, padding: 20, flex: 1, alignItems: "center" }}>
                  <Text style={{ fontSize: 28, fontWeight: "800", color: "#F87171", fontFamily: "IBMPlexSansArabic_700Bold" }}>{unknown.length}</Text>
                  <Text style={{ fontSize: 11, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }}>للمراجعة</Text>
                </View>
              </View>
              <Pressable onPress={reset} style={{ marginTop: 28, backgroundColor: c.primary, borderRadius: 20, paddingVertical: 16, paddingHorizontal: 32, flexDirection: "row", alignItems: "center", gap: 8 }}>
                <RefreshCw size={16} color="#fff" />
                <Text style={{ fontSize: 15, fontWeight: "800", color: "#fff", fontFamily: "IBMPlexSansArabic_700Bold" }}>ابدأ من جديد</Text>
              </Pressable>
            </Animated.View>
          ) : (
            <>
              {/* Progress */}
              <Animated.View entering={FadeInDown.delay(60).springify()} style={{ width: "100%", marginTop: 20, marginBottom: 24 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                  <Text style={{ fontSize: 11, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }}>{progress}%</Text>
                  <Text style={{ fontSize: 12, color: c.textSecondary, fontFamily: "IBMPlexSansArabic_400Regular" }}>
                    {idx + 1} / {cards.length}
                  </Text>
                </View>
                <View style={{ height: 6, backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", borderRadius: 6, overflow: "hidden" }}>
                  <View style={{ height: "100%", width: `${progress}%`, backgroundColor: c.primary, borderRadius: 6 }} />
                </View>
              </Animated.View>

              {/* Card */}
              {current && (
                <Animated.View entering={FadeIn.duration(300)} key={current.id}>
                  <FlipCard card={current} isDark={isDark} c={c} />
                </Animated.View>
              )}

              {/* Actions */}
              <Animated.View entering={FadeInDown.delay(120).springify()} style={{ flexDirection: "row", gap: 16, marginTop: 28, width: "100%" }}>
                <Pressable
                  onPress={() => advance("unknown")}
                  style={{ flex: 1, borderRadius: 20, paddingVertical: 16, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 6, backgroundColor: isDark ? "rgba(248,113,113,0.12)" : "rgba(220,38,38,0.07)", borderWidth: 1.5, borderColor: "rgba(248,113,113,0.3)" }}
                >
                  <X size={18} color="#F87171" />
                  <Text style={{ fontSize: 13, fontWeight: "700", color: "#F87171", fontFamily: "IBMPlexSansArabic_700Bold" }}>للمراجعة</Text>
                </Pressable>
                <Pressable
                  onPress={() => advance("known")}
                  style={{ flex: 1, borderRadius: 20, paddingVertical: 16, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 6, backgroundColor: isDark ? "rgba(16,185,129,0.12)" : "rgba(45,106,79,0.07)", borderWidth: 1.5, borderColor: isDark ? "rgba(16,185,129,0.3)" : "rgba(45,106,79,0.25)" }}
                >
                  <Check size={18} color={c.primary} />
                  <Text style={{ fontSize: 13, fontWeight: "700", color: c.primary, fontFamily: "IBMPlexSansArabic_700Bold" }}>محفوظ</Text>
                </Pressable>
              </Animated.View>

              {/* Stats row */}
              <Animated.View entering={FadeInDown.delay(180).springify()} style={{ flexDirection: "row", gap: 12, marginTop: 16, width: "100%" }}>
                <View style={{ flex: 1, borderRadius: 14, padding: 12, alignItems: "center", backgroundColor: isDark ? "rgba(16,185,129,0.08)" : "rgba(45,106,79,0.05)", borderWidth: 1, borderColor: isDark ? "rgba(16,185,129,0.15)" : "rgba(45,106,79,0.1)" }}>
                  <Text style={{ fontSize: 18, fontWeight: "800", color: c.primary, fontFamily: "IBMPlexSansArabic_700Bold" }}>{known.length}</Text>
                  <Text style={{ fontSize: 9, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }}>محفوظ</Text>
                </View>
                <View style={{ flex: 1, borderRadius: 14, padding: 12, alignItems: "center", backgroundColor: isDark ? "rgba(248,113,113,0.08)" : "rgba(220,38,38,0.04)", borderWidth: 1, borderColor: "rgba(248,113,113,0.2)" }}>
                  <Text style={{ fontSize: 18, fontWeight: "800", color: "#F87171", fontFamily: "IBMPlexSansArabic_700Bold" }}>{unknown.length}</Text>
                  <Text style={{ fontSize: 9, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }}>للمراجعة</Text>
                </View>
                <Pressable onPress={reset} style={{ flex: 1, borderRadius: 14, padding: 12, alignItems: "center", justifyContent: "center", backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)", borderWidth: 1, borderColor: c.divider }}>
                  <RotateCcw size={18} color={c.textMuted} />
                  <Text style={{ fontSize: 9, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular", marginTop: 2 }}>إعادة</Text>
                </Pressable>
              </Animated.View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
