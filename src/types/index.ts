export type Difficulty = "beginner" | "intermediate" | "advanced";

export type StepId = 1 | 2 | 3 | 4 | 5;

export interface StepMeta {
  id: StepId;
  title: string;
  question: string;
  shortLabel: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  step?: StepId;
  createdAt: number;
}

export interface AdContext {
  place?: string;
  medium?: string;
  notes?: string;
  copyText?: string;
  imageDataUrl?: string;
  imageFeatures?: ImageFeatures;
}

export interface ImageFeatures {
  width: number;
  height: number;
  aspectRatio: number;
  dominantColors: string[];
  brightness: number;
}

export interface StepAnswer {
  step: StepId;
  userText: string;
  feedback: string;
  followUp?: string;
}

export interface Score {
  total: number;
  breakdown: Record<StepId, number>;
  comment: string;
}

export interface AnalysisRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  difficulty: Difficulty;
  context: AdContext;
  messages: ChatMessage[];
  answers: StepAnswer[];
  currentStep: StepId | null;
  finished: boolean;
  score?: Score;
}

export interface FrameworkInfo {
  key: "FAB" | "AIDA" | "STP" | "JTBD" | "BE";
  name: string;
  fullName: string;
  level: Difficulty;
  summary: string;
  points: string[];
  example: string;
}
