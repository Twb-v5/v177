import { useState, useEffect } from "react";
import { View, Text, Pressable, ScrollView, ActivityIndicator, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { MapPin, Navigation, Search, Phone, Clock, Star } from "lucide-react-native";
import { useColors } from "@/hooks/useColors";
import { useSettings } from "@/providers/SettingsProvider";
import { PageHeader } from "@/components/shared/PageHeader";

interface Mosque {
  id: string;
  name: string;
  address: string;
  distance: string;
  rating: number;
  prayerTimes: string;
  isOpen: boolean;
}

const MOCK_MOSQUES: Mosque[] = [
  { id: "1", name: "مسجد التوبة", address: "شارع الملك فهد، الرياض", distance: "0.3 كم", rating: 4.8, prayerTimes: "الفجر 4:45", isOpen: true },
  { id: "2", name: "مسجد الرحمة", address: "حي النزهة، الرياض", distance: "0.7 كم", rating: 4.6, prayerTimes: "الفجر 4:45", isOpen: true },
  { id: "3", name: "الجامع الكبير", address: "وسط المدينة", distance: "1.2 كم", rating: 4.9, prayerTimes: "الفجر 4:45", isOpen: false },
  { id: "4", name: "مسجد النور", address: "شارع الأمير سلطان", distance: "1.8 كم", rating: 4.5, prayerTimes: "الفجر 4:45", isOpen: true },
  { id: "5", name: "مسجد الفاروق", address: "حي الملقا، الرياض", distance: "2.1 كم", rating: 4.7, prayerTimes: "الفجر 4:45", isOpen: true },
];

function MosqueCard({ mosque, isRTL, isDark, c }: { mosque: Mosque; isRTL: boolean; isDark: boolean; c: any }) {
  return (
    <Animated.View entering={FadeInDown.springify()} style={{ marginBottom: 10 }}>
      <Pressable
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        style={{ borderRadius: 18, backgroundColor: isDark ? "rgba(14,14,14,0.92)" : "#FFFFFF", borderWidth: 1,
          borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)", padding: 14 }}>
        <View style={{ flexDirection: isRTL ? "row-reverse" : "row", justifyContent: "space-between", alignItems: "flex-start" }}>
          <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 10, flex: 1 }}>
            <View style={{ width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(16,185,129,0.12)", borderWidth: 1, borderColor: "rgba(16,185,129,0.22)" }}>
              <Text style={{ fontSize: 18 }}>🕌</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: "800", color: c.text, fontFamily: "IBMPlexSansArabic_700Bold" }}>{mosque.name}</Text>
              <Text style={{ fontSize: 11, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular", marginTop: 2 }}>{mosque.address}</Text>
            </View>
          </View>
          <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: mosque.isOpen ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.12)" }}>
            <Text style={{ fontSize: 10, fontWeight: "700", color: mosque.isOpen ? "#10b981" : "#ef4444", fontFamily: "IBMPlexSansArabic_700Bold" }}>{mosque.isOpen ? "مفتوح" : "مغلق"}</Text>
          </View>
        </View>

        <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 16, marginTop: 12 }}>
          <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 4 }}>
            <MapPin size={12} color="#10b981" />
            <Text style={{ fontSize: 11, color: "#10b981", fontFamily: "IBMPlexSansArabic_400Regular" }}>{mosque.distance}</Text>
          </View>
          <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 4 }}>
            <Star size={12} color="#F59E0B" />
            <Text style={{ fontSize: 11, color: "#F59E0B", fontFamily: "IBMPlexSansArabic_400Regular" }}>{mosque.rating}</Text>
          </View>
          <View style={{ flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 4 }}>
            <Clock size={12} color={c.textMuted} />
            <Text style={{ fontSize: 11, color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }}>{mosque.prayerTimes}</Text>
          </View>
        </View>

        <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          style={{ marginTop: 12, paddingVertical: 9, borderRadius: 12, alignItems: "center", backgroundColor: "rgba(16,185,129,0.1)", borderWidth: 1, borderColor: "rgba(16,185,129,0.2)", flexDirection: "row", justifyContent: "center", gap: 6 }}>
          <Navigation size={13} color="#10b981" />
          <Text style={{ fontSize: 12, fontWeight: "700", color: "#10b981", fontFamily: "IBMPlexSansArabic_700Bold" }}>الاتجاهات</Text>
        </Pressable>
      </Pressable>
    </Animated.View>
  );
}

export default function QuranMapPage() {
  const c = useColors();
  const { language } = useSettings();
  const isRTL = language === "ar";
  const isDark = c.isDark;
  const [locationGranted, setLocationGranted] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const requestLocation = async () => {
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const { status } = await Location.requestForegroundPermissionsAsync();
    setLocationGranted(status === "granted");
    setLoading(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={["top"]}>
      <PageHeader titleAr="المساجد القريبة" subtitleAr="اعثر على أقرب مسجد إليك" />

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {locationGranted === null ? (
          <View style={{ padding: 28, borderRadius: 24, alignItems: "center", marginBottom: 20,
            backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#F0FDF4", borderWidth: 1, borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(16,185,129,0.2)" }}>
            <Text style={{ fontSize: 56, marginBottom: 16 }}>🕌</Text>
            <Text style={{ fontSize: 18, fontWeight: "800", color: c.text, fontFamily: "IBMPlexSansArabic_700Bold", textAlign: "center", marginBottom: 8 }}>
              ابحث عن المساجد
            </Text>
            <Text style={{ fontSize: 13, color: c.textSecondary, fontFamily: "IBMPlexSansArabic_400Regular", textAlign: "center", lineHeight: 22, marginBottom: 20 }}>
              أعطنا إذن الوصول لموقعك لنعرض لك أقرب المساجد وأوقات الصلاة
            </Text>
            <Pressable onPress={requestLocation}
              style={{ paddingHorizontal: 28, paddingVertical: 14, borderRadius: 16, backgroundColor: "#2D6A4F", flexDirection: "row", alignItems: "center", gap: 8 }}>
              {loading ? <ActivityIndicator size="small" color="#fff" /> : <Navigation size={16} color="#fff" />}
              <Text style={{ fontSize: 14, fontWeight: "800", color: "#fff", fontFamily: "IBMPlexSansArabic_700Bold" }}>
                {loading ? "جارٍ التحديد..." : "تحديد موقعي"}
              </Text>
            </Pressable>
          </View>
        ) : !locationGranted ? (
          <View style={{ padding: 20, borderRadius: 18, alignItems: "center", marginBottom: 16, backgroundColor: "rgba(239,68,68,0.07)", borderWidth: 1, borderColor: "rgba(239,68,68,0.18)" }}>
            <Text style={{ fontSize: 13, color: "#ef4444", textAlign: "center", fontFamily: "IBMPlexSansArabic_400Regular" }}>لم يتم منح إذن الموقع. يرجى تفعيله من الإعدادات.</Text>
          </View>
        ) : (
          <View style={{ padding: 14, borderRadius: 16, flexDirection: isRTL ? "row-reverse" : "row", alignItems: "center", gap: 10, marginBottom: 16,
            backgroundColor: "rgba(16,185,129,0.08)", borderWidth: 1, borderColor: "rgba(16,185,129,0.2)" }}>
            <MapPin size={16} color="#10b981" />
            <Text style={{ flex: 1, fontSize: 12, color: "#10b981", fontFamily: "IBMPlexSansArabic_400Regular" }}>تم تحديد موقعك · عرض {MOCK_MOSQUES.length} مساجد قريبة</Text>
          </View>
        )}

        {(locationGranted !== null) && (
          <>
            <View style={{ padding: 16, borderRadius: 18, marginBottom: 16, alignItems: "center", justifyContent: "center", minHeight: 180,
              backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "#F0FDF4", borderWidth: 1, borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(16,185,129,0.15)" }}>
              <Text style={{ fontSize: 36, marginBottom: 8 }}>🗺️</Text>
              <Text style={{ fontSize: 13, color: c.textSecondary, fontFamily: "IBMPlexSansArabic_400Regular", textAlign: "center" }}>
                {locationGranted ? "الخريطة التفاعلية\n(react-native-maps)" : "فعّل الموقع لرؤية الخريطة"}
              </Text>
            </View>

            {MOCK_MOSQUES.map((mosque) => (
              <MosqueCard key={mosque.id} mosque={mosque} isRTL={isRTL} isDark={isDark} c={c} />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
