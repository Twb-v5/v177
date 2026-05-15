import { useState, useEffect, useCallback, useRef } from "react";
import { Platform } from "react-native";
import { Audio, AVPlaybackStatus, InterruptionModeAndroid, InterruptionModeIOS } from "expo-av";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const FileSystem = require("expo-file-system/legacy");

interface AudioState {
  isPlaying: boolean;
  isLoading: boolean;
  position: number;
  duration: number;
  currentAyah: number;
  currentSurah: number;
}

interface UseQuranAudioReturn extends AudioState {
  play: (surah: number, ayah: number, audioUrl: string, onFinished?: () => void) => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  stop: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  setPlaybackSpeed: (speed: number) => Promise<void>;
  downloadForOffline: (audioUrl: string, surah: number, ayah: number) => Promise<string | null>;
  isDownloaded: (surah: number, ayah: number) => Promise<boolean>;
}

const getOfflinePath = (surah: number, ayah: number): string => {
  return `${FileSystem.documentDirectory}quran/${surah}/${ayah}.mp3`;
};

export function useQuranAudio(): UseQuranAudioReturn {
  const soundRef = useRef<Audio.Sound | null>(null);
  const onFinishedRef = useRef<(() => void) | undefined>(undefined);

  const [state, setState] = useState<AudioState>({
    isPlaying: false,
    isLoading: false,
    position: 0,
    duration: 0,
    currentAyah: 0,
    currentSurah: 0,
  });

  useEffect(() => {
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          interruptionModeIOS: InterruptionModeIOS.DoNotMix,
          interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
          shouldDuckAndroid: false,
          playThroughEarpieceAndroid: false,
        });
      } catch (error) {
        console.error("Failed to setup audio mode:", error);
      }
    };
    setupAudio();

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      if (status.error) {
        console.error("Playback error:", status.error);
      }
      return;
    }

    setState((prev) => ({
      ...prev,
      isPlaying: status.isPlaying,
      isLoading: false,
      position: status.positionMillis,
      duration: status.durationMillis || 0,
    }));

    if (status.didJustFinish) {
      setState((prev) => ({ ...prev, isPlaying: false, position: 0 }));
      const cb = onFinishedRef.current;
      onFinishedRef.current = undefined;
      cb?.();
    }
  }, []);

  const play = useCallback(async (surah: number, ayah: number, audioUrl: string, onFinished?: () => void) => {
    try {
      onFinishedRef.current = onFinished;
      setState((prev) => ({ ...prev, isLoading: true, currentSurah: surah, currentAyah: ayah }));

      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      let uri = audioUrl;
      if (Platform.OS !== "web") {
        try {
          const offlinePath = getOfflinePath(surah, ayah);
          const { exists } = await FileSystem.getInfoAsync(offlinePath);
          if (exists) uri = offlinePath;
        } catch {
          // FileSystem not available, use streaming URL
        }
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true, progressUpdateIntervalMillis: 250 },
        onPlaybackStatusUpdate
      );

      soundRef.current = sound;
      setState((prev) => ({ ...prev, isPlaying: true, isLoading: false }));
    } catch (error) {
      console.error("Failed to play audio:", error);
      setState((prev) => ({ ...prev, isLoading: false }));
      onFinishedRef.current = undefined;
    }
  }, [onPlaybackStatusUpdate]);

  const pause = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.pauseAsync();
      setState((prev) => ({ ...prev, isPlaying: false }));
    }
  }, []);

  const resume = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.playAsync();
      setState((prev) => ({ ...prev, isPlaying: true }));
    }
  }, []);

  const stop = useCallback(async () => {
    onFinishedRef.current = undefined;
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.setPositionAsync(0);
      setState((prev) => ({ ...prev, isPlaying: false, position: 0 }));
    }
  }, []);

  const seekTo = useCallback(async (position: number) => {
    if (soundRef.current) {
      await soundRef.current.setPositionAsync(position);
    }
  }, []);

  const setPlaybackSpeed = useCallback(async (speed: number) => {
    if (soundRef.current) {
      await soundRef.current.setRateAsync(speed, true);
    }
  }, []);

  const downloadForOffline = useCallback(async (audioUrl: string, surah: number, ayah: number): Promise<string | null> => {
    try {
      const dir = `${FileSystem.documentDirectory}quran/${surah}`;
      const dirInfo = await FileSystem.getInfoAsync(dir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
      }
      const filePath = getOfflinePath(surah, ayah);
      const downloadResult = await FileSystem.downloadAsync(audioUrl, filePath);
      return downloadResult.uri;
    } catch (error) {
      console.error("Failed to download audio:", error);
      return null;
    }
  }, []);

  const isDownloaded = useCallback(async (surah: number, ayah: number): Promise<boolean> => {
    try {
      const filePath = getOfflinePath(surah, ayah);
      const { exists } = await FileSystem.getInfoAsync(filePath);
      return exists;
    } catch {
      return false;
    }
  }, []);

  return {
    ...state,
    play,
    pause,
    resume,
    stop,
    seekTo,
    setPlaybackSpeed,
    downloadForOffline,
    isDownloaded,
  };
}
