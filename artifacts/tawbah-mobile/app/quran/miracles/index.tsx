import { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeInDown, useSharedValue, useAnimatedStyle, withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Sparkles, ChevronDown, ChevronUp, Zap, Globe, Atom, Waves, Star } from "lucide-react-native";
import { useColors } from "@/hooks/useColors";
import { useSettings } from "@/providers/SettingsProvider";
import { PageHeader } from "@/components/shared/PageHeader";

interface Miracle {
  id: string;
  emoji: string;
  titleAr: string;
  ayah: string;
  surah: string;
  bodyAr: string;
  category: "science" | "math" | "cosmic" | "ocean" | "biology";
  accent: string;
}

const MIRACLES: Miracle[] = [
  {
    id: "expansion",
    emoji: "🌌",
    titleAr: "توسع الكون",
    ayah: "وَالسَّمَاءَ بَنَيْنَاهَا بِأَيْدٍ وَإِنَّا لَمُوسِعُونَ",
    surah: "الذاريات: ٤٧",
    bodyAr: "أثبت العلم الحديث أن الكون يتوسع باستمرار. اكتشف هابل هذه الحقيقة عام ١٩٢٩م، بينما أخبرنا القرآن بذلك قبل ١٤ قرناً.",
    category: "cosmic",
    accent: "#A78BFA",
  },
  {
    id: "iron",
    emoji: "⚙️",
    titleAr: "الحديد من الفضاء",
    ayah: "وَأَنزَلْنَا الْحَدِيدَ فِيهِ بَأْسٌ شَدِيدٌ وَمَنَافِعُ لِلنَّاسِ",
    surah: "الحديد: ٢٥",
    bodyAr: "أثبت العلماء أن الحديد لم يتشكل على الأرض بل جاء من النجوم المنهارة (السوبرنوفا). كلمة «أنزلنا» تعبّر بدقة عن هذا الأصل الكوني.",
    category: "cosmic",
    accent: "#60A5FA",
  },
  {
    id: "embryo",
    emoji: "🧬",
    titleAr: "أطوار الجنين",
    ayah: "خَلَقَكُم مِّن نَّفْسٍ وَاحِدَةٍ ثُمَّ جَعَلَ مِنْهَا زَوْجَهَا",
    surah: "الزمر: ٦",
    bodyAr: "وصف القرآن مراحل تطور الجنين (نطفة، علقة، مضغة، عظام، كسوة اللحم) بدقة علمية لم تُكتشف إلا في القرن العشرين بالمجهر.",
    category: "biology",
    accent: "#34D399",
  },
  {
    id: "mountains",
    emoji: "⛰️",
    titleAr: "الجبال أوتاد",
    ayah: "وَالْجِبَالَ أَوْتَادًا",
    surah: "النبأ: ٧",
    bodyAr: "كشفت الجيولوجيا أن للجبال جذوراً عميقة في باطن الأرض كالأوتاد تُثبّت القشرة وتمنع اهتزازها. ما أخبرنا به القرآن منذ ١٤ قرناً.",
    category: "science",
    accent: "#F59E0B",
  },
  {
    id: "ocean",
    emoji: "🌊",
    titleAr: "ظلمات البحر",
    ayah: "أَوْ كَظُلُمَاتٍ فِي بَحْرٍ لُّجِّيٍّ يَغْشَاهُ مَوْجٌ مِّن فَوْقِهِ مَوْجٌ",
    surah: "النور: ٤٠",
    bodyAr: "أثبت العلم وجود أمواج داخلية في أعماق البحار، وأن الظلمة التامة تبدأ من ٢٠٠م عمق. لا يمكن رؤيته دون تكنولوجيا حديثة.",
    category: "ocean",
    accent: "#38BDF8",
  },
  {
    id: "fingerprint",
    emoji: "👆",
    titleAr: "فريدة البصمة",
    ayah: "بَلَىٰ قَادِرِينَ عَلَىٰ أَن نُّسَوِّيَ بَنَانَهُ",
    surah: "القيامة: ٤",
    bodyAr: "تحدّث القرآن عن قدرة الله على تسوية أطراف الأصابع بدقة — وهو إشارة علمية واضحة لفريدة بصمة الأصبع التي اكتشفها العلم عام ١٨٨٠م.",
    category: "biology",
    accent: "#F87171",
  },
  {
    id: "number19",
    emoji: "🔢",
    titleAr: "الإعجاز العددي ١٩",
    ayah: "عَلَيْهَا تِسْعَةَ عَشَرَ",
    surah: "المدثر: ٣٠",
    bodyAr: "رقم ١٩ يتكرر في القرآن بنظام رياضي دقيق: عدد حروف البسملة ١٩، كلمة «الله» ٢٦٩٨ = ١٩×١٤٢، وكلمة «القرآن» ٥٧ = ١٩×٣.",
    category: "math",
    accent: "#818CF8",
  },
  {
    id: "smoke",
    emoji: "💨",
    titleAr: "الكون من دخان",
    ayah: "ثُمَّ اسْتَوَىٰ إِلَى السَّمَاءِ وَهِيَ دُخَانٌ",
    surah: "فصلت: ١١",
    bodyAr: "أكّد علم الكونيات أن الكون بدأ غازاً ساخناً كثيفاً (تعبير الدخان يصف الحالة البدائية بدقة). جاء هذا الاكتشاف في القرن العشرين.",
    category: "cosmic",
    accent: "#CBD5E1",
  },
];

const CATEGORIES = [
  { id: "all",     labelAr: "الكل",     emoji: "✨" },
  { id: "cosmic",  labelAr: "كونية",    emoji: "🌌" },
  { id: "science", labelAr: "علمية",    emoji: "🔬" },
  { id: "biology", labelAr: "أحياء",    emoji: "🧬" },
  { id: "ocean",   labelAr: "بحرية",    emoji: "🌊" },
  { id: "math",    labelAr: "رياضية",   emoji: "🔢" },
];

function MiracleCard({ m, isDark, index }: { m: Miracle; isDark: boolean; index: number }) {
  const [open, setOpen] = useState(false);
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).springify()} style={anim}>
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.97, { damping: 20, stiffness: 400 }); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 18, stiffness: 350 }); }}
        onPress={() => { setOpen(o => !o); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}
        style={{
          borderRadius: 20, overflow: "hidden",
          backgroundColor: isDark ? "rgba(14,14,14,0.95)" : "rgba(255,255,255,0.95)",
          borderWidth: 1.5, borderColor: `${m.accent}30`,
          marginBottom: 12,
          shadowColor: m.accent, shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
          elevation: 4,
        }}
      >
        <View style={{ position: "absolute", inset: 0, backgroundColor: `${m.accent}10` }} />
        <View style={{ padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            {open ? <ChevronUp size={18} color={m.accent} /> : <ChevronDown size={18} color={m.accent} />}
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1, justifyContent: "flex-end" }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: "800", color: m.accent, fontFamily: "IBMPlexSansArabic_700Bold", textAlign: "right" }}>
                {m.titleAr}
              </Text>
              <Text style={{ fontSize: 10, color: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)", fontFamily: "IBMPlexSansArabic_400Regular", textAlign: "right", marginTop: 2 }}>
                {m.surah}
              </Text>
            </View>
            <View style={{
              width: 42, height: 42, borderRadius: 12,
              backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
              alignItems: "center", justifyContent: "center",
              borderWidth: 1, borderColor: `${m.accent}20`,
            }}>
              <Text style={{ fontSize: 20 }}>{m.emoji}</Text>
            </View>
          </View>
        </View>
        {open && (
          <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
            <View style={{
              borderRadius: 14, padding: 14,
              backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
              borderWidth: 1, borderColor: `${m.accent}20`,
              marginBottom: 12,
            }}>
              <Text style={{
                fontSize: 15, color: m.accent, fontFamily: "IBMPlexSansArabic_700Bold",
                lineHeight: 26, textAlign: "right",
              }}>
                {m.ayah}
              </Text>
            </View>
            <Text style={{
              fontSize: 13, color: isDark ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,0.6)",
              fontFamily: "IBMPlexSansArabic_400Regular", lineHeight: 22, textAlign: "right",
            }}>
              {m.bodyAr}
            </Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

export default function MiraclesScreen() {
  const c = useColors();
  const { language } = useSettings();
  const [category, setCategory] = useState("all");
  const isDark = c.isDark;

  const filtered = category === "all" ? MIRACLES : MIRACLES.filter(m => m.category === category);

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <PageHeader titleAr="إعجاز القرآن" subtitleAr="علمي · عددي · كوني" />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

          {/* Hero */}
          <Animated.View entering={FadeInDown.delay(60).springify()} style={{ paddingHorizontal: 20, marginTop: 20, marginBottom: 20 }}>
            <View style={{
              borderRadius: 24, padding: 22, overflow: "hidden",
              backgroundColor: isDark ? "rgba(139,92,246,0.12)" : "rgba(139,92,246,0.08)",
              borderWidth: 1.5, borderColor: "rgba(139,92,246,0.25)",
            }}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 10, marginBottom: 10 }}>
                <Text style={{ fontSize: 16, fontWeight: "800", color: "#A78BFA", fontFamily: "IBMPlexSansArabic_700Bold" }}>
                  آيات تتحدى العلم
                </Text>
                <Sparkles size={20} color="#A78BFA" />
              </View>
              <Text style={{ fontSize: 12, color: c.textSecondary, fontFamily: "IBMPlexSansArabic_400Regular", lineHeight: 20, textAlign: "right" }}>
                حقائق علمية أثبتها البشر في القرون الأخيرة، ذكرها القرآن الكريم منذ أكثر من ١٤ قرناً
              </Text>
            </View>
          </Animated.View>

          {/* Category Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8, flexDirection: "row", marginBottom: 16 }}>
            {CATEGORIES.map((cat, i) => {
              const active = category === cat.id;
              return (
                <Animated.View key={cat.id} entering={FadeInDown.delay(80 + i * 40).springify()}>
                  <Pressable
                    onPress={() => { setCategory(cat.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                    style={{
                      flexDirection: "row", alignItems: "center", gap: 5,
                      paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
                      backgroundColor: active
                        ? (isDark ? "rgba(139,92,246,0.25)" : "rgba(139,92,246,0.12)")
                        : (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"),
                      borderWidth: 1,
                      borderColor: active ? "rgba(139,92,246,0.4)" : c.divider,
                    }}
                  >
                    <Text style={{ fontSize: 12 }}>{cat.emoji}</Text>
                    <Text style={{ fontSize: 12, color: active ? "#A78BFA" : c.textSecondary, fontWeight: active ? "700" : "400", fontFamily: "IBMPlexSansArabic_700Bold" }}>
                      {cat.labelAr}
                    </Text>
                  </Pressable>
                </Animated.View>
              );
            })}
          </ScrollView>

          {/* List */}
          <View style={{ paddingHorizontal: 20 }}>
            {filtered.map((m, i) => <MiracleCard key={m.id} m={m} isDark={isDark} index={i} />)}
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
