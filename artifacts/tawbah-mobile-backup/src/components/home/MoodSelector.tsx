import { View, Text, Pressable } from "react-native";
import { useSettings } from "@/providers/SettingsProvider";

const MOODS = [
  { id: "good", labelAr: "مطمئن", labelEn: "Calm", toneBg: "#064e3b" },
  { id: "focused", labelAr: "مركز", labelEn: "Focused", toneBg: "#0f766e" },
  { id: "tired", labelAr: "متعب", labelEn: "Tired", toneBg: "#7c2d12" },
  { id: "grateful", labelAr: "شاكر", labelEn: "Grateful", toneBg: "#b45309" },
] as const;

export function MoodSelector() {
  const { resolvedTheme, language } = useSettings();
  const isDark = resolvedTheme === "dark";
  const isRTL = language === "ar";

  return (
    <View
      className="mt-4 rounded-3xl border p-4"
      style={{
        backgroundColor: isDark ? "#052e25" : "#ffffff",
        borderColor: isDark ? "#0b3b2f" : "#e2e8f0",
      }}
    >
      <Text className="text-[15px] font-bold" style={{ color: isDark ? "#ecfdf5" : "#064e3b", textAlign: "right" }}>
        كيف حالك اليوم؟
      </Text>
      <Text className="mt-1 text-[11px]" style={{ color: isDark ? "#a7f3d0" : "#64748b", textAlign: "right" }}>
        اختر شعورك — يساعدك على ثبات الورد
      </Text>

      <View className={isRTL ? "mt-4 flex-row-reverse flex-wrap gap-2" : "mt-4 flex-row flex-wrap gap-2"}>
        {MOODS.map((mood) => (
          <Pressable
            key={mood.id}
            className="rounded-3xl border px-4 py-3"
            style={({ pressed }) => ({
              backgroundColor: isDark ? "#022c22" : "#f8fafc",
              borderColor: isDark ? "#0b3b2f" : "#e2e8f0",
              opacity: pressed ? 0.9 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            })}
          >
            <View className={isRTL ? "flex-row-reverse items-center gap-2" : "flex-row items-center gap-2"}>
              <View className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: mood.toneBg }} />
              <Text className="text-[12px] font-semibold" style={{ color: isDark ? "#ecfdf5" : "#0f172a", fontFamily: "IBMPlexSansArabic_700Bold" }}>
                {mood.labelAr}
              </Text>
              {language === "en" && (
                <Text className="text-[11px]" style={{ color: isDark ? "#a7f3d0" : "#64748b", fontFamily: "IBMPlexSansArabic_400Regular" }}>
                  {mood.labelEn}
                </Text>
              )}
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
