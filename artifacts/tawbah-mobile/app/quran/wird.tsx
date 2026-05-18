import { useState, useEffect, useCallback } from "react";
import {
  View, Text, Pressable, StyleSheet, ScrollView, Dimensions,
  Platform, Share, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import {
  Flame, Check, BookOpen, Trophy, Star, ChevronDown, ChevronUp,
  Share2, RotateCcw, Target, TrendingUp,
} from "lucide-react-native";

const { width: SW } = Dimensions.get("window");

// ─── Constants ────────────────────────────────────────────────────────────────

const WIRD_LEVELS = [
  { id: "mubtadi",  label: "مبتدئ",  pages: 2,  icon: "🌱", color: "#10b981", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.3)", desc: "صفحتان يومياً — الاستمرارية أهم" },
  { id: "muntazim", label: "منتظم",  pages: 5,  icon: "📖", color: "#c8a84b", bg: "rgba(200,168,75,0.12)",  border: "rgba(200,168,75,0.3)",  desc: "٥ صفحات — ربع جزء يومياً" },
  { id: "muhtasib", label: "محتسب", pages: 10, icon: "⚡", color: "#3b82f6", bg: "rgba(59,130,246,0.12)",  border: "rgba(59,130,246,0.3)",  desc: "١٠ صفحات — نصف جزء يومياً" },
  { id: "jadd",     label: "جادّ",   pages: 15, icon: "🔥", color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)",  desc: "١٥ صفحة — ثلاثة أرباع جزء" },
  { id: "khatim",   label: "خاتم",   pages: 20, icon: "👑", color: "#8b5cf6", bg: "rgba(139,92,246,0.12)", border: "rgba(139,92,246,0.3)",  desc: "٢٠ صفحة — ختم كل شهر" },
];

const ACHIEVEMENTS = [
  { id: "first_day",    title: "أول خطوة",       desc: "أكملت وردك ليوم واحد",    icon: "🌟", cond: (s: number, k: number) => s >= 1 },
  { id: "week",         title: "أسبوع المثابرة",  desc: "٧ أيام متتالية",           icon: "🗓️", cond: (s: number, k: number) => s >= 7 },
  { id: "month",        title: "شهر النور",        desc: "٣٠ يوماً متتالية",         icon: "🌙", cond: (s: number, k: number) => s >= 30 },
  { id: "first_khatma", title: "أول ختمة",         desc: "أتممت ختمة كاملة",         icon: "📜", cond: (s: number, k: number) => k >= 1 },
  { id: "three_khatma", title: "ثلاث ختمات",       desc: "٣ ختمات متتالية",          icon: "💎", cond: (s: number, k: number) => k >= 3 },
  { id: "hundred_days", title: "مئة يوم",           desc: "١٠٠ يوم من القرآن",        icon: "💯", cond: (s: number, k: number) => s >= 100 },
];

function todayStr(): string {
  return new Date().toISOString().split("T")[0]!;
}

// ─── AsyncStorage helpers ────────────────────────────────────────────────────

async function getStr(key: string, fb: string): Promise<string> {
  try { return (await AsyncStorage.getItem(key)) ?? fb; } catch { return fb; }
}
async function setStr(key: string, val: string): Promise<void> {
  try { await AsyncStorage.setItem(key, val); } catch {}
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function WirdScreen() {
  const router = useRouter();
  const c = useColors();
  const isDark = c.isDark;

  const [ready, setReady]               = useState(false);
  const [levelId, setLevelId]           = useState("muntazim");
  const [totalDone, setTotalDone]       = useState(0);
  const [streak, setStreak]             = useState(0);
  const [checked, setChecked]           = useState<boolean[]>([]);
  const [completedToday, setCompletedToday] = useState(false);
  const [historyLog, setHistoryLog]     = useState<Record<string, boolean>>({});
  const [showCelebration, setShowCelebration] = useState(false);
  const [showLevelPicker, setShowLevelPicker] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const level = WIRD_LEVELS.find(l => l.id === levelId) ?? WIRD_LEVELS[1]!;
  const target = level.pages;
  const safeChecked = checked.length === target ? checked : Array(target).fill(false);

  // ── Load from AsyncStorage on mount ──
  useEffect(() => {
    (async () => {
      const [savedLevel, savedTotal, savedStreak, savedCheckedRaw, savedDate,
             savedCompletedDate, savedHistoryRaw] = await Promise.all([
        getStr("wird_level", "muntazim"),
        getStr("wird_total", "0"),
        getStr("wird_streak", "0"),
        getStr("wird_checked", "[]"),
        getStr("wird_date", ""),
        getStr("wird_completed_date", ""),
        getStr("wird_history", "{}"),
      ]);

      const today = todayStr();
      let parsedStreak = parseInt(savedStreak) || 0;
      let parsedTotal = parseInt(savedTotal) || 0;
      let parsedHistory: Record<string, boolean> = {};
      try { parsedHistory = JSON.parse(savedHistoryRaw) as Record<string, boolean>; } catch {}

      // auto-reset on new day
      if (savedDate && savedDate !== today) {
        const wasCompleted = savedCompletedDate === savedDate;
        if (wasCompleted) {
          const prev = new Date(savedDate);
          const diff = Math.round((new Date(today).getTime() - prev.getTime()) / 86400000);
          parsedStreak = diff === 1 ? parsedStreak + 1 : 1;
          parsedHistory = { ...parsedHistory, [savedDate]: true };
        } else {
          parsedStreak = 0;
          parsedHistory = { ...parsedHistory, [savedDate]: false };
        }
        await Promise.all([
          setStr("wird_streak", String(parsedStreak)),
          setStr("wird_history", JSON.stringify(parsedHistory)),
          setStr("wird_date", today),
          setStr("wird_checked", "[]"),
        ]);
        setStreak(parsedStreak);
        setHistoryLog(parsedHistory);
        setChecked([]);
        setCompletedToday(false);
      } else {
        setStreak(parsedStreak);
        setHistoryLog(parsedHistory);
        let parsedChecked: boolean[] = [];
        if (savedDate === today) {
          try { const p = JSON.parse(savedCheckedRaw); parsedChecked = Array.isArray(p) ? p : []; } catch {}
        }
        setChecked(parsedChecked);
        setCompletedToday(savedCompletedDate === today);
      }

      setLevelId(savedLevel);
      setTotalDone(parsedTotal);
      setReady(true);
    })();
  }, []);

  // ── Toggle page check ──
  const togglePage = useCallback(async (idx: number) => {
    const current = checked.length === target ? checked : Array(target).fill(false);
    const next = [...current];
    next[idx] = !next[idx];
    setChecked(next);
    await Promise.all([
      setStr("wird_checked", JSON.stringify(next)),
      setStr("wird_date", todayStr()),
    ]);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const doneCount = next.filter(Boolean).length;

    if (doneCount === target && !completedToday) {
      setCompletedToday(true);
      const khatmaPages = 604;
      const newTotal = totalDone + target;
      const newKhatmas = Math.floor(newTotal / khatmaPages);
      const oldKhatmas = Math.floor(totalDone / khatmaPages);
      setTotalDone(newTotal);
      await Promise.all([
        setStr("wird_completed_date", todayStr()),
        setStr("wird_total", String(newTotal)),
      ]);
      setShowCelebration(true);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => setShowCelebration(false), 3000);
      if (newKhatmas > oldKhatmas) {
        Alert.alert("🎉 ختمة مباركة!", `أتممت ختمة القرآن الكريم! (${newKhatmas} ختمات)`);
      }
    }
  }, [checked, target, completedToday, totalDone]);

  // ── Change level ──
  const changeLevel = useCallback(async (id: string) => {
    setLevelId(id);
    setShowLevelPicker(false);
    setChecked([]);
    await Promise.all([
      setStr("wird_level", id),
      setStr("wird_checked", "[]"),
    ]);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  // ── Reset today ──
  const resetToday = () => {
    Alert.alert("إعادة تعيين", "هل تريد مسح ورد اليوم؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "نعم", style: "destructive", onPress: async () => {
          setChecked(Array(target).fill(false));
          setCompletedToday(false);
          await Promise.all([
            setStr("wird_checked", "[]"),
            setStr("wird_completed_date", ""),
          ]);
        },
      },
    ]);
  };

  // ── Share streak ──
  const shareStreak = async () => {
    try {
      await Share.share({ message: `ختمت وردي القرآني اليوم 📖\nالمستوى: ${level.icon} ${level.label} (${level.pages} صفحات/يوم)\nالسلسلة: ${streak} يوم متتالي\n\n#دليل_التوبة_النصوح` });
    } catch {}
  };

  if (!ready) return <View style={{ flex: 1, backgroundColor: c.background }} />;

  const doneCount = safeChecked.filter(Boolean).length;
  const progress = target > 0 ? doneCount / target : 0;
  const khatmas = Math.floor(totalDone / 604);
  const pagesLeft = totalDone % 604 === 0 && totalDone > 0 ? 0 : 604 - (totalDone % 604);

  // 30-day calendar
  const calendarDays: { date: string; done: boolean | null }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0]!;
    calendarDays.push({ date: key, done: key in historyLog ? historyLog[key]! : null });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={["top"]}>
      {/* Header */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: c.border }}>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Pressable onPress={shareStreak} style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: c.surfaceElevated, alignItems: "center", justifyContent: "center" }}>
            <Share2 size={16} color={c.textMuted} />
          </Pressable>
          <Pressable onPress={resetToday} style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: c.surfaceElevated, alignItems: "center", justifyContent: "center" }}>
            <RotateCcw size={16} color={c.textMuted} />
          </Pressable>
        </View>
        <Text style={{ fontSize: 18, fontWeight: "700", color: c.text, fontFamily: Platform.OS === "ios" ? "Georgia" : "serif" }}>وردي القرآني</Text>
        <Pressable onPress={() => router.back()} style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, backgroundColor: c.surfaceElevated }}>
          <Text style={{ fontSize: 12, color: c.textMuted }}>رجوع</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, gap: 16 }}>

        {/* Celebration banner */}
        {showCelebration && (
          <View style={{ backgroundColor: level.bg, borderRadius: 16, padding: 16, alignItems: "center", borderWidth: 1, borderColor: level.border }}>
            <Text style={{ fontSize: 32 }}>🎉</Text>
            <Text style={{ fontSize: 18, fontWeight: "800", color: level.color, marginTop: 4 }}>أحسنت! أكملت وردك اليوم</Text>
            <Text style={{ fontSize: 13, color: c.textSecondary, marginTop: 4 }}>جزاك الله خيراً على المواظبة</Text>
          </View>
        )}

        {/* Level Selector */}
        <Pressable
          onPress={() => setShowLevelPicker(!showLevelPicker)}
          style={{ backgroundColor: level.bg, borderRadius: 16, padding: 14, borderWidth: 1.5, borderColor: level.border, flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between" }}>
          <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 10 }}>
            <Text style={{ fontSize: 28 }}>{level.icon}</Text>
            <View>
              <Text style={{ fontSize: 16, fontWeight: "700", color: level.color }}>{level.label}</Text>
              <Text style={{ fontSize: 11, color: c.textSecondary, marginTop: 2 }}>{level.desc}</Text>
            </View>
          </View>
          {showLevelPicker ? <ChevronUp size={18} color={c.textMuted} /> : <ChevronDown size={18} color={c.textMuted} />}
        </Pressable>

        {showLevelPicker && (
          <View style={{ gap: 8 }}>
            {WIRD_LEVELS.map(lv => (
              <Pressable key={lv.id} onPress={() => changeLevel(lv.id)}
                style={{ backgroundColor: lv.id === levelId ? lv.bg : c.surfaceElevated, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: lv.id === levelId ? lv.border : c.border, flexDirection: "row-reverse", alignItems: "center", gap: 12 }}>
                <Text style={{ fontSize: 22 }}>{lv.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: "700", color: lv.color }}>{lv.label} — {lv.pages} صفحات</Text>
                  <Text style={{ fontSize: 11, color: c.textSecondary }}>{lv.desc}</Text>
                </View>
                {lv.id === levelId && <Check size={16} color={lv.color} />}
              </Pressable>
            ))}
          </View>
        )}

        {/* Progress Ring + Stats */}
        <View style={{ backgroundColor: c.surface, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: c.border }}>
          <View style={{ flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between" }}>
            {/* Circular progress */}
            <View style={{ alignItems: "center", gap: 4 }}>
              <View style={{ width: 88, height: 88, borderRadius: 44, borderWidth: 8, borderColor: level.border,
                backgroundColor: progress > 0 ? level.bg : "transparent", alignItems: "center", justifyContent: "center" }}>
                <Text style={{ fontSize: 22, fontWeight: "800", color: level.color }}>{doneCount}</Text>
                <Text style={{ fontSize: 10, color: c.textMuted }}>من {target}</Text>
              </View>
              <Text style={{ fontSize: 11, color: c.textSecondary }}>{Math.round(progress * 100)}٪</Text>
            </View>

            {/* Stats */}
            <View style={{ gap: 14, flex: 1, paddingRight: 16 }}>
              <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 8 }}>
                <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: "rgba(245,158,11,0.15)", alignItems: "center", justifyContent: "center" }}>
                  <Flame size={16} color="#f59e0b" />
                </View>
                <View>
                  <Text style={{ fontSize: 18, fontWeight: "800", color: c.text }}>{streak}</Text>
                  <Text style={{ fontSize: 10, color: c.textMuted }}>يوم متتالي</Text>
                </View>
              </View>
              <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 8 }}>
                <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: "rgba(139,92,246,0.15)", alignItems: "center", justifyContent: "center" }}>
                  <Trophy size={16} color="#8b5cf6" />
                </View>
                <View>
                  <Text style={{ fontSize: 18, fontWeight: "800", color: c.text }}>{khatmas}</Text>
                  <Text style={{ fontSize: 10, color: c.textMuted }}>ختمة مكتملة</Text>
                </View>
              </View>
              <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 8 }}>
                <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: "rgba(16,185,129,0.15)", alignItems: "center", justifyContent: "center" }}>
                  <TrendingUp size={16} color="#10b981" />
                </View>
                <View>
                  <Text style={{ fontSize: 18, fontWeight: "800", color: c.text }}>{totalDone}</Text>
                  <Text style={{ fontSize: 10, color: c.textMuted }}>إجمالي الصفحات</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Progress bar */}
          <View style={{ height: 8, borderRadius: 4, backgroundColor: c.backgroundDeep, marginTop: 14, overflow: "hidden" }}>
            <View style={{ width: `${progress * 100}%`, height: "100%", borderRadius: 4, backgroundColor: level.color }} />
          </View>
          {completedToday && (
            <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 6, marginTop: 10 }}>
              <Check size={14} color={level.color} />
              <Text style={{ fontSize: 12, fontWeight: "600", color: level.color }}>أكملت وردك اليوم — بارك الله فيك</Text>
            </View>
          )}
        </View>

        {/* Page Checkboxes */}
        <View style={{ backgroundColor: c.surface, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: c.border }}>
          <View style={{ flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 8 }}>
              <BookOpen size={16} color={level.color} />
              <Text style={{ fontSize: 15, fontWeight: "700", color: c.text }}>صفحات اليوم</Text>
            </View>
            <Pressable onPress={() => router.push("/quran/mushaf" as any)}
              style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: level.bg, borderWidth: 1, borderColor: level.border }}>
              <Text style={{ fontSize: 11, fontWeight: "600", color: level.color }}>افتح المصحف</Text>
            </Pressable>
          </View>

          <View style={{ flexDirection: "row-reverse", flexWrap: "wrap", gap: 10 }}>
            {safeChecked.map((done, i) => (
              <Pressable
                key={i}
                onPress={() => togglePage(i)}
                style={{ width: (SW - 80) / Math.min(target, 5), minWidth: 52,
                  aspectRatio: 1, borderRadius: 14, alignItems: "center", justifyContent: "center",
                  backgroundColor: done ? level.color : c.backgroundDeep,
                  borderWidth: 2, borderColor: done ? level.color : c.border }}>
                {done
                  ? <Check size={20} color="#fff" />
                  : <Text style={{ fontSize: 14, fontWeight: "700", color: c.textMuted }}>{i + 1}</Text>}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Achievements */}
        <View style={{ backgroundColor: c.surface, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: c.border }}>
          <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Star size={16} color="#f59e0b" />
            <Text style={{ fontSize: 15, fontWeight: "700", color: c.text }}>الإنجازات</Text>
          </View>
          <View style={{ flexDirection: "row-reverse", flexWrap: "wrap", gap: 8 }}>
            {ACHIEVEMENTS.map(a => {
              const earned = a.cond(streak, khatmas);
              return (
                <View key={a.id} style={{ width: (SW - 56) / 3, padding: 10, borderRadius: 14, alignItems: "center", gap: 4,
                  backgroundColor: earned ? (isDark ? "rgba(251,191,36,0.1)" : "rgba(251,191,36,0.08)") : c.backgroundDeep,
                  borderWidth: 1, borderColor: earned ? "rgba(251,191,36,0.3)" : c.border,
                  opacity: earned ? 1 : 0.5 }}>
                  <Text style={{ fontSize: 22 }}>{a.icon}</Text>
                  <Text style={{ fontSize: 9, fontWeight: "700", color: earned ? "#f59e0b" : c.textMuted, textAlign: "center" }}>{a.title}</Text>
                  <Text style={{ fontSize: 8, color: c.textMuted, textAlign: "center" }}>{a.desc}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* 30-Day Calendar */}
        <View style={{ backgroundColor: c.surface, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: c.border }}>
          <Pressable onPress={() => setShowCalendar(!showCalendar)} style={{ flexDirection: "row-reverse", alignItems: "center", justifyContent: "space-between", marginBottom: showCalendar ? 14 : 0 }}>
            <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 8 }}>
              <Target size={16} color={level.color} />
              <Text style={{ fontSize: 15, fontWeight: "700", color: c.text }}>التقويم (30 يوم)</Text>
            </View>
            {showCalendar ? <ChevronUp size={18} color={c.textMuted} /> : <ChevronDown size={18} color={c.textMuted} />}
          </Pressable>

          {showCalendar && (
            <View style={{ flexDirection: "row-reverse", flexWrap: "wrap", gap: 4 }}>
              {calendarDays.map((day, i) => {
                const isToday = day.date === todayStr();
                const color = day.done === true ? level.color : day.done === false ? c.danger : isToday ? level.color + "44" : c.backgroundDeep;
                const borderColor = isToday ? level.color : c.border;
                return (
                  <View key={i} style={{ width: (SW - 72) / 10, aspectRatio: 1, borderRadius: 6, backgroundColor: color, borderWidth: isToday ? 2 : 1, borderColor }} />
                );
              })}
            </View>
          )}
        </View>

        {/* Next khatma progress */}
        {pagesLeft > 0 && (
          <View style={{ backgroundColor: c.surface, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: c.border, flexDirection: "row-reverse", alignItems: "center", gap: 12 }}>
            <Text style={{ fontSize: 24 }}>📿</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: c.text, textAlign: "right" }}>متبقي لإتمام الختمة: {pagesLeft} صفحة</Text>
              <View style={{ height: 5, borderRadius: 3, backgroundColor: c.backgroundDeep, marginTop: 6, overflow: "hidden" }}>
                <View style={{ width: `${((604 - pagesLeft) / 604) * 100}%`, height: "100%", borderRadius: 3, backgroundColor: "#8b5cf6" }} />
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
