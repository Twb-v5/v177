import { useMemo, useState, useEffect, useCallback } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  FadeIn,
  FadeInDown,
  Layout,
} from "react-native-reanimated";
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, I18nManager, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSettings } from "@/providers/SettingsProvider";
import { Sparkles, Send, Mic, MicOff, X } from "lucide-react-native";
import * as Haptics from "expo-haptics";

const STARTER_QUESTIONS = [
  " Idris, how do I make sincere repentance?",
  " I'm far from Allah, where do I start?",
  " I committed a big sin, will Allah forgive me?",
  " How do I stay consistent in worship?",
  " I feel spiritually empty, what should I do?",
  " How do I overcome my bad habits?",
  " What are the best morning adhkar?",
  " How do I strengthen my faith?",
  " I keep relapsing, what should I do?",
  " How do I make my heart soft again?",
  " What dua should I make during hardship?",
  " How do I stay away from forbidden things?",
  " I feel alone in my journey, can we talk?",
  " How do I increase my halal rizq?",
  " What's the best way to memorize Quran?",
  " I feel like giving up, give me hope",
  " How do I control my anger?",
  " I neglect prayer, how to fix that?",
  " How do I make my nights worshipful?",
  " What's the remedy for a hard heart?",
  " How do I stay away from sins online?",
  " I broke my promise to Allah, what now?",
  " How do I develop good habits?",
  " What's the importance of istighfar?",
  " How do I make my days productive?",
  " I feel distant from Quran, help me",
  " How do I prepare for death?",
  " What's the reward of praying at night?",
];

const TIME_GREETINGS = [
  { start: 3, end: 7, msg: "Ahlan ya sahbi!  Jowa el-lel, rabena ma'ak." },
  { start: 7, end: 12, msg: "Ahlan!  El-sobh gamil, rabena yebarek yomak." },
  { start: 12, end: 15, msg: "Ahlan!  Waqt el-dohra..." },
  { start: 15, end: 18, msg: "Ahlan ya sahbi!  El-asr gay..." },
  { start: 18, end: 20, msg: "Ahlan!  Waqt el-maghrib..." },
  { start: 20, end: 22, msg: "Ahlan!  El-'esha'..." },
  { start: 22, end: 24, msg: "Ahlan ya sahbi!  Late night, rabena yihfazak." },
];

const VOICE_PROFILES = [
  { id: "young-guide", name: "El-morshid el-shab", nameAr: " guiden", voice: "echo" },
  { id: "sheikh-calm", name: "El-sheikh el-haadi", nameAr: " sheikh", voice: "onyx" },
  { id: "wise-friend", name: "El-sahib el-hakeem", nameAr: " ami", voice: "fable" },
  { id: "sister-caring", name: "El-okht el-mufahima", nameAr: "soeur", voice: "nova" },
  { id: "wise-teacher", name: "El-mu'allima el-fadila", nameAr: "enseignante", voice: "shimmer" },
  { id: "gentle-mentor", name: "El-murshida el-hannana", nameAr: "mentor", voice: "coral" },
];

interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
  timestamp: number;
}

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  const base = "أهلاً يا غالي، نورت مكانك";
  if (hour >= 5 && hour < 12) return `${base}.. صباح الفل`;
  if (hour >= 12 && hour < 17) return `${base}.. نهارك سعيد`;
  if (hour >= 17 && hour < 21) return `${base}.. مسا الخير`;
  return `${base}.. ربنا يطمن قلبك`;
}

function getRandomStarters(): string[] {
  const shuffled = [...STARTER_QUESTIONS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 6);
}

export default function ZakiyScreen() {
  const { resolvedTheme } = useSettings();
  const isDark = resolvedTheme === "dark";
  const isRTL = I18nManager.isRTL;

  const uiFontArabic = "IBMPlexSansArabic_500Medium";
  const uiFontLatin = "IBMPlexSansArabic_500Medium";
  const titleFont = "Amiri_700Bold";

  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showStarters, setShowStarters] = useState(true);
  const [chatState, setChatState] = useState<"idle" | "thinking" | "responding">("idle");
  const [selectedVoice, setSelectedVoice] = useState("young-guide");
  const [showVoiceSelector, setShowVoiceSelector] = useState(false);

  const waveformScale = useSharedValue(1);
  const waveformOpacity = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  const wave1 = useSharedValue(6);
  const wave2 = useSharedValue(10);
  const wave3 = useSharedValue(14);
  const wave4 = useSharedValue(10);
  const wave5 = useSharedValue(6);

  useEffect(() => {
    if (isListening) {
      waveformOpacity.value = withTiming(1, { duration: 200 });
      waveformScale.value = withRepeat(
        withSequence(withTiming(1.15, { duration: 500 }), withTiming(0.9, { duration: 500 })),
        -1,
        true
      );
      pulseScale.value = withRepeat(
        withSequence(withTiming(1.05, { duration: 800 }), withTiming(1, { duration: 800 })),
        -1,
        true
      );

      const mk = (min: number, max: number) =>
        withRepeat(
          withSequence(
            withTiming(min, { duration: 220 }),
            withTiming(max, { duration: 260 }),
            withTiming(min + 2, { duration: 240 })
          ),
          -1,
          true
        );
      wave1.value = mk(6, 14);
      wave2.value = mk(8, 18);
      wave3.value = mk(10, 22);
      wave4.value = mk(8, 18);
      wave5.value = mk(6, 14);
    } else {
      waveformOpacity.value = withTiming(0, { duration: 200 });
      waveformScale.value = withTiming(1, { duration: 200 });
      pulseScale.value = withTiming(1, { duration: 200 });

      wave1.value = withTiming(6, { duration: 180 });
      wave2.value = withTiming(10, { duration: 180 });
      wave3.value = withTiming(14, { duration: 180 });
      wave4.value = withTiming(10, { duration: 180 });
      wave5.value = withTiming(6, { duration: 180 });
    }
  }, [isListening]);

  const waveformAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: waveformScale.value }],
    opacity: waveformOpacity.value,
  }));

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const handleVoicePress = () => {
    const next = !isListening;
    if (next) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setIsListening(next);
  };

  const handleSendMessage = useCallback(() => {
    if (!input.trim()) return;
    
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      text: input.trim(),
      timestamp: Date.now(),
    };
    
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setShowStarters(false);
    setChatState("thinking");
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    setTimeout(() => {
      setChatState("responding");
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        text: "Ya salam, shukran li-sualak! Ana geh hena l-ekhlas. Ga'et t-tekalam ma'aya, fa-hna hena. Gididak: " + input.trim() + " - hwa shi mühim. Nizak: ",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setChatState("idle");
    }, 1500);
  }, [input]);

  const handleStarterPress = useCallback((question: string) => {
    setInput(question);
    setShowStarters(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => handleSendMessage(), 300);
  }, [handleSendMessage]);

  const handleVoiceSelect = useCallback((voiceId: string) => {
    setSelectedVoice(voiceId);
    setShowVoiceSelector(false);
    Haptics.selectionAsync();
  }, []);

  const palette = useMemo(
    () => ({
      bg: isDark ? "#051612" : "#f0fdf4",
      card: isDark ? "#062c2a" : "#ffffff",
      card2: isDark ? "#05312d" : "#ecfdf5",
      border: isDark ? "#115e59" : "#a7f3d0",
      text: isDark ? "#d1fae5" : "#064e3b",
      textMuted: isDark ? "#6ee7b7" : "#047857",
      muted: isDark ? "#5eead4" : "#0d9488",
      emerald: "#10b981",
      emeraldDark: "#059669",
      gold: "#fbbf24",
      goldDark: "#d97706",
      userBubble: isDark ? "#065f46" : "#d1fae5",
      botBubble: isDark ? "#064e3b" : "#ffffff",
    }),
    [isDark]
  );

  const greeting = useMemo(() => getTimeGreeting(), []);
  const starters = useMemo(() => getRandomStarters(), []);

  const renderStarterCard = ({ item, index }: { item: string; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 100).springify()} layout={Layout.springify()}>
      <Pressable
        onPress={() => handleStarterPress(item)}
        style={({ pressed }) => [
          styles.starterCard,
          {
            backgroundColor: palette.card,
            borderColor: palette.border,
            transform: [{ scale: pressed ? 0.98 : 1 }],
            shadowColor: isDark ? "#000" : palette.emeraldDark,
            shadowOpacity: pressed ? 0.12 : 0.18,
            shadowRadius: pressed ? 10 : 14,
            shadowOffset: { width: 0, height: pressed ? 6 : 10 },
          },
        ]}
      >
        <Text style={[styles.starterText, { color: palette.text, fontFamily: uiFontLatin }]}>{item}</Text>
      </Pressable>
    </Animated.View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.bg }]} edges={["top"]}>
      <Animated.View style={[styles.header, { backgroundColor: palette.card, borderColor: palette.border }, pulseAnimatedStyle]}>
        <View style={styles.headerTop}>
          <Animated.View style={[styles.sparkleWrapper, waveformAnimatedStyle]}>
            <Sparkles size={22} color={palette.gold} />
          </Animated.View>
          <Text style={[styles.title, { color: palette.text, fontFamily: titleFont }]}>{"زكي"}</Text>
          <Pressable onPress={() => setShowVoiceSelector(!showVoiceSelector)} style={[styles.voiceSelectorBtn, { borderColor: palette.border }]}>
            <Text style={[styles.voiceSelectorText, { color: palette.muted, fontFamily: uiFontArabic }]}>{"الصوت"}</Text>
          </Pressable>
        </View>
        <Text style={[styles.sub, { color: palette.muted, fontFamily: uiFontArabic }]}>{greeting}</Text>

        <Animated.View style={[styles.waveformRow, { opacity: waveformOpacity.value }]}>
          <Animated.View style={[styles.waveBar, { backgroundColor: palette.gold }, useAnimatedStyle(() => ({ height: wave1.value }))]} />
          <Animated.View style={[styles.waveBar, { backgroundColor: palette.goldDark }, useAnimatedStyle(() => ({ height: wave2.value }))]} />
          <Animated.View style={[styles.waveBar, { backgroundColor: palette.gold }, useAnimatedStyle(() => ({ height: wave3.value }))]} />
          <Animated.View style={[styles.waveBar, { backgroundColor: palette.goldDark }, useAnimatedStyle(() => ({ height: wave4.value }))]} />
          <Animated.View style={[styles.waveBar, { backgroundColor: palette.gold }, useAnimatedStyle(() => ({ height: wave5.value }))]} />
        </Animated.View>
        
        {showVoiceSelector && (
          <Animated.View entering={FadeIn.duration(200)} style={[styles.voiceSelector, { backgroundColor: palette.card2, borderColor: palette.border }]}>
            {VOICE_PROFILES.map((vp) => (
              <Pressable
                key={vp.id}
                onPress={() => handleVoiceSelect(vp.id)}
                style={[styles.voiceOption, selectedVoice === vp.id && { backgroundColor: palette.emerald + "20" }]}
              >
                <Text style={[styles.voiceOptionText, { color: selectedVoice === vp.id ? palette.emerald : palette.text, fontFamily: uiFontLatin }]}>{vp.name}</Text>
              </Pressable>
            ))}
          </Animated.View>
        )}
      </Animated.View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {showStarters ? (
            <Animated.View entering={FadeIn.duration(400)} style={styles.startersContainer}>
              <Text style={[styles.startersTitle, { color: palette.textMuted, fontFamily: uiFontArabic }]}>{"اختار موضوع:"}</Text>
              <View style={styles.startersGrid}>
                {starters.map((q, i) => renderStarterCard({ item: q, index: i }))}
              </View>
            </Animated.View>
          ) : (
            <View style={styles.messagesContainer}>
              {messages.map((msg) => (
                <Animated.View
                  key={msg.id}
                  entering={FadeInDown.springify()}
                  style={[
                    styles.messageWrapper,
                    msg.role === "user" ? styles.userMessageWrapper : styles.botMessageWrapper,
                  ]}
                >
                  <View
                    style={[
                      styles.messageBubble,
                      {
                        backgroundColor: msg.role === "user" ? palette.userBubble : palette.botBubble,
                        borderColor: palette.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        { color: msg.role === "user" ? palette.text : palette.text, fontFamily: uiFontArabic },
                      ]}
                    >
                      {msg.text}
                    </Text>
                  </View>
                </Animated.View>
              ))}
              
              {chatState === "thinking" && (
                <Animated.View entering={FadeIn} style={[styles.typingIndicator, { backgroundColor: palette.card, borderColor: palette.border }]}>
                  <View style={styles.typingDots}>
                    <Animated.View style={[styles.typingDot, { backgroundColor: palette.emerald }]} />
                    <Animated.View style={[styles.typingDot, { backgroundColor: palette.emerald }]} />
                    <Animated.View style={[styles.typingDot, { backgroundColor: palette.emerald }]} />
                  </View>
                  <Text style={[styles.typingText, { color: palette.muted, fontFamily: uiFontArabic }]}>{"زكي بيفكر..."}</Text>
                </Animated.View>
              )}
            </View>
          )}
        </ScrollView>

        <View style={[styles.composer, { backgroundColor: palette.card, borderColor: palette.border }]}>
          <Pressable
            onPress={handleVoicePress}
            style={[
              styles.voiceBtn,
              {
                backgroundColor: isListening ? palette.gold : palette.card2,
                borderColor: palette.border,
              },
            ]}
          >
            {isListening ? (
              <MicOff size={20} color="#0f172a" />
            ) : (
              <Mic size={20} color={palette.text} />
            )}
          </Pressable>
          
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={"اسأل زكي..."}
            placeholderTextColor={palette.muted}
            style={[
              styles.input,
              {
                color: palette.text,
                backgroundColor: palette.card2,
                borderColor: palette.border,
                textAlign: isRTL ? "right" : "left",
                fontFamily: uiFontArabic,
              },
            ]}
            onSubmitEditing={handleSendMessage}
            returnKeyType="send"
          />
          
          <Pressable
            onPress={handleSendMessage}
            disabled={!input.trim()}
            style={[
              styles.sendBtn,
              {
                backgroundColor: input.trim() ? palette.emerald : palette.card2,
                opacity: input.trim() ? 1 : 0.5,
              },
            ]}
          >
            <Send size={18} color={input.trim() ? "#052e16" : palette.muted} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16, borderBottomWidth: 1 },
  headerTop: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  title: { fontSize: 24, fontWeight: "900", letterSpacing: 0.5 },
  sub: { marginTop: 6, fontSize: 13, textAlign: "center", fontStyle: "italic" },
  sparkleWrapper: { padding: 4 },
  waveformRow: { marginTop: 10, height: 24, flexDirection: "row", alignItems: "flex-end", justifyContent: "center", gap: 6 },
  waveBar: { width: 6, borderRadius: 10 },
  voiceSelectorBtn: { position: "absolute", right: 16, top: 12, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderRadius: 8 },
  voiceSelectorText: { fontSize: 11, fontWeight: "600" },
  voiceSelector: { marginTop: 12, borderRadius: 12, padding: 8, borderWidth: 1 },
  voiceOption: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  voiceOptionText: { fontSize: 13, fontWeight: "500" },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 20 },
  startersContainer: { padding: 16 },
  startersTitle: { fontSize: 14, fontWeight: "600", marginBottom: 16, textAlign: "center" },
  startersGrid: { gap: 10 },
  starterCard: { padding: 14, borderRadius: 16, borderWidth: 1 },
  starterText: { fontSize: 14, fontWeight: "500", lineHeight: 20 },
  messagesContainer: { padding: 16, gap: 12 },
  messageWrapper: { flexDirection: "row" },
  userMessageWrapper: { justifyContent: "flex-end" },
  botMessageWrapper: { justifyContent: "flex-start" },
  messageBubble: { maxWidth: "85%", padding: 14, borderRadius: 20, borderWidth: 1 },
  messageText: { fontSize: 14, lineHeight: 20 },
  typingIndicator: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 16, borderWidth: 1, alignSelf: "flex-start" },
  typingDots: { flexDirection: "row", gap: 4 },
  typingDot: { width: 8, height: 8, borderRadius: 4 },
  typingText: { fontSize: 12 },
  composer: { padding: 12, flexDirection: "row", gap: 10, alignItems: "center" },
  voiceBtn: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  input: { flex: 1, borderWidth: 1, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14 },
  sendBtn: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
});
