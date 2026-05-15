import { useMemo, useState, useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, I18nManager, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { usePrayerTimes, PrayerTimes } from "@/hooks/usePrayerTimes";
import { useSettings } from "@/providers/SettingsProvider";
import { useColors } from "@/hooks/useColors";
import { Magnetometer } from "expo-sensors";
import * as Haptics from "expo-haptics";

const isNativePlatform = Platform.OS !== "web";

const PRAYER_ORDER = [
  { key: "Fajr", label: "Fajr", labelAr: "الفجر", icon: "fajr" },
  { key: "Sunrise", label: "Sunrise", labelAr: "الشروق", icon: "sunrise" },
  { key: "Dhuhr", label: "Dhuhr", labelAr: "الظهر", icon: "dhuhr" },
  { key: "Asr", label: "Asr", labelAr: "العصر", icon: "asr" },
  { key: "Maghrib", label: "Maghrib", labelAr: "المغرب", icon: "maghrib" },
  { key: "Isha", label: "Isha", labelAr: "العشاء", icon: "isha" },
];

export default function PrayerTimesScreen() {
  const router = useRouter();
  const c = useColors();
  const { language } = useSettings();
  const isDark = c.isDark;
  const isRTL = I18nManager.isRTL || language === "ar";

  const { prayerTimes, loading, error, location, locationPermission, refresh, scheduleAllNotifications } = usePrayerTimes();
  const [nextPrayer, setNextPrayer] = useState<string | null>(null);

  const [headingDeg, setHeadingDeg] = useState<number | null>(null);
  const [isAligned, setIsAligned] = useState(false);

  const arrowRotation = useSharedValue(0);
  const goldScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0);

  const qiblaBearingDeg = useMemo(() => {
    if (!location) return null;
    const KAABA_LAT = 21.422487;
    const KAABA_LNG = 39.826206;

    const toRad = (d: number) => (d * Math.PI) / 180;
    const toDeg = (r: number) => (r * 180) / Math.PI;

    const lat1 = toRad(location.latitude);
    const lat2 = toRad(KAABA_LAT);
    const dLon = toRad(KAABA_LNG - location.longitude);

    const y = Math.sin(dLon);
    const x = Math.cos(lat1) * Math.tan(lat2) - Math.sin(lat1) * Math.cos(dLon);
    let brng = toDeg(Math.atan2(y, x));
    brng = (brng + 360) % 360;
    return brng;
  }, [location]);

  const qiblaRelativeDeg = useMemo(() => {
    if (qiblaBearingDeg == null || headingDeg == null) return null;
    const rel = (qiblaBearingDeg - headingDeg + 360) % 360;
    return rel;
  }, [headingDeg, qiblaBearingDeg]);

  useEffect(() => {
    if (qiblaRelativeDeg !== null) {
      const aligned = qiblaRelativeDeg <= 10 || qiblaRelativeDeg >= 350;
      if (aligned && !isAligned) {
        setIsAligned(true);
        if (isNativePlatform) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        goldScale.value = withSpring(1.2, {}, () => {
          goldScale.value = withSpring(1);
        });
        pulseOpacity.value = withRepeat(withTiming(1, { duration: 1000 }), -1, true);
      } else if (!aligned && isAligned) {
        setIsAligned(false);
        goldScale.value = withSpring(1);
        pulseOpacity.value = withTiming(0);
      }
      arrowRotation.value = withSpring(qiblaRelativeDeg);
    }
  }, [qiblaRelativeDeg, isAligned]);

  const arrowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${arrowRotation.value}deg` }],
  }));

  const goldAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: goldScale.value }],
    opacity: interpolate(pulseOpacity.value, [0, 1], [0.8, 1]),
  }));

  useEffect(() => {
    if (!isNativePlatform) return;
    let sub: { remove: () => void } | null = null;
    try {
      Magnetometer.setUpdateInterval(250);
      sub = Magnetometer.addListener((data) => {
        const { x, y } = data;
        if (typeof x !== "number" || typeof y !== "number") return;
        let deg = (Math.atan2(y, x) * 180) / Math.PI;
        deg = (deg + 360) % 360;
        setHeadingDeg(deg);
      });
    } catch (e) {
      // Magnetometer not available on this device/platform
    }
    return () => {
      try { sub?.remove(); } catch {}
    };
  }, []);

  useEffect(() => {
    if (prayerTimes) {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();

      const getMinutes = (time: string) => {
        const [h, m] = time.split(":").map(Number);
        return h * 60 + m;
      };

      for (const prayer of PRAYER_ORDER) {
        if (prayer.key === "Sunrise") continue;
        const mins = getMinutes(prayerTimes[prayer.key as keyof PrayerTimes]);
        if (mins > currentTime) {
          setNextPrayer(prayer.key);
          break;
        }
      }
    }
  }, [prayerTimes]);

  const renderPrayerRow = (prayer: typeof PRAYER_ORDER[0]) => {
    const time = prayerTimes?.[prayer.key as keyof PrayerTimes] || "--:--";
    const isActive = nextPrayer === prayer.key;

    return (
      <View
        key={prayer.key}
        style={[
          styles.prayerRow,
          {
            backgroundColor: isActive
              ? isDark ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.08)"
              : c.surface,
            borderColor: isActive ? c.emerald : c.border,
          },
        ]}
      >
        <View style={styles.prayerInfo}>
          <Text style={[styles.prayerLabel, { color: c.text }]}>
            {isRTL ? prayer.labelAr : prayer.label}
          </Text>
          {isActive && (
            <View style={[styles.activeBadge, { backgroundColor: c.emerald }]}>
              <Text style={styles.activeBadgeText}>{isRTL ? "القادمة" : "Next"}</Text>
            </View>
          )}
        </View>
        <Text style={[styles.prayerTime, { color: c.primary }]}>
          {time}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={c.primary} />
          <Text style={[styles.loadingText, { color: c.textMuted }]}>
            {isRTL ? "...جاري تحديد الموقع ومواقيت الصلاة" : "Getting location & prayer times..."}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!locationPermission) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorTitle, { color: c.text }]}>
            {isRTL ? "الموقع مطلوب" : "Location Required"}
          </Text>
          <Text style={[styles.errorText, { color: c.textMuted }]}>
            {isRTL ? "فعّل الموقع للحصول على مواقيت دقيقة" : "Please enable location to get accurate prayer times"}
          </Text>
          <Pressable onPress={refresh} style={[styles.retryBtn, { backgroundColor: c.primary }]}>
            <Text style={styles.retryBtnText}>{isRTL ? "تفعيل الموقع" : "Enable Location"}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={["top"]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: c.surface, borderColor: c.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={[styles.backBtnText, { color: c.text }]}>
            {isRTL ? "»" : "«"}
          </Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: c.text }]}>
          {isRTL ? "مواقيت الصلاة" : "Prayer Times"}
        </Text>
        <Pressable onPress={scheduleAllNotifications} style={styles.notifyBtn}>
          <Text style={[styles.notifyBtnText, { color: c.primary }]}>
            {isRTL ? "تنبيه" : "Notify"}
          </Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Date */}
        <View style={[styles.dateCard, { backgroundColor: c.surface }]}>
          <Text style={[styles.dateText, { color: c.text }]}>
            {prayerTimes?.date || "Today"}
          </Text>
          <Text style={[styles.locationText, { color: c.textMuted }]}>
            {isRTL ? "حسب موقعك الحالي" : "Based on your location"}
          </Text>
        </View>

        {/* Qibla Compass */}
        <View
          style={[
            styles.qiblaCard,
            {
              backgroundColor: c.surface,
              borderColor: c.border,
            },
          ]}
        >
          <View style={styles.qiblaHeaderRow}>
            <Text style={[styles.qiblaTitle, { color: c.text }]}>
              {isRTL ? "اتجاه القبلة" : "Qibla"}
            </Text>
            {isAligned && (
              <Animated.View style={[styles.alignedBadge, goldAnimatedStyle]}>
                <Text style={styles.alignedText}>{isRTL ? "موجه" : "Aligned"}</Text>
              </Animated.View>
            )}
            <View style={[styles.qiblaPill, { backgroundColor: isDark ? "rgba(34,197,94,0.12)" : "rgba(34,197,94,0.10)" }]}>
              <Text style={[styles.qiblaPillText, { color: isDark ? "#a7f3d0" : "#166534" }]}>
                {qiblaBearingDeg == null ? "--°" : `${Math.round(qiblaBearingDeg)}°`}
              </Text>
            </View>
          </View>

          <View style={styles.compassWrap}>
            <View
              style={[
                styles.compassOuter,
                {
                  borderColor: "rgba(251,191,36,0.35)",
                  backgroundColor: isDark ? "rgba(2,132,199,0.06)" : "rgba(2,132,199,0.03)",
                },
              ]}
            >
              <View style={[styles.compassInner, { borderColor: "rgba(34,197,94,0.25)" }]}>
                <View style={styles.northMark}>
                  <Text style={[styles.northText, { color: isDark ? "#fbbf24" : "#b45309" }]}>N</Text>
                </View>

                <Animated.View style={[styles.qiblaArrow, arrowAnimatedStyle]}>
                  <Animated.View style={[styles.arrowHead, { backgroundColor: "#fbbf24" }]} />
                  <Animated.View style={[styles.arrowShaft, { backgroundColor: isAligned ? "#fbbf24" : "#22c55e" }]} />
                </Animated.View>

                <View style={[styles.compassDot, { backgroundColor: isDark ? "rgba(34,197,94,0.28)" : "rgba(34,197,94,0.18)" }]} />
              </View>
            </View>
          </View>

          <Text style={[styles.qiblaHint, { color: c.textMuted }]}>
            {isRTL
              ? "إذا كان الاتجاه غير دقيق، حرّك الجهاز على شكل 8 لمعايرة الحساس."
              : "If the direction feels off, move your phone in a figure-8 to calibrate."}
          </Text>
        </View>

        {/* Prayer List */}
        <View style={styles.prayerList}>
          {PRAYER_ORDER.map(renderPrayerRow)}
        </View>

        {/* Refresh Button */}
        <Pressable onPress={refresh} style={[styles.refreshBtn, { backgroundColor: c.surface, borderColor: c.border }]}>
          <Text style={[styles.refreshBtnText, { color: c.text }]}>
            {isRTL ? "تحديث" : "Refresh"}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", padding: 16, borderBottomWidth: 1 },
  backBtn: { padding: 8 },
  backBtnText: { fontSize: 24, fontWeight: "bold" },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: "bold", textAlign: "center" },
  notifyBtn: { padding: 8 },
  notifyBtnText: { fontSize: 14, fontWeight: "600" },
  content: { padding: 16 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 14 },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  errorTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  errorText: { fontSize: 14, marginBottom: 20, textAlign: "center" },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  retryBtnText: { color: "#ffffff", fontWeight: "600" },
  dateCard: { padding: 20, borderRadius: 16, marginBottom: 20, alignItems: "center" },
  dateText: { fontSize: 20, fontWeight: "bold" },
  locationText: { fontSize: 13, marginTop: 4 },
  prayerList: { gap: 12 },
  prayerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderRadius: 16, borderWidth: 1 },
  prayerInfo: { flexDirection: "row", alignItems: "center", gap: 10 },
  prayerLabel: { fontSize: 16, fontWeight: "600" },
  activeBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  activeBadgeText: { color: "#ffffff", fontSize: 11, fontWeight: "bold" },
  prayerTime: { fontSize: 18, fontWeight: "bold" },
  refreshBtn: { marginTop: 20, padding: 16, borderRadius: 16, alignItems: "center", borderWidth: 1 },
  refreshBtnText: { fontSize: 14, fontWeight: "600" },

  qiblaCard: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 16 },
  qiblaHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  qiblaTitle: { fontSize: 16, fontWeight: "800" },
  qiblaPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  qiblaPillText: { fontSize: 12, fontWeight: "700" },
  compassWrap: { alignItems: "center", justifyContent: "center" },
  compassOuter: { width: 210, height: 210, borderRadius: 105, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  compassInner: { width: 170, height: 170, borderRadius: 85, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  northMark: { position: "absolute", top: 10, alignItems: "center", justifyContent: "center" },
  northText: { fontSize: 12, fontWeight: "900" },
  qiblaArrow: { position: "absolute", width: 170, height: 170, alignItems: "center", justifyContent: "flex-start" },
  arrowHead: { width: 18, height: 18, borderRadius: 6, transform: [{ rotate: "45deg" }], marginTop: 12 },
  arrowShaft: { width: 4, height: 62, borderRadius: 999, marginTop: 8 },
  compassDot: { width: 10, height: 10, borderRadius: 999 },
  qiblaHint: { marginTop: 12, fontSize: 12, lineHeight: 18, textAlign: "center" },
  alignedBadge: { position: "absolute", top: -8, right: 12, backgroundColor: "#fbbf24", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  alignedText: { fontSize: 11, fontWeight: "700", color: "#0f172a" },
});
