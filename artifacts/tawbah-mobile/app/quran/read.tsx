import { useMemo, useRef, useState, useEffect, useCallback } from "react";
import { View, Text, Pressable, StyleSheet, Dimensions, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import * as Haptics from "expo-haptics";
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Gesture, GestureDetector, PanGestureHandler } from "react-native-gesture-handler";
import {
  ArrowRight,
  BookOpen,
  BookText,
  Eye,
  EyeOff,
  GraduationCap,
  Minus,
  Music,
  Pause,
  Play,
  Plus,
  X,
} from "lucide-react-native";
import { useAyahs, Ayah } from "@/hooks/useQuranData";
import { useQuranAudio } from "@/hooks/useQuranAudio";
import { useSettings } from "@/providers/SettingsProvider";
import { QuranAudioPlayer } from "@/components/quran/QuranAudioPlayer";

const PAGE_SIZE = 10;

const SHEET_MAX_HEIGHT = Math.min(620, Math.round(Dimensions.get("window").height * 0.78));
const SHEET_MIN_HEIGHT = 160;

export default function QuranReadScreen() {
  const router = useRouter();
  const { surah } = useLocalSearchParams<{ surah?: string }>();
  const surahNumber = parseInt(surah || "1", 10);
  
  const { resolvedTheme } = useSettings();
  const isDark = resolvedTheme === "dark";
  
  const { ayahs, loading, error } = useAyahs(surahNumber);
  const audio = useQuranAudio();

  // ALL HOOKS MUST BE DECLARED IN CONSISTENT ORDER
  // Refs first
  const tafsirCacheRef = useRef(new Map<string, { ar: string; en: string }>());
  const tajweedCacheRef = useRef(new Map<number, string>());
  
  // Shared values
  const sheetOpen = useSharedValue(0);
  const sheetDragY = useSharedValue(0);
  const sheetHeight = useSharedValue(SHEET_MIN_HEIGHT);

  const palette = useMemo(
    () => ({
      bg: isDark ? "#062e2a" : "#f8fafc",
      card: isDark ? "#052e25" : "#ffffff",
      card2: isDark ? "#022c22" : "#f1f5f9",
      border: isDark ? "#0b3b2f" : "#e2e8f0",
      text: isDark ? "#ecfdf5" : "#0f172a",
      muted: isDark ? "#a7f3d0" : "#64748b",
      gold: "#fbbf24",
      emerald: isDark ? "#22c55e" : "#064e3b",
      danger: "#ef4444",
    }),
    [isDark]
  );
  
  // Animated styles
  const overlayStyle = useAnimatedStyle(() => {
    const opacity = interpolate(sheetOpen.value, [0, 1], [0, 1]);
    return {
      opacity,
    };
  });

  const sheetStyle = useAnimatedStyle(() => {
    const h = sheetHeight.value;
    const translateY = Math.max(0, SHEET_MAX_HEIGHT - h) + sheetDragY.value;
    return {
      height: h,
      transform: [{ translateY }],
    };
  });

  // State after all hooks
  const [currentPage, setCurrentPage] = useState(0);
  const [fontSize, setFontSize] = useState(24);
  const [showPlayer, setShowPlayer] = useState(false);
  const [showTranslation, setShowTranslation] = useState(true);
  const [showTafsir, setShowTafsir] = useState(false);
  const [selectedAyah, setSelectedAyah] = useState<Ayah | null>(null);
  const [tafsirAr, setTafsirAr] = useState<string>("");
  const [tafsirEn, setTafsirEn] = useState<string>("");
  const [tafsirLoading, setTafsirLoading] = useState(false);
  const [tafsirError, setTafsirError] = useState<string | null>(null);
  const [hifzMode, setHifzMode] = useState(false);
  const [hiddenAyahs, setHiddenAyahs] = useState<Set<number>>(new Set());

  const totalPages = Math.ceil(ayahs.length / PAGE_SIZE);
  const paginatedAyahs = ayahs.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  const goToPage = useCallback((page: number) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const toggleAyahVisibility = (ayahNumber: number) => {
    setHiddenAyahs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ayahNumber)) {
        newSet.delete(ayahNumber);
      } else {
        newSet.add(ayahNumber);
      }
      return newSet;
    });
  };

  const showAllAyahs = () => setHiddenAyahs(new Set());
  const hideAllAyahs = () => {
    const allNumbers = new Set(ayahs.map(a => a.number));
    setHiddenAyahs(allNumbers);
  };

  const mushafFont = "Amiri_400Regular";
  const tafsirArabicFont = "IBMPlexSansArabic_400Regular";
  const tafsirArabicFontBold = "IBMPlexSansArabic_700Bold";
  const textFontLatin = Platform.OS === "ios" ? "System" : "sans-serif";

  const fetchTafsir = useCallback(async (ayahGlobalNumber: number) => {
    const cacheKey = String(ayahGlobalNumber);
    const cached = tafsirCacheRef.current.get(cacheKey);
    if (cached) {
      setTafsirAr(cached.ar);
      setTafsirEn(cached.en);
      setTafsirError(null);
      return;
    }

    setTafsirLoading(true);
    setTafsirError(null);
    try {
      const [arRes, enRes] = await Promise.all([
        fetch(`https://api.alquran.cloud/v1/ayah/${ayahGlobalNumber}/ar.muyassar`),
        fetch(`https://api.alquran.cloud/v1/ayah/${ayahGlobalNumber}/en.sahih`),
      ]);

      if (!arRes.ok || !enRes.ok) throw new Error("Failed to fetch tafsir");

      const arJson = (await arRes.json()) as { data?: { text?: string } };
      const enJson = (await enRes.json()) as { data?: { text?: string } };

      const arText = (arJson.data?.text || "").trim();
      const enText = (enJson.data?.text || "").trim();

      tafsirCacheRef.current.set(cacheKey, { ar: arText, en: enText });
      setTafsirAr(arText);
      setTafsirEn(enText);
    } catch (e) {
      setTafsirError(e instanceof Error ? e.message : "Unknown error");
      setTafsirAr("");
      setTafsirEn("");
    } finally {
      setTafsirLoading(false);
    }
  }, []);

  const fetchTajweedForSurah = useCallback(async () => {
    if (!surahNumber) return;
    if (tajweedCacheRef.current.size) return;
    try {
      const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/quran-tajweed`);
      if (!res.ok) return;
      const json = (await res.json()) as { data?: { ayahs?: { numberInSurah: number; text: string }[] } };
      const list = json.data?.ayahs || [];
      for (const a of list) {
        if (typeof a.numberInSurah === "number" && typeof a.text === "string") {
          tajweedCacheRef.current.set(a.numberInSurah, a.text);
        }
      }
    } catch {
    }
  }, [surahNumber]);

  useEffect(() => {
    fetchTajweedForSurah();
  }, [fetchTajweedForSurah]);

  type TajweedSpan = { text: string; color?: string };

  const tajweedColors = useMemo(() => {
    const orange = "#f59e0b";
    const green = "#22c55e";
    const blue = "#3b82f6";
    const red = "#ef4444";
    const gray = isDark ? "#94a3b8" : "#64748b";

    return {
      h: orange,
      n: green,
      l: green,
      p: blue,
      m: red,
      q: gray,
    } as Record<string, string>;
  }, [isDark]);

  const tajweedColorForTag = useCallback((tag?: string) => {
    if (!tag) return undefined;
    return tajweedColors[tag] || (isDark ? "#94a3b8" : "#64748b");
  }, [isDark, tajweedColors]);

  const parseTajweedMarkup = useCallback((input: string): TajweedSpan[] => {
    const spans: TajweedSpan[] = [];
    let i = 0;
    let buffer = "";

    const flush = () => {
      if (buffer) {
        spans.push({ text: buffer });
        buffer = "";
      }
    };

    while (i < input.length) {
      const ch = input[i];
      if (ch !== "[") {
        buffer += ch;
        i += 1;
        continue;
      }

      const j = input.indexOf("[", i + 1);
      if (j === -1) {
        buffer += ch;
        i += 1;
        continue;
      }

      const header = input.slice(i + 1, j);
      const k = input.indexOf("]", j + 1);
      if (k === -1) {
        buffer += ch;
        i += 1;
        continue;
      }

      const content = input.slice(j + 1, k);
      flush();

      const tag = header.split(":")[0]?.trim();
      const color = tajweedColorForTag(tag);
      spans.push({ text: content, color });

      i = k + 1;
    }

    flush();
    return spans;
  }, [tajweedColorForTag]);

  const openTafsir = useCallback((ayah: Ayah) => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync();
    }
    setSelectedAyah(ayah);
    setShowTafsir(true);
    setTafsirAr("");
    setTafsirEn("");
    setTafsirError(null);
    sheetHeight.value = withTiming(SHEET_MAX_HEIGHT, { duration: 260, easing: Easing.out(Easing.cubic) });
    sheetOpen.value = withTiming(1, { duration: 220, easing: Easing.out(Easing.quad) });
    fetchTafsir(ayah.number);
  }, [fetchTafsir, sheetHeight, sheetOpen]);

  const closeTafsir = useCallback(() => {
    sheetHeight.value = withTiming(SHEET_MIN_HEIGHT, { duration: 220, easing: Easing.out(Easing.quad) });
    sheetOpen.value = withTiming(0, { duration: 180, easing: Easing.out(Easing.quad) }, (f) => {
      if (f) {
        runOnJS(setShowTafsir)(false);
        runOnJS(setSelectedAyah)(null);
      }
    });
  }, [sheetHeight, sheetOpen]);

  const playAyah = useCallback((ayah: Ayah) => {
    // Use Islamic Network CDN which supports CORS for web
    const audioUrl = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayah.number}.mp3`;
    audio.play(surahNumber, ayah.number, audioUrl);
    setShowPlayer(true);
  }, [audio, surahNumber]);

  useEffect(() => {
    if (audio.currentAyah && audio.isPlaying) {
      const targetAyah = audio.currentAyah;
      const targetPage = Math.floor((targetAyah - 1) / PAGE_SIZE);
      if (targetPage !== currentPage && targetPage >= 0 && targetPage < totalPages) {
        setCurrentPage(targetPage);
      }
    }
  }, [audio.currentAyah, audio.isPlaying]);

  const getSurahName = () => {
    if (!ayahs.length) return "...جاري التحميل";
    const surahNames: Record<number, string> = {
      1: "الفاتحة", 2: "البقرة", 3: "آل عمران", 4: "النساء", 5: "المائدة",
      6: "الأنعام", 7: "الأعراف", 8: "الأنفال", 9: "التوبة", 10: "يونس",
      11: "هود", 12: "يوسف", 13: "الرعد", 14: "ابراهيم", 15: "الحجر",
      16: "النحل", 17: "الإسراء", 18: "الكهف", 19: "مريم", 20: "طه",
      21: "الأنبياء", 22: "الحج", 23: "المؤمنون", 24: "النور", 25: "الفرقان",
      26: "الشعراء", 27: "النمل", 28: "القصص", 29: "العنكبوت", 30: "الروم",
      31: "لقمان", 32: "السجدة", 33: "الأحزاب", 34: "سبأ", 35: "فاطر",
      36: "يس", 37: "الصافات", 38: "ص", 39: "الزمر", 40: "غافر",
      41: "فصلت", 42: "الشورى", 43: "الزخرف", 44: "الدخان", 45: "الجاثية",
      46: "الأحقاف", 47: "محمد", 48: "الفتح", 49: "الحجرات", 50: "ق",
      51: "الذاريات", 52: "الطور", 53: "النجم", 54: "القمر", 55: "الرحمن",
      56: "الواقعة", 57: "الحديد", 58: "المجادلة", 59: "الحشر", 60: "الممتحنة",
      61: "الصفة", 62: "الجمعة", 63: "المنافقون", 64: "التغابن", 65: "الطلاق",
      66: "التحريم", 67: "الملك", 68: "القلم", 69: "الحاقة", 70: "المعارج",
      71: "نوح", 72: "الجن", 73: "المزمل", 74: "المدثر", 75: "القيامة",
      76: "الإنسان", 77: "المرسلات", 78: "النبأ", 79: "النازعات", 80: "عبس",
      81: "التكوير", 82: "الانفطار", 83: "المطففين", 84: "الانشقاق", 85: "البروج",
      86: "الطارق", 87: "الأعلى", 88: "الغاشية", 89: "الفجر", 90: "البلد",
      91: "الشمس", 92: "الليل", 93: "الضحى", 94: "الشرح", 95: "التين",
      96: "العلق", 97: "القدر", 98: "البينة", 99: "الزلزلة", 100: "العاديات",
      101: "القارعة", 102: "التكاثر", 103: "العصر", 104: "الهمزة", 105: "الفيل",
      106: "قريش", 107: "الماعون", 108: "الكوثر", 109: "الكافرون", 110: "النصر",
      111: "المسد", 112: "الإخلاص", 113: "الفلق", 114: "الناس"
    };
    return surahNames[surahNumber] || `سورة ${surahNumber}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: palette.bg }]}>
        <View style={styles.loadingContainer}>
          <BookText size={48} color={palette.muted} />
          <Text style={[styles.loadingText, { color: palette.text, marginTop: 16 }]}>...جاري التحميل</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !ayahs.length) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: palette.bg }]}>
        <View style={styles.errorContainer}>
          <X size={48} color={palette.danger} />
          <Text style={[styles.errorText, { color: palette.danger, marginTop: 16 }]}>{error || "لا توجد بيانات"}</Text>
          <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: palette.card2, borderColor: palette.border }]}>
            <ArrowRight size={20} color={palette.text} />
            <Text style={[styles.backBtnText, { color: palette.text, marginRight: 8 }]}>رجوع</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const renderAyah = ({ item, index }: { item: Ayah; index: number }) => {
    const isPlaying = audio.isPlaying && audio.currentAyah === item.number;
    const tajweedText = tajweedCacheRef.current.get(item.numberInSurah);
    const spans = tajweedText ? parseTajweedMarkup(tajweedText) : null;

    return (
      <Pressable
        style={({ pressed }) => [
          styles.ayahContainer,
          { backgroundColor: palette.card, borderColor: palette.border },
          isPlaying && { backgroundColor: isDark ? "#064e3b" : "#ecfdf5", borderColor: palette.gold },
          pressed && styles.pressed,
        ]}
        onPress={() => playAyah(item)}
      >
        <View style={[styles.ayahNumber, { backgroundColor: palette.card2, borderColor: palette.border }]}>
          <Text style={[styles.ayahNumberText, { color: palette.text }]}>{item.numberInSurah}</Text>
        </View>
        <View style={styles.ayahContent}>
          {hifzMode && hiddenAyahs.has(item.number) ? (
            <Pressable onPress={() => toggleAyahVisibility(item.number)} style={styles.hiddenAyah}>
              <EyeOff size={24} color={palette.muted} />
              <Text style={[styles.hiddenText, { color: palette.muted }]}>اضغط لإظهار الآية</Text>
            </Pressable>
          ) : (
            <>
              {spans ? (
                <Text
                  style={[
                    styles.ayahText,
                    {
                      color: palette.text,
                      fontSize,
                      textAlign: "right",
                      fontFamily: mushafFont,
                    },
                  ]}
                >
                  {spans.map((s, idx2) => (
                    <Text
                      key={`${item.number}-tj-${idx2}`}
                      style={{ color: s.color || palette.text, fontFamily: mushafFont }}
                    >
                      {s.text}
                    </Text>
                  ))}
                </Text>
              ) : (
                <Text
                  style={[
                    styles.ayahText,
                    { color: palette.text, fontSize, textAlign: "right", fontFamily: mushafFont },
                  ]}
                >
                  {item.text}
                </Text>
              )}
              {showTranslation && (
                <Text style={[styles.ayahTranslation, { color: palette.muted, fontSize: fontSize - 8 }]}>
                  {item.translation}
                </Text>
              )}
            </>
          )}
        </View>
        <View style={styles.ayahActions}>
          {hifzMode && (
            <Pressable style={styles.actionBtn} onPress={() => toggleAyahVisibility(item.number)}>
              {hiddenAyahs.has(item.number) ? (
                <EyeOff size={18} color={palette.muted} />
              ) : (
                <Eye size={18} color={palette.muted} />
              )}
            </Pressable>
          )}
          <Pressable style={styles.actionBtn} onPress={() => openTafsir(item)}>
            <BookOpen size={18} color={palette.muted} />
          </Pressable>
          <Pressable style={styles.playBtn} onPress={() => playAyah(item)}>
            {isPlaying ? (
              <Pause size={20} color={palette.emerald} />
            ) : (
              <Play size={20} color={palette.emerald} />
            )}
          </Pressable>
        </View>
      </Pressable>
    );
  };

  const sheetGesture = Gesture.Pan()
    .onUpdate((evt) => {
      sheetDragY.value = evt.translationY;
    })
    .onEnd((evt) => {
      const dy = evt.translationY;
      const vy = evt.velocityY;
      sheetDragY.value = 0;

      const nextHeight = sheetHeight.value - dy;
      const shouldClose = nextHeight < (SHEET_MAX_HEIGHT * 0.6) || vy > 1200;
      if (shouldClose) {
        runOnJS(closeTafsir)();
        return;
      }

      sheetHeight.value = withSpring(SHEET_MAX_HEIGHT, { damping: 18, stiffness: 180 });
    });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: palette.bg }]} edges={["top"]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: palette.card, borderColor: palette.border }]}>
        <Pressable onPress={() => router.back()} style={styles.headerBtn}>
          <ArrowRight size={22} color={palette.text} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: palette.text }]}>{getSurahName()}</Text>
          <Text style={[styles.headerSubtitle, { color: palette.muted }]}>
            {currentPage + 1} من {totalPages}
          </Text>
        </View>
        <Pressable
          onPress={() => {
            setHifzMode((prev) => {
              const next = !prev;
              if (next) {
                setShowTranslation(false);
                setHiddenAyahs(new Set(ayahs.map((a) => a.number)));
              } else {
                setShowTranslation(true);
                setHiddenAyahs(new Set());
              }
              return next;
            });
          }}
          style={styles.headerBtn}
        >
          {hifzMode ? <EyeOff size={22} color={palette.gold} /> : <Eye size={22} color={palette.text} />}
        </Pressable>
        <Pressable onPress={() => setShowPlayer(!showPlayer)} style={styles.headerBtn}>
          <Music size={22} color={palette.emerald} />
        </Pressable>
      </View>

      {/* Ayah List */}
      <FlashList
        data={paginatedAyahs}
        renderItem={renderAyah}
        keyExtractor={(item) => item.number.toString()}
        contentContainerStyle={styles.ayahList}
        showsVerticalScrollIndicator={false}
      />

      {/* Bottom Controls */}
      <View style={[styles.bottomControls, { backgroundColor: palette.card, borderColor: palette.border }]}>
        {/* Page Navigation */}
        <View style={styles.pageControls}>
          <Pressable 
            onPress={() => goToPage(currentPage - 1)} 
            disabled={currentPage === 0}
            style={[styles.pageBtn, currentPage === 0 && styles.disabledBtn]}
          >
            <Text style={[styles.pageBtnText, { color: palette.text, marginRight: 4 }]}>السابق</Text>
            <ArrowRight size={18} color={palette.text} />
          </Pressable>
          <View style={styles.pageIndicator}>
            <Text style={[styles.pageIndicatorText, { color: palette.muted }]}
            >
              {currentPage + 1} / {totalPages}
            </Text>
          </View>
          <Pressable 
            onPress={() => goToPage(currentPage + 1)} 
            disabled={currentPage >= totalPages - 1}
            style={[styles.pageBtn, currentPage >= totalPages - 1 && styles.disabledBtn]}
          >
            <Text style={[styles.pageBtnText, { color: palette.text, marginLeft: 4 }]}>التالي</Text>
            <ArrowRight size={18} color={palette.text} style={{ transform: [{ scaleX: -1 }] }} />
          </Pressable>
        </View>

        {/* Controls Row */}
        <View style={styles.controlsRow}>
          {/* Font Size */}
          <View style={styles.fontControls}>
            <Pressable onPress={() => setFontSize(Math.max(18, fontSize - 2))} style={styles.fontBtn}>
              <Minus size={16} color={palette.text} />
            </Pressable>
            <Text style={[styles.fontSizeText, { color: palette.muted }]}>{fontSize}</Text>
            <Pressable onPress={() => setFontSize(Math.min(40, fontSize + 2))} style={styles.fontBtn}>
              <Plus size={16} color={palette.text} />
            </Pressable>
          </View>
          {/* Hifz Mode Controls */}
          {hifzMode && (
            <View style={styles.hifzControls}>
              <Pressable 
                onPress={showAllAyahs} 
                style={[styles.hifzBtn, { backgroundColor: palette.card2, borderColor: palette.border }]}
              >
                <Eye size={16} color={palette.text} />
                <Text style={[styles.hifzBtnText, { color: palette.text }]}>إظهار الكل</Text>
              </Pressable>
              <Pressable 
                onPress={hideAllAyahs} 
                style={[styles.hifzBtn, { backgroundColor: palette.card2, borderColor: palette.border }]}
              >
                <EyeOff size={16} color={palette.text} />
                <Text style={[styles.hifzBtnText, { color: palette.text }]}>إخفاء الكل</Text>
              </Pressable>
            </View>
          )}
          {/* Translation Toggle */}
          {!hifzMode && (
            <Pressable
              onPress={() => setShowTranslation(!showTranslation)}
              style={[styles.toggleBtn, { backgroundColor: palette.card2, borderColor: palette.border }]}
            >
              <BookText size={18} color={palette.text} />
              <Text style={[styles.toggleText, { color: palette.text }]}>
                {showTranslation ? "إخفاء الترجمة" : "إظهار الترجمة"}
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Audio Player Sheet */}
      <QuranAudioPlayer 
        surahName={getSurahName()} 
        visible={showPlayer} 
        onClose={() => setShowPlayer(false)} 
      />

      {/* Tafsir Bottom Sheet */}
      {showTafsir && selectedAyah && (
        <Animated.View style={[styles.tafsirOverlay, overlayStyle]}>
          <Pressable style={styles.tafsirBackdrop} onPress={closeTafsir} />

          <GestureDetector gesture={sheetGesture}>
            <Animated.View
              style={[
                styles.tafsirSheet,
                sheetStyle,
                {
                  backgroundColor: palette.card,
                  borderColor: palette.border,
                },
              ]}
            >
              <View style={[styles.tafsirHandle, { backgroundColor: isDark ? "#0b3b2f" : "#cbd5e1" }]} />

              <View style={styles.tafsirHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.tafsirTitle, { color: palette.text, textAlign: "right" }]}>
                    التفسير
                  </Text>
                  <Text style={[styles.tafsirSub, { color: palette.muted, textAlign: "right" }]}>
                    آية {selectedAyah.numberInSurah}
                  </Text>
                </View>
                <Pressable onPress={closeTafsir} style={styles.tafsirCloseBtn}>
                  <X size={18} color={palette.text} />
                </Pressable>
              </View>

              <View style={[styles.tafsirAyahPreview, { backgroundColor: palette.card2, borderColor: palette.border }]}>
                <Text style={[styles.tafsirAyahText, { color: palette.text, textAlign: "right" }]}>
                  {selectedAyah.text}
                </Text>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.tafsirScrollContent}
              >
                {tafsirLoading ? (
                  <Text style={[styles.tafsirText, { color: palette.muted, textAlign: "right", fontFamily: tafsirArabicFont }]}>
                    ...جاري تحميل التفسير
                  </Text>
                ) : tafsirError ? (
                  <Text style={[styles.tafsirText, { color: palette.danger, textAlign: "right", fontFamily: tafsirArabicFont }]}>
                    {tafsirError}
                  </Text>
                ) : (
                  <View style={{ gap: 14 }}>
                    <View style={[styles.tajweedLegend, { backgroundColor: palette.card2, borderColor: palette.border }]}
                    >
                      <Text style={[styles.tajweedLegendTitle, { color: palette.text, textAlign: "right", fontFamily: tafsirArabicFontBold }]}>دليل ألوان التجويد</Text>
                      <View style={styles.tajweedLegendGrid}>
                        <View style={styles.tajweedLegendItem}>
                          <View style={[styles.tajweedDot, { backgroundColor: tajweedColors.m }]} />
                          <Text style={[styles.tajweedLegendText, { color: palette.text, fontFamily: tafsirArabicFontBold }]}>أحمر</Text>
                          <Text style={[styles.tajweedLegendSub, { color: palette.muted, fontFamily: tafsirArabicFont }]}>غنة / إدغام</Text>
                        </View>

                        <View style={styles.tajweedLegendItem}>
                          <View style={[styles.tajweedDot, { backgroundColor: tajweedColors.n }]} />
                          <Text style={[styles.tajweedLegendText, { color: palette.text, fontFamily: tafsirArabicFontBold }]}>أخضر</Text>
                          <Text style={[styles.tajweedLegendSub, { color: palette.muted, fontFamily: tafsirArabicFont }]}>نون / مد</Text>
                        </View>

                        <View style={styles.tajweedLegendItem}>
                          <View style={[styles.tajweedDot, { backgroundColor: tajweedColors.p }]} />
                          <Text style={[styles.tajweedLegendText, { color: palette.text, fontFamily: tafsirArabicFontBold }]}>أزرق</Text>
                          <Text style={[styles.tajweedLegendSub, { color: palette.muted, fontFamily: tafsirArabicFont }]}>قلقلة / تفخيم</Text>
                        </View>

                        <View style={styles.tajweedLegendItem}>
                          <View style={[styles.tajweedDot, { backgroundColor: tajweedColors.h }]} />
                          <Text style={[styles.tajweedLegendText, { color: palette.text, fontFamily: tafsirArabicFontBold }]}>برتقالي</Text>
                          <Text style={[styles.tajweedLegendSub, { color: palette.muted, fontFamily: tafsirArabicFont }]}>همزة وصل</Text>
                        </View>

                        <View style={styles.tajweedLegendItem}>
                          <View style={[styles.tajweedDot, { backgroundColor: tajweedColors.q }]} />
                          <Text style={[styles.tajweedLegendText, { color: palette.text, fontFamily: tafsirArabicFontBold }]}>رمادي</Text>
                          <Text style={[styles.tajweedLegendSub, { color: palette.muted, fontFamily: tafsirArabicFont }]}>علامات / سكت</Text>
                        </View>
                      </View>
                      <Text style={[styles.tajweedLegendHint, { color: palette.muted, textAlign: "right", fontFamily: tafsirArabicFont }]}>ملاحظة: بعض العلامات تُعرض بلون رمادي كتنبيه بصري فقط.</Text>
                    </View>

                    <View style={[styles.tafsirSection, { backgroundColor: palette.card2, borderColor: palette.border }]}
                      >
                      <Text style={[styles.tafsirSectionTitle, { color: palette.gold, textAlign: "right", fontFamily: tafsirArabicFontBold }]}>التفسير (الميسر)</Text>
                      <Text style={[styles.tafsirText, { color: palette.text, textAlign: "right", fontFamily: tafsirArabicFont }]}>
                        {tafsirAr}
                      </Text>
                    </View>

                    <View style={[styles.tafsirSection, { backgroundColor: palette.card2, borderColor: palette.border }]}>
                      <Text style={[styles.tafsirSectionTitle, { color: palette.gold, textAlign: "left", fontFamily: textFontLatin }]}>Tafsir (Saheeh International)</Text>
                      <Text style={[styles.tafsirText, { color: palette.muted, textAlign: "left", fontFamily: textFontLatin }]}>
                        {tafsirEn}
                      </Text>
                    </View>
                  </View>
                )}
              </ScrollView>
            </Animated.View>
          </GestureDetector>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", padding: 12, borderBottomWidth: 1 },
  headerBtn: { padding: 8, borderRadius: 12, backgroundColor: "transparent" },
  headerBtnText: { fontSize: 24, fontWeight: "bold" },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { fontSize: 18, fontWeight: "bold", fontFamily: Platform.OS === "ios" ? "Georgia" : "serif" },
  headerSubtitle: { fontSize: 12, marginTop: 2 },
  ayahList: { padding: 16, paddingBottom: 200 },
  ayahContainer: { 
    flexDirection: "row", 
    marginBottom: 20, 
    padding: 16, 
    borderRadius: 20,
    borderWidth: 1,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
      android: { elevation: 3 }
    }),
    backgroundColor: "#ffffff",
  },
  pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  ayahNumber: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", marginEnd: 14, borderWidth: 1 },
  ayahNumberText: { fontSize: 14, fontWeight: "bold" },
  ayahContent: { flex: 1 },
  ayahText: { lineHeight: 48, textAlign: "right", fontFamily: Platform.OS === "ios" ? "Georgia" : "serif" },
  ayahTranslation: { marginTop: 12, lineHeight: 28, textAlign: "right" },
  playBtn: { padding: 8, marginStart: 8, alignSelf: "center" },
  bottomControls: { 
    position: "absolute", 
    bottom: 0, 
    start: 0, 
    end: 0, 
    padding: 16, 
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopRightRadius: 24,
    borderTopLeftRadius: 24,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 12 },
      android: { elevation: 8 }
    })
  },
  pageControls: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  pageBtn: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12, borderRadius: 16, backgroundColor: "transparent", borderWidth: 1, borderColor: "rgba(148,163,184,0.25)" },
  disabledBtn: { opacity: 0.4 },
  pageBtnText: { color: "#ffffff", fontWeight: "600", fontSize: 14 },
  pageIndicator: { paddingHorizontal: 16 },
  pageIndicatorText: { fontSize: 14, fontWeight: "600" },
  controlsRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  fontControls: { flexDirection: "row", alignItems: "center", gap: 16 },
  fontBtn: { padding: 10, minWidth: 44, backgroundColor: "transparent", borderRadius: 12, borderWidth: 1, borderColor: "rgba(148,163,184,0.25)", alignItems: "center", justifyContent: "center" },
  fontBtnText: { fontSize: 16, fontWeight: "bold", color: "#ffffff" },
  fontSizeText: { fontSize: 14, minWidth: 30, textAlign: "center", fontWeight: "600" },
  toggleBtn: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, gap: 6, borderWidth: 1 },
  toggleText: { fontSize: 13, fontWeight: "600" },
  hiddenAyah: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 20, gap: 8 },
  hiddenText: { fontSize: 14, fontWeight: "600" },
  ayahActions: { flexDirection: "row", alignItems: "center", gap: 4 },
  actionBtn: { padding: 6 },
  hifzControls: { flexDirection: "row", gap: 8 },
  hifzBtn: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, gap: 6, borderWidth: 1 },
  hifzBtnText: { fontSize: 12, fontWeight: "600" },
  tafsirOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: "flex-end", zIndex: 1000 },
  tafsirBackdrop: { ...StyleSheet.absoluteFillObject },
  tafsirSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    padding: 18,
    paddingBottom: 40,
    overflow: "hidden",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: -6 }, shadowOpacity: 0.16, shadowRadius: 16 },
      android: { elevation: 14 },
    }),
  },
  tafsirHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: "center", marginBottom: 16 },
  tafsirHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14, gap: 10 },
  tafsirTitle: { fontSize: 18, fontWeight: "800" },
  tafsirSub: { fontSize: 12, marginTop: 3 },
  tafsirCloseBtn: { padding: 10, borderRadius: 16 },
  tafsirAyahPreview: { borderRadius: 20, borderWidth: 1, padding: 14, marginBottom: 12 },
  tafsirAyahText: { fontSize: 18, lineHeight: 32, fontFamily: Platform.OS === "ios" ? "Georgia" : "serif" },
  tafsirScrollContent: { paddingBottom: 36 },
  tafsirSection: { borderRadius: 20, borderWidth: 1, padding: 14 },
  tajweedLegend: { borderRadius: 20, borderWidth: 1, padding: 14 },
  tajweedLegendTitle: { fontSize: 14, fontWeight: "800", marginBottom: 10 },
  tajweedLegendGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  tajweedLegendItem: { flexDirection: "row", alignItems: "center", gap: 8, minWidth: "45%" },
  tajweedDot: { width: 10, height: 10, borderRadius: 999 },
  tajweedLegendText: { fontSize: 12, fontWeight: "600" },
  tajweedLegendSub: { fontSize: 11, marginStart: 2 },
  tajweedLegendHint: { fontSize: 11, marginTop: 10, lineHeight: 18 },
  tafsirSectionTitle: { fontSize: 13, fontWeight: "800", marginBottom: 8 },
  tafsirText: { fontSize: 14, lineHeight: 24, fontFamily: Platform.OS === "ios" ? "Georgia" : "serif" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { fontSize: 16 },
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 14 },
  backBtn: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 16, marginTop: 16, borderWidth: 1 },
  backBtnText: { fontWeight: "600" },
});
