import { useState, useCallback } from "react";
import { View, Text, FlatList, Pressable, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import { BookOpen, Trophy, Users, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react-native";
import { useColors } from "@/hooks/useColors";
import { useSettings } from "@/providers/SettingsProvider";
import { PageHeader } from "@/components/shared/PageHeader";

interface KhatmaSession {
  id: string;
  name: string;
  startDate: string;
  progress: number;
  totalJuz: number;
  completedJuz: number;
  participants: number;
  isActive: boolean;
}

const SAMPLE_KHATMAS: KhatmaSession[] = [
  {
    id: "1",
    name: "ختمة رمضان ١٤٤٦",
    startDate: "٢٠٢٥/٠٣/٠١",
    progress: 65,
    totalJuz: 30,
    completedJuz: 19,
    participants: 5,
    isActive: true,
  },
  {
    id: "2",
    name: "الختمة اليومية",
    startDate: "٢٠٢٥/٠٤/٠١",
    progress: 30,
    totalJuz: 30,
    completedJuz: 9,
    participants: 1,
    isActive: true,
  },
];

function KhatmaCard({
  item,
  isDark,
  c,
  onUpdate,
  onDelete,
}: {
  item: KhatmaSession;
  isDark: boolean;
  c: ReturnType<typeof useColors>;
  onUpdate: (id: string, delta: number) => void;
  onDelete: (id: string) => void;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View
      entering={FadeInDown.springify()}
      style={[animStyle, { marginBottom: 14 }]}
    >
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.98); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        style={{
          borderRadius: 20,
          backgroundColor: isDark ? "rgba(14,14,14,0.92)" : "#fff",
          borderWidth: 1,
          borderColor: item.progress === 100
            ? "rgba(16,185,129,0.35)"
            : isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)",
          padding: 16,
          ...Platform.select({
            ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 },
            android: { elevation: 3 },
          }),
        }}
      >
        {/* Header Row */}
        <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
          <View style={{ flex: 1, alignItems: "flex-end" }}>
            <Text style={{ fontSize: 17, fontWeight: "800", color: c.text, fontFamily: "IBMPlexSansArabic_700Bold", marginBottom: 4, textAlign: "right" }}>
              {item.name}
            </Text>
            <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 10 }}>
              <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 4 }}>
                <Ionicons name="calendar-outline" size={12} color={c.textMuted} />
                <Text style={{ fontSize: 11, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }}>
                  {item.startDate}
                </Text>
              </View>
              {item.participants > 1 && (
                <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 4 }}>
                  <Users size={12} color={c.textMuted} />
                  <Text style={{ fontSize: 11, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }}>
                    {item.participants} مشاركين
                  </Text>
                </View>
              )}
            </View>
          </View>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onDelete(item.id);
            }}
            style={{ padding: 8 }}
          >
            <Trash2 size={18} color={c.danger ?? "#ef4444"} />
          </Pressable>
        </View>

        {/* Progress Bar */}
        <View style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: "row-reverse", justifyContent: "space-between", marginBottom: 6 }}>
            <Text style={{ fontSize: 12, fontWeight: "700", color: c.textSecondary, fontFamily: "IBMPlexSansArabic_700Bold" }}>
              الجزء {item.completedJuz} من {item.totalJuz}
            </Text>
            <Text style={{ fontSize: 12, fontWeight: "700", color: item.progress === 100 ? "#10b981" : c.primary, fontFamily: "IBMPlexSansArabic_700Bold" }}>
              {item.progress}٪
            </Text>
          </View>
          <View style={{ height: 8, borderRadius: 4, backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)", overflow: "hidden" }}>
            <View style={{ width: `${item.progress}%`, height: "100%", borderRadius: 4, backgroundColor: item.progress === 100 ? "#10b981" : c.primary }} />
          </View>
        </View>

        {/* Juz Dots Grid */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4, marginBottom: 14, justifyContent: "flex-end" }}>
          {Array.from({ length: item.totalJuz }).map((_, i) => (
            <View
              key={i}
              style={{
                width: 18, height: 18, borderRadius: 4,
                backgroundColor: i < item.completedJuz
                  ? (item.progress === 100 ? "#10b981" : c.primary)
                  : isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)",
              }}
            />
          ))}
        </View>

        {/* Controls */}
        {item.isActive && item.progress < 100 && (
          <View style={{ flexDirection: "row-reverse", justifyContent: "center", alignItems: "center", gap: 10 }}>
            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onUpdate(item.id, -1); }}
              disabled={item.completedJuz === 0}
              style={{ paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)", opacity: item.completedJuz === 0 ? 0.4 : 1 }}
            >
              <Text style={{ fontSize: 18, color: c.text, fontWeight: "700" }}>−</Text>
            </Pressable>

            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onUpdate(item.id, 1); }}
              style={{ flexDirection: "row-reverse", alignItems: "center", gap: 6, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, backgroundColor: c.primary }}
            >
              <BookOpen size={16} color="#fff" />
              <Text style={{ color: "#fff", fontWeight: "700", fontFamily: "IBMPlexSansArabic_700Bold", fontSize: 13 }}>
                أضف جزءاً
              </Text>
            </Pressable>

            <Pressable
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onUpdate(item.id, 5); }}
              style={{ paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" }}
            >
              <Text style={{ fontSize: 13, color: c.text, fontWeight: "700" }}>+٥</Text>
            </Pressable>
          </View>
        )}

        {/* Completed Badge */}
        {item.progress === 100 && (
          <View style={{ flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 8, paddingVertical: 10, borderRadius: 12, backgroundColor: "rgba(16,185,129,0.12)" }}>
            <Trophy size={20} color="#10b981" />
            <Text style={{ fontSize: 15, fontWeight: "700", color: "#10b981", fontFamily: "IBMPlexSansArabic_700Bold" }}>
              أتممت الختمة — الحمد لله!
            </Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

export default function QuranKhatmaScreen() {
  const router = useRouter();
  const c = useColors();
  const { language } = useSettings();
  const isDark = c.isDark;

  const [khatmas, setKhatmas] = useState<KhatmaSession[]>(SAMPLE_KHATMAS);

  const handleUpdate = useCallback((id: string, delta: number) => {
    setKhatmas(prev => prev.map(k => {
      if (k.id !== id) return k;
      const newCompleted = Math.max(0, Math.min(k.completedJuz + delta, k.totalJuz));
      return {
        ...k,
        completedJuz: newCompleted,
        progress: Math.round((newCompleted / k.totalJuz) * 100),
        isActive: newCompleted < k.totalJuz,
      };
    }));
  }, []);

  const handleDelete = useCallback((id: string) => {
    Alert.alert(
      "حذف الختمة",
      "هل تريد حذف هذه الختمة؟",
      [
        { text: "إلغاء", style: "cancel" },
        { text: "حذف", style: "destructive", onPress: () => setKhatmas(prev => prev.filter(k => k.id !== id)) },
      ]
    );
  }, []);

  const handleNew = useCallback(() => {
    Alert.alert(
      "ختمة جديدة",
      "هل تريد بدء ختمة جديدة؟",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "ابدأ",
          onPress: () => {
            const now = new Date();
            const dateAr = now.toLocaleDateString("ar-SA");
            setKhatmas(prev => [{
              id: Date.now().toString(),
              name: `ختمتي ${dateAr}`,
              startDate: dateAr,
              progress: 0,
              totalJuz: 30,
              completedJuz: 0,
              participants: 1,
              isActive: true,
            }, ...prev]);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  }, []);

  const totalKhatmas = khatmas.length;
  const activeKhatmas = khatmas.filter(k => k.isActive && k.progress < 100).length;
  const completedKhatmas = khatmas.filter(k => k.progress === 100).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={["top"]}>
      <PageHeader titleAr="متابعة الختمة" showBack />

      {/* Stats Row */}
      <View style={{
        flexDirection: "row-reverse", marginHorizontal: 16, marginTop: 12, marginBottom: 8,
        borderRadius: 18, backgroundColor: isDark ? "rgba(14,14,14,0.92)" : "#fff",
        borderWidth: 1, borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)",
        padding: 16,
        ...Platform.select({
          ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8 },
          android: { elevation: 2 },
        }),
      }}>
        {[
          { num: totalKhatmas,     label: "إجمالي الختمات", color: c.text },
          { num: activeKhatmas,    label: "جارية",          color: c.primary },
          { num: completedKhatmas, label: "مكتملة",         color: "#10b981" },
        ].map((stat, i, arr) => (
          <View key={stat.label} style={{ flex: 1, alignItems: "center" }}>
            <Text style={{ fontSize: 28, fontWeight: "800", color: stat.color, fontFamily: "IBMPlexSansArabic_700Bold" }}>
              {stat.num}
            </Text>
            <Text style={{ fontSize: 11, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular", marginTop: 2 }}>
              {stat.label}
            </Text>
            {i < arr.length - 1 && (
              <View style={{ position: "absolute", left: 0, top: "20%", bottom: "20%", width: 1, backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)" }} />
            )}
          </View>
        ))}
      </View>

      {/* Add Button */}
      <Pressable
        onPress={handleNew}
        style={{
          flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 8,
          marginHorizontal: 16, marginBottom: 12, paddingVertical: 13, borderRadius: 16,
          backgroundColor: c.primary,
          ...Platform.select({
            ios: { shadowColor: c.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 10 },
            android: { elevation: 5 },
          }),
        }}
      >
        <Plus size={18} color="#fff" />
        <Text style={{ color: "#fff", fontWeight: "700", fontFamily: "IBMPlexSansArabic_700Bold", fontSize: 15 }}>
          ختمة جديدة
        </Text>
      </Pressable>

      {/* List */}
      <FlatList
        data={khatmas}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <KhatmaCard item={item} isDark={isDark} c={c} onUpdate={handleUpdate} onDelete={handleDelete} />
        )}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: "center", paddingVertical: 60 }}>
            <BookOpen size={52} color={c.textMuted} />
            <Text style={{ fontSize: 15, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular", marginTop: 16, textAlign: "center" }}>
              لا توجد ختمات بعد{"\n"}ابدأ ختمتك الأولى الآن
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
