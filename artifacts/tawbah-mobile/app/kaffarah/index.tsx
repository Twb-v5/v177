import { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { CheckCircle, Circle, AlertCircle, RefreshCw, ChevronDown, ChevronUp } from "lucide-react-native";
import { useColors } from "@/hooks/useColors";
import { useSettings } from "@/providers/SettingsProvider";
import { PageHeader } from "@/components/shared/PageHeader";
import { apiUrl } from "@/lib/api";
import { getSessionId } from "@/lib/session";

interface KaffarahStep {
  id: number;
  stepKey: string;
  completed: boolean;
  completedAt: string | null;
}

interface KaffarahCategory {
  id: string;
  title: string;
  emoji: string;
  color: string;
  steps: Array<{ key: string; title: string; desc: string }>;
}

const KAFFARAH_DATA: KaffarahCategory[] = [
  {
    id: "general",
    title: "كفارة عامة",
    emoji: "🌿",
    color: "#10b981",
    steps: [
      { key: "general_tawbah",     title: "التوبة الصادقة",              desc: "ندم حقيقي على الذنب والعزم على عدم العودة إليه" },
      { key: "general_istighfar",  title: "الاستغفار ١٠٠ مرة",          desc: "أستغفر الله العظيم الذي لا إله إلا هو الحي القيوم" },
      { key: "general_salah",      title: "صلاة ركعتَين",               desc: "صلّ ركعتين خالصتَين لله توبةً ورجوعاً" },
      { key: "general_sadaqa",     title: "تصدّق ولو بشيء يسير",        desc: "الصدقة تطفئ الخطيئة كما يطفئ الماء النار" },
      { key: "general_quran",      title: "تلاوة آيات التوبة",           desc: "اقرأ سورة التوبة أو آيات الاستغفار في القرآن" },
    ],
  },
  {
    id: "fasting",
    title: "كفارة اليمين",
    emoji: "📅",
    color: "#F59E0B",
    steps: [
      { key: "yameen_feed10",      title: "إطعام عشرة مساكين",          desc: "وجبة كاملة لكل واحد أو ما يُقدَّر بإطعامه" },
      { key: "yameen_clothe10",    title: "أو كسوة عشرة مساكين",        desc: "بديل عن الإطعام — ثوب يكفي الصلاة لكل منهم" },
      { key: "yameen_slave",       title: "أو تحرير رقبة",              desc: "انتفى في عصرنا — ينتقل لما بعده" },
      { key: "yameen_fast3",       title: "صيام ثلاثة أيام",            desc: "إن عجز عن الإطعام أو الكسوة — يصوم ثلاثة أيام" },
    ],
  },
  {
    id: "prayer",
    title: "قضاء الصلوات الفائتة",
    emoji: "🕌",
    color: "#60A5FA",
    steps: [
      { key: "salah_count",        title: "أحصِ الصلوات الفائتة",       desc: "قدّر بالضبط أو التقريب كم يوم فاتتك الصلاة" },
      { key: "salah_tawbah",       title: "تب إلى الله صادقاً",         desc: "واعزم على المداومة على الصلاة في وقتها" },
      { key: "salah_start",        title: "ابدأ القضاء الآن",           desc: "صلِّ ما فاتك تدريجياً مع مواظبتك على الحاضر" },
      { key: "salah_fasting",      title: "أضف صوم قضاء",              desc: "بعض العلماء يستحبون التطوع بصيام مع القضاء" },
    ],
  },
  {
    id: "backbiting",
    title: "كفارة الغيبة",
    emoji: "👅",
    color: "#F87171",
    steps: [
      { key: "gheeba_stop",        title: "أوقف الغيبة فوراً",          desc: "اترك المجلس أو غيّر الحديث إن استطعت" },
      { key: "gheeba_apology",     title: "اعتذر للمغتاب (إن أمكن)",   desc: "إن كان يعلم وإن كان الاعتذار لن يزيد الضرر" },
      { key: "gheeba_dua",         title: "ادعُ له بظهر الغيب",        desc: "قل: اللهم اغفر لي وله وأصلح بيننا" },
      { key: "gheeba_hasanat",     title: "أهدِ له حسنات",             desc: "قل: اللهم اجعل ما كسبتُه منه في ميزانه" },
      { key: "gheeba_istighfar",   title: "الاستغفار عنه وعنك",         desc: "أستغفر الله لي وله ١٠٠ مرة" },
    ],
  },
];

function StepRow({ step, isCompleted, onToggle, isDark, c, isRTL, isLoading }: {
  step: { key: string; title: string; desc: string };
  isCompleted: boolean; onToggle: () => void;
  isDark: boolean; c: ReturnType<typeof useColors>; isRTL: boolean; isLoading: boolean;
}) {
  return (
    <Pressable
      onPress={onToggle}
      disabled={isLoading}
      style={{
        flexDirection: isRTL ? "row-reverse" : "row", alignItems: "flex-start", gap: 12,
        padding: 14, borderRadius: 14, marginBottom: 8,
        backgroundColor: isCompleted
          ? (isDark ? "rgba(16,185,129,0.07)" : "rgba(16,185,129,0.05)")
          : (isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)"),
        borderWidth: 1, borderColor: isCompleted ? "rgba(16,185,129,0.25)" : (isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)"),
        opacity: isLoading ? 0.6 : 1,
      }}
    >
      <View style={{ marginTop: 2 }}>
        {isLoading
          ? <ActivityIndicator size="small" color={c.emerald} />
          : isCompleted
            ? <CheckCircle size={22} color={c.emerald} />
            : <Circle size={22} color={isDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.2)"} />
        }
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{
          fontSize: 13, fontWeight: "700", color: isCompleted ? c.emerald : c.text,
          fontFamily: "IBMPlexSansArabic_700Bold", textAlign: isRTL ? "right" : "left",
          textDecorationLine: isCompleted ? "line-through" : "none",
        }}>
          {step.title}
        </Text>
        <Text style={{ fontSize: 11, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular", textAlign: isRTL ? "right" : "left", marginTop: 3, lineHeight: 17 }}>
          {step.desc}
        </Text>
      </View>
    </Pressable>
  );
}

function CategorySection({ cat, completedKeys, loadingKeys, onToggle, isDark, c, isRTL }: {
  cat: KaffarahCategory; completedKeys: Set<string>; loadingKeys: Set<string>;
  onToggle: (key: string) => void; isDark: boolean; c: ReturnType<typeof useColors>; isRTL: boolean;
}) {
  const [expanded, setExpanded] = useState(true);
  const done = cat.steps.filter(s => completedKeys.has(s.key)).length;
  const total = cat.steps.length;
  const pct = total > 0 ? (done / total) * 100 : 0;

  return (
    <View style={{ marginBottom: 16, borderRadius: 20, overflow: "hidden", backgroundColor: isDark ? "rgba(14,14,14,0.92)" : "#fff", borderWidth: 1, borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)" }}>
      <View style={{ height: 3, backgroundColor: cat.color, opacity: 0.8 }} />
      <Pressable
        onPress={() => { setExpanded(e => !e); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
        style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", padding: 16, gap: 12 }}
      >
        <Text style={{ fontSize: 24 }}>{cat.emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: "800", color: c.text, fontFamily: "IBMPlexSansArabic_700Bold", textAlign: isRTL ? "right" : "left" }}>{cat.title}</Text>
          <View style={{ marginTop: 6 }}>
            <View style={{ height: 4, borderRadius: 4, backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)", overflow: "hidden" }}>
              <View style={{ height: "100%", borderRadius: 4, backgroundColor: cat.color, width: `${pct}%` }} />
            </View>
            <Text style={{ fontSize: 10, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular", textAlign: isRTL ? "right" : "left", marginTop: 4 }}>{done} / {total} خطوات</Text>
          </View>
        </View>
        {expanded ? <ChevronUp size={18} color={c.textMuted} /> : <ChevronDown size={18} color={c.textMuted} />}
      </Pressable>
      {expanded && (
        <Animated.View entering={FadeIn.duration(200)} style={{ paddingHorizontal: 14, paddingBottom: 14 }}>
          <View style={{ height: 1, backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", marginBottom: 12 }} />
          {cat.steps.map(step => (
            <StepRow key={step.key} step={step} isCompleted={completedKeys.has(step.key)} isLoading={loadingKeys.has(step.key)} onToggle={() => onToggle(step.key)} isDark={isDark} c={c} isRTL={isRTL} />
          ))}
        </Animated.View>
      )}
    </View>
  );
}

export default function KaffarahScreen() {
  const c = useColors();
  const { language } = useSettings();
  const isRTL = language === "ar";
  const isDark = c.isDark;

  const [completedKeys, setCompletedKeys] = useState<Set<string>>(new Set());
  const [loadingKeys, setLoadingKeys] = useState<Set<string>>(new Set());
  const [initialLoading, setInitialLoading] = useState(true);

  const fetchKaffarah = useCallback(async () => {
    setInitialLoading(true);
    try {
      const sid = getSessionId();
      const res = await fetch(apiUrl(`/kaffarah?sessionId=${encodeURIComponent(sid)}`));
      if (res.ok) {
        const data = await res.json() as KaffarahStep[];
        const done = new Set(data.filter(s => s.completed).map(s => s.stepKey));
        setCompletedKeys(done);
      }
    } catch (e) { console.error("Kaffarah fetch error:", e); }
    finally { setInitialLoading(false); }
  }, []);

  useEffect(() => { fetchKaffarah(); }, [fetchKaffarah]);

  const toggleStep = async (key: string) => {
    const newCompleted = !completedKeys.has(key);
    Haptics.impactAsync(newCompleted ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light);
    setCompletedKeys(prev => { const s = new Set(prev); newCompleted ? s.add(key) : s.delete(key); return s; });
    setLoadingKeys(prev => new Set(prev).add(key));
    try {
      const sid = getSessionId();
      const res = await fetch(apiUrl("/kaffarah/complete"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sid, stepKey: key, completed: newCompleted }),
      });
      if (!res.ok) {
        setCompletedKeys(prev => { const s = new Set(prev); newCompleted ? s.delete(key) : s.add(key); return s; });
      }
    } catch {
      setCompletedKeys(prev => { const s = new Set(prev); newCompleted ? s.delete(key) : s.add(key); return s; });
    } finally {
      setLoadingKeys(prev => { const s = new Set(prev); s.delete(key); return s; });
    }
  };

  const allSteps = KAFFARAH_DATA.flatMap(c => c.steps);
  const totalCompleted = allSteps.filter(s => completedKeys.has(s.key)).length;
  const totalAll = allSteps.length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={["top"]}>
      <PageHeader
        titleAr="الكفارات الشرعية"
        subtitleAr={initialLoading ? "جاري التحميل..." : `${totalCompleted} / ${totalAll} خطوة`}
        rightAction={
          <Pressable onPress={fetchKaffarah} style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)", alignItems: "center", justifyContent: "center" }}>
            <RefreshCw size={16} color={c.textSecondary} />
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* Alert card */}
        <Animated.View entering={FadeInDown.delay(0).springify()} style={{ flexDirection: isRTL ? "row-reverse" : "row", gap: 10, padding: 14, borderRadius: 16, backgroundColor: "rgba(245,158,11,0.08)", borderWidth: 1, borderColor: "rgba(245,158,11,0.2)", marginBottom: 16, alignItems: "flex-start" }}>
          <AlertCircle size={18} color="#F59E0B" style={{ marginTop: 2 }} />
          <Text style={{ flex: 1, fontSize: 12, color: "#F59E0B", fontFamily: "IBMPlexSansArabic_400Regular", lineHeight: 20, textAlign: isRTL ? "right" : "left" }}>
            الكفارات وسيلة لجبر الذنوب — إلا أن التوبة الصادقة شرط أساسي لقبولها، ولا يُغني الواحد عن الآخر.
          </Text>
        </Animated.View>

        {initialLoading ? (
          <View style={{ alignItems: "center", paddingVertical: 60 }}>
            <ActivityIndicator size="large" color={c.primary} />
            <Text style={{ fontSize: 13, color: c.textSecondary, fontFamily: "IBMPlexSansArabic_400Regular", marginTop: 12 }}>جاري تحميل الكفارات...</Text>
          </View>
        ) : (
          KAFFARAH_DATA.map((cat, i) => (
            <Animated.View key={cat.id} entering={FadeInDown.delay(i * 60).springify()}>
              <CategorySection cat={cat} completedKeys={completedKeys} loadingKeys={loadingKeys} onToggle={toggleStep} isDark={isDark} c={c} isRTL={isRTL} />
            </Animated.View>
          ))
        )}

        {totalCompleted === totalAll && totalAll > 0 && (
          <Animated.View entering={FadeInDown.delay(200).springify()} style={{ padding: 20, borderRadius: 20, alignItems: "center", marginTop: 8, backgroundColor: "rgba(16,185,129,0.08)", borderWidth: 1, borderColor: "rgba(16,185,129,0.22)" }}>
            <Text style={{ fontSize: 36, marginBottom: 8 }}>🎉</Text>
            <Text style={{ fontSize: 16, fontWeight: "800", color: c.primary, fontFamily: "IBMPlexSansArabic_700Bold", textAlign: "center" }}>
              أتممت جميع الكفارات — بارك الله فيك
            </Text>
            <Text style={{ fontSize: 13, color: c.textSecondary, fontFamily: "IBMPlexSansArabic_400Regular", textAlign: "center", marginTop: 6, lineHeight: 20 }}>
              «وَمَن تَابَ وَعَمِلَ صَالِحًا فَإِنَّهُ يَتُوبُ إِلَى اللَّهِ مَتَابًا»
            </Text>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
