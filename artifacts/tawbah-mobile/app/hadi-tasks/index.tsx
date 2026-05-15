import { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, Pressable, TextInput, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeInDown, FadeIn, useSharedValue, useAnimatedStyle, withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CheckCircle2, Circle, Plus, Trash2, Zap, Trophy, RotateCcw } from "lucide-react-native";
import { useColors } from "@/hooks/useColors";
import { useSettings } from "@/providers/SettingsProvider";
import { PageHeader } from "@/components/shared/PageHeader";

const STORAGE_KEY = "hadi_tasks_v1";

interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  category: "wudu" | "prayer" | "dhikr" | "quran" | "custom";
}

const DEFAULT_TASKS: Task[] = [
  { id: "1", title: "توضأ الآن وجدّد نيتك", completed: false, createdAt: new Date().toISOString(), category: "wudu" },
  { id: "2", title: "صلِّ ركعتين بنية التوبة", completed: false, createdAt: new Date().toISOString(), category: "prayer" },
  { id: "3", title: "استغفر الله ١٠٠ مرة", completed: false, createdAt: new Date().toISOString(), category: "dhikr" },
  { id: "4", title: "اقرأ صفحة من القرآن", completed: false, createdAt: new Date().toISOString(), category: "quran" },
  { id: "5", title: "احذف التطبيقات المحرمة", completed: false, createdAt: new Date().toISOString(), category: "custom" },
  { id: "6", title: "غيّر بيئتك الآن", completed: false, createdAt: new Date().toISOString(), category: "custom" },
];

const CAT_EMOJI: Record<Task["category"], string> = {
  wudu: "💧", prayer: "🕌", dhikr: "📿", quran: "📖", custom: "⚡",
};
const CAT_ACCENT: Record<Task["category"], string> = {
  wudu: "#60A5FA", prayer: "#34D399", dhikr: "#A78BFA", quran: "#F59E0B", custom: "#F87171",
};

function TaskItem({ task, onToggle, onDelete, index }: {
  task: Task; onToggle: () => void; onDelete: () => void; index: number;
}) {
  const c = useColors();
  const isDark = c.isDark;
  const scale = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const accent = CAT_ACCENT[task.category];

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()} style={anim}>
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.97, { damping: 20 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 18 }); }}
        onPress={() => { onToggle(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}
        style={{
          flexDirection: "row", alignItems: "center",
          padding: 14, borderRadius: 18, marginBottom: 10,
          backgroundColor: isDark ? "rgba(14,14,14,0.95)" : "rgba(255,255,255,0.95)",
          borderWidth: 1.5,
          borderColor: task.completed ? `${accent}40` : c.divider,
          shadowColor: task.completed ? accent : "transparent",
          shadowOpacity: task.completed ? 0.1 : 0,
          shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
          elevation: task.completed ? 3 : 1,
        }}
      >
        {task.completed
          ? <CheckCircle2 size={22} color={accent} />
          : <Circle size={22} color={c.textMuted} />
        }
        <View style={{ flex: 1, marginHorizontal: 12 }}>
          <Text style={{
            fontSize: 14, fontWeight: task.completed ? "700" : "400",
            color: task.completed ? accent : c.text,
            fontFamily: task.completed ? "IBMPlexSansArabic_700Bold" : "IBMPlexSansArabic_400Regular",
            textDecorationLine: task.completed ? "line-through" : "none",
            textDecorationColor: task.completed ? accent : "transparent",
            textAlign: "right",
          }}>
            {task.title}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={{ fontSize: 16 }}>{CAT_EMOJI[task.category]}</Text>
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onDelete(); }}
            style={{ padding: 4 }}
          >
            <Trash2 size={14} color={c.textMuted} />
          </Pressable>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function HadiTasksScreen() {
  const c = useColors();
  const { language } = useSettings();
  const isDark = c.isDark;

  const [tasks, setTasks] = useState<Task[]>(DEFAULT_TASKS);
  const [newTitle, setNewTitle] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(v => { if (v) setTasks(JSON.parse(v)); });
  }, []);

  const save = useCallback((updated: Task[]) => {
    setTasks(updated);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, []);

  const toggle = (id: string) => {
    save(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    save(tasks.filter(t => t.id !== id));
  };

  const addTask = () => {
    if (!newTitle.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const t: Task = { id: Date.now().toString(), title: newTitle.trim(), completed: false, createdAt: new Date().toISOString(), category: "custom" };
    save([...tasks, t]);
    setNewTitle("");
    setAdding(false);
  };

  const reset = () => {
    Alert.alert("إعادة ضبط", "هل تريد إعادة جميع المهام؟", [
      { text: "إلغاء", style: "cancel" },
      { text: "إعادة", style: "destructive", onPress: () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); save(DEFAULT_TASKS); } },
    ]);
  };

  const done = tasks.filter(t => t.completed).length;
  const total = tasks.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <PageHeader
          titleAr="مهام اليوم"
          subtitleAr={`${done}/${total} مكتمل`}
          rightAction={
            <Pressable onPress={reset} style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", alignItems: "center", justifyContent: "center" }}>
              <RotateCcw size={16} color={c.textSecondary} />
            </Pressable>
          }
        />
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>

            {/* Progress Hero */}
            <Animated.View entering={FadeInDown.delay(60).springify()} style={{ marginTop: 20, marginBottom: 20 }}>
              <View style={{
                borderRadius: 24, padding: 20, overflow: "hidden",
                backgroundColor: isDark ? "rgba(14,14,14,0.95)" : "rgba(255,255,255,0.95)",
                borderWidth: 1.5, borderColor: c.primaryGlow,
                shadowColor: c.primary, shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
                elevation: 6,
              }}>
                <View style={{ position: "absolute", inset: 0, backgroundColor: c.primaryGlow, opacity: 0.25, borderRadius: 22 }} />
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <Text style={{ fontSize: 22, fontWeight: "800", color: pct === 100 ? c.primary : c.text, fontFamily: "IBMPlexSansArabic_700Bold" }}>
                    {pct === 100 ? "أحسنت! 🎉" : `${pct}%`}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    {pct === 100 ? <Trophy size={20} color={c.accent} /> : <Zap size={20} color={c.primary} />}
                    <Text style={{ fontSize: 13, color: c.textSecondary, fontFamily: "IBMPlexSansArabic_400Regular" }}>
                      {done} / {total}
                    </Text>
                  </View>
                </View>
                <View style={{ height: 8, backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", borderRadius: 8, overflow: "hidden" }}>
                  <View style={{ height: "100%", width: `${pct}%`, backgroundColor: c.primary, borderRadius: 8 }} />
                </View>
                {pct === 100 && (
                  <Text style={{ fontSize: 12, color: c.primary, fontFamily: "IBMPlexSansArabic_400Regular", textAlign: "center", marginTop: 8 }}>
                    أكملت جميع مهام اليوم — بارك الله فيك!
                  </Text>
                )}
              </View>
            </Animated.View>

            {/* Tasks */}
            {tasks.map((task, i) => (
              <TaskItem key={task.id} task={task} index={i} onToggle={() => toggle(task.id)} onDelete={() => deleteTask(task.id)} />
            ))}

            {/* Add Task */}
            {adding ? (
              <Animated.View entering={FadeIn.duration(250)} style={{ flexDirection: "row", gap: 10, alignItems: "center", marginBottom: 12 }}>
                <Pressable
                  onPress={addTask}
                  style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: c.primary, alignItems: "center", justifyContent: "center" }}
                >
                  <Plus size={20} color="#fff" />
                </Pressable>
                <TextInput
                  value={newTitle}
                  onChangeText={setNewTitle}
                  placeholder="اكتب مهمة جديدة..."
                  placeholderTextColor={c.textMuted}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={addTask}
                  style={{
                    flex: 1, height: 44, borderRadius: 14, paddingHorizontal: 14,
                    backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                    color: c.text, fontSize: 14, fontFamily: "IBMPlexSansArabic_400Regular",
                    textAlign: "right", borderWidth: 1, borderColor: c.primaryGlow,
                  }}
                />
              </Animated.View>
            ) : (
              <Animated.View entering={FadeInDown.delay(tasks.length * 50 + 60).springify()}>
                <Pressable
                  onPress={() => { setAdding(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                  style={{
                    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
                    padding: 14, borderRadius: 18,
                    backgroundColor: isDark ? "rgba(16,185,129,0.08)" : "rgba(45,106,79,0.05)",
                    borderWidth: 1.5, borderColor: c.primaryGlow, borderStyle: "dashed",
                  }}
                >
                  <Plus size={16} color={c.primary} />
                  <Text style={{ fontSize: 13, color: c.primary, fontWeight: "700", fontFamily: "IBMPlexSansArabic_700Bold" }}>
                    أضف مهمة جديدة
                  </Text>
                </Pressable>
              </Animated.View>
            )}

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
