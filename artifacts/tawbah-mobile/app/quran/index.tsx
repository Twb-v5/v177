import { useState } from "react";
import type React from "react";
import { View, Text, FlatList, Pressable, StyleSheet, TextInput, ActivityIndicator, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSurahList, useSearchSurahs, Surah } from "@/hooks/useQuranData";
import { useSettings } from "@/providers/SettingsProvider";
import { useColors } from "@/hooks/useColors";

const FlatListFixed = FlatList as unknown as React.ComponentType<
  import("react-native").FlatListProps<Surah> & {
    contentContainerStyle?: import("react-native").StyleProp<import("react-native").ViewStyle>;
    showsVerticalScrollIndicator?: boolean;
    showsHorizontalScrollIndicator?: boolean;
    initialNumToRender?: number;
    maxToRenderPerBatch?: number;
    windowSize?: number;
  }
>;

const isRTL = true;

export default function QuranHubScreen() {
  const router = useRouter();
  const c = useColors();
  const isDark = c.isDark;
  const [search, setSearch] = useState("");
  
  const { surahs, loading, error } = useSurahList();
  const results = useSearchSurahs(search, surahs);

  const getSurahNameArabic = (item: Surah): string => {
    const arabicNames: Record<string, string> = {
      "Al-Fatiha": "الفاتحة", "Al-Baqarah": "البقرة", "Aal-E-Imran": "آل عمران",
      "An-Nisa": "النساء", "Al-Ma'idah": "المائدة", "Al-An'am": "الأنعام",
      "Al-A'raf": "الأعراف", "Al-Anfal": "الأنفال", "At-Tawbah": "التوبة",
      "Yunus": "يونس", "Hud": "هود", "Yusuf": "يوسف", "Ar-Ra'd": "الرعد",
      "Ibrahim": "ابراهيم", "Al-Hijr": "الحجر", "An-Nahl": "النحل",
      "Al-Isra": "الإسراء", "Al-Kahf": "الكهف", "Maryam": "مريم", "Ta-Ha": "طه",
      "Al-Anbiya": "الأنبياء", "Al-Hajj": "الحج", "Al-Mu'minun": "المؤمنون",
      "An-Nur": "النور", "Al-Furqan": "الفرقان", "Ash-Shu'ara": "الشعراء",
      "An-Naml": "النمل", "Al-Qasas": "القصص", "Al-Ankabut": "العنكبوت",
      "Ar-Rum": "الروم", "Luqman": "لقمان", "As-Sajda": "السجدة",
      "Al-Ahzab": "الأحزاب", "Saba": "سبأ", "Fatir": "فاطر", "Ya-Sin": "يس",
      "As-Saffat": "الصافات", "Sad": "ص", "Az-Zumar": "الزمر", "Ghafir": "غافر",
      "Fussilat": "فصلت", "Ash-Shura": "الشورى", "Az-Zukhruf": "الزخرف",
      "Ad-Dukhan": "الدخان", "Al-Jathiya": "الجاثية", "Al-Ahqaf": "الأحقاف",
      "Muhammad": "محمد", "Al-Fath": "الفتح", "Al-Hujurat": "الحجرات",
      "Qaf": "ق", "Ad-Dhariyat": "الذاريات", "At-Tur": "الطور",
      "An-Najm": "النجم", "Al-Qamar": "القمر", "Ar-Rahman": "الرحمن",
      "Al-Waqi'a": "الواقعة", "Al-Hadid": "الحديد", "Al-Mujadila": "المجادلة",
      "Al-Hashr": "الحشر", "Al-Mumtahina": "الممتحنة", "As-Saf": "الصفة",
      "Al-Jumu'a": "الجمعة", "Al-Munafiqun": "المنافقون", "At-Taghabun": "التغابن",
      "At-Talaq": "الطلاق", "At-Tahrim": "التحريم", "Al-Mulk": "الملك",
      "Al-Qalam": "القلم", "Al-Haqqah": "الحاقة", "Al-Ma'arij": "المعارج",
      "Nuh": "نوح", "Al-Jinn": "الجن", "Al-Muzzammil": "المزمل",
      "Al-Muddaththir": "المدثر", "Al-Qiyamah": "القيامة", "Al-Insan": "الإنسان",
      "Al-Mursalat": "المرسلات", "An-Naba": "النبأ", "An-Nazi'at": "النازعات",
      "Abasa": "عبس", "At-Takwir": "التكوير", "Al-Infitar": "الانفطار",
      "Al-Mutaffifin": "المطففين", "Al-Inshiqaq": "الانشقاق", "Al-Buruj": "البروج",
      "At-Tariq": "الطارق", "Al-A'la": "الأعلى", "Al-Ghashiya": "الغاشية",
      "Al-Fajr": "الفجر", "Al-Balad": "البلد", "Ash-Shams": "الشمس",
      "Al-Layl": "الليل", "Ad-Duha": "الضحى", "Ash-Sharh": "الشرح",
      "At-Tin": "التين", "Al-Alaq": "العلق", "Al-Qadr": "القدر",
      "Al-Bayyina": "البينة", "Az-Zalzalah": "الزلزلة", "Al-Adiyat": "العاديات",
      "Al-Qari'a": "القارعة", "At-Takathur": "التكاثر", "Al-Asr": "العصر",
      "Al-Humaza": "الهمزة", "Al-Fil": "الفيل", "Quraysh": "قريش",
      "Al-Ma'un": "الماعون", "Al-Kawthar": "الكوثر", "Al-Kafirun": "الكافرون",
      "An-Nasr": "النصر", "Al-Masad": "المسد", "Al-Ikhlas": "الإخلاص",
      "Al-Falaq": "الفلق", "An-Nas": "الناس"
    };
    return arabicNames[item.englishName] || item.name;
  };

  const renderSurah = ({ item }: { item: Surah }) => (
    <Pressable
      style={({ pressed }) => [
        styles.surahItem,
        { backgroundColor: c.surface, borderColor: c.border },
        pressed && styles.pressed,
      ]}
      onPress={() => router.push(`/quran/read?surah=${item.number}` as any)}
    >
      <View style={[styles.surahNumber, { backgroundColor: c.cardAlt }]}>
        <Text style={[styles.surahNumberText, { color: c.text }]}>{item.number}</Text>
      </View>
      <View style={styles.surahInfo}>
        <Text style={[styles.surahName, { color: c.text }]}>
          {getSurahNameArabic(item)}
        </Text>
        <Text style={[styles.surahMeta, { color: c.textSecondary }]}>
          {item.englishNameTranslation} · {item.numberOfAyahs} آية
        </Text>
      </View>
      <View style={styles.surahType}>
        <Ionicons
          name={item.revelationType === "Meccan" ? "home" : "business"}
          size={16}
          color={c.textMuted}
        />
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]} edges={["top"]}>
      <View style={[styles.header, { backgroundColor: c.surface, borderColor: c.border }]}>
        <Text style={[styles.title, { color: c.text }]}>القرآن الكريم</Text>
        <View style={[styles.searchContainer, { backgroundColor: c.backgroundDeep, borderColor: c.border }]}>
          <Ionicons name="search" size={20} color={c.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: c.text }]}
            placeholder="البحث في السور..."
            placeholderTextColor={c.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={20} color={c.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      <View style={{ paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: c.border }}>
        <Text style={{ fontSize: 11, fontWeight: "700", color: c.textMuted, marginBottom: 8, textAlign: "right" }}>أدوات القرآن</Text>
        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {[
            { label: "استمع",   emoji: "🎧", href: "/quran/listen"   },
            { label: "تفسير",   emoji: "📖", href: "/quran/tafsir"   },
            { label: "حفظ",     emoji: "🧠", href: "/quran/memorize" },
            { label: "تحديات",  emoji: "🏆", href: "/quran/challenges" },
            { label: "ختمة",    emoji: "📿", href: "/quran/khatmat"  },
            { label: "مساجد",   emoji: "🕌", href: "/quran/map"      },
            { label: "معجزات",  emoji: "✨", href: "/quran/miracles" },
            { label: "بطاقات",  emoji: "🃏", href: "/quran/cards"    },
            { label: "ذكاء",    emoji: "🤖", href: "/quran/ai"       },
            { label: "تجويد",   emoji: "🎙️", href: "/quran/tajweed" },
          ].map(tool => (
            <Pressable key={tool.href} onPress={() => router.push(tool.href as any)}
              style={{ flexDirection: "row-reverse", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10,
                backgroundColor: c.surfaceElevated, borderWidth: 1, borderColor: c.border }}>
              <Text style={{ fontSize: 14 }}>{tool.emoji}</Text>
              <Text style={{ fontSize: 11, fontWeight: "600", color: c.text }}>{tool.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.tabs}>
        <Pressable style={[styles.tab, styles.activeTab, { backgroundColor: c.surface, borderColor: c.primary }]}>
          <Text style={[styles.tabText, { color: c.primary }]}>الكل</Text>
        </Pressable>
        <Pressable style={[styles.tab, { backgroundColor: "transparent" }]}>
          <Text style={[styles.tabText, { color: c.textMuted }]}>الأجزاء</Text>
        </Pressable>
        <Pressable style={[styles.tab, { backgroundColor: "transparent" }]}>
          <Text style={[styles.tabText, { color: c.textMuted }]}>المفضلة</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={c.primary} />
          <Text style={[styles.loadingText, { color: c.textSecondary }]}>...جاري التحميل</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={c.danger} />
          <Text style={[styles.errorText, { color: c.danger, marginTop: 16 }]}>{error}</Text>
          <Pressable style={[styles.retryBtn, { backgroundColor: c.primary }]}>
            <Text style={styles.retryText}>إعادة المحاولة</Text>
          </Pressable>
        </View>
      ) : (
        <FlatListFixed
          data={results}
          renderItem={renderSurah}
          keyExtractor={(item) => item.number.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          initialNumToRender={15}
          maxToRenderPerBatch={10}
          windowSize={10}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, borderBottomWidth: 1 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 12, fontFamily: Platform.OS === "ios" ? "Georgia" : "serif" },
  searchContainer: { 
    flexDirection: "row", 
    alignItems: "center", 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 14, 
    borderWidth: 1,
    gap: 8
  },
  searchInput: { flex: 1, padding: 4, fontSize: 14 },
  tabs: { flexDirection: "row", padding: 12, gap: 8 },
  tab: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  activeTab: { borderWidth: 1, borderColor: "#1a4731" },
  tabText: { fontSize: 14, fontWeight: "600" },
  list: { padding: 16, paddingTop: 8 },
  surahItem: { 
    flexDirection: "row", 
    alignItems: "center", 
    padding: 14, 
    borderRadius: 16, 
    marginBottom: 10, 
    borderWidth: 1,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 },
      android: { elevation: 2 }
    })
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  surahNumber: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", marginEnd: 14 },
  surahNumberText: { fontSize: 15, fontWeight: "bold" },
  surahInfo: { flex: 1 },
  surahName: { fontSize: 17, fontWeight: "600", marginBottom: 4, fontFamily: Platform.OS === "ios" ? "Georgia" : "serif" },
  surahMeta: { fontSize: 12 },
  surahType: { marginStart: 8 },
  surahTypeText: { fontSize: 12, fontWeight: "600" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 14 },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  errorText: { fontSize: 14 },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 12, backgroundColor: "#1a4731", borderRadius: 12, marginTop: 16 },
  retryText: { color: "#ffffff", fontWeight: "600" },
});
