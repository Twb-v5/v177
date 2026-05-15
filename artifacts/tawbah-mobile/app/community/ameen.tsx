import { useState, useEffect, useCallback, useRef } from "react";
import { View, Text, Pressable, FlatList, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeInDown, useSharedValue, useAnimatedStyle, withSpring, withSequence,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Heart, Clock, Users, PenLine, X, Send, RefreshCw } from "lucide-react-native";
import { useColors } from "@/hooks/useColors";
import { useSettings } from "@/providers/SettingsProvider";
import { PageHeader } from "@/components/shared/PageHeader";
import { apiUrl } from "@/lib/api";
import { getSessionId } from "@/lib/session";

interface ApiDua {
  id: number;
  content: string;
  amenCount: number;
  createdAt: string;
}

interface DuaPost {
  id: number;
  text: string;
  timeAgo: string;
  amenCount: number;
  didAmeen: boolean;
}

function formatRelativeTime(isoStr: string): string {
  try {
    const diff = Date.now() - new Date(isoStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1)  return "الآن";
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24)   return `منذ ${hours} ساعة`;
    const days = Math.floor(hours / 24);
    return `منذ ${days} أيام`;
  } catch { return ""; }
}

function DuaCard({ item, isRTL, isDark, c, onAmeen }: { item: DuaPost; isRTL: boolean; isDark: boolean; c: any; onAmeen: (id: number) => void }) {
  const heartScale = useSharedValue(1);
  const heartStyle = useAnimatedStyle(() => ({ transform: [{ scale: heartScale.value }] }));

  const handleAmeen = () => {
    if (!item.didAmeen) {
      heartScale.value = withSequence(withSpring(1.4, { damping: 8 }), withSpring(1, { damping: 12 }));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onAmeen(item.id);
  };

  return (
    <Animated.View style={{ marginBottom: 10 }}>
      <View style={{
        borderRadius: 18,
        backgroundColor: isDark ? "rgba(14,14,14,0.92)" : "#fff",
        borderWidth: 1.5,
        borderColor: item.didAmeen ? "rgba(245,158,11,0.35)" : (isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"),
        padding: 14,
      }}>
        {item.didAmeen && <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, borderRadius: 17, backgroundColor: "rgba(245,158,11,0.04)" }} />}

        <Text style={{ fontSize: 15, fontFamily: "Amiri_400Regular", color: c.text, textAlign: isRTL ? "right" : "left", lineHeight: 30, marginBottom: 12 }}>
          {item.text}
        </Text>

        <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 6 }}>
            <Clock size={10} color={c.textMuted} />
            <Text style={{ fontSize: 10, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }}>{item.timeAgo}</Text>
          </View>

          <Animated.View style={heartStyle}>
            <Pressable onPress={handleAmeen}
              style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12,
                backgroundColor: item.didAmeen ? "rgba(245,158,11,0.15)" : (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"),
                borderWidth: 1, borderColor: item.didAmeen ? "rgba(245,158,11,0.35)" : (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)") }}>
              <Heart size={14} color={item.didAmeen ? "#F59E0B" : c.textMuted} fill={item.didAmeen ? "#F59E0B" : "transparent"} />
              <Text style={{ fontSize: 12, fontWeight: "700", color: item.didAmeen ? "#F59E0B" : c.textSecondary, fontFamily: "IBMPlexSansArabic_700Bold" }}>
                آمين · {item.amenCount.toLocaleString("ar-EG")}
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </View>
    </Animated.View>
  );
}

export default function AmeenScreen() {
  const c = useColors();
  const { language } = useSettings();
  const isRTL = language === "ar";
  const isDark = c.isDark;

  const [duas, setDuas] = useState<DuaPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCompose, setShowCompose] = useState(false);
  const [newDua, setNewDua] = useState("");
  const [posting, setPosting] = useState(false);
  const ameenedIds = useRef<Set<number>>(new Set());

  const loadDuas = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(apiUrl("/community-duas?limit=20"));
      if (res.ok) {
        const data = await res.json() as { duas: ApiDua[] };
        setDuas(data.duas.map((d) => ({
          id: d.id,
          text: d.content,
          timeAgo: formatRelativeTime(d.createdAt),
          amenCount: d.amenCount,
          didAmeen: ameenedIds.current.has(d.id),
        })));
      }
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadDuas(); }, [loadDuas]);

  const handleAmeen = useCallback(async (id: number) => {
    const already = ameenedIds.current.has(id);
    if (already) return;

    ameenedIds.current.add(id);
    setDuas(prev => prev.map(d => d.id === id ? { ...d, didAmeen: true, amenCount: d.amenCount + 1 } : d));

    try {
      await fetch(apiUrl(`/community-duas/${id}/amen`), { method: "POST" });
    } catch {
      ameenedIds.current.delete(id);
      setDuas(prev => prev.map(d => d.id === id ? { ...d, didAmeen: false, amenCount: d.amenCount - 1 } : d));
    }
  }, []);

  const handlePost = useCallback(async () => {
    const text = newDua.trim();
    if (!text || posting) return;
    setPosting(true);
    try {
      const sessionId = await getSessionId();
      const res = await fetch(apiUrl("/community-duas"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, content: text }),
      });
      if (res.ok) {
        setNewDua("");
        setShowCompose(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await loadDuas();
      }
    } catch {}
    finally { setPosting(false); }
  }, [newDua, posting, loadDuas]);

  const totalAmeens = duas.reduce((sum, d) => sum + d.amenCount, 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={["top"]}>
      <PageHeader
        titleAr="آمين الجماعية"
        subtitleAr="ادعُ فيؤمّن عليك المسلمون"
        rightAction={
          <Pressable onPress={loadDuas} style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)", alignItems: "center", justifyContent: "center" }}>
            <RefreshCw size={16} color={c.textMuted} />
          </Pressable>
        }
      />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>

        {/* Stats bar */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 10 }}>
          <View style={{ flexDirection: isRTL ? "row-reverse" : "row", gap: 10 }}>
            <View style={{ flex: 1, padding: 12, borderRadius: 14, backgroundColor: isDark ? "rgba(245,158,11,0.07)" : "#FFFBEB", borderWidth: 1, borderColor: "rgba(245,158,11,0.2)", alignItems: "center" }}>
              <Heart size={14} color="#F59E0B" />
              <Text style={{ fontSize: 16, fontWeight: "900", color: "#F59E0B", fontFamily: "IBMPlexSansArabic_700Bold", marginTop: 2 }}>{totalAmeens.toLocaleString("ar-EG")}</Text>
              <Text style={{ fontSize: 9, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }}>إجمالي آمين</Text>
            </View>
            <View style={{ flex: 1, padding: 12, borderRadius: 14, backgroundColor: isDark ? "rgba(16,185,129,0.07)" : "#F0FDF4", borderWidth: 1, borderColor: "rgba(16,185,129,0.2)", alignItems: "center" }}>
              <Users size={14} color="#10b981" />
              <Text style={{ fontSize: 16, fontWeight: "900", color: "#10b981", fontFamily: "IBMPlexSansArabic_700Bold", marginTop: 2 }}>{duas.length}</Text>
              <Text style={{ fontSize: 9, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }}>دعاء منشور</Text>
            </View>
          </View>
        </View>

        {/* Compose box */}
        {showCompose && (
          <View style={{ marginHorizontal: 16, marginBottom: 10, borderRadius: 16, padding: 14, backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#fff", borderWidth: 1.5, borderColor: "rgba(16,185,129,0.3)" }}>
            <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <Pressable onPress={() => setShowCompose(false)}>
                <X size={18} color={c.textMuted} />
              </Pressable>
              <Text style={{ fontSize: 13, fontWeight: "800", color: c.text, fontFamily: "IBMPlexSansArabic_700Bold" }}>شارك دعاءك</Text>
            </View>
            <TextInput
              multiline
              placeholder="اكتب دعاءك هنا..."
              placeholderTextColor={c.textMuted}
              value={newDua}
              onChangeText={setNewDua}
              maxLength={300}
              style={{ fontSize: 15, fontFamily: "Amiri_400Regular", color: c.text, textAlign: isRTL ? "right" : "left", lineHeight: 28, minHeight: 80, textAlignVertical: "top" }}
            />
            <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", justifyContent: "space-between", marginTop: 10 }}>
              <Text style={{ fontSize: 10, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }}>{newDua.length}/300</Text>
              <Pressable
                onPress={handlePost}
                disabled={!newDua.trim() || posting}
                style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, backgroundColor: newDua.trim() ? "#10b981" : (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)") }}
              >
                {posting ? <ActivityIndicator size="small" color="#fff" /> : <Send size={14} color={newDua.trim() ? "#fff" : c.textMuted} />}
                <Text style={{ fontSize: 12, fontWeight: "700", color: newDua.trim() ? "#fff" : c.textMuted, fontFamily: "IBMPlexSansArabic_700Bold" }}>نشر</Text>
              </Pressable>
            </View>
          </View>
        )}

        {loading ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator size="large" color={c.primary} />
          </View>
        ) : (
          <FlatList
            data={duas}
            keyExtractor={d => String(d.id)}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <Animated.View entering={FadeInDown.delay(index < 8 ? index * 50 : 0).springify()}>
                <DuaCard item={item} isRTL={isRTL} isDark={isDark} c={c} onAmeen={handleAmeen} />
              </Animated.View>
            )}
            ListEmptyComponent={
              <View style={{ alignItems: "center", paddingVertical: 60 }}>
                <Text style={{ fontSize: 32, marginBottom: 12 }}>🤲</Text>
                <Text style={{ fontSize: 15, fontWeight: "800", color: c.text, fontFamily: "IBMPlexSansArabic_700Bold", textAlign: "center" }}>لا توجد أدعية بعد</Text>
                <Text style={{ fontSize: 12, color: c.textSecondary, fontFamily: "IBMPlexSansArabic_400Regular", marginTop: 6 }}>كن أول من يشارك دعاءه</Text>
              </View>
            }
            ListFooterComponent={duas.length > 0 ? (
              <View style={{ padding: 16, borderRadius: 18, alignItems: "center", backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)", borderWidth: 1, borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)" }}>
                <Text style={{ fontSize: 14, fontFamily: "Amiri_400Regular", color: c.textSecondary, textAlign: "center", lineHeight: 28 }}>
                  «الدعاء مخّ العبادة»
                </Text>
                <Text style={{ fontSize: 11, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular", marginTop: 4 }}>رواه الترمذي</Text>
              </View>
            ) : null}
          />
        )}

        {/* Compose FAB */}
        {!showCompose && (
          <Pressable
            onPress={() => { setShowCompose(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}
            style={{ position: "absolute", bottom: 24, left: 24, width: 52, height: 52, borderRadius: 26, backgroundColor: "#10b981", alignItems: "center", justifyContent: "center", elevation: 8, shadowColor: "#10b981", shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }}
          >
            <PenLine size={22} color="#fff" />
          </Pressable>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
