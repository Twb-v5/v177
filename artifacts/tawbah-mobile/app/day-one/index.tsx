import { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { CheckCircle, Circle, Flame, AlertCircle, RefreshCw } from "lucide-react-native";
import { useColors } from "@/hooks/useColors";
import { useSettings } from "@/providers/SettingsProvider";
import { PageHeader } from "@/components/shared/PageHeader";
import { apiUrl } from "@/lib/api";
import { getSessionId } from "@/lib/session";

interface ApiHabit {
  id: number;
  habitKey: string;
  habitNameAr: string;
  completed: boolean;
  date: string;
}

const TODAY_TASKS = [
  {
    key: "wudu",
    title: "تطهّر الآن",
    icon: "💧",
    desc: "توضّأ وضوءاً كاملاً وصلِّ ركعتَين توبة",
    importance: "أهم خطوة — الطهارة الأولى في رحلتك",
    color: "#60A5FA",
  },
  {
    key: "covenant",
    title: "وقّع عهد التوبة",
    icon: "📜",
    desc: "أشهد الله على توبتك الصادقة وعزمك",
    importance: "العهد مع الله يقوّي الإرادة ويثبّت القرار",
    color: "#F59E0B",
  },
  {
    key: "delete_haram",
    title: "احذف المحتوى الحرام",
    icon: "🗑️",
    desc: "الآن — احذف كل محتوى أو تطبيق يقودك للمعصية",
    importance: "قطع الأسباب خطوة لا تُؤجَّل",
    color: "#F87171",
  },
  {
    key: "tell_trusted",
    title: "أخبر شخصاً تثق به",
    icon: "🤝",
    desc: "اطلب المساعدة والمحاسبة من صديق أو أحد أهلك",
    importance: "المحاسبة الاجتماعية تزيد من الاستمرار بثلاثة أضعاف",
    color: "#A78BFA",
  },
];

function TaskCard({ task, isCompleted, onToggle, isDark, c, isRTL, loading }: {
  task: typeof TODAY_TASKS[0]; isCompleted: boolean; onToggle: () => void;
  isDark: boolean; c: ReturnType<typeof useColors>; isRTL: boolean; loading: boolean;
}) {
  return (
    <Pressable
      onPress={onToggle}
      disabled={loading}
      style={{
        flexDirection: isRTL ? "row-reverse" : "row", gap: 14, padding: 16, borderRadius: 18, marginBottom: 12,
        backgroundColor: isCompleted ? (isDark ? `${task.color}15` : `${task.color}10`) : (isDark ? "rgba(14,14,14,0.92)" : "#fff"),
        borderWidth: 1.5, borderColor: isCompleted ? `${task.color}50` : (isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"),
        shadowColor: isCompleted ? task.color : "transparent", shadowOpacity: 0.12, shadowRadius: 8, shadowOffset: { width: 0, height: 3 },
        opacity: loading ? 0.7 : 1,
      }}
    >
      <View style={{ width: 52, height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: isCompleted ? `${task.color}20` : (isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)"), borderWidth: 1, borderColor: isCompleted ? `${task.color}40` : (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)") }}>
        <Text style={{ fontSize: 24 }}>{task.icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: "800", color: isCompleted ? task.color : c.text, fontFamily: "IBMPlexSansArabic_700Bold", textAlign: isRTL ? "right" : "left", textDecorationLine: isCompleted ? "line-through" : "none" }}>
          {task.title}
        </Text>
        <Text style={{ fontSize: 12, color: c.textSecondary, fontFamily: "IBMPlexSansArabic_400Regular", textAlign: isRTL ? "right" : "left", marginTop: 3, lineHeight: 18 }}>
          {task.desc}
        </Text>
        <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 5, marginTop: 6 }}>
          <Flame size={11} color={task.color} />
          <Text style={{ fontSize: 10, color: task.color, fontFamily: "IBMPlexSansArabic_400Regular", lineHeight: 15 }}>{task.importance}</Text>
        </View>
      </View>
      <View style={{ justifyContent: "flex-start", paddingTop: 2 }}>
        {loading ? <ActivityIndicator size="small" color={task.color} /> : isCompleted ? <CheckCircle size={24} color={task.color} /> : <Circle size={24} color={isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"} />}
      </View>
    </Pressable>
  );
}

export default function DayOneScreen() {
  const c = useColors();
  const { language } = useSettings();
  const isRTL = language === "ar";
  const isDark = c.isDark;

  const [completedHabits, setCompletedHabits] = useState<Set<string>>(new Set());
  const [loadingKeys, setLoadingKeys] = useState<Set<string>>(new Set());
  const [initialLoading, setInitialLoading] = useState(true);

  const today = new Date().toISOString().slice(0, 10);

  const fetchHabits = useCallback(async () => {
    setInitialLoading(true);
    try {
      const sid = getSessionId();
      const res = await fetch(apiUrl(`/habits?sessionId=${encodeURIComponent(sid)}&date=${today}`));
      if (res.ok) {
        const data = await res.json() as ApiHabit[];
        const done = new Set(data.filter(h => h.completed).map(h => h.habitKey));
        setCompletedHabits(done);
      }
    } catch (e) { console.error("Day-one habits fetch:", e); }
    finally { setInitialLoading(false); }
  }, [today]);

  useEffect(() => { fetchHabits(); }, [fetchHabits]);

  const toggleTask = async (key: string) => {
    const newCompleted = !completedHabits.has(key);
    Haptics.impactAsync(newCompleted ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light);
    setCompletedHabits(prev => { const s = new Set(prev); newCompleted ? s.add(key) : s.delete(key); return s; });
    setLoadingKeys(prev => new Set(prev).add(key));
    try {
      const sid = getSessionId();
      await fetch(apiUrl("/habits"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sid, habitKey: key, completed: newCompleted }),
      });
    } catch { setCompletedHabits(prev => { const s = new Set(prev); newCompleted ? s.delete(key) : s.add(key); return s; }); }
    finally { setLoadingKeys(prev => { const s = new Set(prev); s.delete(key); return s; }); }
  };

  const completedCount = TODAY_TASKS.filter(t => completedHabits.has(t.key)).length;
  const allDone = completedCount === TODAY_TASKS.length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={["top"]}>
      <PageHeader
        titleAr="مهام اليوم الأول"
        subtitleAr={`${completedCount} / ${TODAY_TASKS.length} مهام مكتملة`}
        rightAction={
          <Pressable onPress={fetchHabits} style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)", alignItems: "center", justifyContent: "center" }}>
            <RefreshCw size={16} color={c.textSecondary} />
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* Progress */}
        <Animated.View entering={FadeInDown.delay(0).springify()} style={{ borderRadius: 20, padding: 18, marginBottom: 16, backgroundColor: isDark ? "rgba(16,185,129,0.07)" : "#F0FDF4", borderWidth: 1, borderColor: isDark ? "rgba(16,185,129,0.18)" : "rgba(16,185,129,0.25)" }}>
          <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <Text style={{ fontSize: 13, color: "#10b981", fontFamily: "IBMPlexSansArabic_700Bold" }}>{completedCount}/{TODAY_TASKS.length}</Text>
            <Text style={{ fontSize: 15, fontWeight: "800", color: c.text, fontFamily: "IBMPlexSansArabic_700Bold" }}>بداية رحلتك</Text>
          </View>
          <View style={{ height: 8, borderRadius: 8, backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(16,185,129,0.15)", overflow: "hidden" }}>
            <View style={{ height: "100%", borderRadius: 8, backgroundColor: "#10b981", width: `${(completedCount / TODAY_TASKS.length) * 100}%` }} />
          </View>
        </Animated.View>

        {/* Alert */}
        <Animated.View entering={FadeInDown.delay(40).springify()} style={{ flexDirection: isRTL ? "row-reverse" : "row", gap: 10, padding: 14, borderRadius: 16, backgroundColor: "rgba(239,68,68,0.08)", borderWidth: 1, borderColor: "rgba(239,68,68,0.18)", marginBottom: 16, alignItems: "flex-start" }}>
          <AlertCircle size={18} color="#ef4444" style={{ marginTop: 2 }} />
          <Text style={{ flex: 1, fontSize: 12, color: "#ef4444", fontFamily: "IBMPlexSansArabic_400Regular", lineHeight: 20, textAlign: isRTL ? "right" : "left" }}>
            هذه المهام الأربع يجب إتمامها اليوم — لا تؤجّل ما يمكن فعله الآن.
          </Text>
        </Animated.View>

        {/* Tasks */}
        {initialLoading ? (
          <View style={{ alignItems: "center", paddingVertical: 40 }}>
            <ActivityIndicator size="large" color={c.primary} />
          </View>
        ) : (
          TODAY_TASKS.map((task, i) => (
            <Animated.View key={task.key} entering={FadeInDown.delay(80 + i * 60).springify()}>
              <TaskCard task={task} isCompleted={completedHabits.has(task.key)} onToggle={() => toggleTask(task.key)} isDark={isDark} c={c} isRTL={isRTL} loading={loadingKeys.has(task.key)} />
            </Animated.View>
          ))
        )}

        {allDone && !initialLoading && (
          <Animated.View entering={FadeIn.duration(400)} style={{ padding: 24, borderRadius: 22, alignItems: "center", marginTop: 8, backgroundColor: "rgba(16,185,129,0.08)", borderWidth: 1, borderColor: "rgba(16,185,129,0.22)" }}>
            <Text style={{ fontSize: 40, marginBottom: 10 }}>🎉</Text>
            <Text style={{ fontSize: 17, fontWeight: "800", color: "#10b981", fontFamily: "IBMPlexSansArabic_700Bold", textAlign: "center", marginBottom: 6 }}>
              أتممت يومك الأول — بارك الله فيك!
            </Text>
            <Text style={{ fontSize: 13, color: c.textSecondary, fontFamily: "IBMPlexSansArabic_400Regular", textAlign: "center", lineHeight: 22 }}>
              خطوة أولى حقيقية في رحلة التوبة. انطلق الآن إلى رحلة الـ٣٠ يوماً.
            </Text>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
