import { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withRepeat,
  withSequence,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import { useSettings } from "@/providers/SettingsProvider";
import { useColors } from "@/hooks/useColors";
import { Bell, Settings, Sparkles, Moon, Sun } from "lucide-react-native";

interface HeroItem {
  type: "ayah" | "hadith" | "quote";
  textAr: string;
  sourceAr: string;
}

const CONTENT: HeroItem[] = [
  { type: "ayah", textAr: "إِنَّ اللَّهَ يُحِبُّ التَّوَّابِينَ وَيُحِبُّ الْمُتَطَهِّرِينَ", sourceAr: "البقرة ٢٢٢" },
  { type: "hadith", textAr: "التَّائِبُ مِنَ الذَّنْبِ كَمَنْ لَا ذَنْبَ لَهُ", sourceAr: "ابن ماجة" },
  { type: "ayah", textAr: "قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ", sourceAr: "الزمر ٥٣" },
  { type: "ayah", textAr: "وَتُوبُوا إِلَى اللَّهِ جَمِيعًا أَيُّهَ الْمُؤْمِنُونَ لَعَلَّكُمْ تُفْلِحُونَ", sourceAr: "النور ٣١" },
];

const NEXT_PRAYER = { name: "الظهر", time: "12:30", progress: 0.48, remaining: "١:٤٥" };
const DAYS_STEADFAST = 12;
const JOURNEY_TOTAL = 30;

function PrayerRing({ isDark, c }: { isDark: boolean; c: any }) {
  const SIZE = 80;
  const STROKE = 6;
  const R = (SIZE - STROKE) / 2;
  const CIRC = 2 * Math.PI * R;
  const dashOffset = CIRC * (1 - NEXT_PRAYER.progress);
  const trackColor = isDark ? "rgba(16,185,129,0.12)" : "rgba(45,106,79,0.10)";
  const fillColor = isDark ? c.primary : c.primary;

  return (
    <View style={{ width: SIZE, height: SIZE, alignItems: "center", justifyContent: "center" }}>
      <Svg width={SIZE} height={SIZE} style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}>
        <Circle cx={SIZE / 2} cy={SIZE / 2} r={R} stroke={trackColor} strokeWidth={STROKE} fill="none" />
        <Circle
          cx={SIZE / 2} cy={SIZE / 2} r={R}
          stroke={fillColor} strokeWidth={STROKE} fill="none"
          strokeDasharray={CIRC} strokeDashoffset={dashOffset}
          strokeLinecap="round"
        />
      </Svg>
      <View style={{ alignItems: "center" }}>
        <Text style={{ fontSize: 13, fontWeight: "800", color: isDark ? c.primary : c.primary, fontFamily: "IBMPlexSansArabic_700Bold", letterSpacing: -0.5 }}>
          {NEXT_PRAYER.time}
        </Text>
        <Text style={{ fontSize: 9, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular", marginTop: 1 }}>
          {NEXT_PRAYER.name}
        </Text>
      </View>
    </View>
  );
}

export function PremiumHero() {
  const { language } = useSettings();
  const c = useColors();
  const isDark = c.isDark;
  const isRTL = language === "ar";

  const { setTheme, theme } = useSettings();
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

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const counterStyle = useAnimatedStyle(() => ({
    transform: [{ scale: counterScale.value }],
  }));

  const current = CONTENT[idx];

  const glass: object = {
    backgroundColor: isDark ? "rgba(18,18,18,0.92)" : "rgba(255,255,255,0.92)",
    borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
    borderWidth: 1,
    borderRadius: 22,
  };

  const primaryGlowBg = isDark ? "rgba(16,185,129,0.12)" : "rgba(45,106,79,0.08)";
  const primaryColor = isDark ? c.primary : c.primary;
  const progressPct = (DAYS_STEADFAST / JOURNEY_TOTAL) * 100;

  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 10, paddingBottom: 10 }}>
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
            <Text style={{
              fontSize: 20, fontWeight: "800", color: c.text,
              fontFamily: "IBMPlexSansArabic_700Bold", letterSpacing: -0.4,
            }}>
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
              backgroundColor: isDark ? "rgba(16,185,129,0.12)" : "rgba(45,106,79,0.08)",
              alignItems: "center", justifyContent: "center",
              borderWidth: 1,
              borderColor: isDark ? "rgba(16,185,129,0.20)" : "rgba(45,106,79,0.14)",
            }}>
            {isDark ? <Sun size={17} color={c.primary} /> : <Moon size={17} color={c.primary} />}
          </Pressable>
        </View>
      </View>

      <View style={{
        flexDirection: isRTL ? "row-reverse" : "row",
        gap: 10, marginBottom: 12,
      }}>
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
              {DAYS_STEADFAST}
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
              height: 5, backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
              borderRadius: 99, overflow: "hidden",
            }}>
              <View style={{
                width: `${progressPct}%`, height: "100%",
                backgroundColor: primaryColor, borderRadius: 99,
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
                {JOURNEY_TOTAL - DAYS_STEADFAST} للختم
              </Text>
            </View>
          </View>
        </View>

        <View style={[glass, {
          width: 100, padding: 12,
          alignItems: "center", justifyContent: "center",
        }]}>
          <PrayerRing isDark={isDark} c={c} />
          <Text style={{
            fontSize: 9, color: c.textMuted,
            fontFamily: "IBMPlexSansArabic_400Regular",
            marginTop: 6, textAlign: "center",
          }}>
            الصلاة القادمة
          </Text>
          <Text style={{
            fontSize: 10, color: primaryColor,
            fontFamily: "IBMPlexSansArabic_700Bold",
            textAlign: "center",
          }}>
            {NEXT_PRAYER.remaining} ساعة
          </Text>
        </View>
      </View>

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
            <Text style={{
              fontSize: 10, fontWeight: "700", color: primaryColor,
              fontFamily: "IBMPlexSansArabic_700Bold",
            }}>
              {current.type === "ayah" ? "آية كريمة" : "حديث شريف"}
            </Text>
          </View>
          <Text style={{
            fontSize: 11, color: c.textMuted,
            fontFamily: "IBMPlexSansArabic_500Medium",
          }}>
            {current.sourceAr}
          </Text>
        </View>

        <Text style={{
          fontSize: 19, lineHeight: 36, color: c.text,
          textAlign: "right",
          fontFamily: "Amiri_400Regular",
          letterSpacing: 0.2,
        }}>
          {current.textAr}
        </Text>
      </Animated.View>
    </View>
  );
}
