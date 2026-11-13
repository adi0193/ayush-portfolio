import { useEffect, useState } from 'react';
import { Card, Page, SpeakButton, Spinner } from '../components/ui';
import { api, local } from '../lib/api';
import { tr, useApp } from '../lib/store';
import type { Scheme } from '../lib/types';

const VERIF: Record<Scheme['verification']['status'], { label: string; cls: string }> = {
  verified_official: { label: '✅ आधिकारिक रूप से जाँचा गया', cls: 'bg-leaf-100 text-leaf-900' },
  secondary_source: { label: '⚠️ आवेदन से पहले आधिकारिक पोर्टल पर पुष्टि करें', cls: 'bg-sun-400/30 text-soil-900' },
  status_uncertain: { label: '❓ वर्तमान स्थिति अनिश्चित – विभाग से पूछें', cls: 'bg-orange-100 text-orange-900' },
};

export default function Schemes() {
  const { lang, go } = useApp();
  const [list, setList] = useState<Scheme[] | null>(() => local.get<Scheme[] | null>('bfa.schemes', null));
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    api.get<{ schemes: Scheme[] }>('/api/schemes').then((r) => { setList(r.schemes); local.set('bfa.schemes', r.schemes); }).catch(() => undefined);
  }, []);

  return (
    <Page title={tr(lang, 'सरकारी योजनाएँ', 'सरकारी योजना')}>
      <Card tone="warn">
        <p className="font-semibold">🔒 {tr(lang, 'ध्यान दें', 'ध्यान दीं')}</p>
        <p className="text-sm">{tr(lang, 'योजना की जानकारी मुफ्त है। कोई OTP, PIN या पैसा मांगे तो न दें। आवेदन केवल आधिकारिक पोर्टल या सरकारी केंद्र पर करें। हम लाभ मिलने की गारंटी नहीं देते।', 'योजना के जानकारी मुफ्त बा। केहू OTP, PIN भा पइसा माँगे त मत दीं। आवेदन खाली आधिकारिक पोर्टल भा सरकारी केंद्र पर करीं। हम लाभ मिले के गारंटी ना दीं।')}</p>
      </Card>
      <button onClick={() => go('ask', { prompt: tr(lang, 'मुझे खेती के लिए सरकारी मदद चाहिए', 'हमरा खेती खातिर सरकारी मदद चाहीं') })} className="mt-3 w-full rounded-2xl bg-leaf-700 px-4 py-4 text-lg font-semibold text-white">
        🎤 {tr(lang, 'बोलकर पूछें – मेरे लिए कौन-सी योजना?', 'बोल के पूछीं – हमरा खातिर कवन योजना?')}
      </button>
      <div className="mt-4 space-y-3">
        {!list && <Spinner label="…" />}
        {list?.map((s) => {
          const isOpen = open === s.id;
          const v = VERIF[s.verification.status];
          return (
            <Card key={s.id}>
              <button onClick={() => setOpen(isOpen ? null : s.id)} className="w-full text-left" aria-expanded={isOpen}>
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-lg font-bold text-gray-900">{s.nameHi}</h2>
                  <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs">{s.level === 'central' ? 'केंद्र' : 'बिहार'}</span>
                </div>
                <p className="mt-1 text-gray-800">{s.purposeHi}</p>
                <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${v.cls}`}>{v.label}</span>
              </button>
              {isOpen && (
                <div className="mt-3 space-y-2 border-t pt-3 text-gray-900">
                  <SpeakButton small text={`${s.nameHi}। ${s.purposeHi} लाभ: ${s.benefitHi} पात्रता: ${s.eligibilityHi.join('। ')}`} />
                  <Field label="पात्रता" items={s.eligibilityHi} />
                  <Field label="जरूरी कागज़" items={s.documentsHi} />
                  <Field label="लाभ" items={[s.benefitHi]} />
                  <Field label="आवेदन कैसे करें" items={s.applyHi} />
                  <Field label="अंतिम तिथि" items={[s.deadlineHi]} />
                  <Field label="वर्तमान स्थिति" items={[s.statusHi]} />
                  <Field label="हेल्पलाइन" items={[s.helplineHi]} />
                  <a href={s.officialUrl} target="_blank" rel="noreferrer" className="block rounded-xl bg-leaf-700 px-4 py-3 text-center font-semibold text-white">आधिकारिक वेबसाइट खोलें ↗</a>
                  <p className="text-xs text-gray-600">जानकारी जाँची: {s.verification.checkedOn}{s.verification.note ? ` · ${s.verification.note}` : ''}</p>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </Page>
  );
}

function Field({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="text-sm font-bold text-leaf-800">{label}</p>
      <ul className="list-inside list-disc">{items.map((i) => <li key={i}>{i}</li>)}</ul>
    </div>
  );
}
