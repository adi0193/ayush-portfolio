import { Page } from '../components/ui';
import { cropName, districtName, tr, useApp, type Page as P } from '../lib/store';

const TILES: Array<{ page: P; icon: string; hi: string; bho: string }> = [
  { page: 'ask', icon: '💬', hi: 'खेती का सवाल पूछें', bho: 'खेती के सवाल पूछीं' },
  { page: 'mandi', icon: '💰', hi: 'आज का मंडी भाव', bho: 'आज के मंडी भाव' },
  { page: 'weather', icon: '🌦️', hi: 'मौसम', bho: 'मौसम' },
  { page: 'schemes', icon: '🏛️', hi: 'सरकारी योजना', bho: 'सरकारी योजना' },
  { page: 'crop', icon: '🌱', hi: 'फसल की समस्या', bho: 'फसल के दिक्कत' },
  { page: 'learn', icon: '📘', hi: 'खेती सीखें', bho: 'खेती सीखीं' },
];

export default function Home() {
  const { go, lang, profile, meta } = useApp();
  const d = districtName(meta, profile.district);
  return (
    <Page>
      <section className="flex flex-col items-center rounded-3xl bg-leaf-50 px-4 py-6 text-center">
        <p className="mb-4 text-xl font-semibold text-leaf-900">
          {tr(lang, 'बटन दबाकर अपना सवाल बोलिए', 'बटन दबा के आपन सवाल बोलीं')}
        </p>
        <button
          onClick={() => go('ask', { autoListen: true })}
          className="flex h-40 w-40 items-center justify-center rounded-full bg-leaf-700 text-7xl text-white shadow-xl ring-8 ring-leaf-100 active:scale-95"
          aria-label={tr(lang, 'बोलकर सवाल पूछें', 'बोल के सवाल पूछीं')}
        >
          🎤
        </button>
        <p className="mt-4 text-sm text-gray-700">
          {tr(lang, 'जैसे: "धान के पत्ते पीले हो रहे हैं, क्या करूँ?"', 'जइसे: "धान के पत्ता पीयर पड़ रहल बा, का करीं?"')}
        </p>
      </section>

      {!profile.district && (
        <button onClick={() => go('profile')} className="mt-4 w-full rounded-2xl bg-sun-400 px-4 py-3 text-left font-semibold text-soil-900">
          📍 {tr(lang, 'अपना जिला और फसल बताइए – सही जानकारी के लिए', 'आपन जिला आ फसल बताईं – सही जानकारी खातिर')} →
        </button>
      )}
      {profile.district && (
        <button onClick={() => go('profile')} className="mt-4 w-full rounded-2xl bg-white px-4 py-3 text-left text-gray-800 shadow-sm">
          📍 {d}{profile.block ? `, ${profile.block}` : ''} · {profile.crops.map((c) => cropName(meta, c, lang)).join(', ') || tr(lang, 'फसल जोड़ें', 'फसल जोड़ीं')}
        </button>
      )}

      <nav className="mt-4 grid grid-cols-2 gap-3" aria-label="मुख्य विकल्प">
        {TILES.map((t) => (
          <button key={t.page} onClick={() => go(t.page)} className="flex min-h-[110px] flex-col items-center justify-center gap-2 rounded-2xl bg-white p-3 text-center shadow-sm ring-1 ring-gray-200 active:bg-leaf-50">
            <span className="text-4xl" aria-hidden>{t.icon}</span>
            <span className="text-lg font-semibold leading-tight text-gray-900">{tr(lang, t.hi, t.bho)}</span>
          </button>
        ))}
      </nav>

      <button onClick={() => go('experts')} className="mt-3 w-full rounded-2xl bg-white px-4 py-3 text-left font-semibold text-leaf-800 shadow-sm ring-1 ring-gray-200">
        👩‍🌾 {tr(lang, 'कृषि विशेषज्ञ से संपर्क', 'कृषि विशेषज्ञ से संपर्क')} →
      </button>
    </Page>
  );
}
