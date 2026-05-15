import { useEffect } from "react";
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useColors } from "@/hooks/useColors";
import { SkipBack, SkipForward, Play, Pause, X } from "lucide-react-native";

interface AudioState {
  isPlaying: boolean;
  isLoading: boolean;
  position: number;
  duration: number;
  currentAyah: number;
}

interface QuranAudioPlayerProps {
  surahName: string;
  visible: boolean;
  onClose: () => void;
  audio: AudioState & {
    pause: () => Promise<void>;
    resume: () => Promise<void>;
    stop: () => Promise<void>;
    setPlaybackSpeed: (speed: number) => Promise<void>;
  };
  onNext?: () => void;
  onPrev?: () => void;
  reciterName?: string;
}

export function QuranAudioPlayer({
  surahName,
  visible,
  onClose,
  audio,
  onNext,
  onPrev,
  reciterName,
}: QuranAudioPlayerProps) {
  const c = useColors();
  const isDark = c.isDark;

  const translateY = useSharedValue(300);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 20, stiffness: 150 });
    } else {
      translateY.value = withTiming(300, { duration: 300 });
    }
  }, [visible]);

  useEffect(() => {
    if (audio.duration > 0) {
      progress.value = audio.position / audio.duration;
    }
  }, [audio.position, audio.duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${Math.min(100, progress.value * 100)}%` as any,
  }));

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? "#0d2d1f" : "#ffffff",
          shadowColor: "#000",
          shadowOpacity: 0.3,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: -4 },
          elevation: 12,
          borderTopWidth: 1,
          borderColor: isDark ? "rgba(52,211,153,0.2)" : "rgba(26,71,49,0.15)",
        },
        animatedStyle,
      ]}
    >
      {/* Progress Bar */}
      <View
        style={[
          styles.progressTrack,
          { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)" },
        ]}
      >
        <Animated.View
          style={[
            styles.progressFill,
            { backgroundColor: isDark ? "#34d399" : "#1a4731" },
            progressStyle,
          ]}
        />
      </View>

      {/* Player Content */}
      <View style={styles.content}>
        {/* Header row */}
        <View style={styles.headerRow}>
          <View style={styles.surahInfo}>
            <Text
              style={[
                styles.surahName,
                { color: isDark ? "#ecfdf5" : "#0f172a", fontFamily: "IBMPlexSansArabic_700Bold" },
              ]}
              numberOfLines={1}
            >
              {surahName}
            </Text>
            {reciterName ? (
              <Text
                style={[
                  styles.reciterName,
                  { color: isDark ? "#6ee7b7" : "#1a4731", fontFamily: "IBMPlexSansArabic_400Regular" },
                ]}
                numberOfLines={1}
              >
                {reciterName}
              </Text>
            ) : null}
            <Text
              style={[
                styles.ayahInfo,
                { color: isDark ? "#a7f3d0" : "#374151", fontFamily: "IBMPlexSansArabic_400Regular" },
              ]}
            >
              الآية {audio.currentAyah || 1}
            </Text>
          </View>
          <Pressable
            onPress={onClose}
            style={[
              styles.closeBtn,
              { backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)" },
            ]}
          >
            <X size={18} color={isDark ? "#6ee7b7" : "#374151"} />
          </Pressable>
        </View>

        {/* Time Display */}
        <View style={styles.timeDisplay}>
          <Text style={[styles.timeText, { color: isDark ? "#6ee7b7" : "#374151" }]}>
            {formatTime(audio.position)}
          </Text>
          <Text style={[styles.timeText, { color: isDark ? "#6ee7b7" : "#374151" }]}>
            {formatTime(audio.duration)}
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <Pressable
            onPress={onPrev}
            disabled={!onPrev}
            style={[
              styles.controlBtn,
              {
                backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                opacity: onPrev ? 1 : 0.35,
              },
            ]}
          >
            <SkipBack size={22} color={isDark ? "#ecfdf5" : "#1a4731"} />
          </Pressable>

          <Pressable
            onPress={() => (audio.isPlaying ? audio.pause() : audio.resume())}
            style={[
              styles.playBtn,
              {
                backgroundColor: isDark ? "#059669" : "#1a4731",
                shadowColor: isDark ? "#059669" : "#1a4731",
                shadowOpacity: 0.4,
                shadowRadius: 14,
                shadowOffset: { width: 0, height: 4 },
                elevation: 8,
              },
            ]}
          >
            {audio.isLoading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : audio.isPlaying ? (
              <Pause size={26} color="#ffffff" />
            ) : (
              <Play size={26} color="#ffffff" />
            )}
          </Pressable>

          <Pressable
            onPress={onNext}
            disabled={!onNext}
            style={[
              styles.controlBtn,
              {
                backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                opacity: onNext ? 1 : 0.35,
              },
            ]}
          >
            <SkipForward size={22} color={isDark ? "#ecfdf5" : "#1a4731"} />
          </Pressable>
        </View>

        {/* Speed Control */}
        <View style={styles.speedControl}>
          {[0.75, 1, 1.25, 1.5].map((speed) => (
            <Pressable
              key={speed}
              onPress={() => audio.setPlaybackSpeed(speed)}
              style={[
                styles.speedBtn,
                {
                  backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                  borderWidth: 1,
                  borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.07)",
                  borderRadius: 8,
                },
              ]}
            >
              <Text
                style={[
                  styles.speedText,
                  { color: isDark ? "#a7f3d0" : "#374151", fontFamily: "IBMPlexSansArabic_400Regular" },
                ]}
              >
                {speed}×
              </Text>
            </Pressable>
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    start: 0,
    end: 0,
    borderTopStartRadius: 24,
    borderTopEndRadius: 24,
    overflow: "hidden",
  },
  progressTrack: { height: 3, width: "100%" },
  progressFill: { height: "100%" },
  content: { padding: 20, paddingBottom: 32 },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  surahInfo: { flex: 1, alignItems: "center" },
  surahName: { fontSize: 18, fontWeight: "bold", textAlign: "center" },
  reciterName: { fontSize: 12, marginTop: 2, textAlign: "center" },
  ayahInfo: { fontSize: 13, marginTop: 4, textAlign: "center" },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -4,
  },
  timeDisplay: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  timeText: { fontSize: 12 },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 28,
    marginBottom: 18,
  },
  controlBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  playBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  speedControl: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  speedBtn: { paddingHorizontal: 14, paddingVertical: 6 },
  speedText: { fontSize: 13, fontWeight: "600" },
});
