export type Lang = 'hi' | 'bho';

export interface FarmerContext {
  district?: string; // district id
  block?: string;
  village?: string;
  landAcres?: number;
  crops?: string[];
  irrigation?: 'none' | 'partial' | 'full';
  soil?: string;
}

export interface SourceRef {
  title: string;
  url: string;
  lastUpdated: string;
  status?: string;
}

/** What kind of statement this is — shown to the farmer as a trust badge. */
export type AnswerKind =
  | 'data' // from an official dataset (mandi, weather)
  | 'knowledge' // from the curated knowledge base
  | 'ai_explanation' // phrased by an LLM from retrieved facts
  | 'clarifying_question'
  | 'no_data'
  | 'safety';

export interface AssistantReply {
  text: string;
  lang: Lang;
  kind: AnswerKind;
  confidence: 'high' | 'medium' | 'low';
  followUps: string[];
  sources: SourceRef[];
  suggestExpert: boolean;
  intent: string;
  data?: unknown;
}
