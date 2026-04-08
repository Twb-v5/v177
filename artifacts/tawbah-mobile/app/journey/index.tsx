import { useState, useEffect } from "react";
import { View, Text, Pressable, ScrollView, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeInDown, FadeIn, useSharedValue, useAnimatedStyle, withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  CheckCircle2, Circle, Lock, Trophy, Flame, Star, ChevronDown, ChevronUp,
} from "lucide-react-native";
import { useColors } from "@/hooks/useColors";
import { useSettings } from "@/providers/SettingsProvider";
import { PageHeader } from "@/components/shared/PageHeader";

const STORAGE_KEY = "journey30_completed_days";

const DAY_EMOJIS: Record<number, string> = {
  1: "🌅", 2: "📿", 3: "🤲", 4: "💧", 5: "📖",
  6: "🕌", 7: "🌱", 8: "🌙", 9: "⭐", 10: "🔑",
  11: "💎", 12: "🦋", 13: "🌊", 14: "🌿", 15: "☀️",
  16: "🕊️", 17: "🌸", 18: "🔥", 19: "🌟", 20: "🙏",
  21: "🌳", 22: "💫", 23: "🏔️", 24: "🎯", 25: "🌈",
  26: "👑", 27: "✨", 28: "🗝️", 29: "🌺", 30: "🏆",
};

const DAY_TASKS: Record<number, { titleAr: string; tasks: string[] }> = {
  1:  { titleAr: "بداية التوبة", tasks: ["اغتسل نية التوبة", "قرأ آية الكرسي 3 مرات", "استغفر 100 مرة"] },
  2:  { titleAr: "يوم الذكر", tasks: ["أذكار الصباح كاملة", "تسبيح 300 مرة", "أذكار المساء كاملة"] },
  3:  { titleAr: "يوم الدعاء", tasks: ["صلِّ ركعتي التوبة", "ادعُ بعد الفجر", "دعاء قبل النوم مكتوب"] },
  4:  { titleAr: "يوم الطهارة", tasks: ["الوضوء لكل صلاة", "غسل اليدين بنية", "تجنب النجاسة الروحية"] },
  5:  { titleAr: "يوم القرآن", tasks: ["اقرأ سورة البقرة أول ربع", "تدبّر آيتين", "احفظ آية كريمة"] },
  6:  { titleAr: "يوم الصلاة", tasks: ["صلِّ السنن الرواتب", "اخشع في ركعة واحدة", "صلاة الضحى"] },
  7:  { titleAr: "يوم الشكر", tasks: ["اكتب 10 نعم", "قل الحمد لله 100 مرة", "ادعُ للناس بالخير"] },
  8:  { titleAr: "يوم الصبر", tasks: ["تمرّن على الصمت 1 ساعة", "تجنب الشكوى اليوم", "قرأ عن فضل الصبر"] },
  9:  { titleAr: "يوم الصدق", tasks: ["لا تكذب اليوم", "قل الحق في موقف صعب", "حاسب نفسك مساءً"] },
  10: { titleAr: "يوم الجود", tasks: ["تصدّق ولو بدرهم", "ساعد شخصاً اليوم", "ابتسم في وجوه الناس"] },
  15: { titleAr: "منتصف الرحلة", tasks: ["راجع التزامك في 14 يوم", "صم يوم إن أمكن", "اكتب عهداً جديداً"] },
  20: { titleAr: "ثلثا الطريق", tasks: ["قرأ سورة الكهف", "صلِّ التهجد", "شارك رحلتك مع ثقة"] },
  30: { titleAr: "إتمام الرحلة", tasks: ["ختم جزء كاملاً", "قم بعمل صالح كبير", "ادعُ الله بالثبات"] },
};

function getTasksForDay(day: number) {
  if (DAY_TASKS[day]) return DAY_TASKS[day];
  const defaultTasks = [
    `أذكار الصباح والمساء – اليوم ${day}`,
    `تلاوة ربع جزء من القرآن`,
    `ذكر الله 100 مرة`,
  ];
  return { titleAr: `اليوم ${day}`, tasks: defaultTasks };
}

interface DayCardProps {
  day: number;
  isCompleted: boolean;
  isUnlocked: boolean;
  isRTL: boolean;
  isDark: boolean;
  c: any;
  onComplete: (day: number) => void;
}

function DayCard({ day, isCompleted, isUnlocked, isRTL, isDark, c, onComplete }: DayCardProps) {
  const [expanded, setExpanded] = useState(false);
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const info = getTasksForDay(day);
  const emoji = DAY_EMOJIS[day] ?? "✨";

  const isToday = isUnlocked && !isCompleted;
  const accent = isCompleted ? "#10b981" : isToday ? "#F59E0B" : "#6B7280";

  return (
    <Animated.View style={[animStyle, { marginBottom: 8 }]}>
      <View style={{
        borderRadius: 18,
        backgroundColor: isDark ? "rgba(14,14,14,0.92)" : "#fff",
        borderWidth: 1.5,
        borderColor: isCompleted ? "rgba(16,185,129,0.35)" : isToday ? "rgba(245,158,11,0.35)" : (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"),
        opacity: !isUnlocked ? 0.5 : 1,
        overflow: "hidden",
      }}>
        {isCompleted && <View style={{ height: 2, backgroundColor: "#10b981" }} />}
        {isToday && <View style={{ height: 2, backgroundColor: "#F59E0B" }} />}

        <Pressable
          onPressIn={() => { if (isUnlocked) scale.value = withSpring(0.98); }}
          onPressOut={() => { scale.value = withSpring(1); }}
          onPress={() => { if (isUnlocked) { setExpanded(e => !e); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } }}
          style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 12, padding: 14 }}>
          <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: `${accent}15`, borderWidth: 1, borderColor: `${accent}25`, alignItems: "center", justifyContent: "center" }}>
            {!isUnlocked ? (
              <Lock size={20} color={c.textMuted} />
            ) : (
              <Text style={{ fontSize: 22 }}>{emoji}</Text>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 6 }}>
              <Text style={{ fontSize: 10, fontWeight: "800", color: accent, fontFamily: "IBMPlexSansArabic_700Bold" }}>اليوم {day}</Text>
              {isToday && (
                <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, backgroundColor: "rgba(245,158,11,0.15)" }}>
                  <Text style={{ fontSize: 9, fontWeight: "800", color: "#F59E0B", fontFamily: "IBMPlexSansArabic_700Bold" }}>اليوم</Text>
                </View>
              )}
            </View>
            <Text style={{ fontSize: 13, fontWeight: "800", color: c.text, fontFamily: "IBMPlexSansArabic_700Bold", marginTop: 2 }}>{info.titleAr}</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            {isCompleted && <CheckCircle2 size={20} color="#10b981" />}
            {!isCompleted && isUnlocked && (
              expanded ? <ChevronUp size={18} color={c.textMuted} /> : <ChevronDown size={18} color={c.textMuted} />
            )}
            {!isUnlocked && <Lock size={16} color={c.textMuted} />}
          </View>
        </Pressable>

        {expanded && isUnlocked && (
          <Animated.View entering={FadeIn.duration(200)} style={{ paddingHorizontal: 14, paddingBottom: 14 }}>
            <View style={{ height: 1, backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", marginBottom: 12 }} />
            {info.tasks.map((task, i) => (
              <View key={i} style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: accent }} />
                <Text style={{ flex: 1, fontSize: 13, color: c.textSecondary, fontFamily: "IBMPlexSansArabic_400Regular" }}>{task}</Text>
              </View>
            ))}
            {!isCompleted && (
              <Pressable
                onPress={() => { onComplete(day); setExpanded(false); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }}
                style={{ marginTop: 10, paddingVertical: 12, borderRadius: 14, alignItems: "center", backgroundColor: "#F59E0B" }}>
                <Text style={{ fontSize: 14, fontWeight: "800", color: "#1a0e00", fontFamily: "IBMPlexSansArabic_700Bold" }}>✓ أتممت مهام اليوم</Text>
              </Pressable>
            )}
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
}

export default function JourneyScreen() {
  const c = useColors();
  const { language } = useSettings();
  const isRTL = language === "ar";
  const isDark = c.isDark;
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set());

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) {
        const parsed = JSON.parse(raw) as number[];
        setCompletedDays(new Set(parsed));
      }
    });
  }, []);

  const completeDay = async (day: number) => {
    const updated = new Set([...completedDays, day]);
    setCompletedDays(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(updated)));
  };

  const completedCount = completedDays.size;
  const streakDays = completedCount;
  const progressPct = (completedCount / 30) * 100;
  const currentDay = completedCount + 1;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={["top"]}>
      <PageHeader titleAr="رحلة ٣٠ يوماً" subtitleAr="طريقك إلى التوبة النصوح" />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        <View style={{ borderRadius: 22, padding: 20, marginBottom: 18, overflow: "hidden",
          backgroundColor: isDark ? "rgba(245,158,11,0.07)" : "#FFFBEB", borderWidth: 1, borderColor: isDark ? "rgba(245,158,11,0.18)" : "rgba(245,158,11,0.3)" }}>
          <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <View>
              <Text style={{ fontSize: 13, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }}>تقدمك في الرحلة</Text>
              <Text style={{ fontSize: 26, fontWeight: "900", color: "#F59E0B", fontFamily: "IBMPlexSansArabic_700Bold", marginTop: 2 }}>{completedCount} / 30</Text>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 40 }}>{completedCount >= 30 ? "🏆" : completedCount >= 20 ? "🌳" : completedCount >= 10 ? "🌿" : "🌱"}</Text>
            </View>
          </View>

          <View style={{ height: 10, borderRadius: 10, backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(245,158,11,0.15)", overflow: "hidden", marginBottom: 10 }}>
            <View style={{ height: "100%", borderRadius: 10, backgroundColor: "#F59E0B", width: `${progressPct}%` }} />
          </View>

          <View style={{ flexDirection: isRTL ? "row-reverse" : "row", justifyContent: "space-between" }}>
            <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 4 }}>
              <Flame size={13} color="#F59E0B" />
              <Text style={{ fontSize: 12, color: "#F59E0B", fontFamily: "IBMPlexSansArabic_700Bold", fontWeight: "700" }}>{streakDays} يوم متواصل</Text>
            </View>
            <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 4 }}>
              <Star size={13} color="#F59E0B" />
              <Text style={{ fontSize: 12, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }}>{30 - completedCount} يوم متبقية</Text>
            </View>
          </View>
        </View>

        {completedCount >= 30 ? (
          <Animated.View entering={FadeIn.duration(600)} style={{ padding: 24, borderRadius: 22, alignItems: "center", marginBottom: 18, backgroundColor: "rgba(16,185,129,0.08)", borderWidth: 1.5, borderColor: "rgba(16,185,129,0.3)" }}>
            <Text style={{ fontSize: 56 }}>🏆</Text>
            <Text style={{ fontSize: 20, fontWeight: "900", color: "#10b981", fontFamily: "IBMPlexSansArabic_700Bold", textAlign: "center", marginTop: 10 }}>أتممت رحلتك!</Text>
            <Text style={{ fontSize: 14, color: c.textSecondary, fontFamily: "Amiri_400Regular", textAlign: "center", lineHeight: 28, marginTop: 8 }}>
              «وَالَّذِينَ جَاهَدُوا فِينَا لَنَهْدِيَنَّهُمْ سُبُلَنَا»
            </Text>
          </Animated.View>
        ) : null}

        {Array.from({ length: 30 }, (_, i) => i + 1).map((day, i) => (
          <Animated.View key={day} entering={FadeInDown.delay(i < 10 ? i * 30 : 0).springify()}>
            <DayCard
              day={day}
              isCompleted={completedDays.has(day)}
              isUnlocked={day <= currentDay}
              isRTL={isRTL}
              isDark={isDark}
              c={c}
              onComplete={completeDay}
            />
          </Animated.View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
