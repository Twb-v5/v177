import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from "react-native";
import { useState } from "react";
import { useZakiyMode } from "@/providers/ZakiyModeProvider";
import { useSettings } from "@/providers/SettingsProvider";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function ZakiyModeDashboard() {
  const { toggleAiMode } = useZakiyMode();
  const { resolvedTheme } = useSettings();
  const isDark = resolvedTheme === "dark";
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", role: "assistant", content: "Assalamu Alaikum! I'm Zakiy, your spiritual companion. How can I help you on your journey today?" },
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
        content: "May Allah guide you. I'm here to support you in your spiritual journey. Keep making du'a and stay connected to the Quran." 
      }]);
    }, 1000);
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? "#0f172a" : "#f8fafc" }]}>
      <View style={[styles.header, { backgroundColor: isDark ? "#1e293b" : "#ffffff", borderColor: isDark ? "#334155" : "#e2e8f0" }]}>
        <Text style={[styles.headerTitle, { color: isDark ? "#f1f5f9" : "#1e293b" }]}>Zakiy - Spiritual Assistant</Text>
        <Pressable onPress={toggleAiMode} style={[styles.exitBtn, { backgroundColor: isDark ? "#334155" : "#f1f5f9" }]}>
          <Text style={[styles.exitText, { color: isDark ? "#f1f5f9" : "#1e293b" }]}>Exit AI Mode</Text>
        </Pressable>
      </View>
      <ScrollView style={styles.messages} contentContainerStyle={styles.messagesContent}>
        {messages.map((msg) => (
          <View key={msg.id} style={[
            styles.message, 
            msg.role === "user" ? styles.userMsg : styles.assistantMsg,
            { backgroundColor: msg.role === "user" ? (isDark ? "#1e293b" : "#ffffff") : (isDark ? "#166534" : "#dcfce7") }
          ]}>
            <Text style={[styles.messageText, { color: msg.role === "user" ? (isDark ? "#f1f5f9" : "#1e293b") : (isDark ? "#dcfce7" : "#166534") }]}>{msg.content}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={[styles.inputContainer, { backgroundColor: isDark ? "#1e293b" : "#ffffff", borderColor: isDark ? "#334155" : "#e2e8f0" }]}>
        <TextInput
          style={[styles.input, { backgroundColor: isDark ? "#0f172a" : "#f1f5f9", color: isDark ? "#f1f5f9" : "#1e293b" }]}
          placeholder="Ask Zakiy..."
          placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={sendMessage}
        />
        <Pressable onPress={sendMessage} style={[styles.sendBtn, { backgroundColor: "#1a4731" }]}>
          <Text style={styles.sendText}>Send</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  exitBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  exitText: { fontSize: 12, fontWeight: "600" },
  messages: { flex: 1 },
  messagesContent: { padding: 16, gap: 12 },
  message: { padding: 12, borderRadius: 12, maxWidth: "80%" },
  userMsg: { alignSelf: "flex-end" },
  assistantMsg: { alignSelf: "flex-start" },
  messageText: { fontSize: 14, lineHeight: 20 },
  inputContainer: { flexDirection: "row", padding: 12, gap: 8, borderTopWidth: 1 },
  input: { flex: 1, padding: 12, borderRadius: 12, fontSize: 14 },
  sendBtn: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, justifyContent: "center" },
  sendText: { color: "#ffffff", fontWeight: "600", fontSize: 14 },
});
