import { useEffect, useRef } from "react";
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  runOnJS 
} from "react-native-reanimated";
import { useQuranAudio } from "@/hooks/useQuranAudio";
import { useSettings } from "@/providers/SettingsProvider";

interface QuranAudioPlayerProps {
  surahName: string;
  visible: boolean;
  onClose: () => void;
}

export function QuranAudioPlayer({ surahName, visible, onClose }: QuranAudioPlayerProps) {
  const { resolvedTheme } = useSettings();
  const isDark = resolvedTheme === "dark";
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
        { backgroundColor: isDark ? "#1e293b" : "#ffffff" },
        animatedStyle
      ]}
    >
      {/* Progress Bar */}
      <View style={[styles.progressTrack, { backgroundColor: isDark ? "#334155" : "#e2e8f0" }]}>
        <Animated.View 
          style={[styles.progressFill, { backgroundColor: "#1a4731" }, progressStyle]} 
        />
      </View>

      {/* Player Content */}
      <View style={styles.content}>
        {/* Surah Info */}
        <View style={styles.surahInfo}>
          <Text style={[styles.surahName, { color: isDark ? "#f1f5f9" : "#1e293b" }]} numberOfLines={1}>
            {surahName}
          </Text>
          <Text style={[styles.ayahInfo, { color: isDark ? "#94a3b8" : "#64748b" }]}>
            Ayah {audio.currentAyah || 1}
          </Text>
        </View>

        {/* Time Display */}
        <View style={styles.timeDisplay}>
          <Text style={[styles.timeText, { color: isDark ? "#94a3b8" : "#64748b" }]}>
            {formatTime(audio.position)}
          </Text>
          <Text style={[styles.timeText, { color: isDark ? "#94a3b8" : "#64748b" }]}>
            {formatTime(audio.duration)}
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <Pressable onPress={() => audio.skipToPrevious()} style={styles.controlBtn}>
            <Text style={[styles.controlBtnText, { color: isDark ? "#f1f5f9" : "#1e293b" }]}>««</Text>
          </Pressable>
          
          <Pressable 
            onPress={() => audio.isPlaying ? audio.pause() : audio.resume()} 
            style={[styles.playBtn, { backgroundColor: "#1a4731" }]}
          >
            {audio.isLoading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.playBtnText}>{audio.isPlaying ? "||" : "»"}</Text>
            )}
          </Pressable>
          
          <Pressable onPress={() => audio.skipToNext()} style={styles.controlBtn}>
            <Text style={[styles.controlBtnText, { color: isDark ? "#f1f5f9" : "#1e293b" }]}>»»</Text>
          </Pressable>
        </View>

        {/* Speed Control */}
        <View style={styles.speedControl}>
          <Pressable onPress={() => audio.setPlaybackSpeed(0.75)} style={styles.speedBtn}>
            <Text style={[styles.speedText, { color: isDark ? "#64748b" : "#94a3b8" }]}>0.75x</Text>
          </Pressable>
          <Pressable onPress={() => audio.setPlaybackSpeed(1)} style={styles.speedBtn}>
            <Text style={[styles.speedText, { color: isDark ? "#22c55e" : "#1a4731" }]}>1x</Text>
          </Pressable>
          <Pressable onPress={() => audio.setPlaybackSpeed(1.5)} style={styles.speedBtn}>
            <Text style={[styles.speedText, { color: isDark ? "#64748b" : "#94a3b8" }]}>1.5x</Text>
          </Pressable>
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
    elevation: 12,
    overflow: "hidden",
  },
  progressTrack: {
    height: 3,
    width: "100%",
  },
  progressFill: {
    height: "100%",
  },
  content: {
    padding: 20,
    paddingBottom: 36,
  },
  surahInfo: {
    alignItems: "center",
    marginBottom: 12,
  },
  surahName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  ayahInfo: {
    fontSize: 13,
    marginTop: 2,
  },
  timeDisplay: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  timeText: {
    fontSize: 12,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 24,
    marginBottom: 16,
  },
  controlBtn: {
    padding: 12,
  },
  controlBtnText: {
    fontSize: 22,
    fontWeight: "bold",
  },
  playBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  playBtnText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "bold",
  },
  speedControl: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
  },
  speedBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  speedText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
