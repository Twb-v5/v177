import { useState, useRef, useCallback, useEffect } from "react";
import { Audio } from "expo-av";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type {
  Message, MessageSegment, ApiHistory, ChatState, RiskAlert, VoiceProfile,
} from "./types";
import {
  VOICE_PROFILES, VOICE_PROFILE_STORAGE_KEY, DEFAULT_VOICE_PROFILE_ID,
  pickStarterQuestions, getTimeBasedGreeting,
} from "./constants";
import { getApiBase, aiUrl } from "@/lib/api";
import { getSessionId } from "@/lib/session";

const GENDER_KEY = "tawbah_gender";

function buildGreetingMessage(): Message {
  return {
    id: "greeting",
    role: "bot",
    text: getTimeBasedGreeting(),
    segments: [],
    timestamp: new Date(),
    suggestions: [],
    suggestionsLoading: false,
  };
}

export function useZakiy() {
  const [messages, setMessages] = useState<Message[]>(() => [buildGreetingMessage()]);
  const [input, setInput] = useState("");
  const [chatState, setChatState] = useState<ChatState>("idle");
  const [recording, setRecording] = useState(false);
  const [riskAlert, setRiskAlert] = useState<RiskAlert | null>(null);
  const [riskDismissed, setRiskDismissed] = useState(false);
  const [anniversaryMilestone, setAnniversaryMilestone] = useState<string | null>(null);
  const [voiceProfileId, setVoiceProfileId] = useState<string>(DEFAULT_VOICE_PROFILE_ID);
  const [voiceSelectorOpen, setVoiceSelectorOpen] = useState(false);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());
  const [starters] = useState(() => pickStarterQuestions(6));

  const recordingRef = useRef<Audio.Recording | null>(null);
  const isBusy = chatState === "thinking" || chatState === "responding";

  const sessionId = getSessionId();

  useEffect(() => {
    async function loadVoiceProfile() {
      try {
        const [stored, gender] = await Promise.all([
          AsyncStorage.getItem(VOICE_PROFILE_STORAGE_KEY),
          AsyncStorage.getItem(GENDER_KEY),
        ]);
        const userGender = (gender as "male" | "female") ?? "male";
        const defaultForGender = userGender === "female" ? "sister-caring" : DEFAULT_VOICE_PROFILE_ID;
        setVoiceProfileId(stored ?? defaultForGender);
      } catch {}
    }
    loadVoiceProfile();
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;

    async function checkAnniversaryAndRisk() {
      try {
        const [annRes, riskRes] = await Promise.all([
          fetch(aiUrl(`/api/zakiy/anniversary?sessionId=${encodeURIComponent(sessionId)}`)),
          fetch(aiUrl(`/api/zakiy/risk-check?sessionId=${encodeURIComponent(sessionId)}`)),
        ]);
        if (cancelled) return;

        const [annData, riskData] = await Promise.all([
          annRes.json() as Promise<{ anniversary: { milestone: string; message: string } | null }>,
          riskRes.json() as Promise<{ risk: { level: "medium" | "high"; message: string; sign: string | null } | null }>,
        ]);

        if (cancelled) return;

        if (annData.anniversary?.message) {
          const { milestone, message } = annData.anniversary;
          setAnniversaryMilestone(milestone);
          addBotMessageDirect(message, [{ type: "text", text: message }]);
        }

        if (riskData.risk?.level === "medium" || riskData.risk?.level === "high") {
          setRiskAlert({
            level: riskData.risk.level,
            message: riskData.risk.message,
            sign: riskData.risk.sign,
          });
        }
      } catch {}
    }

    checkAnniversaryAndRisk();
    return () => { cancelled = true; };
  }, [sessionId]);

  function buildHistory(): ApiHistory[] {
    return messages
      .filter((m) => m.id !== "greeting")
      .map((m) => ({
        role: m.role === "user" ? ("user" as const) : ("assistant" as const),
        content: m.text,
      }));
  }

  async function fetchSuggestions(history: ApiHistory[], msgId: string) {
    try {
      const res = await fetch(aiUrl("/api/zakiy/suggestions"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ history, sessionId }),
      });
      const data = await res.json();
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId
            ? { ...m, suggestions: data.suggestions ?? [], suggestionsLoading: false }
            : m
        )
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId ? { ...m, suggestions: [], suggestionsLoading: false } : m
        )
      );
    }
  }

  function addBotMessageDirect(text: string, segments?: MessageSegment[]) {
    const id = Date.now().toString();
    const msg: Message = {
      id,
      role: "bot",
      text,
      segments: segments ?? [],
      timestamp: new Date(),
      suggestions: [],
      suggestionsLoading: false,
    };
    setMessages((prev) => [...prev, msg]);
  }

  function addBotMessage(text: string, segments?: MessageSegment[]) {
    const id = Date.now().toString();
    const msg: Message = {
      id,
      role: "bot",
      text,
      segments: segments ?? [],
      timestamp: new Date(),
      suggestions: [],
      suggestionsLoading: true,
    };
    setMessages((prev) => [...prev, msg]);
    const currentHistory = buildHistory();
    fetchSuggestions([...currentHistory, { role: "assistant", content: text }], msg.id);
  }

  function addUserMessage(text: string) {
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString() + "u", role: "user", text, timestamp: new Date() },
    ]);
  }

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isBusy) return;

    const history = buildHistory();
    addUserMessage(trimmed);
    setInput("");
    setChatState("thinking");

    try {
      const res = await fetch(aiUrl("/api/zakiy/message"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history,
          sessionId,
          voiceProfile: voiceProfileId,
        }),
      });
      const raw = await res.text();
      let data: any = null;
      try { data = raw ? JSON.parse(raw) : null; } catch { data = null; }

      if (!res.ok) {
        const serverError =
          data && typeof data.error === "string" && data.error.trim()
            ? data.error
            : "";
        throw new Error(serverError || `HTTP_${res.status}`);
      }

      setChatState("responding");
      addBotMessage(String(data?.response ?? ""), data?.segments);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setChatState("error");
      if (
        msg === "Network request failed" ||
        msg === "Failed to fetch" ||
        msg.startsWith("HTTP_")
      ) {
        addBotMessage("عذراً يا صاحبي، في مشكلة تقنية. تأكد من اتصال الإنترنت وجرّب تاني.");
      } else {
        addBotMessage("عذراً يا صاحبي، في مشكلة تقنية. جرّب تاني بعد شوية.");
      }
    } finally {
      setChatState("idle");
    }
  }, [isBusy, voiceProfileId, sessionId]);

  const startVoiceRecording = useCallback(async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        addBotMessage("تعذّر الوصول للميكروفون. تأكد من منح الإذن في إعدادات التطبيق.");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setRecording(true);
    } catch (e) {
      console.error("[Zakiy] startVoiceRecording failed:", e);
      addBotMessage("تعذّر بدء التسجيل — جرّب مرة ثانية.");
    }
  }, []);

  const stopVoiceRecording = useCallback(async () => {
    const rec = recordingRef.current;
    if (!rec) return;
    setRecording(false);

    try {
      await rec.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      const uri = rec.getURI();
      recordingRef.current = null;

      if (!uri) {
        addBotMessage("ما قدرت أسمعك — جرّب مرة ثانية.");
        return;
      }

      setChatState("thinking");

      const formData = new FormData();
      formData.append("audio", {
        uri,
        name: "recording.m4a",
        type: "audio/m4a",
      } as any);
      formData.append("sessionId", sessionId);
      formData.append("voiceProfile", voiceProfileId);

      const history = buildHistory();
      const res = await fetch(aiUrl("/api/zakiy/voice"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audioUri: uri,
          history,
          sessionId,
          voiceProfile: voiceProfileId,
        }),
      });
      const raw = await res.text();
      let data: any = null;
      try { data = raw ? JSON.parse(raw) : null; } catch { data = null; }

      if (!res.ok) {
        const serverError =
          data && typeof data.error === "string" && data.error.trim()
            ? data.error
            : "";
        throw new Error(serverError || `HTTP_${res.status}`);
      }

      setChatState("responding");
      addBotMessage(String(data?.response ?? ""), data?.segments);
    } catch (e) {
      console.error("[Zakiy] stopVoiceRecording send failed:", e);
      setChatState("error");
      addBotMessage("ما قدرت أسمعك — تأكد من السماح بالميكروفون وجرّب مرة ثانية.");
    } finally {
      setChatState("idle");
    }
  }, [voiceProfileId, sessionId]);

  const handleVoiceProfileSelect = useCallback(async (id: string) => {
    setVoiceProfileId(id);
    try {
      await AsyncStorage.setItem(VOICE_PROFILE_STORAGE_KEY, id);
    } catch {}
    setVoiceSelectorOpen(false);
  }, []);

  const handleDismissSuggestion = useCallback((msgId: string) => {
    setDismissedSuggestions((prev) => new Set(prev).add(msgId));
  }, []);

  const dismissRiskAlert = useCallback(() => {
    setRiskDismissed(true);
  }, []);

  const currentVoiceProfile: VoiceProfile =
    VOICE_PROFILES.find((p) => p.id === voiceProfileId) ?? VOICE_PROFILES[1]!;

  const hasUserMessages = messages.some((m) => m.role === "user");
  const showRiskAlert = riskAlert !== null && !riskDismissed;

  return {
    messages,
    input,
    setInput,
    chatState,
    isBusy,
    recording,
    riskAlert: showRiskAlert ? riskAlert : null,
    anniversaryMilestone,
    voiceProfileId,
    voiceSelectorOpen,
    setVoiceSelectorOpen,
    currentVoiceProfile,
    starters,
    hasUserMessages,
    dismissedSuggestions,
    sendMessage,
    startVoiceRecording,
    stopVoiceRecording,
    handleVoiceProfileSelect,
    handleDismissSuggestion,
    dismissRiskAlert,
    buildHistory,
    VOICE_PROFILES,
  };
}
