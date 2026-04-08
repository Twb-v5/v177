import { useState, useEffect } from "react";
import { View, Text, Pressable, ScrollView, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeIn, useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PenLine, Trash2, ChevronDown, ChevronUp, Lock } from "lucide-react-native";
import { useColors } from "@/hooks/useColors";
import { useSettings } from "@/providers/SettingsProvider";
import { PageHeader } from "@/components/shared/PageHeader";

const STORAGE_KEY = "journal_entries_v1";

type Mood = "great" | "good" | "neutral" | "sad" | "struggling";

interface JournalEntry {
  id: string;
  content: string;
  mood: Mood;
  date: string;
  timestamp: number;
}

const MOOD_CONFIG: Record<Mood, { emoji: string; labelAr: string; color: string; bg: string }> = {
  great:      { emoji: "⭐", labelAr: "رائع",         color: "#F59E0B", bg: "rgba(245,158,11,0.12)"  },
  good:       { emoji: "😊", labelAr: "جيد",          color: "#10b981", bg: "rgba(16,185,129,0.12)"  },
  neutral:    { emoji: "😐", labelAr: "عادي",          color: "#60A5FA", bg: "rgba(96,165,250,0.12)"  },
  sad:        { emoji: "😢", labelAr: "حزين",          color: "#F97316", bg: "rgba(249,115,22,0.12)"  },
  struggling: { emoji: "💔", labelAr: "أحتاج مساعدة", color: "#ef4444", bg: "rgba(239,68,68,0.12)"   },
};

const PROMPTS = [
  "كيف كان يومك مع الله اليوم؟",
  "ما الذي تشكر الله عليه الآن؟",
  "هل هناك ذنب تريد التوبة منه اليوم؟",
  "ما الدعاء الذي يملأ قلبك الآن؟",
  "ما الشيء الذي تريد تغييره في نفسك؟",
  "ماذا قلت لله اليوم في صلاتك؟",
];

function getRandomPrompt() {
  return PROMPTS[Math.floor(Math.random() * PROMPTS.length)] ?? PROMPTS[0];
}

function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleDateString("ar-SA", { weekday: "long", month: "long", day: "numeric" });
}

function EntryCard({ entry, isRTL, isDark, c, onDelete }: { entry: JournalEntry; isRTL: boolean; isDark: boolean; c: any; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const moodCfg = MOOD_CONFIG[entry.mood];

  return (
    <Animated.View style={[animStyle, { marginBottom: 10 }]}>
      <View style={{ borderRadius: 18, backgroundColor: isDark ? "rgba(14,14,14,0.92)" : "#fff", borderWidth: 1, borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <View style={{ height: 2, backgroundColor: moodCfg.color, opacity: 0.7 }} />
        <Pressable
          onPressIn={() => { scale.value = withSpring(0.99); }}
          onPressOut={() => { scale.value = withSpring(1); }}
          onPress={() => { setExpanded(e => !e); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 12, padding: 14 }}>
          <View style={{ width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: moodCfg.bg }}>
            <Text style={{ fontSize: 20 }}>{moodCfg.emoji}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 12, color: moodCfg.color, fontWeight: "700", fontFamily: "IBMPlexSansArabic_700Bold" }}>{moodCfg.labelAr}</Text>
            <Text style={{ fontSize: 11, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular", marginTop: 2 }}>{formatDate(entry.timestamp)}</Text>
          </View>
          <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 8 }}>
            <Lock size={12} color={c.textMuted} />
            {expanded ? <ChevronUp size={16} color={c.textMuted} /> : <ChevronDown size={16} color={c.textMuted} />}
          </View>
        </Pressable>

        {expanded && (
          <Animated.View entering={FadeIn.duration(200)} style={{ paddingHorizontal: 14, paddingBottom: 14 }}>
            <View style={{ height: 1, backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", marginBottom: 12 }} />
            <Text style={{ fontSize: 14, color: c.text, fontFamily: "IBMPlexSansArabic_400Regular", lineHeight: 24, textAlign: isRTL ? "right" : "left" }}>{entry.content}</Text>
            <Pressable onPress={() => { onDelete(entry.id); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}
              style={{ marginTop: 12, flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 8, borderRadius: 10, backgroundColor: "rgba(239,68,68,0.08)", borderWidth: 1, borderColor: "rgba(239,68,68,0.18)" }}>
              <Trash2 size={13} color="#ef4444" />
              <Text style={{ fontSize: 12, color: "#ef4444", fontFamily: "IBMPlexSansArabic_400Regular" }}>حذف</Text>
            </Pressable>
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
}

export default function JournalScreen() {
  const c = useColors();
  const { language } = useSettings();
  const isRTL = language === "ar";
  const isDark = c.isDark;

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [writing, setWriting] = useState(false);
  const [content, setContent] = useState("");
  const [mood, setMood] = useState<Mood>("neutral");
  const [prompt] = useState(getRandomPrompt());

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) setEntries(JSON.parse(raw) as JournalEntry[]);
    });
  }, []);

  const saveEntry = async () => {
    if (!content.trim()) return;
    const entry: JournalEntry = {
      id: Date.now().toString(),
      content: content.trim(),
      mood,
      date: new Date().toISOString().slice(0, 10),
      timestamp: Date.now(),
    };
    const updated = [entry, ...entries];
    setEntries(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setContent(""); setMood("neutral"); setWriting(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const deleteEntry = async (id: string) => {
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const moodKeys: Mood[] = ["great", "good", "neutral", "sad", "struggling"];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={["top"]}>
      <PageHeader
        titleAr="مفكرة روحية"
        subtitleAr={`${entries.length} تدوينة خاصة`}
        rightAction={
          <Pressable onPress={() => { setWriting(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
            style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: "rgba(16,185,129,0.14)", borderWidth: 1, borderColor: "rgba(16,185,129,0.25)", alignItems: "center", justifyContent: "center" }}>
            <PenLine size={18} color="#10b981" />
          </Pressable>
        }
      />

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 40 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {writing && (
            <Animated.View entering={FadeIn.duration(300)} style={{ borderRadius: 20, backgroundColor: isDark ? "rgba(14,14,14,0.95)" : "#fff", borderWidth: 1, borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)", padding: 16, marginBottom: 16 }}>
              <Text style={{ fontSize: 13, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular", textAlign: isRTL ? "right" : "left", marginBottom: 12, fontStyle: "italic" }}>
                💭 {prompt}
              </Text>

              <Text style={{ fontSize: 12, color: c.textSecondary, fontFamily: "IBMPlexSansArabic_700Bold", fontWeight: "700", marginBottom: 8, textAlign: isRTL ? "right" : "left" }}>
                كيف حالك اليوم؟
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ flexDirection: isRTL ? "row-reverse" : "row", gap: 8, marginBottom: 14 }}>
                {moodKeys.map(m => {
                  const cfg = MOOD_CONFIG[m];
                  return (
                    <Pressable key={m} onPress={() => { setMood(m); Haptics.selectionAsync(); }}
                      style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12,
                        backgroundColor: mood === m ? cfg.bg : (isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"),
                        borderWidth: 1, borderColor: mood === m ? cfg.color + "50" : (isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)") }}>
                      <Text style={{ fontSize: 16 }}>{cfg.emoji}</Text>
                      <Text style={{ fontSize: 12, fontWeight: "700", color: mood === m ? cfg.color : c.textSecondary, fontFamily: "IBMPlexSansArabic_700Bold" }}>{cfg.labelAr}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              <TextInput value={content} onChangeText={setContent} placeholder="اكتب ما في قلبك... هذا مكانك الآمن"
                placeholderTextColor={c.textMuted} multiline numberOfLines={5} textAlignVertical="top"
                style={{ borderWidth: 1, borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)", borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12,
                  color: c.text, fontFamily: "IBMPlexSansArabic_400Regular", fontSize: 14, minHeight: 110, textAlign: isRTL ? "right" : "left", lineHeight: 24, marginBottom: 12 }} />

              <View style={{ flexDirection: isRTL ? "row-reverse" : "row", gap: 8 }}>
                <Pressable onPress={() => { setWriting(false); setContent(""); setMood("neutral"); }}
                  style={{ flex: 1, paddingVertical: 12, borderRadius: 14, alignItems: "center", backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)" }}>
                  <Text style={{ fontSize: 14, color: c.textSecondary, fontFamily: "IBMPlexSansArabic_400Regular" }}>إلغاء</Text>
                </Pressable>
                <Pressable onPress={saveEntry} disabled={!content.trim()}
                  style={{ flex: 2, paddingVertical: 12, borderRadius: 14, alignItems: "center", backgroundColor: content.trim() ? "#2D6A4F" : (isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)") }}>
                  <Text style={{ fontSize: 14, fontWeight: "800", color: content.trim() ? "#fff" : c.textMuted, fontFamily: "IBMPlexSansArabic_700Bold" }}>حفظ في السر</Text>
                </Pressable>
              </View>
            </Animated.View>
          )}

          {entries.length === 0 && !writing ? (
            <View style={{ alignItems: "center", paddingVertical: 48 }}>
              <Text style={{ fontSize: 56, marginBottom: 16 }}>📓</Text>
              <Text style={{ fontSize: 17, fontWeight: "800", color: c.text, fontFamily: "IBMPlexSansArabic_700Bold", textAlign: "center", marginBottom: 8 }}>
                مفكرتك فارغة
              </Text>
              <Text style={{ fontSize: 13, color: c.textSecondary, fontFamily: "IBMPlexSansArabic_400Regular", textAlign: "center", lineHeight: 22, paddingHorizontal: 24 }}>
                سجّل أفكارك وأحاسيسك في رحلتك مع الله — هذا المكان لك وحدك
              </Text>
              <Pressable onPress={() => { setWriting(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                style={{ marginTop: 20, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16, backgroundColor: "#2D6A4F" }}>
                <Text style={{ fontSize: 14, fontWeight: "800", color: "#fff", fontFamily: "IBMPlexSansArabic_700Bold" }}>ابدأ أول تدوينة</Text>
              </Pressable>
            </View>
          ) : (
            entries.map((entry, i) => (
              <Animated.View key={entry.id} entering={FadeInDown.delay(i < 6 ? i * 40 : 0).springify()}>
                <EntryCard entry={entry} isRTL={isRTL} isDark={isDark} c={c} onDelete={deleteEntry} />
              </Animated.View>
            ))
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
