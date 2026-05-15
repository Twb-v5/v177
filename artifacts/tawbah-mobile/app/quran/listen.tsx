import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import {
  View, Text, Pressable, StyleSheet, FlatList, ScrollView,
  ActivityIndicator, Platform, Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Audio, InterruptionModeAndroid, InterruptionModeIOS, AVPlaybackStatus } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "@/providers/SettingsProvider";
import { useColors } from "@/hooks/useColors";

// ─── Constants ────────────────────────────────────────────────────────────────

const { width: SCREEN_W } = Dimensions.get("window");

const QURAN_RECITERS = [
  { id: "ar.alafasy",    nameAr: "مشاري العفاسي" },
  { id: "ar.abdulbasit", nameAr: "عبد الباسط" },
  { id: "ar.husary",     nameAr: "محمود الحصري" },
  { id: "ar.ghamadi",   nameAr: "سعد الغامدي" },
  { id: "ar.hanirifai", nameAr: "هاني الرفاعي" },
  { id: "ar.abdulsamad",nameAr: "عبد الصمد" },
];

const SURAH_LENGTHS = [7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6];

function toGlobal(surah: number, ayah: number): number {
  let c = 0;
  for (let i = 0; i < surah - 1; i++) c += SURAH_LENGTHS[i] ?? 0;
  return c + ayah;
}

const SURAH_NAMES: Record<number, string> = {
  1:"الفاتحة",2:"البقرة",3:"آل عمران",4:"النساء",5:"المائدة",6:"الأنعام",
  7:"الأعراف",8:"الأنفال",9:"التوبة",10:"يونس",11:"هود",12:"يوسف",
  13:"الرعد",14:"ابراهيم",15:"الحجر",16:"النحل",17:"الإسراء",18:"الكهف",
  19:"مريم",20:"طه",21:"الأنبياء",22:"الحج",23:"المؤمنون",24:"النور",
  25:"الفرقان",26:"الشعراء",27:"النمل",28:"القصص",29:"العنكبوت",30:"الروم",
  31:"لقمان",32:"السجدة",33:"الأحزاب",34:"سبأ",35:"فاطر",36:"يس",
  37:"الصافات",38:"ص",39:"الزمر",40:"غافر",41:"فصلت",42:"الشورى",
  43:"الزخرف",44:"الدخان",45:"الجاثية",46:"الأحقاف",47:"محمد",48:"الفتح",
  49:"الحجرات",50:"ق",51:"الذاريات",52:"الطور",53:"النجم",54:"القمر",
  55:"الرحمن",56:"الواقعة",57:"الحديد",58:"المجادلة",59:"الحشر",60:"الممتحنة",
  61:"الصف",62:"الجمعة",63:"المنافقون",64:"التغابن",65:"الطلاق",66:"التحريم",
  67:"الملك",68:"القلم",69:"الحاقة",70:"المعارج",71:"نوح",72:"الجن",
  73:"المزمل",74:"المدثر",75:"القيامة",76:"الإنسان",77:"المرسلات",78:"النبأ",
  79:"النازعات",80:"عبس",81:"التكوير",82:"الانفطار",83:"المطففين",84:"الانشقاق",
  85:"البروج",86:"الطارق",87:"الأعلى",88:"الغاشية",89:"الفجر",90:"البلد",
  91:"الشمس",92:"الليل",93:"الضحى",94:"الشرح",95:"التين",96:"العلق",
  97:"القدر",98:"البينة",99:"الزلزلة",100:"العاديات",101:"القارعة",102:"التكاثر",
  103:"العصر",104:"الهمزة",105:"الفيل",106:"قريش",107:"الماعون",108:"الكوثر",
  109:"الكافرون",110:"النصر",111:"المسد",112:"الإخلاص",113:"الفلق",114:"الناس",
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

interface Ayah {
  number: number;
  numberInSurah: number;
  text: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec < 10 ? "0" : ""}${sec}`;
}

function stripBismillah(text: string): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= 4) return text;
  const norm = (s: string) =>
    s.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\uFE70-\uFEFF]/g, "")
     .replace(/[أإآٱ]/g, "ا");
  const w = [norm(words[0]||""), norm(words[1]||""), norm(words[2]||""), norm(words[3]||"")];
  if (w[0].includes("بسم") && w[1].includes("الله") && w[2].includes("الرحمن") && w[3].includes("الرحيم")) {
    return words.slice(4).join(" ").trim();
  }
  return text;
}

function isBismillahOnly(text: string): boolean {
  const norm = text.replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g, "").replace(/\s+/g, "");
  return norm.startsWith("بسماللهالرحمنالرحيم") && text.trim().split(/\s+/).length <= 6;
}

// ─── Surah List Screen ────────────────────────────────────────────────────────

function SurahListScreen({
  onSelect,
  currentSurahNum,
  selectedReciter,
  onReciterChange,
}: {
  onSelect: (s: Surah) => void;
  currentSurahNum: number | null;
  selectedReciter: string;
  onReciterChange: (id: string) => void;
}) {
  const router = useRouter();
  const c = useColors();
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("https://api.alquran.cloud/v1/surah")
      .then(r => r.json())
      .then((d: { data: Surah[] }) => setSurahs(d.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return surahs;
    const q = search.trim();
    return surahs.filter(s => {
      const ar = SURAH_NAMES[s.number] || s.name;
      return ar.includes(q) || s.englishName.toLowerCase().includes(q.toLowerCase()) || String(s.number).includes(q);
    });
  }, [surahs, search]);

  const isDark = c.isDark;

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      {/* Header */}
      <View style={[styles.slHeader, { backgroundColor: c.surface, borderColor: c.border }]}>
        <Pressable onPress={() => router.back()} style={styles.slBackBtn}>
          <Ionicons name="arrow-forward" size={22} color={c.text} />
        </Pressable>
        <Text style={[styles.slTitle, { color: c.text }]}>الاستماع للقرآن</Text>
        <View style={{ width: 38 }} />
      </View>

      {/* Reciter selector */}
      <View style={[styles.slReciterBar, { backgroundColor: c.surfaceElevated, borderColor: c.border }]}>
        <Text style={[styles.slReciterLabel, { color: c.textSecondary }]}>القارئ</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.slReciterRow}>
          {QURAN_RECITERS.map(r => (
            <Pressable
              key={r.id}
              onPress={() => onReciterChange(r.id)}
              style={[
                styles.slReciterChip,
                { borderColor: r.id === selectedReciter ? "#1a4731" : c.border },
                r.id === selectedReciter && { backgroundColor: "#1a4731" },
              ]}
            >
              <Text style={[styles.slReciterChipText, { color: r.id === selectedReciter ? "#fff" : c.textSecondary }]}>
                {r.nameAr}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.slLoading}>
          <ActivityIndicator color="#1a4731" size="large" />
          <Text style={[styles.slLoadingText, { color: c.textSecondary }]}>جاري التحميل...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={item => String(item.number)}
          contentContainerStyle={{ padding: 12, paddingBottom: 60 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isCurrent = currentSurahNum === item.number;
            const arName = SURAH_NAMES[item.number] || item.name;
            return (
              <Pressable
                onPress={() => onSelect(item)}
                style={({ pressed }) => [
                  styles.slItem,
                  { backgroundColor: c.surface, borderColor: c.border },
                  isCurrent && { borderColor: "#1a4731", borderWidth: 2, backgroundColor: isDark ? "#052e25" : "#f0fdf4" },
                  pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
                ]}
              >
                <View style={[styles.slNum, { backgroundColor: isCurrent ? "#1a4731" : c.cardAlt }]}>
                  <Text style={[styles.slNumText, { color: isCurrent ? "#fff" : c.text }]}>{item.number}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.slName, { color: c.text }]}>{arName}</Text>
                  <Text style={[styles.slMeta, { color: c.textSecondary }]}>
                    {item.englishNameTranslation} · {item.numberOfAyahs} آية · {item.revelationType === "Meccan" ? "مكية" : "مدنية"}
                  </Text>
                </View>
                {isCurrent ? (
                  <Ionicons name="radio-button-on" size={22} color="#1a4731" />
                ) : (
                  <Ionicons name="play-circle-outline" size={26} color={c.textMuted} />
                )}
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}

// ─── Player Screen ────────────────────────────────────────────────────────────

function PlayerScreen({
  surah,
  reciterId,
  onBack,
}: {
  surah: Surah;
  reciterId: string;
  onBack: () => void;
}) {
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoadingAudio] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loop, setLoop] = useState(false);
  const [playbackSpeed, setPlaybackSpeedState] = useState(1);

  const soundRef = useRef<Audio.Sound | null>(null);
  const currentIdxRef = useRef(0);
  const loopRef = useRef(false);
  const ayahsRef = useRef<Ayah[]>([]);
  const reciterRef = useRef(reciterId);
  const playIdxFnRef = useRef<((idx: number) => Promise<void>) | null>(null);
  const pillsRef = useRef<ScrollView | null>(null);

  useEffect(() => { loopRef.current = loop; }, [loop]);
  useEffect(() => { reciterRef.current = reciterId; }, [reciterId]);

  // Setup audio mode
  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      interruptionModeIOS: InterruptionModeIOS.DoNotMix,
      interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
      shouldDuckAndroid: false,
      playThroughEarpieceAndroid: false,
    }).catch(console.error);

    return () => {
      soundRef.current?.unloadAsync().catch(() => {});
    };
  }, []);

  // Fetch ayahs
  useEffect(() => {
    setLoading(true);
    setError(null);
    setAyahs([]);
    setCurrentIdx(0);
    setIsPlaying(false);
    setPosition(0);
    setDuration(0);

    const parseAyahs = (data: { code: number; data: { ayahs: Ayah[] } }) => {
      if (data.code !== 200) throw new Error("API error");
      let list = data.data.ayahs;
      if (surah.number !== 1 && surah.number !== 9) {
        list = list.filter(a => !(a.numberInSurah === 1 && isBismillahOnly(a.text)));
        if (list.length > 0 && list[0]) {
          list[0] = { ...list[0], text: stripBismillah(list[0].text) };
        }
      }
      return list;
    };

    const fetchData = async () => {
      try {
        const r = await fetch(`https://api.alquran.cloud/v1/surah/${surah.number}/quran-uthmani`);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json() as { code: number; data: { ayahs: Ayah[] } };
        const list = parseAyahs(data);
        setAyahs(list);
        ayahsRef.current = list;
      } catch (e) {
        setError("تعذّر تحميل السورة، تحقق من الاتصال");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [surah.number]);

  // Build stable play function using ref pattern
  useEffect(() => {
    playIdxFnRef.current = async (idx: number) => {
      const ayah = ayahsRef.current[idx];
      if (!ayah) return;

      setIsLoadingAudio(true);

      // Unload previous
      if (soundRef.current) {
        try { await soundRef.current.unloadAsync(); } catch {}
        soundRef.current = null;
      }

      setCurrentIdx(idx);
      currentIdxRef.current = idx;

      const globalAyah = toGlobal(surah.number, ayah.numberInSurah);
      const url = `https://cdn.islamic.network/quran/audio/128/${reciterRef.current}/${globalAyah}.mp3`;

      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri: url },
          { shouldPlay: true, progressUpdateIntervalMillis: 400 },
          (status: AVPlaybackStatus) => {
            if (!status.isLoaded) return;
            setPosition(status.positionMillis);
            setDuration(status.durationMillis || 0);
            setIsPlaying(status.isPlaying);
            setIsLoadingAudio(false);

            if (status.didJustFinish) {
              setPosition(0);
              if (loopRef.current) {
                sound.replayAsync().catch(console.error);
              } else {
                const next = currentIdxRef.current + 1;
                if (next < ayahsRef.current.length) {
                  playIdxFnRef.current?.(next);
                } else {
                  setIsPlaying(false);
                }
              }
            }
          }
        );
        soundRef.current = sound;
        setIsPlaying(true);
        setIsLoadingAudio(false);

        // Scroll pills to current
        setTimeout(() => {
          pillsRef.current?.scrollTo({ x: Math.max(0, idx * 48 - SCREEN_W / 2 + 24), animated: true });
        }, 200);
      } catch (e) {
        console.error("Audio play error:", e);
        setIsLoadingAudio(false);
      }
    };
  }, [surah.number]);

  // Auto-play first ayah when loaded
  useEffect(() => {
    if (ayahs.length > 0 && !loading) {
      playIdxFnRef.current?.(0);
    }
  }, [ayahs.length, loading]);

  // Re-play when reciter changes mid-play
  const prevReciterRef = useRef(reciterId);
  useEffect(() => {
    if (prevReciterRef.current !== reciterId && isPlaying) {
      prevReciterRef.current = reciterId;
      playIdxFnRef.current?.(currentIdxRef.current);
    } else {
      prevReciterRef.current = reciterId;
    }
  }, [reciterId]);

  const togglePlayPause = useCallback(async () => {
    if (!soundRef.current) {
      playIdxFnRef.current?.(currentIdxRef.current);
      return;
    }
    if (isPlaying) {
      await soundRef.current.pauseAsync();
      setIsPlaying(false);
    } else {
      await soundRef.current.playAsync();
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const changeSpeed = useCallback(async (s: number) => {
    setPlaybackSpeedState(s);
    if (soundRef.current) {
      await soundRef.current.setRateAsync(s, true).catch(console.error);
    }
  }, []);

  const currentAyah = ayahs[currentIdx];
  const surahName = SURAH_NAMES[surah.number] || surah.name;
  const reciter = QURAN_RECITERS.find(r => r.id === reciterId);

  return (
    <View style={{ flex: 1, backgroundColor: "#021a10" }}>

      {/* Header */}
      <SafeAreaView edges={["top"]} style={{ zIndex: 2 }}>
        <View style={styles.pHeader}>
          <Pressable onPress={onBack} style={styles.pBackBtn}>
            <Ionicons name="arrow-forward" size={22} color="rgba(255,255,255,0.85)" />
          </Pressable>
          <View style={{ flex: 1, alignItems: "center" }}>
            <Text style={styles.pSurahName}>{surahName}</Text>
            <Text style={styles.pReciterName}>{reciter?.nameAr ?? ""}</Text>
            <Text style={styles.pAyahCount}>{surah.numberOfAyahs} آية · {surah.revelationType === "Meccan" ? "مكية" : "مدنية"}</Text>
          </View>
          <Pressable onPress={() => setLoop(l => !l)} style={[styles.pLoopBtn, loop && styles.pLoopBtnActive]}>
            <Ionicons name="repeat" size={18} color={loop ? "#fbbf24" : "rgba(255,255,255,0.5)"} />
          </Pressable>
        </View>
      </SafeAreaView>

      {/* Current Ayah Display */}
      <View style={styles.pAyahDisplay}>
        {loading ? (
          <ActivityIndicator color="rgba(231,207,124,0.8)" size="large" />
        ) : error ? (
          <Text style={styles.pError}>{error}</Text>
        ) : currentAyah ? (
          <View style={{ alignItems: "center", paddingHorizontal: 20 }}>
            <Text style={styles.pAyahText} textBreakStrategy="simple">
              {currentAyah.text}
              {"  "}
              <Text style={styles.pAyahNum}>﴿{currentAyah.numberInSurah}﴾</Text>
            </Text>
            <Text style={styles.pAyahCounter}>
              آية {currentAyah.numberInSurah} من {surah.numberOfAyahs}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Bottom Panel */}
      <SafeAreaView edges={["bottom"]} style={styles.pBottomPanel}>
        {/* Ayah pills row */}
        <ScrollView
          ref={pillsRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pPillsRow}
          style={styles.pPillsScroll}
        >
          {ayahs.map((a, i) => (
            <Pressable
              key={a.numberInSurah}
              onPress={() => playIdxFnRef.current?.(i)}
              style={[
                styles.pPill,
                i === currentIdx && styles.pPillActive,
              ]}
            >
              <Text style={[styles.pPillText, i === currentIdx && styles.pPillTextActive]}>
                {a.numberInSurah}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Progress bar */}
        <View style={styles.pProgressTrack}>
          <View
            style={[
              styles.pProgressFill,
              { width: duration > 0 ? `${Math.min(100, (position / duration) * 100)}%` as any : "0%" },
            ]}
          />
        </View>

        {/* Time */}
        <View style={styles.pTimeRow}>
          <Text style={styles.pTime}>{fmtTime(position)}</Text>
          <Text style={styles.pTime}>{fmtTime(duration)}</Text>
        </View>

        {/* Controls */}
        <View style={styles.pControls}>
          {/* Previous */}
          <Pressable
            onPress={() => { if (currentIdx > 0) playIdxFnRef.current?.(currentIdx - 1); }}
            disabled={currentIdx === 0}
            style={[styles.pCtrlBtn, currentIdx === 0 && { opacity: 0.3 }]}
          >
            <Ionicons name="play-skip-forward" size={28} color="#fff" />
          </Pressable>

          {/* Play / Pause */}
          <Pressable onPress={togglePlayPause} style={styles.pPlayBtn}>
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : isPlaying ? (
              <Ionicons name="pause" size={32} color="#fff" />
            ) : (
              <Ionicons name="play" size={32} color="#fff" />
            )}
          </Pressable>

          {/* Next */}
          <Pressable
            onPress={() => { if (currentIdx < ayahs.length - 1) playIdxFnRef.current?.(currentIdx + 1); }}
            disabled={currentIdx >= ayahs.length - 1}
            style={[styles.pCtrlBtn, currentIdx >= ayahs.length - 1 && { opacity: 0.3 }]}
          >
            <Ionicons name="play-skip-back" size={28} color="#fff" />
          </Pressable>
        </View>

        {/* Speed */}
        <View style={styles.pSpeedRow}>
          {[0.75, 1, 1.25, 1.5].map(s => (
            <Pressable
              key={s}
              onPress={() => changeSpeed(s)}
              style={[styles.pSpeedBtn, playbackSpeed === s && styles.pSpeedBtnActive]}
            >
              <Text style={[styles.pSpeedText, playbackSpeed === s && styles.pSpeedTextActive]}>
                {s}×
              </Text>
            </Pressable>
          ))}
        </View>
      </SafeAreaView>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function QuranListenScreen() {
  const { surah: surahParam } = useLocalSearchParams<{ surah?: string }>();
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [selectedReciter, setSelectedReciter] = useState("ar.alafasy");
  const [showPlayer, setShowPlayer] = useState(false);

  // If surah param provided, load it immediately
  useEffect(() => {
    if (surahParam) {
      const num = parseInt(surahParam, 10);
      if (num >= 1 && num <= 114) {
        // Build a minimal surah object from static data
        const name = SURAH_NAMES[num] || `سورة ${num}`;
        const lengths = SURAH_LENGTHS;
        const fakesurah: Surah = {
          number: num,
          name,
          englishName: name,
          englishNameTranslation: name,
          numberOfAyahs: lengths[num - 1] ?? 1,
          revelationType: "Meccan",
        };
        setSelectedSurah(fakesurah);
        setShowPlayer(true);
      }
    }
  }, [surahParam]);

  const handleSelect = useCallback((s: Surah) => {
    setSelectedSurah(s);
    setShowPlayer(true);
  }, []);

  const handleBack = useCallback(() => {
    setShowPlayer(false);
  }, []);

  if (showPlayer && selectedSurah) {
    return (
      <PlayerScreen
        surah={selectedSurah}
        reciterId={selectedReciter}
        onBack={handleBack}
      />
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <SurahListScreen
        onSelect={handleSelect}
        currentSurahNum={selectedSurah?.number ?? null}
        selectedReciter={selectedReciter}
        onReciterChange={setSelectedReciter}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Surah List
  slHeader: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 12, paddingVertical: 14,
    borderBottomWidth: 1,
  },
  slBackBtn: { width: 38, height: 38, alignItems: "center", justifyContent: "center", borderRadius: 19 },
  slTitle: { flex: 1, fontSize: 18, fontWeight: "bold", textAlign: "center", fontFamily: Platform.OS === "ios" ? "Georgia" : "serif" },
  slReciterBar: { padding: 12, borderBottomWidth: 1 },
  slReciterLabel: { fontSize: 12, fontWeight: "700", marginBottom: 8, textAlign: "right" },
  slReciterRow: { flexDirection: "row", gap: 8 },
  slReciterChip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 18, borderWidth: 1,
    backgroundColor: "transparent",
  },
  slReciterChipText: { fontSize: 12, fontWeight: "600" },
  slLoading: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  slLoadingText: { fontSize: 14 },
  slItem: {
    flexDirection: "row", alignItems: "center",
    padding: 14, borderRadius: 16, marginBottom: 8,
    borderWidth: 1,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
      android: { elevation: 2 },
    }),
  },
  slNum: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", marginEnd: 14 },
  slNumText: { fontSize: 15, fontWeight: "bold" },
  slName: { fontSize: 17, fontWeight: "600", marginBottom: 3, fontFamily: Platform.OS === "ios" ? "Georgia" : "serif" },
  slMeta: { fontSize: 11 },

  // Player
  pHeader: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 12, paddingVertical: 16,
  },
  pBackBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 20 },
  pSurahName: {
    fontSize: 20, fontWeight: "bold", color: "#e7cf7c",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    textAlign: "center",
  },
  pReciterName: { fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 2, textAlign: "center" },
  pAyahCount: { fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 1, textAlign: "center" },
  pLoopBtn: {
    width: 40, height: 40, alignItems: "center", justifyContent: "center",
    borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)",
  },
  pLoopBtnActive: { borderColor: "#fbbf24", backgroundColor: "rgba(251,191,36,0.1)" },

  pAyahDisplay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  pAyahText: {
    fontFamily: "Amiri_400Regular",
    fontSize: 24,
    color: "rgba(255,255,255,0.93)",
    textAlign: "center",
    lineHeight: 52,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  pAyahNum: {
    fontFamily: "Amiri_400Regular",
    fontSize: 18,
    color: "rgba(231,207,124,0.85)",
  },
  pAyahCounter: {
    marginTop: 16,
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
  },
  pError: { color: "#f87171", fontSize: 14, textAlign: "center" },

  pBottomPanel: {
    paddingBottom: 8,
  },

  pPillsScroll: { maxHeight: 52 },
  pPillsRow: { flexDirection: "row", paddingHorizontal: 12, gap: 6, paddingVertical: 8 },
  pPill: {
    minWidth: 40, height: 36, paddingHorizontal: 10,
    borderRadius: 10, alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "transparent",
  },
  pPillActive: {
    backgroundColor: "rgba(231,207,124,0.2)",
    borderColor: "rgba(231,207,124,0.6)",
  },
  pPillText: {
    fontSize: 13, color: "rgba(255,255,255,0.5)",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  pPillTextActive: { color: "#e7cf7c" },

  pProgressTrack: {
    height: 3, marginHorizontal: 16, marginTop: 4,
    backgroundColor: "rgba(255,255,255,0.12)", borderRadius: 2,
  },
  pProgressFill: {
    height: "100%", backgroundColor: "#e7cf7c", borderRadius: 2,
  },

  pTimeRow: {
    flexDirection: "row", justifyContent: "space-between",
    paddingHorizontal: 16, marginTop: 6,
  },
  pTime: { fontSize: 11, color: "rgba(255,255,255,0.45)" },

  pControls: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 32, marginTop: 20, marginBottom: 16,
  },
  pCtrlBtn: { width: 52, height: 52, alignItems: "center", justifyContent: "center", borderRadius: 26 },
  pPlayBtn: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: "#1a5c38",
    alignItems: "center", justifyContent: "center",
    ...Platform.select({
      ios: { shadowColor: "#1a5c38", shadowOpacity: 0.5, shadowRadius: 16, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 8 },
    }),
  },

  pSpeedRow: {
    flexDirection: "row", justifyContent: "center",
    gap: 8, marginBottom: 12,
  },
  pSpeedBtn: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.15)",
    backgroundColor: "transparent",
  },
  pSpeedBtnActive: {
    backgroundColor: "rgba(231,207,124,0.18)",
    borderColor: "rgba(231,207,124,0.5)",
  },
  pSpeedText: { fontSize: 12, color: "rgba(255,255,255,0.5)" },
  pSpeedTextActive: { color: "#e7cf7c", fontWeight: "700" },
});
