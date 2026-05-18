import { useState, useEffect, useCallback, useRef } from "react";
import {
  View, Text, Pressable, StyleSheet, Dimensions, Image,
  StatusBar, Modal, FlatList, TextInput, ActivityIndicator,
  Platform, ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
  runOnJS, interpolate,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/useColors";
import {
  ChevronLeft, ChevronRight, List, Bookmark, BookmarkCheck,
  X, Search, ChevronsUpDown, ZoomIn, ZoomOut,
} from "lucide-react-native";

// ─── Constants ────────────────────────────────────────────────────────────────

const { width: SW, height: SH } = Dimensions.get("window");
const TOTAL_PAGES = 604;

const SURAH_START_PAGES: number[] = [
  1,2,50,77,106,128,151,177,187,208,221,235,249,255,262,267,282,293,305,312,
  322,333,342,350,359,367,377,385,396,404,411,415,418,428,434,440,446,453,458,467,
  477,483,489,496,499,502,507,511,515,518,520,523,526,528,531,534,537,542,545,549,
  551,553,554,556,558,560,562,564,566,568,570,572,574,575,577,578,580,582,583,585,
  586,587,587,589,590,591,591,592,593,594,595,595,596,596,597,597,598,598,599,599,
  600,600,601,601,601,602,602,602,603,603,603,604,604,604,
];

const SURAH_NAMES: string[] = [
  "الفاتحة","البقرة","آل عمران","النساء","المائدة","الأنعام","الأعراف","الأنفال","التوبة","يونس",
  "هود","يوسف","الرعد","إبراهيم","الحجر","النحل","الإسراء","الكهف","مريم","طه",
  "الأنبياء","الحج","المؤمنون","النور","الفرقان","الشعراء","النمل","القصص","العنكبوت","الروم",
  "لقمان","السجدة","الأحزاب","سبأ","فاطر","يس","الصافات","ص","الزمر","غافر",
  "فصلت","الشورى","الزخرف","الدخان","الجاثية","الأحقاف","محمد","الفتح","الحجرات","ق",
  "الذاريات","الطور","النجم","القمر","الرحمن","الواقعة","الحديد","المجادلة","الحشر","الممتحنة",
  "الصف","الجمعة","المنافقون","التغابن","الطلاق","التحريم","الملك","القلم","الحاقة","المعارج",
  "نوح","الجن","المزمل","المدثر","القيامة","الإنسان","المرسلات","النبأ","النازعات","عبس",
  "التكوير","الانفطار","المطففين","الانشقاق","البروج","الطارق","الأعلى","الغاشية","الفجر","البلد",
  "الشمس","الليل","الضحى","الشرح","التين","العلق","القدر","البينة","الزلزلة","العاديات",
  "القارعة","التكاثر","العصر","الهمزة","الفيل","قريش","الماعون","الكوثر","الكافرون","النصر",
  "المسد","الإخلاص","الفلق","الناس",
];

const JUZ_START_PAGES: number[] = [
  1,22,42,62,82,102,121,142,162,182,
  201,222,242,262,282,302,322,342,362,382,
  402,422,442,462,482,502,522,542,562,582,
];

function pageImageUrl(page: number): string {
  return `https://quran.ksu.edu.sa/tafseer/hafs/page${String(page).padStart(3, "0")}.png`;
}

function getSurahForPage(page: number): string {
  let name = SURAH_NAMES[0]!;
  for (let i = 0; i < SURAH_START_PAGES.length; i++) {
    if (page >= SURAH_START_PAGES[i]!) name = SURAH_NAMES[i]!;
    else break;
  }
  return name;
}

function getJuzForPage(page: number): number {
  let juz = 1;
  for (let i = 0; i < JUZ_START_PAGES.length; i++) {
    if (page >= JUZ_START_PAGES[i]!) juz = i + 1;
    else break;
  }
  return juz;
}

// ─── Bookmark helpers (AsyncStorage) ─────────────────────────────────────────

const BM_KEY = "quran_mushaf_bookmarks";

interface MushafBookmark {
  page: number;
  surah: string;
  juz: number;
  savedAt: string;
}

async function getBookmarks(): Promise<MushafBookmark[]> {
  try {
    const raw = await AsyncStorage.getItem(BM_KEY);
    return raw ? (JSON.parse(raw) as MushafBookmark[]) : [];
  } catch { return []; }
}

async function togglePageBookmark(page: number): Promise<boolean> {
  const list = await getBookmarks();
  const idx = list.findIndex(b => b.page === page);
  if (idx >= 0) {
    list.splice(idx, 1);
    await AsyncStorage.setItem(BM_KEY, JSON.stringify(list));
    return false;
  } else {
    list.unshift({ page, surah: getSurahForPage(page), juz: getJuzForPage(page), savedAt: new Date().toISOString() });
    await AsyncStorage.setItem(BM_KEY, JSON.stringify(list));
    return true;
  }
}

// ─── Surah Picker Modal ───────────────────────────────────────────────────────

function SurahPickerModal({ visible, onSelect, onClose, isDark }: {
  visible: boolean; onSelect: (page: number) => void; onClose: () => void; isDark: boolean;
}) {
  const [search, setSearch] = useState("");
  const bg = isDark ? "#111" : "#fff";
  const textColor = isDark ? "#ecfdf5" : "#0f172a";
  const mutedColor = isDark ? "#6b7280" : "#94a3b8";
  const borderColor = isDark ? "#1f2937" : "#e2e8f0";
  const goldColor = "#c8a84b";

  const filtered = SURAH_NAMES.map((name, i) => ({
    id: i + 1, name, page: SURAH_START_PAGES[i]!,
  })).filter(s => !search || s.name.includes(search) || String(s.id).includes(search));

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.6)" }}>
        <View style={{ backgroundColor: bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: SH * 0.82 }}>
          <View style={{ alignItems: "center", paddingTop: 12, paddingBottom: 4 }}>
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: mutedColor + "44" }} />
          </View>
          <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <Pressable onPress={onClose} style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: borderColor, alignItems: "center", justifyContent: "center" }}>
                <X size={16} color={textColor} />
              </Pressable>
              <Text style={{ fontSize: 16, fontWeight: "700", color: textColor }}>اختر سورة</Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: isDark ? "#1a1a1a" : "#f1f5f9", borderRadius: 12, paddingHorizontal: 12, gap: 8 }}>
              <Search size={14} color={mutedColor} />
              <TextInput
                value={search} onChangeText={setSearch}
                placeholder="ابحث عن سورة..." placeholderTextColor={mutedColor}
                style={{ flex: 1, height: 40, fontSize: 14, color: textColor, textAlign: "right" }}
              />
            </View>
          </View>
          <FlatList
            data={filtered}
            keyExtractor={i => String(i.id)}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 32 }}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => { onSelect(item.page); onClose(); }}
                style={{ flex: 1, margin: 4, flexDirection: "row-reverse", alignItems: "center", gap: 8, padding: 10,
                  borderRadius: 12, backgroundColor: isDark ? "#1a1a1a" : "#f8fafc",
                  borderWidth: 1, borderColor: borderColor }}>
                <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: goldColor + "22", alignItems: "center", justifyContent: "center" }}>
                  <Text style={{ fontSize: 10, fontWeight: "700", color: goldColor }}>{item.id}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, fontWeight: "600", color: textColor, textAlign: "right" }}>{item.name}</Text>
                  <Text style={{ fontSize: 9, color: mutedColor, textAlign: "right" }}>ص {item.page}</Text>
                </View>
              </Pressable>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

// ─── Juz Picker Modal ─────────────────────────────────────────────────────────

function JuzPickerModal({ visible, onSelect, onClose, currentJuz, isDark }: {
  visible: boolean; onSelect: (page: number) => void; onClose: () => void; currentJuz: number; isDark: boolean;
}) {
  const bg = isDark ? "#111" : "#fff";
  const textColor = isDark ? "#ecfdf5" : "#0f172a";
  const mutedColor = isDark ? "#6b7280" : "#94a3b8";
  const goldColor = "#c8a84b";

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.6)" }}>
        <View style={{ backgroundColor: bg, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: SH * 0.7 }}>
          <View style={{ alignItems: "center", paddingTop: 12, paddingBottom: 4 }}>
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: mutedColor + "44" }} />
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingBottom: 12 }}>
            <Pressable onPress={onClose} style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: isDark ? "#1f2937" : "#f1f5f9", alignItems: "center", justifyContent: "center" }}>
              <X size={16} color={textColor} />
            </Pressable>
            <Text style={{ fontSize: 16, fontWeight: "700", color: textColor }}>الأجزاء الثلاثون</Text>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 32 }}>
            <View style={{ flexDirection: "row-reverse", flexWrap: "wrap", gap: 8 }}>
              {JUZ_START_PAGES.map((page, i) => {
                const juz = i + 1;
                const isActive = juz === currentJuz;
                return (
                  <Pressable
                    key={juz}
                    onPress={() => { onSelect(page); onClose(); }}
                    style={{ width: (SW - 56) / 5, aspectRatio: 1, borderRadius: 12, alignItems: "center", justifyContent: "center",
                      backgroundColor: isActive ? goldColor + "22" : (isDark ? "#1a1a1a" : "#f8fafc"),
                      borderWidth: 1, borderColor: isActive ? goldColor + "88" : (isDark ? "#1f2937" : "#e2e8f0") }}>
                    <Text style={{ fontSize: 18, fontWeight: "700", color: isActive ? goldColor : textColor }}>{juz}</Text>
                    <Text style={{ fontSize: 9, color: mutedColor }}>ص {page}</Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─── Page Jump Modal ──────────────────────────────────────────────────────────

function PageJumpModal({ visible, current, onSelect, onClose, isDark }: {
  visible: boolean; current: number; onSelect: (page: number) => void; onClose: () => void; isDark: boolean;
}) {
  const [val, setVal] = useState(String(current));
  const bg = isDark ? "#111" : "#fff";
  const textColor = isDark ? "#ecfdf5" : "#0f172a";
  const mutedColor = isDark ? "#6b7280" : "#94a3b8";
  const goldColor = "#c8a84b";

  const go = () => {
    const n = parseInt(val);
    if (n >= 1 && n <= TOTAL_PAGES) { onSelect(n); onClose(); }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)", paddingHorizontal: 40 }}>
        <View style={{ backgroundColor: bg, borderRadius: 20, padding: 20, width: "100%" }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: textColor, textAlign: "center", marginBottom: 14 }}>الانتقال إلى صفحة</Text>
          <TextInput
            value={val} onChangeText={setVal}
            keyboardType="number-pad"
            onSubmitEditing={go}
            style={{ height: 56, textAlign: "center", fontSize: 28, fontWeight: "700", borderRadius: 14,
              borderWidth: 1, borderColor: isDark ? "#374151" : "#e2e8f0",
              backgroundColor: isDark ? "#1a1a1a" : "#f8fafc", color: textColor, marginBottom: 4 }}
            autoFocus
          />
          <Text style={{ textAlign: "center", fontSize: 10, color: mutedColor, marginBottom: 14 }}>١ — ٦٠٤</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Pressable onPress={onClose} style={{ flex: 1, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: isDark ? "#1f2937" : "#f1f5f9" }}>
              <Text style={{ fontSize: 13, color: mutedColor }}>إلغاء</Text>
            </Pressable>
            <Pressable onPress={go} style={{ flex: 1, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: goldColor + "22", borderWidth: 1, borderColor: goldColor + "55" }}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: goldColor }}>انتقل</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function MushafScreen() {
  const router = useRouter();
  const { page: pageParam } = useLocalSearchParams<{ page?: string }>();
  const c = useColors();
  const isDark = c.isDark;

  const [page, setPage] = useState<number>(1);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSurahPicker, setShowSurahPicker] = useState(false);
  const [showJuzPicker, setShowJuzPicker] = useState(false);
  const [showJump, setShowJump] = useState(false);
  const [zoom, setZoom] = useState(1);

  const controlsOpacity = useSharedValue(1);
  const slideX = useSharedValue(0);
  const scaleVal = useSharedValue(1);
  const imgOpacity = useSharedValue(1);

  const hideControlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load saved page
  useEffect(() => {
    const init = async () => {
      const initPage = pageParam ? parseInt(pageParam) : null;
      if (initPage && initPage >= 1 && initPage <= TOTAL_PAGES) {
        setPage(initPage);
      } else {
        try {
          const saved = await AsyncStorage.getItem("quran_mushaf_last_page");
          if (saved) setPage(Math.max(1, Math.min(TOTAL_PAGES, parseInt(saved) || 1)));
        } catch {}
      }
    };
    init();
  }, []);

  // Check bookmark state
  useEffect(() => {
    getBookmarks().then(list => setBookmarked(list.some(b => b.page === page)));
  }, [page]);

  // Auto hide controls
  useEffect(() => {
    if (showControls) {
      if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
      hideControlsTimer.current = setTimeout(() => {
        controlsOpacity.value = withTiming(0, { duration: 400 });
        setShowControls(false);
      }, 4000);
    }
    return () => { if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current); };
  }, [showControls, page]);

  const tapShowControls = () => {
    controlsOpacity.value = withTiming(1, { duration: 200 });
    setShowControls(true);
  };

  const goToPage = useCallback(async (newPage: number) => {
    if (newPage < 1 || newPage > TOTAL_PAGES) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    imgOpacity.value = withTiming(0, { duration: 120 }, () => {
      runOnJS(setPage)(newPage);
      runOnJS(setImgLoaded)(false);
      runOnJS(setImgError)(false);
      imgOpacity.value = withTiming(1, { duration: 200 });
    });
    try { await AsyncStorage.setItem("quran_mushaf_last_page", String(newPage)); } catch {}
  }, []);

  const toggleBookmark = async () => {
    const newState = await togglePageBookmark(page);
    setBookmarked(newState);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  // Swipe gesture for page navigation
  const panGesture = Gesture.Pan()
    .activeOffsetX([-15, 15])
    .failOffsetY([-20, 20])
    .onUpdate(e => { slideX.value = e.translationX; })
    .onEnd(e => {
      const threshold = SW * 0.25;
      if (e.translationX < -threshold) {
        slideX.value = withSpring(0);
        runOnJS(goToPage)(page + 1);
      } else if (e.translationX > threshold) {
        slideX.value = withSpring(0);
        runOnJS(goToPage)(page - 1);
      } else {
        slideX.value = withSpring(0);
      }
    });

  // Pinch gesture for zoom
  const pinchGesture = Gesture.Pinch()
    .onUpdate(e => {
      const newZoom = Math.max(1, Math.min(3, zoom * e.scale));
      scaleVal.value = newZoom;
    })
    .onEnd(() => {
      runOnJS(setZoom)(scaleVal.value);
    });

  const composed = Gesture.Simultaneous(panGesture, pinchGesture);

  const animatedImgStyle = useAnimatedStyle(() => ({
    opacity: imgOpacity.value,
    transform: [{ scale: scaleVal.value }],
  }));

  const controlsStyle = useAnimatedStyle(() => ({
    opacity: controlsOpacity.value,
  }));

  const bg = isDark ? "#0a0a0a" : "#1a1a1a";
  const textColor = isDark ? "#ecfdf5" : "#f1f5f9";
  const goldColor = "#c8a84b";
  const surahName = getSurahForPage(page);
  const juz = getJuzForPage(page);

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <StatusBar barStyle="light-content" backgroundColor={bg} />

      <GestureDetector gesture={composed}>
        <Pressable style={{ flex: 1 }} onPress={tapShowControls}>
          <Animated.View style={[{ flex: 1, alignItems: "center", justifyContent: "center" }, animatedImgStyle]}>
            {!imgLoaded && !imgError && (
              <View style={{ position: "absolute", alignItems: "center", gap: 12 }}>
                <ActivityIndicator size="large" color={goldColor} />
                <Text style={{ color: textColor + "88", fontSize: 13 }}>جاري التحميل...</Text>
              </View>
            )}
            {imgError ? (
              <View style={{ alignItems: "center", gap: 12, padding: 32 }}>
                <Text style={{ fontSize: 40 }}>📵</Text>
                <Text style={{ color: textColor + "88", fontSize: 14, textAlign: "center" }}>تعذّر تحميل الصفحة{"\n"}تحقق من اتصالك بالإنترنت</Text>
                <Pressable onPress={() => { setImgError(false); setImgLoaded(false); }} style={{ paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, backgroundColor: goldColor + "22", borderWidth: 1, borderColor: goldColor + "44" }}>
                  <Text style={{ color: goldColor, fontWeight: "600" }}>إعادة المحاولة</Text>
                </Pressable>
              </View>
            ) : (
              <Image
                source={{ uri: pageImageUrl(page) }}
                style={{ width: SW, height: SH, resizeMode: "contain" }}
                onLoad={() => setImgLoaded(true)}
                onError={() => setImgError(true)}
              />
            )}
          </Animated.View>
        </Pressable>
      </GestureDetector>

      {/* Top Bar */}
      <Animated.View style={[styles.topBar, controlsStyle, { backgroundColor: "rgba(0,0,0,0.75)" }]}>
        <SafeAreaView edges={["top"]}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 8 }}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Pressable onPress={toggleBookmark} style={styles.iconBtn}>
                {bookmarked
                  ? <BookmarkCheck size={20} color={goldColor} />
                  : <Bookmark size={20} color={textColor} />}
              </Pressable>
              <Pressable onPress={() => setZoom(z => Math.min(3, z + 0.25))} style={styles.iconBtn}>
                <ZoomIn size={18} color={textColor} />
              </Pressable>
              <Pressable onPress={() => { setZoom(1); scaleVal.value = withTiming(1); }} style={styles.iconBtn}>
                <ZoomOut size={18} color={textColor} />
              </Pressable>
            </View>

            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 14, fontWeight: "700", color: textColor }}>{surahName}</Text>
              <Text style={{ fontSize: 10, color: textColor + "99" }}>الجزء {juz}</Text>
            </View>

            <View style={{ flexDirection: "row", gap: 8 }}>
              <Pressable onPress={() => router.back()} style={styles.iconBtn}>
                <X size={18} color={textColor} />
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </Animated.View>

      {/* Bottom Bar */}
      <Animated.View style={[styles.bottomBar, controlsStyle, { backgroundColor: "rgba(0,0,0,0.75)" }]}>
        <View style={{ paddingHorizontal: 12, paddingBottom: Platform.OS === "ios" ? 24 : 12, paddingTop: 12 }}>
          {/* Page Counter + navigation */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <Pressable onPress={() => goToPage(page + 1)} style={[styles.navBtn, { opacity: page >= TOTAL_PAGES ? 0.3 : 1 }]}>
              <ChevronLeft size={22} color={textColor} />
            </Pressable>

            <Pressable onPress={() => setShowJump(true)} style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 22, fontWeight: "800", color: textColor, letterSpacing: 1 }}>{page}</Text>
              <Text style={{ fontSize: 10, color: textColor + "66" }}>من {TOTAL_PAGES}</Text>
            </Pressable>

            <Pressable onPress={() => goToPage(page - 1)} style={[styles.navBtn, { opacity: page <= 1 ? 0.3 : 1 }]}>
              <ChevronRight size={22} color={textColor} />
            </Pressable>
          </View>

          {/* Action pills */}
          <View style={{ flexDirection: "row-reverse", gap: 8, justifyContent: "center" }}>
            <Pressable onPress={() => setShowSurahPicker(true)} style={styles.pill}>
              <List size={13} color={textColor} />
              <Text style={{ fontSize: 11, fontWeight: "600", color: textColor }}>السور</Text>
            </Pressable>
            <Pressable onPress={() => setShowJuzPicker(true)} style={styles.pill}>
              <ChevronsUpDown size={13} color={textColor} />
              <Text style={{ fontSize: 11, fontWeight: "600", color: textColor }}>الأجزاء</Text>
            </Pressable>
            <Pressable onPress={() => router.push("/quran/wird" as any)} style={[styles.pill, { backgroundColor: goldColor + "33", borderColor: goldColor + "55" }]}>
              <Text style={{ fontSize: 12 }}>📖</Text>
              <Text style={{ fontSize: 11, fontWeight: "600", color: goldColor }}>الورد</Text>
            </Pressable>
          </View>
        </View>
      </Animated.View>

      <SurahPickerModal visible={showSurahPicker} onSelect={goToPage} onClose={() => setShowSurahPicker(false)} isDark={isDark} />
      <JuzPickerModal visible={showJuzPicker} currentJuz={juz} onSelect={goToPage} onClose={() => setShowJuzPicker(false)} isDark={isDark} />
      <PageJumpModal visible={showJump} current={page} onSelect={goToPage} onClose={() => setShowJump(false)} isDark={isDark} />
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 10 },
  bottomBar: { position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 10 },
  iconBtn: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.1)" },
  navBtn: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.12)" },
  pill: { flexDirection: "row-reverse", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.12)", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
});
