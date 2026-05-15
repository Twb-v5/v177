import { useEffect, useRef } from "react";
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useQuranAudio } from "@/hooks/useQuranAudio";
import { useColors } from "@/hooks/useColors";

interface QuranAudioPlayerProps {
  surahName: string;
  visible: boolean;
  onClose: () => void;
}

export function QuranAudioPlayer({ surahName, visible, onClose }: QuranAudioPlayerProps) {
  const c = useColors();
  const isDark = c.isDark;
  const audio = useQuranAudio();
  
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
    width: `${progress.value * 100}%`,
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
          backgroundColor: c.surface,
          shadowColor: c.shadow,
          shadowOpacity: 0.3,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: -4 },
          elevation: 12,
          borderTopWidth: 1,
          borderColor: c.border,
        },
        animatedStyle,
      ]}
    >
      {/* Progress Bar */}
      <View style={[styles.progressTrack, { backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)" }]}>
        <Animated.View
          style={[styles.progressFill, { backgroundColor: c.primary }, progressStyle]}
        />
      </View>

      {/* Player Content */}
      <View style={styles.content}>
        {/* Surah Info */}
        <View style={styles.surahInfo}>
          <Text style={[styles.surahName, { color: c.text, fontFamily: "IBMPlexSansArabic_700Bold" }]} numberOfLines={1}>
            {surahName}
          </Text>
          <Text style={[styles.ayahInfo, { color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }]}>
            الآية {audio.currentAyah || 1}
          </Text>
        </View>

        {/* Time Display */}
        <View style={styles.timeDisplay}>
          <Text style={[styles.timeText, { color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }]}>
            {formatTime(audio.position)}
          </Text>
          <Text style={[styles.timeText, { color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }]}>
            {formatTime(audio.duration)}
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <Pressable onPress={() => audio.skipToPrevious()} style={[styles.controlBtn, { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", borderRadius: 12 }]}>
            <Text style={[styles.controlBtnText, { color: c.text }]}>‹‹</Text>
          </Pressable>

          <Pressable
            onPress={() => audio.isPlaying ? audio.pause() : audio.resume()}
            style={[styles.playBtn, { backgroundColor: c.primary, shadowColor: c.primary, shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 6 }]}
          >
            {audio.isLoading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={[styles.playBtnText, { color: c.textInverse }]}>{audio.isPlaying ? "⏸" : "▶"}</Text>
            )}
          </Pressable>

          <Pressable onPress={() => audio.skipToNext()} style={[styles.controlBtn, { backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)", borderRadius: 12 }]}>
            <Text style={[styles.controlBtnText, { color: c.text }]}>››</Text>
          </Pressable>
        </View>

        {/* Speed Control */}
        <View style={styles.speedControl}>
          {[0.75, 1, 1.5, 2].map((speed) => (
            <Pressable key={speed} onPress={() => audio.setPlaybackSpeed(speed)} style={[styles.speedBtn, {
              backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
              borderRadius: 8,
              borderWidth: 1,
              borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.07)",
            }]}>
              <Text style={[styles.speedText, { color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }]}>{speed}×</Text>
            </Pressable>
          ))}
        </View>

        {/* Close */}
        <Pressable onPress={onClose} style={[styles.closeBtn, { backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", borderRadius: 10 }]}>
          <Text style={[styles.closeText, { color: c.textMuted, fontFamily: "IBMPlexSansArabic_400Regular" }]}>إغلاق</Text>
        </Pressable>
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
  surahInfo: { alignItems: "center", marginBottom: 12 },
  surahName: { fontSize: 18, fontWeight: "bold" },
  ayahInfo: { fontSize: 13, marginTop: 2 },
  timeDisplay: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  timeText: { fontSize: 12 },
  controls: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 24, marginBottom: 16 },
  controlBtn: { padding: 12 },
  controlBtnText: { fontSize: 20, fontWeight: "bold" },
  playBtn: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center" },
  playBtnText: { fontSize: 22, fontWeight: "bold" },
  speedControl: { flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 12 },
  speedBtn: { paddingHorizontal: 14, paddingVertical: 6 },
  speedText: { fontSize: 13, fontWeight: "600" },
  closeBtn: { alignSelf: "center", paddingHorizontal: 24, paddingVertical: 8, marginTop: 4 },
  closeText: { fontSize: 13 },
});
