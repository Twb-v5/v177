import { useCallback, useEffect, useMemo } from "react";
import { View, Text, Pressable, StyleSheet, I18nManager } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { useAdhkar } from "@/hooks/useAdhkar";
import { useSettings } from "@/providers/SettingsProvider";

export default function DhikrCounterScreen() {
  const router = useRouter();
  const { category } = useLocalSearchParams<{ category?: string }>();
  const cat = (category || "general") as "morning" | "evening" | "sleep" | "general";
  
  const { resolvedTheme } = useSettings();
  const isDark = resolvedTheme === "dark";
  const isRTL = I18nManager.isRTL;

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

  const mushafFont = "Amiri_400Regular";
  const arabicUiFont = "IBMPlexSansArabic_400Regular";
  const arabicUiFontBold = "IBMPlexSansArabic_700Bold";

  useEffect(() => {
    selectCategory(cat);
  }, [cat, selectCategory]);

  const labels = useMemo(() => {
    const map: Record<typeof cat, { en: string; ar: string }> = {
      general: { en: "General", ar: "تسبيح عام" },
      morning: { en: "Morning", ar: "أذكار الصباح" },
      evening: { en: "Evening", ar: "أذكار المساء" },
      sleep: { en: "Sleep", ar: "أذكار النوم" },
    };
    return map[cat];
  }, [cat]);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(isCompleted ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Medium);
    incrementCounter();
  }, [incrementCounter, isCompleted]);

  const handleReset = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    resetCounter();
  }, [resetCounter]);

  const handleNext = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    nextDhikr();
  }, [nextDhikr]);

  const handlePrev = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    previousDhikr();
  }, [previousDhikr]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? "#0f172a" : "#f8fafc" }]} edges={["top"]}>
      <View style={[styles.header, { backgroundColor: isDark ? "#1e293b" : "#ffffff", borderColor: isDark ? "#334155" : "#e2e8f0" }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backBtnText, { color: isDark ? "#f1f5f9" : "#1e293b" }]}>
            {isRTL ? "»" : "«"}
          </Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: isDark ? "#f1f5f9" : "#1e293b", fontFamily: isRTL ? arabicUiFontBold : undefined }]}>
          {isRTL ? labels.ar : labels.en}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <View style={[styles.progressContainer, { backgroundColor: isDark ? "#1e293b" : "#ffffff" }]}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: isCompleted ? "#22c55e" : "#1a4731" }]} />
        </View>
        <Text style={[styles.progressText, { color: isDark ? "#94a3b8" : "#64748b", fontFamily: isRTL ? arabicUiFont : undefined }]}>
          {counter} / {currentDhikr?.count || 0}
        </Text>
      </View>

      <View style={styles.dhikrContainer}>
        <Text style={[styles.dhikrArabic, { color: isDark ? "#f1f5f9" : "#1e293b", fontFamily: mushafFont }]}>
          {currentDhikr?.arabic || ""}
        </Text>
        <Text style={[styles.dhikrTransliteration, { color: isDark ? "#94a3b8" : "#64748b" }]}>
          {currentDhikr?.transliteration || ""}
        </Text>
        <Text style={[styles.dhikrTranslation, { color: isDark ? "#64748b" : "#94a3b8" }]}>
          {currentDhikr?.translation || ""}
        </Text>
      </View>

      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.counterBtn,
          { backgroundColor: isDark ? "#1e293b" : "#ffffff", borderColor: isDark ? "#334155" : "#e2e8f0" },
          pressed && styles.counterBtnPressed,
        ]}
      >
        <Text style={[styles.counterText, { color: isDark ? "#22c55e" : "#1a4731" }]}>
          {counter}
        </Text>
        <Text style={[styles.counterHint, { color: isDark ? "#94a3b8" : "#64748b", fontFamily: isRTL ? arabicUiFont : undefined }]}>
          {isRTL ? "اضغط للتسبيح" : "Tap to count"}
        </Text>
      </Pressable>

      <View style={styles.controls}>
        <Pressable onPress={handleReset} style={[styles.controlBtn, { backgroundColor: isDark ? "#1e293b" : "#ffffff", borderColor: isDark ? "#334155" : "#e2e8f0" }]}>
          <Text style={[styles.controlBtnText, { color: isDark ? "#f1f5f9" : "#1e293b", fontFamily: isRTL ? arabicUiFontBold : undefined }]}>
            {isRTL ? "تصفير" : "Reset"}
          </Text>
        </Pressable>
        
        <Pressable onPress={handlePrev} style={[styles.controlBtn, { backgroundColor: isDark ? "#1e293b" : "#ffffff", borderColor: isDark ? "#334155" : "#e2e8f0" }]}>
          <Text style={[styles.controlBtnText, { color: isDark ? "#f1f5f9" : "#1e293b" }]}>{isRTL ? "»" : "«"}</Text>
        </Pressable>
        
        <Pressable onPress={handleNext} style={[styles.controlBtn, { backgroundColor: "#1a4731" }]}>
          <Text style={[styles.controlBtnText, { color: "#ffffff" }]}>{isRTL ? "«" : "»"}</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1 },
  backBtn: { padding: 8 },
  backBtnText: { fontSize: 24, fontWeight: "bold" },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: "bold", textAlign: "center" },
  placeholder: { width: 40 },
  progressContainer: { padding: 16 },
  progressTrack: { height: 6, backgroundColor: "#e2e8f0", borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },
  progressText: { textAlign: "center", marginTop: 8, fontSize: 14 },
  dhikrContainer: { flex: 1, padding: 20, alignItems: "center", justifyContent: "center" },
  dhikrArabic: { fontSize: 24, textAlign: "center", lineHeight: 40, fontFamily: "serif", marginBottom: 16 },
  dhikrTransliteration: { fontSize: 14, textAlign: "center", fontStyle: "italic", marginBottom: 8 },
  dhikrTranslation: { fontSize: 14, textAlign: "center" },
  counterBtn: { marginHorizontal: 40, padding: 30, borderRadius: 24, alignItems: "center", borderWidth: 2 },
  counterBtnPressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  counterText: { fontSize: 56, fontWeight: "bold" },
  counterHint: { fontSize: 14, marginTop: 4 },
  controls: { flexDirection: "row", justifyContent: "center", gap: 12, padding: 20, paddingBottom: 40 },
  controlBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, borderWidth: 1 },
  controlBtnText: { fontSize: 16, fontWeight: "600" },
});
