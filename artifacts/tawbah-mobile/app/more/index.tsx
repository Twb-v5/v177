import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useSettings } from "@/providers/SettingsProvider";
import { FloatingTabBar } from "@/components/home/FloatingTabBar";
import {
  BookOpen,
  Heart,
  AlertTriangle,
  TrendingUp,
  BookMarked,
  Users,
  Sprout,
  CheckSquare,
  Bell,
  Settings,
  Star,
  Shield,
  Radio,
  Target,
  Moon,
  Tv,
  Zap,
  Clock,
  Lock,
  Inbox,
  ListChecks,
  Library,
  Scroll,
  CreditCard,
  ListTree,
  AlarmClock,
  CloudMoon,
} from "lucide-react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

interface MenuItem {
  icon: React.ReactNode;
  labelAr: string;
  labelEn: string;
  href: string;
  color: string;
  bg: string;
  bgDark: string;
  badge?: string;
}

function MoreCard({
  item,
  isDark,
  isRTL,
  textColor,
  onPress,
}: {
  item: MenuItem;
  isDark: boolean;
  isRTL: boolean;
  textColor: string;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[animStyle, { width: "48%" }]}>
      <Pressable
        onPressIn={() => {
          scale.value = withSpring(0.95, { damping: 20, stiffness: 400 });
        }}
        onPressOut={() => {
          scale.value = withSpring(1, { damping: 20, stiffness: 400 });
        }}
        onPress={onPress}
        style={{
          padding: 16,
          borderRadius: 20,
          backgroundColor: isDark ? "rgba(14,14,14,0.92)" : "rgba(255,255,255,0.92)",
          borderWidth: 1,
          borderColor: isDark
            ? "rgba(255,255,255,0.06)"
            : "rgba(0,0,0,0.06)",
          minHeight: 90,
        }}
      >
        <View
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: isDark ? item.bgDark : item.bg,
            borderRadius: 20,
            opacity: 0.55,
          }}
        />
        <View
          style={{
            width: 36, height: 36,
            borderRadius: 12,
            backgroundColor: item.color + "22",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 10,
          }}
        >
          {item.icon}
        </View>
        <Text
          style={{
            fontSize: 13,
            fontWeight: "800",
            color: textColor,
            fontFamily: "IBMPlexSansArabic_700Bold",
            textAlign: isRTL ? "right" : "left",
          }}
        >
          {item.labelAr}
        </Text>
        {item.badge && (
          <View
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              backgroundColor: item.color,
              borderRadius: 8,
              paddingHorizontal: 6,
              paddingVertical: 2,
            }}
          >
            <Text style={{ fontSize: 9, color: "#fff", fontWeight: "800" }}>
              {item.badge}
            </Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

export default function MoreScreen() {
  const router = useRouter();
  const c = useColors();
  const { language } = useSettings();
  const isDark = c.isDark;
  const isRTL = language === "ar";

  const sections: { title: string; items: MenuItem[] }[] = [
    {
      title: "التوبة والإصلاح",
      items: [
        {
          icon: <AlertTriangle size={18} color="#DC2626" />,
          labelAr: "نداء الاستغاثة",
          labelEn: "SOS",
          href: "/sos",
          color: "#DC2626",
          bg: "#FFF1F0",
          bgDark: "#1A0A0A",
        },
        {
          icon: <Heart size={18} color="#DB2777" />,
          labelAr: "ميثاقي مع الله",
          labelEn: "My Covenant",
          href: "/covenant",
          color: "#DB2777",
          bg: "#FDF0F8",
          bgDark: "#1A0A14",
        },
        {
          icon: <Shield size={18} color="#7C3AED" />,
          labelAr: "علامات الخطر",
          labelEn: "Warning Signs",
          href: "/signs",
          color: "#7C3AED",
          bg: "#F5F0FF",
          bgDark: "#120A1A",
        },
        {
          icon: <Moon size={18} color="#2563EB" />,
          labelAr: "لحظة الانتكاس",
          labelEn: "Relapse Support",
          href: "/relapse",
          color: "#2563EB",
          bg: "#EFF6FF",
          bgDark: "#080F1A",
        },
        {
          icon: <Scroll size={18} color="#92400E" />,
          labelAr: "الكفارات",
          labelEn: "Kaffarah",
          href: "/kaffarah",
          color: "#92400E",
          bg: "#FFFBEB",
          bgDark: "#1A1000",
        },
        {
          icon: <Clock size={18} color="#DC2626" />,
          labelAr: "أوقات الخطر",
          labelEn: "Danger Times",
          href: "/danger-times",
          color: "#DC2626",
          bg: "#FFF1F0",
          bgDark: "#1A0505",
        },
      ],
    },
    {
      title: "رحلتي الروحية",
      items: [
        {
          icon: <Target size={18} color={c.primary} />,
          labelAr: "رحلة ٣٠ يوم",
          labelEn: "30-Day Journey",
          href: "/journey",
          color: c.primary,
          bg: "#E8F5EE",
          bgDark: "#0A1F18",
          badge: "جديد",
        },
        {
          icon: <ListChecks size={18} color="#0891B2" />,
          labelAr: "مهام اليوم الأول",
          labelEn: "Day One Tasks",
          href: "/day-one",
          color: "#0891B2",
          bg: "#ECFEFF",
          bgDark: "#091A1F",
        },
        {
          icon: <TrendingUp size={18} color="#059669" />,
          labelAr: "تقدمي",
          labelEn: "My Progress",
          href: "/progress",
          color: "#059669",
          bg: "#ECFDF5",
          bgDark: "#0A1F18",
        },
        {
          icon: <BookMarked size={18} color="#C8963E" />,
          labelAr: "مذكرتي",
          labelEn: "My Journal",
          href: "/journal",
          color: "#C8963E",
          bg: "#FDF6E8",
          bgDark: "#1A1206",
        },
        {
          icon: <CheckSquare size={18} color="#7C3AED" />,
          labelAr: "عاداتي",
          labelEn: "My Habits",
          href: "/habits",
          color: "#7C3AED",
          bg: "#F5F0FF",
          bgDark: "#120A1A",
        },
        {
          icon: <Zap size={18} color="#F59E0B" />,
          labelAr: "مهام اليوم",
          labelEn: "Daily Tasks",
          href: "/hadi-tasks",
          color: "#F59E0B",
          bg: "#FFFBEB",
          bgDark: "#1A1206",
        },
        {
          icon: <Lock size={18} color="#6B7280" />,
          labelAr: "دعائي السري",
          labelEn: "Secret Dua",
          href: "/secret-dua",
          color: "#6B7280",
          bg: "#F9FAFB",
          bgDark: "#111111",
        },
      ],
    },
    {
      title: "أدوات روحية",
      items: [
        {
          icon: <CloudMoon size={18} color="#4F46E5" />,
          labelAr: "وضع المناجاة",
          labelEn: "Munajat Mode",
          href: "/munajat",
          color: "#4F46E5",
          bg: "#EEF2FF",
          bgDark: "#0F0A2A",
        },
        {
          icon: <AlarmClock size={18} color="#DC2626" />,
          labelAr: "أوقات الدعاء",
          labelEn: "Dua Timing",
          href: "/dua-timing",
          color: "#DC2626",
          bg: "#FFF1F0",
          bgDark: "#1A0505",
        },
        {
          icon: <CreditCard size={18} color="#0891B2" />,
          labelAr: "بطاقة التوبة",
          labelEn: "Tawbah Card",
          href: "/tawbah-card",
          color: "#0891B2",
          bg: "#ECFEFF",
          bgDark: "#091A1F",
        },
        {
          icon: <ListTree size={18} color="#7C3AED" />,
          labelAr: "تتبع الذنوب",
          labelEn: "Sin Tracker",
          href: "/sins",
          color: "#7C3AED",
          bg: "#F5F0FF",
          bgDark: "#120A1A",
        },
      ],
    },
    {
      title: "المحتوى الإسلامي",
      items: [
        {
          icon: <Library size={18} color="#059669" />,
          labelAr: "مكتبة الرجاء",
          labelEn: "Library of Hope",
          href: "/rajaa",
          color: "#059669",
          bg: "#ECFDF5",
          bgDark: "#0A1F18",
        },
        {
          icon: <Tv size={18} color="#8B5CF6" />,
          labelAr: "برامج إسلامية",
          labelEn: "Islamic Programs",
          href: "/programs",
          color: "#8B5CF6",
          bg: "#F5F0FF",
          bgDark: "#120A1A",
          badge: "جديد",
        },
      ],
    },
    {
      title: "المجتمع",
      items: [
        {
          icon: <Users size={18} color="#7C3AED" />,
          labelAr: "ادعوا معاً",
          labelEn: "Community Duas",
          href: "/community/ameen",
          color: "#7C3AED",
          bg: "#F5F0FF",
          bgDark: "#120A1A",
        },
        {
          icon: <Radio size={18} color="#DB2777" />,
          labelAr: "حلقات الذكر",
          labelEn: "Dhikr Rooms",
          href: "/community/rooms",
          color: "#DB2777",
          bg: "#FDF0F8",
          bgDark: "#1A0A14",
        },
        {
          icon: <Star size={18} color="#D97706" />,
          labelAr: "التحديات",
          labelEn: "Challenges",
          href: "/quran/challenges",
          color: "#D97706",
          bg: "#FFFBEB",
          bgDark: "#1A1206",
        },
        {
          icon: <Sprout size={18} color="#16A34A" />,
          labelAr: "حديقتي",
          labelEn: "My Garden",
          href: "/garden",
          color: "#16A34A",
          bg: "#F0FDF4",
          bgDark: "#0A1F18",
        },
      ],
    },
    {
      title: "الإعدادات",
      items: [
        {
          icon: <Inbox size={18} color="#0891B2" />,
          labelAr: "صندوق الوارد",
          labelEn: "Inbox",
          href: "/inbox",
          color: "#0891B2",
          bg: "#ECFEFF",
          bgDark: "#091A1F",
        },
        {
          icon: <Bell size={18} color="#64748B" />,
          labelAr: "الإشعارات",
          labelEn: "Notifications",
          href: "/notifications",
          color: "#64748B",
          bg: "#F8FAFC",
          bgDark: "#111111",
        },
        {
          icon: <Settings size={18} color="#64748B" />,
          labelAr: "الإعدادات",
          labelEn: "Settings",
          href: "/account",
          color: "#64748B",
          bg: "#F8FAFC",
          bgDark: "#111111",
        },
      ],
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 14,
            borderBottomWidth: 1,
            borderBottomColor: c.divider,
          }}
        >
          <Text
            style={{
              fontSize: 22,
              fontWeight: "800",
              color: c.text,
              fontFamily: "IBMPlexSansArabic_700Bold",
              textAlign: isRTL ? "right" : "left",
            }}
          >
            المزيد
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: c.textMuted,
              fontFamily: "IBMPlexSansArabic_400Regular",
              textAlign: isRTL ? "right" : "left",
              marginTop: 2,
            }}
          >
            كل أدوات التوبة والنمو الروحي
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingBottom: 120, paddingTop: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {sections.map((section) => (
            <View key={section.title} style={{ paddingHorizontal: 16, marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "800",
                  color: c.textMuted,
                  fontFamily: "IBMPlexSansArabic_700Bold",
                  textAlign: isRTL ? "right" : "left",
                  marginBottom: 10,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                {section.title}
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                {section.items.map((item) => (
                  <MoreCard
                    key={item.href}
                    item={item}
                    isDark={isDark}
                    isRTL={isRTL}
                    textColor={c.text}
                    onPress={() => router.push(item.href as any)}
                  />
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
      <FloatingTabBar />
    </View>
  );
}
