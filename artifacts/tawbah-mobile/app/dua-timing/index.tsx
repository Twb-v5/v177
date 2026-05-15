import { useState, useEffect, useRef } from "react";
import {
  View, Text, ScrollView, Pressable, Animated as RNAnimated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useSettings } from "@/providers/SettingsProvider";
import { Zap, Clock, Star, ChevronDown, ChevronUp } from "lucide-react-native";
import {
  buildDuaWindows,
  calcDuaPower,
  getPowerLabel,
  getNextPeakDescription,
  type DuaWindow,
} from "@/lib/dua-power";

function PowerGauge({ score, isDark }: { score: number; isDark: boolean }) {
  const pulseAnim = useRef(new RNAnimated.Value(1)).current;
  const fillAnim = useRef(new RNAnimated.Value(0)).current;
  const { label, color, pulse } = getPowerLabel(score);

  useEffect(() => {
    RNAnimated.timing(fillAnim, {
      toValue: score / 100,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [score]);

  useEffect(() => {
    if (!pulse) return;
    const loop = RNAnimated.loop(
      RNAnimated.sequence([
        RNAnimated.timing(pulseAnim, { toValue: 1.12, duration: 900, useNativeDriver: true }),
        RNAnimated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const bgColor = isDark ? "#1a1a2e" : "#f0f4ff";
  const trackColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const fillWidth = fillAnim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });

  return (
    <RNAnimated.View style={{ transform: [{ scale: pulseAnim }] }}>
      <View style={{
        backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
        borderRadius: 24,
        padding: 24,
        alignItems: "center",
        borderWidth: 1,
        borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
      }}>
        <View style={{
          width: 140, height: 140, borderRadius: 70,
          backgroundColor: bgColor,
          alignItems: "center", justifyContent: "center",
          borderWidth: 3, borderColor: color,
          marginBottom: 16,
        }}>
          <Text style={{ fontSize: 48, fontWeight: "900", color }}>{score}</Text>
          <Text style={{ fontSize: 12, color: isDark ? "#9ca3af" : "#6b7280", marginTop: 2 }}>/ 100</Text>
        </View>

        <Text style={{ fontSize: 18, fontWeight: "700", color, marginBottom: 6, textAlign: "center" }}>
          {label}
        </Text>

        <View style={{
          width: "100%", height: 8,
          backgroundColor: trackColor,
          borderRadius: 4, overflow: "hidden",
          marginTop: 8,
        }}>
          <RNAnimated.View style={{
            height: "100%",
            width: fillWidth,
            backgroundColor: color,
            borderRadius: 4,
          }} />
        </View>
        <Text style={{
          fontSize: 11, color: isDark ? "#6b7280" : "#9ca3af",
          marginTop: 6, textAlign: "center",
        }}>
          درجة إجابة الدعاء الآن
        </Text>
      </View>
    </RNAnimated.View>
  );
}

function WindowCard({
  win,
  isDark,
  expanded,
  onToggle,
}: {
  win: DuaWindow;
  isDark: boolean;
  expanded: boolean;
  onToggle: () => void;
}) {
  const c = useColors();
  const cardBg = win.active || win.alwaysActive
    ? (isDark ? "rgba(16,185,129,0.12)" : "rgba(16,185,129,0.08)")
    : (isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)");
  const borderColor = win.active || win.alwaysActive
    ? "rgba(16,185,129,0.4)"
    : (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)");
  const accentColor = win.active || win.alwaysActive ? c.primary : (isDark ? "#6b7280" : "#9ca3af");
  const textColor = isDark ? "#f9fafb" : "#111827";
  const subColor = isDark ? "#9ca3af" : "#6b7280";

  return (
    <Pressable
      onPress={onToggle}
      style={{
        backgroundColor: cardBg,
        borderRadius: 16,
        borderWidth: 1,
        borderColor,
        padding: 16,
        marginBottom: 10,
      }}
    >
      <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "flex-start" }}>
        <View style={{ flexDirection: "row-reverse", alignItems: "center", flex: 1, gap: 10 }}>
          <View style={{
            width: 36, height: 36, borderRadius: 18,
            backgroundColor: win.active || win.alwaysActive ? "rgba(16,185,129,0.2)" : (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"),
            alignItems: "center", justifyContent: "center",
          }}>
            <Zap size={16} color={accentColor} />
          </View>
          <View style={{ flex: 1, alignItems: "flex-end" }}>
            <Text style={{ fontSize: 14, fontWeight: "700", color: textColor, textAlign: "right" }}>
              {win.label}
            </Text>
            <Text style={{ fontSize: 11, color: subColor, textAlign: "right", marginTop: 2 }}>
              {win.sub}
            </Text>
          </View>
        </View>
        <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 8, marginRight: 8 }}>
          <View style={{
            paddingHorizontal: 8, paddingVertical: 3,
            backgroundColor: win.active || win.alwaysActive ? c.primary : (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)"),
            borderRadius: 8,
          }}>
            <Text style={{ fontSize: 11, fontWeight: "700", color: win.active || win.alwaysActive ? "#fff" : subColor }}>
              {win.alwaysActive ? "دائماً" : win.active ? "نشط" : "غير نشط"}
            </Text>
          </View>
          <View style={{
            paddingHorizontal: 6, paddingVertical: 3,
            backgroundColor: "rgba(59,130,246,0.15)", borderRadius: 6,
          }}>
            <Text style={{ fontSize: 11, fontWeight: "700", color: "#3b82f6" }}>{win.power}</Text>
          </View>
          {expanded ? <ChevronUp size={16} color={subColor} /> : <ChevronDown size={16} color={subColor} />}
        </View>
      </View>

      {expanded && (
        <View style={{ marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }}>
          <Text style={{ fontSize: 12, color: subColor, textAlign: "right", lineHeight: 20, marginBottom: 10, fontStyle: "italic" }}>
            {win.hadith}
          </Text>
          <View style={{
            backgroundColor: isDark ? "rgba(16,185,129,0.08)" : "rgba(16,185,129,0.06)",
            borderRadius: 10, padding: 10,
          }}>
            <Text style={{ fontSize: 11, fontWeight: "700", color: c.primary, marginBottom: 4, textAlign: "right" }}>
              أفضل دعاء الآن:
            </Text>
            <Text style={{ fontSize: 13, color: textColor, textAlign: "right", lineHeight: 22 }}>
              {win.bestDua}
            </Text>
          </View>
        </View>
      )}
    </Pressable>
  );
}

export default function DuaTimingScreen() {
  const c = useColors();
  const isDark = c.isDark;
  const { language } = useSettings();
  const [score, setScore] = useState(0);
  const [windows, setWindows] = useState<DuaWindow[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [nextPeak, setNextPeak] = useState("");

  useEffect(() => {
    const refresh = () => {
      const s = calcDuaPower();
      setScore(s);
      setWindows(buildDuaWindows());
      setNextPeak(getNextPeakDescription(s));
    };
    refresh();
    const interval = setInterval(refresh, 60000);
    return () => clearInterval(interval);
  }, []);

  const bg = isDark ? "#0a0a0f" : "#f8fafc";
  const cardBg = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)";
  const textColor = isDark ? "#f9fafb" : "#111827";
  const subColor = isDark ? "#9ca3af" : "#6b7280";

  const activeWindows = windows.filter((w) => w.active || w.alwaysActive);
  const inactiveWindows = windows.filter((w) => !w.active && !w.alwaysActive);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <View style={{
            width: 44, height: 44, borderRadius: 22,
            backgroundColor: "rgba(59,130,246,0.15)",
            alignItems: "center", justifyContent: "center",
          }}>
            <Zap size={22} color="#3b82f6" />
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontSize: 22, fontWeight: "800", color: textColor }}>أوقات إجابة الدعاء</Text>
            <Text style={{ fontSize: 13, color: subColor }}>تعرّف على أفضل أوقات الدعاء</Text>
          </View>
        </View>

        <PowerGauge score={score} isDark={isDark} />

        <View style={{
          backgroundColor: cardBg, borderRadius: 16, padding: 16,
          marginVertical: 16, borderWidth: 1,
          borderColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
        }}>
          <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Clock size={16} color="#3b82f6" />
            <Text style={{ fontSize: 13, fontWeight: "700", color: textColor }}>اللحظة القادمة</Text>
          </View>
          <Text style={{ fontSize: 13, color: subColor, textAlign: "right", lineHeight: 22 }}>
            {nextPeak}
          </Text>
        </View>

        {activeWindows.length > 0 && (
          <View style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Star size={16} color={c.primary} />
              <Text style={{ fontSize: 14, fontWeight: "700", color: c.primary }}>
                أوقات نشطة الآن ({activeWindows.length})
              </Text>
            </View>
            {activeWindows.map((win) => (
              <WindowCard
                key={win.id}
                win={win}
                isDark={isDark}
                expanded={expandedId === win.id}
                onToggle={() => setExpandedId(expandedId === win.id ? null : win.id)}
              />
            ))}
          </View>
        )}

        <View>
          <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Clock size={16} color={subColor} />
            <Text style={{ fontSize: 14, fontWeight: "700", color: subColor }}>
              أوقات أخرى ({inactiveWindows.length})
            </Text>
          </View>
          {inactiveWindows.map((win) => (
            <WindowCard
              key={win.id}
              win={win}
              isDark={isDark}
              expanded={expandedId === win.id}
              onToggle={() => setExpandedId(expandedId === win.id ? null : win.id)}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
