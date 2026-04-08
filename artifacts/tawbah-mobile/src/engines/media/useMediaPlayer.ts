import { useState, useCallback, useRef, useEffect } from "react";
import { Audio, AVPlaybackStatus } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ActiveMedia, PlaybackState } from "./types";

const RECENTLY_PLAYED_KEY = "media_recently_played";
const FAVORITES_KEY = "media_favorites";
const PROGRESS_KEY = "media_progress";

interface MediaProgress {
  positionMs: number;
  durationMs: number;
  lastUpdated: number;
}

export function useMediaPlayer() {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [activeMedia, setActiveMedia] = useState<ActiveMedia | null>(null);
  const [playbackState, setPlaybackState] = useState<PlaybackState>("idle");
  const [positionMs, setPositionMs] = useState(0);
  const [durationMs, setDurationMs] = useState(0);
  const [recentlyPlayed, setRecentlyPlayed] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState<Record<string, MediaProgress>>({});

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: false,
    }).catch(() => {});

    async function loadPersisted() {
      try {
        const [recent, favs, prog] = await Promise.all([
          AsyncStorage.getItem(RECENTLY_PLAYED_KEY),
          AsyncStorage.getItem(FAVORITES_KEY),
          AsyncStorage.getItem(PROGRESS_KEY),
        ]);
        if (recent) setRecentlyPlayed(JSON.parse(recent));
        if (favs) setFavorites(new Set(JSON.parse(favs)));
        if (prog) setProgress(JSON.parse(prog));
      } catch {}
    }
    loadPersisted();

    return () => {
      soundRef.current?.unloadAsync().catch(() => {});
    };
  }, []);

  function onPlaybackStatusUpdate(status: AVPlaybackStatus) {
    if (!status.isLoaded) {
      if ((status as any).error) {
        setPlaybackState("error");
      }
      return;
    }
    setPositionMs(status.positionMillis ?? 0);
    setDurationMs(status.durationMillis ?? 0);

    if (status.isPlaying) {
      setPlaybackState("playing");
    } else if (status.isBuffering) {
      setPlaybackState("loading");
    } else {
      setPlaybackState("paused");
    }

    if (status.didJustFinish) {
      setPlaybackState("idle");
      setPositionMs(0);
    }
  }

  async function saveProgress(mediaId: string, posMs: number, durMs: number) {
    const updated = {
      ...progress,
      [mediaId]: { positionMs: posMs, durationMs: durMs, lastUpdated: Date.now() },
    };
    setProgress(updated);
    try {
      await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(updated));
    } catch {}
  }

  async function addToRecentlyPlayed(mediaId: string) {
    const filtered = recentlyPlayed.filter((id) => id !== mediaId);
    const updated = [mediaId, ...filtered].slice(0, 20);
    setRecentlyPlayed(updated);
    try {
      await AsyncStorage.setItem(RECENTLY_PLAYED_KEY, JSON.stringify(updated));
    } catch {}
  }

  const play = useCallback(async (media: ActiveMedia) => {
    const isSameMedia = activeMedia?.id === media.id;

    if (isSameMedia && soundRef.current) {
      const status = await soundRef.current.getStatusAsync();
      if (status.isLoaded) {
        if (status.isPlaying) {
          await soundRef.current.pauseAsync();
          setPlaybackState("paused");
          if (status.positionMillis && status.durationMillis) {
            await saveProgress(media.id, status.positionMillis, status.durationMillis);
          }
        } else {
          await soundRef.current.playAsync();
          setPlaybackState("playing");
        }
        return;
      }
    }

    if (soundRef.current) {
      const oldId = activeMedia?.id;
      const oldPos = positionMs;
      const oldDur = durationMs;
      if (oldId && oldPos > 0) {
        await saveProgress(oldId, oldPos, oldDur);
      }
      await soundRef.current.unloadAsync().catch(() => {});
      soundRef.current = null;
    }

    setActiveMedia(media);
    setPlaybackState("loading");
    setPositionMs(0);
    setDurationMs(0);

    await addToRecentlyPlayed(media.id);

    const savedProgress = progress[media.id];
    const initialPosition = savedProgress?.positionMs ?? 0;

    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: media.url },
        {
          shouldPlay: true,
          positionMillis: initialPosition,
          progressUpdateIntervalMillis: 500,
        },
        onPlaybackStatusUpdate
      );
      soundRef.current = sound;
    } catch (e) {
      console.error("[MediaPlayer] Failed to load audio:", e);
      setPlaybackState("error");
    }
  }, [activeMedia, positionMs, durationMs, progress]);

  const pause = useCallback(async () => {
    if (!soundRef.current) return;
    try {
      await soundRef.current.pauseAsync();
      setPlaybackState("paused");
      if (activeMedia) {
        await saveProgress(activeMedia.id, positionMs, durationMs);
      }
    } catch {}
  }, [activeMedia, positionMs, durationMs]);

  const resume = useCallback(async () => {
    if (!soundRef.current) return;
    try {
      await soundRef.current.playAsync();
      setPlaybackState("playing");
    } catch {}
  }, []);

  const seek = useCallback(async (posMs: number) => {
    if (!soundRef.current) return;
    try {
      await soundRef.current.setPositionAsync(posMs);
      setPositionMs(posMs);
    } catch {}
  }, []);

  const stop = useCallback(async () => {
    if (soundRef.current) {
      if (activeMedia) {
        await saveProgress(activeMedia.id, positionMs, durationMs);
      }
      await soundRef.current.unloadAsync().catch(() => {});
      soundRef.current = null;
    }
    setActiveMedia(null);
    setPlaybackState("idle");
    setPositionMs(0);
    setDurationMs(0);
  }, [activeMedia, positionMs, durationMs]);

  const toggleFavorite = useCallback(async (mediaId: string) => {
    const updated = new Set(favorites);
    if (updated.has(mediaId)) {
      updated.delete(mediaId);
    } else {
      updated.add(mediaId);
    }
    setFavorites(updated);
    try {
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(updated)));
    } catch {}
  }, [favorites]);

  const isFavorite = useCallback(
    (mediaId: string) => favorites.has(mediaId),
    [favorites]
  );

  const getProgress = useCallback(
    (mediaId: string) => progress[mediaId] ?? null,
    [progress]
  );

  const isPlaying = playbackState === "playing";
  const isActiveMedia = useCallback(
    (mediaId: string) => activeMedia?.id === mediaId,
    [activeMedia]
  );

  return {
    activeMedia,
    playbackState,
    isPlaying,
    positionMs,
    durationMs,
    recentlyPlayed,
    favorites,
    play,
    pause,
    resume,
    seek,
    stop,
    toggleFavorite,
    isFavorite,
    getProgress,
    isActiveMedia,
  };
}
