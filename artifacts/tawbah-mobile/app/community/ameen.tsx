import { useState, useEffect } from "react";
import { View, Text, Pressable, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeInDown, useSharedValue, useAnimatedStyle, withSpring, withTiming, withSequence,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Heart, Clock, Users, PenLine, X } from "lucide-react-native";
import { useColors } from "@/hooks/useColors";
import { useSettings } from "@/providers/SettingsProvider";
import { PageHeader } from "@/components/shared/PageHeader";

interface DuaPost {
  id: string;
  text: string;
  authorAr: string;
  timeAgo: string;
  ameenCount: number;
  didAmeen: boolean;
}

const INITIAL_DUAS: DuaPost[] = [
  { id: "1", text: "اللهم اغفر لي ولوالديّ وللمسلمين والمسلمات", authorAr: "أخ من مصر", timeAgo: "منذ دقيقتين", ameenCount: 47, didAmeen: false },
  { id: "2", text: "ربي اجعلني وذريتي من المقيمين الصلاة وتقبّل دعاء", authorAr: "أخت من السعودية", timeAgo: "منذ 5 دقائق", ameenCount: 128, didAmeen: false },
  { id: "3", text: "اللهم اشفِ مرضانا ومرضى المسلمين شفاءً لا يُغادر سقماً", authorAr: "أخ من المغرب", timeAgo: "منذ 12 دقيقة", ameenCount: 89, didAmeen: true },
  { id: "4", text: "اللهم ثبّتنا على التوبة حتى نلقاك وأنت راضٍ عنا", authorAr: "أخت من الإمارات", timeAgo: "منذ 18 دقيقة", ameenCount: 203, didAmeen: false },
  { id: "5", text: "ربي لا تُؤاخذنا إن نسينا أو أخطأنا، وتب علينا إنك أنت التواب الرحيم", authorAr: "أخ من الأردن", timeAgo: "منذ 25 دقيقة", ameenCount: 156, didAmeen: false },
  { id: "6", text: "اللهم اجعل القرآن ربيع قلوبنا ونور صدورنا وجلاء أحزاننا", authorAr: "أخت من تونس", timeAgo: "منذ 31 دقيقة", ameenCount: 74, didAmeen: false },
  { id: "7", text: "اللهم يسّر لنا التوبة النصوح وأعنّا على ذكرك وشكرك وحسن عبادتك", authorAr: "أخ من الكويت", timeAgo: "منذ 40 دقيقة", ameenCount: 91, didAmeen: false },
];

function DuaCard({ item, isRTL, isDark, c, onAmeen }: { item: DuaPost; isRTL: boolean; isDark: boolean; c: any; onAmeen: (id: string) => void }) {
  const scale = useSharedValue(1);
  const heartScale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const heartStyle = useAnimatedStyle(() => ({ transform: [{ scale: heartScale.value }] }));

  const handleAmeen = () => {
    if (!item.didAmeen) {
      heartScale.value = withSequence(withSpring(1.4, { damping: 8 }), withSpring(1, { damping: 12 }));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onAmeen(item.id);
  };

  return (
    <Animated.View style={[animStyle, { marginBottom: 10 }]}>
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.98); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        onPress={handleAmeen}
        style={{ borderRadius: 18, backgroundColor: isDark ? "rgba(14,14,14,0.92)" : "#fff", borderWidth: 1.5,
          borderColor: item.didAmeen ? "rgba(245,158,11,0.35)" : (isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"), padding: 14 }}>
        {item.didAmeen && <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, borderRadius: 17, backgroundColor: "rgba(245,158,11,0.04)" }} />}

        <Text style={{ fontSize: 15, fontFamily: "Amiri_400Regular", color: c.text, textAlign: isRTL ? "right" : "left", lineHeight: 30, marginBottom: 12 }}>
          {item.text}
        </Text>

        <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 10 }}>
            <View style={{ width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)" }}>
              <Text style={{ fontSize: 12 }}>🤲</Text>
            </View>
            <View>
              <Text style={{ fontSize: 11, color: c.text, fontFamily: "IBMPlexSansArabic_700Bold", fontWeight: "700" }}>{item.authorAr}</Text>
              <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 4, marginTop: 1 }}>
                <Clock size={10} color={c.textMuted} />
                <Text style={{ fontSize: 10, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }}>{item.timeAgo}</Text>
              </View>
            </View>
          </View>

          <Animated.View style={heartStyle}>
            <Pressable onPress={handleAmeen}
              style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12,
                backgroundColor: item.didAmeen ? "rgba(245,158,11,0.15)" : (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"),
                borderWidth: 1, borderColor: item.didAmeen ? "rgba(245,158,11,0.35)" : (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)") }}>
              <Heart size={14} color={item.didAmeen ? "#F59E0B" : c.textMuted} fill={item.didAmeen ? "#F59E0B" : "transparent"} />
              <Text style={{ fontSize: 12, fontWeight: "700", color: item.didAmeen ? "#F59E0B" : c.textSecondary, fontFamily: "IBMPlexSansArabic_700Bold" }}>
                آمين · {item.ameenCount}
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function AmeenScreen() {
  const c = useColors();
  const { language } = useSettings();
  const isRTL = language === "ar";
  const isDark = c.isDark;
  const [duas, setDuas] = useState<DuaPost[]>(INITIAL_DUAS);
  const [totalAmeens, setTotalAmeens] = useState(duas.reduce((sum, d) => sum + d.ameenCount, 0));

  const handleAmeen = (id: string) => {
    setDuas(prev => prev.map(d => {
      if (d.id !== id) return d;
      const didAmeen = !d.didAmeen;
      setTotalAmeens(t => didAmeen ? t + 1 : t - 1);
      return { ...d, didAmeen, ameenCount: didAmeen ? d.ameenCount + 1 : d.ameenCount - 1 };
    }));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={["top"]}>
      <PageHeader titleAr="آمين الجماعية" subtitleAr="ادعُ فيؤمّن عليك آلاف المسلمين" />

      <View style={{ paddingHorizontal: 16, paddingBottom: 10 }}>
        <View style={{ flexDirection: isRTL ? "row-reverse" : "row", gap: 10 }}>
          <View style={{ flex: 1, padding: 12, borderRadius: 14, backgroundColor: isDark ? "rgba(245,158,11,0.07)" : "#FFFBEB", borderWidth: 1, borderColor: "rgba(245,158,11,0.2)", alignItems: "center" }}>
            <Heart size={14} color="#F59E0B" />
            <Text style={{ fontSize: 16, fontWeight: "900", color: "#F59E0B", fontFamily: "IBMPlexSansArabic_700Bold", marginTop: 2 }}>{totalAmeens.toLocaleString()}</Text>
            <Text style={{ fontSize: 9, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }}>إجمالي آمين</Text>
          </View>
          <View style={{ flex: 1, padding: 12, borderRadius: 14, backgroundColor: isDark ? "rgba(16,185,129,0.07)" : "#F0FDF4", borderWidth: 1, borderColor: "rgba(16,185,129,0.2)", alignItems: "center" }}>
            <Users size={14} color="#10b981" />
            <Text style={{ fontSize: 16, fontWeight: "900", color: "#10b981", fontFamily: "IBMPlexSansArabic_700Bold", marginTop: 2 }}>2.4K</Text>
            <Text style={{ fontSize: 9, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }}>مشارك الآن</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={duas}
        keyExtractor={d => d.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
            <DuaCard item={item} isRTL={isRTL} isDark={isDark} c={c} onAmeen={handleAmeen} />
          </Animated.View>
        )}
        ListFooterComponent={
          <View style={{ padding: 16, borderRadius: 18, alignItems: "center", backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", borderWidth: 1, borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)" }}>
            <Text style={{ fontSize: 14, fontFamily: "Amiri_400Regular", color: c.textSecondary, textAlign: "center", lineHeight: 28 }}>
              «الدعاء مخّ العبادة»
            </Text>
            <Text style={{ fontSize: 11, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular", marginTop: 4 }}>رواه الترمذي</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
