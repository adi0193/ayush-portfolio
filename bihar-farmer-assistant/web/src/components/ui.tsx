import type { ReactNode } from 'react';
import { speak } from '../lib/speech';
import { tr, useApp } from '../lib/store';
import type { AssistantReply, SourceRef } from '../lib/types';

export function Header() {
  const { lang, setLang, online, go, page } = useApp();
  return (
    <header className="sticky top-0 z-20 bg-leaf-700 text-white shadow">
      <div className="mx-auto flex max-w-xl items-center gap-2 px-4 py-3">
        {page !== 'home' ? (
          <button onClick={() => go('home')} className="-ml-1 rounded-lg px-2 py-1 text-2xl" aria-label="वापस">←</button>
        ) : (
          <span className="text-2xl" aria-hidden>🌾</span>
        )}
        <div className="min-w-0 flex-1">
          <div className="truncate text-lg font-bold leading-tight">बिहार किसान सहायक</div>
          <div className="truncate text-xs text-leaf-100">खेती की सही जानकारी, अपनी भाषा में।</div>
        </div>
        <div role="group" aria-label="भाषा" className="flex overflow-hidden rounded-lg border border-white/60 text-sm">
          <button onClick={() => setLang('bho')} aria-pressed={lang === 'bho'} className={`px-2.5 py-1.5 ${lang === 'bho' ? 'bg-white font-bold text-leaf-800' : ''}`}>भोजपुरी</button>
          <button onClick={() => setLang('hi')} aria-pressed={lang === 'hi'} className={`px-2.5 py-1.5 ${lang === 'hi' ? 'bg-white font-bold text-leaf-800' : ''}`}>हिंदी</button>
        </div>
      </div>
      {!online && (
        <div role="status" className="bg-sun-400 px-4 py-1.5 text-center text-sm font-semibold text-soil-900">
          {tr(lang, 'इंटरनेट नहीं है – सहेजी हुई जानकारी दिख रही है', 'इंटरनेट नइखे – सहेजल जानकारी देखावल जा रहल बा')}
        </div>
      )}
    </header>
  );
}

export function Page({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <main className="mx-auto max-w-xl px-4 pb-24 pt-4">
      {title && <h1 className="mb-4 text-2xl font-bold text-leaf-900">{title}</h1>}
      {children}
    </main>
  );
}

export function SpeakButton({ text, small }: { text: string; small?: boolean }) {
  const { speechRate, lang } = useApp();
  return (
    <button
      onClick={() => speak(text, speechRate)}
      className={`inline-flex items-center gap-1 rounded-full border-2 border-leaf-600 bg-white font-semibold text-leaf-700 ${small ? 'px-3 py-1 text-sm' : 'px-4 py-2'}`}
      aria-label={tr(lang, 'सुनें', 'सुनीं')}
    >
      🔊 {tr(lang, 'सुनें', 'सुनीं')}
    </button>
  );
}

const KIND_LABEL: Record<AssistantReply['kind'], { hi: string; cls: string }> = {
  data: { hi: 'सरकारी/मौसम डेटा', cls: 'bg-blue-100 text-blue-900' },
  knowledge: { hi: 'जाँची गई जानकारी', cls: 'bg-leaf-100 text-leaf-900' },
  ai_explanation: { hi: 'AI द्वारा समझाया गया', cls: 'bg-purple-100 text-purple-900' },
  clarifying_question: { hi: 'सवाल', cls: 'bg-gray-100 text-gray-800' },
  no_data: { hi: 'जानकारी उपलब्ध नहीं', cls: 'bg-orange-100 text-orange-900' },
  safety: { hi: 'सावधानी', cls: 'bg-red-100 text-red-900' },
};

export function TrustBadge({ kind, confidence }: { kind: AssistantReply['kind']; confidence?: AssistantReply['confidence'] }) {
  const k = KIND_LABEL[kind];
  const conf = confidence && kind !== 'clarifying_question' && kind !== 'safety'
    ? { high: 'भरोसा: ज्यादा', medium: 'भरोसा: मध्यम', low: 'भरोसा: कम' }[confidence]
    : null;
  return (
    <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
      <span className={`rounded-full px-2 py-0.5 ${k.cls}`}>{k.hi}</span>
      {conf && <span className="rounded-full bg-white px-2 py-0.5 text-gray-700 ring-1 ring-gray-300">{conf}</span>}
    </div>
  );
}

const STATUS_HI: Record<string, string> = {
  pending_expert_review: 'विशेषज्ञ समीक्षा बाकी',
  expert_reviewed: 'विशेषज्ञ द्वारा जाँचा गया',
  secondary_source: 'आधिकारिक पोर्टल पर पुष्टि करें',
  status_uncertain: 'स्थिति अनिश्चित',
  verified_official: 'आधिकारिक रूप से जाँचा गया',
};

export function Sources({ sources }: { sources: SourceRef[] }) {
  if (!sources.length) return null;
  return (
    <details className="mt-2 text-sm text-gray-700">
      <summary className="cursor-pointer font-semibold text-leaf-700">स्रोत ({sources.length})</summary>
      <ul className="mt-1 space-y-1">
        {sources.map((s, i) => (
          <li key={i} className="break-words">
            <a href={s.url} target="_blank" rel="noreferrer" className="underline">{s.title}</a>
            <span className="text-gray-500"> · अपडेट: {s.lastUpdated}{s.status ? ` · ${STATUS_HI[s.status] ?? s.status}` : ''}</span>
          </li>
        ))}
      </ul>
    </details>
  );
}

export function Card({ children, tone = 'white' }: { children: ReactNode; tone?: 'white' | 'warn' | 'alert' }) {
  const cls = { white: 'bg-white', warn: 'bg-sun-400/20 ring-1 ring-sun-500', alert: 'bg-red-50 ring-1 ring-red-400' }[tone];
  return <div className={`rounded-2xl p-4 shadow-sm ${cls}`}>{children}</div>;
}

export function Select({ label, value, onChange, options }: { label: string; value: string; onChange(v: string): void; options: Array<{ value: string; label: string }> }) {
  return (
    <label className="block">
      <span className="mb-1 block font-semibold text-gray-800">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border-2 border-gray-300 bg-white px-3 py-3 text-lg">
        <option value="">— चुनें —</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}

export function Spinner({ label }: { label: string }) {
  return (
    <div role="status" className="flex items-center gap-3 py-6 text-gray-700">
      <span className="h-6 w-6 animate-spin rounded-full border-4 border-leaf-600 border-t-transparent" />
      {label}
    </div>
  );
}
