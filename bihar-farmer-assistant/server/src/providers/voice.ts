/**
 * Provider-independent speech interfaces.
 *
 * MVP: speech runs in the browser (Web Speech API, hi-IN) so no audio leaves the phone
 * for STT/TTS on supported devices. Server-side providers plug in here once benchmarked
 * on real Bhojpuri audio (candidates: AI4Bharat IndicConformer fine-tuned on Bhojpuri,
 * Bhashini ULCA ASR/TTS, commercial Indic STT). No provider is selected until the
 * benchmark in docs/11-ai-voice-architecture.md is run — Hindi support does NOT imply
 * Bhojpuri accuracy.
 */
import type { Lang } from '../lib/types.js';

export interface SpeechToText {
  readonly name: string;
  transcribe(audio: Buffer, mime: string, lang: Lang): Promise<{ text: string; confidence?: number }>;
}

export interface TextToSpeech {
  readonly name: string;
  synthesize(text: string, lang: Lang, opts?: { rate?: number }): Promise<{ audio: Buffer; mime: string }>;
}

export class NotConfiguredError extends Error {
  constructor(what: string) {
    super(`${what} provider not configured`);
  }
}

export function getSttProvider(): SpeechToText | null {
  return null; // configure after the Bhojpuri benchmark
}

export function getTtsProvider(): TextToSpeech | null {
  return null;
}
