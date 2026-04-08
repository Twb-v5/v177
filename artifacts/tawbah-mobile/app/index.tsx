import { useState, useCallback } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSettings } from "@/providers/SettingsProvider";
import { useZakiyMode } from "@/providers/ZakiyModeProvider";
import { IslamicHero } from "@/components/home/IslamicHero";
import { QuickAccessBar } from "@/components/home/QuickAccessBar";
import { MoodSelector } from "@/components/home/MoodSelector";
import { CommunityTicker } from "@/components/home/CommunityTicker";
import { ZakiyModeDashboard } from "@/components/home/ZakiyModeDashboard";
import { SortableUnifiedItem } from "@/components/home/SortableUnifiedItem";
import { SectionHeader } from "@/components/home/SectionHeader";
import { Boxes, Grid3X3, Sparkles, Users } from "lucide-react-native";

type SectionId = 
  | "journey-card" | "tawbah-card" | "quran-card" | "islamic-programs" 
  | "adhkar" | "prayer-times" | "notifications" | "dhikr" | "rajaa"
  | "journey30" | "journal" | "dhikr-rooms";

type HomeBucket = "primary" | "daily" | "growth" | "community";

const DEFAULT_PRIMARY: SectionId[] = ["journey-card", "tawbah-card"];
const DEFAULT_DAILY: SectionId[] = ["quran-card", "islamic-programs", "adhkar", "prayer-times", "notifications", "dhikr", "rajaa"];
const DEFAULT_GROWTH: SectionId[] = ["journey30", "journal"];
const DEFAULT_COMMUNITY: SectionId[] = ["dhikr-rooms"];

const HOME_BUCKET_KEY = "home_bucket_map_v1";
const COMBINED_ORDER_KEY = "home_combined_order_v1";

function getInitialCombinedOrder(): SectionId[] {
  return [...DEFAULT_PRIMARY, ...DEFAULT_DAILY, ...DEFAULT_GROWTH, ...DEFAULT_COMMUNITY];
}

function getInitialBucketMap(): Partial<Record<SectionId, HomeBucket>> {
  return {};
}

function getBucketForItem(id: SectionId, bucketMap: Partial<Record<SectionId, HomeBucket>>): HomeBucket {
  if (DEFAULT_PRIMARY.includes(id)) return "primary";
  if (DEFAULT_DAILY.includes(id)) return "daily";
  if (DEFAULT_GROWTH.includes(id)) return "growth";
  if (DEFAULT_COMMUNITY.includes(id)) return "community";
  return bucketMap[id] || "daily";
}

export default function HomeScreen() {
  const { resolvedTheme, language } = useSettings();
  const { aiMode } = useZakiyMode();
  const isDark = resolvedTheme === "dark";
  const isRTL = language === "ar";
  
  const [editMode, setEditMode] = useState(false);
  const [combinedOrder, setCombinedOrder] = useState<SectionId[]>(getInitialCombinedOrder);
  const [bucketMap, setBucketMap] = useState<Partial<Record<SectionId, HomeBucket>>>(getInitialBucketMap);

  const itemsBySection = {
    primary: combinedOrder.filter(id => getBucketForItem(id, bucketMap) === "primary"),
    daily: combinedOrder.filter(id => getBucketForItem(id, bucketMap) === "daily"),
    growth: combinedOrder.filter(id => getBucketForItem(id, bucketMap) === "growth"),
    community: combinedOrder.filter(id => getBucketForItem(id, bucketMap) === "community"),
  };

  const toggleEditMode = useCallback(() => {
    setEditMode(prev => !prev);
  }, []);

  const isGridItem = (id: string): boolean => {
    return DEFAULT_DAILY.includes(id as SectionId) || DEFAULT_COMMUNITY.includes(id as SectionId);
  };

  if (aiMode) {
    return <ZakiyModeDashboard />;
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: isDark ? "#064e3b" : "#f0fdf4" }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <IslamicHero />

        <View className="px-5">
          <QuickAccessBar />

          <MoodSelector />

          {editMode && (
            <View
              className="mt-4 flex-row items-center justify-between rounded-3xl border px-4 py-3"
              style={{
                backgroundColor: isDark ? "#052e25" : "#ffffff",
                borderColor: isDark ? "#0b3b2f" : "#e2e8f0",
              }}
            >
              <View>
                <Text className="text-[13px] font-bold" style={{ color: isDark ? "#fbbf24" : "#064e3b" }}>
                  وضع الترتيب مُفعل
                </Text>
                <Text className="mt-0.5 text-[11px]" style={{ color: isDark ? "#a7f3d0" : "#64748b" }}>
                  اضغط على البطاقات لإعادة ترتيبها
                </Text>
              </View>
              <Pressable
                onPress={toggleEditMode}
                className="rounded-3xl px-4 py-2"
                style={{ backgroundColor: isDark ? "#022c22" : "#ecfdf5" }}
              >
                <Text className="text-[12px] font-semibold" style={{ color: isDark ? "#fbbf24" : "#064e3b" }}>
                  تم
                </Text>
              </Pressable>
            </View>
          )}

          <View className="mt-6">
            <SectionHeader
              title="الأهم"
              icon={<Sparkles size={14} color={isDark ? "#fbbf24" : "#064e3b"} />}
              subtitle="زكي + أهم ورد يومي"
            />
            <View className={isRTL ? "flex-row-reverse flex-wrap gap-3" : "flex-row flex-wrap gap-3"}>
              {itemsBySection.primary.map((id) => (
                <SortableUnifiedItem key={id} id={id} editMode={editMode} />
              ))}
            </View>
          </View>

          <View className="mt-6">
            <SectionHeader
              title="أدوات يومية"
              icon={<Grid3X3 size={14} color={isDark ? "#fbbf24" : "#064e3b"} />}
              subtitle="قرآن · أذكار · صلاة"
            />
            <View className={isRTL ? "flex-row-reverse flex-wrap gap-3" : "flex-row flex-wrap gap-3"}>
              {itemsBySection.daily.map((id) => (
                <View key={id} style={isGridItem(id) ? { width: "48%" } : { width: "100%" }}>
                  <SortableUnifiedItem id={id} editMode={editMode} />
                </View>
              ))}
            </View>
          </View>

          <View className="mt-6">
            <SectionHeader
              title="النمو والمحتوى"
              icon={<Boxes size={14} color={isDark ? "#fbbf24" : "#064e3b"} />}
              subtitle="برامج · يوميات · تلاوات"
            />
            <View className="flex-col gap-3">
              {itemsBySection.growth.map((id) => (
                <SortableUnifiedItem key={id} id={id} editMode={editMode} />
              ))}
            </View>
          </View>

          <View className="mt-6">
            <SectionHeader
              title="المجتمع"
              icon={<Users size={14} color={isDark ? "#fbbf24" : "#064e3b"} />}
              subtitle="إنجازات وتذكيرات"
            />
            <View className={isRTL ? "flex-row-reverse flex-wrap gap-3" : "flex-row flex-wrap gap-3"}>
              {itemsBySection.community.map((id) => (
                <View key={id} style={isGridItem(id) ? { width: "48%" } : { width: "100%" }}>
                  <SortableUnifiedItem id={id} editMode={editMode} />
                </View>
              ))}
            </View>
          </View>

          <CommunityTicker />

          <Pressable
            onPress={toggleEditMode}
            className="mt-6 items-center justify-center rounded-3xl border py-4"
            style={{
              backgroundColor: isDark ? "#052e25" : "#ffffff",
              borderColor: isDark ? "#0b3b2f" : "#e2e8f0",
            }}
          >
            <Text className="text-[14px] font-semibold" style={{ color: isDark ? "#ecfdf5" : "#064e3b" }}>
              {editMode ? "إنهاء الترتيب" : "ترتيب البطاقات"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
