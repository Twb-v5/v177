import { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { ChevronDown, ChevronUp, Heart, BookOpen, Star } from "lucide-react-native";
import { useColors } from "@/hooks/useColors";
import { useSettings } from "@/providers/SettingsProvider";
import { PageHeader } from "@/components/shared/PageHeader";

type TabId = "ayat" | "hadith" | "qasas";

interface ContentItem {
  id: string;
  title: string;
  text: string;
  source: string;
  category?: string;
}

const AYAT: ContentItem[] = [
  { id: "a1", title: "سعة رحمة الله", text: "قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ ۚ إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا ۚ إِنَّهُ هُوَ الْغَفُورُ الرَّحِيمُ", source: "الزمر: ٥٣", category: "رحمة" },
  { id: "a2", title: "قبول التوبة مضمون", text: "وَهُوَ الَّذِي يَقْبَلُ التَّوْبَةَ عَنْ عِبَادِهِ وَيَعْفُو عَنِ السَّيِّئَاتِ وَيَعْلَمُ مَا تَفْعَلُونَ", source: "الشورى: ٢٥", category: "توبة" },
  { id: "a3", title: "الله يفرح بتوبتك", text: "إِنَّ اللَّهَ يُحِبُّ التَّوَّابِينَ وَيُحِبُّ الْمُتَطَهِّرِينَ", source: "البقرة: ٢٢٢", category: "رحمة" },
  { id: "a4", title: "لا يأس من رحمة الله", text: "إِنَّهُ لَا يَيْأَسُ مِن رَّوْحِ اللَّهِ إِلَّا الْقَوْمُ الْكَافِرُونَ", source: "يوسف: ٨٧", category: "رجاء" },
  { id: "a5", title: "باب التوبة مفتوح", text: "وَإِنِّي لَغَفَّارٌ لِّمَن تَابَ وَآمَنَ وَعَمِلَ صَالِحًا ثُمَّ اهْتَدَىٰ", source: "طه: ٨٢", category: "توبة" },
  { id: "a6", title: "الأعمال تُبدَّل", text: "إِلَّا مَن تَابَ وَآمَنَ وَعَمِلَ عَمَلًا صَالِحًا فَأُولَٰئِكَ يُبَدِّلُ اللَّهُ سَيِّئَاتِهِمْ حَسَنَاتٍ", source: "الفرقان: ٧٠", category: "توبة" },
];

const HADITH: ContentItem[] = [
  { id: "h1", title: "فرحة الله بالتائب", text: "لَلَّهُ أَشَدُّ فَرَحًا بِتَوْبَةِ عَبْدِهِ حِينَ يَتُوبُ إِلَيْهِ مِنْ أَحَدِكُمْ كَانَ عَلَى رَاحِلَتِهِ بِأَرْضِ فَلاةٍ فَانْفَلَتَتْ مِنْهُ وَعَلَيْهَا طَعَامُهُ وَشَرَابُهُ", source: "رواه مسلم" },
  { id: "h2", title: "كل بني آدم خطّاء", text: "كُلُّ بَنِي آدَمَ خَطَّاءٌ وَخَيْرُ الْخَطَّائِينَ التَّوَّابُونَ", source: "رواه الترمذي، صحيح" },
  { id: "h3", title: "الله يغفر الذنوب جميعاً", text: "يَا ابْنَ آدَمَ إِنَّكَ مَا دَعَوْتَنِي وَرَجَوْتَنِي غَفَرْتُ لَكَ عَلَى مَا كَانَ فِيكَ وَلَا أُبَالِي", source: "رواه الترمذي، حسن صحيح" },
  { id: "h4", title: "التائب حبيب الله", text: "التَّائِبُ مِنَ الذَّنْبِ كَمَنْ لَا ذَنْبَ لَهُ", source: "رواه ابن ماجه، حسن" },
  { id: "h5", title: "الله يبسط يده بالليل والنهار", text: "إنَّ اللهَ يَبسُطُ يَدَهُ بالليلِ لِيتوبَ مُسيءُ النَّهارِ، ويَبسُطُ يَدَهُ بالنَّهارِ لِيتوبَ مُسيءُ الليلِ", source: "رواه مسلم" },
  { id: "h6", title: "باب التوبة لا يُغلق", text: "مَنْ تَابَ قَبْلَ أَنْ تَطْلُعَ الشَّمْسُ مِنْ مَغْرِبِهَا تَابَ اللَّهُ عَلَيْهِ", source: "رواه مسلم" },
];

const QASAS: ContentItem[] = [
  {
    id: "q1", title: "قاتل المئة",
    text: "رجل قتل مئة نفس ثم سأل عن أعلم أهل الأرض فدُلَّ على راهب فذهب إليه وقال: هل من توبة؟ قال لا. فقتله. ثم دُلَّ على عالم آخر فسأله فقال: نعم، من يحول بينك وبين التوبة؟ فتوجّه إلى أرض الصالحين فأدركه الموت في الطريق فاختصمت فيه ملائكة الرحمة وملائكة العذاب، فنظروا كم كان بينه وبين الأرض الصالحة، فوجدوه أقرب إليها شبراً، فغفر الله له ودخل الجنة.",
    source: "متفق عليه", category: "رجاء"
  },
  {
    id: "q2", title: "البغيّ التي سقت كلباً",
    text: "رأت بغيٌّ كلباً يلهث من العطش فسقته بخفّها ماءً من بئر — فشكر الله لها وغفر لها. قيل: يا رسول الله، وإن لنا في البهائم أجراً؟ قال: «في كل ذات كبد رطبة أجر».",
    source: "متفق عليه", category: "رحمة"
  },
  {
    id: "q3", title: "نبيّ الله يونس في بطن الحوت",
    text: "ابتُلع يونس ﵇ في بطن الحوت في ظلمات ثلاث، فنادى ربّه: «لَا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ» فاستجاب الله له ونجّاه وردّه مرسلاً إلى قومه فآمنوا جميعاً.",
    source: "الأنبياء: ٨٧–٨٨", category: "توبة"
  },
  {
    id: "q4", title: "توبة الذي اغتاب",
    text: "جاء رجل إلى الحسن البصري وقال: فعلتُ ما فعلتُ، فهل لي من توبة؟ فقال الحسن: نعم، إن الله لم يضع التوبة إلا لمن أراد قبولها. ارجع فتُب، فإنّ الله يقبل التوبة عن عباده ويعفو عن السيئات.",
    source: "سير أعلام النبلاء", category: "رجاء"
  },
];

const TABS: Array<{ id: TabId; labelAr: string; emoji: string; count: number }> = [
  { id: "ayat",   labelAr: "آيات الرجاء",   emoji: "📗", count: AYAT.length   },
  { id: "hadith", labelAr: "أحاديث الرجاء", emoji: "📿", count: HADITH.length },
  { id: "qasas",  labelAr: "قصص التوبة",    emoji: "📖", count: QASAS.length  },
];

function ContentCard({ item, isDark, c, isRTL }: { item: ContentItem; isDark: boolean; c: ReturnType<typeof useColors>; isRTL: boolean }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={{ marginBottom: 10, borderRadius: 18, backgroundColor: isDark ? "rgba(14,14,14,0.92)" : "#fff", borderWidth: 1, borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)", overflow: "hidden" }}>
      <View style={{ height: 2, backgroundColor: "#10b981", opacity: 0.6 }} />
      <Pressable
        onPress={() => { setExpanded(e => !e); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
        style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", padding: 14, gap: 12 }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 13, fontWeight: "800", color: c.text, fontFamily: "IBMPlexSansArabic_700Bold", textAlign: isRTL ? "right" : "left" }}>{item.title}</Text>
          {item.category && (
            <View style={{ alignSelf: isRTL ? "flex-end" : "flex-start", marginTop: 4 }}>
              <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, backgroundColor: "rgba(16,185,129,0.1)" }}>
                <Text style={{ fontSize: 9, color: "#10b981", fontFamily: "IBMPlexSansArabic_700Bold" }}>{item.category}</Text>
              </View>
            </View>
          )}
        </View>
        {expanded ? <ChevronUp size={16} color={c.textMuted} /> : <ChevronDown size={16} color={c.textMuted} />}
      </Pressable>
      {expanded && (
        <Animated.View entering={FadeIn.duration(200)} style={{ paddingHorizontal: 14, paddingBottom: 14 }}>
          <View style={{ height: 1, backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", marginBottom: 12 }} />
          <Text style={{ fontSize: 14, color: c.text, fontFamily: "IBMPlexSansArabic_400Regular", lineHeight: 26, textAlign: isRTL ? "right" : "left" }}>
            {item.text}
          </Text>
          <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 6, marginTop: 10 }}>
            <Star size={11} color={c.accent} />
            <Text style={{ fontSize: 11, color: c.accent, fontFamily: "IBMPlexSansArabic_700Bold" }}>{item.source}</Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

export default function RajaaScreen() {
  const c = useColors();
  const { language } = useSettings();
  const isRTL = language === "ar";
  const isDark = c.isDark;
  const [activeTab, setActiveTab] = useState<TabId>("ayat");

  const items = activeTab === "ayat" ? AYAT : activeTab === "hadith" ? HADITH : QASAS;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={["top"]}>
      <PageHeader titleAr="مكتبة الرجاء" subtitleAr="آيات وأحاديث تعزّز الأمل" />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <Animated.View entering={FadeInDown.delay(0).springify()} style={{ marginHorizontal: 16, marginTop: 14, marginBottom: 16 }}>
          <View style={{ borderRadius: 20, padding: 20, backgroundColor: isDark ? "rgba(16,185,129,0.08)" : "rgba(16,185,129,0.05)", borderWidth: 1, borderColor: isDark ? "rgba(16,185,129,0.18)" : "rgba(16,185,129,0.2)", alignItems: "center" }}>
            <Text style={{ fontSize: 36, marginBottom: 10 }}>🌅</Text>
            <Text style={{ fontSize: 15, fontWeight: "800", color: c.text, fontFamily: "IBMPlexSansArabic_700Bold", textAlign: "center", marginBottom: 6 }}>
              «لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ»
            </Text>
            <Text style={{ fontSize: 12, color: c.textSecondary, fontFamily: "IBMPlexSansArabic_400Regular", textAlign: "center" }}>
              مهما كانت ذنوبك، رحمة الله أوسع منها
            </Text>
          </View>
        </Animated.View>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: isRTL ? "row-reverse" : "row", gap: 10, paddingHorizontal: 16, marginBottom: 16 }}>
          {TABS.map(tab => (
            <Pressable key={tab.id} onPress={() => { setActiveTab(tab.id); Haptics.selectionAsync(); }}
              style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, backgroundColor: activeTab === tab.id ? (isDark ? "rgba(16,185,129,0.2)" : "rgba(45,106,79,0.1)") : (isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"), borderWidth: 1, borderColor: activeTab === tab.id ? "#10b981" : c.divider }}>
              <Text style={{ fontSize: 14 }}>{tab.emoji}</Text>
              <Text style={{ fontSize: 12, fontWeight: "700", color: activeTab === tab.id ? "#10b981" : c.textSecondary, fontFamily: "IBMPlexSansArabic_700Bold" }}>{tab.labelAr}</Text>
              <View style={{ paddingHorizontal: 6, paddingVertical: 1, borderRadius: 8, backgroundColor: activeTab === tab.id ? "rgba(16,185,129,0.2)" : (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)") }}>
                <Text style={{ fontSize: 9, color: activeTab === tab.id ? "#10b981" : c.textMuted, fontFamily: "IBMPlexSansArabic_700Bold" }}>{tab.count}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        {/* Content */}
        <View style={{ paddingHorizontal: 16 }}>
          {items.map((item, i) => (
            <Animated.View key={item.id} entering={FadeInDown.delay(i * 40).springify()}>
              <ContentCard item={item} isDark={isDark} c={c} isRTL={isRTL} />
            </Animated.View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
