import { useState, useRef, useCallback } from "react";
import { View, Text, ScrollView, Pressable, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeIn, useSharedValue, useAnimatedStyle, withSpring, withRepeat, withTiming, withSequence } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Send, Sparkles, BookOpen, RotateCcw, MessageCircle } from "lucide-react-native";
import { useColors } from "@/hooks/useColors";
import { useSettings } from "@/providers/SettingsProvider";
import { PageHeader } from "@/components/shared/PageHeader";
import { apiUrl } from "@/lib/api";

interface Message { id: string; role: "user" | "assistant"; content: string; }

const STARTERS = [
  "ما فضل سورة الكهف؟",
  "ما معنى آية الكرسي؟",
  "ما هي السور المسبّحات؟",
  "كيف أحفظ القرآن بسرعة؟",
  "ما فضل ختم القرآن؟",
  "ما هي السور التي تحمي من الفتن؟",
];

function TypingDots({ c }: { c: ReturnType<typeof useColors> }) {
  const dot1 = useSharedValue(0.3);
  const dot2 = useSharedValue(0.3);
  const dot3 = useSharedValue(0.3);
  const a1 = useAnimatedStyle(() => ({ opacity: dot1.value }));
  const a2 = useAnimatedStyle(() => ({ opacity: dot2.value }));
  const a3 = useAnimatedStyle(() => ({ opacity: dot3.value }));
  dot1.value = withRepeat(withSequence(withTiming(1, { duration: 400 }), withTiming(0.3, { duration: 400 })), -1);
  dot2.value = withRepeat(withSequence(withTiming(0.3, { duration: 200 }), withTiming(1, { duration: 400 }), withTiming(0.3, { duration: 400 })), -1);
  dot3.value = withRepeat(withSequence(withTiming(0.3, { duration: 400 }), withTiming(1, { duration: 400 }), withTiming(0.3, { duration: 400 })), -1);
  return (
    <View style={{ flexDirection: "row", gap: 4, alignItems: "center", paddingVertical: 4 }}>
      {[a1, a2, a3].map((a, i) => <Animated.View key={i} style={[a, { width: 6, height: 6, borderRadius: 3, backgroundColor: c.primary }]} />)}
    </View>
  );
}

export default function QuranAIScreen() {
  const c = useColors();
  const { language } = useSettings();
  const isDark = c.isDark;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const send = useCallback(async (text?: string) => {
    const q = (text ?? input).trim();
    if (!q || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: q };
    setMessages(m => [...m, userMsg]);
    setInput("");
    setLoading(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const systemPrompt = "أنت مساعد قرآني متخصص. تجيب على أسئلة تتعلق بالقرآن الكريم — تفسير الآيات، فضل السور، علوم القرآن، الحفظ والتدبر. ردودك باللغة العربية، مختصرة ومفيدة وموثوقة. استشهد بالآيات والأحاديث عند الحاجة.";
      const res = await fetch(apiUrl("/zakiy/chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: q,
          sessionId: "quran-ai",
          systemOverride: systemPrompt,
          history: messages.slice(-6).map(m => ({ role: m.role, content: m.content })),
        }),
      });
      if (!res.ok) throw new Error("API error");
      const data = await res.json() as { reply?: string };
      const reply = data.reply ?? "جاري التحميل... حاول مرة أخرى.";
      setMessages(m => [...m, { id: (Date.now() + 1).toString(), role: "assistant", content: reply }]);
    } catch {
      setMessages(m => [...m, { id: (Date.now() + 1).toString(), role: "assistant", content: "عذراً، حدث خطأ في الاتصال. تأكد من الشبكة وحاول مجدداً." }]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
    }
  }, [input, loading, messages]);

  const reset = () => { setMessages([]); setInput(""); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); };

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <PageHeader
          titleAr="مساعد القرآن الذكي"
          subtitleAr="اسأل عن الآيات والسور"
          rightAction={
            <Pressable onPress={reset} style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", alignItems: "center", justifyContent: "center" }}>
              <RotateCcw size={16} color={c.textSecondary} />
            </Pressable>
          }
        />

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>

          {messages.length === 0 ? (
            <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20 }}>
              {/* Hero */}
              <Animated.View entering={FadeInDown.delay(60).springify()} style={{ alignItems: "center", marginBottom: 28 }}>
                <View style={{ width: 72, height: 72, borderRadius: 24, backgroundColor: isDark ? "rgba(139,92,246,0.15)" : "rgba(139,92,246,0.1)", alignItems: "center", justifyContent: "center", marginBottom: 14, borderWidth: 2, borderColor: "rgba(139,92,246,0.2)" }}>
                  <Sparkles size={32} color="#A78BFA" />
                </View>
                <Text style={{ fontSize: 18, fontWeight: "800", color: c.text, fontFamily: "IBMPlexSansArabic_700Bold", marginBottom: 6 }}>
                  مساعد القرآن
                </Text>
                <Text style={{ fontSize: 13, color: c.textSecondary, fontFamily: "IBMPlexSansArabic_400Regular", textAlign: "center", lineHeight: 20 }}>
                  اسألني عن تفسير الآيات، فضل السور، علوم القرآن والحفظ
                </Text>
              </Animated.View>

              {/* Starters */}
              <Animated.View entering={FadeInDown.delay(120).springify()}>
                <Text style={{ fontSize: 13, fontWeight: "700", color: c.textSecondary, fontFamily: "IBMPlexSansArabic_700Bold", textAlign: "right", marginBottom: 12 }}>
                  أسئلة مقترحة
                </Text>
                {STARTERS.map((s, i) => (
                  <Animated.View key={s} entering={FadeInDown.delay(140 + i * 50).springify()}>
                    <Pressable
                      onPress={() => send(s)}
                      style={{
                        borderRadius: 16, padding: 14, marginBottom: 10,
                        backgroundColor: isDark ? "rgba(139,92,246,0.08)" : "rgba(139,92,246,0.05)",
                        borderWidth: 1.5, borderColor: "rgba(139,92,246,0.2)",
                        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                      }}
                    >
                      <BookOpen size={14} color="#A78BFA" />
                      <Text style={{ flex: 1, fontSize: 13, color: c.text, fontFamily: "IBMPlexSansArabic_400Regular", textAlign: "right", marginRight: 10 }}>{s}</Text>
                    </Pressable>
                  </Animated.View>
                ))}
              </Animated.View>
            </ScrollView>
          ) : (
            <ScrollView
              ref={scrollRef}
              contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16, gap: 12 }}
              showsVerticalScrollIndicator={false}
            >
              {messages.map((msg, i) => (
                <Animated.View key={msg.id} entering={FadeIn.delay(i === messages.length - 1 ? 0 : 0).duration(300)}>
                  <View style={{ flexDirection: msg.role === "user" ? "row" : "row-reverse", gap: 10, alignItems: "flex-start" }}>
                    <View style={{
                      width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center",
                      backgroundColor: msg.role === "user" ? c.primary : (isDark ? "rgba(139,92,246,0.2)" : "rgba(139,92,246,0.12)"),
                    }}>
                      {msg.role === "user"
                        ? <Text style={{ fontSize: 14 }}>👤</Text>
                        : <Sparkles size={14} color="#A78BFA" />
                      }
                    </View>
                    <View style={{
                      flex: 1, borderRadius: 18,
                      backgroundColor: msg.role === "user"
                        ? (isDark ? "rgba(16,185,129,0.15)" : "rgba(45,106,79,0.08)")
                        : (isDark ? "rgba(139,92,246,0.1)" : "rgba(139,92,246,0.06)"),
                      padding: 14, borderWidth: 1,
                      borderColor: msg.role === "user"
                        ? (isDark ? "rgba(16,185,129,0.2)" : "rgba(45,106,79,0.15)")
                        : "rgba(139,92,246,0.2)",
                    }}>
                      <Text style={{ fontSize: 14, color: c.text, fontFamily: "IBMPlexSansArabic_400Regular", lineHeight: 24, textAlign: "right" }}>
                        {msg.content}
                      </Text>
                    </View>
                  </View>
                </Animated.View>
              ))}
              {loading && (
                <View style={{ flexDirection: "row-reverse", gap: 10, alignItems: "flex-start" }}>
                  <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: isDark ? "rgba(139,92,246,0.2)" : "rgba(139,92,246,0.12)", alignItems: "center", justifyContent: "center" }}>
                    <Sparkles size={14} color="#A78BFA" />
                  </View>
                  <View style={{ borderRadius: 18, backgroundColor: isDark ? "rgba(139,92,246,0.1)" : "rgba(139,92,246,0.06)", padding: 14, borderWidth: 1, borderColor: "rgba(139,92,246,0.2)" }}>
                    <TypingDots c={c} />
                  </View>
                </View>
              )}
            </ScrollView>
          )}

          {/* Input */}
          <View style={{
            flexDirection: "row", alignItems: "center", gap: 10,
            paddingHorizontal: 16, paddingVertical: 12,
            borderTopWidth: 1, borderTopColor: c.divider,
            backgroundColor: isDark ? "rgba(10,10,10,0.98)" : "rgba(248,246,240,0.98)",
          }}>
            <Pressable
              onPress={() => send()}
              disabled={!input.trim() || loading}
              style={{
                width: 44, height: 44, borderRadius: 14,
                backgroundColor: input.trim() && !loading ? c.primary : (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"),
                alignItems: "center", justifyContent: "center",
              }}
            >
              {loading
                ? <ActivityIndicator size="small" color={c.primary} />
                : <Send size={18} color={input.trim() ? "#fff" : c.textMuted} />
              }
            </Pressable>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="اسأل عن آية أو سورة..."
              placeholderTextColor={c.textMuted}
              style={{
                flex: 1, height: 44, borderRadius: 14, paddingHorizontal: 14,
                backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                color: c.text, fontSize: 14, fontFamily: "IBMPlexSansArabic_400Regular",
                textAlign: "right",
              }}
              returnKeyType="send"
              onSubmitEditing={() => send()}
              multiline={false}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
