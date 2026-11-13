import { Card, Page } from '../components/ui';
import { districtName, tr, useApp } from '../lib/store';

/**
 * Only contacts that are nationally published and stable are shown here. District KVK /
 * block officer phone numbers are added to the database only after the content team
 * verifies them (see docs/08-data-architecture.md, `expert_contact.verified_at`).
 */
export default function Experts() {
  const { lang, profile, meta } = useApp();
  const d = districtName(meta, profile.district);
  return (
    <Page title={tr(lang, 'कृषि विशेषज्ञ से मदद', 'कृषि विशेषज्ञ से मदद')}>
      <div className="space-y-3">
        <Card>
          <h2 className="text-lg font-bold">📞 किसान कॉल सेंटर</h2>
          <p className="text-gray-800">{tr(lang, 'मुफ्त कॉल, हिंदी में कृषि विशेषज्ञ से बात।', 'मुफ्त कॉल, कृषि विशेषज्ञ से बात।')}</p>
          <a href="tel:18001801551" className="mt-2 block rounded-xl bg-leaf-700 py-3 text-center text-xl font-bold text-white">1800-180-1551</a>
        </Card>
        <Card>
          <h2 className="text-lg font-bold">🏫 {tr(lang, 'कृषि विज्ञान केंद्र (KVK)', 'कृषि विज्ञान केंद्र (KVK)')}{d ? ` – ${d}` : ''}</h2>
          <p className="text-gray-800">{tr(lang, 'हर जिले में KVK है। फसल की फोटो और नमूना लेकर जाएँ।', 'हर जिला में KVK बा। फसल के फोटो आ नमूना लेके जाईं।')}</p>
          <a href="https://kvk.icar.gov.in/" target="_blank" rel="noreferrer" className="mt-2 block underline">ICAR की KVK सूची देखें ↗</a>
        </Card>
        <Card>
          <h2 className="text-lg font-bold">🧑‍🌾 {tr(lang, 'प्रखंड कृषि कार्यालय', 'प्रखंड कृषि कार्यालय')}</h2>
          <p className="text-gray-800">{tr(lang, 'अपने पंचायत के कृषि समन्वयक / किसान सलाहकार से मिलें – योजना, बीज और मिट्टी जांच में मदद।', 'अपना पंचायत के कृषि समन्वयक / किसान सलाहकार से मिलीं – योजना, बीज आ माटी जांच में मदद।')}</p>
        </Card>
        <Card>
          <h2 className="text-lg font-bold">🎓 {tr(lang, 'कृषि विश्वविद्यालय', 'कृषि विश्वविद्यालय')}</h2>
          <ul className="list-inside list-disc">
            <li><a className="underline" href="https://www.bausabour.ac.in/" target="_blank" rel="noreferrer">बिहार कृषि विश्वविद्यालय, सबौर</a></li>
            <li><a className="underline" href="https://www.rpcau.ac.in/" target="_blank" rel="noreferrer">डॉ. राजेंद्र प्रसाद केंद्रीय कृषि विश्वविद्यालय, पूसा</a></li>
          </ul>
        </Card>
        <Card tone="warn">
          <p className="font-semibold">🚫 {tr(lang, 'धोखे से बचें', 'धोखा से बचीं')}</p>
          <p className="text-sm">{tr(lang, 'कोई OTP/PIN मांगे या पैसे लेकर योजना दिलाने की बात करे तो साइबर हेल्पलाइन 1930 पर शिकायत करें।', 'केहू OTP/PIN माँगे भा पइसा लेके योजना दिलावे के बात करे त साइबर हेल्पलाइन 1930 पर शिकायत करीं।')}</p>
        </Card>
        <p className="text-sm text-gray-600">{tr(lang, 'जिले के KVK और प्रखंड अधिकारी के फोन नंबर जाँच के बाद ही यहाँ जोड़े जाएंगे।', 'जिला के KVK आ प्रखंड अधिकारी के फोन नंबर जाँच के बादे इहाँ जोड़ल जाई।')}</p>
      </div>
    </Page>
  );
}
