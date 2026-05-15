import { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { apiUrl } from "@/lib/api";
import { getSessionId } from "@/lib/session";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useSettings } from "@/providers/SettingsProvider";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { ChevronRight, ChevronLeft, CheckCircle2, Circle } from "lucide-react-native";

const ITEMS = [
  {
    id: "tawbah", emoji: "💧",
    titleAr: "أتوب إلى الله توبةً نصوحاً",
    descAr: "وأعزم على عدم العودة إلى ما يغضبه",
    accentL: "#2D6A4F", accentD: "#34D399",
    bgL: "#E8F5EE", bgD: "#0A1F18",
  },
  {
    id: "salah", emoji: "🕌",
    titleAr: "أحافظ على الصلوات الخمس",
    descAr: "في أوقاتها مع الجماعة ما استطعت",
    accentL: "#2563EB", accentD: "#60A5FA",
    bgL: "#EFF6FF", bgD: "#080F1A",
  },
  {
    id: "quran", emoji: "📖",
    titleAr: "أقرأ ورداً يومياً من القرآن",
    descAr: "ولو آية واحدة أتدبرها بتمعن",
    accentL: "#7C3AED", accentD: "#A78BFA",
    bgL: "#F5F0FF", bgD: "#120A1A",
  },
  {
    id: "dhikr", emoji: "📿",
    titleAr: "أداوم على أذكار الصباح والمساء",
    descAr: "حصناً يومياً من الشيطان والوساوس",
    accentL: "#C8963E", accentD: "#F59E0B",
    bgL: "#FDF6E8", bgD: "#1A1206",
  },
  {
    id: "avoid", emoji: "🛡️",
    titleAr: "أبتعد عن مواطن الإغراء",
    descAr: "وأغلق كل باب يوصل إلى ما حرّم الله",
    accentL: "#DC2626", accentD: "#F87171",
    bgL: "#FFF1F0", bgD: "#1A0A0A",
  },
  {
    id: "help", emoji: "🤲",
    titleAr: "أستعين بالله ولا أستسلم",
    descAr: "وأطلب المساعدة عند الضعف بلا خجل",
    accentL: "#DB2777", accentD: "#F472B6",
    bgL: "#FDF0F8", bgD: "#1A0A14",
  },
];

function CovenantItem({
  item,
  isChecked,
  isDark,
  isRTL,
  onToggle,
  textColor,
  mutedColor,
}: {
  item: (typeof ITEMS)[0];
  isChecked: boolean;
  isDark: boolean;
  isRTL: boolean;
  onToggle: () => void;
  textColor: string;
  mutedColor: string;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const accent = isDark ? item.accentD : item.accentL;
  const bg = isDark ? item.bgD : item.bgL;

  return (
    <Animated.View style={[animStyle, { marginBottom: 10 }]}>
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.97, { damping: 20, stiffness: 400 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 20, stiffness: 400 }); }}
        onPress={onToggle}
        style={{
          flexDirection: isRTL ? "row-reverse" : "row",
          alignItems: "center", gap: 12, padding: 16,
          borderRadius: 18,
          backgroundColor: isDark ? "rgba(14,14,14,0.92)" : "#FFFFFF",
          borderWidth: 1.5,
          borderColor: isChecked
            ? accent + "55"
            : (isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"),
          overflow: "hidden",
        }}
      >
        {isChecked && (
          <View style={{
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: bg, opacity: 0.45,
          }} />
        )}
        <Text style={{ fontSize: 22, flexShrink: 0 }}>{item.emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 14, fontWeight: "800",
            color: isChecked ? accent : textColor,
            fontFamily: "IBMPlexSansArabic_700Bold",
            textAlign: isRTL ? "right" : "left",
          }}>
            {item.titleAr}
          </Text>
          <Text style={{
            fontSize: 12, color: mutedColor,
            fontFamily: "IBMPlexSansArabic_400Regular",
            textAlign: isRTL ? "right" : "left", marginTop: 3,
          }}>
            {item.descAr}
          </Text>
        </View>
        {isChecked
          ? <CheckCircle2 size={22} color={accent} />
          : <Circle size={22} color={isDark ? "rgba(255,255,255,0.20)" : "rgba(0,0,0,0.18)"} />
        }
      </Pressable>
    </Animated.View>
  );
}

export default function CovenantScreen() {
  const router = useRouter();
  const c = useColors();
  const { language } = useSettings();
  const isDark = c.isDark;
  const isRTL = language === "ar";

  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [signed, setSigned] = useState(false);
  const allChecked = checked.size === ITEMS.length;

  const sealScale = useSharedValue(0.7);
  const sealOpacity = useSharedValue(0);

  useEffect(() => {
    if (allChecked) {
      sealScale.value = withSpring(1, { damping: 12, stiffness: 180 });
      sealOpacity.value = withTiming(1, { duration: 400 });
    } else {
      sealScale.value = withTiming(0.7, { duration: 200 });
      sealOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [allChecked]);

  const sealStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sealScale.value }],
    opacity: sealOpacity.value,
  }));

  const toggle = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setChecked((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  const [signing, setSigning] = useState(false);

  const handleSign = async () => {
    if (signing) return;
    setSigning(true);
    try {
      const sessionId = await getSessionId();
      await fetch(apiUrl("/user/covenant"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, sinCategory: "other" }),
      });
    } catch {}
    finally { setSigning(false); }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSigned(true);
  };

  if (signed) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={["top"]}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 32 }}>
          <Text style={{ fontSize: 64, marginBottom: 20 }}>✅</Text>
          <Text style={{
            fontSize: 22, fontWeight: "800", color: c.primary,
            fontFamily: "IBMPlexSansArabic_700Bold",
            textAlign: "center", marginBottom: 12,
          }}>
            وقّعت ميثاقك مع الله
          </Text>
          <Text style={{
            fontSize: 16, color: c.textSecondary,
            fontFamily: "Amiri_400Regular",
            textAlign: "center", lineHeight: 30, marginBottom: 12,
          }}>
            وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا
          </Text>
          <Text style={{
            fontSize: 12, color: c.textMuted,
            fontFamily: "IBMPlexSansArabic_400Regular",
            textAlign: "center", marginBottom: 32,
          }}>
            الطلاق: ٢
          </Text>
          <Pressable
            onPress={() => router.replace("/" as any)}
            style={{
              paddingHorizontal: 32, paddingVertical: 14,
              borderRadius: 18,
              backgroundColor: c.primary,
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: 15, fontFamily: "IBMPlexSansArabic_700Bold" }}>
              ابدأ رحلتك الآن
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={["top"]}>
      <View style={{
        flexDirection: isRTL ? "row-reverse" : "row",
        alignItems: "center", paddingHorizontal: 16, paddingVertical: 12,
        borderBottomWidth: 1, borderBottomColor: c.divider,
      }}>
        <Pressable
          onPress={() => router.back()}
          style={{
            width: 38, height: 38, borderRadius: 12,
            backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
            alignItems: "center", justifyContent: "center",
          }}
        >
          {isRTL ? <ChevronRight size={20} color={c.textSecondary} /> : <ChevronLeft size={20} color={c.textSecondary} />}
        </Pressable>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={{ fontSize: 17, fontWeight: "800", color: c.text, fontFamily: "IBMPlexSansArabic_700Bold" }}>
            ميثاقي مع الله
          </Text>
          <Text style={{ fontSize: 11, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular", marginTop: 1 }}>
            {checked.size} / {ITEMS.length} بنود
          </Text>
        </View>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: "center", paddingVertical: 24 }}>
          <View style={{
            width: 80, height: 80, borderRadius: 40,
            backgroundColor: isDark ? "#0A1F14" : c.primary,
            alignItems: "center", justifyContent: "center", marginBottom: 12,
          }}>
            <Text style={{ fontSize: 36 }}>🤝</Text>
          </View>
          <Text style={{
            fontSize: 18, fontWeight: "800", color: c.text,
            fontFamily: "IBMPlexSansArabic_700Bold", textAlign: "center", marginBottom: 6,
          }}>
            الميثاق مع الله
          </Text>
          <Text style={{
            fontSize: 13, color: c.textSecondary,
            fontFamily: "IBMPlexSansArabic_400Regular",
            textAlign: "center", paddingHorizontal: 28, lineHeight: 20,
          }}>
            اقرأ كل بند وأكده ليفتح الله قلبك
          </Text>
        </View>

        <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
          {ITEMS.map((item) => (
            <CovenantItem
              key={item.id}
              item={item}
              isChecked={checked.has(item.id)}
              isDark={isDark}
              isRTL={isRTL}
              onToggle={() => toggle(item.id)}
              textColor={c.text}
              mutedColor={c.textMuted}
            />
          ))}
        </View>

        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <View style={{
            padding: 20, borderRadius: 20,
            backgroundColor: isDark ? "#0A1206" : "#FDF6E8",
            borderWidth: 1,
            borderColor: isDark ? "rgba(245,158,11,0.18)" : "rgba(200,150,62,0.20)",
          }}>
            <Text style={{
              fontSize: 18, color: c.text,
              fontFamily: "Amiri_400Regular",
              textAlign: "center", lineHeight: 34, marginBottom: 8,
            }}>
              إِنَّ اللَّهَ يُحِبُّ التَّوَّابِينَ وَيُحِبُّ الْمُتَطَهِّرِينَ
            </Text>
            <Text style={{
              fontSize: 12, color: isDark ? "#F59E0B" : "#C8963E",
              fontFamily: "IBMPlexSansArabic_400Regular", textAlign: "center",
            }}>
              البقرة: ٢٢٢
            </Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 16 }}>
          <Animated.View style={sealStyle}>
            <Pressable
              onPress={handleSign}
              style={{
                padding: 18, borderRadius: 22,
                backgroundColor: c.primary,
                alignItems: "center",
              }}
            >
              {signing
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={{ fontSize: 17, fontWeight: "800", color: "#ffffff", fontFamily: "IBMPlexSansArabic_700Bold" }}>🤝 أوقّع الميثاق الآن</Text>
              }
              <Text style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", fontFamily: "IBMPlexSansArabic_400Regular", marginTop: 4 }}>
                الله شاهد على عهدي
              </Text>
            </Pressable>
          </Animated.View>
          {!allChecked && (
            <Text style={{
              textAlign: "center", marginTop: 12, fontSize: 12,
              color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular",
            }}>
              أكّد جميع البنود أولاً
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
