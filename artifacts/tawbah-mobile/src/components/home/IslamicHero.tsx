import { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Pressable, Platform } from "react-native";
import { useSettings } from "@/providers/SettingsProvider";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { BookOpenText, Quote, ScrollText, Sparkles } from "lucide-react-native";

type HeroType = "ayah" | "hadith" | "quote";

interface HeroItem {
  type: HeroType;
  textAr: string;
  textEn: string;
  sourceAr: string;
  sourceEn: string;
}

const FALLBACK_ITEMS: HeroItem[] = [
  {
    type: "ayah",
    textAr: "إِنَّ الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ سَيَجْعَلُ لَهُمُ الرَّحْمَٰنُ وُدًّا",
    textEn: "Indeed, those who believe and do righteous deeds—the Most Merciful will appoint for them affection.",
    sourceAr: "سورة مريم ٩٦",
    sourceEn: "Surah Maryam 19:96",
  },
  {
    type: "hadith",
    textAr: "خَيْرُ النَّاسِ مَنْ طَابَ لِسَانُهُ وَطَهُرَ جَنَانُهُ.",
    textEn: "The best of people are those with a pure tongue and a pure heart.",
    sourceAr: "الأدب المفرد",
    sourceEn: "Al-Adab Al-Mufrad",
  },
  {
    type: "quote",
    textAr: "وَإِلَىٰ رَبِّكَ الْمُنْتَهَىٰ",
    textEn: "And to your Lord is the final destination.",
    sourceAr: "سورة النجم",
    sourceEn: "Surah An-Najm",
  },
];

export function IslamicHero() {
  const { resolvedTheme, language } = useSettings();
  const isDark = resolvedTheme === "dark";
  const isRTL = language === "ar";

  const [items, setItems] = useState<HeroItem[]>(FALLBACK_ITEMS);
  const [idx, setIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);

  const current = items[idx] || FALLBACK_ITEMS[0];

  const palette = useMemo(
    () => ({
      bg: isDark ? "#064e3b" : "#f0fdf4",
      card: isDark ? "#052e25" : "#ffffff",
      border: isDark ? "#0b3b2f" : "#a7f3d0",
      text: isDark ? "#ecfdf5" : "#064e3b",
      muted: isDark ? "#a7f3d0" : "#64748b",
      gold: "#fbbf24",
    }),
    [isDark]
  );

  const meta = useMemo(() => {
    const common = { badgeBg: isDark ? "#022c22" : "#f1f5f9" };
    if (current.type === "ayah") {
      return {
        ...common,
        labelAr: "آية",
        labelEn: "Ayah",
        Icon: BookOpenText,
        accent: palette.gold,
      };
    }
    if (current.type === "hadith") {
      return {
        ...common,
        labelAr: "حديث",
        labelEn: "Hadith",
        Icon: ScrollText,
        accent: palette.gold,
      };
    }
    return {
      ...common,
      labelAr: "حِكمة",
      labelEn: "Wisdom",
      Icon: Quote,
      accent: palette.gold,
    };
  }, [current.type, isDark, palette.gold]);

  const containerStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch("https://tawbah.ai/api/hero-content");
        if (!res.ok) return;
        const data = (await res.json()) as {
          items?: {
            type?: string;
            textAr?: string;
            textEn?: string;
            sourceAr?: string;
            sourceEn?: string;
          }[];
        };
        const next = (data.items || [])
          .filter((i) => i.type && ["ayah", "hadith", "quote"].includes(i.type))
          .map((i) => {
            const type = i.type as HeroType;
            return {
              type,
              textAr: i.textAr || FALLBACK_ITEMS[0].textAr,
              textEn: i.textEn || FALLBACK_ITEMS[0].textEn,
              sourceAr: i.sourceAr || "",
              sourceEn: i.sourceEn || "",
            } satisfies HeroItem;
          });
        if (next.length) setItems(next);
      } catch {
      }
    };

    fetchContent();
  }, []);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 220, easing: Easing.out(Easing.quad) });
      translateY.value = withTiming(8, { duration: 220, easing: Easing.out(Easing.quad) });

      setTimeout(() => {
        setIdx((p) => (p + 1) % items.length);
        translateY.value = 10;
        opacity.value = withTiming(1, { duration: 260, easing: Easing.out(Easing.cubic) });
        translateY.value = withTiming(0, { duration: 260, easing: Easing.out(Easing.cubic) });
      }, 220);
    }, 7000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [idx, items.length, opacity, translateY]);

  const MetaIcon = meta.Icon;

  return (
    <View
      className="px-5 pt-4 pb-5"
      style={{ backgroundColor: palette.bg }}
    >
      <View className={isRTL ? "flex-row-reverse items-center justify-between" : "flex-row items-center justify-between"}>
        <View className={isRTL ? "flex-row-reverse items-center gap-3" : "flex-row items-center gap-3"}>
          <View
            className="h-12 w-12 items-center justify-center rounded-3xl"
            style={{ backgroundColor: isDark ? "#022c22" : "#064e3b" }}
          >
            <Sparkles size={22} color={palette.gold} />
          </View>
          <View className={isRTL ? "items-end" : "items-start"}>
            <Text
              className="text-xl font-bold"
              style={{ color: palette.text, fontFamily: "IBMPlexSansArabic_700Bold" }}
            >
              توبة
            </Text>
            {language === "en" && (
              <Text className="text-xs" style={{ color: palette.muted, textAlign: isRTL ? "right" : "left", fontFamily: "IBMPlexSansArabic_400Regular" }}>
                Tawbah
              </Text>
            )}
          </View>
        </View>

        <Pressable
          className="rounded-3xl px-4 py-2"
          style={{ backgroundColor: isDark ? "#022c22" : "#ecfdf5" }}
        >
          <Text className="text-xs font-semibold" style={{ color: isDark ? palette.gold : "#064e3b" }}>
            {language === "ar" ? "الذكر اليومي" : "Daily Wird"}
          </Text>
        </Pressable>
      </View>

      <Animated.View
        className="mt-5 rounded-3xl border px-5 py-5"
        style={[
          containerStyle,
          {
            backgroundColor: palette.card,
            borderColor: palette.border,
          },
        ]}
      >
        <View className={isRTL ? "flex-row-reverse items-center justify-between" : "flex-row items-center justify-between"}>
          <View className={isRTL ? "flex-row-reverse items-center gap-2" : "flex-row items-center gap-2"}>
            <View
              className={isRTL ? "flex-row-reverse items-center gap-2 rounded-2xl px-3 py-1.5" : "flex-row items-center gap-2 rounded-2xl px-3 py-1.5"}
              style={{ backgroundColor: meta.badgeBg }}
            >
              <MetaIcon size={16} color={meta.accent} />
              <Text className="text-[12px] font-semibold" style={{ color: palette.text, fontFamily: "IBMPlexSansArabic_700Bold" }}>
                {meta.labelAr}
              </Text>
              {language === "en" && (
                <Text className="text-[11px]" style={{ color: palette.muted, fontFamily: "IBMPlexSansArabic_400Regular" }}>
                  {meta.labelEn}
                </Text>
              )}
            </View>
          </View>

          <View className={isRTL ? "items-end" : "items-start"}>
            {!!current.sourceAr && (
              <Text className="text-[11px] font-medium" style={{ color: palette.muted, textAlign: isRTL ? "right" : "left", fontFamily: "IBMPlexSansArabic_500Medium" }}>
                {current.sourceAr}
              </Text>
            )}
            {language === "en" && !!current.sourceEn && (
              <Text className="text-[10px]" style={{ color: isDark ? "#86efac" : "#64748b", textAlign: isRTL ? "right" : "left", fontFamily: "IBMPlexSansArabic_400Regular" }}>
                {current.sourceEn}
              </Text>
            )}
          </View>
        </View>

        <Text
          className="mt-4 text-[20px] leading-8"
          style={{ color: palette.text, textAlign: isRTL ? "right" : "left", fontFamily: "Amiri_400Regular" }}
        >
          {current.textAr}
        </Text>

        {language === "en" && (
          <Text className="mt-3 text-sm leading-5" style={{ color: isDark ? "#d1fae5" : "#475569", textAlign: isRTL ? "right" : "left", fontFamily: "IBMPlexSansArabic_400Regular" }}>
            {current.textEn}
          </Text>
        )}
      </Animated.View>
    </View>
  );
}
