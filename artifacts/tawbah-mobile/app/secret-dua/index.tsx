import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, TextInput, KeyboardAvoidingView, Platform, Animated as RNAnimated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PenLine, Trash2, Moon, Star, Lock } from "lucide-react-native";
import { useColors } from "@/hooks/useColors";
import { useSettings } from "@/providers/SettingsProvider";
import { PageHeader } from "@/components/shared/PageHeader";

const STORAGE_KEY = "secret_duas_v1";

interface SecretDua {
  id: string;
  text: string;
  createdAt: number;
}

const DUA_PROMPTS = [
  "اللهم اغفر لي ذنوبي كلها...",
  "اللهم أعني على طاعتك...",
  "اللهم ثبّت قلبي على دينك...",
  "اللهم اجعل توبتي صادقة...",
  "اللهم احفظني من الشيطان ومن نفسي...",
  "اللهم أرني الحق حقاً وارزقني اتباعه...",
  "اللهم إني أسألك حسن الخاتمة...",
  "اللهم اجعلني ممن تتوب عليهم...",
];

function getRandomPrompt() {
  return DUA_PROMPTS[Math.floor(Math.random() * DUA_PROMPTS.length)] ?? DUA_PROMPTS[0];
}

function formatDate(ts: number): string {
  try { return new Date(ts).toLocaleDateString("ar-SA", { weekday: "short", month: "short", day: "numeric" }); }
  catch { return ""; }
}

export default function SecretDuaScreen() {
  const c = useColors();
  const { language } = useSettings();
  const isRTL = language === "ar";
  const isDark = c.isDark;

  const [duas, setDuas] = useState<SecretDua[]>([]);
  const [writing, setWriting] = useState(false);
  const [text, setText] = useState("");
  const [prompt] = useState(getRandomPrompt());

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) setDuas(JSON.parse(raw) as SecretDua[]);
    });
  }, []);

  const save = async (items: SecretDua[]) => {
    setDuas(items);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  };

  const addDua = async () => {
    if (!text.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const newDua: SecretDua = { id: Date.now().toString(), text: text.trim(), createdAt: Date.now() };
    await save([newDua, ...duas]);
    setText("");
    setWriting(false);
  };

  const deleteDua = async (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await save(duas.filter(d => d.id !== id));
  };

  const QURAN_DUAS = [
    { title: "دعاء يونس في بطن الحوت",      text: "لَا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ", source: "الأنبياء: ٨٧" },
    { title: "دعاء آدم ﵇",                  text: "رَبَّنَا ظَلَمْنَا أَنفُسَنَا وَإِن لَّمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ", source: "الأعراف: ٢٣" },
    { title: "سيد الاستغفار",               text: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ", source: "رواه البخاري" },
    { title: "دعاء التوبة الصادق",          text: "تُبْتُ إِلَيْكَ وَأَنَا مُؤْمِنٌ", source: "رواه الترمذي" },
    { title: "دعاء ثبات القلب",             text: "يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ", source: "رواه الترمذي" },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={["top"]}>
      <PageHeader
        titleAr="دعاء سري"
        subtitleAr="ما بينك وبين ربك"
        rightAction={
          <Pressable onPress={() => { setWriting(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
            style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: "rgba(16,185,129,0.14)", borderWidth: 1, borderColor: "rgba(16,185,129,0.25)", alignItems: "center", justifyContent: "center" }}>
            <PenLine size={18} color={c.primary} />
          </Pressable>
        }
      />
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 40 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Hero */}
          <Animated.View entering={FadeInDown.delay(0).springify()} style={{ borderRadius: 20, padding: 20, marginBottom: 18, backgroundColor: isDark ? "rgba(16,185,129,0.06)" : "rgba(16,185,129,0.04)", borderWidth: 1, borderColor: isDark ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.15)", alignItems: "center" }}>
            <Moon size={28} color={c.primary} style={{ marginBottom: 10 }} />
            <Text style={{ fontSize: 15, fontWeight: "800", color: c.text, fontFamily: "IBMPlexSansArabic_700Bold", textAlign: "center", marginBottom: 6 }}>
              همسك إلى الله
            </Text>
            <Text style={{ fontSize: 12, color: c.textSecondary, fontFamily: "IBMPlexSansArabic_400Regular", textAlign: "center", lineHeight: 20 }}>
              «وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ» — البقرة: ١٨٦
            </Text>
          </Animated.View>

          {/* Write form */}
          {writing && (
            <Animated.View entering={FadeIn.duration(300)} style={{ borderRadius: 20, backgroundColor: isDark ? "rgba(14,14,14,0.95)" : "#fff", borderWidth: 1, borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)", padding: 16, marginBottom: 16 }}>
              <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 6, marginBottom: 10 }}>
                <Lock size={14} color={c.primary} />
                <Text style={{ fontSize: 12, color: c.primary, fontFamily: "IBMPlexSansArabic_700Bold" }}>دعاء سري — لك ولربك فقط</Text>
              </View>
              <Text style={{ fontSize: 12, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular", textAlign: isRTL ? "right" : "left", marginBottom: 10, fontStyle: "italic" }}>
                💭 {prompt}
              </Text>
              <TextInput value={text} onChangeText={setText} placeholder="اكتب دعاءك..." placeholderTextColor={c.textMuted} multiline numberOfLines={4} textAlignVertical="top"
                style={{ borderWidth: 1, borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, color: c.text, fontFamily: "IBMPlexSansArabic_400Regular", fontSize: 15, minHeight: 100, textAlign: isRTL ? "right" : "left", lineHeight: 26, marginBottom: 12 }} />
              <View style={{ flexDirection: isRTL ? "row-reverse" : "row", gap: 8 }}>
                <Pressable onPress={() => { setWriting(false); setText(""); }} style={{ flex: 1, paddingVertical: 12, borderRadius: 14, alignItems: "center", backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)" }}>
                  <Text style={{ fontSize: 14, color: c.textSecondary, fontFamily: "IBMPlexSansArabic_400Regular" }}>إلغاء</Text>
                </Pressable>
                <Pressable onPress={addDua} disabled={!text.trim()} style={{ flex: 2, paddingVertical: 12, borderRadius: 14, alignItems: "center", backgroundColor: text.trim() ? c.primary : (isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)") }}>
                  <Text style={{ fontSize: 14, fontWeight: "800", color: text.trim() ? "#fff" : c.textMuted, fontFamily: "IBMPlexSansArabic_700Bold" }}>ارفع دعاءك</Text>
                </Pressable>
              </View>
            </Animated.View>
          )}

          {/* My duas */}
          {duas.length > 0 && (
            <Animated.View entering={FadeInDown.delay(60).springify()}>
              <Text style={{ fontSize: 13, fontWeight: "800", color: c.text, fontFamily: "IBMPlexSansArabic_700Bold", textAlign: isRTL ? "right" : "left", marginBottom: 10 }}>أدعيتي الخاصة</Text>
              {duas.map((dua, i) => (
                <Animated.View key={dua.id} entering={FadeInDown.delay(i * 40).springify()} style={{ borderRadius: 16, padding: 14, marginBottom: 10, backgroundColor: isDark ? "rgba(14,14,14,0.9)" : "#fff", borderWidth: 1, borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)" }}>
                  <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
                    <Pressable onPress={() => deleteDua(dua.id)} style={{ padding: 4 }}>
                      <Trash2 size={14} color="#ef4444" />
                    </Pressable>
                    <Text style={{ flex: 1, fontSize: 14, color: c.text, fontFamily: "IBMPlexSansArabic_400Regular", lineHeight: 24, textAlign: isRTL ? "right" : "left" }}>{dua.text}</Text>
                  </View>
                  <Text style={{ fontSize: 10, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular", textAlign: isRTL ? "right" : "left", marginTop: 8 }}>
                    🌙 {formatDate(dua.createdAt)}
                  </Text>
                </Animated.View>
              ))}
            </Animated.View>
          )}

          {/* Quran duas */}
          <Animated.View entering={FadeInDown.delay(120).springify()}>
            <Text style={{ fontSize: 13, fontWeight: "800", color: c.text, fontFamily: "IBMPlexSansArabic_700Bold", textAlign: isRTL ? "right" : "left", marginBottom: 10, marginTop: 8 }}>أدعية من القرآن والسنة</Text>
            {QURAN_DUAS.map((dua, i) => (
              <Animated.View key={dua.title} entering={FadeInDown.delay(i * 50).springify()} style={{ borderRadius: 16, padding: 14, marginBottom: 10, backgroundColor: isDark ? "rgba(16,185,129,0.05)" : "rgba(16,185,129,0.04)", borderWidth: 1, borderColor: isDark ? "rgba(16,185,129,0.15)" : "rgba(16,185,129,0.15)" }}>
                <Text style={{ fontSize: 12, fontWeight: "700", color: c.primary, fontFamily: "IBMPlexSansArabic_700Bold", textAlign: isRTL ? "right" : "left", marginBottom: 8 }}>{dua.title}</Text>
                <Text style={{ fontSize: 15, color: c.text, fontFamily: "IBMPlexSansArabic_400Regular", lineHeight: 28, textAlign: "right" }}>{dua.text}</Text>
                <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 5, marginTop: 8 }}>
                  <Star size={11} color={c.accent} />
                  <Text style={{ fontSize: 11, color: c.accent, fontFamily: "IBMPlexSansArabic_400Regular" }}>{dua.source}</Text>
                </View>
              </Animated.View>
            ))}
          </Animated.View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
