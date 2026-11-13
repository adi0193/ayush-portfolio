import { describe, expect, it } from 'vitest';
import { parse, parseDays, parseLandAcres, parseWater, parseYesNo } from '../src/services/nlu.js';
import { applySafety, mentionsCredentials, stripChemicalDoses } from '../src/services/safety.js';
import { detectDistrictInText } from '../src/data/districts.js';
import { DISTRICTS } from '../src/data/districts.js';

describe('districts', () => {
  it('covers all 38 Bihar districts with unique ids', () => {
    expect(DISTRICTS).toHaveLength(38);
    expect(new Set(DISTRICTS.map((d) => d.id)).size).toBe(38);
  });
  it('detects spoken district / HQ names', () => {
    expect(detectDistrictInText('आज मुजफ्फरपुर में मक्का का भाव')?.id).toBe('muzaffarpur');
    expect(detectDistrictInText('बेतिया के मौसम')?.id).toBe('west-champaran');
    expect(detectDistrictInText('हमारा खेत')).toBeUndefined();
  });
});

describe('nlu', () => {
  it('classifies the spec example utterances', () => {
    expect(parse('हमरा खेत में धान के पत्ता पीयर पड़ रहल बा, का करीं?')).toMatchObject({ intent: 'crop_problem', cropId: 'paddy' });
    expect(parse('आज मुजफ्फरपुर में मक्का का भाव का बा?')).toMatchObject({ intent: 'mandi', cropId: 'maize', districtId: 'muzaffarpur' });
    expect(parse('हम छोट किसान हईं, खाद आ बीज खातिर सरकार से मदद मिल सकेला?').intent).toBe('scheme');
    expect(parse('काल्ह बरखा होई का?').intent).toBe('weather');
  });
  it('extracts slots from follow-up answers', () => {
    expect(parseDays('लगभग 30 दिन के बा')).toBe(30);
    expect(parseDays('३ हफ्ता')).toBe(21);
    expect(parseWater('खेत में पानी बा')).toBe('standing');
    expect(parseWater('खेत सूखल बा')).toBe('dry');
    expect(parseLandAcres('दो बीघा')).toBeCloseTo(1.25);
    expect(parseLandAcres('10 कट्ठा')).toBeCloseTo(0.31, 1);
    expect(parseYesNo('ना, पंजीकरण नइखे')).toBe(false);
    expect(parseYesNo('हाँ बा')).toBe(true);
  });
  it('does not treat the common word आम as mango', () => {
    expect(parse('आम तौर पर खेती कैसे होती है').cropId).toBeUndefined();
  });
});

describe('safety', () => {
  it('removes pesticide doses but keeps unrelated numbers', () => {
    const r = stripChemicalDoses('इमिडाक्लोप्रिड दवा 2 ml प्रति लीटर पानी में मिलाकर छिड़काव करें। धान 30 दिन का है।');
    expect(r.changed).toBe(true);
    expect(r.text).not.toMatch(/2 ml/);
    expect(r.text).toContain('30 दिन');
  });
  it('removes fertiliser doses per acre', () => {
    expect(stripChemicalDoses('यूरिया 50 किलो प्रति एकड़ डालें').text).not.toMatch(/50 किलो/);
  });
  it('softens guarantees', () => {
    expect(applySafety('इस योजना से पैसा जरूर मिलेगा').text).not.toMatch(/जरूर मिलेगा/);
  });
  it('detects credential mentions', () => {
    expect(mentionsCredentials('एक आदमी OTP माँग रहल बा')).toBe(true);
    expect(mentionsCredentials('धान के भाव')).toBe(false);
  });
});
