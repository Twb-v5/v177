import { useState } from "react";
import { View, Text, ScrollView, Pressable, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useSettings } from "@/providers/SettingsProvider";
import { PageHeader } from "@/components/shared/PageHeader";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

const CATEGORIES = [
  { id: "all", labelAr: "الكل", emoji: "✨" },
  { id: "morning", labelAr: "الصباح", emoji: "🌅" },
  { id: "evening", labelAr: "المساء", emoji: "🌙" },
  { id: "sleep", labelAr: "النوم", emoji: "💫" },
  { id: "prayer", labelAr: "الصلاة", emoji: "🕌" },
  { id: "quran", labelAr: "القرآن", emoji: "📖" },
  { id: "food", labelAr: "الطعام", emoji: "🍽️" },
  { id: "travel", labelAr: "السفر", emoji: "🚗" },
  { id: "dua", labelAr: "الدعاء", emoji: "🤲" },
  { id: "protection", labelAr: "الحماية", emoji: "🛡️" },
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
    descAr: "تُمحى به الخطايا — صباحاً", count: 100,
    accentL: "#2D6A4F", accentD: "#34D399",
  },
  {
    id: "4", category: "morning",
    arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
    transliterationEn: "Allahumma anta rabbi la ilaha illa ant...",
    descAr: "سيد الاستغفار — من قاله موقناً ودخل الجنة", count: 1,
    accentL: "#B45309", accentD: "#FBBF24",
  },
  {
    id: "5", category: "morning",
    arabic: "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَهَ إِلَّا أَنتَ",
    transliterationEn: "Allahumma 'afini fi badani...",
    descAr: "دعاء العافية — صباحاً ومساءً", count: 3,
    accentL: "#2563EB", accentD: "#60A5FA",
  },
  {
    id: "6", category: "evening",
    arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ",
    transliterationEn: "Amsayna wa amsal mulku lillah...",
    descAr: "قل حين تمسي", count: 1,
    accentL: "#7C3AED", accentD: "#A78BFA",
  },
  {
    id: "7", category: "evening",
    arabic: "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ",
    transliterationEn: "Allahumma bika amsayna...",
    descAr: "دعاء المساء الجامع", count: 1,
    accentL: "#7C3AED", accentD: "#A78BFA",
  },
  {
    id: "8", category: "evening",
    arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
    transliterationEn: "Subhanallahi wabihamdih",
    descAr: "تُمحى به الخطايا — مساءً", count: 100,
    accentL: "#7C3AED", accentD: "#A78BFA",
  },
  {
    id: "9", category: "evening",
    arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
    transliterationEn: "A'udhu bikalimati-llahi at-tammat min sharri ma khalaq",
    descAr: "حماية المساء — ثلاث مرات", count: 3,
    accentL: "#DC2626", accentD: "#F87171",
  },
  {
    id: "10", category: "sleep",
    arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
    transliterationEn: "Bismika Allahumma amutu wa ahya",
    descAr: "قبل النوم", count: 1,
    accentL: "#2563EB", accentD: "#60A5FA",
  },
  {
    id: "11", category: "sleep",
    arabic: "اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ",
    transliterationEn: "Allahumma qini adhabaka yawma tab'athu ibadak",
    descAr: "من أذكار النوم", count: 3,
    accentL: "#2563EB", accentD: "#60A5FA",
  },
  {
    id: "12", category: "sleep",
    arabic: "اللَّهُمَّ بِاسْمِكَ أَحْيَا وَبِاسْمِكَ أَمُوتُ",
    transliterationEn: "Allahumma bismika ahya wa bismika amut",
    descAr: "عند الاستيقاظ", count: 1,
    accentL: "#0891B2", accentD: "#22D3EE",
  },
  {
    id: "13", category: "sleep",
    arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ — قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ — قُلْ أَعُوذُ بِرَبِّ النَّاسِ",
    transliterationEn: "Al-Ikhlas, Al-Falaq, An-Nas",
    descAr: "المعوذات قبل النوم — ثلاث مرات", count: 3,
    accentL: "#2D6A4F", accentD: "#34D399",
  },
  {
    id: "14", category: "prayer",
    arabic: "سُبْحَانَ اللَّهِ",
    transliterationEn: "Subhanallah",
    descAr: "بعد الصلاة", count: 33,
    accentL: "#2D6A4F", accentD: "#34D399",
  },
  {
    id: "15", category: "prayer",
    arabic: "الْحَمْدُ لِلَّهِ",
    transliterationEn: "Alhamdulillah",
    descAr: "بعد الصلاة", count: 33,
    accentL: "#2D6A4F", accentD: "#34D399",
  },
  {
    id: "16", category: "prayer",
    arabic: "اللَّهُ أَكْبَرُ",
    transliterationEn: "Allahu Akbar",
    descAr: "بعد الصلاة", count: 34,
    accentL: "#2D6A4F", accentD: "#34D399",
  },
  {
    id: "17", category: "prayer",
    arabic: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ",
    transliterationEn: "La ilaha illallah wahdahu la sharika lahu...",
    descAr: "بعد التسبيح", count: 1,
    accentL: "#C8963E", accentD: "#F59E0B",
  },
  {
    id: "18", category: "prayer",
    arabic: "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ",
    transliterationEn: "Allahumma a'inni 'ala dhikrika wa shukrika wa husni 'ibadatik",
    descAr: "دعاء بعد كل صلاة — موصى به النبي ﷺ", count: 1,
    accentL: "#7C3AED", accentD: "#A78BFA",
  },
  {
    id: "19", category: "quran",
    arabic: "آيَةُ الْكُرْسِيّ: اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ...",
    transliterationEn: "Ayat al-Kursi",
    descAr: "بعد كل صلاة مكتوبة — من قرأها دخل الجنة", count: 1,
    accentL: "#B45309", accentD: "#FBBF24",
  },
  {
    id: "20", category: "quran",
    arabic: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    transliterationEn: "Bismillah ir-rahman ir-rahim",
    descAr: "قبل قراءة القرآن", count: 1,
    accentL: "#2D6A4F", accentD: "#34D399",
  },
  {
    id: "21", category: "food",
    arabic: "بِسْمِ اللَّهِ",
    transliterationEn: "Bismillah",
    descAr: "قبل الأكل", count: 1,
    accentL: "#D97706", accentD: "#FCD34D",
  },
  {
    id: "22", category: "food",
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ",
    transliterationEn: "Alhamdulillah alladhi at'amana wa saqana wa ja'alana muslimin",
    descAr: "بعد الطعام", count: 1,
    accentL: "#D97706", accentD: "#FCD34D",
  },
  {
    id: "23", category: "travel",
    arabic: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَٰذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَىٰ رَبِّنَا لَمُنقَلِبُونَ",
    transliterationEn: "Subhana-lladhi sakhkhara lana hadha...",
    descAr: "دعاء ركوب السيارة", count: 1,
    accentL: "#0891B2", accentD: "#22D3EE",
  },
  {
    id: "24", category: "travel",
    arabic: "اللَّهُمَّ هَوِّنْ عَلَيْنَا سَفَرَنَا هَذَا وَاطْوِ عَنَّا بُعْدَهُ",
    transliterationEn: "Allahumma hawwin 'alayna safarana hadha...",
    descAr: "دعاء السفر", count: 1,
    accentL: "#0891B2", accentD: "#22D3EE",
  },
  {
    id: "25", category: "dua",
    arabic: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ",
    transliterationEn: "Rabbana atina fid-dunya hasanah...",
    descAr: "أكثر الأدعية في القرآن", count: 1,
    accentL: "#2D6A4F", accentD: "#34D399",
  },
  {
    id: "26", category: "dua",
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْجَنَّةَ وَأَعُوذُ بِكَ مِنَ النَّارِ",
    transliterationEn: "Allahumma inni as'aluka al-jannata wa a'udhu bika min an-nar",
    descAr: "دعاء الجنة والنار", count: 3,
    accentL: "#C8963E", accentD: "#F59E0B",
  },
  {
    id: "27", category: "dua",
    arabic: "اللَّهُمَّ اغْفِرْ لِي وَارْحَمْنِي وَاهْدِنِي وَعَافِنِي وَارْزُقْنِي",
    transliterationEn: "Allahumma ighfir li warhamni wahdini wa 'afini warzuqni",
    descAr: "دعاء جامع للخيرات", count: 1,
    accentL: "#7C3AED", accentD: "#A78BFA",
  },
  {
    id: "28", category: "protection",
    arabic: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ",
    transliterationEn: "A'udhu billahi min ash-shaytani r-rajim",
    descAr: "عند الغضب أو الوسوسة", count: 1,
    accentL: "#DC2626", accentD: "#F87171",
  },
  {
    id: "29", category: "protection",
    arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
    transliterationEn: "Bismillah alladhi la yadurru ma'a ismihi shay'un...",
    descAr: "حصن الصباح والمساء — ثلاث مرات", count: 3,
    accentL: "#DC2626", accentD: "#F87171",
  },
  {
    id: "30", category: "protection",
    arabic: "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ",
    transliterationEn: "Hasbiya-llahu la ilaha illa huwa...",
    descAr: "ذكر الحسبلة — سبع مرات", count: 7,
    accentL: "#DC2626", accentD: "#F87171",
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
        <View style={{ height: 3, backgroundColor: accent, opacity: 0.7 }} />
        <View style={{ padding: 18 }}>
          <View style={{ flexDirection: isRTL ? "row-reverse" : "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={{
              fontSize: 11, fontWeight: "700",
              color: accent,
              fontFamily: "IBMPlexSansArabic_700Bold",
              flex: 1,
              textAlign: isRTL ? "right" : "left",
            }}>
              {item.descAr}
            </Text>
            <View style={{
              paddingHorizontal: 10, paddingVertical: 4,
              borderRadius: 10,
              backgroundColor: accent + "18",
              marginRight: isRTL ? 8 : 0,
              marginLeft: isRTL ? 0 : 8,
            }}>
              <Text style={{ fontSize: 11, color: accent, fontWeight: "700" }}>
                × {item.count}
              </Text>
            </View>
          </View>
          <Text style={{
            fontSize: 17, color: c.text,
            fontFamily: "Amiri_400Regular",
            textAlign: "center", lineHeight: 32, marginBottom: 14,
          }}>
            {item.arabic}
          </Text>
          <Pressable
            onPressIn={() => { scale.value = withSpring(0.97, { damping: 20, stiffness: 400 }); }}
            onPressOut={() => { scale.value = withSpring(1, { damping: 20, stiffness: 400 }); }}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onCountPress();
            }}
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
                onPress={() => { Haptics.selectionAsync(); setActiveCategory(cat.id); }}
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
