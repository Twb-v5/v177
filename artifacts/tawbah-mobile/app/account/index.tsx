import { useState, useEffect, useCallback } from "react";
import {
  View, Text, ScrollView, Pressable, Switch, TextInput, Alert, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useColors } from "@/hooks/useColors";
import { useSettings } from "@/providers/SettingsProvider";
import { useAuth } from "@/providers/AuthProvider";
import { PageHeader } from "@/components/shared/PageHeader";
import { getSessionId } from "@/lib/session";
import { apiUrl } from "@/lib/api";
import {
  User, Moon, Sun, Globe, Palette, Heart, Shield, Star,
  BookOpen, CheckSquare, TrendingUp, ChevronRight, LogIn, LogOut,
  Mail, AtSign,
} from "lucide-react-native";

const ACCENT_OPTIONS = [
  { id: "green",  label: "الغابة",  color: "#10b981" },
  { id: "blue",   label: "المحيط", color: "#3b82f6" },
  { id: "purple", label: "الشفق",  color: "#8b5cf6" },
  { id: "gold",   label: "الذهب",  color: "#f59e0b" },
];

const THEME_OPTIONS = [
  { id: "light"  as const, label: "فاتح",   icon: Sun  },
  { id: "dark"   as const, label: "داكن",   icon: Moon },
  { id: "system" as const, label: "تلقائي", icon: Globe },
];

function StatCard({ icon, value, label, color, isDark }: {
  icon: React.ReactNode; value: string; label: string; color: string; isDark: boolean;
}) {
  return (
    <View style={{
      flex: 1, backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#fff",
      borderRadius: 14, padding: 14, alignItems: "center",
      borderWidth: 1, borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)",
    }}>
      <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: `${color}20`, alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
        {icon}
      </View>
      <Text style={{ fontSize: 22, fontWeight: "900", color, marginBottom: 2 }}>{value}</Text>
      <Text style={{ fontSize: 11, color: isDark ? "#9ca3af" : "#6b7280", textAlign: "center", fontFamily: "IBMPlexSansArabic_400Regular" }}>{label}</Text>
    </View>
  );
}

function SectionLabel({ title, isDark }: { title: string; isDark: boolean }) {
  return (
    <Text style={{
      fontSize: 11, fontWeight: "700", color: isDark ? "#6b7280" : "#9ca3af",
      textAlign: "right", paddingHorizontal: 20, paddingTop: 20, paddingBottom: 6,
      textTransform: "uppercase", letterSpacing: 0.8, fontFamily: "IBMPlexSansArabic_700Bold",
    }}>
      {title}
    </Text>
  );
}

function SettingsRow({ icon, label, sub, rightEl, onPress, isDark }: {
  icon: React.ReactNode; label: string; sub?: string;
  rightEl?: React.ReactNode; onPress?: () => void; isDark: boolean;
}) {
  const textColor = isDark ? "#f9fafb" : "#111827";
  const subColor  = isDark ? "#9ca3af" : "#6b7280";
  return (
    <Pressable onPress={onPress} style={{
      flexDirection: "row-reverse", alignItems: "center",
      paddingVertical: 14, paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
    }}>
      <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)", alignItems: "center", justifyContent: "center", marginLeft: 12 }}>
        {icon}
      </View>
      <View style={{ flex: 1, alignItems: "flex-end" }}>
        <Text style={{ fontSize: 14, fontWeight: "600", color: textColor, fontFamily: "IBMPlexSansArabic_700Bold" }}>{label}</Text>
        {sub && <Text style={{ fontSize: 11, color: subColor, marginTop: 1, fontFamily: "IBMPlexSansArabic_400Regular" }}>{sub}</Text>}
      </View>
      {rightEl || (onPress && <ChevronRight size={16} color={subColor} style={{ transform: [{ rotate: "180deg" }] }} />)}
    </Pressable>
  );
}

interface Progress {
  streakDays: number;
  day40Progress: number;
  covenantDate: string | null;
}

export default function AccountScreen() {
  const { isDark } = useColors();
  const { theme, accentColor, language, setTheme, setAccentColor, setLanguage } = useSettings();
  const { user, signOut, loading: authLoading } = useAuth();
  const router = useRouter();

  const [name,        setName]        = useState("");
  const [editingName, setEditingName] = useState(false);
  const [progress,    setProgress]    = useState<Progress | null>(null);
  const [quranDays,   setQuranDays]   = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const [sessionId, storedName, quranRaw] = await Promise.all([
        getSessionId(),
        AsyncStorage.getItem("user_display_name"),
        AsyncStorage.getItem("quran_streak_days"),
      ]);

      if (storedName) setName(storedName);
      if (quranRaw) setQuranDays(parseInt(quranRaw, 10) || 0);

      const res = await fetch(apiUrl(`/user/progress?sessionId=${sessionId}`));
      if (res.ok) {
        const data = await res.json() as Progress;
        setProgress(data);
      }
    } catch {
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  useEffect(() => {
    if (user?.username) setName(user.username);
  }, [user]);

  const saveName = async (val: string) => {
    setName(val);
    await AsyncStorage.setItem("user_display_name", val);
    setEditingName(false);
  };

  const handleSignOut = () => {
    Alert.alert("تسجيل الخروج", "هل تريد تسجيل الخروج من حسابك؟", [
      { text: "إلغاء", style: "cancel" },
      { text: "خروج", style: "destructive", onPress: async () => { await signOut(); } },
    ]);
  };

  const dayNum = progress?.covenantDate
    ? Math.max(1, Math.floor((Date.now() - new Date(progress.covenantDate).getTime()) / 86400000) + 1)
    : (progress?.day40Progress ?? 0) + 1;

  const textColor          = isDark ? "#f9fafb" : "#111827";
  const subColor           = isDark ? "#9ca3af" : "#6b7280";
  const bg                 = isDark ? "#0a0a0f"  : "#f8fafc";
  const cardBg             = isDark ? "rgba(255,255,255,0.05)" : "#fff";
  const borderColor        = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";
  const currentAccentColor = ACCENT_OPTIONS.find((a) => a.id === accentColor)?.color || "#10b981";

  const displayName = user?.username || name || "";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bg }} edges={["top"]}>
      <PageHeader titleAr="حسابي" subtitleAr="الإعدادات والتفضيلات" />

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Profile Card */}
        <View style={{ padding: 20, paddingBottom: 0 }}>
          <View style={{ alignItems: "center", marginBottom: 20 }}>
            <View style={{
              width: 80, height: 80, borderRadius: 40,
              backgroundColor: `${currentAccentColor}25`,
              borderWidth: 3, borderColor: currentAccentColor,
              alignItems: "center", justifyContent: "center", marginBottom: 12,
            }}>
              <User size={36} color={currentAccentColor} />
            </View>

            {user ? (
              <>
                <Text style={{ fontSize: 18, fontWeight: "800", color: textColor, marginBottom: 2, fontFamily: "IBMPlexSansArabic_700Bold" }}>
                  {displayName}
                </Text>
                <Text style={{ fontSize: 12, color: subColor, fontFamily: "IBMPlexSansArabic_400Regular", marginBottom: 2 }}>
                  {user.email}
                </Text>
                <Text style={{ fontSize: 12, color: currentAccentColor, fontFamily: "IBMPlexSansArabic_400Regular" }}>
                  اليوم {dayNum} من رحلة التوبة
                </Text>
              </>
            ) : editingName ? (
              <View style={{ flexDirection: "row-reverse", gap: 8, marginBottom: 6 }}>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="اسمك"
                  placeholderTextColor={subColor}
                  style={{
                    borderWidth: 1, borderColor: currentAccentColor, borderRadius: 10,
                    paddingHorizontal: 12, paddingVertical: 8,
                    color: textColor, textAlign: "right", fontSize: 16, minWidth: 160,
                    backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.04)",
                    fontFamily: "IBMPlexSansArabic_400Regular",
                  }}
                  autoFocus
                />
                <Pressable onPress={() => saveName(name)}
                  style={{ paddingHorizontal: 16, paddingVertical: 8, backgroundColor: currentAccentColor, borderRadius: 10 }}>
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14, fontFamily: "IBMPlexSansArabic_700Bold" }}>حفظ</Text>
                </Pressable>
              </View>
            ) : (
              <Pressable onPress={() => setEditingName(true)}>
                <Text style={{ fontSize: 18, fontWeight: "800", color: textColor, marginBottom: 2, fontFamily: "IBMPlexSansArabic_700Bold" }}>
                  {name || "اضغط لإضافة اسمك"}
                </Text>
              </Pressable>
            )}

            {!user && (
              <Text style={{ fontSize: 12, color: subColor, fontFamily: "IBMPlexSansArabic_400Regular" }}>اليوم {dayNum} من رحلة التوبة</Text>
            )}
          </View>

          {/* Auth Button */}
          {!authLoading && (
            <Pressable
              onPress={() => user ? handleSignOut() : router.push("/login")}
              style={{
                flexDirection: "row-reverse", alignItems: "center", justifyContent: "center",
                gap: 8, paddingVertical: 12, borderRadius: 14, marginBottom: 20,
                backgroundColor: user ? `${isDark ? "#ef4444" : "#fee2e2"}` : `${currentAccentColor}20`,
                borderWidth: 1, borderColor: user ? "#ef444440" : `${currentAccentColor}40`,
              }}
            >
              {user
                ? <LogOut size={18} color="#ef4444" />
                : <LogIn size={18} color={currentAccentColor} />}
              <Text style={{
                fontSize: 15, fontWeight: "700",
                color: user ? "#ef4444" : currentAccentColor,
                fontFamily: "IBMPlexSansArabic_700Bold",
              }}>
                {user ? "تسجيل الخروج" : "تسجيل الدخول / إنشاء حساب"}
              </Text>
            </Pressable>
          )}

          {/* Stats */}
          {statsLoading ? (
            <ActivityIndicator color={currentAccentColor} style={{ marginBottom: 24 }} />
          ) : (
            <View style={{ flexDirection: "row-reverse", gap: 10, marginBottom: 24 }}>
              <StatCard icon={<Heart size={18} color="#ef4444" />}       value={String(dayNum)}                    label="يوم التوبة"   color="#ef4444" isDark={isDark} />
              <StatCard icon={<BookOpen size={18} color="#10b981" />}    value={String(quranDays)}                 label="أيام القرآن"  color="#10b981" isDark={isDark} />
              <StatCard icon={<CheckSquare size={18} color="#3b82f6" />} value={String(progress?.streakDays ?? 0)} label="أيام التتابع" color="#3b82f6" isDark={isDark} />
            </View>
          )}
        </View>

        {/* Account Info (when logged in) */}
        {user && (
          <>
            <SectionLabel title="معلومات الحساب" isDark={isDark} />
            <View style={{ marginHorizontal: 16, backgroundColor: cardBg, borderRadius: 16, borderWidth: 1, borderColor, paddingVertical: 4 }}>
              <SettingsRow
                icon={<AtSign size={16} color={currentAccentColor} />}
                label={user.username || "—"}
                sub="اسم المستخدم"
                isDark={isDark}
              />
              <SettingsRow
                icon={<Mail size={16} color={currentAccentColor} />}
                label={user.email || "—"}
                sub="البريد الإلكتروني"
                isDark={isDark}
              />
            </View>
          </>
        )}

        {/* Theme */}
        <SectionLabel title="الثيم" isDark={isDark} />
        <View style={{ marginHorizontal: 16, backgroundColor: cardBg, borderRadius: 16, borderWidth: 1, borderColor, paddingVertical: 4 }}>
          {THEME_OPTIONS.map(({ id, label, icon: Icon }) => (
            <SettingsRow key={id} icon={<Icon size={16} color={theme === id ? currentAccentColor : subColor} />}
              label={label} isDark={isDark} onPress={() => setTheme(id)}
              rightEl={
                theme === id
                  ? <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: currentAccentColor, alignItems: "center", justifyContent: "center" }}><Star size={11} color="#fff" /></View>
                  : <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)" }} />
              }
            />
          ))}
        </View>

        {/* Accent Color */}
        <SectionLabel title="لون التطبيق" isDark={isDark} />
        <View style={{ marginHorizontal: 16, backgroundColor: cardBg, borderRadius: 16, borderWidth: 1, borderColor, padding: 16 }}>
          <View style={{ flexDirection: "row-reverse", gap: 10 }}>
            {ACCENT_OPTIONS.map((opt) => (
              <Pressable key={opt.id} onPress={() => setAccentColor(opt.id as any)} style={{ flex: 1, alignItems: "center", gap: 6 }}>
                <View style={{
                  width: 44, height: 44, borderRadius: 22, backgroundColor: opt.color,
                  borderWidth: accentColor === opt.id ? 3 : 0,
                  borderColor: isDark ? "#fff" : "#111827",
                  alignItems: "center", justifyContent: "center",
                }}>
                  {accentColor === opt.id && <Star size={16} color="#fff" />}
                </View>
                <Text style={{ fontSize: 10, color: accentColor === opt.id ? opt.color : subColor, fontWeight: "700", fontFamily: "IBMPlexSansArabic_700Bold" }}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Language */}
        <SectionLabel title="اللغة" isDark={isDark} />
        <View style={{ marginHorizontal: 16, backgroundColor: cardBg, borderRadius: 16, borderWidth: 1, borderColor, paddingVertical: 4 }}>
          {[
            { id: "ar" as const, label: "العربية" },
            { id: "en" as const, label: "English"  },
          ].map(({ id, label }) => (
            <SettingsRow key={id} icon={<Globe size={16} color={language === id ? currentAccentColor : subColor} />}
              label={label} isDark={isDark} onPress={() => setLanguage(id)}
              rightEl={
                language === id
                  ? <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: currentAccentColor, alignItems: "center", justifyContent: "center" }}><Star size={11} color="#fff" /></View>
                  : <View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)" }} />
              }
            />
          ))}
        </View>

        {/* App info */}
        <SectionLabel title="التطبيق" isDark={isDark} />
        <View style={{ marginHorizontal: 16, backgroundColor: cardBg, borderRadius: 16, borderWidth: 1, borderColor, paddingVertical: 4, marginBottom: 20 }}>
          <SettingsRow icon={<Shield size={16} color="#10b981" />} label="سياسة الخصوصية" isDark={isDark} onPress={() => {}} />
          <SettingsRow icon={<Star size={16} color="#f59e0b" />} label="قيّم التطبيق" sub="ساعدنا بتقييمك على المتجر" isDark={isDark} onPress={() => {}} />
          <SettingsRow icon={<TrendingUp size={16} color="#3b82f6" />} label="الإصدار" sub="1.0.0" isDark={isDark} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
