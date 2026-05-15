import { useState } from "react";
import { View, Text, Pressable, ScrollView, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Users, Plus, BookOpen, CheckCircle2, Trophy, TrendingUp } from "lucide-react-native";
import { useColors } from "@/hooks/useColors";
import { useSettings } from "@/providers/SettingsProvider";
import { PageHeader } from "@/components/shared/PageHeader";

interface GroupKhatma {
  id: string;
  name: string;
  emoji: string;
  members: number;
  totalJuz: number;
  completedJuz: number;
  myJuz: number[];
  accentColor: string;
  deadline: string;
}

const MOCK_KHATMAT: GroupKhatma[] = [
  {
    id: "k1", name: "ختمة العائلة", emoji: "👨‍👩‍👧‍👦",
    members: 8, totalJuz: 30, completedJuz: 21, myJuz: [3, 7, 14],
    accentColor: "#10b981", deadline: "3 أيام متبقية",
  },
  {
    id: "k2", name: "ختمة الأصدقاء", emoji: "🤝",
    members: 5, totalJuz: 30, completedJuz: 12, myJuz: [2, 11],
    accentColor: "#8B5CF6", deadline: "7 أيام متبقية",
  },
  {
    id: "k3", name: "ختمة رمضان ١٤٤٦", emoji: "🌙",
    members: 30, totalJuz: 30, completedJuz: 30, myJuz: [1],
    accentColor: "#F59E0B", deadline: "مكتملة ✓",
  },
];

const JUZ_NAMES: Record<number, string> = {
  1: "الم", 2: "سيقول", 3: "تلك", 4: "لن تنالوا", 5: "والمحصنات",
  6: "لا يحب", 7: "وإذا سمعوا", 8: "ولو أننا", 9: "قال الملأ", 10: "واعلموا",
  11: "يعتذرون", 12: "وما من دابة", 13: "وما أبرئ", 14: "ربما", 15: "سبحان",
  16: "قال ألم", 17: "اقترب", 18: "قد أفلح", 19: "وقال الذين", 20: "أمن خلق",
  21: "اتل ما أوحي", 22: "ومن يقنت", 23: "وما لي", 24: "فمن أظلم", 25: "إليه يرد",
  26: "حم", 27: "قال فما خطبكم", 28: "قد سمع", 29: "تبارك", 30: "عم",
};

function KhatmaCard({ khatma, isRTL, isDark, c }: { khatma: GroupKhatma; isRTL: boolean; isDark: boolean; c: any }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const acc = khatma.accentColor;
  const progressPct = (khatma.completedJuz / khatma.totalJuz) * 100;
  const isComplete = khatma.completedJuz === khatma.totalJuz;

  return (
    <Animated.View style={[animStyle, { marginBottom: 14 }]}>
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.98); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        style={{ borderRadius: 20, backgroundColor: isDark ? "rgba(14,14,14,0.92)" : "#fff", borderWidth: 1.5,
          borderColor: isComplete ? `${acc}50` : (isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"), overflow: "hidden" }}>
        <View style={{ height: 3, backgroundColor: acc }} />
        <View style={{ padding: 16 }}>
          <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: `${acc}15`, borderWidth: 1, borderColor: `${acc}25`, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 22 }}>{khatma.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: "800", color: c.text, fontFamily: "IBMPlexSansArabic_700Bold" }}>{khatma.name}</Text>
              <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 10, marginTop: 3 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                  <Users size={11} color={c.textMuted} />
                  <Text style={{ fontSize: 10, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }}>{khatma.members}</Text>
                </View>
                <Text style={{ fontSize: 10, color: isComplete ? c.emerald : acc, fontWeight: "700", fontFamily: "IBMPlexSansArabic_700Bold" }}>{khatma.deadline}</Text>
              </View>
            </View>
            {isComplete && <CheckCircle2 size={22} color={c.emerald} />}
          </View>

          <View style={{ height: 8, borderRadius: 8, backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)", overflow: "hidden", marginBottom: 6 }}>
            <View style={{ height: "100%", borderRadius: 8, backgroundColor: acc, width: `${progressPct}%` }} />
          </View>
          <View style={{ flexDirection: isRTL ? "row-reverse" : "row", justifyContent: "space-between", marginBottom: 14 }}>
            <Text style={{ fontSize: 11, color: acc, fontWeight: "700", fontFamily: "IBMPlexSansArabic_700Bold" }}>{khatma.completedJuz} / {khatma.totalJuz} جزء</Text>
            <Text style={{ fontSize: 11, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }}>{Math.round(progressPct)}% مكتمل</Text>
          </View>

          <View style={{ marginBottom: 14 }}>
            <Text style={{ fontSize: 11, fontWeight: "700", color: c.text, fontFamily: "IBMPlexSansArabic_700Bold", marginBottom: 8, textAlign: isRTL ? "right" : "left" }}>أجزائي المخصصة:</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
              {khatma.myJuz.map(juz => (
                <View key={juz} style={{ paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, backgroundColor: `${acc}18`, borderWidth: 1, borderColor: `${acc}30` }}>
                  <Text style={{ fontSize: 10, fontWeight: "700", color: acc, fontFamily: "IBMPlexSansArabic_700Bold" }}>جزء {juz} · {JUZ_NAMES[juz] ?? ""}</Text>
                </View>
              ))}
            </View>
          </View>

          {!isComplete && (
            <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
              style={{ paddingVertical: 10, borderRadius: 14, alignItems: "center", backgroundColor: `${acc}14`, borderWidth: 1, borderColor: `${acc}25` }}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: acc, fontFamily: "IBMPlexSansArabic_700Bold" }}>تسجيل قراءة اليوم</Text>
            </Pressable>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function QuranKhatmatPage() {
  const c = useColors();
  const { language } = useSettings();
  const isRTL = language === "ar";
  const isDark = c.isDark;
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={["top"]}>
      <PageHeader
        titleAr="الختمات الجماعية"
        subtitleAr="اجتمعوا على كتاب الله"
        rightAction={
          <Pressable onPress={() => { setShowNew(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
            style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: "rgba(16,185,129,0.14)", borderWidth: 1, borderColor: "rgba(16,185,129,0.25)", alignItems: "center", justifyContent: "center" }}>
            <Plus size={18} color={c.primary} />
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: isRTL ? "row-reverse" : "row", gap: 10, marginBottom: 16 }}>
          {[
            { icon: "📚", label: "ختمات نشطة", value: "2", color: "#10b981" },
            { icon: "✅", label: "ختمات مكتملة", value: "1", color: "#F59E0B" },
            { icon: "📖", label: "أجزاء قرأتها", value: "6", color: "#8B5CF6" },
          ].map((stat, i) => (
            <View key={i} style={{ flex: 1, padding: 12, borderRadius: 14, backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)", borderWidth: 1, borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)", alignItems: "center" }}>
              <Text style={{ fontSize: 16 }}>{stat.icon}</Text>
              <Text style={{ fontSize: 16, fontWeight: "800", color: stat.color, fontFamily: "IBMPlexSansArabic_700Bold", marginTop: 2 }}>{stat.value}</Text>
              <Text style={{ fontSize: 9, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular", textAlign: "center", marginTop: 2 }}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {showNew && (
          <Animated.View entering={FadeInDown.duration(300)} style={{ padding: 16, borderRadius: 18, backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#F0FDF4", borderWidth: 1, borderColor: "rgba(16,185,129,0.2)", marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: "800", color: c.text, fontFamily: "IBMPlexSansArabic_700Bold", marginBottom: 10, textAlign: isRTL ? "right" : "left" }}>ختمة جماعية جديدة</Text>
            <TextInput value={newName} onChangeText={setNewName} placeholder="اسم الختمة..." placeholderTextColor={c.textMuted}
              style={{ borderWidth: 1, borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, color: c.text, fontFamily: "IBMPlexSansArabic_400Regular", textAlign: isRTL ? "right" : "left", marginBottom: 10 }} />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Pressable onPress={() => { setShowNew(false); setNewName(""); }}
                style={{ flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: "center", backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)" }}>
                <Text style={{ fontSize: 13, color: c.textSecondary, fontFamily: "IBMPlexSansArabic_400Regular" }}>إلغاء</Text>
              </Pressable>
              <Pressable onPress={() => { setShowNew(false); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }}
                style={{ flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: "center", backgroundColor: c.primary }}>
                <Text style={{ fontSize: 13, fontWeight: "800", color: "#fff", fontFamily: "IBMPlexSansArabic_700Bold" }}>إنشاء</Text>
              </Pressable>
            </View>
          </Animated.View>
        )}

        {MOCK_KHATMAT.map((k, i) => (
          <Animated.View key={k.id} entering={FadeInDown.delay(i * 70).springify()}>
            <KhatmaCard khatma={k} isRTL={isRTL} isDark={isDark} c={c} />
          </Animated.View>
        ))}

        <View style={{ padding: 18, borderRadius: 20, backgroundColor: isDark ? "rgba(16,185,129,0.05)" : "#F0FDF4", borderWidth: 1, borderColor: "rgba(16,185,129,0.15)", marginTop: 4 }}>
          <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 10 }}>
            <Trophy size={20} color={c.primary} />
            <Text style={{ flex: 1, fontSize: 14, fontFamily: "Amiri_400Regular", color: c.text, lineHeight: 28, textAlign: isRTL ? "right" : "left" }}>
              «مَثَلُ الَّذِي يَقْرَأُ الْقُرْآنَ وَهُوَ حَافِظٌ لَهُ مَعَ السَّفَرَةِ الْكِرَامِ الْبَرَرَةِ»
            </Text>
          </View>
          <Text style={{ fontSize: 11, color: c.primary, fontFamily: "IBMPlexSansArabic_400Regular", marginTop: 6, textAlign: isRTL ? "right" : "left" }}>متفق عليه</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
