import { useState, useCallback } from "react";
import {
  View, Text, Pressable, ScrollView, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeInDown, FadeIn, useSharedValue, useAnimatedStyle, withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import {
  CheckCircle2, Lock, Trophy, Flame, Star, ChevronDown, ChevronUp,
  RefreshCw, AlertCircle, BookHeart,
} from "lucide-react-native";
import { useColors } from "@/hooks/useColors";
import { useSettings } from "@/providers/SettingsProvider";
import { PageHeader } from "@/components/shared/PageHeader";
import { useJourney } from "@/engines/journey/useJourney";
import { DAY_EMOJIS } from "@/engines/journey/utils";
import type { JourneyDay } from "@/engines/journey/types";

interface DayCardProps {
  day: JourneyDay;
  isDark: boolean;
  c: ReturnType<typeof useColors>;
  onComplete: (dayNum: number) => void;
  isCompletingDay: boolean;
}

function DayCard({ day, isDark, c, onComplete, isCompletingDay }: DayCardProps) {
  const [expanded, setExpanded] = useState(false);
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const emoji = DAY_EMOJIS[day.day] ?? "✨";
  const isToday = day.isCurrent && !day.completed;
  const accent = day.completed ? c.emerald : isToday ? c.accent : c.textMuted;

  const completedTaskCount = (day.taskChecks ?? []).filter(Boolean).length;
  const totalTasks = day.tasks.length;
  const taskProgress = totalTasks > 0 ? completedTaskCount / totalTasks : 0;

  return (
    <Animated.View style={[animStyle, { marginBottom: 8 }]}>
      <View
        style={{
          borderRadius: 18,
          backgroundColor: isDark ? "rgba(14,14,14,0.92)" : "#fff",
          borderWidth: 1.5,
          borderColor: day.completed
            ? "rgba(16,185,129,0.35)"
            : isToday
            ? "rgba(245,158,11,0.35)"
            : isDark
            ? "rgba(255,255,255,0.06)"
            : "rgba(0,0,0,0.06)",
          opacity: day.isLocked ? 0.5 : 1,
          overflow: "hidden",
        }}
      >
        {day.completed && <View style={{ height: 2, backgroundColor: c.emerald }} />}
        {isToday && <View style={{ height: 2, backgroundColor: c.accent }} />}

        <Pressable
          onPressIn={() => { if (!day.isLocked) scale.value = withSpring(0.98); }}
          onPressOut={() => { scale.value = withSpring(1); }}
          onPress={() => {
            if (day.isLocked) return;
            setExpanded((e) => !e);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            padding: 14,
            justifyContent: "flex-end",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            {day.completed && <CheckCircle2 size={20} color={c.emerald} />}
            {!day.completed && !day.isLocked && (
              expanded
                ? <ChevronUp size={18} color={c.textMuted} />
                : <ChevronDown size={18} color={c.textMuted} />
            )}
            {day.isLocked && <Lock size={16} color={c.textMuted} />}
          </View>

          <View style={{ flex: 1, alignItems: "flex-end" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Text style={{ fontSize: 10, fontWeight: "800", color: accent, fontFamily: "IBMPlexSansArabic_700Bold" }}>
                اليوم {day.day}
              </Text>
              {isToday && (
                <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, backgroundColor: isDark ? "rgba(245,158,11,0.15)" : "rgba(245,158,11,0.12)" }}>
                  <Text style={{ fontSize: 9, fontWeight: "800", color: c.accent, fontFamily: "IBMPlexSansArabic_700Bold" }}>اليوم</Text>
                </View>
              )}
            </View>
            <Text style={{ fontSize: 13, fontWeight: "800", color: c.text, fontFamily: "IBMPlexSansArabic_700Bold", marginTop: 2 }}>
              {day.title}
            </Text>
            {isToday && totalTasks > 0 && (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 }}>
                <View style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: isDark ? "rgba(245,158,11,0.18)" : "rgba(245,158,11,0.15)", overflow: "hidden", maxWidth: 80 }}>
                  <View style={{ height: "100%", borderRadius: 2, backgroundColor: c.accent, width: `${taskProgress * 100}%` }} />
                </View>
                <Text style={{ fontSize: 10, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }}>
                  {completedTaskCount}/{totalTasks}
                </Text>
              </View>
            )}
          </View>

          <View
            style={{
              width: 48, height: 48, borderRadius: 16,
              backgroundColor: isDark ? `${accent}18` : `${accent}12`,
              borderWidth: 1, borderColor: `${accent}28`,
              alignItems: "center", justifyContent: "center",
            }}
          >
            {day.isLocked
              ? <Lock size={20} color={c.textMuted} />
              : <Text style={{ fontSize: 22 }}>{emoji}</Text>
            }
          </View>
        </Pressable>

        {expanded && !day.isLocked && (
          <Animated.View entering={FadeIn.duration(200)} style={{ paddingHorizontal: 14, paddingBottom: 14 }}>
            <View style={{ height: 1, backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", marginBottom: 12 }} />

            {day.verse ? (
              <View style={{ marginBottom: 12, padding: 12, borderRadius: 12, backgroundColor: isDark ? "rgba(5,150,105,0.08)" : "rgba(5,150,105,0.05)", borderWidth: 1, borderColor: "rgba(5,150,105,0.2)" }}>
                <Text style={{ fontSize: 13, color: c.primary, textAlign: "right", fontFamily: "Amiri_400Regular", lineHeight: 22 }}>
                  {day.verse}
                </Text>
              </View>
            ) : null}

            {day.tasks.map((task, i) => (
              <View
                key={i}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                  justifyContent: "flex-end",
                }}
              >
                <Text style={{ flex: 1, fontSize: 13, color: c.textSecondary, fontFamily: "IBMPlexSansArabic_400Regular", textAlign: "right" }}>
                  {task}
                </Text>
                <View
                  style={{
                    width: 8, height: 8, borderRadius: 4,
                    backgroundColor: day.taskChecks?.[i] ? c.emerald : accent,
                  }}
                />
              </View>
            ))}

            {!day.completed && (
              <Pressable
                onPress={() => {
                  onComplete(day.day);
                  setExpanded(false);
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }}
                disabled={isCompletingDay}
                style={{
                  marginTop: 10,
                  paddingVertical: 12,
                  borderRadius: 14,
                  alignItems: "center",
                  backgroundColor: c.accent,
                  opacity: isCompletingDay ? 0.7 : 1,
                }}
              >
                {isCompletingDay
                  ? <ActivityIndicator size="small" color="#1a0e00" />
                  : <Text style={{ fontSize: 14, fontWeight: "800", color: "#1a0e00", fontFamily: "IBMPlexSansArabic_700Bold" }}>✓ أتممت مهام اليوم</Text>
                }
              </Pressable>
            )}
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
}

export default function JourneyScreen() {
  const c = useColors();
  const { language } = useSettings();
  const isDark = c.isDark;

  const {
    data,
    isLoading,
    isError,
    refetch,
    currentDay,
    completedDays,
    completedCount,
    streakDays,
    progress,
    tasksAllDone,
    isComplete,
    completeDay,
    isCompletingDay,
  } = useJourney();

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={["top"]}>
        <PageHeader titleAr="رحلة ٣٠ يوماً" subtitleAr="طريقك إلى التوبة النصوح" />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={c.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (isError || !data) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={["top"]}>
        <PageHeader titleAr="رحلة ٣٠ يوماً" subtitleAr="طريقك إلى التوبة النصوح" />
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
          <AlertCircle size={40} color={c.textMuted} style={{ marginBottom: 12 }} />
          <Text style={{ fontSize: 15, fontWeight: "800", color: c.text, textAlign: "center", fontFamily: "IBMPlexSansArabic_700Bold", marginBottom: 6 }}>
            تعذّر تحميل الرحلة
          </Text>
          <Text style={{ fontSize: 13, color: c.textMuted, textAlign: "center", fontFamily: "IBMPlexSansArabic_400Regular", marginBottom: 16 }}>
            تحقق من اتصال الإنترنت ثم أعد المحاولة
          </Text>
          <Pressable
            onPress={() => refetch()}
            style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 20, paddingVertical: 11, borderRadius: 14, backgroundColor: c.primary }}
          >
            <RefreshCw size={15} color="#fff" />
            <Text style={{ fontSize: 13, fontWeight: "800", color: "#fff", fontFamily: "IBMPlexSansArabic_700Bold" }}>إعادة المحاولة</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (isComplete) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={["top"]}>
        <PageHeader titleAr="رحلة ٣٠ يوماً" subtitleAr="مكتملة" />
        <View style={{ flex: 1, padding: 24 }}>
          <View style={{ height: 2, backgroundColor: c.primary, marginBottom: 24 }} />
          <Animated.View entering={FadeIn.duration(600)} style={{ alignItems: "center", padding: 32, borderRadius: 24, backgroundColor: isDark ? "rgba(16,185,129,0.08)" : "rgba(16,185,129,0.06)", borderWidth: 1.5, borderColor: "rgba(16,185,129,0.25)" }}>
            <Text style={{ fontSize: 64 }}>🏆</Text>
            <Text style={{ fontSize: 22, fontWeight: "900", color: c.primary, fontFamily: "IBMPlexSansArabic_700Bold", textAlign: "center", marginTop: 12 }}>
              تهانينا! أتممت الرحلة
            </Text>
            <Text style={{ fontSize: 13, color: c.textSecondary, fontFamily: "IBMPlexSansArabic_400Regular", textAlign: "center", lineHeight: 22, marginTop: 8 }}>
              أتممت رحلة الثلاثين يوماً — سجّل الله لك هذا الجهد وقبل منك التوبة إن شاء الله
            </Text>
            <View style={{ flexDirection: "row", gap: 4, marginTop: 16 }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} size={20} color={c.accent} fill={c.accent} />
              ))}
            </View>
            <View style={{ marginTop: 16, padding: 12, borderRadius: 14, backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", width: "100%" }}>
              <Text style={{ fontSize: 12, color: c.textMuted, textAlign: "center", fontFamily: "IBMPlexSansArabic_400Regular" }}>
                ٣٠ يوماً · {streakDays} يوم متتالٍ
              </Text>
            </View>
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={["top"]}>
      <PageHeader titleAr="رحلة ٣٠ يوماً" subtitleAr="طريقك إلى التوبة النصوح" />

      <View style={{ height: 3, backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }}>
        <Animated.View
          style={{
            height: "100%",
            borderRadius: 3,
            backgroundColor: c.primary,
            width: `${progress}%`,
          }}
        />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={{
            borderRadius: 22, padding: 18, marginBottom: 16,
            backgroundColor: isDark ? "rgba(245,158,11,0.07)" : "#FFFBEB",
            borderWidth: 1, borderColor: isDark ? "rgba(245,158,11,0.18)" : "rgba(245,158,11,0.3)",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <Text style={{ fontSize: 40 }}>
              {completedCount >= 30 ? "🏆" : completedCount >= 20 ? "🌳" : completedCount >= 10 ? "🌿" : "🌱"}
            </Text>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ fontSize: 13, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }}>تقدمك في الرحلة</Text>
              <Text style={{ fontSize: 26, fontWeight: "900", color: c.accent, fontFamily: "IBMPlexSansArabic_700Bold", marginTop: 2 }}>
                {completedCount} / 30
              </Text>
            </View>
          </View>

          <View style={{ height: 10, borderRadius: 10, backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(245,158,11,0.15)", overflow: "hidden", marginBottom: 10 }}>
            <View style={{ height: "100%", borderRadius: 10, backgroundColor: c.accent, width: `${progress}%` }} />
          </View>

          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Text style={{ fontSize: 12, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }}>
                {30 - completedCount} يوم متبقٍ
              </Text>
              <Star size={13} color={c.accent} />
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Text style={{ fontSize: 12, color: c.accent, fontFamily: "IBMPlexSansArabic_700Bold", fontWeight: "700" }}>
                {streakDays} يوم متواصل
              </Text>
              <Flame size={13} color={c.accent} />
            </View>
          </View>
        </View>

        {currentDay && tasksAllDone && (
          <Animated.View
            entering={FadeIn.duration(400)}
            style={{
              borderRadius: 20, padding: 18, marginBottom: 16,
              backgroundColor: isDark ? "rgba(16,185,129,0.1)" : "rgba(16,185,129,0.07)",
              borderWidth: 1.5, borderColor: "rgba(16,185,129,0.3)",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, justifyContent: "flex-end", marginBottom: 10 }}>
              <Text style={{ fontSize: 15, fontWeight: "900", color: c.primary, fontFamily: "IBMPlexSansArabic_700Bold" }}>
                أحسنت! مهام اليوم مكتملة ✅
              </Text>
              <CheckCircle2 size={22} color={c.primary} />
            </View>
            <Text style={{ fontSize: 13, color: c.textSecondary, textAlign: "right", fontFamily: "IBMPlexSansArabic_400Regular", marginBottom: 14 }}>
              {currentDay.title} — اليوم {currentDay.day} من ٣٠
            </Text>
            <Pressable
              onPress={() => {
                completeDay(currentDay.day);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }}
              disabled={isCompletingDay}
              style={{
                paddingVertical: 13, borderRadius: 15,
                alignItems: "center",
                backgroundColor: c.primary,
                opacity: isCompletingDay ? 0.7 : 1,
              }}
            >
              {isCompletingDay
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={{ fontSize: 15, fontWeight: "900", color: "#fff", fontFamily: "IBMPlexSansArabic_700Bold" }}>
                  انتقل لليوم التالي ←
                </Text>
              }
            </Pressable>
          </Animated.View>
        )}

        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: c.divider }} />
          <Text style={{ fontSize: 10, fontWeight: "800", color: c.textMuted, fontFamily: "IBMPlexSansArabic_700Bold", paddingHorizontal: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>
            أيام الرحلة
          </Text>
          <View style={{ flex: 1, height: 1, backgroundColor: c.divider }} />
        </View>

        {(data.days ?? []).map((day, i) => (
          <Animated.View key={day.day} entering={FadeInDown.delay(i < 8 ? i * 25 : 0).springify()}>
            <DayCard
              day={day}
              isDark={isDark}
              c={c}
              onComplete={completeDay}
              isCompletingDay={isCompletingDay}
            />
          </Animated.View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
