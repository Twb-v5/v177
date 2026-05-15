import { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring, withRepeat, withTiming, withSequence } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Users, Radio, Lock, Mic, MicOff, LogIn } from "lucide-react-native";
import { useColors } from "@/hooks/useColors";
import { useSettings } from "@/providers/SettingsProvider";
import { PageHeader } from "@/components/shared/PageHeader";

interface DhikrRoom {
  id: string;
  name: string;
  dhikr: string;
  count: number;
  members: number;
  maxMembers: number;
  isLive: boolean;
  isPrivate: boolean;
  category: "morning" | "evening" | "quran" | "general";
  accentColor: string;
}

const ROOMS: DhikrRoom[] = [
  { id: "r1", name: "حلقة الفجر", dhikr: "سبحان الله وبحمده", count: 1247, members: 34, maxMembers: 50, isLive: true, isPrivate: false, category: "morning", accentColor: "#F59E0B" },
  { id: "r2", name: "ذكر المساء الجماعي", dhikr: "أستغفر الله العظيم", count: 8832, members: 67, maxMembers: 100, isLive: true, isPrivate: false, category: "evening", accentColor: "#8B5CF6" },
  { id: "r3", name: "ختمة القرآن الأسبوعية", dhikr: "تلاوة سورة البقرة", count: 430, members: 12, maxMembers: 30, isLive: true, isPrivate: false, category: "quran", accentColor: "#10b981" },
  { id: "r4", name: "المجلس الخاص", dhikr: "لا إله إلا الله", count: 500, members: 5, maxMembers: 10, isLive: false, isPrivate: true, category: "general", accentColor: "#60A5FA" },
  { id: "r5", name: "حلقة الاستغفار", dhikr: "أستغفر الله وأتوب إليه", count: 3200, members: 22, maxMembers: 50, isLive: true, isPrivate: false, category: "general", accentColor: "#34D399" },
];

const CAT_EMOJIS: Record<string, string> = {
  morning: "🌅", evening: "🌙", quran: "📖", general: "📿",
};

function RoomCard({ room, isRTL, isDark, c, onJoin }: { room: DhikrRoom; isRTL: boolean; isDark: boolean; c: any; onJoin: (id: string) => void }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const acc = room.accentColor;
  const pct = (room.members / room.maxMembers) * 100;

  return (
    <Animated.View style={[animStyle, { marginBottom: 10 }]}>
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.98); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        onPress={() => { onJoin(room.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}
        style={{ borderRadius: 20, backgroundColor: isDark ? "rgba(14,14,14,0.92)" : "#fff", borderWidth: 1, borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <View style={{ height: 3, backgroundColor: acc }} />
        <View style={{ padding: 16 }}>
          <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
            <View style={{ width: 46, height: 46, borderRadius: 16, backgroundColor: `${acc}15`, borderWidth: 1, borderColor: `${acc}25`, alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 22 }}>{CAT_EMOJIS[room.category] ?? "📿"}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <Text style={{ fontSize: 14, fontWeight: "800", color: c.text, fontFamily: "IBMPlexSansArabic_700Bold" }}>{room.name}</Text>
                {room.isLive && (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: "rgba(239,68,68,0.15)" }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#ef4444" }} />
                    <Text style={{ fontSize: 9, fontWeight: "700", color: "#ef4444", fontFamily: "IBMPlexSansArabic_700Bold" }}>مباشر</Text>
                  </View>
                )}
                {room.isPrivate && <Lock size={12} color={c.textMuted} />}
              </View>
              <Text style={{ fontSize: 12, color: acc, fontFamily: "Amiri_400Regular", marginTop: 3, textAlign: isRTL ? "right" : "left" }}>{room.dhikr}</Text>
            </View>
          </View>

          <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 4 }}>
              <Users size={12} color={c.textMuted} />
              <Text style={{ fontSize: 11, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }}>{room.members} / {room.maxMembers}</Text>
            </View>
            <Text style={{ fontSize: 12, fontWeight: "800", color: acc, fontFamily: "IBMPlexSansArabic_700Bold" }}>{room.count.toLocaleString()} ذكر</Text>
          </View>

          <View style={{ height: 5, borderRadius: 5, backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)", overflow: "hidden", marginBottom: 12 }}>
            <View style={{ height: "100%", borderRadius: 5, backgroundColor: acc, width: `${pct}%` }} />
          </View>

          <Pressable onPress={() => { onJoin(room.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}
            style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 14, backgroundColor: `${acc}14`, borderWidth: 1, borderColor: `${acc}25` }}>
            <LogIn size={14} color={acc} />
            <Text style={{ fontSize: 13, fontWeight: "700", color: acc, fontFamily: "IBMPlexSansArabic_700Bold" }}>{room.isPrivate ? "طلب انضمام" : "انضم للحلقة"}</Text>
          </Pressable>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function DhikrRoomsScreen() {
  const c = useColors();
  const { language } = useSettings();
  const isRTL = language === "ar";
  const isDark = c.isDark;
  const [joinedRoom, setJoinedRoom] = useState<string | null>(null);

  const handleJoin = (id: string) => {
    setJoinedRoom(joinedRoom === id ? null : id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const liveRooms = ROOMS.filter(r => r.isLive);
  const totalMembers = liveRooms.reduce((sum, r) => sum + r.members, 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={["top"]}>
      <PageHeader titleAr="حلقات الذكر" subtitleAr="اذكر الله مع آلاف المسلمين" />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: isRTL ? "row-reverse" : "row", gap: 10, marginBottom: 16 }}>
          {[
            { label: "حلقات نشطة", value: liveRooms.length.toString(), color: "#ef4444", icon: "🔴" },
            { label: "في الحلقات الآن", value: totalMembers.toString(), color: c.primary, icon: "👥" },
            { label: "الذكر الجماعي", value: "∞", color: "#F59E0B", icon: "📿" },
          ].map((stat, i) => (
            <View key={i} style={{ flex: 1, padding: 12, borderRadius: 14, backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", borderWidth: 1, borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)", alignItems: "center" }}>
              <Text style={{ fontSize: 16 }}>{stat.icon}</Text>
              <Text style={{ fontSize: 15, fontWeight: "900", color: stat.color, fontFamily: "IBMPlexSansArabic_700Bold", marginTop: 2 }}>{stat.value}</Text>
              <Text style={{ fontSize: 9, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular", textAlign: "center", marginTop: 2 }}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {ROOMS.map((room, i) => (
          <Animated.View key={room.id} entering={FadeInDown.delay(i * 60).springify()}>
            <RoomCard room={room} isRTL={isRTL} isDark={isDark} c={c} onJoin={handleJoin} />
          </Animated.View>
        ))}

        <View style={{ padding: 18, borderRadius: 20, backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", borderWidth: 1, borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)", marginTop: 4 }}>
          <Text style={{ fontSize: 15, fontFamily: "Amiri_400Regular", color: c.text, textAlign: "center", lineHeight: 32 }}>
            «مَا جَلَسَ قَوْمٌ يَذْكُرُونَ اللهَ إِلَّا حَفَّتْهُمُ الْمَلَائِكَةُ»
          </Text>
          <Text style={{ fontSize: 11, color: c.primary, fontFamily: "IBMPlexSansArabic_400Regular", textAlign: "center", marginTop: 6 }}>رواه مسلم</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
