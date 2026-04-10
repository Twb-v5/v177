import { useState, useMemo } from "react";
import {
  View, Text, ScrollView, Pressable, TextInput, Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useSettings } from "@/providers/SettingsProvider";
import {
  Shield, Search, X, ChevronDown, ChevronUp, AlertTriangle, BookOpen, Info,
} from "lucide-react-native";
import { SINS, CATEGORY_META, SEVERITY_META, type SinCategory, type Sin } from "@/lib/sins-data";

const ALL_CATEGORIES: (SinCategory | "all")[] = ["all", "with_kaffarah", "major", "huquq_ibad", "common"];
const CATEGORY_LABELS: Record<string, string> = {
  all: "الكل",
  with_kaffarah: "لها كفارة",
  major: "كبائر",
  huquq_ibad: "حقوق العباد",
  common: "ذنوب شائعة",
};

function SinDetailModal({
  sin,
  onClose,
  isDark,
}: {
  sin: Sin;
  onClose: () => void;
  isDark: boolean;
}) {
  const bg = isDark ? "#0f0f1a" : "#fff";
  const textColor = isDark ? "#f9fafb" : "#111827";
  const subColor = isDark ? "#9ca3af" : "#6b7280";
  const catMeta = CATEGORY_META[sin.category];
  const sevMeta = SEVERITY_META[sin.severity];

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
          <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 10 }}>
              <Text style={{ fontSize: 28 }}>{sin.icon}</Text>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={{ fontSize: 18, fontWeight: "800", color: textColor }}>{sin.name}</Text>
                <View style={{ flexDirection: "row-reverse", gap: 6, marginTop: 4 }}>
                  <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, backgroundColor: catMeta.bg }}>
                    <Text style={{ fontSize: 10, fontWeight: "700", color: catMeta.color }}>{CATEGORY_LABELS[sin.category]}</Text>
                  </View>
                  <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, backgroundColor: sevMeta.bg }}>
                    <Text style={{ fontSize: 10, fontWeight: "700", color: sevMeta.color }}>{sevMeta.label}</Text>
                  </View>
                </View>
              </View>
            </View>
            <Pressable onPress={onClose} style={{ padding: 8 }}>
              <X size={22} color={subColor} />
            </Pressable>
          </View>

          <View style={{ backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", borderRadius: 14, padding: 14, marginBottom: 14 }}>
            <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Info size={14} color="#3b82f6" />
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#3b82f6" }}>الوصف</Text>
            </View>
            <Text style={{ fontSize: 14, color: textColor, textAlign: "right", lineHeight: 24 }}>{sin.desc}</Text>
          </View>

          <View style={{ backgroundColor: isDark ? "rgba(245,158,11,0.08)" : "rgba(245,158,11,0.06)", borderRadius: 14, padding: 14, marginBottom: 14 }}>
            <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <BookOpen size={14} color="#f59e0b" />
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#f59e0b" }}>الدليل</Text>
            </View>
            <Text style={{ fontSize: 13, color: textColor, textAlign: "right", lineHeight: 22, fontStyle: "italic" }}>{sin.daleel}</Text>
          </View>

          {sin.warning && (
            <View style={{ backgroundColor: isDark ? "rgba(239,68,68,0.08)" : "rgba(239,68,68,0.06)", borderRadius: 14, padding: 14, marginBottom: 14 }}>
              <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <AlertTriangle size={14} color="#ef4444" />
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#ef4444" }}>تحذير</Text>
              </View>
              <Text style={{ fontSize: 13, color: textColor, textAlign: "right", lineHeight: 22 }}>{sin.warning}</Text>
            </View>
          )}

          <View style={{ backgroundColor: isDark ? "rgba(16,185,129,0.08)" : "rgba(16,185,129,0.06)", borderRadius: 14, padding: 14, marginBottom: 14 }}>
            <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Shield size={14} color="#10b981" />
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#10b981" }}>شروط التوبة</Text>
            </View>
            {sin.conditions.map((cond, i) => (
              <View key={i} style={{ flexDirection: "row-reverse", alignItems: "flex-start", gap: 10, marginBottom: 8 }}>
                <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: "#10b981", alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ fontSize: 11, fontWeight: "700", color: "#fff" }}>{i + 1}</Text>
                </View>
                <Text style={{ fontSize: 13, color: textColor, textAlign: "right", lineHeight: 22, flex: 1 }}>{cond}</Text>
              </View>
            ))}
          </View>

          {sin.kaffarahLabel && (
            <View style={{ backgroundColor: isDark ? "rgba(139,92,246,0.08)" : "rgba(139,92,246,0.06)", borderRadius: 14, padding: 14, marginBottom: 14 }}>
              <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <Text style={{ fontSize: 14 }}>⚖️</Text>
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#8b5cf6" }}>الكفارة المطلوبة</Text>
              </View>
              <Text style={{ fontSize: 13, color: textColor, textAlign: "right", lineHeight: 22 }}>{sin.kaffarahLabel}</Text>
            </View>
          )}

          {sin.note && (
            <View style={{ backgroundColor: isDark ? "rgba(59,130,246,0.08)" : "rgba(59,130,246,0.06)", borderRadius: 14, padding: 14 }}>
              <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <Info size={14} color="#3b82f6" />
                <Text style={{ fontSize: 12, fontWeight: "700", color: "#3b82f6" }}>ملاحظة</Text>
              </View>
              <Text style={{ fontSize: 13, color: textColor, textAlign: "right", lineHeight: 22 }}>{sin.note}</Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function SinCard({
  sin,
  isDark,
  onPress,
}: {
  sin: Sin;
  isDark: boolean;
  onPress: () => void;
}) {
  const textColor = isDark ? "#f9fafb" : "#111827";
  const subColor = isDark ? "#9ca3af" : "#6b7280";
  const sevMeta = SEVERITY_META[sin.severity];

  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#fff",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)",
        padding: 14,
        marginBottom: 10,
        flexDirection: "row-reverse",
        alignItems: "center",
        gap: 12,
      }}
    >
      <Text style={{ fontSize: 26 }}>{sin.icon}</Text>
      <View style={{ flex: 1, alignItems: "flex-end" }}>
        <Text style={{ fontSize: 14, fontWeight: "700", color: textColor, textAlign: "right" }}>{sin.name}</Text>
        <Text style={{ fontSize: 12, color: subColor, textAlign: "right", marginTop: 2, lineHeight: 18 }} numberOfLines={2}>
          {sin.desc}
        </Text>
        <View style={{ flexDirection: "row-reverse", gap: 6, marginTop: 6 }}>
          <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5, backgroundColor: sevMeta.bg }}>
            <Text style={{ fontSize: 10, fontWeight: "700", color: sevMeta.color }}>{sevMeta.label}</Text>
          </View>
          {sin.kaffarahLabel && (
            <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5, backgroundColor: "rgba(139,92,246,0.12)" }}>
              <Text style={{ fontSize: 10, fontWeight: "700", color: "#8b5cf6" }}>كفارة</Text>
            </View>
          )}
        </View>
      </View>
      <ChevronDown size={16} color={subColor} style={{ transform: [{ rotate: "-90deg" }] }} />
    </Pressable>
  );
}

export default function SinsScreen() {
  const { isDark } = useColors();
  const [activeCategory, setActiveCategory] = useState<SinCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedSin, setSelectedSin] = useState<Sin | null>(null);

  const filtered = useMemo(() => {
    let list = SINS;
    if (activeCategory !== "all") list = list.filter((s) => s.category === activeCategory);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((s) => s.name.includes(q) || s.desc.includes(q));
    }
    return list;
  }, [activeCategory, search]);

  const bg = isDark ? "#0a0a0f" : "#f8fafc";
  const textColor = isDark ? "#f9fafb" : "#111827";
  const subColor = isDark ? "#9ca3af" : "#6b7280";
  const inputBg = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)";
  const borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      {selectedSin && (
        <SinDetailModal
          sin={selectedSin}
          onClose={() => setSelectedSin(null)}
          isDark={isDark}
        />
      )}

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <View style={{
            width: 44, height: 44, borderRadius: 22,
            backgroundColor: "rgba(239,68,68,0.15)",
            alignItems: "center", justifyContent: "center",
          }}>
            <Shield size={22} color="#ef4444" />
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontSize: 22, fontWeight: "800", color: textColor }}>دليل الذنوب</Text>
            <Text style={{ fontSize: 13, color: subColor }}>شروط التوبة والكفارة لكل ذنب</Text>
          </View>
        </View>

        <View style={{
          flexDirection: "row-reverse",
          alignItems: "center",
          backgroundColor: inputBg,
          borderRadius: 12, borderWidth: 1, borderColor,
          paddingHorizontal: 12, marginBottom: 16, gap: 8,
        }}>
          <Search size={16} color={subColor} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="ابحث عن ذنب..."
            placeholderTextColor={subColor}
            style={{ flex: 1, paddingVertical: 12, color: textColor, textAlign: "right", fontSize: 14 }}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <X size={16} color={subColor} />
            </Pressable>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: "row-reverse", gap: 8, paddingHorizontal: 2 }}>
            {ALL_CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              const meta = cat !== "all" ? CATEGORY_META[cat] : null;
              return (
                <Pressable
                  key={cat}
                  onPress={() => setActiveCategory(cat)}
                  style={{
                    paddingHorizontal: 14, paddingVertical: 7,
                    borderRadius: 20, borderWidth: 1.5,
                    borderColor: isActive ? (meta?.color || "#10b981") : borderColor,
                    backgroundColor: isActive ? (meta?.bg || "rgba(16,185,129,0.12)") : (isDark ? "rgba(255,255,255,0.04)" : "#fff"),
                  }}
                >
                  <Text style={{
                    fontSize: 12, fontWeight: "700",
                    color: isActive ? (meta?.color || "#10b981") : subColor,
                  }}>
                    {CATEGORY_LABELS[cat]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <Text style={{ fontSize: 12, color: subColor, textAlign: "right", marginBottom: 12 }}>
          {filtered.length} ذنب
        </Text>

        {filtered.map((sin) => (
          <SinCard
            key={sin.id}
            sin={sin}
            isDark={isDark}
            onPress={() => setSelectedSin(sin)}
          />
        ))}

        {filtered.length === 0 && (
          <View style={{ alignItems: "center", paddingVertical: 40 }}>
            <Text style={{ fontSize: 32, marginBottom: 10 }}>🔍</Text>
            <Text style={{ fontSize: 15, color: subColor }}>لا توجد نتائج</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
