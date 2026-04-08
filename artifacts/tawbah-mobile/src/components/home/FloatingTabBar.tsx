import { View, Text, Pressable, Platform, Dimensions } from "react-native";
import { usePathname, useRouter } from "expo-router";
import { useSettings } from "@/providers/SettingsProvider";
import { useColors } from "@/hooks/useColors";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Home, BookOpenText, Repeat, Brain, LayoutGrid } from "lucide-react-native";

const { width: SW } = Dimensions.get("window");

const TABS = [
  { id: "home", labelAr: "الرئيسية", Icon: Home, href: "/" },
  { id: "quran", labelAr: "القرآن", Icon: BookOpenText, href: "/quran" },
  { id: "dhikr", labelAr: "الذكر", Icon: Repeat, href: "/dhikr" },
  { id: "zakiy", labelAr: "زكي", Icon: Brain, href: "/zakiy" },
  { id: "more", labelAr: "المزيد", Icon: LayoutGrid, href: "/more" },
];

function TabItem({
  tab,
  isActive,
  isDark,
  isRTL,
  c,
}: {
  tab: typeof TABS[0];
  isActive: boolean;
  isDark: boolean;
  isRTL: boolean;
  c: any;
}) {
  const router = useRouter();
  const scale = useSharedValue(1);
  const Icon = tab.Icon;

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[animStyle, { flex: 1, alignItems: "center" }]}>
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.88, { damping: 20, stiffness: 500 }); }}
        onPressOut={() => { scale.value = withSpring(1.0, { damping: 20, stiffness: 500 }); }}
        onPress={() => { router.push(tab.href as any); }}
        style={{ alignItems: "center", paddingVertical: 8, paddingHorizontal: 4, minWidth: 56 }}
      >
        <View style={[
          {
            width: 42, height: 42, borderRadius: 14,
            alignItems: "center", justifyContent: "center",
            marginBottom: 3,
          },
          isActive && {
            backgroundColor: isDark
              ? "rgba(16,185,129,0.18)"
              : "rgba(45,106,79,0.10)",
            borderWidth: 1,
            borderColor: isDark
              ? "rgba(16,185,129,0.30)"
              : "rgba(45,106,79,0.20)",
          },
        ]}>
          <Icon
            size={20}
            color={isActive
              ? (isDark ? c.primary : c.primary)
              : c.textMuted
            }
            strokeWidth={isActive ? 2.2 : 1.7}
          />
        </View>
        <Text style={{
          fontSize: 10,
          fontFamily: "IBMPlexSansArabic_700Bold",
          color: isActive ? (isDark ? c.primary : c.primary) : c.textMuted,
          fontWeight: isActive ? "700" : "500",
        }}>
          {tab.labelAr}
        </Text>
        {isActive && (
          <View style={{
            position: "absolute",
            bottom: 0,
            width: 4, height: 4, borderRadius: 2,
            backgroundColor: isDark ? c.primary : c.primary,
          }} />
        )}
      </Pressable>
    </Animated.View>
  );
}

export function FloatingTabBar() {
  const pathname = usePathname();
  const { language } = useSettings();
  const c = useColors();
  const isDark = c.isDark;
  const isRTL = language === "ar";

  const activeTab = TABS.find((t) => {
    if (t.href === "/") return pathname === "/";
    return pathname.startsWith(t.href);
  }) ?? TABS[0];

  return (
    <View
      style={{
        position: "absolute",
        bottom: Platform.OS === "ios" ? 28 : 16,
        left: 20,
        right: 20,
        borderRadius: 26,
        overflow: "hidden",
        shadowColor: isDark ? "#000" : "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: isDark ? 0.55 : 0.16,
        shadowRadius: 24,
        elevation: 20,
      }}
    >
      <View
        style={{
          backgroundColor: isDark
            ? "rgba(14,14,14,0.96)"
            : "rgba(255,255,255,0.96)",
          borderRadius: 26,
          borderWidth: 1,
          borderColor: isDark
            ? "rgba(255,255,255,0.07)"
            : "rgba(0,0,0,0.06)",
          flexDirection: isRTL ? "row-reverse" : "row",
          paddingHorizontal: 8,
          paddingVertical: 4,
        }}
      >
        {TABS.map((tab) => (
          <TabItem
            key={tab.id}
            tab={tab}
            isActive={activeTab.id === tab.id}
            isDark={isDark}
            isRTL={isRTL}
            c={c}
          />
        ))}
      </View>
    </View>
  );
}
