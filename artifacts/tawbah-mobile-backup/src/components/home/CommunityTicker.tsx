import { View, Text, ScrollView } from "react-native";
import { useSettings } from "@/providers/SettingsProvider";

const TICKER_ITEMS = [
  { id: 1, textAr: "أحمد أتم ١٠٠ تسبيحة", textEn: "Ahmed completed 100 dhikr", timeAr: "قبل دقيقتين", timeEn: "2m ago" },
  { id: 2, textAr: "تمت مشاركة دعاء جديد", textEn: "New dua shared", timeAr: "قبل ٥ دقائق", timeEn: "5m ago" },
  { id: 3, textAr: "فاطمة بدأت رحلة ٣٠", textEn: "Fatima started Journey 30", timeAr: "قبل ١٠ دقائق", timeEn: "10m ago" },
  { id: 4, textAr: "ورد جماعي جاري الآن", textEn: "Community dhikr in progress", timeAr: "قبل ١٥ دقيقة", timeEn: "15m ago" },
];

export function CommunityTicker() {
  const { resolvedTheme } = useSettings();
  const isDark = resolvedTheme === "dark";

  return (
    <View
      className="mt-4 overflow-hidden rounded-3xl border"
      style={{
        backgroundColor: isDark ? "#052e25" : "#ffffff",
        borderColor: isDark ? "#0b3b2f" : "#e2e8f0",
      }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="flex-row gap-3 px-3 py-3"
      >
        {TICKER_ITEMS.map((item) => (
          <View
            key={item.id}
            className="flex-row items-center gap-3 rounded-3xl border px-4 py-3"
            style={{
              backgroundColor: isDark ? "#022c22" : "#f8fafc",
              borderColor: isDark ? "#0b3b2f" : "#e2e8f0",
            }}
          >
            <View>
              <Text className="text-[12px] font-semibold" style={{ color: isDark ? "#ecfdf5" : "#064e3b", textAlign: "right" }}>
                {item.textAr}
              </Text>
              <Text className="mt-0.5 text-[10px]" style={{ color: isDark ? "#a7f3d0" : "#64748b", textAlign: "right" }}>
                {item.textEn}
              </Text>
            </View>
            <View className="h-4 w-px" style={{ backgroundColor: isDark ? "#0b3b2f" : "#e2e8f0" }} />
            <View>
              <Text className="text-[10px]" style={{ color: isDark ? "#fbbf24" : "#064e3b", textAlign: "right" }}>
                {item.timeAr}
              </Text>
              <Text className="text-[9px]" style={{ color: isDark ? "#86efac" : "#64748b", textAlign: "right" }}>
                {item.timeEn}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
