import { useState } from "react";
import { View, Text, ScrollView, Pressable, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useSettings } from "@/providers/SettingsProvider";
import { PageHeader } from "@/components/shared/PageHeader";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";

const CATEGORIES = [
  { id: "all", labelAr: "الكل", emoji: "✨" },
  { id: "morning", labelAr: "الصباح", emoji: "🌅" },
  { id: "evening", labelAr: "المساء", emoji: "🌙" },
  { id: "sleep", labelAr: "النوم", emoji: "💫" },
  { id: "prayer", labelAr: "الصلاة", emoji: "🕌" },
];

const ADHKAR_DATA = [
  {
    id: "1", category: "morning",
    arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ",
    transliterationEn: "Asbahna wa asbahal mulku lillah...",
    descAr: "قل حين تصبح", count: 1,
    accentL: "#C8963E", accentD: "#F59E0B",
  },
  {
    id: "2", category: "morning",
    arabic: "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ",
    transliterationEn: "Allahumma bika asbahna...",
    descAr: "دعاء الصباح الجامع", count: 1,
    accentL: "#C8963E", accentD: "#F59E0B",
  },
  {
    id: "3", category: "morning",
    arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    transliterationEn: "Subhanallahi wabihamdih",
    descAr: "تُمحى به الخطايا", count: 100,
    accentL: "#2D6A4F", accentD: "#34D399",
  },
  {
    id: "4", category: "evening",
    arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ",
    transliterationEn: "Amsayna wa amsal mulku lillah...",
    descAr: "قل حين تمسي", count: 1,
    accentL: "#7C3AED", accentD: "#A78BFA",
  },
  {
    id: "5", category: "evening",
    arabic: "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ",
    transliterationEn: "Allahumma bika amsayna...",
    descAr: "دعاء المساء الجامع", count: 1,
    accentL: "#7C3AED", accentD: "#A78BFA",
  },
  {
    id: "6", category: "sleep",
    arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
    transliterationEn: "Bismika Allahumma amutu wa ahya",
    descAr: "قبل النوم", count: 1,
    accentL: "#2563EB", accentD: "#60A5FA",
  },
  {
    id: "7", category: "sleep",
    arabic: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ",
    transliterationEn: "Allahumma qini adhabaka yawma tab'athu ibadak",
    descAr: "من أذكار النوم", count: 3,
    accentL: "#2563EB", accentD: "#60A5FA",
  },
  {
    id: "8", category: "prayer",
    arabic: "سُبْحَانَ اللَّهِ",
    transliterationEn: "Subhanallah",
    descAr: "بعد الصلاة", count: 33,
    accentL: "#2D6A4F", accentD: "#34D399",
  },
  {
    id: "9", category: "prayer",
    arabic: "الْحَمْدُ لِلَّهِ",
    transliterationEn: "Alhamdulillah",
    descAr: "بعد الصلاة", count: 33,
    accentL: "#2D6A4F", accentD: "#34D399",
  },
  {
    id: "10", category: "prayer",
    arabic: "اللَّهُ أَكْبَرُ",
    transliterationEn: "Allahu Akbar",
    descAr: "بعد الصلاة", count: 34,
    accentL: "#2D6A4F", accentD: "#34D399",
  },
  {
    id: "11", category: "prayer",
    arabic: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    transliterationEn: "La ilaha illallah wahdahu la sharika lahu...",
    descAr: "بعد التسبيح", count: 1,
    accentL: "#C8963E", accentD: "#F59E0B",
  },
];

function AdhkarCard({
  item,
  isDark,
  isRTL,
  onCountPress,
  c,
}: {
  item: (typeof ADHKAR_DATA)[0];
  isDark: boolean;
  isRTL: boolean;
  onCountPress: () => void;
  c: any;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const accent = isDark ? item.accentD : item.accentL;

  return (
    <Animated.View style={[animStyle, { marginBottom: 12 }]}>
      <View style={{
        borderRadius: 20,
        backgroundColor: isDark ? "rgba(14,14,14,0.92)" : "#FFFFFF",
        borderWidth: 1,
        borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
        overflow: "hidden",
      }}>
        <View style={{
          height: 3,
          backgroundColor: accent,
          opacity: 0.7,
        }} />
        <View style={{ padding: 18 }}>
          <View style={{ flexDirection: isRTL ? "row-reverse" : "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={{
              fontSize: 11, fontWeight: "700",
              color: accent,
              fontFamily: "IBMPlexSansArabic_700Bold",
            }}>
              {item.descAr}
            </Text>
            <View style={{
              paddingHorizontal: 10, paddingVertical: 4,
              borderRadius: 10,
              backgroundColor: accent + "18",
            }}>
              <Text style={{ fontSize: 11, color: accent, fontWeight: "700" }}>
                × {item.count}
              </Text>
            </View>
          </View>
          <Text style={{
            fontSize: 18, color: c.text,
            fontFamily: "Amiri_400Regular",
            textAlign: "center", lineHeight: 34, marginBottom: 14,
          }}>
            {item.arabic}
          </Text>
          <Pressable
            onPressIn={() => { scale.value = withSpring(0.97, { damping: 20, stiffness: 400 }); }}
            onPressOut={() => { scale.value = withSpring(1, { damping: 20, stiffness: 400 }); }}
            onPress={onCountPress}
            style={{
              paddingVertical: 10,
              borderRadius: 14,
              backgroundColor: accent + "14",
              borderWidth: 1,
              borderColor: accent + "30",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: "700", color: accent, fontFamily: "IBMPlexSansArabic_700Bold" }}>
              اضغط للتسبيح
            </Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

export default function AdhkarScreen() {
  const router = useRouter();
  const c = useColors();
  const { language } = useSettings();
  const isDark = c.isDark;
  const isRTL = language === "ar";

  const [activeCategory, setActiveCategory] = useState("all");

  const filtered = activeCategory === "all"
    ? ADHKAR_DATA
    : ADHKAR_DATA.filter((a) => a.category === activeCategory);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={["top"]}>
      <PageHeader
        titleAr="الأذكار المأثورة"
        subtitleAr={`${filtered.length} ذكر`}
        showBack
      />

      {/* Filter Tabs */}
      <View style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: c.divider }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, flexDirection: isRTL ? "row-reverse" : "row" }}
        >
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <Pressable
                key={cat.id}
                onPress={() => setActiveCategory(cat.id)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 12,
                  backgroundColor: isActive
                    ? (isDark ? c.primary : "#2D6A4F")
                    : (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"),
                  borderWidth: 1,
                  borderColor: isActive
                    ? "transparent"
                    : (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"),
                }}
              >
                <Text style={{ fontSize: 14 }}>{cat.emoji}</Text>
                <Text style={{
                  fontSize: 12, fontWeight: "700",
                  color: isActive ? "#fff" : c.textSecondary,
                  fontFamily: "IBMPlexSansArabic_700Bold",
                }}>
                  {cat.labelAr}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <AdhkarCard
            item={item}
            isDark={isDark}
            isRTL={isRTL}
            c={c}
            onCountPress={() =>
              router.push({
                pathname: "/dhikr/counter",
                params: { arabic: item.arabic, count: item.count, category: item.category },
              } as any)
            }
          />
        )}
      />
    </SafeAreaView>
  );
}
