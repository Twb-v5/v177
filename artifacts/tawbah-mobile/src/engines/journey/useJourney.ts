import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import type { JourneyData } from "./types";
import { buildNativeFallbackJourney } from "./utils";
import { getApiBase } from "@/lib/api";
import { getSessionId } from "@/lib/session";

const JOURNEY_QUERY_KEY = (sessionId: string) => ["journey30", sessionId];

export function useJourney() {
  const sessionId = getSessionId();
  const queryClient = useQueryClient();
  const [localAllDone, setLocalAllDone] = useState(false);

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery<JourneyData>({
    queryKey: JOURNEY_QUERY_KEY(sessionId),
    queryFn: async () => {
      try {
        const base = getApiBase().replace(/\/+$/, "");
        const res = await fetch(
          `${base}/journey30?sessionId=${encodeURIComponent(sessionId)}`,
          { headers: { "Content-Type": "application/json" } }
        );
        if (!res.ok) throw new Error(`HTTP_${res.status}`);
        return res.json() as Promise<JourneyData>;
      } catch {
        return buildNativeFallbackJourney();
      }
    },
    enabled: !!sessionId,
    refetchInterval: false,
    retry: false,
    staleTime: 30_000,
  });

  const completeMutation = useMutation({
    mutationFn: async (dayNumber: number) => {
      const base = getApiBase().replace(/\/+$/, "");
      try {
        const res = await fetch(`${base}/journey30/complete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dayNumber, sessionId }),
        });
        return res.json();
      } catch {
        return { ok: true };
      }
    },
    onSuccess: () => {
      setLocalAllDone(false);
      queryClient.invalidateQueries({ queryKey: JOURNEY_QUERY_KEY(sessionId) });
    },
  });

  const completeDay = useCallback(
    (dayNumber: number) => {
      completeMutation.mutate(dayNumber);
    },
    [completeMutation]
  );

  const markLocalAllDone = useCallback(() => {
    setLocalAllDone(true);
  }, []);

  const currentDay = data?.days.find((d) => d.isCurrent) ?? null;
  const completedDays = data?.days.filter((d) => d.completed).reverse() ?? [];
  const completedCount = data?.completedCount ?? 0;
  const streakDays = data?.streakDays ?? 0;
  const progress = (completedCount / 30) * 100;
  const nextDayNum = (currentDay?.day ?? 0) + 1;

  const tasksAllDone =
    localAllDone ||
    ((currentDay?.taskChecks?.length ?? 0) > 0 &&
      (currentDay?.taskChecks?.every(Boolean) ?? false));

  const isComplete = completedCount === 30;

  return {
    data,
    isLoading,
    isError,
    refetch,
    currentDay,
    completedDays,
    completedCount,
    streakDays,
    progress,
    nextDayNum,
    tasksAllDone,
    isComplete,
    localAllDone,
    markLocalAllDone,
    completeDay,
    isCompletingDay: completeMutation.isPending,
    sessionId,
  };
}
