import { Card, Page } from '../components/ui';
import { tr, useApp } from '../lib/store';

const COMMON: Array<{ hi: string; bho: string }> = [
  { hi: 'धान के पत्ते पीले हो रहे हैं', bho: 'धान के पत्ता पीयर हो रहल बा' },
  { hi: 'मक्का में कीड़ा लगा है, पत्ते कट रहे हैं', bho: 'मकई में कीड़ा लागल बा, पत्ता कटा रहल बा' },
  { hi: 'आलू के पत्तों पर काले धब्बे हैं', bho: 'आलू के पत्ता पर करिया धब्बा बा' },
  { hi: 'सरसों में माहू (लाही) लगा है', bho: 'सरसो में लाही लागल बा' },
  { hi: 'लीची के फल फट रहे हैं', bho: 'लीची के फल फाट रहल बा' },
];

/** MVP: voice/text description. Photo analysis is Phase 2 (docs/05-mvp-spec.md). */
export default function CropProblem() {
  const { lang, go } = useApp();
  return (
    <Page title={tr(lang, 'फसल की समस्या', 'फसल के दिक्कत')}>
      <button onClick={() => go('ask', { autoListen: true })} className="w-full rounded-2xl bg-leaf-700 px-4 py-5 text-xl font-bold text-white">
        🎤 {tr(lang, 'बोलकर बताइए क्या दिक्कत है', 'बोल के बताईं का दिक्कत बा')}
      </button>
      <p className="mb-2 mt-5 font-semibold text-gray-800">{tr(lang, 'या इनमें से चुनें:', 'भा एह में से चुनीं:')}</p>
      <div className="space-y-2">
        {COMMON.map((c) => (
          <button key={c.hi} onClick={() => go('ask', { prompt: lang === 'bho' ? c.bho : c.hi })} className="block w-full rounded-xl bg-white px-4 py-3 text-left text-lg shadow-sm ring-1 ring-gray-200">
            {lang === 'bho' ? c.bho : c.hi} →
          </button>
        ))}
      </div>
      <div className="mt-5">
        <Card tone="warn">
          <p className="font-semibold">📷 {tr(lang, 'फोटो से पहचान – जल्द आ रहा है', 'फोटो से पहचान – जल्दिए आई')}</p>
          <p className="text-sm">{tr(lang, 'अभी फोटो लेकर नजदीकी KVK या कृषि समन्वयक को दिखाएँ। ऐप की सलाह शुरुआती जानकारी है, पक्की जांच नहीं।', 'अभी फोटो लेके नजदीकी KVK भा कृषि समन्वयक के देखाईं। ऐप के सलाह शुरुआती जानकारी ह, पक्का जांच ना।')}</p>
        </Card>
      </div>
    </Page>
  );
}
