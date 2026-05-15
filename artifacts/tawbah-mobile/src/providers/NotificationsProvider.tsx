import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

let Notifications: typeof import("expo-notifications") | null = null;
let Device: typeof import("expo-device") | null = null;

if (Platform.OS !== "web") {
  Notifications = require("expo-notifications");
  Device = require("expo-device");
}

interface NotificationsContextType {
  duaPeakVisible: boolean;
  adhkarVisible: boolean;
  adhkarType: "morning" | "evening" | null;
  showDuaPeak: () => void;
  hideDuaPeak: () => void;
  showAdhkar: (type: "morning" | "evening") => void;
  hideAdhkar: () => void;
  requestPermissions: () => Promise<boolean>;
}

const ADHKAR_DISMISSED_KEY = "adhkar_dismissed";

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

if (Platform.OS !== "web" && Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [duaPeakVisible, setDuaPeakVisible] = useState(false);
  const [adhkarVisible, setAdhkarVisible] = useState(false);
  const [adhkarType, setAdhkarType] = useState<"morning" | "evening" | null>(null);

  useEffect(() => {
    async function checkDismissed() {
      try {
        const stored = await AsyncStorage.getItem(ADHKAR_DISMISSED_KEY);
        if (stored) {
          const { type, time } = JSON.parse(stored);
          const hour = 24 * 60 * 60 * 1000;
          if (Date.now() - time < hour && type === adhkarType) {
            setAdhkarVisible(false);
          }
        }
      } catch {}
    }
    checkDismissed();
  }, [adhkarType]);

  const requestPermissions = useCallback(async () => {
    if (Platform.OS === "web" || !Device || !Notifications) return false;
    if (!Device.isDevice) return false;
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === "granted") return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  }, []);

  const hideAdhkar = useCallback(() => {
    setAdhkarVisible(false);
    if (adhkarType) {
      AsyncStorage.setItem(
        ADHKAR_DISMISSED_KEY,
        JSON.stringify({ type: adhkarType, time: Date.now() })
      ).catch(() => {});
    }
  }, [adhkarType]);

  return (
    <NotificationsContext.Provider
      value={{
        duaPeakVisible,
        adhkarVisible,
        adhkarType,
        showDuaPeak: () => setDuaPeakVisible(true),
        hideDuaPeak: () => setDuaPeakVisible(false),
        showAdhkar: (type) => { setAdhkarType(type); setAdhkarVisible(true); },
        hideAdhkar,
        requestPermissions,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationsProvider");
  return ctx;
}
