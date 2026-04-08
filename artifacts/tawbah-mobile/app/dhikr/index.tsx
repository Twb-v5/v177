import { useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, I18nManager } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useSettings } from "@/providers/SettingsProvider";

const DHIKR_CATEGORIES = [
  { id: "general", label: "General", labelAr: "تسبيح عام", icon: "📿" },
  { id: "morning", label: "Morning", labelAr: "أذكار الصباح", icon: "☀️" },
  { id: "evening", label: "Evening", labelAr: "أذكار المساء", icon: "🌙" },
  { id: "sleep", label: "Sleep", labelAr: "أذكار النوم", icon: "🛌" },
];

export default function DhikrHubScreen() {
  const router = useRouter();
  const { resolvedTheme } = useSettings();
  const isDark = resolvedTheme === "dark";
  const isRTL = I18nManager.isRTL;

  const handleCategoryPress = (categoryId: string) => {
    // @ts-ignore - expo-router type issue
    router.push({ pathname: "/dhikr/counter", params: { category: categoryId } });
  };

  const renderCategoryCard = (category: typeof DHIKR_CATEGORIES[0], index: number) => {
    const colors = ["#1a4731", "#0369a1", "#7c3aed", "#be185d"];
    const bgColor = colors[index % colors.length];
    
    return (
      <Pressable
        key={category.id}
        onPress={() => handleCategoryPress(category.id)}
        style={[
          styles.categoryCard,
          { backgroundColor: isDark ? "#1e293b" : "#ffffff" },
        ]}
      >
        <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
          <Text style={styles.iconText}>{category.icon}</Text>
        </View>
        <View style={styles.categoryInfo}>
          <Text style={[styles.categoryLabel, { color: isDark ? "#f1f5f9" : "#1e293b" }]}>
            {isRTL ? category.labelAr : category.label}
          </Text>
          <Text style={[styles.categorySubtext, { color: isDark ? "#94a3b8" : "#64748b" }]}>
            {isRTL ? " " : "Tap to start counting"}
          </Text>
        </View>
        <Text style={[styles.arrow, { color: isDark ? "#94a3b8" : "#64748b" }]}>
          {isRTL ? "«" : "»"}
        </Text>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? "#0f172a" : "#f8fafc" }]} edges={["top"]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? "#1e293b" : "#ffffff", borderColor: isDark ? "#334155" : "#e2e8f0" }]}>
        <Text style={[styles.headerTitle, { color: isDark ? "#f1f5f9" : "#1e293b" }]}>
          {isRTL ? "الأذكار" : "Dhikr"}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={[styles.heroCard, { backgroundColor: "#1a4731" }]}>
          <Text style={styles.heroTitle}>
            {isRTL ? "ذِكْرُ الله" : "Remembrance of Allah"}
          </Text>
          <Text style={styles.heroSubtitle}>
            {isRTL ? "سبّح واذكر الله… واحتسب الأجر" : "Count your dhikr and seek blessings"}
          </Text>
        </View>

        {/* Categories */}
        <View style={styles.categoriesSection}>
          <Text style={[styles.sectionTitle, { color: isDark ? "#f1f5f9" : "#1e293b" }]}>
            {isRTL ? "الأقسام" : "Categories"}
          </Text>
          {DHIKR_CATEGORIES.map(renderCategoryCard)}
        </View>

        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: isDark ? "#1e293b" : "#ffffff" }]}>
          <Text style={[styles.infoTitle, { color: isDark ? "#f1f5f9" : "#1e293b" }]}>
            {isRTL ? "فضل الذِّكر" : "Benefits of Dhikr"}
          </Text>
          <Text style={[styles.infoText, { color: isDark ? "#94a3b8" : "#64748b" }]}>
            {isRTL ? "بذكر الله تطمئن القلوب، وتزداد البركة، ويُحفظ العبد من الوسواس." : "Remembering Allah brings peace to the heart, increases blessings, and protects from Shaytan."}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 24, fontWeight: "bold", textAlign: "center" },
  content: { padding: 16 },
  heroCard: { padding: 24, borderRadius: 20, marginBottom: 24, alignItems: "center" },
  heroTitle: { fontSize: 22, fontWeight: "bold", color: "#ffffff", marginBottom: 4 },
  heroSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.8)" },
  categoriesSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 16 },
  categoryCard: { flexDirection: "row", alignItems: "center", padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: "transparent" },
  iconContainer: { width: 50, height: 50, borderRadius: 25, alignItems: "center", justifyContent: "center", marginEnd: 14 },
  iconText: { fontSize: 20 },
  categoryInfo: { flex: 1 },
  categoryLabel: { fontSize: 16, fontWeight: "600" },
  categorySubtext: { fontSize: 13, marginTop: 2 },
  arrow: { fontSize: 20, fontWeight: "bold" },
  infoCard: { padding: 20, borderRadius: 16 },
  infoTitle: { fontSize: 16, fontWeight: "600", marginBottom: 8 },
  infoText: { fontSize: 14, lineHeight: 22 },
});
