import { useEffect, useState, useRef } from "react";
import { View, Text, Pressable, Platform } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withRepeat,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import Svg, { Circle, Line } from "react-native-svg";
import { useSettings } from "@/providers/SettingsProvider";
import { useColors } from "@/hooks/useColors";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { useJourney } from "@/engines/journey/useJourney";
import { Bell, Sun, Moon, Sparkles } from "lucide-react-native";

const isNative = Platform.OS !== "web";

// ── Quran ayahs carousel ──────────────────────────────────────────────────────
interface HeroItem {
  type: "ayah" | "hadith";
  textAr: string;
  sourceAr: string;
}
const CONTENT: HeroItem[] = [
  { type: "ayah", textAr: "إِنَّ اللَّهَ يُحِبُّ التَّوَّابِينَ وَيُحِبُّ الْمُتَطَهِّرِينَ", sourceAr: "البقرة ٢٢٢" },
  { type: "hadith", textAr: "التَّائِبُ مِنَ الذَّنْبِ كَمَنْ لَا ذَنْبَ لَهُ", sourceAr: "ابن ماجة" },
  { type: "ayah", textAr: "قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ", sourceAr: "الزمر ٥٣" },
  { type: "ayah", textAr: "وَتُوبُوا إِلَى اللَّهِ جَمِيعًا أَيُّهَ الْمُؤْمِنُونَ لَعَلَّكُمْ تُفْلِحُونَ", sourceAr: "النور ٣١" },
];

// ── Prayer helpers ────────────────────────────────────────────────────────────
const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};

const PRAYERS_META = [
  { key: "Fajr",    nameAr: "الفجر"  },
  { key: "Dhuhr",   nameAr: "الظهر"  },
  { key: "Asr",     nameAr: "العصر"  },
  { key: "Maghrib", nameAr: "المغرب" },
  { key: "Isha",    nameAr: "العشاء" },
] as const;

interface NextPrayerInfo {
  nameAr: string;
  time: string;
  progress: number;
  remainingStr: string;
}

function calcNextPrayer(pt: Record<string, string>): NextPrayerInfo {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const list = PRAYERS_META.map((p) => ({ ...p, min: toMin(pt[p.key] ?? "00:00") }));

  for (let i = 0; i < list.length; i++) {
    const cur = list[i]!;
    if (nowMin < cur.min) {
      const prevMin = i > 0 ? list[i - 1]!.min : 0;
      const interval = cur.min - prevMin;
      const elapsed = nowMin - prevMin;
      const progress = interval > 0 ? Math.max(0, Math.min(1, elapsed / interval)) : 0;
      const diff = cur.min - nowMin;
      const h = Math.floor(diff / 60), m = diff % 60;
      return {
        nameAr: cur.nameAr,
        time: pt[cur.key] ?? "",
        progress,
        remainingStr: h > 0 ? `${h}:${String(m).padStart(2, "0")}` : `${m} د`,
      };
    }
  }
  // After Isha → next Fajr
  const fajrMin = list[0]!.min;
  const ishaMin = list[4]!.min;
  const diff = (24 * 60 - nowMin) + fajrMin;
  const elapsed = nowMin - ishaMin;
  const interval = (24 * 60 - ishaMin) + fajrMin;
  const progress = interval > 0 ? Math.max(0, Math.min(1, elapsed / interval)) : 0;
  const h = Math.floor(diff / 60), m = diff % 60;
  return {
    nameAr: "الفجر",
    time: pt["Fajr"] ?? "",
    progress,
    remainingStr: h > 0 ? `${h}:${String(m).padStart(2, "0")}` : `${m} د`,
  };
}

// ── Qibla bearing ────────────────────────────────────────────────────────────
const KAABA = { lat: 21.422487, lon: 39.826206 };

function calcQiblaBearing(lat: number, lon: number): number {
  const φ1 = (lat * Math.PI) / 180;
  const φ2 = (KAABA.lat * Math.PI) / 180;
  const Δλ = ((KAABA.lon - lon) * Math.PI) / 180;
  const x = Math.sin(Δλ) * Math.cos(φ2);
  const y = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  return ((Math.atan2(x, y) * 180) / Math.PI + 360) % 360;
}

// ── Prayer ring SVG ───────────────────────────────────────────────────────────
function PrayerRing({
  prayer, isDark, c,
}: {
  prayer: NextPrayerInfo;
  isDark: boolean;
  c: any;
}) {
  const SIZE = 78;
  const STROKE = 5.5;
  const R = (SIZE - STROKE) / 2;
  const CIRC = 2 * Math.PI * R;
  const dashOffset = CIRC * (1 - prayer.progress);

  return (
    <View style={{ width: SIZE, height: SIZE, alignItems: "center", justifyContent: "center" }}>
      <Svg width={SIZE} height={SIZE} style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}>
        <Circle
          cx={SIZE / 2} cy={SIZE / 2} r={R}
          stroke={isDark ? "rgba(16,185,129,0.12)" : "rgba(45,106,79,0.10)"}
          strokeWidth={STROKE} fill="none"
        />
        <Circle
          cx={SIZE / 2} cy={SIZE / 2} r={R}
          stroke={c.primary} strokeWidth={STROKE} fill="none"
          strokeDasharray={CIRC} strokeDashoffset={dashOffset}
          strokeLinecap="round"
        />
      </Svg>
      <View style={{ alignItems: "center" }}>
        <Text style={{ fontSize: 12.5, fontWeight: "800", color: c.primary, fontFamily: "IBMPlexSansArabic_700Bold", letterSpacing: -0.4 }}>
          {prayer.time}
        </Text>
        <Text style={{ fontSize: 9, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular", marginTop: 1 }}>
          {prayer.nameAr}
        </Text>
      </View>
    </View>
  );
}

// ── Mini Qibla compass ────────────────────────────────────────────────────────
function MiniQiblaCompass({
  qiblaRotation, aligned, isDark, c,
}: {
  qiblaRotation: number;
  aligned: boolean;
  isDark: boolean;
  c: any;
}) {
  const SIZE = 46;
  const R = SIZE / 2;
  const arrowColor = aligned ? "#10B981" : c.primary;

  return (
    <View style={{ alignItems: "center", marginTop: 6 }}>
      <View style={{
        width: SIZE, height: SIZE, borderRadius: SIZE / 2,
        backgroundColor: isDark ? "rgba(16,185,129,0.08)" : "rgba(45,106,79,0.06)",
        borderWidth: 1,
        borderColor: aligned
          ? (isDark ? "rgba(16,185,129,0.35)" : "rgba(16,185,129,0.30)")
          : (isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)"),
        alignItems: "center", justifyContent: "center",
        overflow: "hidden",
      }}>
        <Svg width={SIZE} height={SIZE}>
          {/* compass circle ticks */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
            const rad = (angle * Math.PI) / 180;
            const isMajor = angle % 90 === 0;
            const inner = isMajor ? R - 9 : R - 6;
            const outer = R - 2;
            return (
              <Line
                key={angle}
                x1={R + inner * Math.sin(rad)}
                y1={R - inner * Math.cos(rad)}
                x2={R + outer * Math.sin(rad)}
                y2={R - outer * Math.cos(rad)}
                stroke={isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)"}
                strokeWidth={isMajor ? 1.5 : 0.8}
              />
            );
          })}
          {/* Qibla arrow */}
          {(() => {
            const rad = (qiblaRotation * Math.PI) / 180;
            const tipLen = R - 6;
            const tailLen = R - 18;
            return (
              <>
                <Line
                  x1={R - tailLen * Math.sin(rad)}
                  y1={R + tailLen * Math.cos(rad)}
                  x2={R + tipLen * Math.sin(rad)}
                  y2={R - tipLen * Math.cos(rad)}
                  stroke={arrowColor}
                  strokeWidth={2.2}
                  strokeLinecap="round"
                />
                {/* arrowhead */}
                <Line
                  x1={R + tipLen * Math.sin(rad)}
                  y1={R - tipLen * Math.cos(rad)}
                  x2={R + (tipLen - 7) * Math.sin(rad - 0.45)}
                  y2={R - (tipLen - 7) * Math.cos(rad - 0.45)}
                  stroke={arrowColor} strokeWidth={2} strokeLinecap="round"
                />
                <Line
                  x1={R + tipLen * Math.sin(rad)}
                  y1={R - tipLen * Math.cos(rad)}
                  x2={R + (tipLen - 7) * Math.sin(rad + 0.45)}
                  y2={R - (tipLen - 7) * Math.cos(rad + 0.45)}
                  stroke={arrowColor} strokeWidth={2} strokeLinecap="round"
                />
              </>
            );
          })()}
          {/* center dot */}
          <Circle cx={R} cy={R} r={3} fill={arrowColor} />
        </Svg>
      </View>
      <Text style={{
        fontSize: 8.5, marginTop: 3, textAlign: "center",
        color: aligned ? "#10B981" : c.textMuted,
        fontFamily: "IBMPlexSansArabic_700Bold",
        fontWeight: "700",
      }}>
        {aligned ? "✓ القبلة" : "القبلة"}
      </Text>
    </View>
  );
}

// ── Main PremiumHero ──────────────────────────────────────────────────────────
export function PremiumHero() {
  const { language, theme, setTheme } = useSettings();
  const c = useColors();
  const isDark = c.isDark;
  const isRTL = language === "ar";

  // ── real prayer times ──
  const { prayerTimes, location } = usePrayerTimes();

  // ── real journey data ──
  const { completedCount, streakDays } = useJourney();
  const JOURNEY_TOTAL = 30;
  const daysDisplay = streakDays > 0 ? streakDays : completedCount;
  const progressPct = (daysDisplay / JOURNEY_TOTAL) * 100;

  // ── qibla compass ──
  const [heading, setHeading] = useState(0);
  const [qiblaBearing, setQiblaBearing] = useState<number | null>(null);

  useEffect(() => {
    if (!location) return;
    setQiblaBearing(calcQiblaBearing(location.latitude, location.longitude));
  }, [location]);

  useEffect(() => {
    if (!isNative) return;
    let sub: any;
    // Dynamic import so web doesn't crash
    import("expo-sensors").then(({ Magnetometer }) => {
      Magnetometer.setUpdateInterval(250);
      sub = Magnetometer.addListener(({ x, y }: { x: number; y: number }) => {
        const angle = (Math.atan2(y, x) * 180) / Math.PI;
        setHeading((angle + 360) % 360);
      });
    }).catch(() => {});
    return () => { sub?.remove?.(); };
  }, []);

  const qiblaRotation = qiblaBearing !== null ? (qiblaBearing - heading + 360) % 360 : 0;
  const qiblaAligned = qiblaBearing !== null && Math.abs((qiblaRotation + 180) % 360 - 180) < 10;

  // ── next prayer ──
  const nextPrayer: NextPrayerInfo = prayerTimes
    ? calcNextPrayer(prayerTimes as unknown as Record<string, string>)
    : { nameAr: "الظهر", time: "—:—", progress: 0.5, remainingStr: "…" };

  // ── ayah carousel ──
  const [idx, setIdx] = useState(0);
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const counterScale = useSharedValue(0.8);

  useEffect(() => {
    counterScale.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.back(1.5)) });
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.0, { duration: 2200, easing: Easing.inOut(Easing.ease) })
      ),
      -1, true
    );
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 260, easing: Easing.out(Easing.quad) });
      translateY.value = withTiming(8, { duration: 260, easing: Easing.out(Easing.quad) });
      setTimeout(() => {
        setIdx((p) => (p + 1) % CONTENT.length);
        translateY.value = 10;
        opacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) });
        translateY.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) });
      }, 270);
    }, 6800);
    return () => clearTimeout(t);
  }, [idx]);

  const fadeStyle = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ translateY: translateY.value }] }));
  const pulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulseScale.value }] }));
  const counterStyle = useAnimatedStyle(() => ({ transform: [{ scale: counterScale.value }] }));

  const current = CONTENT[idx];

  const glass: object = {
    backgroundColor: isDark ? "rgba(18,18,18,0.92)" : "rgba(255,255,255,0.92)",
    borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
    borderWidth: 1,
    borderRadius: 22,
  };

  const primaryColor = c.primary;
  const primaryGlowBg = isDark ? "rgba(16,185,129,0.12)" : "rgba(45,106,79,0.08)";

  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10 }}>
      {/* ── top bar ── */}
      <View style={{
        flexDirection: isRTL ? "row-reverse" : "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 14,
      }}>
        <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 10 }}>
          <Animated.View style={[pulseStyle, {
            width: 44, height: 44, borderRadius: 14,
            backgroundColor: primaryGlowBg,
            alignItems: "center", justifyContent: "center",
            borderWidth: 1,
            borderColor: isDark ? "rgba(16,185,129,0.25)" : "rgba(45,106,79,0.20)",
          }]}>
            <Sparkles size={20} color={primaryColor} />
          </Animated.View>
          <View style={{ alignItems: isRTL ? "flex-end" : "flex-start" }}>
            <Text style={{ fontSize: 20, fontWeight: "800", color: c.text, fontFamily: "IBMPlexSansArabic_700Bold", letterSpacing: -0.4 }}>
              توبة
            </Text>
            <Text style={{ fontSize: 9.5, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }}>
              Tawbah · دليل التوبة النصوح
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Pressable style={{
            width: 38, height: 38, borderRadius: 12,
            backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
            alignItems: "center", justifyContent: "center",
          }}>
            <Bell size={17} color={c.textSecondary} />
          </Pressable>
          <Pressable
            onPress={() => setTheme(isDark ? "light" : "dark")}
            style={{
              width: 38, height: 38, borderRadius: 12,
              backgroundColor: primaryGlowBg,
              alignItems: "center", justifyContent: "center",
              borderWidth: 1,
              borderColor: isDark ? "rgba(16,185,129,0.20)" : "rgba(45,106,79,0.14)",
            }}>
            {isDark ? <Sun size={17} color={primaryColor} /> : <Moon size={17} color={primaryColor} />}
          </Pressable>
        </View>
      </View>

      {/* ── journey + prayer/qibla row ── */}
      <View style={{ flexDirection: isRTL ? "row-reverse" : "row", gap: 10, marginBottom: 12 }}>

        {/* LEFT — journey counter */}
        <View style={[glass, { flex: 1, padding: 16 }]}>
          <Text style={{
            fontSize: 11, color: c.textMuted,
            fontFamily: "IBMPlexSansArabic_400Regular",
            textAlign: isRTL ? "right" : "left",
          }}>
            الثبات على التوبة
          </Text>
          <Animated.View style={[counterStyle, {
            flexDirection: isRTL ? "row-reverse" : "row",
            alignItems: "flex-end", gap: 4, marginTop: 2,
          }]}>
            <Text style={{
              fontSize: 48, fontWeight: "800", color: primaryColor,
              lineHeight: 52, fontFamily: "IBMPlexSansArabic_700Bold", letterSpacing: -1,
            }}>
              {daysDisplay}
            </Text>
            <Text style={{
              fontSize: 15, color: c.textSecondary,
              marginBottom: 8, fontFamily: "IBMPlexSansArabic_400Regular",
            }}>
              يوم
            </Text>
          </Animated.View>

          <View style={{ marginTop: 8 }}>
            <View style={{
              height: 5,
              backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
              borderRadius: 99, overflow: "hidden",
            }}>
              <View style={{
                width: `${Math.min(100, progressPct)}%`,
                height: "100%",
                backgroundColor: primaryColor,
                borderRadius: 99,
              }} />
            </View>
            <View style={{
              flexDirection: isRTL ? "row-reverse" : "row",
              justifyContent: "space-between", marginTop: 6,
            }}>
              <Text style={{ fontSize: 10, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }}>
                {progressPct.toFixed(0)}٪ من الرحلة
              </Text>
              <Text style={{ fontSize: 10, color: primaryColor, fontFamily: "IBMPlexSansArabic_700Bold" }}>
                {Math.max(0, JOURNEY_TOTAL - daysDisplay)} للختم
              </Text>
            </View>
          </View>
        </View>

        {/* RIGHT — prayer ring + qibla compass */}
        <View style={[glass, {
          width: 106, paddingVertical: 14, paddingHorizontal: 10,
          alignItems: "center", justifyContent: "center",
        }]}>
          <PrayerRing prayer={nextPrayer} isDark={isDark} c={c} />
          <Text style={{
            fontSize: 8.5, color: c.textMuted,
            fontFamily: "IBMPlexSansArabic_400Regular",
            marginTop: 4, textAlign: "center",
          }}>
            الصلاة القادمة
          </Text>
          <Text style={{
            fontSize: 10, color: primaryColor,
            fontFamily: "IBMPlexSansArabic_700Bold",
            textAlign: "center",
          }}>
            {nextPrayer.remainingStr}
          </Text>

          {/* divider */}
          <View style={{
            width: "80%", height: 1,
            backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)",
            marginTop: 10,
          }} />

          <MiniQiblaCompass
            qiblaRotation={qiblaRotation}
            aligned={qiblaAligned}
            isDark={isDark}
            c={c}
          />
        </View>
      </View>

      {/* ── ayah / hadith card ── */}
      <Animated.View style={[fadeStyle, glass, { padding: 18 }]}>
        <View style={{
          flexDirection: isRTL ? "row-reverse" : "row",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}>
          <View style={{
            paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
            backgroundColor: isDark ? "rgba(16,185,129,0.10)" : "rgba(45,106,79,0.07)",
            borderWidth: 1,
            borderColor: isDark ? "rgba(16,185,129,0.18)" : "rgba(45,106,79,0.14)",
          }}>
            <Text style={{ fontSize: 10, fontWeight: "700", color: primaryColor, fontFamily: "IBMPlexSansArabic_700Bold" }}>
              {current?.type === "ayah" ? "آية كريمة" : "حديث شريف"}
            </Text>
          </View>
          <Text style={{ fontSize: 11, color: c.textMuted, fontFamily: "IBMPlexSansArabic_500Medium" }}>
            {current?.sourceAr}
          </Text>
        </View>
        <Text style={{
          fontSize: 19, lineHeight: 36, color: c.text,
          textAlign: "right",
          fontFamily: "Amiri_400Regular",
          letterSpacing: 0.2,
        }}>
          {current?.textAr}
        </Text>
      </Animated.View>
    </View>
  );
}
