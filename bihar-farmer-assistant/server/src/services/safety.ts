/**
 * Safety guards applied to EVERY outgoing answer (template or LLM).
 *
 * 1. Chemical dosage guard – strips quantities attached to pesticide/fertiliser terms.
 *    The product never states a dose; it points to label + soil test + KVK.
 * 2. Credential guard – detects when a farmer mentions OTP/PIN/password and replies with
 *    a fraud warning instead of continuing.
 * 3. Guarantee guard – removes phrases that promise yields, profits or scheme benefits.
 */

const CHEM_TERMS =
  /(कीटनाशक|फफूंदनाशक|दवा|दवाई|स्प्रे|छिड़काव|यूरिया|डीएपी|पोटाश|जिंक|सल्फेट|ज़िंक|खाद|herbicide|pesticide|fungicide|insecticide|urea|dap|mop|zinc|sulphate|sulfate|chlorpyrifos|imidacloprid|mancozeb|carbendazim|glyphosate|2,4-d)/i;

// A number (Devanagari or Latin digits) followed by a unit.
const DOSE =
  /([0-9०-९]+(?:[.,][0-9०-९]+)?\s*(?:-|से|to)?\s*[0-9०-९]*(?:[.,][0-9०-९]+)?)\s*(ml|मिली|मि\.ली\.|मिलीलीटर|ली\.?|लीटर|litre|liter|l\b|g\b|gm|ग्राम|kg|किलो|किग्रा|किलोग्राम|ग्रा\.)(\s*(प्रति|\/|per)\s*(एकड़|बीघा|कट्ठा|हेक्टेयर|ha|acre|लीटर|litre|टंकी|पंप))?/gi;

export const DOSE_REPLACEMENT_HI = '[मात्रा: लेबल व KVK सलाह देखें]';

export function stripChemicalDoses(text: string): { text: string; changed: boolean } {
  let changed = false;
  const sentences = text.split(/(?<=[।.!?\n])/);
  const out = sentences.map((s) => {
    if (!CHEM_TERMS.test(s)) return s;
    const replaced = s.replace(DOSE, () => {
      changed = true;
      return DOSE_REPLACEMENT_HI;
    });
    return replaced;
  });
  return { text: out.join(''), changed };
}

const CREDENTIAL = /(otp|ओटीपी|ओ\.टी\.पी|pin\b|पिन|password|पासवर्ड|cvv|एटीएम\s*पिन|atm\s*pin|upi\s*pin)/i;

export function mentionsCredentials(text: string): boolean {
  return CREDENTIAL.test(text);
}

export const CREDENTIAL_WARNING = {
  hi: 'सावधान! कोई भी सरकारी योजना, बैंक या यह ऐप कभी OTP, PIN या पासवर्ड नहीं मांगता। किसी को भी फोन पर या संदेश में OTP/PIN न बताएं। अगर किसी ने पैसे के बदले योजना दिलाने का वादा किया है, तो यह धोखा हो सकता है – साइबर हेल्पलाइन 1930 पर शिकायत करें।',
  bho: 'सावधान! कवनो सरकारी योजना, बैंक भा ई ऐप कबो OTP, PIN भा पासवर्ड ना माँगेला। केहू के फोन पर भा मैसेज में OTP/PIN मत बताईं। अगर केहू पइसा लेके योजना दिलावे के बात करे त ई धोखा हो सकेला – साइबर हेल्पलाइन 1930 पर शिकायत करीं।',
};

const GUARANTEE = /(पक्का|गारंटी|निश्चित रूप से|ज़रूर|जरूर)\s*(मिलेगा|मिली|मिलेला|होगा|होई|फायदा|मुनाफा|लाभ|पैदावार|उपज)/g;

export function softenGuarantees(text: string): string {
  return text.replace(GUARANTEE, 'संभव है – पक्का नहीं');
}

export function applySafety(text: string): { text: string; doseRemoved: boolean } {
  const { text: t1, changed } = stripChemicalDoses(text);
  return { text: softenGuarantees(t1), doseRemoved: changed };
}
