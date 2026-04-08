import { useState, useEffect, useCallback } from "react";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";

const ALADHAN_API = "https://api.aladhan.com/v1";

export interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  date: string;
}

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

export function usePrayerTimes() {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationPermission, setLocationPermission] = useState<boolean>(false);

  const normalizeTime = useCallback((time: string) => {
    const m = /^(\d{1,2}):(\d{2})/.exec(time.trim());
    if (!m) return null;
    const hh = String(Math.max(0, Math.min(23, Number(m[1])))).padStart(2, "0");
    const mm = String(Math.max(0, Math.min(59, Number(m[2])))).padStart(2, "0");
    return `${hh}:${mm}`;
  }, []);

  const requestLocationPermission = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const granted = status === "granted";
      setLocationPermission(granted);
      return granted;
    } catch (e) {
      setLocationPermission(false);
      return false;
    }
  }, []);

  const getCurrentLocation = useCallback(async () => {
    try {
      const granted = await requestLocationPermission();
      if (!granted) {
        setError("Location permission denied");
        setLoading(false);
        return null;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };
      setLocation(coords);
      return coords;
    } catch (e) {
      setError("Failed to get location");
      return null;
    }
  }, [requestLocationPermission]);

  const fetchPrayerTimes = useCallback(async (coords: LocationCoords) => {
    try {
      setLoading(true);
      const today = new Date();
      const dateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
      
      const res = await fetch(
        `${ALADHAN_API}/timings/${dateStr}?latitude=${coords.latitude}&longitude=${coords.longitude}&method=2`
      );
      
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      
      const timings = data.data.timings;

      const fajr = normalizeTime(String(timings.Fajr)) || String(timings.Fajr);
      const sunrise = normalizeTime(String(timings.Sunrise)) || String(timings.Sunrise);
      const dhuhr = normalizeTime(String(timings.Dhuhr)) || String(timings.Dhuhr);
      const asr = normalizeTime(String(timings.Asr)) || String(timings.Asr);
      const maghrib = normalizeTime(String(timings.Maghrib)) || String(timings.Maghrib);
      const isha = normalizeTime(String(timings.Isha)) || String(timings.Isha);

      setPrayerTimes({
        Fajr: fajr,
        Sunrise: sunrise,
        Dhuhr: dhuhr,
        Asr: asr,
        Maghrib: maghrib,
        Isha: isha,
        date: data.data.date.readable,
      });
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [normalizeTime]);

  const init = useCallback(async () => {
    const coords = await getCurrentLocation();
    if (coords) {
      await fetchPrayerTimes(coords);
    } else {
      setLoading(false);
    }
  }, [getCurrentLocation, fetchPrayerTimes]);

  useEffect(() => {
    init();
  }, [init]);

  const ensureNotificationsReady = useCallback(async () => {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      const req = await Notifications.requestPermissionsAsync();
      if (req.status !== "granted") return false;
    }

    if (process.env.EXPO_OS === "android") {
      await Notifications.setNotificationChannelAsync("prayer-times", {
        name: "Prayer Times",
        importance: Notifications.AndroidImportance.MAX,
        sound: "default",
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#22c55e",
      });
    }

    return true;
  }, []);

  const scheduleNotification = useCallback(async (prayerName: string, time: string) => {
    try {
      const normalized = normalizeTime(time);
      if (!normalized) return;
      const [hours, minutes] = normalized.split(":").map(Number);
      const trigger: Notifications.DailyTriggerInput = {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: hours,
        minute: minutes,
      };

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Prayer Time",
          body: `${prayerName} prayer time - ${normalized}`,
          ...(process.env.EXPO_OS === "android" ? { channelId: "prayer-times" } : null),
        },
        trigger,
      });
    } catch (e) {
      console.error("Failed to schedule notification:", e);
    }
  }, [normalizeTime]);

  const scheduleAllNotifications = useCallback(async () => {
    if (!prayerTimes) return;

    const ok = await ensureNotificationsReady();
    if (!ok) return;
    
    await scheduleNotification("Fajr", prayerTimes.Fajr);
    await scheduleNotification("Dhuhr", prayerTimes.Dhuhr);
    await scheduleNotification("Asr", prayerTimes.Asr);
    await scheduleNotification("Maghrib", prayerTimes.Maghrib);
    await scheduleNotification("Isha", prayerTimes.Isha);
  }, [ensureNotificationsReady, prayerTimes, scheduleNotification]);

  return {
    prayerTimes,
    location,
    loading,
    error,
    locationPermission,
    refresh: init,
    scheduleAllNotifications,
  };
}
