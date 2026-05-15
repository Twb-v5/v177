import { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeIn,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Flame, TrendingUp, Star, CheckCircle2, Circle,
  Trophy, Calendar, BarChart2,
} from "lucide-react-native";
import { useColors } from "@/hooks/useColors";
import { useSettings } from "@/providers/SettingsProvider";
import { PageHeader } from "@/components/shared/PageHeader";

const { width } = Dimensions.get("window");

const JOURNEY_KEY    = "journey30_completed_days";
const DHIKR_HIST_KEY = "dhikr_history_v1";
const HABITS_KEY     = "habits_daily_v1";
const DHIKR_TOTAL    = "dhikr_total_v1";

const ARABIC_DAYS = ["أ", "ث", "ر", "خ", "ج", "س", "ح"];
const HABIT_LABELS: Record<string, string> = {
  fajr:      "صلاة الفجر",
  quran:     "تلاوة القرآن",
  istighfar: "الاستغفار",
  dhikr:     "الذكر",
  sleep:     "النوم المبكر",
  exercise:  "الرياضة",
};

interface DailyDhikr { date: string; count: number; }

function GlowPulse({ color }: { color: string }) {
  const opacity = useSharedValue(0.5);
  const anim = useAnimatedStyle(() => ({ opacity: opacity.value }));
  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(withTiming(1, { duration: 1800 }), withTiming(0.4, { duration: 1800 })),
      -1, false,
    );
  }, []);
  return (
    <Animated.View style={[anim, {
      position: "absolute", inset: 0, borderRadius: 9999,
      backgroundColor: color,
    }]} />
  );
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
        <Text style={{ fontSize: 22, fontWeight: "800", color: accent, fontFamily: "IBMPlexSansArabic_700Bold" }}>
          {value}
        </Text>
        <Text style={{ fontSize: 10, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular", textAlign: "center", marginTop: 2 }}>
          {label}
        </Text>
      </View>
    </Animated.View>
  );
}

export default function ProgressScreen() {
  const c = useColors();
  const { language } = useSettings();
  const isRTL = language === "ar";
  const isDark = c.isDark;

  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [streakDays, setStreakDays]       = useState(0);
  const [totalDhikr, setTotalDhikr]      = useState(0);
  const [dhikrHistory, setDhikrHistory]  = useState<DailyDhikr[]>([]);
  const [habitData, setHabitData]        = useState<Record<string, boolean>>({});

  useEffect(() => {
    (async () => {
      const [journeyRaw, dhikrTotalRaw, dhikrHistRaw, habitsRaw] = await Promise.all([
        AsyncStorage.getItem(JOURNEY_KEY),
        AsyncStorage.getItem(DHIKR_TOTAL),
        AsyncStorage.getItem(DHIKR_HIST_KEY),
        AsyncStorage.getItem(HABITS_KEY),
      ]);

      if (journeyRaw) {
        const days: number[] = JSON.parse(journeyRaw);
        setCompletedDays(days);
        setStreakDays(computeStreak(days));
      }
      if (dhikrTotalRaw) setTotalDhikr(parseInt(dhikrTotalRaw, 10) || 0);
      if (dhikrHistRaw) setDhikrHistory(JSON.parse(dhikrHistRaw));
      if (habitsRaw) setHabitData(JSON.parse(habitsRaw));
    })();
  }, []);

  function computeStreak(days: number[]): number {
    const sorted = [...new Set(days)].sort((a, b) => b - a);
    let streak = 0;
    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i] === (sorted[0] ?? 1) - i) streak++;
      else break;
    }
    return streak;
  }

  const last7Dhikr = (() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - i));
      const key = d.toISOString().split("T")[0]!;
      const found = dhikrHistory.find(h => h.date === key);
      return { day: ARABIC_DAYS[d.getDay()] ?? "", count: found?.count ?? 0 };
    });
  })();
  const maxDhikr = Math.max(...last7Dhikr.map(d => d.count), 1);

  const habitEntries = Object.entries(habitData).filter(([k]) => HABIT_LABELS[k]);
  const habitTotal   = habitEntries.length;
  const habitDone    = habitEntries.filter(([, v]) => v).length;

  const progressPct = Math.round((completedDays.length / 30) * 100);

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <PageHeader
          titleAr="خريطة التقدم الروحي"
          subtitleAr={`${completedDays.length} من ٣٠ يوماً`}
        />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

          {/* ─── Stats Row ───────────────────────────────────────── */}
          <View style={{ flexDirection: "row", gap: 10, paddingHorizontal: 20, marginTop: 20, marginBottom: 6 }}>
            <StatCard emoji="🔥" value={`${streakDays}`}               label="أيام متتالية"  accent={c.accent}   delay={60}  />
            <StatCard emoji="✅" value={`${completedDays.length}`}      label="يوم مكتمل"    accent={c.primary}  delay={120} />
            <StatCard emoji="📿" value={totalDhikr.toLocaleString("ar-EG")} label="ذكر إجمالي" accent="#A78BFA"  delay={180} />
          </View>

          {/* ─── Overall Progress Bar ────────────────────────────── */}
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
                <Text style={{ fontSize: 14, fontWeight: "800", color: c.text, fontFamily: "IBMPlexSansArabic_700Bold" }}>
                  رحلة الـ ٣٠ يوماً
                </Text>
              </View>
              <View style={{ height: 10, backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", borderRadius: 10, overflow: "hidden" }}>
                <Animated.View
                  entering={FadeIn.delay(300)}
                  style={{
                    height: "100%",
                    width: `${progressPct}%`,
                    borderRadius: 10,
                    backgroundColor: c.primary,
                  }}
                />
              </View>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
                <Text style={{ fontSize: 10, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }}>اليوم ٣٠</Text>
                <Text style={{ fontSize: 10, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }}>اليوم ١</Text>
              </View>
            </View>
          </Animated.View>

          {/* ─── 30-Day Grid ─────────────────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(260).springify()} style={{ paddingHorizontal: 20, marginTop: 20 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Calendar size={14} color={c.textMuted} />
                <Text style={{ fontSize: 12, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }}>
                  {completedDays.length}/٣٠
                </Text>
              </View>
              <Text style={{ fontSize: 15, fontWeight: "800", color: c.text, fontFamily: "IBMPlexSansArabic_700Bold" }}>
                شبكة الأيام
              </Text>
            </View>
            <View style={{
              borderRadius: 22, padding: 18,
              backgroundColor: isDark ? "rgba(14,14,14,0.95)" : "rgba(255,255,255,0.95)",
              borderWidth: 1.5, borderColor: c.border,
              shadowColor: c.shadow, shadowOpacity: 1, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
              elevation: 4,
            }}>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 7, justifyContent: "flex-end" }}>
                {Array.from({ length: 30 }, (_, i) => {
                  const dayNum = i + 1;
                  const done = completedDays.includes(dayNum);
                  const isStreak = done && completedDays.includes(dayNum - 1);
                  return (
                    <Animated.View
                      key={dayNum}
                      entering={FadeIn.delay(280 + i * 18)}
                      style={{
                        width: (width - 76) / 7.5,
                        aspectRatio: 1,
                        borderRadius: 10,
                        overflow: "hidden",
                        backgroundColor: done
                          ? c.primary
                          : (isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"),
                        alignItems: "center",
                        justifyContent: "center",
                        borderWidth: 1,
                        borderColor: done ? c.primaryLight : c.divider,
                        shadowColor: done ? c.primary : "transparent",
                        shadowOpacity: done ? 0.4 : 0,
                        shadowRadius: 6,
                        elevation: done ? 4 : 0,
                      }}
                    >
                      {done && isStreak && <GlowPulse color={c.primaryGlow} />}
                      {done ? (
                        <Text style={{ fontSize: 12 }}>✓</Text>
                      ) : (
                        <Text style={{ fontSize: 10, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }}>
                          {dayNum}
                        </Text>
                      )}
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

          {/* ─── Dhikr Bar Chart ─────────────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(340).springify()} style={{ paddingHorizontal: 20, marginTop: 20 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <BarChart2 size={14} color={c.textMuted} />
                <Text style={{ fontSize: 12, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }}>آخر ٧ أيام</Text>
              </View>
              <Text style={{ fontSize: 15, fontWeight: "800", color: c.text, fontFamily: "IBMPlexSansArabic_700Bold" }}>
                ذكر الأسبوع
              </Text>
            </View>
            <View style={{
              borderRadius: 22, padding: 20,
              backgroundColor: isDark ? "rgba(14,14,14,0.95)" : "rgba(255,255,255,0.95)",
              borderWidth: 1.5, borderColor: c.border,
              shadowColor: c.shadow, shadowOpacity: 1, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
              elevation: 4,
            }}>
              <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", height: 90, gap: 6 }}>
                {last7Dhikr.map((d, i) => {
                  const barH = maxDhikr > 0 ? Math.max((d.count / maxDhikr) * 80, d.count > 0 ? 6 : 2) : 2;
                  const isToday = i === 6;
                  return (
                    <View key={i} style={{ flex: 1, alignItems: "center", gap: 4 }}>
                      <View style={{ flex: 1, justifyContent: "flex-end", width: "100%" }}>
                        <Animated.View
                          entering={FadeIn.delay(360 + i * 40)}
                          style={{
                            height: barH,
                            borderRadius: 6,
                            backgroundColor: isToday ? c.primary : (isDark ? "rgba(16,185,129,0.35)" : "rgba(45,106,79,0.25)"),
                            width: "100%",
                            shadowColor: isToday ? c.primary : "transparent",
                            shadowOpacity: isToday ? 0.4 : 0,
                            shadowRadius: 4,
                            elevation: isToday ? 3 : 0,
                          }}
                        />
                      </View>
                      <Text style={{ fontSize: 9, color: isToday ? c.primary : c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular", fontWeight: isToday ? "700" : "400" }}>
                        {d.day}
                      </Text>
                    </View>
                  );
                })}
              </View>
              {last7Dhikr.every(d => d.count === 0) && (
                <Text style={{ textAlign: "center", color: c.textMuted, fontSize: 12, marginTop: 8, fontFamily: "IBMPlexSansArabic_400Regular" }}>
                  ابدأ تسبيحك اليوم لترى تقدمك هنا
                </Text>
              )}
            </View>
          </Animated.View>

          {/* ─── Habits Summary ───────────────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(420).springify()} style={{ paddingHorizontal: 20, marginTop: 20 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <Text style={{ fontSize: 12, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }}>
                {habitDone}/{habitTotal}
              </Text>
              <Text style={{ fontSize: 15, fontWeight: "800", color: c.text, fontFamily: "IBMPlexSansArabic_700Bold" }}>
                عادات اليوم
              </Text>
            </View>
            <View style={{
              borderRadius: 22, overflow: "hidden",
              backgroundColor: isDark ? "rgba(14,14,14,0.95)" : "rgba(255,255,255,0.95)",
              borderWidth: 1.5, borderColor: c.border,
              shadowColor: c.shadow, shadowOpacity: 1, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
              elevation: 4,
            }}>
              {habitTotal === 0 ? (
                <View style={{ padding: 24, alignItems: "center" }}>
                  <Text style={{ fontSize: 28, marginBottom: 10 }}>📋</Text>
                  <Text style={{ fontSize: 13, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular", textAlign: "center" }}>
                    لم تُسجَّل عادات بعد — ابدأ من صفحة العادات
                  </Text>
                </View>
              ) : (
                habitEntries.map(([key, done], i) => (
                  <View
                    key={key}
                    style={{
                      flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                      paddingHorizontal: 18, paddingVertical: 14,
                      borderBottomWidth: i < habitEntries.length - 1 ? 1 : 0,
                      borderBottomColor: c.divider,
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      {done
                        ? <CheckCircle2 size={18} color={c.primary} />
                        : <Circle size={18} color={c.textMuted} />
                      }
                    </View>
                    <Text style={{
                      fontSize: 13, fontWeight: done ? "700" : "400",
                      color: done ? c.text : c.textSecondary,
                      fontFamily: done ? "IBMPlexSansArabic_700Bold" : "IBMPlexSansArabic_400Regular",
                      textDecorationLine: done ? "none" : "none",
                    }}>
                      {HABIT_LABELS[key] ?? key}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </Animated.View>

          {/* ─── Motivation Banner ────────────────────────────────── */}
          <Animated.View entering={FadeInDown.delay(500).springify()} style={{ paddingHorizontal: 20, marginTop: 20 }}>
            <View style={{
              borderRadius: 22, padding: 20,
              backgroundColor: isDark ? "rgba(16,16,16,0.95)" : "rgba(255,255,255,0.95)",
              borderWidth: 1.5, borderColor: c.accentGlow,
              overflow: "hidden",
            }}>
              <View style={{ position: "absolute", inset: 0, backgroundColor: c.accentGlow, opacity: 0.3, borderRadius: 20 }} />
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 8, marginBottom: 8 }}>
                <Text style={{ fontSize: 13, fontWeight: "800", color: c.accent, fontFamily: "IBMPlexSansArabic_700Bold" }}>
                  إلهام اليوم
                </Text>
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
      </SafeAreaView>
    </View>
  );
}
