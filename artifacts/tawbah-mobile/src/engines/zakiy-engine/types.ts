export type EmotionalState =
  | "stable"
  | "guilty"
  | "relapsing"
  | "motivated"
  | "confused"
  | "distressed"
  | "hopeful"
  | "empty";

export type IntentType =
  | "repentance"
  | "relapse"
  | "guilt"
  | "motivation"
  | "question"
  | "greeting"
  | "crisis"
  | "dua"
  | "general";

export interface ZakiyMemory {
  sinType: string | null;
  relapseCount: number;
  emotionalState: EmotionalState;
  journeyProgress: number;
  lastInteraction: number;
  conversationHistory: ConversationTurn[];
  triggerTopics: string[];
  userLanguage: "ar" | "en" | "mixed";
}

export interface ConversationTurn {
  role: "user" | "assistant";
  text: string;
  timestamp: number;
  intent?: IntentType;
  emotionalState?: EmotionalState;
}

export interface ZakiyResponse {
  text: string;
  intent: IntentType;
  emotionalState: EmotionalState;
  triggerSOS: boolean;
  suggestedFollowUps: string[];
  audioReady: boolean;
}

export interface PersonalityProfile {
  id: string;
  tone: "formal" | "friendly" | "wise" | "gentle";
  gender: "male" | "female";
  style: "scholarly" | "brotherly" | "sisterly" | "mentoring";
}
