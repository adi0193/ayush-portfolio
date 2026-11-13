import { useEffect, useState } from 'react';
import { Card, Page, Select, SpeakButton, Spinner } from '../components/ui';
import { api } from '../lib/api';
import { districtName, tr, useApp } from '../lib/store';
import type { WeatherResult } from '../lib/types';

const DAY = (iso: string) => new Date(iso + 'T00:00:00').toLocaleDateString('hi-IN', { weekday: 'short', day: 'numeric', month: 'short' });

export default function Weather() {
  const { lang, profile, meta, online } = useApp();
  const [district, setDistrict] = useState(profile.district ?? '');
  const [r, setR] = useState<WeatherResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!district || !online) return;
    setLoading(true);
    setR(null);
    api.get<WeatherResult>(`/api/weather?district=${district}`)
      .then(setR)
      .catch(() => setR({ status: 'unavailable', alerts: [], provider: { name: 'Open-Meteo', url: 'https://open-meteo.com/', official: false }, officialWarningsUrl: 'https://mausam.imd.gov.in/' }))
      .finally(() => setLoading(false));
  }, [district, online]);

  const name = districtName(meta, district);
  const s = r?.snapshot;
  const spoken = s
    ? tr(lang, `${name} में अभी ${Math.round(s.current.temperature)} डिग्री तापमान है। `, `${name} में अभी ${Math.round(s.current.temperature)} डिग्री तापमान बा। `) +
      r!.alerts.map((a) => (lang === 'bho' ? a.adviceBho : a.adviceHi)).join(' ')
    : '';

  return (
    <Page title={tr(lang, 'मौसम और खेती की सलाह', 'मौसम आ खेती के सलाह')}>
      <Select label={tr(lang, 'जिला', 'जिला')} value={district} onChange={setDistrict} options={(meta?.districts ?? []).map((d) => ({ value: d.id, label: d.nameHi }))} />
      <div className="mt-4 space-y-3">
        {!online && <Card tone="warn">{tr(lang, 'मौसम की ताज़ा जानकारी के लिए इंटरनेट चाहिए। पुराना पूर्वानुमान नहीं दिखाया जाता।', 'मौसम के ताजा जानकारी खातिर इंटरनेट चाहीं। पुरान अनुमान ना देखावल जाला।')}</Card>}
        {loading && <Spinner label={tr(lang, 'मौसम देख रहे हैं…', 'मौसम देखत बानी…')} />}
        {r?.status === 'unavailable' && <Card tone="warn">{tr(lang, 'अभी मौसम जानकारी नहीं मिल पा रही है। IMD की वेबसाइट देखें।', 'अभी मौसम जानकारी ना मिल पावत बा। IMD के वेबसाइट देखीं।')} <a className="underline" href="https://mausam.imd.gov.in/" target="_blank" rel="noreferrer">mausam.imd.gov.in</a></Card>}

        {s && r && (
          <>
            {r.alerts.map((a) => (
              <Card key={a.id} tone={a.severity === 'warning' ? 'alert' : a.severity === 'watch' ? 'warn' : 'white'}>
                <p className="text-lg font-bold">{a.severity === 'warning' ? '🚨' : a.severity === 'watch' ? '⚠️' : '✅'} {a.titleHi}</p>
                <p className="mt-1 text-lg leading-relaxed">{lang === 'bho' ? a.adviceBho : a.adviceHi}</p>
              </Card>
            ))}
            <SpeakButton text={spoken} />
            <Card>
              <p className="text-sm text-gray-600">{tr(lang, 'अभी', 'अभी')} · {name} ({tr(lang, 'जिला स्तर', 'जिला स्तर')})</p>
              <p className="text-5xl font-bold text-gray-900">{Math.round(s.current.temperature)}°C</p>
              <p className="text-gray-800">💧 नमी {Math.round(s.current.humidity)}% · 🌬️ हवा {Math.round(s.current.windKmh)} किमी/घं</p>
            </Card>
            <div className="grid grid-cols-1 gap-2">
              {s.daily.map((d) => (
                <div key={d.date} className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm">
                  <span className="w-28 font-semibold">{DAY(d.date)}</span>
                  <span>{d.rainMm >= 1 ? '🌧️' : '☀️'} {Math.round(d.rainMm)} मिमी{d.rainProbability != null ? ` (${d.rainProbability}%)` : ''}</span>
                  <span className="text-right">{Math.round(d.tMax)}° / {Math.round(d.tMin)}°</span>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-700">
              ℹ️ {tr(lang, 'यह जिला मुख्यालय के लिए मॉडल आधारित अनुमान है (गाँव स्तर नहीं), सरकारी चेतावनी नहीं। आधिकारिक चेतावनी:', 'ई जिला मुख्यालय खातिर मॉडल पर आधारित अनुमान ह (गाँव स्तर ना), सरकारी चेतावनी ना। आधिकारिक चेतावनी:')}{' '}
              <a className="underline" href={r.officialWarningsUrl} target="_blank" rel="noreferrer">IMD</a>, <a className="underline" href="https://bsdma.org/" target="_blank" rel="noreferrer">BSDMA</a>.
              <br />स्रोत: <a className="underline" href={r.provider.url} target="_blank" rel="noreferrer">{r.provider.name}</a>{r.fetchedAt && ` · ${new Date(r.fetchedAt).toLocaleString('hi-IN')}`}
            </p>
          </>
        )}
      </div>
    </Page>
  );
}
