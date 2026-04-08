import { ScrollView, View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSettings } from "@/providers/SettingsProvider";
import { useColors } from "@/hooks/useColors";
import { PremiumHero } from "@/components/home/PremiumHero";
import { BentoGrid } from "@/components/home/BentoGrid";
import { FloatingTabBar } from "@/components/home/FloatingTabBar";
import { MoodSelector } from "@/components/home/MoodSelector";

export default function HomeScreen() {
  const { language } = useSettings();
  const c = useColors();
  const isDark = c.isDark;

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
          bounces
        >
          <PremiumHero />

          <View style={{ height: 8 }} />

          <MoodSelector />

          <View style={{ height: 20 }} />

          <BentoGrid />

          <View style={{ height: 12 }} />
        </ScrollView>
      </SafeAreaView>

      <FloatingTabBar />
    </View>
  );
}
