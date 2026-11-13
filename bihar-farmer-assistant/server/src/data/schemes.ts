/**
 * Government scheme catalogue.
 *
 * TRUST RULES (enforced in UI and assistant):
 * - `verification.status` is shown to the farmer. Only `verified_official` entries may be
 *   stated without a caveat. Everything else is prefixed with "आधिकारिक पोर्टल पर जांच लें".
 * - Benefit amounts change. Never present them as a promise; always link the official portal.
 * - The assistant never asks for, or accepts, OTP / PIN / banking passwords.
 *
 * As of the last check (2026-11-13) the facts below were cross-checked only against
 * secondary sources (myScheme, news reports) because official portals were not reachable
 * from the build environment. They are therefore marked `secondary_source` and MUST be
 * re-verified against the official portal by the content team before launch.
 */
export type VerificationStatus = 'verified_official' | 'secondary_source' | 'status_uncertain';

export interface Scheme {
  id: string;
  level: 'central' | 'state';
  nameHi: string;
  nameEn: string;
  purposeHi: string;
  eligibilityHi: string[];
  documentsHi: string[];
  benefitHi: string;
  applyHi: string[];
  officialUrl: string;
  deadlineHi: string;
  statusHi: string;
  helplineHi: string;
  tags: string[]; // for eligibility matching: 'input', 'seed', 'machinery', 'insurance', 'credit', 'income', 'soil', 'disaster', 'horticulture', 'irrigation'
  /** Simple eligibility hints used by the conversational assistant. */
  requiresDbtRegistration: boolean;
  landOwnershipRequired: 'yes' | 'no' | 'varies';
  verification: { status: VerificationStatus; checkedOn: string; note: string };
}

const CHECKED = '2026-11-13';
const KCC_HELP = 'किसान कॉल सेंटर: 1800-180-1551 (निःशुल्क)';
const DBT = 'https://dbtagriculture.bihar.gov.in/';

export const SCHEMES: Scheme[] = [
  {
    id: 'dbt-registration',
    level: 'state',
    nameHi: 'किसान पंजीकरण (DBT कृषि पोर्टल, बिहार)',
    nameEn: 'Farmer Registration – DBT Agriculture Bihar',
    purposeHi: 'बिहार की ज्यादातर कृषि अनुदान योजनाओं का लाभ लेने के लिए पहला कदम। पंजीकरण के बाद 13 अंकों की किसान पंजीकरण संख्या मिलती है।',
    eligibilityHi: ['बिहार के निवासी किसान, जिनमें बटाईदार/गैर-रैयत किसान भी शामिल हो सकते हैं (शर्तें पोर्टल पर देखें)'],
    documentsHi: ['आधार (पंजीकरण के लिए – सिर्फ जानकारी देखने के लिए नहीं)', 'आधार से जुड़ा बैंक खाता', 'जमीन से जुड़ी जानकारी / गैर-रैयत के लिए स्व-घोषणा (पोर्टल के अनुसार)'],
    benefitHi: 'सीधा पैसा नहीं – पर बीज, खाद, डीजल, कृषि इनपुट अनुदान आदि योजनाओं में आवेदन के लिए जरूरी।',
    applyHi: ['DBT कृषि पोर्टल पर "पंजीकरण" चुनें', 'या नजदीकी वसुधा केंद्र / CSC / कृषि समन्वयक की मदद लें'],
    officialUrl: DBT,
    deadlineHi: 'सालभर खुला (पोर्टल पर जांचें)',
    statusHi: 'चालू (पोर्टल पर जांचें)',
    helplineHi: KCC_HELP,
    tags: ['input', 'seed', 'disaster', 'machinery'],
    requiresDbtRegistration: false,
    landOwnershipRequired: 'no',
    verification: { status: 'secondary_source', checkedOn: CHECKED, note: '13-अंकीय पंजीकरण संख्या की जानकारी द्वितीयक स्रोतों से; पोर्टल पर पुष्टि आवश्यक।' },
  },
  {
    id: 'pm-kisan',
    level: 'central',
    nameHi: 'प्रधानमंत्री किसान सम्मान निधि (PM-KISAN)',
    nameEn: 'PM-KISAN',
    purposeHi: 'खेती वाली जमीन के मालिक किसान परिवारों को सालाना आय सहायता।',
    eligibilityHi: ['जिनके नाम पर खेती की जमीन दर्ज है', 'आयकरदाता, संवैधानिक पद धारक, कुछ पेंशनभोगी आदि बाहर हैं (पूरी सूची पोर्टल पर)'],
    documentsHi: ['आधार', 'आधार से जुड़ा बैंक खाता', 'जमीन के कागजात', 'e-KYC'],
    benefitHi: '₹6,000 प्रति वर्ष, ₹2,000 की तीन किस्तों में सीधे बैंक खाते में (नियम बदल सकते हैं)।',
    applyHi: ['pmkisan.gov.in पर "New Farmer Registration"', 'या CSC केंद्र', 'e-KYC पूरा करना जरूरी'],
    officialUrl: 'https://pmkisan.gov.in/',
    deadlineHi: 'कोई अंतिम तिथि नहीं (पोर्टल पर जांचें)',
    statusHi: 'चालू',
    helplineHi: 'PM-KISAN हेल्पलाइन: 155261',
    tags: ['income'],
    requiresDbtRegistration: false,
    landOwnershipRequired: 'yes',
    verification: { status: 'secondary_source', checkedOn: CHECKED, note: 'राशि सार्वजनिक रूप से प्रसिद्ध; आधिकारिक पोर्टल पर पुनः पुष्टि आवश्यक।' },
  },
  {
    id: 'kcc',
    level: 'central',
    nameHi: 'किसान क्रेडिट कार्ड (KCC)',
    nameEn: 'Kisan Credit Card',
    purposeHi: 'खेती, पशुपालन और मछली पालन के लिए कम ब्याज पर बैंक से अल्पकालिक कर्ज।',
    eligibilityHi: ['खेती करने वाले किसान – जमीन मालिक, बटाईदार, किरायेदार किसान, स्वयं सहायता/संयुक्त देयता समूह (बैंक नियम अनुसार)'],
    documentsHi: ['पहचान पत्र', 'पते का प्रमाण', 'जमीन/खेती का प्रमाण', 'फोटो', 'बैंक का आवेदन फॉर्म'],
    benefitHi: 'समय पर चुकाने पर ब्याज में छूट (ब्याज अनुदान योजना के तहत) – वर्तमान दर और सीमा अपने बैंक से पूछें।',
    applyHi: ['नजदीकी बैंक शाखा / सहकारी बैंक', 'PM-KISAN लाभार्थी सरल KCC फॉर्म से आवेदन कर सकते हैं'],
    officialUrl: 'https://pmkisan.gov.in/',
    deadlineHi: 'सालभर',
    statusHi: 'चालू',
    helplineHi: KCC_HELP,
    tags: ['credit'],
    requiresDbtRegistration: false,
    landOwnershipRequired: 'varies',
    verification: { status: 'secondary_source', checkedOn: CHECKED, note: 'ब्याज दर/सीमा जानबूझकर नहीं लिखी – बदलती रहती है।' },
  },
  {
    id: 'crop-insurance-bihar',
    level: 'state',
    nameHi: 'फसल बीमा / फसल सहायता (बिहार)',
    nameEn: 'Crop insurance in Bihar – BRFSY / PMFBY',
    purposeHi: 'प्राकृतिक आपदा से फसल नुकसान पर आर्थिक सहायता।',
    eligibilityHi: ['बिहार 2018 से प्रधानमंत्री फसल बीमा योजना (PMFBY) की जगह अपनी "बिहार राज्य फसल सहायता योजना" चला रहा है', 'PMFBY में बिहार की वापसी की खबरें हैं – वर्तमान मौसम में कौन-सी योजना लागू है, सहकारिता विभाग/कृषि समन्वयक से पुष्टि करें'],
    documentsHi: ['किसान पंजीकरण', 'बैंक खाता', 'फसल व रकबा की जानकारी', 'स्व-घोषणा (योजना अनुसार)'],
    benefitHi: 'क्षति के प्रतिशत के अनुसार प्रति हेक्टेयर सहायता – दरें योजना और मौसम पर निर्भर।',
    applyHi: ['सहकारिता विभाग का पोर्टल / PMFBY पोर्टल – जो इस मौसम में लागू हो', 'आवेदन की अंतिम तिथि हर मौसम में अलग'],
    officialUrl: 'https://pmfby.gov.in/',
    deadlineHi: 'हर मौसम में अलग – विभाग की सूचना देखें',
    statusHi: 'अनिश्चित – पुष्टि आवश्यक',
    helplineHi: KCC_HELP,
    tags: ['insurance', 'disaster'],
    requiresDbtRegistration: true,
    landOwnershipRequired: 'varies',
    verification: { status: 'status_uncertain', checkedOn: CHECKED, note: 'बिहार के PMFBY में लौटने की तारीख पर द्वितीयक स्रोत आपस में मेल नहीं खाते।' },
  },
  {
    id: 'krishi-input-anudan',
    level: 'state',
    nameHi: 'कृषि इनपुट अनुदान (बाढ़/सूखा/अतिवृष्टि)',
    nameEn: 'Krishi Input Anudan',
    purposeHi: 'बाढ़, अतिवृष्टि या सूखे से 33% या अधिक फसल क्षति होने पर सीधी आर्थिक सहायता।',
    eligibilityHi: ['सरकार द्वारा अधिसूचित प्रभावित जिला/प्रखंड/पंचायत के किसान', 'DBT पोर्टल पर पंजीकृत किसान', 'प्रायः अधिकतम 2 हेक्टेयर तक'],
    documentsHi: ['13 अंकों की किसान पंजीकरण संख्या', 'आधार से जुड़ा बैंक खाता', 'फसल क्षेत्र की जानकारी'],
    benefitHi: 'प्रति हेक्टेयर तय दर (असिंचित, सिंचित और बारहमासी फसल के लिए अलग) – हर आपदा की अधिसूचना में दर देखें।',
    applyHi: ['आपदा अधिसूचना के बाद DBT कृषि पोर्टल पर आवेदन खुलता है', 'तय तारीख के भीतर ऑनलाइन आवेदन'],
    officialUrl: DBT,
    deadlineHi: 'हर अधिसूचना के साथ अलग',
    statusHi: 'आपदा अधिसूचना पर निर्भर',
    helplineHi: KCC_HELP,
    tags: ['disaster', 'input'],
    requiresDbtRegistration: true,
    landOwnershipRequired: 'varies',
    verification: { status: 'secondary_source', checkedOn: CHECKED, note: 'द्वितीयक स्रोतों में दरें अलग-अलग (पुरानी/नई) – इसलिए राशि नहीं लिखी।' },
  },
  {
    id: 'seed-subsidy',
    level: 'state',
    nameHi: 'बीज अनुदान (बिहार)',
    nameEn: 'Seed subsidy – Bihar',
    purposeHi: 'प्रमाणित/उन्नत बीज अनुदानित दर पर उपलब्ध कराना।',
    eligibilityHi: ['DBT पोर्टल पर पंजीकृत किसान', 'फसल व मौसम के अनुसार'],
    documentsHi: ['किसान पंजीकरण संख्या', 'मोबाइल नंबर'],
    benefitHi: 'फसल और योजना अनुसार अनुदान – मौसम शुरू होने पर ऑनलाइन आवेदन।',
    applyHi: ['मौसम (खरीफ/रबी) से पहले DBT/बीज पोर्टल पर आवेदन', 'चयन के बाद तय विक्रेता से बीज'],
    officialUrl: DBT,
    deadlineHi: 'हर मौसम से पहले – सूचना देखें',
    statusHi: 'मौसमी',
    helplineHi: KCC_HELP,
    tags: ['seed', 'input'],
    requiresDbtRegistration: true,
    landOwnershipRequired: 'no',
    verification: { status: 'secondary_source', checkedOn: CHECKED, note: 'आवेदन पोर्टल का सटीक पता हर मौसम में जांचें।' },
  },
  {
    id: 'farm-mechanisation',
    level: 'state',
    nameHi: 'कृषि यांत्रिकरण योजना (बिहार)',
    nameEn: 'Agricultural Mechanisation Scheme – Bihar',
    purposeHi: 'ट्रैक्टर से चलने वाले यंत्र, जीरो टिलेज मशीन, थ्रेसर आदि पर अनुदान।',
    eligibilityHi: ['DBT पोर्टल पर पंजीकृत किसान', 'यंत्र और वर्ग के अनुसार अनुदान प्रतिशत अलग'],
    documentsHi: ['किसान पंजीकरण संख्या', 'आधार से जुड़ा बैंक खाता', 'जरूरत अनुसार अन्य कागज'],
    benefitHi: 'यंत्र के मूल्य का एक हिस्सा अनुदान – यंत्रवार दर पोर्टल पर।',
    applyHi: ['OFMAS / कृषि यांत्रिकरण पोर्टल पर ऑनलाइन आवेदन', 'लॉटरी/चयन के बाद अनुमोदित विक्रेता से खरीद'],
    officialUrl: 'https://farmech.bihar.gov.in/',
    deadlineHi: 'वित्तीय वर्ष में आवेदन खुलने पर',
    statusHi: 'पोर्टल पर जांचें',
    helplineHi: KCC_HELP,
    tags: ['machinery'],
    requiresDbtRegistration: true,
    landOwnershipRequired: 'no',
    verification: { status: 'secondary_source', checkedOn: CHECKED, note: 'पोर्टल का पता पुष्टि हेतु।' },
  },
  {
    id: 'soil-health-card',
    level: 'central',
    nameHi: 'मृदा स्वास्थ्य कार्ड',
    nameEn: 'Soil Health Card',
    purposeHi: 'निःशुल्क मिट्टी जांच और खेत के अनुसार खाद की सिफारिश।',
    eligibilityHi: ['सभी किसान'],
    documentsHi: ['मिट्टी का नमूना', 'किसान का नाम व मोबाइल नंबर'],
    benefitHi: 'मुफ्त मिट्टी जांच रिपोर्ट – सही खाद, कम खर्च।',
    applyHi: ['प्रखंड कृषि कार्यालय / कृषि समन्वयक से संपर्क', 'कार्ड पोर्टल से डाउनलोड'],
    officialUrl: 'https://soilhealth.dac.gov.in/',
    deadlineHi: 'सालभर',
    statusHi: 'चालू',
    helplineHi: KCC_HELP,
    tags: ['soil'],
    requiresDbtRegistration: false,
    landOwnershipRequired: 'no',
    verification: { status: 'secondary_source', checkedOn: CHECKED, note: '' },
  },
  {
    id: 'horticulture-mission',
    level: 'state',
    nameHi: 'मुख्यमंत्री बागवानी मिशन / उद्यान योजनाएँ',
    nameEn: 'Horticulture schemes – Directorate of Horticulture, Bihar',
    purposeHi: 'फल, सब्जी, मखाना, फूल आदि की खेती, पौध और ढांचे (जैसे शेड नेट) पर अनुदान।',
    eligibilityHi: ['योजना और घटक के अनुसार – पोर्टल पर देखें'],
    documentsHi: ['किसान पंजीकरण संख्या', 'जमीन/खेती का प्रमाण', 'बैंक खाता'],
    benefitHi: 'घटक अनुसार अनुदान।',
    applyHi: ['उद्यान निदेशालय, बिहार के पोर्टल पर ऑनलाइन आवेदन', 'जिला सहायक निदेशक (उद्यान) कार्यालय'],
    officialUrl: 'https://horticulture.bihar.gov.in/',
    deadlineHi: 'घटक अनुसार',
    statusHi: 'पोर्टल पर जांचें',
    helplineHi: KCC_HELP,
    tags: ['horticulture', 'input'],
    requiresDbtRegistration: true,
    landOwnershipRequired: 'varies',
    verification: { status: 'secondary_source', checkedOn: CHECKED, note: 'योजना का नाम और घटक हर साल बदल सकते हैं।' },
  },
  {
    id: 'diesel-anudan',
    level: 'state',
    nameHi: 'डीजल अनुदान (सिंचाई)',
    nameEn: 'Diesel subsidy for irrigation – Bihar',
    purposeHi: 'कम बारिश/सूखे की स्थिति में डीजल पंप से सिंचाई के खर्च में सहायता।',
    eligibilityHi: ['सरकार द्वारा घोषणा होने पर', 'DBT पोर्टल पर पंजीकृत किसान'],
    documentsHi: ['किसान पंजीकरण संख्या', 'डीजल खरीद की रसीद (योजना अनुसार)'],
    benefitHi: 'प्रति लीटर/प्रति सिंचाई तय दर – घोषणा में देखें।',
    applyHi: ['घोषणा के बाद DBT कृषि पोर्टल पर आवेदन'],
    officialUrl: DBT,
    deadlineHi: 'घोषणा अनुसार',
    statusHi: 'घोषणा पर निर्भर',
    helplineHi: KCC_HELP,
    tags: ['irrigation', 'disaster'],
    requiresDbtRegistration: true,
    landOwnershipRequired: 'no',
    verification: { status: 'secondary_source', checkedOn: CHECKED, note: '' },
  },
];

export function findScheme(id: string): Scheme | undefined {
  return SCHEMES.find((s) => s.id === id);
}
