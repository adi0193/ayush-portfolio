/**
 * Speech abstraction.
 *
 * STT: browser Web Speech API with `hi-IN` (no browser offers a Bhojpuri locale; Hindi
 * acoustic models partially cover Bhojpuri speech — accuracy MUST be benchmarked with
 * real farmers). Falls back to text input when unsupported (e.g. Firefox, some WebViews).
 * TTS: speechSynthesis with a Hindi voice, adjustable rate. Bhojpuri text is read by the
 * Hindi voice (same script) — acceptable for MVP, flagged for a dedicated Bhojpuri TTS.
 */
import type { Lang } from './types';

type SR = {
  lang: string; interimResults: boolean; maxAlternatives: number; continuous: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string; confidence: number }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void; stop(): void; abort(): void;
};

function getRecognitionCtor(): (new () => SR) | undefined {
  const w = window as unknown as { SpeechRecognition?: new () => SR; webkitSpeechRecognition?: new () => SR };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition;
}

export const sttSupported = () => !!getRecognitionCtor();
export const ttsSupported = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

export interface ListenHandle { stop(): void }

export function listen(
  _lang: Lang,
  cb: { onInterim(t: string): void; onFinal(t: string): void; onError(code: string): void; onEnd(): void },
): ListenHandle | null {
  const Ctor = getRecognitionCtor();
  if (!Ctor) return null;
  const r = new Ctor();
  r.lang = 'hi-IN';
  r.interimResults = true;
  r.maxAlternatives = 1;
  r.continuous = false;
  let finalText = '';
  r.onresult = (e) => {
    let interim = '';
    for (let i = 0; i < e.results.length; i++) {
      const res = e.results[i]!;
      const alt = res[0];
      if (!alt) continue;
      if (res.isFinal) finalText += alt.transcript;
      else interim += alt.transcript;
    }
    cb.onInterim(finalText + interim);
  };
  r.onerror = (e) => cb.onError(e.error);
  r.onend = () => {
    if (finalText.trim()) cb.onFinal(finalText.trim());
    cb.onEnd();
  };
  try {
    r.start();
  } catch {
    cb.onError('start_failed');
    return null;
  }
  return { stop: () => r.stop() };
}

function pickVoice(): SpeechSynthesisVoice | undefined {
  const voices = speechSynthesis.getVoices();
  return voices.find((v) => v.lang === 'hi-IN') ?? voices.find((v) => v.lang.startsWith('hi'));
}

export function speak(text: string, rate = 0.9, onEnd?: () => void): boolean {
  if (!ttsSupported()) return false;
  speechSynthesis.cancel();
  // Strip bracketed source notes and URLs so the voice reads only the answer.
  const clean = text.replace(/https?:\/\/\S+/g, '').replace(/\s+/g, ' ');
  const u = new SpeechSynthesisUtterance(clean);
  u.lang = 'hi-IN';
  const v = pickVoice();
  if (v) u.voice = v;
  u.rate = rate;
  u.onend = () => onEnd?.();
  u.onerror = () => onEnd?.();
  speechSynthesis.speak(u);
  return true;
}

export function stopSpeaking() {
  if (ttsSupported()) speechSynthesis.cancel();
}

export function hasHindiVoice(): boolean {
  return ttsSupported() && !!pickVoice();
}
