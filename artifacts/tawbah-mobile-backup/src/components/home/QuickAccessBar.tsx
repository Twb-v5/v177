import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useSettings } from "@/providers/SettingsProvider";

import {
  BookOpenText,
  Clock,
  Repeat,
  Sparkles,
  Brain,
  NotebookPen,
} from "lucide-react-native";

const QUICK_ACCESS = [
  { id: "quran", labelAr: "القرآن", labelEn: "Quran", Icon: BookOpenText, href: "/quran" },
  { id: "prayer", labelAr: "الصلاة", labelEn: "Prayer", Icon: Clock, href: "/prayer-times" },
  { id: "dhikr", labelAr: "ذكر", labelEn: "Dhikr", Icon: Repeat, href: "/dhikr" },
  { id: "adhkar", labelAr: "أذكار", labelEn: "Adhkar", Icon: Sparkles, href: "/adhkar" },
  { id: "zakiy", labelAr: "زكي", labelEn: "Zakiy", Icon: Brain, href: "/zakiy" },
  { id: "journal", labelAr: "اليوميات", labelEn: "Journal", Icon: NotebookPen, href: "/journal" },
] as const;

export function QuickAccessBar() {
  const router = useRouter();
  const { resolvedTheme, language } = useSettings();
  const isDark = resolvedTheme === "dark";
  const isRTL = language === "ar";

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ flexDirection: isRTL ? "row-reverse" : "row", gap: 12 }}
    >
      {QUICK_ACCESS.map((item) => {
        const Icon = item.Icon;
        return (
          <Pressable
            key={item.id}
            onPress={() => router.push(item.href as any)}
            className="w-20 items-center rounded-3xl border px-3 py-3"
            style={({ pressed }) => ({
              backgroundColor: isDark ? "#052e25" : "#ffffff",
              borderColor: isDark ? "#0b3b2f" : "#e2e8f0",
              opacity: pressed ? 0.9 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            })}
          >
            <View
              className="h-11 w-11 items-center justify-center rounded-3xl"
              style={{ backgroundColor: isDark ? "#022c22" : "#ecfdf5" }}
            >
              <Icon size={22} color={isDark ? "#fbbf24" : "#064e3b"} />
            </View>
            <Text className="mt-2 text-[12px] font-semibold" style={{ color: isDark ? "#ecfdf5" : "#064e3b", fontFamily: "IBMPlexSansArabic_700Bold", textAlign: "center" }}>
              {item.labelAr}
            </Text>
            {language === "en" && (
              <Text className="text-[10px]" style={{ color: isDark ? "#a7f3d0" : "#64748b", fontFamily: "IBMPlexSansArabic_400Regular", textAlign: "center" }}>
                {item.labelEn}
              </Text>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
