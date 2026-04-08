import { View, Text } from "react-native";
import { ReactNode } from "react";
import { useSettings } from "@/providers/SettingsProvider";

interface SectionHeaderProps {
  title: string;
  icon: ReactNode;
  subtitle?: string;
}

export function SectionHeader({ title, icon, subtitle }: SectionHeaderProps) {
  const { resolvedTheme } = useSettings();
  const isDark = resolvedTheme === "dark";

  return (
    <View className="mb-3">
      <View className="flex-row items-center gap-2" style={{ justifyContent: "flex-end" }}>
        <Text className="text-[16px] font-bold" style={{ color: isDark ? "#ecfdf5" : "#064e3b", textAlign: "right" }}>
          {title}
        </Text>
        <View
          className="h-7 w-7 items-center justify-center rounded-2xl"
          style={{ backgroundColor: isDark ? "#022c22" : "#ecfdf5" }}
        >
          {icon}
        </View>
      </View>
      {subtitle && (
        <Text className="mt-1 text-[11px]" style={{ color: isDark ? "#a7f3d0" : "#64748b", textAlign: "right" }}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}
