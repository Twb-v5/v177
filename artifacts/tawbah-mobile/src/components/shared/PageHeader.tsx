import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useSettings } from "@/providers/SettingsProvider";
import { ChevronRight, ChevronLeft } from "lucide-react-native";

interface PageHeaderProps {
  titleAr: string;
  titleEn?: string;
  subtitleAr?: string;
  rightAction?: React.ReactNode;
  showBack?: boolean;
}

export function PageHeader({ titleAr, titleEn, subtitleAr, rightAction, showBack = true }: PageHeaderProps) {
  const router = useRouter();
  const c = useColors();
  const { language } = useSettings();
  const isRTL = language === "ar";

  return (
    <View style={{
      flexDirection: isRTL ? "row-reverse" : "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: c.divider,
      backgroundColor: c.isDark ? "rgba(10,10,10,0.95)" : "rgba(248,246,240,0.95)",
    }}>
      {showBack ? (
        <Pressable
          onPress={() => router.back()}
          style={{
            width: 38, height: 38, borderRadius: 12,
            backgroundColor: c.isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
            alignItems: "center", justifyContent: "center",
          }}
        >
          {isRTL
            ? <ChevronRight size={20} color={c.textSecondary} />
            : <ChevronLeft size={20} color={c.textSecondary} />
          }
        </Pressable>
      ) : <View style={{ width: 38 }} />}

      <View style={{ flex: 1, alignItems: "center" }}>
        <Text style={{
          fontSize: 17, fontWeight: "800", color: c.text,
          fontFamily: "IBMPlexSansArabic_700Bold",
        }}>
          {titleAr}
        </Text>
        {subtitleAr ? (
          <Text style={{ fontSize: 11, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular", marginTop: 1 }}>
            {subtitleAr}
          </Text>
        ) : null}
      </View>

      {rightAction ? rightAction : <View style={{ width: 38 }} />}
    </View>
  );
}
