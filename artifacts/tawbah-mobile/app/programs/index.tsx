import { useState, useCallback, useEffect } from "react";
import {
  View, Text, Pressable, ScrollView, Image, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  FadeIn, FadeInDown, useSharedValue, useAnimatedStyle, withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import {
  Tv, Play, Pause, Radio, Headphones, ChevronRight,
  Wifi, Volume2,
} from "lucide-react-native";
import { useColors } from "@/hooks/useColors";
import { useSettings } from "@/providers/SettingsProvider";
import { useMediaPlayer } from "@/engines/media/useMediaPlayer";
import {
  MEDIA_CATEGORIES, PROGRAMS, FEATURED_PROGRAMS,
  LIVE_RADIO_STATIONS, PODCAST_CATEGORIES,
} from "@/engines/media/data";
import type { CategoryId } from "@/engines/media/types";

function ProgramCard({
  program,
  isDark,
  isActive,
  isPlaying,
  onPress,
}: {
  program: (typeof PROGRAMS)[0];
  isDark: boolean;
  isActive?: boolean;
  isPlaying?: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[animStyle, { marginBottom: 8 }]}>
      <Pressable
        onPressIn={() => { scale.value = withSpring(0.97); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        onPress={onPress}
        style={{
          borderRadius: 18,
          overflow: "hidden",
          borderWidth: 1.5,
          borderColor: isActive
            ? "rgba(139,92,246,0.5)"
            : isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
        }}
      >
        <View
          style={{
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
            justifyContent: "flex-end",
            backgroundColor: isDark ? "rgba(14,14,14,0.9)" : "#ffffff",
          }}
        >
          <View style={{ flex: 1, alignItems: "flex-end" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 }}>
              {program.badge && (
                <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, backgroundColor: "rgba(139,92,246,0.2)" }}>
                  <Text style={{ fontSize: 9, color: "#8b5cf6", fontWeight: "800" }}>{program.badge}</Text>
                </View>
              )}
              {program.hot && (
                <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, backgroundColor: "rgba(239,68,68,0.15)" }}>
                  <Text style={{ fontSize: 9, color: "#ef4444", fontWeight: "800" }}>🔥 ملتهب</Text>
                </View>
              )}
            </View>
            <Text style={{
              fontSize: 14, fontWeight: "800", color: isDark ? "#F1F5F9" : "#1C1917",
              fontFamily: "IBMPlexSansArabic_700Bold",
            }}>
              {program.name}
            </Text>
            {program.host && (
              <Text style={{
                fontSize: 12, color: isDark ? "#94A3B8" : "#64748B",
                fontFamily: "IBMPlexSansArabic_400Regular", marginTop: 2,
              }}>
                {program.host}
              </Text>
            )}
            {isActive && (
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#8b5cf6" }} />
                <Text style={{ fontSize: 10, color: "#8b5cf6", fontFamily: "IBMPlexSansArabic_700Bold" }}>
                  {isPlaying ? "يُشغَّل الآن" : "متوقف"}
                </Text>
              </View>
            )}
          </View>

          <View
            style={{
              width: 52, height: 52, borderRadius: 16,
              alignItems: "center", justifyContent: "center",
              backgroundColor: program.color + "20",
              borderWidth: 1, borderColor: program.color + "30",
            }}
          >
            {isActive
              ? isPlaying
                ? <Pause size={20} color={program.color} />
                : <Play size={20} color={program.color} />
              : <Text style={{ fontSize: 24 }}>{program.icon}</Text>
            }
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function RadioStationCard({
  station,
  isDark,
  isActive,
  isPlaying,
  onToggle,
}: {
  station: (typeof LIVE_RADIO_STATIONS)[0];
  isDark: boolean;
  isActive: boolean;
  isPlaying: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable
      onPress={onToggle}
      style={{
        width: 160,
        borderRadius: 18,
        padding: 14,
        marginRight: 10,
        backgroundColor: isDark ? "#111111" : "#ffffff",
        borderWidth: 1.5,
        borderColor: isActive
          ? station.color ?? "#059669"
          : isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
      }}
    >
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <View
          style={{
            width: 32, height: 32, borderRadius: 10,
            alignItems: "center", justifyContent: "center",
            backgroundColor: (station.color ?? "#059669") + "20",
          }}
        >
          {isActive && isPlaying
            ? <Pause size={16} color={station.color ?? "#059669"} />
            : <Play size={16} color={station.color ?? "#059669"} />
          }
        </View>
        {isActive && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
            {[1, 2, 3].map((i) => (
              <View key={i} style={{ width: 3, height: 8 + i * 3, borderRadius: 2, backgroundColor: station.color ?? "#059669", opacity: isPlaying ? 1 : 0.3 }} />
            ))}
          </View>
        )}
      </View>
      <Text style={{ fontSize: 13, fontWeight: "800", color: isDark ? "#F1F5F9" : "#1C1917", fontFamily: "IBMPlexSansArabic_700Bold", textAlign: "right", lineHeight: 18 }}>
        {station.name}
      </Text>
      {isActive && (
        <Text style={{ fontSize: 10, color: station.color ?? "#059669", fontFamily: "IBMPlexSansArabic_700Bold", textAlign: "right", marginTop: 4 }}>
          {isPlaying ? "بث مباشر 🔴" : "متوقف"}
        </Text>
      )}
    </Pressable>
  );
}

function PodcastCard({
  podcast,
  isDark,
  activeEpisodeId,
  isPlaying,
  onPlayEpisode,
}: {
  podcast: (typeof PODCAST_CATEGORIES)[0];
  isDark: boolean;
  activeEpisodeId: string | null;
  isPlaying: boolean;
  onPlayEpisode: (episodeId: string, mediaUrl: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={{ borderRadius: 18, overflow: "hidden", marginBottom: 10, backgroundColor: isDark ? "#111111" : "#ffffff", borderWidth: 1, borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)" }}>
      <Pressable
        onPress={() => { setExpanded((e) => !e); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
        style={{ padding: 16, flexDirection: "row", alignItems: "center", gap: 14, justifyContent: "flex-end" }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text style={{ fontSize: 12, color: isDark ? "#94A3B8" : "#64748B", fontFamily: "IBMPlexSansArabic_400Regular" }}>
            {podcast.episodes.length} حلقة
          </Text>
          {expanded ? <ChevronRight size={16} color={isDark ? "#94A3B8" : "#64748B"} style={{ transform: [{ rotate: "90deg" }] }} /> : <ChevronRight size={16} color={isDark ? "#94A3B8" : "#64748B"} style={{ transform: [{ rotate: "270deg" }] }} />}
        </View>
        <View style={{ flex: 1, alignItems: "flex-end" }}>
          <Text style={{ fontSize: 15, fontWeight: "900", color: isDark ? "#F1F5F9" : "#1C1917", fontFamily: "IBMPlexSansArabic_700Bold" }}>
            {podcast.title}
          </Text>
          {podcast.description && (
            <Text numberOfLines={1} style={{ fontSize: 12, color: isDark ? "#94A3B8" : "#64748B", fontFamily: "IBMPlexSansArabic_400Regular", marginTop: 2 }}>
              {podcast.description}
            </Text>
          )}
        </View>
        <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: podcast.color + "20", borderWidth: 1, borderColor: podcast.color + "30", alignItems: "center", justifyContent: "center" }}>
          <Headphones size={20} color={podcast.color} />
        </View>
      </Pressable>

      {expanded && (
        <Animated.View entering={FadeIn.duration(200)} style={{ borderTopWidth: 1, borderTopColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)" }}>
          {podcast.episodes.map((ep, i) => {
            const isActive = activeEpisodeId === ep.id;
            return (
              <Pressable
                key={ep.id}
                onPress={() => onPlayEpisode(ep.id, ep.mediaUrl)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  justifyContent: "flex-end",
                  borderBottomWidth: i < podcast.episodes.length - 1 ? 1 : 0,
                  borderBottomColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
                  backgroundColor: isActive ? (podcast.color + "10") : "transparent",
                }}
              >
                <Text style={{ flex: 1, fontSize: 13, color: isActive ? podcast.color : (isDark ? "#CBD5E1" : "#374151"), fontFamily: "IBMPlexSansArabic_500Medium", textAlign: "right" }}>
                  {ep.title}
                </Text>
                <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: (isActive ? podcast.color : (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)")), alignItems: "center", justifyContent: "center" }}>
                  {isActive && isPlaying
                    ? <Pause size={14} color={isActive ? "#fff" : (isDark ? "#94A3B8" : "#64748B")} />
                    : <Play size={14} color={isActive ? "#fff" : (isDark ? "#94A3B8" : "#64748B")} />
                  }
                </View>
              </Pressable>
            );
          })}
        </Animated.View>
      )}
    </View>
  );
}

function MiniPlayer({
  isDark,
  c,
  activeMedia,
  isPlaying,
  positionMs,
  durationMs,
  onPause,
  onResume,
  onStop,
}: {
  isDark: boolean;
  c: ReturnType<typeof useColors>;
  activeMedia: NonNullable<ReturnType<typeof useMediaPlayer>["activeMedia"]>;
  isPlaying: boolean;
  positionMs: number;
  durationMs: number;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}) {
  const progress = durationMs > 0 ? positionMs / durationMs : 0;
  const formatMs = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(300)}
      style={{
        position: "absolute",
        bottom: 90,
        left: 12,
        right: 12,
        borderRadius: 20,
        backgroundColor: isDark ? "#1a1a2e" : "#ffffff",
        borderWidth: 1.5,
        borderColor: "rgba(139,92,246,0.3)",
        padding: 14,
        shadowColor: "#8b5cf6",
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 8,
      }}
    >
      <View style={{ height: 3, borderRadius: 2, backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)", marginBottom: 10, overflow: "hidden" }}>
        <View style={{ height: "100%", borderRadius: 2, backgroundColor: "#8b5cf6", width: `${progress * 100}%` }} />
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 12, justifyContent: "flex-end" }}>
        <Pressable
          onPress={onStop}
          style={{ width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" }}
        >
          <Text style={{ fontSize: 14 }}>✕</Text>
        </Pressable>

        <Pressable
          onPress={isPlaying ? onPause : onResume}
          style={{ width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "#8b5cf6" }}
        >
          {isPlaying
            ? <Pause size={18} color="#fff" />
            : <Play size={18} color="#fff" />
          }
        </Pressable>

        <View style={{ flex: 1, alignItems: "flex-end" }}>
          <Text numberOfLines={1} style={{ fontSize: 13, fontWeight: "800", color: isDark ? "#F1F5F9" : "#1C1917", fontFamily: "IBMPlexSansArabic_700Bold" }}>
            {activeMedia.title}
          </Text>
          {activeMedia.type === "episode" && durationMs > 0 && (
            <Text style={{ fontSize: 11, color: "#8b5cf6", fontFamily: "IBMPlexSansArabic_400Regular", marginTop: 2 }}>
              {formatMs(positionMs)} / {formatMs(durationMs)}
            </Text>
          )}
          {activeMedia.type === "radio" && (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#ef4444" }} />
              <Text style={{ fontSize: 10, color: "#ef4444", fontFamily: "IBMPlexSansArabic_700Bold" }}>بث مباشر</Text>
            </View>
          )}
        </View>

        <Volume2 size={18} color="#8b5cf6" />
      </View>
    </Animated.View>
  );
}

export default function ProgramsScreen() {
  const router = useRouter();
  const c = useColors();
  const { resolvedTheme } = useSettings();
  const isDark = resolvedTheme === "dark";

  const [activeCategory, setActiveCategory] = useState<CategoryId | "all">("all");
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [activeRadioId, setActiveRadioId] = useState<string | null>(null);
  const [activeEpisodeId, setActiveEpisodeId] = useState<string | null>(null);

  const {
    activeMedia,
    playbackState,
    isPlaying,
    positionMs,
    durationMs,
    play,
    pause,
    resume,
    stop,
  } = useMediaPlayer();

  useEffect(() => {
    const interval = setInterval(() => {
      setFeaturedIndex((i) => (i + 1) % FEATURED_PROGRAMS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleRadioToggle = useCallback(async (station: (typeof LIVE_RADIO_STATIONS)[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const isSame = activeRadioId === station.id && activeEpisodeId === null;

    if (isSame && isPlaying) {
      pause();
      return;
    }
    if (isSame && !isPlaying && activeMedia) {
      resume();
      return;
    }

    setActiveEpisodeId(null);
    setActiveRadioId(station.id);
    await play({
      id: station.id,
      type: "radio",
      title: station.name,
      url: station.url,
      useProxy: false,
    });
  }, [activeRadioId, activeEpisodeId, isPlaying, activeMedia, play, pause, resume]);

  const handlePlayEpisode = useCallback(async (episodeId: string, mediaUrl: string, title: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const isSame = activeEpisodeId === episodeId;

    if (isSame && isPlaying) {
      pause();
      return;
    }
    if (isSame && !isPlaying && activeMedia) {
      resume();
      return;
    }

    setActiveRadioId(null);
    setActiveEpisodeId(episodeId);
    await play({
      id: episodeId,
      type: "episode",
      title,
      url: mediaUrl,
      useProxy: false,
    });
  }, [activeEpisodeId, isPlaying, activeMedia, play, pause, resume]);

  const visibleCategories = activeCategory === "all"
    ? MEDIA_CATEGORIES.map((c) => c.id)
    : [activeCategory];

  const featuredProgram = FEATURED_PROGRAMS[featuredIndex];

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#0a0a0a" : "#fafafa" }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderBottomWidth: 1,
            borderBottomColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
            backgroundColor: isDark ? "rgba(10,10,10,0.92)" : "rgba(250,250,250,0.92)",
            justifyContent: "flex-end",
            gap: 10,
          }}
        >
          <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
            <Text style={{ fontSize: 17, fontWeight: "800", color: isDark ? "#F1F5F9" : "#1C1917", fontFamily: "IBMPlexSansArabic_700Bold" }}>
              برامج إسلامية
            </Text>
            <Tv size={18} color="#8b5cf6" />
          </View>
          <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, backgroundColor: "rgba(139,92,246,0.15)" }}>
            <Text style={{ fontSize: 11, color: "#8b5cf6", fontFamily: "IBMPlexSansArabic_700Bold" }}>
              {PROGRAMS.length} برنامج
            </Text>
          </View>
          <Pressable
            onPress={() => router.back()}
            style={{ width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)" }}
          >
            <ChevronRight size={18} color={c.textMuted} />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={{ paddingBottom: activeMedia ? 160 : 100 }}
          showsVerticalScrollIndicator={false}
        >
          {featuredProgram && (
            <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
              <Animated.View
                key={featuredIndex}
                entering={FadeIn.duration(400)}
              >
                <Pressable
                  style={{
                    height: 160,
                    borderRadius: 24,
                    padding: 20,
                    justifyContent: "flex-end",
                    overflow: "hidden",
                    backgroundColor: featuredProgram.color,
                  }}
                >
                  <View style={{ position: "absolute", top: 16, right: 16 }}>
                    <Text style={{ fontSize: 48 }}>{featuredProgram.icon}</Text>
                  </View>
                  {featuredProgram.badge && (
                    <View style={{ position: "absolute", top: 16, left: 16, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.2)" }}>
                      <Text style={{ fontSize: 11, color: "#fff", fontWeight: "800" }}>{featuredProgram.badge}</Text>
                    </View>
                  )}
                  <Text style={{ fontSize: 20, fontWeight: "900", color: "#fff", fontFamily: "IBMPlexSansArabic_700Bold", textAlign: "right" }}>
                    {featuredProgram.name}
                  </Text>
                  {featuredProgram.host && (
                    <Text style={{ fontSize: 13, color: "rgba(255,255,255,0.8)", fontFamily: "IBMPlexSansArabic_400Regular", textAlign: "right" }}>
                      {featuredProgram.host}
                    </Text>
                  )}
                </Pressable>
              </Animated.View>

              <View style={{ flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 10 }}>
                {FEATURED_PROGRAMS.map((_, i) => (
                  <Pressable
                    key={i}
                    onPress={() => setFeaturedIndex(i)}
                    style={{
                      height: 6,
                      borderRadius: 3,
                      width: i === featuredIndex ? 20 : 6,
                      backgroundColor: i === featuredIndex ? "#8b5cf6" : (isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)"),
                    }}
                  />
                ))}
              </View>
            </View>
          )}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4, gap: 8, flexDirection: "row" }}
            style={{ flexGrow: 0 }}
          >
            <Pressable
              onPress={() => setActiveCategory("all")}
              style={{
                paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
                backgroundColor: activeCategory === "all" ? "#8b5cf6" : (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"),
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: "800", color: activeCategory === "all" ? "#fff" : (isDark ? "#94A3B8" : "#374151"), fontFamily: "IBMPlexSansArabic_700Bold" }}>
                الكل
              </Text>
            </Pressable>
            {MEDIA_CATEGORIES.map((cat) => (
              <Pressable
                key={cat.id}
                onPress={() => setActiveCategory(cat.id)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: activeCategory === cat.id ? cat.color : (isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"),
                }}
              >
                <Text style={{ fontSize: 12 }}>{cat.icon}</Text>
                <Text style={{ fontSize: 12, fontWeight: "800", color: activeCategory === cat.id ? "#fff" : (isDark ? "#94A3B8" : "#374151"), fontFamily: "IBMPlexSansArabic_700Bold" }}>
                  {cat.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {activeCategory === "all" && (
            <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12, justifyContent: "flex-end" }}>
                <Text style={{ fontSize: 15, fontWeight: "900", color: isDark ? "#F1F5F9" : "#1C1917", fontFamily: "IBMPlexSansArabic_700Bold" }}>
                  الإذاعة المباشرة
                </Text>
                <View style={{ width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(59,130,246,0.15)" }}>
                  <Wifi size={18} color="#3b82f6" />
                </View>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ flexDirection: "row", paddingBottom: 4 }}
                style={{ flexGrow: 0 }}
              >
                {LIVE_RADIO_STATIONS.map((station) => (
                  <RadioStationCard
                    key={station.id}
                    station={station}
                    isDark={isDark}
                    isActive={activeRadioId === station.id}
                    isPlaying={activeRadioId === station.id && isPlaying}
                    onToggle={() => handleRadioToggle(station)}
                  />
                ))}
              </ScrollView>
            </View>
          )}

          {activeCategory === "all" && (
            <View style={{ paddingHorizontal: 16, paddingTop: 20 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12, justifyContent: "flex-end" }}>
                <Text style={{ fontSize: 15, fontWeight: "900", color: isDark ? "#F1F5F9" : "#1C1917", fontFamily: "IBMPlexSansArabic_700Bold" }}>
                  البودكاست
                </Text>
                <View style={{ width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(5,150,105,0.15)" }}>
                  <Headphones size={18} color="#059669" />
                </View>
              </View>
              {PODCAST_CATEGORIES.map((podcast) => (
                <PodcastCard
                  key={podcast.id}
                  podcast={podcast}
                  isDark={isDark}
                  activeEpisodeId={activeEpisodeId}
                  isPlaying={isPlaying}
                  onPlayEpisode={(episodeId, mediaUrl) => {
                    const ep = podcast.episodes.find((e) => e.id === episodeId);
                    handlePlayEpisode(episodeId, mediaUrl, ep?.title ?? "");
                  }}
                />
              ))}
            </View>
          )}

          {visibleCategories.map((catId) => {
            const catPrograms = PROGRAMS.filter((p) => p.category === catId);
            const catInfo = MEDIA_CATEGORIES.find((c) => c.id === catId);
            if (!catPrograms.length) return null;
            return (
              <View key={catId} style={{ paddingHorizontal: 16, paddingTop: activeCategory === "all" ? 20 : 16 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12, justifyContent: "flex-end" }}>
                  <Text style={{ fontSize: 15, fontWeight: "900", color: isDark ? "#F1F5F9" : "#1C1917", fontFamily: "IBMPlexSansArabic_700Bold" }}>
                    {catInfo?.label ?? catId}
                  </Text>
                  <Text style={{ fontSize: 20 }}>{catInfo?.icon}</Text>
                </View>
                {catPrograms.map((program, i) => (
                  <Animated.View key={program.id} entering={FadeInDown.delay(i * 30).springify()}>
                    <ProgramCard
                      program={program}
                      isDark={isDark}
                      isActive={false}
                      isPlaying={false}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                    />
                  </Animated.View>
                ))}
              </View>
            );
          })}
        </ScrollView>
      </SafeAreaView>

      {activeMedia && (
        <MiniPlayer
          isDark={isDark}
          c={c}
          activeMedia={activeMedia}
          isPlaying={isPlaying}
          positionMs={positionMs}
          durationMs={durationMs}
          onPause={pause}
          onResume={resume}
          onStop={stop}
        />
      )}
    </View>
  );
}
