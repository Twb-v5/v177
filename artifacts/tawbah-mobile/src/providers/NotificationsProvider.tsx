import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

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

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

Notifications.setNotificationHandler({
  handleNotification: async () => ({ 
    shouldShowAlert: true, 
    shouldPlaySound: true, 
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [duaPeakVisible, setDuaPeakVisible] = useState(false);
  const [adhkarVisible, setAdhkarVisible] = useState(false);
  const [adhkarType, setAdhkarType] = useState<"morning" | "evening" | null>(null);

  useEffect(() => {
    try {
      if (typeof localStorage === "undefined") return;
      const stored = localStorage.getItem("adhkar_dismissed");
      if (stored) {
        const { type, time } = JSON.parse(stored);
        const now = Date.now();
        const hour = 24 * 60 * 60 * 1000;
        if (now - time < hour && type === adhkarType) {
          setAdhkarVisible(false);
        }
      }
    } catch {}
  }, [adhkarType]);

  const requestPermissions = useCallback(async () => {
    if (!Device.isDevice) return false;
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === "granted") return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  }, []);

  return (
    <NotificationsContext.Provider
      value={{
        duaPeakVisible,
        adhkarVisible,
        adhkarType,
        showDuaPeak: () => setDuaPeakVisible(true),
        hideDuaPeak: () => setDuaPeakVisible(false),
        showAdhkar: (type) => { setAdhkarType(type); setAdhkarVisible(true); },
        hideAdhkar: () => setAdhkarVisible(false),
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
