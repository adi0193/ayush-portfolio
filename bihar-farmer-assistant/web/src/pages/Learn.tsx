import { useEffect, useState } from 'react';
import { Card, Page, SpeakButton, Spinner } from '../components/ui';
import { api, local } from '../lib/api';
import { tr, useApp } from '../lib/store';
import type { KnowledgeEntry } from '../lib/types';

const CAT: Record<string, string> = {
  crop_problem: 'फसल की समस्या', cultivation: 'खेती', weather_practice: 'मौसम और बचाव', soil: 'मिट्टी', post_harvest: 'कटाई के बाद', pest: 'कीट और दवा', scheme_help: 'योजना',
};

export default function Learn() {
  const { lang, profile } = useApp();
  const [items, setItems] = useState<KnowledgeEntry[] | null>(() => local.get<KnowledgeEntry[] | null>('bfa.kb', null));
  const [mine, setMine] = useState(profile.crops.length > 0);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    // Cached on the device (and by the service worker) for offline reading.
    api.get<{ items: KnowledgeEntry[] }>('/api/knowledge').then((r) => { setItems(r.items); local.set('bfa.kb', r.items); }).catch(() => undefined);
  }, []);

  const shown = (items ?? []).filter((k) => !mine || k.crops.length === 0 || k.crops.some((c) => profile.crops.includes(c)));

  return (
    <Page title={tr(lang, 'खेती सीखें', 'खेती सीखीं')}>
      <p className="mb-3 text-sm text-gray-700">📥 {tr(lang, 'यह जानकारी फोन में सहेजी जाती है – बिना इंटरनेट भी पढ़/सुन सकते हैं।', 'ई जानकारी फोन में सहेजल जाला – बिना इंटरनेट के भी पढ़/सुन सकत बानी।')}</p>
      {profile.crops.length > 0 && (
        <label className="mb-3 flex items-center gap-2 text-lg">
          <input type="checkbox" className="h-6 w-6" checked={mine} onChange={(e) => setMine(e.target.checked)} />
          {tr(lang, 'केवल मेरी फसलें', 'खाली हमार फसल')}
        </label>
      )}
      {!items && <Spinner label="…" />}
      <div className="space-y-3">
        {shown.map((k) => (
          <Card key={k.id}>
            <button className="w-full text-left" onClick={() => setOpen(open === k.id ? null : k.id)} aria-expanded={open === k.id}>
              <span className="text-xs font-semibold text-leaf-700">{CAT[k.category] ?? k.category}</span>
              <h2 className="text-lg font-bold text-gray-900">{k.titleHi}</h2>
            </button>
            {open === k.id && (
              <div className="mt-2 space-y-2">
                <SpeakButton small text={lang === 'bho' ? k.bodyBho : k.bodyHi} />
                <p className="text-lg leading-relaxed text-gray-900">{lang === 'bho' ? k.bodyBho : k.bodyHi}</p>
                <p className="text-xs text-gray-600">
                  स्रोत: <a className="underline" href={k.source.url} target="_blank" rel="noreferrer">{k.source.name}</a> · जाँची: {k.lastChecked} ·{' '}
                  {k.reviewStatus === 'expert_reviewed' ? '✅ विशेषज्ञ द्वारा जाँची' : '⏳ विशेषज्ञ समीक्षा बाकी'}
                </p>
              </div>
            )}
          </Card>
        ))}
      </div>
    </Page>
  );
}
