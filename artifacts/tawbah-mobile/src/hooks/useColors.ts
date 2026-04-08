import colors from "../../constants/colors";
import { useSettings } from "@/providers/SettingsProvider";

export function useColors() {
  const { resolvedTheme } = useSettings();
  const isDark = resolvedTheme === "dark";
  const palette = isDark ? colors.dark : colors.light;
  return {
    ...palette,
    isDark,
    radius: colors.radius,
    spacing: colors.spacing,
  };
}
