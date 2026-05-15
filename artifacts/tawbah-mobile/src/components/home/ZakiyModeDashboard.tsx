import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from "react-native";
import { useState } from "react";
import { useZakiyMode } from "@/providers/ZakiyModeProvider";
import { useColors } from "@/hooks/useColors";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function ZakiyModeDashboard() {
  const { toggleAiMode } = useZakiyMode();
  const c = useColors();
  const isDark = c.isDark;
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "assistant", content: "السلام عليكم! أنا زكي، مرافقك الروحي. كيف أساعدك في رحلتك اليوم؟" },
  ]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTimeout(() => {
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "هداك الله وسدد خطاك. أنا هنا لدعمك في رحلتك الروحية. استمر في الذكر والتوبة والتقرب من الله."
      }]);
    }, 1000);
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <View style={[styles.header, { backgroundColor: c.surface, borderColor: c.border }]}>
        <Text style={[styles.headerTitle, { color: c.text, fontFamily: "IBMPlexSansArabic_700Bold" }]}>زكي — المستشار الروحي</Text>
        <Pressable onPress={toggleAiMode} style={[styles.exitBtn, { backgroundColor: c.primaryGlow, borderWidth: 1, borderColor: c.border }]}>
          <Text style={[styles.exitText, { color: c.primary, fontFamily: "IBMPlexSansArabic_400Regular" }]}>خروج</Text>
        </Pressable>
      </View>
      <ScrollView style={styles.messages} contentContainerStyle={styles.messagesContent}>
        {messages.map((msg) => (
          <View key={msg.id} style={[
            styles.message,
            msg.role === "user" ? styles.userMsg : styles.assistantMsg,
            {
              backgroundColor: msg.role === "user"
                ? (isDark ? c.surfaceElevated : c.card)
                : (isDark ? c.primaryGlow : "rgba(45,106,79,0.08)"),
              borderWidth: 1,
              borderColor: msg.role === "user" ? c.border : (isDark ? "rgba(16,185,129,0.2)" : "rgba(45,106,79,0.15)"),
            }
          ]}>
            <Text style={[styles.messageText, {
              color: msg.role === "user" ? c.text : (isDark ? c.primaryLight : c.primary),
              fontFamily: "IBMPlexSansArabic_400Regular",
            }]}>{msg.content}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={[styles.inputContainer, { backgroundColor: c.surface, borderColor: c.border }]}>
        <TextInput
          style={[styles.input, { backgroundColor: c.background, color: c.text, borderColor: c.border, borderWidth: 1, fontFamily: "IBMPlexSansArabic_400Regular" }]}
          placeholder="اكتب رسالتك لزكي..."
          placeholderTextColor={c.textMuted}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={sendMessage}
          textAlign="right"
        />
        <Pressable onPress={sendMessage} style={[styles.sendBtn, { backgroundColor: c.primary }]}>
          <Text style={[styles.sendText, { fontFamily: "IBMPlexSansArabic_700Bold" }]}>إرسال</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 17, fontWeight: "bold" },
  exitBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10 },
  exitText: { fontSize: 13, fontWeight: "600" },
  messages: { flex: 1 },
  messagesContent: { padding: 16, gap: 10 },
  message: { padding: 12, borderRadius: 16, maxWidth: "82%" },
  userMsg: { alignSelf: "flex-start" },
  assistantMsg: { alignSelf: "flex-end" },
  messageText: { fontSize: 14, lineHeight: 22 },
  inputContainer: { flexDirection: "row", padding: 12, gap: 8, borderTopWidth: 1 },
  input: { flex: 1, padding: 12, borderRadius: 14, fontSize: 14 },
  sendBtn: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 14, justifyContent: "center" },
  sendText: { color: "#ffffff", fontWeight: "700", fontSize: 14 },
});
