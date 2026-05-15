import { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { useAdhkar } from "@/hooks/useAdhkar";
import { useColors } from "@/hooks/useColors";
import { useSettings } from "@/providers/SettingsProvider";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  interpolateColor,
  useDerivedValue,
} from "react-native-reanimated";
import { ChevronRight, ChevronLeft, RotateCcw, ChevronDown, ChevronUp } from "lucide-react-native";

type Category = "morning" | "evening" | "sleep" | "general" | "prayer" | "waking";

const CATEGORY_LABELS: Record<Category, { ar: string; emoji: string }> = {
  morning:  { ar: "أذكار الصباح",        emoji: "🌅" },
  evening:  { ar: "أذكار المساء",         emoji: "🌙" },
  sleep:    { ar: "أذكار النوم",           emoji: "💫" },
  general:  { ar: "تسبيح عام",            emoji: "📿" },
  prayer:   { ar: "أذكار الصلاة",          emoji: "🕌" },
  waking:   { ar: "أذكار الاستيقاظ",      emoji: "☀️" },
};

export default function DhikrCounterScreen() {
  const router = useRouter();
  const { category, arabic, count: countParam } = useLocalSearchParams<{
    category?: string;
    arabic?: string;
    count?: string;
  }>();

  const cat = (category || "general") as Category;
  const c = useColors();
  const { language } = useSettings();
  const isDark = c.isDark;
  const isRTL = language === "ar";

  const {
    currentDhikr,
    counter,
    progress,
    isCompleted,
    incrementCounter,
    resetCounter,
    selectCategory,
    nextDhikr,
    previousDhikr,
  } = useAdhkar();

  const [localCount, setLocalCount] = useState(0);
  const isQuickMode = !!arabic;
  const quickTarget = parseInt(countParam || "33", 10);
  const quickCompleted = localCount >= quickTarget;

  useEffect(() => {
    if (!isQuickMode) {
      const adhkarCat = (cat === "prayer" || cat === "waking") ? "general" : cat;
      selectCategory(adhkarCat as "general" | "morning" | "evening" | "sleep");
    }
  }, [cat, selectCategory, isQuickMode]);

  const label = CATEGORY_LABELS[cat] || CATEGORY_LABELS.general;

  const displayText = isQuickMode ? arabic! : (currentDhikr?.arabic || "");
  const displayCount = isQuickMode ? localCount : counter;
  const displayTarget = isQuickMode ? quickTarget : (currentDhikr?.count || 33);
  const displayProgress = isQuickMode
    ? Math.min(100, (localCount / quickTarget) * 100)
    : progress;
  const displayCompleted = isQuickMode ? quickCompleted : isCompleted;

  const scale = useSharedValue(1);
  const glow = useSharedValue(0);
  const progressAnim = useSharedValue(0);
  const completedAnim = useSharedValue(0);

  useEffect(() => {
    progressAnim.value = withTiming(displayProgress / 100, { duration: 400 });
  }, [displayProgress]);

  useEffect(() => {
    if (displayCompleted) {
      completedAnim.value = withSpring(1, { damping: 12, stiffness: 180 });
    } else {
      completedAnim.value = withTiming(0, { duration: 200 });
    }
  }, [displayCompleted]);

  const handlePress = useCallback(async () => {
    if (isQuickMode) {
      if (!quickCompleted) {
        setLocalCount((prev) => prev + 1);
        await Haptics.impactAsync(
          localCount + 1 >= quickTarget
            ? Haptics.ImpactFeedbackStyle.Heavy
            : Haptics.ImpactFeedbackStyle.Medium
        );
      }
    } else {
      if (!isCompleted) {
        incrementCounter();
        await Haptics.impactAsync(
          counter + 1 >= (currentDhikr?.count || 33)
            ? Haptics.ImpactFeedbackStyle.Heavy
            : Haptics.ImpactFeedbackStyle.Medium
        );
      }
    }
    scale.value = withSequence(
      withSpring(0.92, { damping: 20, stiffness: 600 }),
      withSpring(1.0,  { damping: 20, stiffness: 400 })
    );
    glow.value = withSequence(
      withTiming(1, { duration: 80 }),
      withTiming(0, { duration: 350 })
    );
  }, [isQuickMode, quickCompleted, localCount, quickTarget, isCompleted, counter, currentDhikr, incrementCounter]);

  const handleReset = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    if (isQuickMode) {
      setLocalCount(0);
    } else {
      resetCounter();
    }
    completedAnim.value = withTiming(0, { duration: 200 });
  }, [isQuickMode, resetCounter]);

  const handleNext = useCallback(() => {
    if (!isQuickMode) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      nextDhikr();
    }
  }, [isQuickMode, nextDhikr]);

  const handlePrev = useCallback(() => {
    if (!isQuickMode) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      previousDhikr();
    }
  }, [isQuickMode, previousDhikr]);

  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: 0.15 + glow.value * 0.35,
    shadowRadius: 12 + glow.value * 24,
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressAnim.value * 100}%` as any,
    backgroundColor: displayCompleted ? "#22C55E" : c.primary,
  }));

  const completedStyle = useAnimatedStyle(() => ({
    opacity: completedAnim.value,
    transform: [{ scale: completedAnim.value }],
  }));

  const primaryBtn = isDark ? c.primary : "#2D6A4F";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={["top"]}>
      {/* Header */}
      <View
        style={{
          flexDirection: isRTL ? "row-reverse" : "row",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: c.divider,
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{
            width: 38, height: 38, borderRadius: 12,
            backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
            alignItems: "center", justifyContent: "center",
          }}
        >
          {isRTL
            ? <ChevronRight size={20} color={c.textSecondary} />
            : <ChevronLeft size={20} color={c.textSecondary} />
          }
        </Pressable>

        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={{ fontSize: 15, fontWeight: "800", color: c.text, fontFamily: "IBMPlexSansArabic_700Bold" }}>
            {isQuickMode ? arabic : label.ar}
          </Text>
          {!isQuickMode && (
            <Text style={{ fontSize: 12, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular", marginTop: 1 }}>
              {label.emoji}
            </Text>
          )}
        </View>

        <Pressable
          onPress={handleReset}
          style={{
            width: 38, height: 38, borderRadius: 12,
            backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
            alignItems: "center", justifyContent: "center",
          }}
        >
          <RotateCcw size={18} color={c.textSecondary} />
        </Pressable>
      </View>

      {/* Progress Bar */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
        <View
          style={{
            height: 5, borderRadius: 4,
            backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
            overflow: "hidden",
          }}
        >
          <Animated.View style={[{ height: "100%", borderRadius: 4 }, progressStyle]} />
        </View>
        <Text style={{
          textAlign: "center", fontSize: 12,
          color: c.textMuted, marginTop: 6,
          fontFamily: "IBMPlexSansArabic_400Regular",
        }}>
          {displayCount} / {displayTarget}
        </Text>
      </View>

      {/* Dhikr Text */}
      <View style={{ flex: 1, paddingHorizontal: 24, justifyContent: "center", alignItems: "center" }}>
        {displayCompleted ? (
          <Animated.View style={[completedStyle, { alignItems: "center" }]}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>✅</Text>
            <Text style={{
              fontSize: 20, fontWeight: "800", color: "#22C55E",
              fontFamily: "IBMPlexSansArabic_700Bold",
              textAlign: "center",
            }}>
              أحسنت! اكتملت الأذكار
            </Text>
            {!isQuickMode && (
              <Pressable
                onPress={handleNext}
                style={{
                  marginTop: 20, paddingHorizontal: 28, paddingVertical: 12,
                  borderRadius: 16, backgroundColor: primaryBtn,
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "700", fontFamily: "IBMPlexSansArabic_700Bold", fontSize: 14 }}>
                  الذكر التالي
                </Text>
              </Pressable>
            )}
          </Animated.View>
        ) : (
          <>
            <Text
              style={{
                fontSize: 26, fontWeight: "800",
                color: c.text, fontFamily: "Amiri_400Regular",
                textAlign: "center", lineHeight: 46,
                marginBottom: 16,
              }}
            >
              {displayText}
            </Text>
            {!isQuickMode && currentDhikr?.transliteration ? (
              <Text style={{
                fontSize: 14, color: c.textSecondary,
                fontStyle: "italic", textAlign: "center", marginBottom: 8,
              }}>
                {currentDhikr.transliteration}
              </Text>
            ) : null}
            {!isQuickMode && currentDhikr?.translation ? (
              <Text style={{
                fontSize: 13, color: c.textMuted,
                textAlign: "center", lineHeight: 20,
              }}>
                {currentDhikr.translation}
              </Text>
            ) : null}
          </>
        )}
      </View>

      {/* Big Tap Button */}
      <View style={{ paddingHorizontal: 32, paddingBottom: 16 }}>
        <Animated.View style={btnStyle}>
          <Pressable
            onPress={handlePress}
            disabled={displayCompleted}
            style={{
              height: 160,
              borderRadius: 32,
              backgroundColor: displayCompleted
                ? isDark ? "#16302B" : "#D1FAE5"
                : isDark ? c.surface : "#FFFFFF",
              borderWidth: 2,
              borderColor: displayCompleted
                ? "#22C55E"
                : isDark ? c.border : "rgba(45,106,79,0.16)",
              alignItems: "center",
              justifyContent: "center",
              shadowColor: c.primary,
              shadowOffset: { width: 0, height: 8 },
              elevation: 8,
            }}
          >
            <Text
              style={{
                fontSize: 72, fontWeight: "900",
                color: displayCompleted ? "#22C55E" : c.primary,
                lineHeight: 80,
              }}
            >
              {displayCount}
            </Text>
            <Text style={{
              fontSize: 13, color: c.textMuted,
              fontFamily: "IBMPlexSansArabic_400Regular", marginTop: 4,
            }}>
              {displayCompleted ? "✨ اكتملت" : "اضغط للتسبيح"}
            </Text>
          </Pressable>
        </Animated.View>
      </View>

      {/* Navigation Controls */}
      {!isQuickMode && (
        <View
          style={{
            flexDirection: isRTL ? "row-reverse" : "row",
            justifyContent: "center",
            gap: 12,
            paddingHorizontal: 24,
            paddingBottom: 32,
          }}
        >
          <Pressable
            onPress={handlePrev}
            style={{
              flex: 1, paddingVertical: 13, borderRadius: 14,
              backgroundColor: isDark ? c.surface : "#F1F5F9",
              borderWidth: 1, borderColor: c.divider,
              alignItems: "center", justifyContent: "center",
            }}
          >
            <Text style={{ color: c.textSecondary, fontSize: 13, fontWeight: "600" }}>
              {isRTL ? "السابق" : "Previous"}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleNext}
            style={{
              flex: 1, paddingVertical: 13, borderRadius: 14,
              backgroundColor: primaryBtn,
              alignItems: "center", justifyContent: "center",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700", fontFamily: "IBMPlexSansArabic_700Bold" }}>
              {isRTL ? "التالي" : "Next"}
            </Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}
