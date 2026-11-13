import { useEffect, useRef, useState } from 'react';
import { Page, SpeakButton, Sources, TrustBadge } from '../components/ui';
import { api, local, OfflineError } from '../lib/api';
import { listen, speak, stopSpeaking, sttSupported, type ListenHandle } from '../lib/speech';
import { tr, useApp } from '../lib/store';
import type { AssistantReply } from '../lib/types';

interface Turn { role: 'farmer' | 'assistant'; text: string; reply?: AssistantReply; at: string }

type Status = 'idle' | 'listening' | 'thinking' | 'speaking';

export default function Ask() {
  const { lang, profile, navOpts, speechRate, setSpeechRate, online, go } = useApp();
  const [turns, setTurns] = useState<Turn[]>(() => local.get('bfa.chat', [] as Turn[]));
  const [sessionId, setSessionId] = useState<string | undefined>(() => local.get<string | undefined>('bfa.session', undefined));
  const [status, setStatus] = useState<Status>('idle');
  const [interim, setInterim] = useState('');
  const [typed, setTyped] = useState('');
  const [error, setError] = useState('');
  const handle = useRef<ListenHandle | null>(null);
  const bottom = useRef<HTMLDivElement>(null);
  const canListen = sttSupported();

  useEffect(() => { local.set('bfa.chat', turns.slice(-30)); bottom.current?.scrollIntoView({ behavior: 'smooth' }); }, [turns]);
  useEffect(() => { if (sessionId) local.set('bfa.session', sessionId); }, [sessionId]);
  useEffect(() => {
    if (navOpts.prompt) void send(navOpts.prompt);
    else if (navOpts.autoListen && canListen) startListening();
    return () => { handle.current?.stop(); stopSpeaking(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function send(text: string) {
    const q = text.trim();
    if (!q) return;
    setError('');
    setTurns((t) => [...t, { role: 'farmer', text: q, at: new Date().toISOString() }]);
    setStatus('thinking');
    try {
      const context = {
        district: profile.district || undefined,
        block: profile.block || undefined,
        village: profile.village || undefined,
        landAcres: profile.landAcres,
        crops: profile.crops.length ? profile.crops : undefined,
        irrigation: profile.irrigation,
        soil: profile.soil || undefined,
      };
      const res = await api.post<{ sessionId: string; reply: AssistantReply }>('/api/assistant/message', { text: q, lang, sessionId, context });
      setSessionId(res.sessionId);
      setTurns((t) => [...t, { role: 'assistant', text: res.reply.text, reply: res.reply, at: new Date().toISOString() }]);
      setStatus('speaking');
      if (!speak(res.reply.text, speechRate, () => setStatus('idle'))) setStatus('idle');
    } catch (e) {
      setStatus('idle');
      setError(e instanceof OfflineError
        ? tr(lang, 'इंटरनेट नहीं है। सवाल पूछने के लिए इंटरनेट चाहिए। तब तक "खेती सीखें" में सहेजी जानकारी देखें।', 'इंटरनेट नइखे। सवाल पूछे खातिर इंटरनेट चाहीं। तब ले "खेती सीखीं" में सहेजल जानकारी देखीं।')
        : tr(lang, 'जवाब नहीं मिल पाया। थोड़ी देर बाद फिर कोशिश करें, या किसान कॉल सेंटर 1800-180-1551 पर फोन करें।', 'जवाब ना मिल पावल। थोड़ा देर बाद फेर कोसिस करीं, भा किसान कॉल सेंटर 1800-180-1551 पर फोन करीं।'));
    }
  }

  function startListening() {
    stopSpeaking();
    setError('');
    setInterim('');
    setStatus('listening');
    handle.current = listen(lang, {
      onInterim: setInterim,
      onFinal: (t) => { setInterim(''); void send(t); },
      onError: (code) => {
        setStatus('idle');
        setError(code === 'not-allowed'
          ? tr(lang, 'माइक की अनुमति नहीं मिली। फोन की सेटिंग में माइक की अनुमति दें, या नीचे लिखकर पूछें।', 'माइक के अनुमति ना मिलल। फोन के सेटिंग में अनुमति दीं, भा नीचे लिख के पूछीं।')
          : code === 'no-speech'
            ? tr(lang, 'आवाज़ सुनाई नहीं दी। फिर से बटन दबाकर बोलिए।', 'आवाज ना सुनाई दिहलस। फेर से बटन दबा के बोलीं।')
            : tr(lang, 'आवाज़ समझ नहीं पाए (इंटरनेट धीमा हो सकता है)। फिर कोशिश करें या लिखकर पूछें।', 'आवाज ना समझ पवनी (इंटरनेट धीमा हो सकेला)। फेर कोसिस करीं भा लिख के पूछीं।'));
      },
      onEnd: () => setStatus((s) => (s === 'listening' ? 'idle' : s)),
    });
    if (!handle.current) setStatus('idle');
  }

  const last = [...turns].reverse().find((t) => t.reply);

  return (
    <Page>
      <div className="space-y-3" aria-live="polite">
        {turns.length === 0 && (
          <p className="rounded-2xl bg-leaf-50 p-4 text-lg text-leaf-900">
            {tr(lang, 'नीचे का बड़ा बटन दबाइए और अपना सवाल बोलिए। मैं हिंदी और भोजपुरी समझने की कोशिश करता हूँ।', 'नीचे के बड़का बटन दबाईं आ आपन सवाल बोलीं। हम हिंदी आ भोजपुरी समझे के कोसिस करीला।')}
          </p>
        )}
        {turns.map((t, i) => (
          <div key={i} className={t.role === 'farmer' ? 'ml-8 rounded-2xl rounded-br-sm bg-leaf-700 p-3 text-lg text-white' : 'mr-4 rounded-2xl rounded-bl-sm bg-white p-3 shadow-sm'}>
            {t.reply && <TrustBadge kind={t.reply.kind} confidence={t.reply.confidence} />}
            <p className={`whitespace-pre-line text-lg leading-relaxed ${t.reply ? 'mt-2 text-gray-900' : ''}`}>{t.text}</p>
            {t.reply && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <SpeakButton text={t.text} small />
                {t.reply.suggestExpert && (
                  <button onClick={() => go('experts')} className="rounded-full bg-sun-400 px-3 py-1 text-sm font-semibold text-soil-900">
                    👩‍🌾 {tr(lang, 'विशेषज्ञ से पूछें', 'विशेषज्ञ से पूछीं')}
                  </button>
                )}
              </div>
            )}
            {t.reply && <Sources sources={t.reply.sources} />}
            {t.reply?.followUps && t.reply.kind === 'clarifying_question' && t.reply.intent === 'unknown' && (
              <div className="mt-2 flex flex-wrap gap-2">
                {t.reply.followUps.map((f) => <button key={f} onClick={() => send(f)} className="rounded-full border border-leaf-600 px-3 py-1 text-leaf-800">{f}</button>)}
              </div>
            )}
          </div>
        ))}
        {interim && <p className="ml-8 rounded-2xl bg-leaf-100 p-3 text-lg italic text-leaf-900">{interim}…</p>}
        {status === 'thinking' && <p className="mr-4 rounded-2xl bg-white p-3 text-lg text-gray-600 shadow-sm">⏳ {tr(lang, 'सोच रहा हूँ…', 'सोचत बानी…')}</p>}
        {error && <p role="alert" className="rounded-2xl bg-orange-100 p-3 text-orange-900">{error}</p>}
        <div ref={bottom} />
      </div>

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-gray-200 bg-soil-50/95 backdrop-blur">
        <div className="mx-auto flex max-w-xl items-center gap-3 px-4 py-3">
          <div className="flex flex-col gap-1">
            <button onClick={() => last && speak(last.text, speechRate)} disabled={!last} className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-leaf-800 ring-1 ring-gray-300 disabled:opacity-40" aria-label="फिर से सुनें">🔁 {tr(lang, 'फिर सुनें', 'फेर सुनीं')}</button>
            <button onClick={() => setSpeechRate(speechRate > 0.75 ? 0.7 : 0.9)} className="rounded-xl bg-white px-3 py-2 text-sm font-semibold text-leaf-800 ring-1 ring-gray-300" aria-pressed={speechRate <= 0.75}>🐢 {speechRate <= 0.75 ? tr(lang, 'धीमा: चालू', 'धीमा: चालू') : tr(lang, 'धीमा', 'धीमा')}</button>
          </div>
          {canListen ? (
            <button
              onClick={() => (status === 'listening' ? handle.current?.stop() : startListening())}
              disabled={status === 'thinking' || !online}
              className={`mx-auto flex h-24 w-24 shrink-0 items-center justify-center rounded-full text-5xl text-white shadow-lg disabled:opacity-50 ${status === 'listening' ? 'animate-pulse bg-red-600 ring-8 ring-red-200' : 'bg-leaf-700 ring-8 ring-leaf-100'}`}
              aria-label={status === 'listening' ? 'सुनना बंद करें' : 'बोलें'}
            >
              {status === 'listening' ? '⏹' : '🎤'}
            </button>
          ) : (
            <p className="mx-auto text-center text-sm text-gray-700">{tr(lang, 'इस फोन/ब्राउज़र में बोलकर पूछने की सुविधा नहीं है – लिखकर पूछें (Chrome में बोल सकते हैं)।', 'एह फोन/ब्राउजर में बोल के पूछे के सुविधा नइखे – लिख के पूछीं (Chrome में बोल सकत बानी)।')}</p>
          )}
          <div className="w-[88px] text-center text-sm font-semibold text-gray-700" aria-live="polite">
            {{ idle: tr(lang, 'बटन दबाएँ', 'बटन दबाईं'), listening: tr(lang, 'सुन रहा हूँ…', 'सुनत बानी…'), thinking: tr(lang, 'सोच रहा हूँ…', 'सोचत बानी…'), speaking: tr(lang, 'बोल रहा हूँ…', 'बोलत बानी…') }[status]}
          </div>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); void send(typed); setTyped(''); }} className="mx-auto flex max-w-xl gap-2 px-4 pb-3">
          <input value={typed} onChange={(e) => setTyped(e.target.value)} maxLength={500} placeholder={tr(lang, 'या यहाँ लिखें…', 'भा इहाँ लिखीं…')} className="min-w-0 flex-1 rounded-xl border-2 border-gray-300 px-3 py-2 text-lg" aria-label="सवाल लिखें" />
          <button type="submit" disabled={!typed.trim() || status === 'thinking'} className="rounded-xl bg-leaf-700 px-4 font-semibold text-white disabled:opacity-40">{tr(lang, 'भेजें', 'भेजीं')}</button>
        </form>
        {turns.length > 0 && (
          <div className="mx-auto max-w-xl px-4 pb-2 text-right">
            <button onClick={() => { setTurns([]); setSessionId(undefined); local.remove('bfa.session'); }} className="text-sm text-gray-600 underline">{tr(lang, 'नई बातचीत', 'नया बातचीत')}</button>
          </div>
        )}
      </div>
      <div className="h-48" />
    </Page>
  );
}
