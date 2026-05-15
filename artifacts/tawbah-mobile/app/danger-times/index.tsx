import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, Switch, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AlertTriangle, Clock, Plus, Trash2, Shield, Bell } from "lucide-react-native";
import { useColors } from "@/hooks/useColors";
import { useSettings } from "@/providers/SettingsProvider";
import { PageHeader } from "@/components/shared/PageHeader";

interface DangerTime {
  id: string;
  label: string;
  hour: number;
  minute: number;
  enabled: boolean;
  days: number[];
}

const STORAGE_KEY = "danger_times_v1";

const PRESET_TIMES: Array<{ label: string; hour: number; minute: number; emoji: string; reason: string }> = [
  { label: "منتصف الليل",    hour: 0,  minute: 0,  emoji: "🌑", reason: "وقت الوحشة — والشيطان يجول" },
  { label: "بعد منتصف الليل", hour: 2, minute: 0,  emoji: "🌙", reason: "أوقات السهر الضارة" },
  { label: "الفجر — تقاعس",  hour: 4,  minute: 30, emoji: "🌅", reason: "خطر تفويت الفجر والنوم بعده" },
  { label: "منتصف النهار",   hour: 13, minute: 0,  emoji: "☀️", reason: "فترة القيلولة — خطر الوحدة" },
  { label: "ما بعد العصر",   hour: 16, minute: 0,  emoji: "🌤️", reason: "فترة الفراغ الخطرة" },
  { label: "الليل المتأخر",  hour: 22, minute: 0,  emoji: "🌃", reason: "بداية أوقات الخطر الليلية" },
];

const DAY_NAMES = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];

function formatTime(hour: number, minute: number): string {
  const ampm = hour < 12 ? "ص" : "م";
  const h = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const m = minute.toString().padStart(2, "0");
  return `${h}:${m} ${ampm}`;
}

export default function DangerTimesScreen() {
  const c = useColors();
  const { language } = useSettings();
  const isRTL = language === "ar";
  const isDark = c.isDark;

  const [dangerTimes, setDangerTimes] = useState<DangerTime[]>([]);
  const [masterEnabled, setMasterEnabled] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) setDangerTimes(JSON.parse(raw) as DangerTime[]);
    });
  }, []);

  const save = async (times: DangerTime[]) => {
    setDangerTimes(times);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(times));
  };

  const addPreset = async (preset: typeof PRESET_TIMES[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const exists = dangerTimes.find(t => t.hour === preset.hour && t.minute === preset.minute);
    if (exists) {
      Alert.alert("موجود بالفعل", "هذا الوقت مضاف بالفعل في القائمة");
      return;
    }
    const newTime: DangerTime = {
      id: Date.now().toString(),
      label: preset.label,
      hour: preset.hour,
      minute: preset.minute,
      enabled: true,
      days: [0, 1, 2, 3, 4, 5, 6],
    };
    await save([...dangerTimes, newTime]);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const toggleTime = async (id: string) => {
    Haptics.selectionAsync();
    await save(dangerTimes.map(t => t.id === id ? { ...t, enabled: !t.enabled } : t));
  };

  const deleteTime = (id: string) => {
    Alert.alert("حذف وقت الخطر", "هل تريد حذف هذا الوقت؟", [
      { text: "إلغاء", style: "cancel" },
      { text: "حذف", style: "destructive", onPress: async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        await save(dangerTimes.filter(t => t.id !== id));
      }},
    ]);
  };

  const activeCount = dangerTimes.filter(t => t.enabled).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={["top"]}>
      <PageHeader titleAr="أوقات الخطر" subtitleAr={`${activeCount} وقت محدد`} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* Master Toggle */}
        <Animated.View entering={FadeInDown.delay(0).springify()} style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", justifyContent: "space-between", padding: 16, borderRadius: 18, backgroundColor: isDark ? "rgba(239,68,68,0.07)" : "rgba(239,68,68,0.05)", borderWidth: 1, borderColor: "rgba(239,68,68,0.18)", marginBottom: 16 }}>
          <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 10 }}>
            <Shield size={20} color="#ef4444" />
            <View>
              <Text style={{ fontSize: 13, fontWeight: "800", color: c.text, fontFamily: "IBMPlexSansArabic_700Bold" }}>تفعيل التنبيهات</Text>
              <Text style={{ fontSize: 11, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }}>تنبيهات محلية في أوقات الخطر</Text>
            </View>
          </View>
          <Switch value={masterEnabled} onValueChange={(v) => { setMasterEnabled(v); Haptics.selectionAsync(); }} trackColor={{ false: "#767577", true: "rgba(239,68,68,0.6)" }} thumbColor={masterEnabled ? "#ef4444" : "#f4f3f4"} />
        </Animated.View>

        {/* Info */}
        <Animated.View entering={FadeInDown.delay(40).springify()} style={{ flexDirection: isRTL ? "row-reverse" : "row", gap: 10, padding: 13, borderRadius: 14, backgroundColor: "rgba(245,158,11,0.08)", borderWidth: 1, borderColor: "rgba(245,158,11,0.18)", marginBottom: 20, alignItems: "flex-start" }}>
          <AlertTriangle size={16} color="#F59E0B" style={{ marginTop: 2 }} />
          <Text style={{ flex: 1, fontSize: 12, color: "#F59E0B", fontFamily: "IBMPlexSansArabic_400Regular", lineHeight: 19, textAlign: isRTL ? "right" : "left" }}>
            ستصلك تذكيرات في الأوقات التي تحددها لتبقى على يقظة وحذر.
          </Text>
        </Animated.View>

        {/* Presets */}
        <Animated.View entering={FadeInDown.delay(80).springify()}>
          <Text style={{ fontSize: 13, fontWeight: "800", color: c.text, fontFamily: "IBMPlexSansArabic_700Bold", textAlign: isRTL ? "right" : "left", marginBottom: 12 }}>
            أوقات مقترحة
          </Text>
          {PRESET_TIMES.map((preset, i) => (
            <Pressable key={preset.label + i}
              onPress={() => addPreset(preset)}
              style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, marginBottom: 8, backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", borderWidth: 1, borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)" }}
            >
              <Text style={{ fontSize: 22 }}>{preset.emoji}</Text>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", justifyContent: "space-between" }}>
                  <Text style={{ fontSize: 12, color: "#ef4444", fontFamily: "IBMPlexSansArabic_700Bold" }}>{formatTime(preset.hour, preset.minute)}</Text>
                  <Text style={{ fontSize: 13, fontWeight: "700", color: c.text, fontFamily: "IBMPlexSansArabic_700Bold" }}>{preset.label}</Text>
                </View>
                <Text style={{ fontSize: 11, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular", textAlign: isRTL ? "right" : "left", marginTop: 2 }}>{preset.reason}</Text>
              </View>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: "rgba(239,68,68,0.1)", alignItems: "center", justifyContent: "center" }}>
                <Plus size={14} color="#ef4444" />
              </View>
            </Pressable>
          ))}
        </Animated.View>

        {/* Active Times */}
        {dangerTimes.length > 0 && (
          <Animated.View entering={FadeInDown.delay(200).springify()} style={{ marginTop: 24 }}>
            <Text style={{ fontSize: 13, fontWeight: "800", color: c.text, fontFamily: "IBMPlexSansArabic_700Bold", textAlign: isRTL ? "right" : "left", marginBottom: 12 }}>
              أوقاتك المحددة
            </Text>
            {dangerTimes.map(dt => (
              <View key={dt.id} style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, marginBottom: 8, backgroundColor: isDark ? "rgba(239,68,68,0.07)" : "rgba(239,68,68,0.05)", borderWidth: 1, borderColor: dt.enabled ? "rgba(239,68,68,0.25)" : (isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)") }}>
                <Clock size={18} color={dt.enabled ? "#ef4444" : c.textMuted} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: "700", color: dt.enabled ? c.text : c.textSecondary, fontFamily: "IBMPlexSansArabic_700Bold", textAlign: isRTL ? "right" : "left" }}>
                    {dt.label}
                  </Text>
                  <Text style={{ fontSize: 11, color: "#ef4444", fontFamily: "IBMPlexSansArabic_400Regular" }}>{formatTime(dt.hour, dt.minute)}</Text>
                </View>
                <Switch value={dt.enabled} onValueChange={() => toggleTime(dt.id)} trackColor={{ false: "#767577", true: "rgba(239,68,68,0.6)" }} thumbColor={dt.enabled ? "#ef4444" : "#f4f3f4"} />
                <Pressable onPress={() => deleteTime(dt.id)} style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: "rgba(239,68,68,0.1)", alignItems: "center", justifyContent: "center" }}>
                  <Trash2 size={14} color="#ef4444" />
                </Pressable>
              </View>
            ))}
          </Animated.View>
        )}

        {dangerTimes.length === 0 && (
          <View style={{ alignItems: "center", paddingVertical: 32 }}>
            <Bell size={40} color={c.textMuted} />
            <Text style={{ fontSize: 14, fontWeight: "700", color: c.textSecondary, fontFamily: "IBMPlexSansArabic_700Bold", marginTop: 12 }}>
              لم تضف أي وقت بعد
            </Text>
            <Text style={{ fontSize: 12, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular", marginTop: 4, textAlign: "center" }}>
              أضف من الأوقات المقترحة أعلاه
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
