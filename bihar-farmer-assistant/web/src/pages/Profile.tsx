import { useState } from 'react';
import { Card, Page, Select } from '../components/ui';
import { api } from '../lib/api';
import { tr, useApp } from '../lib/store';
import type { Profile as P } from '../lib/types';

export default function Profile() {
  const { lang, profile, saveProfile, clearProfile, meta, go } = useApp();
  const [p, setP] = useState<P>(profile);
  const [msg, setMsg] = useState('');
  const set = <K extends keyof P>(k: K, v: P[K]) => setP((x) => ({ ...x, [k]: v }));

  async function save() {
    let next = p;
    if (p.syncToServer) {
      try {
        const res = await api.post<{ id: string }>('/api/profile', {
          id: p.serverId, name: p.name || undefined, preferredLang: p.preferredLang, district: p.district || undefined,
          block: p.block || undefined, village: p.village || undefined, landAcres: p.landAcres, crops: p.crops,
          irrigation: p.irrigation, soil: p.soil || undefined, consentDataStorage: true, consentImageUse: false,
        });
        next = { ...p, serverId: res.id };
      } catch {
        setMsg(tr(lang, 'सर्वर पर सहेज नहीं पाए, पर फोन में सहेज लिया।', 'सर्वर पर ना सहेजा पावल, बाकिर फोन में सहेज लिहल गइल।'));
      }
    } else if (profile.serverId) {
      await api.del(`/api/profile/${profile.serverId}`).catch(() => undefined);
      next = { ...p, serverId: undefined };
    }
    saveProfile(next);
    setMsg((m) => m || tr(lang, 'सहेज लिया ✅', 'सहेज लिहल गइल ✅'));
  }

  const toggleCrop = (id: string) => set('crops', p.crops.includes(id) ? p.crops.filter((c) => c !== id) : [...p.crops, id].slice(0, 6));

  return (
    <Page title={tr(lang, 'मेरी जानकारी', 'हमार जानकारी')}>
      <p className="mb-4 text-gray-700">{tr(lang, 'यह जानकारी आपकी फसल और जिले के हिसाब से सलाह देने में मदद करती है। आधार या कोई पहचान संख्या नहीं चाहिए।', 'ई जानकारी रउआ फसल आ जिला के हिसाब से सलाह देवे में मदद करेला। आधार भा कवनो पहचान नंबर ना चाहीं।')}</p>
      <div className="space-y-4">
        <label className="block"><span className="mb-1 block font-semibold">{tr(lang, 'नाम (जरूरी नहीं)', 'नाम (जरूरी ना)')}</span>
          <input value={p.name ?? ''} onChange={(e) => set('name', e.target.value)} maxLength={80} className="w-full rounded-xl border-2 border-gray-300 px-3 py-3 text-lg" /></label>
        <Select label="भाषा" value={p.preferredLang} onChange={(v) => set('preferredLang', (v || 'bho') as P['preferredLang'])} options={[{ value: 'bho', label: 'भोजपुरी' }, { value: 'hi', label: 'हिंदी' }]} />
        <Select label="जिला" value={p.district ?? ''} onChange={(v) => set('district', v || undefined)} options={(meta?.districts ?? []).map((d) => ({ value: d.id, label: `${d.nameHi} – ${d.zoneLabelHi}` }))} />
        <label className="block"><span className="mb-1 block font-semibold">प्रखंड</span>
          <input value={p.block ?? ''} onChange={(e) => set('block', e.target.value)} maxLength={60} className="w-full rounded-xl border-2 border-gray-300 px-3 py-3 text-lg" /></label>
        <label className="block"><span className="mb-1 block font-semibold">गाँव</span>
          <input value={p.village ?? ''} onChange={(e) => set('village', e.target.value)} maxLength={60} className="w-full rounded-xl border-2 border-gray-300 px-3 py-3 text-lg" /></label>
        <label className="block"><span className="mb-1 block font-semibold">{tr(lang, 'जमीन (एकड़ में, लगभग)', 'जमीन (एकड़ में, लगभग)')}</span>
          <input type="number" inputMode="decimal" min={0} max={1000} step={0.1} value={p.landAcres ?? ''} onChange={(e) => set('landAcres', e.target.value === '' ? undefined : Number(e.target.value))} className="w-full rounded-xl border-2 border-gray-300 px-3 py-3 text-lg" />
          <span className="text-sm text-gray-600">{tr(lang, '1 बीघा ≈ 0.6 एकड़ (जिले के हिसाब से अलग)', '1 बीघा ≈ 0.6 एकड़ (जिला के हिसाब से अलग)')}</span></label>
        <fieldset>
          <legend className="mb-2 font-semibold">{tr(lang, 'मुख्य फसलें', 'मुख्य फसल')}</legend>
          <div className="flex flex-wrap gap-2">
            {(meta?.crops ?? []).map((c) => (
              <button key={c.id} type="button" onClick={() => toggleCrop(c.id)} aria-pressed={p.crops.includes(c.id)} className={`rounded-full px-4 py-2 text-lg ring-2 ${p.crops.includes(c.id) ? 'bg-leaf-700 text-white ring-leaf-700' : 'bg-white ring-gray-300'}`}>
                {lang === 'bho' ? c.nameBho : c.nameHi}
              </button>
            ))}
          </div>
        </fieldset>
        <Select label="सिंचाई" value={p.irrigation ?? ''} onChange={(v) => set('irrigation', (v || undefined) as P['irrigation'])} options={[{ value: 'none', label: 'नहीं (बारिश पर निर्भर)' }, { value: 'partial', label: 'कुछ खेत में' }, { value: 'full', label: 'पूरे खेत में' }]} />
        <label className="block"><span className="mb-1 block font-semibold">{tr(lang, 'मिट्टी (अगर पता हो)', 'माटी (अगर पता होखे)')}</span>
          <input value={p.soil ?? ''} onChange={(e) => set('soil', e.target.value)} maxLength={60} placeholder="जैसे: दोमट, बलुआही, टाल" className="w-full rounded-xl border-2 border-gray-300 px-3 py-3 text-lg" /></label>

        <Card>
          <label className="flex items-start gap-3">
            <input type="checkbox" className="mt-1 h-6 w-6" checked={p.syncToServer} onChange={(e) => set('syncToServer', e.target.checked)} />
            <span>{tr(lang, 'मेरी जानकारी सर्वर पर भी सहेजें (दूसरे फोन पर काम आए)। बिना इसके जानकारी सिर्फ इसी फोन में रहती है। कभी भी हटा सकते हैं। हम आपकी जानकारी बेचते नहीं हैं।', 'हमार जानकारी सर्वर पर भी सहेजीं (दोसर फोन पर काम आवे)। बिना एकरा जानकारी खाली एही फोन में रहेला। कबो भी हटा सकत बानी। हम रउआ जानकारी ना बेचीं।')}</span>
          </label>
        </Card>

        <button onClick={save} className="w-full rounded-2xl bg-leaf-700 py-4 text-xl font-bold text-white">{tr(lang, 'सहेजें', 'सहेजीं')}</button>
        {msg && <p role="status" className="text-center text-lg">{msg}</p>}
        <button onClick={() => { if (confirm(tr(lang, 'सारी जानकारी और बातचीत इस फोन से हटा दें?', 'सारा जानकारी आ बातचीत एह फोन से हटा दीं?'))) { if (profile.serverId) void api.del(`/api/profile/${profile.serverId}`); clearProfile(); go('home'); } }} className="w-full py-2 text-red-700 underline">
          {tr(lang, 'मेरी सारी जानकारी हटाएँ', 'हमार सारा जानकारी हटाईं')}
        </button>
      </div>
    </Page>
  );
}
