import { useEffect, useState } from 'react';
import { Card, Page, Select, SpeakButton, Spinner } from '../components/ui';
import { api, local } from '../lib/api';
import { cropName, districtName, tr, useApp } from '../lib/store';
import type { MandiResult } from '../lib/types';

interface Saved { key: string; result: MandiResult; savedAt: string }

export default function Mandi() {
  const { lang, profile, meta, online } = useApp();
  const [crop, setCrop] = useState(profile.crops[0] ?? '');
  const [district, setDistrict] = useState(profile.district ?? '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MandiResult | null>(null);
  const [offlineCopy, setOfflineCopy] = useState<Saved | null>(null);

  useEffect(() => {
    if (!crop) return;
    const key = `${crop}|${district}`;
    setResult(null);
    setOfflineCopy(null);
    if (!online) {
      const saved = local.get<Saved[]>('bfa.mandi', []).find((s) => s.key === key);
      setOfflineCopy(saved ?? null);
      return;
    }
    setLoading(true);
    const qs = new URLSearchParams({ crop, ...(district ? { district } : {}) });
    api.get<MandiResult>(`/api/mandi?${qs}`)
      .then((r) => {
        setResult(r);
        if (r.status === 'ok') {
          const all = local.get<Saved[]>('bfa.mandi', []).filter((s) => s.key !== key);
          local.set('bfa.mandi', [{ key, result: r, savedAt: new Date().toISOString() }, ...all].slice(0, 10));
        }
      })
      .catch(() => setResult({ status: 'unavailable', records: [], stale: false, source: { name: 'AGMARKNET', url: 'https://agmarknet.gov.in/' }, disclaimerHi: '' }))
      .finally(() => setLoading(false));
  }, [crop, district, online]);

  const shown = result ?? offlineCopy?.result ?? null;
  const summary = shown?.status === 'ok' && shown.records[0]
    ? tr(lang,
        `${shown.records[0].market} मंडी में ${cropName(meta, crop)} का औसत भाव ${shown.records[0].modalPrice} रुपये प्रति क्विंटल है, यह ${shown.records[0].arrivalDate} का भाव है। यह थोक भाव है।`,
        `${shown.records[0].market} मंडी में ${cropName(meta, crop, 'bho')} के औसत भाव ${shown.records[0].modalPrice} रुपया प्रति क्विंटल बा, ई ${shown.records[0].arrivalDate} के भाव ह। ई थोक भाव ह।`)
    : '';

  return (
    <Page title={tr(lang, 'मंडी भाव', 'मंडी भाव')}>
      <div className="grid grid-cols-1 gap-3">
        <Select label={tr(lang, 'फसल', 'फसल')} value={crop} onChange={setCrop} options={(meta?.crops ?? []).map((c) => ({ value: c.id, label: lang === 'bho' ? c.nameBho : c.nameHi }))} />
        <Select label={tr(lang, 'जिला (नजदीकी मंडी के लिए)', 'जिला (नजदीकी मंडी खातिर)')} value={district} onChange={setDistrict} options={(meta?.districts ?? []).map((d) => ({ value: d.id, label: d.nameHi }))} />
      </div>

      <div className="mt-4 space-y-3">
        {loading && <Spinner label={tr(lang, 'भाव ला रहे हैं…', 'भाव ले आवत बानी…')} />}
        {!crop && <p className="text-gray-700">{tr(lang, 'ऊपर फसल चुनें।', 'ऊपर फसल चुनीं।')}</p>}

        {offlineCopy && !result && (
          <Card tone="warn">
            <p className="font-bold text-soil-900">⚠️ {tr(lang, 'पुराना सहेजा भाव – आज का भाव नहीं', 'पुरान सहेजल भाव – आज के भाव ना')}</p>
            <p className="text-sm">{tr(lang, 'इंटरनेट नहीं है। यह भाव', 'इंटरनेट नइखे। ई भाव')} {offlineCopy.result.latestArrivalDate} {tr(lang, 'का है (सहेजा गया', 'के ह (सहेजल गइल')} {offlineCopy.savedAt.slice(0, 10)})।</p>
          </Card>
        )}
        {crop && !online && !offlineCopy && <Card tone="warn">{tr(lang, 'इंटरनेट नहीं है और इस फसल का कोई सहेजा भाव नहीं है।', 'इंटरनेट नइखे आ एह फसल के कवनो सहेजल भाव नइखे।')}</Card>}

        {shown?.status === 'unavailable' && (
          <Card tone="warn">
            <p className="font-semibold">{tr(lang, 'अभी सरकारी मंडी डेटा नहीं मिल पा रहा है।', 'अभी सरकारी मंडी डेटा ना मिल पावत बा।')}</p>
            <p className="mt-1 text-sm">{tr(lang, 'हम अंदाजे से भाव नहीं दिखाते। agmarknet.gov.in या अपनी नजदीकी मंडी से पता करें।', 'हम अंदाजा से भाव ना देखाइला। agmarknet.gov.in भा नजदीकी मंडी से पता करीं।')}</p>
            {shown.reason === 'not_configured' && <p className="mt-1 text-xs text-gray-600">(सर्वर पर data.gov.in API कुंजी सेट नहीं है)</p>}
          </Card>
        )}
        {shown?.status === 'no_records' && (
          <Card>{tr(lang, `${districtName(meta, district) || 'बिहार'} के आसपास इस फसल का हाल का भाव सरकारी डेटा में नहीं मिला।`, `${districtName(meta, district) || 'बिहार'} के आसपास एह फसल के हाल के भाव सरकारी डेटा में ना मिलल।`)}</Card>
        )}

        {shown?.status === 'ok' && (
          <>
            {shown.stale && <Card tone="warn">⚠️ {tr(lang, `सबसे नया उपलब्ध भाव ${shown.latestArrivalDate} का है – आज का नहीं।`, `सबसे नया भाव ${shown.latestArrivalDate} के ह – आज के ना।`)}</Card>}
            <SpeakButton text={summary} />
            {shown.records.map((r, i) => (
              <Card key={i}>
                <div className="flex items-baseline justify-between gap-2">
                  <h2 className="text-lg font-bold text-gray-900">{r.market}</h2>
                  <span className="text-sm text-gray-600">{r.district}</span>
                </div>
                <p className="text-sm text-gray-600">{r.commodity}{r.variety ? ` · ${r.variety}` : ''}</p>
                <p className="mt-2 text-3xl font-bold text-leaf-800">₹{r.modalPrice}<span className="text-base font-normal text-gray-700"> / क्विंटल (औसत)</span></p>
                <p className="text-gray-800">{tr(lang, 'न्यूनतम', 'कम से कम')} ₹{r.minPrice} · {tr(lang, 'अधिकतम', 'जादे से जादे')} ₹{r.maxPrice}</p>
                <p className="mt-1 text-sm font-semibold text-gray-700">📅 {tr(lang, 'भाव की तारीख', 'भाव के तारीख')}: {r.arrivalDate}</p>
              </Card>
            ))}
          </>
        )}

        {shown && (
          <p className="text-sm text-gray-700">
            ℹ️ {shown.disclaimerHi || 'यह मंडी का थोक भाव है, गाँव में व्यापारी का भाव अलग हो सकता है।'}<br />
            स्रोत: <a className="underline" href={shown.source.url} target="_blank" rel="noreferrer">{shown.source.name}</a>
            {shown.fetchedAt && <> · {tr(lang, 'लाया गया', 'लावल गइल')}: {new Date(shown.fetchedAt).toLocaleString('hi-IN')}</>}
          </p>
        )}
      </div>
    </Page>
  );
}
