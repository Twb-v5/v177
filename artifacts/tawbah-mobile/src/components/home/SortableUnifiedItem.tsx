import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useSettings } from "@/providers/SettingsProvider";

import {
  BookOpenText,
  Clock,
  Sparkles,
  Bell,
  Repeat,
  Layers,
  Route,
  NotebookPen,
  Users,
  ChevronLeft,
} from "lucide-react-native";

type SectionId = 
  | "journey-card" | "tawbah-card" | "quran-card" | "islamic-programs" 
  | "adhkar" | "prayer-times" | "notifications" | "dhikr" | "rajaa"
  | "journey30" | "journal" | "dhikr-rooms";

interface CardConfig {
  labelAr: string;
  labelEn: string;
  Icon: any;
  iconColor: string;
  iconBg: string;
  href: string;
}

const GRID_META: Record<string, CardConfig> = {
  "quran-card": { labelAr: "القرآن", labelEn: "Quran", Icon: BookOpenText, iconColor: "#fbbf24", iconBg: "#022c22", href: "/quran" },
  "prayer-times": { labelAr: "مواقيت الصلاة", labelEn: "Prayer Times", Icon: Clock, iconColor: "#fbbf24", iconBg: "#022c22", href: "/prayer-times" },
  "adhkar": { labelAr: "الأذكار", labelEn: "Adhkar", Icon: Sparkles, iconColor: "#fbbf24", iconBg: "#022c22", href: "/adhkar" },
  "notifications": { labelAr: "التنبيهات", labelEn: "Notifications", Icon: Bell, iconColor: "#fbbf24", iconBg: "#022c22", href: "/notifications" },
  "dhikr": { labelAr: "الذكر", labelEn: "Dhikr", Icon: Repeat, iconColor: "#fbbf24", iconBg: "#022c22", href: "/dhikr" },
  "rajaa": { labelAr: "الرجاء", labelEn: "Rajaa", Icon: Layers, iconColor: "#fbbf24", iconBg: "#022c22", href: "/rajaa" },
  "islamic-programs": { labelAr: "البرامج", labelEn: "Programs", Icon: Route, iconColor: "#fbbf24", iconBg: "#022c22", href: "/islamic-programs" },
};

const LIST_META: Record<string, CardConfig> = {
  "journey-card": { labelAr: "رحلة", labelEn: "Journey", Icon: Route, iconColor: "#fbbf24", iconBg: "#022c22", href: "/card" },
  "tawbah-card": { labelAr: "توبة", labelEn: "Tawbah", Icon: Layers, iconColor: "#fbbf24", iconBg: "#022c22", href: "/card" },
  "journey30": { labelAr: "رحلة ٣٠", labelEn: "Journey 30", Icon: Route, iconColor: "#fbbf24", iconBg: "#022c22", href: "/journey" },
  "journal": { labelAr: "اليوميات", labelEn: "Journal", Icon: NotebookPen, iconColor: "#fbbf24", iconBg: "#022c22", href: "/journal" },
  "dhikr-rooms": { labelAr: "مجالس الذكر", labelEn: "Dhikr Rooms", Icon: Users, iconColor: "#fbbf24", iconBg: "#022c22", href: "/dhikr-rooms" },
};

function isGridItem(id: string): boolean {
  return id in GRID_META;
}

export function SortableUnifiedItem({ id, editMode }: { id: string; editMode?: boolean }) {
  const router = useRouter();
  const { resolvedTheme, language } = useSettings();
  const isDark = resolvedTheme === "dark";
  const isRTL = language === "ar";

  const meta = isGridItem(id) ? GRID_META[id] : LIST_META[id];
  if (!meta) return null;

  const Icon = meta.Icon;

  const handlePress = () => {
    router.push(meta.href as any);
  };

  if (isGridItem(id)) {
    return (
      <Pressable
        className="items-center justify-center rounded-3xl border px-4 py-4"
        style={({ pressed }) => ({
          width: "100%",
          aspectRatio: 1.35,
          backgroundColor: isDark ? "#052e25" : "#ffffff",
          borderColor: isDark ? "#0b3b2f" : "#e2e8f0",
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        })}
        onPress={handlePress}
      >
        <View className="h-12 w-12 items-center justify-center rounded-3xl" style={{ backgroundColor: meta.iconBg }}>
          <Icon size={22} color={meta.iconColor} />
        </View>
        <Text className="mt-2 text-[13px] font-bold" style={{ color: isDark ? "#ecfdf5" : "#064e3b", textAlign: "center", fontFamily: "IBMPlexSansArabic_700Bold" }}>
          {meta.labelAr}
        </Text>
        {language === "en" && (
          <Text className="mt-0.5 text-[10px]" style={{ color: isDark ? "#a7f3d0" : "#64748b", fontFamily: "IBMPlexSansArabic_400Regular" }}>
            {meta.labelEn}
          </Text>
        )}
      </Pressable>
    );
  }

  return (
    <Pressable
      className={isRTL ? "flex-row-reverse items-center rounded-3xl border px-4 py-4" : "flex-row items-center rounded-3xl border px-4 py-4"}
      style={({ pressed }) => ({
        backgroundColor: isDark ? "#052e25" : "#ffffff",
        borderColor: isDark ? "#0b3b2f" : "#e2e8f0",
        opacity: pressed ? 0.9 : 1,
        transform: [{ scale: pressed ? 0.99 : 1 }],
        gap: 12,
      })}
      onPress={handlePress}
    >
      <View className="h-12 w-12 items-center justify-center rounded-3xl" style={{ backgroundColor: meta.iconBg }}>
        <Icon size={22} color={meta.iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text className="text-[15px] font-bold" style={{ color: isDark ? "#ecfdf5" : "#064e3b", textAlign: isRTL ? "right" : "left", fontFamily: "IBMPlexSansArabic_700Bold" }}>
          {meta.labelAr}
        </Text>
        {language === "en" && (
          <Text className="mt-0.5 text-[11px]" style={{ color: isDark ? "#a7f3d0" : "#64748b", textAlign: isRTL ? "right" : "left", fontFamily: "IBMPlexSansArabic_400Regular" }}>
            {meta.labelEn}
          </Text>
        )}
      </View>
      {isRTL ? <ChevronLeft size={18} color={isDark ? "#fbbf24" : "#064e3b"} style={{ transform: [{ rotate: "180deg" }] }} /> : <ChevronLeft size={18} color={isDark ? "#fbbf24" : "#064e3b"} />}
    </Pressable>
  );
}
