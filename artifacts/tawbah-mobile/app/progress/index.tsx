import { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable, Dimensions, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeIn, FadeInDown, useSharedValue, useAnimatedStyle,
  withSpring, withTiming, withRepeat, withSequence,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import {
  Flame, TrendingUp, Star, CheckCircle2, Circle,
  Trophy, Calendar, BarChart2, RefreshCw,
} from "lucide-react-native";
import { useColors } from "@/hooks/useColors";
import { useSettings } from "@/providers/SettingsProvider";
import { PageHeader } from "@/components/shared/PageHeader";
import { apiUrl } from "@/lib/api";
import { getSessionId } from "@/lib/session";

const { width } = Dimensions.get("window");
const ARABIC_DAYS = ["أ", "ث", "ر", "خ", "ج", "س", "ح"];

interface UserProgress {
  streakDays: number;
  day40Progress: number;
  covenantDate: string | null;
}

interface Habit {
  habitKey: string;
  habitNameAr: string;
  completed: boolean;
}

interface DhikrCount {
  istighfar: number;
  tasbih: number;
  sayyid: number;
}

interface JourneyDay {
  dayNumber: number;
  completed: boolean;
}

function GlowPulse({ color }: { color: string }) {
  const opacity = useSharedValue(0.5);
  const anim = useAnimatedStyle(() => ({ opacity: opacity.value }));
  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(withTiming(1, { duration: 1800 }), withTiming(0.4, { duration: 1800 })),
      -1, false,
    );
  }, []);
  return <Animated.View style={[anim, { position: "absolute", inset: 0, borderRadius: 9999, backgroundColor: color }]} />;
}

function StatCard({ emoji, value, label, accent, delay }: {
  emoji: string; value: string; label: string; accent: string; delay: number;
}) {
  const c = useColors();
  const isDark = c.isDark;
  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()} style={{ flex: 1 }}>
      <View style={{
        borderRadius: 20, padding: 16, alignItems: "center",
        backgroundColor: isDark ? "rgba(14,14,14,0.95)" : "rgba(255,255,255,0.95)",
        borderWidth: 1.5, borderColor: `${accent}30`,
        shadowColor: accent, shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
        elevation: 5, overflow: "hidden",
      }}>
        <View style={{ position: "absolute", inset: 0, backgroundColor: `${accent}10`, borderRadius: 18 }} />
        <Text style={{ fontSize: 22, marginBottom: 4 }}>{emoji}</Text>
        <Text style={{ fontSize: 22, fontWeight: "800", color: accent, fontFamily: "IBMPlexSansArabic_700Bold" }}>{value}</Text>
        <Text style={{ fontSize: 10, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular", textAlign: "center", marginTop: 2 }}>{label}</Text>
      </View>
    </Animated.View>
  );
}

export default function ProgressScreen() {
  const c = useColors();
  const { language } = useSettings();
  const isRTL = language === "ar";
  const isDark = c.isDark;

  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [dhikr, setDhikr] = useState<DhikrCount>({ istighfar: 0, tasbih: 0, sayyid: 0 });
  const [journeyDays, setJourneyDays] = useState<number[]>([]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const sessionId = await getSessionId();
      const [progressRes, habitsRes, dhikrRes, journeyRes] = await Promise.allSettled([
        fetch(apiUrl(`/user/progress?sessionId=${sessionId}`)),
        fetch(apiUrl(`/habits?sessionId=${sessionId}`)),
        fetch(apiUrl(`/dhikr/count?sessionId=${sessionId}`)),
        fetch(apiUrl(`/user/journey?sessionId=${sessionId}`)),
      ]);

      if (progressRes.status === "fulfilled" && progressRes.value.ok) {
        setProgress(await progressRes.value.json() as UserProgress);
      }
      if (habitsRes.status === "fulfilled" && habitsRes.value.ok) {
        setHabits(await habitsRes.value.json() as Habit[]);
      }
      if (dhikrRes.status === "fulfilled" && dhikrRes.value.ok) {
        const d = await dhikrRes.value.json() as DhikrCount;
        setDhikr(d);
      }
      if (journeyRes.status === "fulfilled" && journeyRes.value.ok) {
        const data = await journeyRes.value.json() as { days?: JourneyDay[] };
        if (data.days) {
          setJourneyDays(data.days.filter((d: JourneyDay) => d.completed).map((d: JourneyDay) => d.dayNumber));
        }
      }
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const streakDays = progress?.streakDays ?? 0;
  const totalDhikr = dhikr.istighfar + dhikr.tasbih + dhikr.sayyid;
  const completedDays = journeyDays;
  const progressPct = Math.round((completedDays.length / 30) * 100);
  const habitsCompleted = habits.filter(h => h.completed).length;
  const habitsTotal = habits.length;

  // Derive a 7-bar dhikr week chart: today's value from API, rest empty (no historical data)
  const last7Dhikr = Array.from({ length: 7 }, (_, i) => ({
    day: ARABIC_DAYS[new Date(Date.now() - (6 - i) * 86400000).getDay()] ?? "",
    count: i === 6 ? totalDhikr : 0,
  }));
  const maxDhikr = Math.max(...last7Dhikr.map(d => d.count), 1);

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <PageHeader
          titleAr="خريطة التقدم الروحي"
          subtitleAr={`${completedDays.length} من ٣٠ يوماً`}
          rightAction={
            <Pressable onPress={loadAll} style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)", alignItems: "center", justifyContent: "center" }}>
              <RefreshCw size={16} color={c.textMuted} />
            </Pressable>
          }
        />
        {loading ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator size="large" color={c.primary} />
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

            {/* Stats Row */}
            <View style={{ flexDirection: "row", gap: 10, paddingHorizontal: 20, marginTop: 20, marginBottom: 6 }}>
              <StatCard emoji="🔥" value={String(streakDays)}                   label="أيام متتالية"  accent={c.accent}   delay={60}  />
              <StatCard emoji="✅" value={String(completedDays.length)}          label="يوم مكتمل"    accent={c.primary}  delay={120} />
              <StatCard emoji="📿" value={totalDhikr.toLocaleString("ar-EG")}   label="ذكر اليوم"    accent="#A78BFA"    delay={180} />
            </View>

            {/* Progress Bar */}
            <Animated.View entering={FadeInDown.delay(200).springify()} style={{ paddingHorizontal: 20, marginTop: 18 }}>
              <View style={{
                borderRadius: 22, padding: 20,
                backgroundColor: isDark ? "rgba(14,14,14,0.95)" : "rgba(255,255,255,0.95)",
                borderWidth: 1.5, borderColor: c.primaryGlow,
                shadowColor: c.primary, shadowOpacity: 0.1, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
                elevation: 5,
              }}>
                <View style={{ position: "absolute", inset: 0, backgroundColor: c.primaryGlow, opacity: 0.25, borderRadius: 20 }} />
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <Text style={{ fontSize: 12, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }}>{progressPct}%</Text>
                  <Text style={{ fontSize: 14, fontWeight: "800", color: c.text, fontFamily: "IBMPlexSansArabic_700Bold" }}>رحلة الـ ٣٠ يوماً</Text>
                </View>
                <View style={{ height: 10, backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", borderRadius: 10, overflow: "hidden" }}>
                  <Animated.View entering={FadeIn.delay(300)} style={{ height: "100%", width: `${progressPct}%`, borderRadius: 10, backgroundColor: c.primary }} />
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
                  <Text style={{ fontSize: 10, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }}>اليوم ٣٠</Text>
                  <Text style={{ fontSize: 10, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }}>اليوم ١</Text>
                </View>
              </View>
            </Animated.View>

            {/* 30-Day Grid */}
            <Animated.View entering={FadeInDown.delay(260).springify()} style={{ paddingHorizontal: 20, marginTop: 20 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <Calendar size={14} color={c.textMuted} />
                  <Text style={{ fontSize: 12, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }}>{completedDays.length}/٣٠</Text>
                </View>
                <Text style={{ fontSize: 15, fontWeight: "800", color: c.text, fontFamily: "IBMPlexSansArabic_700Bold" }}>شبكة الأيام</Text>
              </View>
              <View style={{
                borderRadius: 22, padding: 18,
                backgroundColor: isDark ? "rgba(14,14,14,0.95)" : "rgba(255,255,255,0.95)",
                borderWidth: 1.5, borderColor: c.border,
                elevation: 4,
              }}>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 7, justifyContent: "flex-end" }}>
                  {Array.from({ length: 30 }, (_, i) => {
                    const dayNum = i + 1;
                    const done = completedDays.includes(dayNum);
                    const isStreak = done && completedDays.includes(dayNum - 1);
                    return (
                      <Animated.View key={dayNum} entering={FadeIn.delay(280 + i * 18)} style={{
                        width: (width - 76) / 7.5, aspectRatio: 1, borderRadius: 10, overflow: "hidden",
                        backgroundColor: done ? c.primary : (isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"),
                        alignItems: "center", justifyContent: "center",
                        borderWidth: 1, borderColor: done ? c.primaryLight : c.divider,
                        shadowColor: done ? c.primary : "transparent", shadowOpacity: done ? 0.4 : 0, shadowRadius: 6, elevation: done ? 4 : 0,
                      }}>
                        {done && isStreak && <GlowPulse color={c.primaryGlow} />}
                        {done
                          ? <Text style={{ fontSize: 12 }}>✓</Text>
                          : <Text style={{ fontSize: 10, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }}>{dayNum}</Text>
                        }
                      </Animated.View>
                    );
                  })}
                </View>
                <View style={{ flexDirection: "row", justifyContent: "center", gap: 16, marginTop: 12 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                    <View style={{ width: 10, height: 10, borderRadius: 4, backgroundColor: c.primary }} />
                    <Text style={{ fontSize: 10, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }}>مكتمل</Text>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
                    <View style={{ width: 10, height: 10, borderRadius: 4, backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)" }} />
                    <Text style={{ fontSize: 10, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }}>قادم</Text>
                  </View>
                </View>
              </View>
            </Animated.View>

            {/* Dhikr Chart (today's count from API) */}
            <Animated.View entering={FadeInDown.delay(340).springify()} style={{ paddingHorizontal: 20, marginTop: 20 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                  <BarChart2 size={14} color={c.textMuted} />
                  <Text style={{ fontSize: 12, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }}>اليوم الحالي</Text>
                </View>
                <Text style={{ fontSize: 15, fontWeight: "800", color: c.text, fontFamily: "IBMPlexSansArabic_700Bold" }}>أذكار اليوم</Text>
              </View>
              <View style={{
                borderRadius: 22, padding: 20,
                backgroundColor: isDark ? "rgba(14,14,14,0.95)" : "rgba(255,255,255,0.95)",
                borderWidth: 1.5, borderColor: c.border, elevation: 4,
              }}>
                <View style={{ flexDirection: "row-reverse", gap: 16 }}>
                  {[
                    { label: "استغفار", value: dhikr.istighfar, color: "#10b981" },
                    { label: "تسبيح", value: dhikr.tasbih, color: "#3b82f6" },
                    { label: "سيد الاستغفار", value: dhikr.sayyid, color: "#a78bfa" },
                  ].map(({ label, value, color }) => (
                    <View key={label} style={{ flex: 1, alignItems: "center", gap: 6 }}>
                      <Text style={{ fontSize: 20, fontWeight: "800", color, fontFamily: "IBMPlexSansArabic_700Bold" }}>{value}</Text>
                      <Text style={{ fontSize: 9, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular", textAlign: "center" }}>{label}</Text>
                    </View>
                  ))}
                </View>
                {totalDhikr === 0 && (
                  <Text style={{ textAlign: "center", color: c.textMuted, fontSize: 12, marginTop: 12, fontFamily: "IBMPlexSansArabic_400Regular" }}>
                    ابدأ تسبيحك اليوم لترى تقدمك هنا
                  </Text>
                )}
              </View>
            </Animated.View>

            {/* Habits */}
            <Animated.View entering={FadeInDown.delay(420).springify()} style={{ paddingHorizontal: 20, marginTop: 20 }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <Text style={{ fontSize: 12, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }}>{habitsCompleted}/{habitsTotal}</Text>
                <Text style={{ fontSize: 15, fontWeight: "800", color: c.text, fontFamily: "IBMPlexSansArabic_700Bold" }}>عادات اليوم</Text>
              </View>
              <View style={{ borderRadius: 22, overflow: "hidden", backgroundColor: isDark ? "rgba(14,14,14,0.95)" : "rgba(255,255,255,0.95)", borderWidth: 1.5, borderColor: c.border, elevation: 4 }}>
                {habitsTotal === 0 ? (
                  <View style={{ padding: 24, alignItems: "center" }}>
                    <Text style={{ fontSize: 28, marginBottom: 10 }}>📋</Text>
                    <Text style={{ fontSize: 13, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular", textAlign: "center" }}>
                      لم تُسجَّل عادات بعد — ابدأ من صفحة العادات
                    </Text>
                  </View>
                ) : (
                  habits.map((h, i) => (
                    <View key={h.habitKey} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: i < habits.length - 1 ? 1 : 0, borderBottomColor: c.divider }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        {h.completed ? <CheckCircle2 size={18} color={c.primary} /> : <Circle size={18} color={c.textMuted} />}
                      </View>
                      <Text style={{ fontSize: 13, fontWeight: h.completed ? "700" : "400", color: h.completed ? c.text : c.textSecondary, fontFamily: h.completed ? "IBMPlexSansArabic_700Bold" : "IBMPlexSansArabic_400Regular" }}>
                        {h.habitNameAr}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            </Animated.View>

            {/* Motivation */}
            <Animated.View entering={FadeInDown.delay(500).springify()} style={{ paddingHorizontal: 20, marginTop: 20 }}>
              <View style={{ borderRadius: 22, padding: 20, backgroundColor: isDark ? "rgba(16,16,16,0.95)" : "rgba(255,255,255,0.95)", borderWidth: 1.5, borderColor: c.accentGlow, overflow: "hidden" }}>
                <View style={{ position: "absolute", inset: 0, backgroundColor: c.accentGlow, opacity: 0.3, borderRadius: 20 }} />
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 8, marginBottom: 8 }}>
                  <Text style={{ fontSize: 13, fontWeight: "800", color: c.accent, fontFamily: "IBMPlexSansArabic_700Bold" }}>إلهام اليوم</Text>
                  <Trophy size={16} color={c.accent} />
                </View>
                <Text style={{ fontSize: 13, color: c.textSecondary, fontFamily: "IBMPlexSansArabic_400Regular", lineHeight: 22, textAlign: "right" }}>
                  {completedDays.length >= 30
                    ? "ما شاء الله — أكملت رحلتك! قلبك عامر بذكر الله. واصل هذا النور."
                    : completedDays.length >= 15
                    ? "منتصف الطريق! أنت أقوى مما تظن — كل يوم يُرسّخ قرارك."
                    : completedDays.length >= 5
                    ? "بدأت تبني عادتك الروحية — واصل ولا تنقطع."
                    : "كل رحلة تبدأ بخطوة — أنت في الطريق الصحيح."}
                </Text>
              </View>
            </Animated.View>

          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}
