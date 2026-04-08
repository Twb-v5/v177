import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { SettingsProvider } from "@/providers/SettingsProvider";
import { ZakiyModeProvider } from "@/providers/ZakiyModeProvider";
import { NotificationsProvider } from "@/providers/NotificationsProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { I18nManager } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import * as SplashScreen from "expo-splash-screen";
import { useFonts as useAmiriFonts, Amiri_400Regular, Amiri_700Bold } from "@expo-google-fonts/amiri";
import {
  useFonts as usePlexArabicFonts,
  IBMPlexSansArabic_400Regular,
  IBMPlexSansArabic_500Medium,
  IBMPlexSansArabic_700Bold,
} from "@expo-google-fonts/ibm-plex-sans-arabic";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: 1,
      },
    },
  }));

  useEffect(() => {
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(false);
  }, []);

  const [amiriLoaded, amiriError] = useAmiriFonts({
    Amiri_400Regular,
    Amiri_700Bold,
  });

  const [plexLoaded, plexError] = usePlexArabicFonts({
    IBMPlexSansArabic_400Regular,
    IBMPlexSansArabic_500Medium,
    IBMPlexSansArabic_700Bold,
  });

  const fontsReady = (amiriLoaded || !!amiriError) && (plexLoaded || !!plexError);

  useEffect(() => {
    if (fontsReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsReady]);

  if (!fontsReady) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <SettingsProvider>
            <AuthProvider>
              <NotificationsProvider>
                <ZakiyModeProvider>
                  <StatusBar style="auto" />
                  <Stack
                    screenOptions={{
                      headerShown: false,
                      contentStyle: { backgroundColor: "transparent" },
                      animation: "fade",
                    }}
                  />
                </ZakiyModeProvider>
              </NotificationsProvider>
            </AuthProvider>
          </SettingsProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
