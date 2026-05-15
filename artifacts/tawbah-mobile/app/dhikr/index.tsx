import { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeIn, FadeInDown,
  useSharedValue, useAnimatedStyle,
  withSpring, withTiming, withRepeat, withSequence,
} from "react-native-reanimated";
import { Star, Heart } from "lucide-react-native";
import { useColors } from "@/hooks/useColors";
import { useSettings } from "@/providers/SettingsProvider";
import { FloatingTabBar } from "@/components/home/FloatingTabBar";
import { apiUrl } from "@/lib/api";
import { getSessionId } from "@/lib/session";

const { width } = Dimensions.get("window");
const CARD_W = (width - 48) / 2;

const CATEGORIES = [
  { id: "morning",  labelAr: "أذكار الصباح",    emoji: "🌅", countAr: "٢١ ذكراً",  accent: "#F59E0B", glow: "rgba(245,158,11,0.18)" },
  { id: "evening",  labelAr: "أذكار المساء",     emoji: "🌙", countAr: "٢٠ ذكراً",  accent: "#A78BFA", glow: "rgba(167,139,250,0.18)" },
  { id: "sleep",    labelAr: "أذكار النوم",      emoji: "💫", countAr: "١١ ذكراً",  accent: "#60A5FA", glow: "rgba(96,165,250,0.18)" },
  { id: "prayer",   labelAr: "أذكار الصلاة",     emoji: "🕌", countAr: "١٥ ذكراً",  accent: "#F87171", glow: "rgba(248,113,113,0.18)" },
  { id: "general",  labelAr: "تسبيح عام",        emoji: "📿", countAr: "بلا حدود",  accent: "#34D399", glow: "rgba(52,211,153,0.18)" },
  { id: "waking",   labelAr: "أذكار الاستيقاظ",  emoji: "☀️", countAr: "٦ أذكار",   accent: "#FCD34D", glow: "rgba(252,211,77,0.18)" },
];

const QUICK_DHIKR = [
  { labelAr: "سبحان الله",       arabic: "سُبْحَانَ اللَّهِ",        count: 33  },
  { labelAr: "الحمد لله",        arabic: "الْحَمْدُ لِلَّهِ",         count: 33  },
  { labelAr: "الله أكبر",        arabic: "اللَّهُ أَكْبَرُ",          count: 34  },
  { labelAr: "لا إله إلا الله",  arabic: "لَا إِلَهَ إِلَّا اللَّهُ", count: 100 },
  { labelAr: "أستغفر الله",      arabic: "أَسْتَغْفِرُ اللَّهَ",      count: 100 },
];

function CategoryCard({ cat, isDark, index, onPress }: { cat: typeof CATEGORIES[0]; isDark: boolean; index: number; onPress: () => void }) {
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View entering={FadeInDown.delay(index * 70).springify()} style={[anim, { width: CARD_W }]}>
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.94, { damping: 20, stiffness: 400 }); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
        onPressOut={() => { scale.value = withSpring(1.0, { damping: 18, stiffness: 350 }); }}
        onPress={onPress}
        style={{ borderRadius: 22, padding: 18, minHeight: 118, overflow: "hidden", backgroundColor: isDark ? "rgba(14,14,14,0.95)" : "rgba(255,255,255,0.95)", borderWidth: 1.5, borderColor: cat.glow, shadowColor: cat.accent, shadowOpacity: isDark ? 0.22 : 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 6 }}
      >
        <View style={{ position: "absolute", inset: 0, backgroundColor: cat.glow, opacity: 0.35 }} />
        <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)", alignItems: "center", justifyContent: "center", marginBottom: 10, borderWidth: 1, borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)" }}>
          <Text style={{ fontSize: 22 }}>{cat.emoji}</Text>
        </View>
        <Text style={{ fontSize: 13, fontWeight: "800", color: cat.accent, fontFamily: "IBMPlexSansArabic_700Bold", marginBottom: 6, textAlign: "right" }}>{cat.labelAr}</Text>
        <View style={{ backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, alignSelf: "flex-end" }}>
          <Text style={{ fontSize: 10, color: cat.accent, fontFamily: "IBMPlexSansArabic_400Regular", fontWeight: "600" }}>{cat.countAr}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function DhikrScreen() {
  const router = useRouter();
  const c = useColors();
  const { language } = useSettings();
  const isRTL = language === "ar";
  const isDark = c.isDark;
  const [totalDhikr, setTotalDhikr] = useState(0);

  const glowAnim = useSharedValue(0.7);
  const glowStyle = useAnimatedStyle(() => ({ opacity: glowAnim.value }));

  const fetchDhikrCount = useCallback(async () => {
    try {
      const sid = getSessionId();
      const res = await fetch(apiUrl(`/dhikr/count?sessionId=${encodeURIComponent(sid)}`));
      if (res.ok) {
        const data = await res.json() as { istighfar: number; tasbih: number; sayyid: number };
        setTotalDhikr((data.istighfar ?? 0) + (data.tasbih ?? 0) + (data.sayyid ?? 0));
        return;
      }
    } catch {}
  }, []);

  useEffect(() => {
    glowAnim.value = withRepeat(
      withSequence(withTiming(1, { duration: 2200 }), withTiming(0.6, { duration: 2200 })),
      -1, false,
    );
    fetchDhikrCount();
  }, [fetchDhikrCount]);

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

          <Animated.View entering={FadeIn.duration(600)} style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24 }}>
            <View style={{ borderRadius: 28, overflow: "hidden", backgroundColor: isDark ? "rgba(16,16,16,0.95)" : "rgba(255,255,255,0.95)", borderWidth: 1.5, borderColor: c.primaryGlow, padding: 22, shadowColor: c.primary, shadowOpacity: 0.15, shadowRadius: 20, shadowOffset: { width: 0, height: 6 }, elevation: 8 }}>
              <Animated.View style={[glowStyle, { position: "absolute", inset: 0, backgroundColor: c.primaryGlow }]} />
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <View style={{ backgroundColor: isDark ? "rgba(16,185,129,0.15)" : "rgba(45,106,79,0.1)", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: isDark ? "rgba(16,185,129,0.2)" : "rgba(45,106,79,0.15)" }}>
                  <Text style={{ fontSize: 11, color: c.primary, fontWeight: "700", fontFamily: "IBMPlexSansArabic_700Bold" }}>اليوم</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Star size={14} color={c.accent} fill={c.accent} />
                  <Text style={{ fontSize: 14, color: c.accent, fontWeight: "800", fontFamily: "IBMPlexSansArabic_700Bold" }}>{totalDhikr.toLocaleString("ar-EG")}</Text>
                  <Text style={{ fontSize: 11, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }}>ذكر</Text>
                </View>
              </View>
              <Text style={{ fontSize: 26, fontWeight: "800", color: c.text, fontFamily: "IBMPlexSansArabic_700Bold", textAlign: isRTL ? "right" : "left", lineHeight: 34, marginBottom: 8 }}>الذِّكر والتسبيح</Text>
              <Text style={{ fontSize: 13, color: c.textSecondary, fontFamily: "IBMPlexSansArabic_400Regular", textAlign: isRTL ? "right" : "left", lineHeight: 22 }}>«أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ» — الرعد: ٢٨</Text>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(100).springify()} style={{ paddingHorizontal: 20, marginBottom: 14 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 12, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }}>٦ فئات</Text>
              <Text style={{ fontSize: 15, fontWeight: "800", color: c.text, fontFamily: "IBMPlexSansArabic_700Bold" }}>فئات الأذكار</Text>
            </View>
          </Animated.View>

          <View style={{ paddingHorizontal: 20, flexDirection: "row", flexWrap: "wrap", gap: 12, justifyContent: "space-between" }}>
            {CATEGORIES.map((cat, i) => (
              <CategoryCard key={cat.id} cat={cat} isDark={isDark} index={i}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push({ pathname: "/adhkar", params: { category: cat.id } } as never); }}
              />
            ))}
          </View>

          <Animated.View entering={FadeInDown.delay(320).springify()} style={{ marginTop: 28 }}>
            <View style={{ paddingHorizontal: 20, marginBottom: 14 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 12, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }}>مع العداد</Text>
                <Text style={{ fontSize: 15, fontWeight: "800", color: c.text, fontFamily: "IBMPlexSansArabic_700Bold" }}>تسبيح سريع</Text>
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}>
              {QUICK_DHIKR.map((d, i) => (
                <Animated.View key={d.labelAr} entering={FadeInDown.delay(370 + i * 50).springify()}>
                  <Pressable
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push({ pathname: "/dhikr/counter", params: { arabic: d.arabic, count: d.count.toString() } } as never); }}
                    style={{ borderRadius: 18, padding: 14, backgroundColor: isDark ? "rgba(16,16,16,0.95)" : "rgba(255,255,255,0.95)", borderWidth: 1.5, borderColor: c.primaryGlow, alignItems: "center", minWidth: 105, shadowColor: c.primary, shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 4 }}
                  >
                    <View style={{ backgroundColor: c.primaryGlow, position: "absolute", inset: 0, borderRadius: 16, opacity: 0.4 }} />
                    <Text style={{ fontSize: 13, fontWeight: "700", color: c.text, fontFamily: "IBMPlexSansArabic_700Bold", marginBottom: 5, textAlign: "center" }}>{d.labelAr}</Text>
                    <View style={{ backgroundColor: isDark ? "rgba(16,185,129,0.15)" : "rgba(45,106,79,0.1)", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 }}>
                      <Text style={{ fontSize: 10, color: c.primary, fontWeight: "700", fontFamily: "IBMPlexSansArabic_700Bold" }}>{d.count}×</Text>
                    </View>
                  </Pressable>
                </Animated.View>
              ))}
            </ScrollView>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(460).springify()} style={{ paddingHorizontal: 20, marginTop: 24 }}>
            <View style={{ borderRadius: 22, padding: 20, backgroundColor: isDark ? "rgba(16,16,16,0.95)" : "rgba(255,255,255,0.95)", borderWidth: 1.5, borderColor: c.accentGlow, shadowColor: c.accent, shadowOpacity: 0.12, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 5 }}>
              <View style={{ backgroundColor: c.accentGlow, position: "absolute", inset: 0, borderRadius: 20, opacity: 0.3 }} />
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 8, marginBottom: 12 }}>
                <Text style={{ fontSize: 14, fontWeight: "800", color: c.accent, fontFamily: "IBMPlexSansArabic_700Bold" }}>فضل الذكر</Text>
                <Heart size={16} color={c.accent} fill={c.accent} />
              </View>
              <Text style={{ fontSize: 13, color: c.textSecondary, fontFamily: "IBMPlexSansArabic_400Regular", lineHeight: 24, textAlign: "right" }}>
                قال صلى الله عليه وسلم: «أَحَبُّ الكَلامِ إلى اللهِ أَرْبَعٌ: سُبْحَانَ اللهِ، والحمدُ للهِ، ولا إلهَ إلا اللهُ، واللهُ أَكْبَرُ»
              </Text>
              <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 10 }}>
                <View style={{ backgroundColor: isDark ? "rgba(245,158,11,0.12)" : "rgba(200,150,62,0.1)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }}>
                  <Text style={{ fontSize: 10, color: c.accent, fontWeight: "700", fontFamily: "IBMPlexSansArabic_700Bold" }}>رواه مسلم</Text>
                </View>
              </View>
            </View>
          </Animated.View>

        </ScrollView>
      </SafeAreaView>
      <FloatingTabBar />
    </View>
  );
}
