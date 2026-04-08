import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ZakiyMemory, ConversationTurn } from "./types";

const MEMORY_KEY = "zakiy_memory_v2";
const MAX_HISTORY = 30;

const DEFAULT_MEMORY: ZakiyMemory = {
  sinType: null,
  relapseCount: 0,
  emotionalState: "stable",
  journeyProgress: 0,
  lastInteraction: 0,
  conversationHistory: [],
  triggerTopics: [],
  userLanguage: "ar",
};

export async function loadMemory(): Promise<ZakiyMemory> {
  try {
    const raw = await AsyncStorage.getItem(MEMORY_KEY);
    if (!raw) return { ...DEFAULT_MEMORY };
    return { ...DEFAULT_MEMORY, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_MEMORY };
  }
}

export async function saveMemory(memory: ZakiyMemory): Promise<void> {
  try {
    const toSave: ZakiyMemory = {
      ...memory,
      conversationHistory: memory.conversationHistory.slice(-MAX_HISTORY),
    };
    await AsyncStorage.setItem(MEMORY_KEY, JSON.stringify(toSave));
  } catch {}
}

export async function appendTurn(turn: ConversationTurn): Promise<void> {
  const memory = await loadMemory();
  memory.conversationHistory = [...memory.conversationHistory, turn].slice(-MAX_HISTORY);
  memory.lastInteraction = Date.now();
  await saveMemory(memory);
}

export async function updateEmotionalState(
  state: ZakiyMemory["emotionalState"]
): Promise<void> {
  const memory = await loadMemory();
  memory.emotionalState = state;
  await saveMemory(memory);
}

export async function incrementRelapseCount(): Promise<number> {
  const memory = await loadMemory();
  memory.relapseCount += 1;
  await saveMemory(memory);
  return memory.relapseCount;
}

export async function setSinType(sinType: string): Promise<void> {
  const memory = await loadMemory();
  memory.sinType = sinType;
  await saveMemory(memory);
}

export async function updateJourneyProgress(progress: number): Promise<void> {
  const memory = await loadMemory();
  memory.journeyProgress = progress;
  await saveMemory(memory);
}

export async function clearMemory(): Promise<void> {
  await AsyncStorage.removeItem(MEMORY_KEY);
}
