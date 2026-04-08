import { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Trophy, Users, Flame, CheckCircle2, Lock, ChevronRight } from "lucide-react-native";
import { useColors } from "@/hooks/useColors";
import { useSettings } from "@/providers/SettingsProvider";
import { PageHeader } from "@/components/shared/PageHeader";

interface Challenge {
  id: string;
  emoji: string;
  titleAr: string;
  descAr: string;
  duration: string;
  participants: number;
  progress: number;
  total: number;
  accentColor: string;
  locked: boolean;
  type: "active" | "upcoming" | "completed";
}

const CHALLENGES: Challenge[] = [
  {
    id: "c1", emoji: "📖", titleAr: "تحدي الجزء يومياً",
    descAr: "اقرأ جزءاً كاملاً من القرآن كل يوم لمدة 30 يوم",
    duration: "30 يوماً", participants: 1284, progress: 14, total: 30,
    accentColor: "#10b981", locked: false, type: "active",
  },
  {
    id: "c2", emoji: "🌅", titleAr: "تحدي الفجر",
    descAr: "صلّ الفجر في وقتها 21 يوماً متتالياً مع الجماعة",
    duration: "21 يوماً", participants: 876, progress: 8, total: 21,
    accentColor: "#F59E0B", locked: false, type: "active",
  },
  {
    id: "c3", emoji: "📿", titleAr: "تحدي الألف تسبيحة",
    descAr: "سبّح الله ألف مرة في اليوم لمدة 7 أيام",
    duration: "7 أيام", participants: 2341, progress: 7, total: 7,
    accentColor: "#8B5CF6", locked: false, type: "completed",
  },
  {
    id: "c4", emoji: "🌙", titleAr: "تحدي رمضان",
    descAr: "اختم القرآن مرة كاملة خلال شهر رمضان",
    duration: "30 يوماً", participants: 5210, progress: 0, total: 30,
    accentColor: "#6366F1", locked: true, type: "upcoming",
  },
  {
    id: "c5", emoji: "🤲", titleAr: "تحدي ختمة الشهر",
    descAr: "اختم القرآن خلال شهر كامل بقراءة جزء كل يوم",
    duration: "30 يوماً", participants: 3124, progress: 0, total: 30,
    accentColor: "#2563EB", locked: true, type: "upcoming",
  },
];

function ChallengeCard({ challenge, isRTL, isDark, c }: { challenge: Challenge; isRTL: boolean; isDark: boolean; c: any }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const accent = challenge.accentColor;
  const progressPct = challenge.total > 0 ? (challenge.progress / challenge.total) * 100 : 0;

  const typeLabel = challenge.type === "completed" ? "مكتمل" : challenge.type === "upcoming" ? "قريباً" : "جارٍ";
  const typeBg = challenge.type === "completed" ? "rgba(16,185,129,0.15)" : challenge.type === "upcoming" ? "rgba(100,100,100,0.15)" : `${accent}18`;
  const typeColor = challenge.type === "completed" ? "#10b981" : challenge.type === "upcoming" ? c.textMuted : accent;

  return (
    <Animated.View style={[animStyle, { marginBottom: 12 }]}>
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.98, { damping: 20, stiffness: 400 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 20, stiffness: 400 }); }}
        onPress={() => { if (!challenge.locked) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
        style={{ borderRadius: 20, backgroundColor: isDark ? "rgba(14,14,14,0.92)" : "#FFFFFF", borderWidth: 1,
          borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)", overflow: "hidden",
          opacity: challenge.locked ? 0.7 : 1 }}>
        <View style={{ height: 3, backgroundColor: accent, opacity: 0.8 }} />
        <View style={{ padding: 16 }}>
          <View style={{ flexDirection: isRTL ? "row-reverse" : "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 10, flex: 1 }}>
              <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: `${accent}15`, borderWidth: 1, borderColor: `${accent}25`, alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontSize: 20 }}>{challenge.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: "800", color: c.text, fontFamily: "IBMPlexSansArabic_700Bold" }}>{challenge.titleAr}</Text>
                <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 4, marginTop: 3 }}>
                  <Users size={11} color={c.textMuted} />
                  <Text style={{ fontSize: 11, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }}>{challenge.participants.toLocaleString()} مشارك</Text>
                </View>
              </View>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, backgroundColor: typeBg }}>
                <Text style={{ fontSize: 10, fontWeight: "700", color: typeColor, fontFamily: "IBMPlexSansArabic_700Bold" }}>{typeLabel}</Text>
              </View>
              {challenge.locked && <Lock size={14} color={c.textMuted} />}
            </View>
          </View>

          <Text style={{ fontSize: 12, color: c.textSecondary, fontFamily: "IBMPlexSansArabic_400Regular", textAlign: isRTL ? "right" : "left", marginBottom: 12, lineHeight: 20 }}>
            {challenge.descAr}
          </Text>

          {challenge.type !== "upcoming" && (
            <>
              <View style={{ height: 6, borderRadius: 6, backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)", overflow: "hidden", marginBottom: 6 }}>
                <View style={{ height: "100%", borderRadius: 6, backgroundColor: accent, width: `${progressPct}%` }} />
              </View>
              <View style={{ flexDirection: isRTL ? "row-reverse" : "row", justifyContent: "space-between" }}>
                <Text style={{ fontSize: 11, color: accent, fontWeight: "700", fontFamily: "IBMPlexSansArabic_700Bold" }}>{challenge.progress} / {challenge.total} يوم</Text>
                <Text style={{ fontSize: 11, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }}>{Math.round(progressPct)}%</Text>
              </View>
            </>
          )}

          {challenge.type === "upcoming" && (
            <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 6, paddingVertical: 8, borderRadius: 10, backgroundColor: `${accent}08`, justifyContent: "center" }}>
              <Flame size={13} color={accent} />
              <Text style={{ fontSize: 12, color: accent, fontWeight: "700", fontFamily: "IBMPlexSansArabic_700Bold" }}>انضم للقائمة المنتظرة</Text>
            </View>
          )}

          {challenge.type === "active" && (
            <Pressable
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
              style={{ marginTop: 10, paddingVertical: 10, borderRadius: 14, backgroundColor: `${accent}14`, borderWidth: 1, borderColor: `${accent}25`, alignItems: "center" }}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: accent, fontFamily: "IBMPlexSansArabic_700Bold" }}>تسجيل تقدم اليوم</Text>
            </Pressable>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function QuranChallengesPage() {
  const c = useColors();
  const { language } = useSettings();
  const isRTL = language === "ar";
  const isDark = c.isDark;
  const [activeTab, setActiveTab] = useState<"active" | "all">("active");

  const shown = activeTab === "active"
    ? CHALLENGES.filter(ch => ch.type === "active" || ch.type === "completed")
    : CHALLENGES;

  const totalParticipants = CHALLENGES.reduce((sum, ch) => sum + ch.participants, 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={["top"]}>
      <PageHeader titleAr="تحديات القراءة" subtitleAr="تنافس وافتح أبواب الخير" />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: isRTL ? "row-reverse" : "row", gap: 10, marginBottom: 18 }}>
          {[
            { label: "المشاركون", value: `${(totalParticipants / 1000).toFixed(1)}K`, color: "#10b981" },
            { label: "التحديات", value: CHALLENGES.length.toString(), color: "#F59E0B" },
            { label: "مكتملة", value: CHALLENGES.filter(c => c.type === "completed").length.toString(), color: "#8B5CF6" },
          ].map((stat, i) => (
            <View key={i} style={{ flex: 1, padding: 12, borderRadius: 14, backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", borderWidth: 1, borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)", alignItems: "center" }}>
              <Text style={{ fontSize: 20, fontWeight: "800", color: stat.color, fontFamily: "IBMPlexSansArabic_700Bold" }}>{stat.value}</Text>
              <Text style={{ fontSize: 10, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular", marginTop: 2 }}>{stat.label}</Text>
            </View>
          ))}
        </View>

        <View style={{ flexDirection: isRTL ? "row-reverse" : "row", gap: 8, marginBottom: 16 }}>
          {[{ id: "active" as const, label: "نشطة" }, { id: "all" as const, label: "الكل" }].map(tab => (
            <Pressable key={tab.id} onPress={() => setActiveTab(tab.id)}
              style={{ flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: "center",
                backgroundColor: activeTab === tab.id ? (isDark ? "rgba(16,185,129,0.2)" : "#2D6A4F") : (isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"),
                borderWidth: 1, borderColor: activeTab === tab.id ? "rgba(16,185,129,0.4)" : (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)") }}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: activeTab === tab.id ? "#fff" : c.textSecondary, fontFamily: "IBMPlexSansArabic_700Bold" }}>{tab.label}</Text>
            </Pressable>
          ))}
        </View>

        {shown.map((ch, i) => (
          <Animated.View key={ch.id} entering={FadeInDown.delay(i * 60).springify()}>
            <ChallengeCard challenge={ch} isRTL={isRTL} isDark={isDark} c={c} />
          </Animated.View>
        ))}

        <View style={{ padding: 18, borderRadius: 20, backgroundColor: isDark ? "rgba(245,158,11,0.05)" : "#FFF9EA", borderWidth: 1, borderColor: isDark ? "rgba(245,158,11,0.15)" : "rgba(200,150,62,0.2)", marginTop: 4 }}>
          <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 10 }}>
            <Trophy size={20} color="#F59E0B" />
            <Text style={{ flex: 1, fontSize: 13, color: c.text, fontFamily: "IBMPlexSansArabic_700Bold", fontWeight: "700" }}>
              أنشئ تحديك الخاص
            </Text>
            <ChevronRight size={16} color={c.textMuted} />
          </View>
          <Text style={{ fontSize: 12, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular", marginTop: 6, textAlign: isRTL ? "right" : "left" }}>
            شارك الخير مع أصدقائك وأسّس مجموعة قرآنية
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
