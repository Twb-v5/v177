import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useSettings } from "@/providers/SettingsProvider";
import { useColors } from "@/hooks/useColors";
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";

const MOODS = [
  { id: "peaceful", emoji: "🌿", labelAr: "مطمئن", bg: { light: "#E8F5EE", dark: "#0D1F18" }, accent: { light: "#2D6A4F", dark: "#34D399" } },
  { id: "focused", emoji: "🎯", labelAr: "مركّز", bg: { light: "#EFF6FF", dark: "#080F1A" }, accent: { light: "#2563EB", dark: "#60A5FA" } },
  { id: "tired", emoji: "🌙", labelAr: "متعب", bg: { light: "#F5F0FF", dark: "#120A1A" }, accent: { light: "#7C3AED", dark: "#A78BFA" } },
  { id: "grateful", emoji: "✨", labelAr: "شاكر", bg: { light: "#FDF6E8", dark: "#1A1206" }, accent: { light: "#C8963E", dark: "#F59E0B" } },
  { id: "struggling", emoji: "💪", labelAr: "أتعافى", bg: { light: "#FFF1F0", dark: "#1A0A0A" }, accent: { light: "#DC2626", dark: "#EF4444" } },
] as const;

function MoodChip({ mood, isSelected, isDark, onPress }: { mood: typeof MOODS[number]; isSelected: boolean; isDark: boolean; onPress: () => void }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const bg = isDark ? mood.bg.dark : mood.bg.light;
  const accent = isDark ? mood.accent.dark : mood.accent.light;

  return (
    <Animated.View style={animStyle}>
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.93, { damping: 20, stiffness: 500 }); }}
        onPressOut={() => { scale.value = withSpring(1.0, { damping: 20, stiffness: 500 }); }}
        onPress={onPress}
        style={{
          paddingHorizontal: 14,
          paddingVertical: 9,
          borderRadius: 18,
          backgroundColor: isSelected ? bg : (isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"),
          borderWidth: 1,
          borderColor: isSelected ? accent + "40" : (isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"),
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
        }}
      >
        <Text style={{ fontSize: 14 }}>{mood.emoji}</Text>
        <Text style={{
          fontSize: 12, fontWeight: "700",
          fontFamily: "IBMPlexSansArabic_700Bold",
          color: isSelected ? accent : (isDark ? "#94A3B8" : "#6B7280"),
        }}>
          {mood.labelAr}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export function MoodSelector() {
  const { language } = useSettings();
  const c = useColors();
  const isDark = c.isDark;
  const isRTL = language === "ar";
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <View style={{ paddingHorizontal: 16 }}>
      <View style={{
        borderRadius: 22,
        padding: 16,
        backgroundColor: isDark ? "rgba(20,20,20,0.90)" : "rgba(255,255,255,0.90)",
        borderWidth: 1,
        borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.20 : 0.05,
        shadowRadius: 8,
        elevation: 2,
      }}>
        <Text style={{
          fontSize: 14, fontWeight: "800", color: c.text,
          fontFamily: "IBMPlexSansArabic_700Bold",
          textAlign: isRTL ? "right" : "left",
          marginBottom: 4,
        }}>
          كيف حالك اليوم؟
        </Text>
        <Text style={{
          fontSize: 11, color: c.textMuted,
          fontFamily: "IBMPlexSansArabic_400Regular",
          textAlign: isRTL ? "right" : "left",
          marginBottom: 14,
        }}>
          اختر شعورك — نرافقك في رحلتك
        </Text>

        <View style={{
          flexDirection: isRTL ? "row-reverse" : "row",
          flexWrap: "wrap",
          gap: 8,
          justifyContent: isRTL ? "flex-end" : "flex-start",
        }}>
          {MOODS.map((mood) => (
            <MoodChip
              key={mood.id}
              mood={mood}
              isSelected={selected === mood.id}
              isDark={isDark}
              onPress={() => setSelected(mood.id === selected ? null : mood.id)}
            />
          ))}
        </View>
      </View>
    </View>
  );
}
