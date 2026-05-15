import { useColorScheme } from "react-native";
import { useContext } from "react";
import colors from "../constants/colors";
import { useSettings } from "@/providers/SettingsProvider";

export function useColors() {
  const { resolvedTheme } = useSettings();
  const palette = resolvedTheme === "dark" ? colors.dark : colors.light;
  return {
    ...palette,
    isDark: resolvedTheme === "dark",
    radius: colors.radius,
    spacing: colors.spacing,
  };
}
