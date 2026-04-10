import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, Switch, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useSettings } from "@/providers/SettingsProvider";
import { Bell, Moon, Sun, Sunrise, Star, Clock, ChevronRight } from "lucide-react-native";

const STORAGE_KEY = "notification_settings";

interface NotifSettings {
  prayerFajr: boolean;
  prayerDhuhr: boolean;
  prayerAsr: boolean;
  prayerMaghrib: boolean;
  prayerIsha: boolean;
  morningAdhkar: boolean;
  eveningAdhkar: boolean;
  duaPeak: boolean;
  dailyReminder: boolean;
  weeklyReport: boolean;
  prayerAdvance: number;
}

const DEFAULT: NotifSettings = {
  prayerFajr: true,
  prayerDhuhr: true,
  prayerAsr: true,
  prayerMaghrib: true,
  prayerIsha: true,
  morningAdhkar: true,
  eveningAdhkar: true,
  duaPeak: true,
  dailyReminder: false,
  weeklyReport: false,
  prayerAdvance: 5,
};

function loadSettings(): NotifSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT;
    return { ...DEFAULT, ...JSON.parse(raw) };
  } catch {
    return DEFAULT;
  }
}

function saveSettings(s: NotifSettings) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
}

function ToggleRow({
  icon, label, sub, value, onChange, isDark, accentColor,
}: {
  icon: React.ReactNode; label: string; sub?: string;
  value: boolean; onChange: (v: boolean) => void;
  isDark: boolean; accentColor: string;
}) {
  const textColor = isDark ? "#f9fafb" : "#111827";
  const subColor = isDark ? "#9ca3af" : "#6b7280";
  return (
    <View style={{
      flexDirection: "row-reverse",
      alignItems: "center",
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
    }}>
      <View style={{
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
        alignItems: "center", justifyContent: "center",
        marginLeft: 12,
      }}>
        {icon}
      </View>
      <View style={{ flex: 1, alignItems: "flex-end" }}>
        <Text style={{ fontSize: 14, fontWeight: "600", color: textColor }}>{label}</Text>
        {sub && <Text style={{ fontSize: 11, color: subColor, marginTop: 2 }}>{sub}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: isDark ? "#374151" : "#d1d5db", true: accentColor }}
        thumbColor="#fff"
        style={{ marginRight: 4 }}
      />
    </View>
  );
}

function SectionHeader({ title, isDark }: { title: string; isDark: boolean }) {
  return (
    <Text style={{
      fontSize: 12, fontWeight: "700", color: isDark ? "#6b7280" : "#9ca3af",
      textAlign: "right", paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8,
      textTransform: "uppercase", letterSpacing: 0.5,
    }}>
      {title}
    </Text>
  );
}

export default function NotificationsScreen() {
  const { isDark } = useColors();
  const { language } = useSettings();
  const [settings, setSettings] = useState<NotifSettings>(DEFAULT);
  const [permGranted, setPermGranted] = useState<boolean | null>(null);

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  const update = (key: keyof NotifSettings, value: boolean | number) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    saveSettings(next);
  };

  const bg = isDark ? "#0a0a0f" : "#f8fafc";
  const cardBg = isDark ? "rgba(255,255,255,0.05)" : "#fff";
  const borderColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const textColor = isDark ? "#f9fafb" : "#111827";
  const subColor = isDark ? "#9ca3af" : "#6b7280";
  const accentColor = "#10b981";

  const ADVANCE_OPTIONS = [0, 5, 10, 15, 20];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={{ padding: 20, paddingBottom: 0 }}>
          <View style={{ flexDirection: "row-reverse", alignItems: "center", gap: 12, marginBottom: 6 }}>
            <View style={{
              width: 44, height: 44, borderRadius: 22,
              backgroundColor: "rgba(16,185,129,0.15)",
              alignItems: "center", justifyContent: "center",
            }}>
              <Bell size={22} color={accentColor} />
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ fontSize: 22, fontWeight: "800", color: textColor }}>الإشعارات</Text>
              <Text style={{ fontSize: 13, color: subColor }}>تخصيص تنبيهات العبادة</Text>
            </View>
          </View>
        </View>

        <SectionHeader title="إشعارات الصلوات" isDark={isDark} />
        <View style={{ marginHorizontal: 16, backgroundColor: cardBg, borderRadius: 16, borderWidth: 1, borderColor, paddingHorizontal: 16 }}>
          {[
            { key: "prayerFajr" as const, label: "الفجر", icon: <Sunrise size={16} color="#f59e0b" /> },
            { key: "prayerDhuhr" as const, label: "الظهر", icon: <Sun size={16} color="#f59e0b" /> },
            { key: "prayerAsr" as const, label: "العصر", icon: <Sun size={16} color="#f97316" /> },
            { key: "prayerMaghrib" as const, label: "المغرب", icon: <Moon size={16} color="#8b5cf6" /> },
            { key: "prayerIsha" as const, label: "العشاء", icon: <Moon size={16} color="#3b82f6" /> },
          ].map(({ key, label, icon }) => (
            <ToggleRow
              key={key}
              icon={icon}
              label={label}
              sub="تنبيه عند دخول وقت الصلاة"
              value={settings[key]}
              onChange={(v) => update(key, v)}
              isDark={isDark}
              accentColor={accentColor}
            />
          ))}
        </View>

        <SectionHeader title="تنبيه قبل الصلاة بـ..." isDark={isDark} />
        <View style={{ marginHorizontal: 16, backgroundColor: cardBg, borderRadius: 16, borderWidth: 1, borderColor, padding: 16 }}>
          <View style={{ flexDirection: "row-reverse", gap: 8, flexWrap: "wrap" }}>
            {ADVANCE_OPTIONS.map((min) => (
              <Pressable
                key={min}
                onPress={() => update("prayerAdvance", min)}
                style={{
                  paddingHorizontal: 16, paddingVertical: 8,
                  borderRadius: 10,
                  backgroundColor: settings.prayerAdvance === min
                    ? accentColor
                    : (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"),
                  borderWidth: 1,
                  borderColor: settings.prayerAdvance === min ? accentColor : borderColor,
                }}
              >
                <Text style={{
                  fontSize: 13, fontWeight: "700",
                  color: settings.prayerAdvance === min ? "#fff" : subColor,
                }}>
                  {min === 0 ? "عند الأذان" : `${min} دقيقة`}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <SectionHeader title="الأذكار والتنبيهات الروحية" isDark={isDark} />
        <View style={{ marginHorizontal: 16, backgroundColor: cardBg, borderRadius: 16, borderWidth: 1, borderColor, paddingHorizontal: 16 }}>
          <ToggleRow
            icon={<Sunrise size={16} color="#f59e0b" />}
            label="أذكار الصباح"
            sub="تنبيه بعد الفجر للأذكار"
            value={settings.morningAdhkar}
            onChange={(v) => update("morningAdhkar", v)}
            isDark={isDark}
            accentColor={accentColor}
          />
          <ToggleRow
            icon={<Moon size={16} color="#8b5cf6" />}
            label="أذكار المساء"
            sub="تنبيه قبل المغرب بـ 30 دقيقة"
            value={settings.eveningAdhkar}
            onChange={(v) => update("eveningAdhkar", v)}
            isDark={isDark}
            accentColor={accentColor}
          />
          <ToggleRow
            icon={<Star size={16} color="#f59e0b" />}
            label="لحظة إجابة الدعاء"
            sub="عند دخول أوقات الإجابة الكبرى"
            value={settings.duaPeak}
            onChange={(v) => update("duaPeak", v)}
            isDark={isDark}
            accentColor={accentColor}
          />
          <ToggleRow
            icon={<Bell size={16} color="#10b981" />}
            label="التذكير اليومي"
            sub="رسالة إيمانية يومية"
            value={settings.dailyReminder}
            onChange={(v) => update("dailyReminder", v)}
            isDark={isDark}
            accentColor={accentColor}
          />
          <ToggleRow
            icon={<Clock size={16} color="#3b82f6" />}
            label="التقرير الأسبوعي"
            sub="ملخص رحلتك كل جمعة"
            value={settings.weeklyReport}
            onChange={(v) => update("weeklyReport", v)}
            isDark={isDark}
            accentColor={accentColor}
          />
        </View>

        <View style={{
          margin: 16, marginTop: 20, padding: 16,
          backgroundColor: isDark ? "rgba(16,185,129,0.08)" : "rgba(16,185,129,0.06)",
          borderRadius: 14, borderWidth: 1, borderColor: "rgba(16,185,129,0.2)",
        }}>
          <View style={{ flexDirection: "row-reverse", alignItems: "flex-start", gap: 10 }}>
            <Bell size={16} color={accentColor} style={{ marginTop: 2 }} />
            <Text style={{ fontSize: 12, color: subColor, textAlign: "right", lineHeight: 20, flex: 1 }}>
              الإشعارات تعمل حتى في وضع الصمت. تأكد من منح الإذن للتطبيق من إعدادات هاتفك.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
