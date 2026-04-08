import { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, Pressable, StyleSheet, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSurahList, Surah } from "@/hooks/useQuranData";
import { useQuranAudio } from "@/hooks/useQuranAudio";
import { useSettings } from "@/providers/SettingsProvider";

const isRTL = true;

interface Reciter {
  id: string;
  name: string;
  nameArabic: string;
  identifier: string;
}

const reciters: Reciter[] = [
  { id: "1", name: "Mishary Rashid Alafasy", nameArabic: " Mishary Rashid Alafasy ", identifier: "ar.alafasy" },
  { id: "2", name: "Abdul Basit", nameArabic: " Abdul Basit ", identifier: "ar.abdulbasit" },
  { id: "3", name: "Mahmoud Khalil Al-Husary", nameArabic: " Mahmoud Khalil Al-Husary ", identifier: "ar.husary" },
  { id: "4", name: "Abdul Samad", nameArabic: " Abdul Samad ", identifier: "ar.abdulsamad" },
  { id: "5", name: "Hani Ar-Rifai", nameArabic: " Hani Ar-Rifai ", identifier: "ar.hanirifai" },
  { id: "6", name: "Saad Al-Ghamdi", nameArabic: " Saad Al-Ghamdi ", identifier: "ar.ghamadi" },
];

export default function QuranListenScreen() {
  const router = useRouter();
  const { surah } = useLocalSearchParams<{ surah?: string }>();
  const { resolvedTheme } = useSettings();
  const isDark = resolvedTheme === "dark";
  
  const { surahs, loading } = useSurahList();
  const audio = useQuranAudio();
  
  const [selectedReciter, setSelectedReciter] = useState<Reciter>(reciters[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSurah, setCurrentSurah] = useState<number | null>(null);

  const playSurah = useCallback((surahNumber: number) => {
    const audioUrl = `https://cdn.islamic.network/quran/audio/128/${selectedReciter.identifier}/${surahNumber}.mp3`;
    audio.play(surahNumber, 1, audioUrl);
    setCurrentSurah(surahNumber);
    setIsPlaying(true);
  }, [audio, selectedReciter]);

  const togglePlayPause = useCallback(() => {
    if (audio.isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else if (currentSurah) {
      audio.resume();
      setIsPlaying(true);
    }
  }, [audio, currentSurah]);

  const stopPlayback = useCallback(() => {
    audio.stop();
    setIsPlaying(false);
    setCurrentSurah(null);
  }, [audio]);

  useEffect(() => {
    if (surah) {
      playSurah(parseInt(surah, 10));
    }
  }, [surah]);

  const getSurahNameArabic = (item: Surah): string => {
    const arabicNames: Record<string, string> = {
      "Al-Fatiha": " ,Al-Fatiha", "Al-Baqarah": " ,Al-Baqarah", "Aal-E-Imran": " ,Al-Imran",
      "An-Nisa": " ,Al-Nisa", "Al-Ma'idah": " ,Al-Ma'idah", "Al-An'am": " ,Al-An'am",
      "Al-A'raf": " ,Al-A'raf", "Al-Anfal": " ,Al-Anfal", "At-Tawbah": " ,Al-Tawbah",
      "Yunus": " ,Yunus", "Hud": " ,Hud", "Yusuf": " ,Yusuf", "Ar-Ra'd": " ,Al-Ra'd",
      "Ibrahim": " ,Ibrahim", "Al-Hijr": " ,Al-Hijr", "An-Nahl": " ,Al-Nahl",
      "Al-Isra": " ,Al-Isra", "Al-Kahf": " ,Al-Kahf", "Maryam": " ,Maryam", "Ta-Ha": " ,Ta-Ha",
      "Al-Anbiya": " ,Al-Anbiya", "Al-Hajj": " ,Al-Hajj", "Al-Mu'minun": " ,Al-Mu'minun",
      "An-Nur": " ,Al-Nur", "Al-Furqan": " ,Al-Furqan", "Ash-Shu'ara": " ,Al-Shu'ara",
      "An-Naml": " ,Al-Naml", "Al-Qasas": " ,Al-Qasas", "Al-Ankabut": " ,Al-Ankabut",
      "Ar-Rum": " ,Al-Rum", "Luqman": " ,Luqman", "As-Sajda": " ,Al-Sajda",
      "Al-Ahzab": " ,Al-Ahzab", "Saba": " ,Saba", "Fatir": " ,Fatir", "Ya-Sin": " ,Ya-Sin",
      "As-Saffat": " ,Al-Saffat", "Sad": " ,Sad", "Az-Zumar": " ,Az-Zumar", "Ghafir": " ,Ghafir",
      "Fussilat": " ,Fussilat", "Ash-Shura": " ,Al-Shura", "Az-Zukhruf": " ,Az-Zukhruf",
      "Ad-Dukhan": " ,Al-Dukhan", "Al-Jathiya": " ,Al-Jathiya", "Al-Ahqaf": " ,Al-Ahqaf",
      "Muhammad": " ,Muhammad", "Al-Fath": " ,Al-Fath", "Al-Hujurat": " ,Al-Hujurat",
      "Qaf": " ,Qaf", "Ad-Dhariyat": " ,Ad-Dhariyat", "At-Tur": " ,At-Tur",
      "An-Najm": " ,An-Najm", "Al-Qamar": " ,Al-Qamar", "Ar-Rahman": " ,Ar-Rahman",
      "Al-Waqi'a": " ,Al-Waqi'a", "Al-Hadid": " ,Al-Hadid", "Al-Mujadila": " ,Al-Mujadila",
      "Al-Hashr": " ,Al-Hashr", "Al-Mumtahina": " ,Al-Mumtahina", "As-Saf": " ,As-Saf",
      "Al-Jumu'a": " ,Al-Jumu'a", "Al-Munafiqun": " ,Al-Munafiqun", "At-Taghabun": " ,At-Taghabun",
      "At-Talaq": " ,At-Talaq", "At-Tahrim": " ,At-Tahrim", "Al-Mulk": " ,Al-Mulk",
      "Al-Qalam": " ,Al-Qalam", "Al-Haqqah": " ,Al-Haqqah", "Al-Ma'arij": " ,Al-Ma'arij",
      "Nuh": " ,Nuh", "Al-Jinn": " ,Al-Jinn", "Al-Muzzammil": " ,Al-Muzzammil",
      "Al-Muddaththir": " ,Al-Muddaththir", "Al-Qiyamah": " ,Al-Qiyamah", "Al-Insan": " ,Al-Insan",
      "Al-Mursalat": " ,Al-Mursalat", "An-Naba": " ,An-Naba", "An-Nazi'at": " ,An-Nazi'at",
      "Abasa": " ,Abasa", "At-Takwir": " ,At-Takwir", "Al-Infitar": " ,Al-Infitar",
      "Al-Mutaffifin": " ,Al-Mutaffifin", "Al-Inshiqaq": " ,Al-Inshiqaq", "Al-Buruj": " ,Al-Buruj",
      "At-Tariq": " ,At-Tariq", "Al-A'la": " ,Al-A'la", "Al-Ghashiya": " ,Al-Ghashiya",
      "Al-Fajr": " ,Al-Fajr", "Al-Balad": " ,Al-Balad", "Ash-Shams": " ,Ash-Shams",
      "Al-Layl": " ,Al-Layl", "Ad-Duha": " ,Ad-Duha", "Ash-Sharh": " ,Ash-Sharh",
      "At-Tin": " ,At-Tin", "Al-Alaq": " ,Al-Alaq", "Al-Qadr": " ,Al-Qadr",
      "Al-Bayyina": " ,Al-Bayyina", "Az-Zalzalah": " ,Az-Zalzalah", "Al-Adiyat": " ,Al-Adiyat",
      "Al-Qari'a": " ,Al-Qari'a", "At-Takathur": " ,At-Takathur", "Al-Asr": " ,Al-Asr",
      "Al-Humaza": " ,Al-Humaza", "Al-Fil": " ,Al-Fil", "Quraysh": " ,Quraysh",
      "Al-Ma'un": " ,Al-Ma'un", "Al-Kawthar": " ,Al-Kawthar", "Al-Kafirun": " ,Al-Kafirun",
      "An-Nasr": " ,An-Nasr", "Al-Masad": " ,Al-Masad", "Al-Ikhlas": " ,Al-Ikhlas",
      "Al-Falaq": " ,Al-Falaq", "An-Nas": " ,An-Nas"
    };
    return arabicNames[item.englishName] || item.name;
  };

  const renderSurah = ({ item }: { item: Surah }) => {
    const isCurrentSurah = currentSurah === item.number;
    
    return (
      <Pressable
        style={({ pressed }) => [
          styles.surahItem,
          { backgroundColor: isDark ? "#1e293b" : "#ffffff", borderColor: isDark ? "#334155" : "#e2e8f0" },
          isCurrentSurah && { borderColor: "#1a4731", borderWidth: 2 },
          pressed && styles.pressed,
        ]}
        onPress={() => playSurah(item.number)}
      >
        <View style={[styles.surahNumber, { backgroundColor: isDark ? "#334155" : "#f1f5f9" }]}>
          <Text style={[styles.surahNumberText, { color: isDark ? "#f1f5f9" : "#1e293b" }]}>{item.number}</Text>
        </View>
        <View style={styles.surahInfo}>
          <Text style={[styles.surahName, { color: isDark ? "#f1f5f9" : "#1e293b" }]}>
            {getSurahNameArabic(item)}
          </Text>
          <Text style={[styles.surahMeta, { color: isDark ? "#94a3b8" : "#64748b" }]}>
            {item.numberOfAyahs} · {item.englishNameTranslation}
          </Text>
        </View>
        <View style={styles.playIndicator}>
          {isCurrentSurah && isPlaying ? (
            <Ionicons name="pause-circle" size={32} color="#1a4731" />
          ) : (
            <Ionicons name="play-circle" size={32} color={isDark ? "#64748b" : "#94a3b8"} />
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? "#0f172a" : "#f8fafc" }]} edges={["top"]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? "#1e293b" : "#ffffff", borderColor: isDark ? "#334155" : "#e2e8f0" }]}>
        <Pressable onPress={() => router.back()} style={styles.headerBtn}>
          <Ionicons name="arrow-forward" size={24} color={isDark ? "#f1f5f9" : "#1e293b"} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: isDark ? "#f1f5f9" : "#1e293b" }]}> listening to the Qur'an</Text>
        <Pressable onPress={stopPlayback} style={styles.headerBtn}>
          <Ionicons name="stop" size={24} color={isDark ? "#f1f5f9" : "#1e293b"} />
        </Pressable>
      </View>

      {/* Reciter Selection */}
      <View style={[styles.reciterSection, { backgroundColor: isDark ? "#1e293b" : "#ffffff", borderColor: isDark ? "#334155" : "#e2e8f0" }]}>
        <Text style={[styles.reciterLabel, { color: isDark ? "#94a3b8" : "#64748b" }]}> the reciter</Text>
        <FlatList
          horizontal
          data={reciters}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.reciterList}
          renderItem={({ item }) => (
            <Pressable
              style={[
                styles.reciterChip,
                { backgroundColor: isDark ? "#0f172a" : "#f1f5f9", borderColor: isDark ? "#334155" : "#e2e8f0" },
                selectedReciter.id === item.id && { backgroundColor: "#1a4731", borderColor: "#1a4731" }
              ]}
              onPress={() => {
                setSelectedReciter(item);
                if (currentSurah) {
                  playSurah(currentSurah);
                }
              }}
            >
              <Text 
                style={[
                  styles.reciterChipText, 
                  { color: isDark ? "#f1f5f9" : "#1e293b" },
                  selectedReciter.id === item.id && { color: "#ffffff" }
                ]}
              >
                {item.nameArabic}
              </Text>
            </Pressable>
          )}
        />
      </View>

      {/* Now Playing */}
      {currentSurah && (
        <View style={[styles.nowPlaying, { backgroundColor: isDark ? "#1e293b" : "#ffffff", borderColor: isDark ? "#334155" : "#e2e8f0" }]}>
          <View style={styles.nowPlayingInfo}>
            <Ionicons name="musical-notes" size={24} color="#1a4731" />
            <View style={styles.nowPlayingText}>
              <Text style={[styles.nowPlayingTitle, { color: isDark ? "#f1f5f9" : "#1e293b" }]}>
                {getSurahNameArabic(surahs.find(s => s.number === currentSurah) || surahs[0])}
              </Text>
              <Text style={[styles.nowPlayingSubtitle, { color: isDark ? "#94a3b8" : "#64748b" }]}>
                {selectedReciter.nameArabic}
              </Text>
            </View>
          </View>
          <View style={styles.nowPlayingControls}>
            <Pressable onPress={togglePlayPause} style={styles.controlBtn}>
              <Ionicons 
                name={isPlaying ? "pause" : "play"} 
                size={32} 
                color="#1a4731" 
              />
            </Pressable>
          </View>
        </View>
      )}

      {/* Surah List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: isDark ? "#94a3b8" : "#64748b" }]}>...loading</Text>
        </View>
      ) : (
        <FlatList
          data={surahs}
          renderItem={renderSurah}
          keyExtractor={(item) => item.number.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    padding: 12, 
    borderBottomWidth: 1 
  },
  headerBtn: { padding: 8, borderRadius: 12 },
  headerTitle: { 
    flex: 1, 
    fontSize: 18, 
    fontWeight: "bold", 
    textAlign: "center",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif"
  },
  reciterSection: { 
    padding: 16, 
    borderBottomWidth: 1 
  },
  reciterLabel: { 
    fontSize: 14, 
    fontWeight: "600", 
    marginBottom: 12 
  },
  reciterList: { gap: 8 },
  reciterChip: { 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 20, 
    borderWidth: 1,
    marginEnd: 8
  },
  reciterChipText: { 
    fontSize: 14, 
    fontWeight: "600" 
  },
  nowPlaying: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "space-between",
    padding: 16, 
    borderBottomWidth: 1,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
      android: { elevation: 3 }
    })
  },
  nowPlayingInfo: { flexDirection: "row", alignItems: "center", flex: 1 },
  nowPlayingText: { marginStart: 12, flex: 1 },
  nowPlayingTitle: { fontSize: 16, fontWeight: "bold" },
  nowPlayingSubtitle: { fontSize: 12, marginTop: 2 },
  nowPlayingControls: { flexDirection: "row", gap: 16 },
  controlBtn: { padding: 8 },
  list: { padding: 16 },
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
  playIndicator: { marginStart: 8 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { fontSize: 16 },
});
