import { useState, useEffect, useCallback } from "react";
import { View, Text, Pressable, ScrollView, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeIn, FadeInDown, useSharedValue, useAnimatedStyle,
  withSpring, withTiming, withRepeat, withSequence,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColors } from "@/hooks/useColors";
import { useSettings } from "@/providers/SettingsProvider";
import { PageHeader } from "@/components/shared/PageHeader";
import { apiUrl } from "@/lib/api";
import { getSessionId } from "@/lib/session";

// Local tap count stored on device (it's a local interactive game element)
const LOCAL_TAP_KEY = "garden_local_taps_v2";

interface GardenStage {
  min: number; max: number; emoji: string; name: string;
  color: string; bg: string; desc: string;
}

const STAGES: GardenStage[] = [
  { min: 0,    max: 49,       emoji: "🌱", name: "بذرة",  color: "#a7f3d0", bg: "#022c22", desc: "رحلتك بدأت — كل ذكر يُحيي قلبك"         },
  { min: 50,   max: 199,      emoji: "🌿", name: "شتلة",  color: "#6ee7b7", bg: "#064e3b", desc: "شتلتك تنمو — واصل الذكر والاستغفار"       },
  { min: 200,  max: 499,      emoji: "🌳", name: "شجرة",  color: "#34d399", bg: "#065f46", desc: "شجرتك باسقة — ثمارها تطول السماء"         },
  { min: 500,  max: 999,      emoji: "🌲", name: "غابة",  color: "#10b981", bg: "#047857", desc: "غابتك أينعت — قلبٌ عامرٌ بذكر الله"       },
  { min: 1000, max: Infinity, emoji: "🏡", name: "جنّة",  color: "#34d399", bg: "#022c22", desc: "حديقتك من جنان الله — واصل رحلتك"        },
];

const MOTIVATIONS = [
  "كل ضغطة ذكر تُسقط ذنباً وتُنبت نوراً",
  "«ألا بذكر الله تطمئن القلوب» — الرعد: ٢٨",
  "ابنِ حديقتك — ذكرٌ فذكرٌ، يوماً فيوماً",
  "شجرتك في الجنة تنتظر — ابدأ الآن",
  "«من قال سبحان الله وبحمده غُرست له نخلة في الجنة»",
];

function getStage(total: number): GardenStage {
  return STAGES.find(s => total >= s.min && total <= s.max) ?? STAGES[0]!;
}

function ParticleView({ x, y }: { x: number; y: number }) {
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);
  useEffect(() => {
    translateY.value = withTiming(-60, { duration: 800 });
    opacity.value = withTiming(0, { duration: 800 });
  }, []);
  const style = useAnimatedStyle(() => ({
    position: "absolute", left: x - 10, top: y - 20,
    opacity: opacity.value, transform: [{ translateY: translateY.value }],
  }));
  return <Animated.View style={style}><Text style={{ fontSize: 18 }}>✨</Text></Animated.View>;
}

export default function GardenScreen() {
  const c = useColors();
  const { language } = useSettings();
  const isRTL = language === "ar";
  const isDark = c.isDark;

  // API-derived stats
  const [apiDhikr, setApiDhikr] = useState(0);          // from dhikr/count (today)
  const [journeyDays, setJourneyDays] = useState(0);     // from user/progress
  const [streakDays, setStreakDays] = useState(0);

  // Local interactive tap count (session-local, enhances the garden)
  const [localTaps, setLocalTaps] = useState(0);
  const [tapCount, setTapCount] = useState(0);           // just this session
  const [motivIdx, setMotivIdx] = useState(0);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number }[]>([]);

  const treeScale = useSharedValue(1);
  const glow = useSharedValue(0.6);

  const loadData = useCallback(async () => {
    try {
      const [sessionId, localRaw] = await Promise.all([
        getSessionId(),
        AsyncStorage.getItem(LOCAL_TAP_KEY),
      ]);
      if (localRaw) setLocalTaps(parseInt(localRaw) || 0);

      const [progressRes, dhikrRes, journeyRes] = await Promise.allSettled([
        fetch(apiUrl(`/user/progress?sessionId=${sessionId}`)),
        fetch(apiUrl(`/dhikr/count?sessionId=${sessionId}`)),
        fetch(apiUrl(`/user/journey?sessionId=${sessionId}`)),
      ]);

      if (progressRes.status === "fulfilled" && progressRes.value.ok) {
        const p = await progressRes.value.json() as { streakDays?: number; day40Progress?: number };
        setStreakDays(p.streakDays ?? 0);
      }
      if (dhikrRes.status === "fulfilled" && dhikrRes.value.ok) {
        const d = await dhikrRes.value.json() as { istighfar?: number; tasbih?: number; sayyid?: number };
        setApiDhikr((d.istighfar ?? 0) + (d.tasbih ?? 0) + (d.sayyid ?? 0));
      }
      if (journeyRes.status === "fulfilled" && journeyRes.value.ok) {
        const data = await journeyRes.value.json() as { days?: { completed: boolean }[] };
        setJourneyDays(data.days?.filter((d) => d.completed).length ?? 0);
      }
    } catch {}
  }, []);

  useEffect(() => {
    loadData();
    glow.value = withRepeat(withSequence(withTiming(1, { duration: 2000 }), withTiming(0.6, { duration: 2000 })), -1, true);
  }, [loadData]);

  // Total score: API dhikr today + local taps + journey days * 10 + streak * 5
  const totalScore = apiDhikr + localTaps + journeyDays * 10 + streakDays * 5;
  const stage = getStage(totalScore);

  const handleTap = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newTaps = localTaps + 1;
    setLocalTaps(newTaps);
    setTapCount(prev => prev + 1);
    await AsyncStorage.setItem(LOCAL_TAP_KEY, String(newTaps));

    treeScale.value = withSpring(1.1, { damping: 10, stiffness: 300 }, () => {
      treeScale.value = withSpring(1, { damping: 15, stiffness: 200 });
    });

    const w = Dimensions.get("window").width;
    const x = Math.random() * (w - 40) + 20;
    const id = Date.now();
    setParticles(prev => [...prev, { id, x, y: 200 }]);
    setTimeout(() => setParticles(prev => prev.filter(p => p.id !== id)), 1000);

    if (newTaps % 50 === 0) {
      setMotivIdx(i => (i + 1) % MOTIVATIONS.length);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const treeStyle = useAnimatedStyle(() => ({ transform: [{ scale: treeScale.value }] }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value }));

  const progressToNext = () => {
    const nextStage = STAGES.find(s => s.min > totalScore);
    if (!nextStage) return 100;
    return Math.min(((totalScore - stage.min) / (nextStage.min - stage.min)) * 100, 100);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={["top"]}>
      <PageHeader titleAr="حديقتي الروحية" subtitleAr="انمُ مع كل ذكر" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* Tree Visual */}
        <View style={{ borderRadius: 24, overflow: "hidden", marginBottom: 16, backgroundColor: isDark ? "#011a12" : "#F0FDF4", borderWidth: 1, borderColor: isDark ? "rgba(52,211,153,0.18)" : "rgba(16,185,129,0.2)", minHeight: 260, alignItems: "center", justifyContent: "center" }}>
          <Animated.View style={[glowStyle, { position: "absolute", width: 200, height: 200, borderRadius: 100, backgroundColor: stage.color + "18" }]} />
          <Animated.View style={treeStyle}>
            <Text style={{ fontSize: 100, lineHeight: 120, textAlign: "center" }}>{stage.emoji}</Text>
          </Animated.View>
          {particles.map(p => <ParticleView key={p.id} x={p.x} y={p.y} />)}
          <Text style={{ fontSize: 18, fontWeight: "800", color: stage.color, fontFamily: "IBMPlexSansArabic_700Bold", textAlign: "center", marginTop: 4 }}>{stage.name}</Text>
          <Text style={{ fontSize: 12, color: isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.5)", fontFamily: "IBMPlexSansArabic_400Regular", textAlign: "center", paddingHorizontal: 24, marginTop: 4, lineHeight: 20 }}>{stage.desc}</Text>
        </View>

        {/* Stats */}
        <View style={{ flexDirection: isRTL ? "row-reverse" : "row", gap: 10, marginBottom: 16 }}>
          {[
            { label: "أذكار اليوم",   value: apiDhikr.toLocaleString(),   color: "#10b981" },
            { label: "أيام الرحلة",   value: journeyDays.toString(),        color: "#F59E0B" },
            { label: "أيام التتابع",  value: streakDays.toString(),          color: "#8B5CF6" },
          ].map((stat, i) => (
            <View key={i} style={{ flex: 1, padding: 12, borderRadius: 14, backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", borderWidth: 1, borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)", alignItems: "center" }}>
              <Text style={{ fontSize: 18, fontWeight: "900", color: stat.color, fontFamily: "IBMPlexSansArabic_700Bold" }}>{stat.value}</Text>
              <Text style={{ fontSize: 9, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular", textAlign: "center", marginTop: 2 }}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Progress to next stage */}
        {STAGES.findIndex(s => s.min === stage.min) < STAGES.length - 1 && (
          <View style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: isRTL ? "row-reverse" : "row", justifyContent: "space-between", marginBottom: 6 }}>
              <Text style={{ fontSize: 11, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }}>التقدم للمرحلة التالية</Text>
              <Text style={{ fontSize: 11, color: "#10b981", fontWeight: "700", fontFamily: "IBMPlexSansArabic_700Bold" }}>{Math.round(progressToNext())}%</Text>
            </View>
            <View style={{ height: 8, borderRadius: 8, backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(16,185,129,0.12)", overflow: "hidden" }}>
              <View style={{ height: "100%", borderRadius: 8, backgroundColor: "#10b981", width: `${progressToNext()}%` }} />
            </View>
          </View>
        )}

        {/* Tap button */}
        <Pressable onPress={handleTap} style={{ height: 80, borderRadius: 22, alignItems: "center", justifyContent: "center", marginBottom: 16, backgroundColor: isDark ? "rgba(52,211,153,0.1)" : "rgba(16,185,129,0.09)", borderWidth: 2, borderColor: isDark ? "rgba(52,211,153,0.25)" : "rgba(16,185,129,0.25)" }}>
          <Text style={{ fontSize: 28 }}>📿</Text>
          <Text style={{ fontSize: 12, fontWeight: "700", color: "#10b981", fontFamily: "IBMPlexSansArabic_700Bold", marginTop: 2 }}>
            اضغط للتسبيح {tapCount > 0 ? `(${tapCount} هذه الجلسة)` : ""}
          </Text>
        </Pressable>

        {/* Motivation */}
        <View style={{ padding: 16, borderRadius: 18, backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(16,185,129,0.05)", borderWidth: 1, borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(16,185,129,0.15)" }}>
          <Text style={{ fontSize: 13, color: c.textSecondary, fontFamily: "Amiri_400Regular", textAlign: "center", lineHeight: 26, fontStyle: "italic" }}>
            {MOTIVATIONS[motivIdx]}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
